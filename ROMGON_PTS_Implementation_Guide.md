# ROMGON PTS System - Implementation Guide for Agent

**Version:** 1.0  
**Date:** November 3, 2025  
**Purpose:** Complete technical specification for implementing the Points Tournament System on romgon.net

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Backend API Endpoints](#backend-api-endpoints)
4. [PTS Calculation Logic](#pts-calculation-logic)
5. [Frontend Integration](#frontend-integration)
6. [Anti-Abuse Systems](#anti-abuse-systems)
7. [Tournament Qualification Logic](#tournament-qualification-logic)
8. [World Record System](#world-record-system)
9. [Seasonal Reset System](#seasonal-reset-system)
10. [Testing Requirements](#testing-requirements)
11. [Migration Plan](#migration-plan)

---

## System Overview

### Core Concept

The ROMGON PTS (Points Tournament System) is a **dual-track credential system**:

1. **Total PTS (Raw)** - Public-facing number for bragging rights and tier badges
2. **Weighted PTS** - Tournament qualification metric that prioritizes competitive performance

### Key Innovation: Category Weights

Different activity categories have different weights for tournament qualification:

| Category | Weight | Purpose |
|----------|--------|---------|
| 🏆 Competitive | 2.0x | Ranked wins, tournament play |
| 🎮 Gameplay | 1.5x | Games played, moves, time |
| 🎯 Record | 1.5x | World records, speedruns |
| 💬 Social | 1.0x | Logins, friends, chat |
| 🌟 Achievement | 0.8x | Badges, milestones |

### Formula

```javascript
weighted_pts = 
  (competitive_pts * 2.0) +
  (gameplay_pts * 1.5) +
  (record_pts * 1.5) +
  (social_pts * 1.0) +
  (achievement_pts * 0.8)
```

---

## Database Schema

### Table: `users`

```sql
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    tier_level VARCHAR(20) DEFAULT 'Bronze',
    last_login TIMESTAMP,
    login_streak INT DEFAULT 0,
    INDEX idx_username (username),
    INDEX idx_email (email)
);
```

### Table: `pts_accounts`

```sql
CREATE TABLE pts_accounts (
    pts_account_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    season_id INT NOT NULL,
    
    -- Raw PTS by category
    total_pts INT DEFAULT 0,
    competitive_pts INT DEFAULT 0,
    gameplay_pts INT DEFAULT 0,
    record_pts INT DEFAULT 0,
    social_pts INT DEFAULT 0,
    achievement_pts INT DEFAULT 0,
    
    -- Calculated weighted PTS
    weighted_pts INT DEFAULT 0,
    
    -- Legacy (career total across all seasons)
    legacy_pts INT DEFAULT 0,
    
    -- Last update timestamp
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_season (user_id, season_id),
    INDEX idx_weighted_pts (weighted_pts),
    INDEX idx_total_pts (total_pts)
);
```

### Table: `pts_transactions`

```sql
CREATE TABLE pts_transactions (
    transaction_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    season_id INT NOT NULL,
    
    -- Transaction details
    pts_amount INT NOT NULL,
    category ENUM('competitive', 'gameplay', 'record', 'social', 'achievement') NOT NULL,
    reason_code VARCHAR(50) NOT NULL, -- e.g., 'ranked_win', 'daily_login', 'world_record'
    reason_description TEXT,
    
    -- Source tracking
    source_event_id VARCHAR(36), -- ID of game, login, achievement, etc.
    source_event_type VARCHAR(50), -- 'game', 'login', 'achievement', etc.
    
    -- Manual adjustments
    referee_id VARCHAR(36), -- If manually adjusted by referee
    manual_adjustment BOOLEAN DEFAULT FALSE,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_season_id (season_id),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
);
```

### Table: `pts_daily_caps`

```sql
CREATE TABLE pts_daily_caps (
    cap_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    cap_date DATE NOT NULL,
    
    -- Current day's earnings by type
    move_pts INT DEFAULT 0,
    time_pts INT DEFAULT 0,
    chat_pts INT DEFAULT 0,
    host_pts INT DEFAULT 0,
    
    -- Counts
    moves_made INT DEFAULT 0,
    minutes_played INT DEFAULT 0,
    chat_messages INT DEFAULT 0,
    games_hosted INT DEFAULT 0,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, cap_date)
);
```

### Table: `penalties`

```sql
CREATE TABLE penalties (
    penalty_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    referee_id VARCHAR(36) NOT NULL,
    
    -- Penalty details
    penalty_type ENUM('warning', '7day_ban', '30day_ban', '90day_ban', 'permanent_ban') NOT NULL,
    pts_revoked INT DEFAULT 0,
    category_affected VARCHAR(50), -- Which category PTS was revoked from
    
    -- Reason
    violation_type VARCHAR(100) NOT NULL, -- e.g., 'win_trading', 'chat_spam'
    reason TEXT NOT NULL,
    
    -- Status
    status ENUM('active', 'completed', 'appealed', 'overturned') DEFAULT 'active',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    
    -- Appeal
    appeal_text TEXT,
    appeal_decision TEXT,
    appeal_decided_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);
```

### Table: `tournaments`

```sql
CREATE TABLE tournaments (
    tournament_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond', 'world_championship') NOT NULL,
    
    -- Requirements (stored as JSON for flexibility)
    requirements JSON NOT NULL,
    -- Example: {"weighted_pts": 4000, "competitive_pts": 1000, "games_played": 100}
    
    -- Schedule
    registration_start TIMESTAMP NOT NULL,
    registration_end TIMESTAMP NOT NULL,
    tournament_start TIMESTAMP NOT NULL,
    tournament_end TIMESTAMP NULL,
    
    -- Prizes
    prize_pts JSON, -- PTS rewards by placement
    
    -- Status
    status ENUM('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled') DEFAULT 'upcoming',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_tier (tier)
);
```

### Table: `tournament_registrations`

```sql
CREATE TABLE tournament_registrations (
    registration_id VARCHAR(36) PRIMARY KEY,
    tournament_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    
    -- Registration status
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    
    -- Snapshot of PTS at registration (for verification)
    weighted_pts_at_registration INT NOT NULL,
    competitive_pts_at_registration INT NOT NULL,
    total_pts_at_registration INT NOT NULL,
    
    -- Review
    reviewed_by VARCHAR(36), -- Referee user_id
    review_notes TEXT,
    
    -- Timestamps
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_tournament (user_id, tournament_id),
    INDEX idx_status (status)
);
```

### Table: `world_records`

```sql
CREATE TABLE world_records (
    record_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    
    -- Record details
    category VARCHAR(100) NOT NULL, -- e.g., 'fastest_checkmate_classic', 'longest_win_streak'
    record_value DECIMAL(10,2) NOT NULL, -- The actual record (time, count, etc.)
    record_type ENUM('time', 'count', 'score') NOT NULL,
    
    -- Tier
    tier ENUM('major', 'standard', 'minor') NOT NULL,
    pts_reward INT NOT NULL,
    
    -- Verification
    status ENUM('pending', 'verified', 'rejected', 'challenged') DEFAULT 'pending',
    verified_by VARCHAR(36), -- Referee user_id
    verification_notes TEXT,
    
    -- Game data
    game_id VARCHAR(36), -- Link to the game where record was set
    replay_data JSON, -- Store replay/proof data
    
    -- Timestamps
    set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    
    -- Previous record holder (if applicable)
    previous_record_holder VARCHAR(36),
    previous_record_value DECIMAL(10,2),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_user_id (user_id)
);
```

### Table: `seasons`

```sql
CREATE TABLE seasons (
    season_id INT PRIMARY KEY AUTO_INCREMENT,
    season_number INT NOT NULL,
    season_name VARCHAR(100), -- e.g., "Season 1 - 2025 Spring"
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    status ENUM('upcoming', 'active', 'completed') DEFAULT 'upcoming',
    
    -- Reset configuration
    carryover_percentage DECIMAL(3,2) DEFAULT 0.20, -- 20% carryover
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);
```

### Table: `achievements`

```sql
CREATE TABLE achievements (
    achievement_id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'first_win', 'century_club'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Requirements
    requirement_type VARCHAR(50), -- 'games_played', 'win_streak', 'rating_milestone'
    requirement_value INT,
    
    -- Reward
    pts_reward INT NOT NULL,
    category VARCHAR(20) DEFAULT 'achievement',
    
    -- Display
    icon_url VARCHAR(255),
    badge_url VARCHAR(255),
    
    -- Status
    active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `user_achievements`

```sql
CREATE TABLE user_achievements (
    user_achievement_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    achievement_id VARCHAR(36) NOT NULL,
    
    -- Progress
    current_progress INT DEFAULT 0, -- e.g., 67/100 games for century_club
    completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    -- PTS awarded
    pts_awarded INT,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);
```

---

## Backend API Endpoints

### PTS Management Endpoints

#### 1. Get User PTS Summary
```
GET /api/pts/user/:userId
```

**Response:**
```json
{
  "user_id": "uuid",
  "season": {
    "season_id": 2,
    "season_name": "Season 2 - 2025 Fall"
  },
  "total_pts": 8547,
  "weighted_pts": 11822,
  "categories": {
    "competitive": 2100,
    "gameplay": 3200,
    "record": 547,
    "social": 1500,
    "achievement": 1200
  },
  "weighted_breakdown": {
    "competitive": 4200,
    "gameplay": 4800,
    "record": 821,
    "social": 1500,
    "achievement": 960
  },
  "legacy_pts": 45230,
  "tier": "Diamond",
  "global_rank": 47,
  "updated_at": "2025-11-03T12:30:00Z"
}
```

#### 2. Award PTS
```
POST /api/pts/award
```

**Request:**
```json
{
  "user_id": "uuid",
  "pts_amount": 35,
  "category": "competitive",
  "reason_code": "ranked_win",
  "reason_description": "Won ranked match vs. Player123",
  "source_event_id": "game_uuid",
  "source_event_type": "game"
}
```

**Response:**
```json
{
  "success": true,
  "transaction_id": "uuid",
  "new_total_pts": 8582,
  "new_weighted_pts": 11892,
  "tier_changed": false,
  "achievements_unlocked": []
}
```

#### 3. Get PTS Transaction History
```
GET /api/pts/transactions/:userId?limit=50&offset=0&category=all
```

**Response:**
```json
{
  "transactions": [
    {
      "transaction_id": "uuid",
      "pts_amount": 35,
      "category": "competitive",
      "reason_code": "ranked_win",
      "reason_description": "Won ranked match",
      "created_at": "2025-11-03T10:15:00Z"
    }
  ],
  "total_count": 247,
  "has_more": true
}
```

#### 4. Calculate Weighted PTS
```
POST /api/pts/calculate-weighted
```

**Request:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "total_pts": 8547,
  "weighted_pts": 11822,
  "calculation": {
    "competitive": "2100 × 2.0 = 4200",
    "gameplay": "3200 × 1.5 = 4800",
    "record": "547 × 1.5 = 821",
    "social": "1500 × 1.0 = 1500",
    "achievement": "1200 × 0.8 = 960"
  }
}
```

### Tournament Endpoints

#### 5. Check Tournament Eligibility
```
POST /api/tournaments/:tournamentId/check-eligibility
```

**Request:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "eligible": true,
  "requirements": [
    {
      "requirement": "weighted_pts",
      "required": 4000,
      "current": 11822,
      "met": true
    },
    {
      "requirement": "competitive_pts",
      "required": 1000,
      "current": 2100,
      "met": true
    },
    {
      "requirement": "games_played",
      "required": 100,
      "current": 247,
      "met": true
    }
  ],
  "missing_requirements": []
}
```

#### 6. Register for Tournament
```
POST /api/tournaments/:tournamentId/register
```

**Request:**
```json
{
  "user_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "registration_id": "uuid",
  "status": "approved",
  "message": "Successfully registered for Gold Masters tournament"
}
```

#### 7. Get Available Tournaments
```
GET /api/tournaments/available?user_id=uuid
```

**Response:**
```json
{
  "tournaments": [
    {
      "tournament_id": "uuid",
      "name": "Gold Masters - November 2025",
      "tier": "gold",
      "eligible": true,
      "registration_end": "2025-11-15T23:59:59Z",
      "tournament_start": "2025-11-20T18:00:00Z",
      "participants_count": 32,
      "max_participants": 64
    }
  ]
}
```

### World Record Endpoints

#### 8. Submit Record Attempt
```
POST /api/records/submit
```

**Request:**
```json
{
  "user_id": "uuid",
  "category": "fastest_checkmate_classic",
  "record_value": 15.43,
  "record_type": "time",
  "game_id": "uuid",
  "replay_data": { /* game replay data */ }
}
```

**Response:**
```json
{
  "success": true,
  "record_id": "uuid",
  "status": "pending",
  "eligible": true,
  "message": "Record submitted for verification",
  "estimated_review_time": "48 hours"
}
```

#### 9. Get World Records
```
GET /api/records?category=all&status=verified&limit=50
```

#### 10. Verify Record (Referee Only)
```
POST /api/records/:recordId/verify
```

**Request:**
```json
{
  "referee_id": "uuid",
  "approved": true,
  "verification_notes": "Replay verified, no exploits detected"
}
```

### Anti-Abuse Endpoints

#### 11. Check Daily Caps
```
GET /api/pts/daily-caps/:userId
```

**Response:**
```json
{
  "date": "2025-11-03",
  "caps": {
    "move_pts": {
      "current": 45,
      "limit": 100,
      "remaining": 55
    },
    "time_pts": {
      "current": 30,
      "limit": 50,
      "remaining": 20
    },
    "chat_pts": {
      "current": 8,
      "limit": 10,
      "remaining": 2
    },
    "host_pts": {
      "current": 25,
      "limit": 100,
      "remaining": 75
    }
  }
}
```

#### 12. Flag Suspicious Activity
```
POST /api/abuse/flag
```

**Request:**
```json
{
  "reporter_user_id": "uuid",
  "reported_user_id": "uuid",
  "violation_type": "win_trading",
  "evidence": "Both players alternating wins, 20 games in 2 hours",
  "game_ids": ["uuid1", "uuid2", "uuid3"]
}
```

---

## PTS Calculation Logic

### Core Calculation Function (JavaScript/TypeScript)

```javascript
/**
 * Calculate weighted PTS for a user
 * @param {Object} pts - PTS by category
 * @returns {number} Weighted PTS value
 */
function calculateWeightedPts(pts) {
  const weights = {
    competitive: 2.0,
    gameplay: 1.5,
    record: 1.5,
    social: 1.0,
    achievement: 0.8
  };

  const weighted = 
    (pts.competitive * weights.competitive) +
    (pts.gameplay * weights.gameplay) +
    (pts.record * weights.record) +
    (pts.social * weights.social) +
    (pts.achievement * weights.achievement);

  return Math.round(weighted);
}

/**
 * Award PTS to a user with automatic category assignment and cap checking
 * @param {string} userId - User ID
 * @param {number} amount - PTS amount to award
 * @param {string} category - PTS category
 * @param {string} reasonCode - Reason code (e.g., 'ranked_win')
 * @param {Object} eventData - Additional event data
 */
async function awardPts(userId, amount, category, reasonCode, eventData = {}) {
  // 1. Check daily caps (if applicable)
  if (needsCapCheck(reasonCode)) {
    const capData = await checkDailyCap(userId, reasonCode);
    if (capData.exceeded) {
      return {
        success: false,
        reason: 'daily_cap_exceeded',
        message: `Daily cap for ${reasonCode} reached`
      };
    }
    
    // Apply diminishing returns if approaching cap
    amount = applyDiminishingReturns(amount, capData);
  }

  // 2. Create transaction
  const transaction = await db.pts_transactions.create({
    transaction_id: generateUUID(),
    user_id: userId,
    season_id: await getCurrentSeasonId(),
    pts_amount: amount,
    category: category,
    reason_code: reasonCode,
    reason_description: eventData.description || '',
    source_event_id: eventData.eventId || null,
    source_event_type: eventData.eventType || null
  });

  // 3. Update user PTS account
  await db.pts_accounts.increment(userId, {
    total_pts: amount,
    [`${category}_pts`]: amount
  });

  // 4. Recalculate weighted PTS
  const userPts = await db.pts_accounts.findOne(userId);
  const newWeightedPts = calculateWeightedPts({
    competitive: userPts.competitive_pts,
    gameplay: userPts.gameplay_pts,
    record: userPts.record_pts,
    social: userPts.social_pts,
    achievement: userPts.achievement_pts
  });

  await db.pts_accounts.update(userId, {
    weighted_pts: newWeightedPts
  });

  // 5. Check tier progression
  const newTier = calculateTier(userPts.total_pts);
  const tierChanged = newTier !== userPts.tier_level;
  
  if (tierChanged) {
    await db.users.update(userId, { tier_level: newTier });
  }

  // 6. Check achievements
  const unlockedAchievements = await checkAchievements(userId);

  // 7. Update daily cap counter
  if (needsCapCheck(reasonCode)) {
    await updateDailyCapCounter(userId, reasonCode, amount);
  }

  return {
    success: true,
    transaction_id: transaction.transaction_id,
    new_total_pts: userPts.total_pts + amount,
    new_weighted_pts: newWeightedPts,
    tier_changed: tierChanged,
    new_tier: tierChanged ? newTier : null,
    achievements_unlocked: unlockedAchievements
  };
}

/**
 * Calculate user tier based on total PTS
 */
function calculateTier(totalPts) {
  if (totalPts >= 12000) return 'Grandmaster';
  if (totalPts >= 5000) return 'Diamond';
  if (totalPts >= 3000) return 'Platinum';
  if (totalPts >= 1500) return 'Gold';
  if (totalPts >= 500) return 'Silver';
  return 'Bronze';
}

/**
 * Apply diminishing returns to PTS awards
 */
function applyDiminishingReturns(amount, capData) {
  const threshold = capData.limit * 0.5; // Start diminishing at 50% of cap
  
  if (capData.current < threshold) {
    return amount; // Full amount
  }
  
  const progress = (capData.current - threshold) / (capData.limit - threshold);
  const factor = 1.0 / (1 + progress);
  
  return Math.round(amount * factor);
}
```

### Ranked Match PTS Calculation

```javascript
/**
 * Calculate PTS for a ranked match result
 * @param {Object} game - Game result data
 * @param {Object} player - Player data
 * @param {Object} opponent - Opponent data
 * @returns {number} PTS to award
 */
function calculateRankedMatchPts(game, player, opponent) {
  const isWin = game.winner_id === player.user_id;
  const basePts = isWin ? 25 : 5;

  // Rating modifier
  const ratingDiff = opponent.rating - player.rating;
  const ratingModifier = ratingDiff / 100;
  
  let pts = basePts + ratingModifier;

  // Bonus multipliers (for wins only)
  if (isWin) {
    // Perfect game (no pieces lost)
    if (game.player_pieces_lost === 0) {
      pts *= 1.25;
    }
    
    // Comeback win (was behind by 3+ pieces)
    if (game.max_pieces_behind >= 3) {
      pts *= 1.15;
    }
    
    // Under move limit (in timed games)
    if (game.move_limit && game.moves_made < game.move_limit * 0.8) {
      pts *= 1.10;
    }
  }

  // Apply bounds
  pts = Math.max(3, Math.min(60, Math.round(pts)));

  return pts;
}

/**
 * Process game completion and award PTS
 */
async function processGameCompletion(gameId) {
  const game = await db.games.findById(gameId);
  
  // Award PTS to winner
  if (game.winner_id) {
    const winner = await db.users.findById(game.winner_id);
    const loser = await db.users.findById(game.loser_id);
    
    const winnerPts = calculateRankedMatchPts(game, winner, loser);
    await awardPts(
      winner.user_id,
      winnerPts,
      'competitive',
      'ranked_win',
      {
        description: `Won ranked match vs. ${loser.username}`,
        eventId: gameId,
        eventType: 'game'
      }
    );
    
    // Award participation PTS to loser
    const loserPts = calculateRankedMatchPts(game, loser, winner);
    await awardPts(
      loser.user_id,
      loserPts,
      'competitive',
      'ranked_loss',
      {
        description: `Lost ranked match vs. ${winner.username}`,
        eventId: gameId,
        eventType: 'game'
      }
    );
  }
  
  // Award gameplay PTS to both players
  const gameplayPts = 10; // Base for game completion
  await awardPts(game.player1_id, gameplayPts, 'gameplay', 'game_completed');
  await awardPts(game.player2_id, gameplayPts, 'gameplay', 'game_completed');
  
  // Award move PTS (0.1 per move, capped at 100/day)
  const movePts = game.total_moves * 0.1;
  await awardPts(game.player1_id, movePts, 'gameplay', 'moves_made');
  await awardPts(game.player2_id, movePts, 'gameplay', 'moves_made');
}
```

---

## Frontend Integration

### State Management (React Example)

```javascript
// contexts/PTSContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserPTS, subscribeToPTSUpdates } from '../api/pts';

const PTSContext = createContext();

export function PTSProvider({ children, userId }) {
  const [ptsData, setPtsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPTSData();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToPTSUpdates(userId, (updatedData) => {
      setPtsData(updatedData);
    });

    return () => unsubscribe();
  }, [userId]);

  async function loadPTSData() {
    try {
      const data = await fetchUserPTS(userId);
      setPtsData(data);
    } catch (error) {
      console.error('Failed to load PTS data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PTSContext.Provider value={{ ptsData, loading, reload: loadPTSData }}>
      {children}
    </PTSContext.Provider>
  );
}

export function usePTS() {
  const context = useContext(PTSContext);
  if (!context) {
    throw new Error('usePTS must be used within PTSProvider');
  }
  return context;
}
```

### PTS Display Component

```javascript
// components/PTSDisplay.jsx
import React from 'react';
import { usePTS } from '../contexts/PTSContext';

export function PTSDisplay() {
  const { ptsData, loading } = usePTS();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="pts-display">
      <div className="pts-hero">
        <div className="pts-number">{ptsData.total_pts.toLocaleString()}</div>
        <div className="pts-label">TOTAL PTS</div>
        <div className={`tier-badge tier-${ptsData.tier.toLowerCase()}`}>
          {getTierIcon(ptsData.tier)} {ptsData.tier}
        </div>
      </div>

      <div className="weighted-pts">
        <strong>Weighted PTS:</strong> {ptsData.weighted_pts.toLocaleString()}
      </div>

      <div className="pts-breakdown">
        {Object.entries(ptsData.categories).map(([category, pts]) => (
          <PTSCategory
            key={category}
            category={category}
            pts={pts}
            weight={getWeight(category)}
            weightedPts={ptsData.weighted_breakdown[category]}
          />
        ))}
      </div>
    </div>
  );
}

function PTSCategory({ category, pts, weight, weightedPts }) {
  return (
    <div className="pts-category">
      <div className="category-icon">{getCategoryIcon(category)}</div>
      <div className="category-info">
        <div className="category-name">
          {formatCategoryName(category)}
          <span className="category-weight">Weight: {weight}x</span>
        </div>
      </div>
      <div className="category-pts">
        {pts.toLocaleString()}
        <span className="weighted-value">= {weightedPts.toLocaleString()} weighted</span>
      </div>
    </div>
  );
}

function getWeight(category) {
  const weights = {
    competitive: 2.0,
    gameplay: 1.5,
    record: 1.5,
    social: 1.0,
    achievement: 0.8
  };
  return weights[category];
}
```

### Tournament Eligibility Checker

```javascript
// components/TournamentEligibility.jsx
import React, { useEffect, useState } from 'react';
import { checkTournamentEligibility } from '../api/tournaments';

export function TournamentEligibilityChecker({ tournamentId, userId }) {
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEligibility();
  }, [tournamentId, userId]);

  async function checkEligibility() {
    try {
      const result = await checkTournamentEligibility(tournamentId, userId);
      setEligibility(result);
    } catch (error) {
      console.error('Failed to check eligibility:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Checking eligibility...</div>;

  return (
    <div className="tournament-eligibility">
      <div className={`status ${eligibility.eligible ? 'eligible' : 'not-eligible'}`}>
        {eligibility.eligible ? '✓ ELIGIBLE' : '✗ NOT ELIGIBLE'}
      </div>

      <div className="requirements">
        {eligibility.requirements.map((req, index) => (
          <div key={index} className={`requirement ${req.met ? 'met' : 'unmet'}`}>
            <span className="requirement-icon">{req.met ? '✓' : '✗'}</span>
            <span className="requirement-text">{formatRequirement(req)}</span>
            <span className="requirement-progress">
              {req.current} / {req.required}
            </span>
          </div>
        ))}
      </div>

      {eligibility.eligible && (
        <button onClick={handleRegister} className="register-button">
          Register for Tournament
        </button>
      )}

      {!eligibility.eligible && eligibility.missing_requirements.length > 0 && (
        <div className="missing-requirements">
          <p>To qualify, you need:</p>
          <ul>
            {eligibility.missing_requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## Anti-Abuse Systems

### Daily Cap Checking

```javascript
/**
 * Check if user has reached daily cap for a specific action
 */
async function checkDailyCap(userId, reasonCode) {
  const today = new Date().toISOString().split('T')[0];
  
  let capRecord = await db.pts_daily_caps.findOne({
    user_id: userId,
    cap_date: today
  });

  if (!capRecord) {
    capRecord = await db.pts_daily_caps.create({
      cap_id: generateUUID(),
      user_id: userId,
      cap_date: today,
      move_pts: 0,
      time_pts: 0,
      chat_pts: 0,
      host_pts: 0
    });
  }

  const caps = {
    moves_made: { field: 'move_pts', limit: 100 },
    time_played: { field: 'time_pts', limit: 50 },
    chat_message: { field: 'chat_pts', limit: 10 },
    game_hosted: { field: 'host_pts', limit: 100 }
  };

  const capConfig = caps[reasonCode];
  if (!capConfig) {
    return { exceeded: false, current: 0, limit: 0 };
  }

  const current = capRecord[capConfig.field];
  const exceeded = current >= capConfig.limit;

  return {
    exceeded,
    current,
    limit: capConfig.limit,
    remaining: Math.max(0, capConfig.limit - current)
  };
}

/**
 * Update daily cap counter after awarding PTS
 */
async function updateDailyCapCounter(userId, reasonCode, ptsAwarded) {
  const today = new Date().toISOString().split('T')[0];
  
  const fieldMap = {
    moves_made: 'move_pts',
    time_played: 'time_pts',
    chat_message: 'chat_pts',
    game_hosted: 'host_pts'
  };

  const field = fieldMap[reasonCode];
  if (!field) return;

  await db.pts_daily_caps.increment(userId, today, {
    [field]: ptsAwarded
  });
}
```

### Abuse Detection

```javascript
/**
 * Detect potential win trading
 * Checks if two players are repeatedly playing each other with suspicious patterns
 */
async function detectWinTrading(player1Id, player2Id) {
  // Get recent games between these two players
  const recentGames = await db.games.find({
    $or: [
      { player1_id: player1Id, player2_id: player2Id },
      { player1_id: player2Id, player2_id: player1Id }
    ],
    created_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  });

  if (recentGames.length < 10) return { suspicious: false };

  // Check for alternating wins
  let player1Wins = 0;
  let player2Wins = 0;
  let alternatingCount = 0;
  let lastWinner = null;

  for (const game of recentGames) {
    const winner = game.winner_id;
    
    if (winner === player1Id) player1Wins++;
    else if (winner === player2Id) player2Wins++;

    if (lastWinner && winner !== lastWinner) {
      alternatingCount++;
    }
    lastWinner = winner;
  }

  // Suspicious if:
  // 1. 10+ games in 24 hours
  // 2. Nearly 50/50 win rate
  // 3. High alternating pattern
  const winRateDiff = Math.abs(player1Wins - player2Wins);
  const alternatingRatio = alternatingCount / recentGames.length;

  const suspicious = 
    recentGames.length >= 10 &&
    winRateDiff <= 2 &&
    alternatingRatio >= 0.7;

  if (suspicious) {
    await flagSuspiciousActivity({
      user_ids: [player1Id, player2Id],
      violation_type: 'win_trading',
      evidence: {
        games_played: recentGames.length,
        player1_wins: player1Wins,
        player2_wins: player2Wins,
        alternating_ratio: alternatingRatio
      },
      auto_detected: true
    });
  }

  return {
    suspicious,
    games_played: recentGames.length,
    win_distribution: { player1Wins, player2Wins },
    alternating_ratio: alternatingRatio
  };
}

/**
 * Detect move farming
 * Checks for games with abnormally high move counts
 */
async function detectMoveFarming(gameId) {
  const game = await db.games.findById(gameId);
  
  // Get average moves for this variant
  const avgMoves = await db.games.aggregate([
    { $match: { variant: game.variant } },
    { $group: { _id: null, avg: { $avg: '$total_moves' } } }
  ]);

  const average = avgMoves[0]?.avg || 50;
  const threshold = average * 3; // 3x average is suspicious

  if (game.total_moves > threshold) {
    // Check for repetitive patterns
    const moves = game.move_history;
    const repetitiveCount = detectRepetitiveMoves(moves);
    
    if (repetitiveCount > 10) {
      await flagSuspiciousActivity({
        user_ids: [game.player1_id, game.player2_id],
        violation_type: 'move_farming',
        evidence: {
          game_id: gameId,
          total_moves: game.total_moves,
          average_moves: average,
          repetitive_sequences: repetitiveCount
        },
        auto_detected: true
      });

      return { suspicious: true, reason: 'repetitive_moves' };
    }
  }

  return { suspicious: false };
}

/**
 * Detect AFK farming
 */
async function detectAFKFarming(userId, sessionId) {
  const session = await db.play_sessions.findById(sessionId);
  
  // Check input activity
  const inputs = await db.user_inputs.count({
    user_id: userId,
    session_id: sessionId
  });

  const duration = (session.end_time - session.start_time) / 1000 / 60; // minutes
  const inputsPerMinute = inputs / duration;

  // Less than 1 input per 2 minutes is suspicious
  if (duration > 10 && inputsPerMinute < 0.5) {
    await flagSuspiciousActivity({
      user_ids: [userId],
      violation_type: 'afk_farming',
      evidence: {
        session_id: sessionId,
        duration_minutes: duration,
        total_inputs: inputs,
        inputs_per_minute: inputsPerMinute
      },
      auto_detected: true
    });

    return { suspicious: true, reason: 'low_input_activity' };
  }

  return { suspicious: false };
}
```

---

## Tournament Qualification Logic

```javascript
/**
 * Check if user meets tournament requirements
 */
async function checkTournamentRequirements(userId, requirements) {
  const user = await db.users.findById(userId);
  const ptsAccount = await db.pts_accounts.findOne({ user_id: userId });
  const stats = await db.user_stats.findOne({ user_id: userId });

  const checks = [];

  // Weighted PTS requirement
  if (requirements.weighted_pts) {
    checks.push({
      requirement: 'weighted_pts',
      required: requirements.weighted_pts,
      current: ptsAccount.weighted_pts,
      met: ptsAccount.weighted_pts >= requirements.weighted_pts
    });
  }

  // Competitive PTS requirement
  if (requirements.competitive_pts) {
    checks.push({
      requirement: 'competitive_pts',
      required: requirements.competitive_pts,
      current: ptsAccount.competitive_pts,
      met: ptsAccount.competitive_pts >= requirements.competitive_pts
    });
  }

  // Gameplay PTS requirement
  if (requirements.gameplay_pts) {
    checks.push({
      requirement: 'gameplay_pts',
      required: requirements.gameplay_pts,
      current: ptsAccount.gameplay_pts,
      met: ptsAccount.gameplay_pts >= requirements.gameplay_pts
    });
  }

  // Games played requirement
  if (requirements.games_played) {
    checks.push({
      requirement: 'games_played',
      required: requirements.games_played,
      current: stats.games_played,
      met: stats.games_played >= requirements.games_played
    });
  }

  // Account age requirement
  if (requirements.account_age_days) {
    const accountAge = Math.floor(
      (Date.now() - new Date(user.account_created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    checks.push({
      requirement: 'account_age_days',
      required: requirements.account_age_days,
      current: accountAge,
      met: accountAge >= requirements.account_age_days
    });
  }

  // Tier requirement
  if (requirements.min_tier) {
    const tierOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Grandmaster'];
    const userTierIndex = tierOrder.indexOf(user.tier_level);
    const requiredTierIndex = tierOrder.indexOf(requirements.min_tier);
    
    checks.push({
      requirement: 'min_tier',
      required: requirements.min_tier,
      current: user.tier_level,
      met: userTierIndex >= requiredTierIndex
    });
  }

  // World record requirement
  if (requirements.min_records) {
    const recordsHeld = await db.world_records.count({
      user_id: userId,
      status: 'verified'
    });
    
    checks.push({
      requirement: 'min_records',
      required: requirements.min_records,
      current: recordsHeld,
      met: recordsHeld >= requirements.min_records
    });
  }

  // Email verification requirement
  if (requirements.email_verified) {
    checks.push({
      requirement: 'email_verified',
      required: true,
      current: user.email_verified,
      met: user.email_verified === true
    });
  }

  // Clean record requirement
  if (requirements.clean_record) {
    const activePenalties = await db.penalties.count({
      user_id: userId,
      status: 'active'
    });
    
    checks.push({
      requirement: 'clean_record',
      required: 'No active penalties',
      current: activePenalties === 0 ? 'Clean' : `${activePenalties} penalties`,
      met: activePenalties === 0
    });
  }

  const allMet = checks.every(check => check.met);
  const missingRequirements = checks
    .filter(check => !check.met)
    .map(check => `${check.requirement}: Need ${check.required}, have ${check.current}`);

  return {
    eligible: allMet,
    requirements: checks,
    missing_requirements: missingRequirements
  };
}

/**
 * Tournament seeding calculation
 */
function calculateSeedingScore(ptsAccount, stats) {
  const competitiveWeight = 0.60;
  const winRateWeight = 0.25;
  const recentPerformanceWeight = 0.15;

  const seedingScore = 
    (ptsAccount.competitive_pts * competitiveWeight) +
    (stats.win_rate * 1000 * winRateWeight) +
    (stats.recent_win_rate * 1000 * recentPerformanceWeight);

  return Math.round(seedingScore);
}
```

---

## World Record System

```javascript
/**
 * Check if user is eligible to attempt world records
 */
async function checkRecordEligibility(userId) {
  const user = await db.users.findById(userId);
  const ptsAccount = await db.pts_accounts.findOne({ user_id: userId });
  const stats = await db.user_stats.findOne({ user_id: userId });
  const activePenalties = await db.penalties.count({
    user_id: userId,
    status: 'active'
  });

  const accountAge = Math.floor(
    (Date.now() - new Date(user.account_created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const requirements = {
    total_pts: { required: 1500, current: ptsAccount.total_pts },
    competitive_pts: { required: 500, current: ptsAccount.competitive_pts },
    account_age: { required: 30, current: accountAge },
    games_played: { required: 100, current: stats.games_played },
    email_verified: { required: true, current: user.email_verified },
    two_factor: { required: true, current: user.two_factor_enabled },
    clean_record: { required: 0, current: activePenalties }
  };

  const allMet = Object.values(requirements).every(
    req => req.current >= req.required || req.current === true
  );

  return {
    eligible: allMet,
    requirements
  };
}

/**
 * Submit a world record attempt
 */
async function submitWorldRecord(userId, recordData) {
  // Check eligibility
  const eligibility = await checkRecordEligibility(userId);
  if (!eligibility.eligible) {
    return {
      success: false,
      reason: 'not_eligible',
      requirements: eligibility.requirements
    };
  }

  // Check if this beats the current record
  const currentRecord = await db.world_records.findOne({
    category: recordData.category,
    status: 'verified'
  }).sort({ record_value: recordData.record_type === 'time' ? 1 : -1 }).limit(1);

  const isNewRecord = !currentRecord || 
    (recordData.record_type === 'time' 
      ? recordData.record_value < currentRecord.record_value
      : recordData.record_value > currentRecord.record_value);

  if (!isNewRecord) {
    return {
      success: false,
      reason: 'not_better_than_current',
      current_record: currentRecord
    };
  }

  // Create record submission
  const record = await db.world_records.create({
    record_id: generateUUID(),
    user_id: userId,
    category: recordData.category,
    record_value: recordData.record_value,
    record_type: recordData.record_type,
    tier: recordData.tier,
    pts_reward: calculateRecordReward(recordData.tier),
    status: 'pending',
    game_id: recordData.game_id,
    replay_data: recordData.replay_data,
    previous_record_holder: currentRecord?.user_id || null,
    previous_record_value: currentRecord?.record_value || null
  });

  // Notify referees for verification
  await notifyRefereesForVerification(record.record_id);

  return {
    success: true,
    record_id: record.record_id,
    status: 'pending',
    message: 'Record submitted for verification'
  };
}

function calculateRecordReward(tier) {
  const rewards = {
    major: 2000,
    standard: 1000,
    minor: 500
  };
  return rewards[tier] || 500;
}
```

---

## Seasonal Reset System

```javascript
/**
 * Execute season reset (run at end of each season)
 */
async function executeSeasonReset() {
  const currentSeason = await db.seasons.findOne({ status: 'active' });
  const newSeasonId = currentSeason.season_id + 1;

  // 1. Create new season
  const newSeason = await db.seasons.create({
    season_id: newSeasonId,
    season_number: currentSeason.season_number + 1,
    season_name: `Season ${newSeasonId}`,
    start_date: new Date(),
    end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // +6 months
    status: 'active'
  });

  // 2. Mark old season as completed
  await db.seasons.update(currentSeason.season_id, { status: 'completed' });

  // 3. Process all user accounts
  const allUsers = await db.users.find({});

  for (const user of allUsers) {
    const oldPtsAccount = await db.pts_accounts.findOne({
      user_id: user.user_id,
      season_id: currentSeason.season_id
    });

    if (!oldPtsAccount) continue;

    // Calculate starting bonus
    const carryoverBonus = Math.round(oldPtsAccount.total_pts * 0.20); // 20%
    const tierBonus = getTierStartingBonus(user.tier_level);
    const startingPts = Math.max(carryoverBonus, tierBonus);

    // Update legacy PTS
    const legacyPts = oldPtsAccount.legacy_pts + oldPtsAccount.total_pts;

    // Create new season PTS account
    await db.pts_accounts.create({
      pts_account_id: generateUUID(),
      user_id: user.user_id,
      season_id: newSeasonId,
      total_pts: startingPts,
      competitive_pts: 0,
      gameplay_pts: 0,
      record_pts: 0,
      social_pts: 0,
      achievement_pts: 0,
      weighted_pts: 0,
      legacy_pts: legacyPts
    });

    // Check for legacy tier badge upgrades
    await checkLegacyBadges(user.user_id, legacyPts);
  }

  // 4. Archive season leaderboards
  await archiveSeasonLeaderboard(currentSeason.season_id);

  // 5. Reset daily caps
  await db.pts_daily_caps.deleteMany({
    cap_date: { $lt: new Date().toISOString().split('T')[0] }
  });

  console.log(`Season ${newSeasonId} started successfully`);
}

function getTierStartingBonus(tier) {
  const bonuses = {
    Grandmaster: 2500,
    Diamond: 1500,
    Platinum: 1000,
    Gold: 500,
    Silver: 250,
    Bronze: 0
  };
  return bonuses[tier] || 0;
}

async function checkLegacyBadges(userId, legacyPts) {
  const badges = [
    { threshold: 50000, badge: 'Veteran' },
    { threshold: 100000, badge: 'Legend' },
    { threshold: 250000, badge: 'Icon' },
    { threshold: 500000, badge: 'Immortal' }
  ];

  for (const { threshold, badge } of badges) {
    if (legacyPts >= threshold) {
      await awardLegacyBadge(userId, badge);
    }
  }
}
```

---

## Testing Requirements

### Unit Tests

```javascript
// tests/pts-calculation.test.js
describe('PTS Calculation', () => {
  test('calculateWeightedPts returns correct value', () => {
    const pts = {
      competitive: 2100,
      gameplay: 3200,
      record: 547,
      social: 1500,
      achievement: 1200
    };

    const weighted = calculateWeightedPts(pts);
    expect(weighted).toBe(11822);
  });

  test('calculateRankedMatchPts handles win correctly', () => {
    const game = {
      winner_id: 'player1',
      player_pieces_lost: 0, // Perfect game
      max_pieces_behind: 0,
      moves_made: 30,
      move_limit: null
    };

    const player = { user_id: 'player1', rating: 1500 };
    const opponent = { user_id: 'player2', rating: 1600 };

    const pts = calculateRankedMatchPts(game, player, opponent);
    
    // Base 25 + rating diff 1 + perfect game bonus 25% = 32.5
    expect(pts).toBe(33);
  });

  test('daily cap is enforced', async () => {
    const userId = 'test-user';
    
    // Award PTS up to cap
    for (let i = 0; i < 20; i++) {
      await awardPts(userId, 5, 'gameplay', 'moves_made');
    }

    // This should be capped or diminished
    const result = await awardPts(userId, 5, 'gameplay', 'moves_made');
    
    const capData = await checkDailyCap(userId, 'moves_made');
    expect(capData.current).toBeLessThanOrEqual(100);
  });
});
```

### Integration Tests

```javascript
// tests/tournament-registration.test.js
describe('Tournament Registration', () => {
  test('eligible user can register', async () => {
    const userId = await createTestUser({
      pts: {
        weighted: 5000,
        competitive: 1200,
        total: 7000
      },
      stats: {
        games_played: 150
      }
    });

    const tournament = await createTestTournament({
      tier: 'gold',
      requirements: {
        weighted_pts: 4000,
        competitive_pts: 1000,
        games_played: 100
      }
    });

    const result = await registerForTournament(tournament.tournament_id, userId);
    
    expect(result.success).toBe(true);
    expect(result.status).toBe('approved');
  });

  test('ineligible user cannot register', async () => {
    const userId = await createTestUser({
      pts: {
        weighted: 2000, // Too low
        competitive: 500,
        total: 3000
      }
    });

    const tournament = await createTestTournament({
      requirements: {
        weighted_pts: 4000,
        competitive_pts: 1000
      }
    });

    const result = await registerForTournament(tournament.tournament_id, userId);
    
    expect(result.success).toBe(false);
    expect(result.missing_requirements.length).toBeGreaterThan(0);
  });
});
```

---

## Migration Plan

### Phase 1: Database Setup (Week 1)

1. Create all database tables
2. Set up indexes
3. Create initial season (Season 1)
4. Seed achievements table

### Phase 2: Backend Implementation (Weeks 2-3)

1. Implement PTS management APIs
2. Build calculation logic
3. Set up daily cap system
4. Create anti-abuse detection
5. Implement tournament APIs
6. Build world record system

### Phase 3: Frontend Integration (Weeks 4-5)

1. Create PTS display components
2. Build tournament eligibility checker
3. Implement real-time updates
4. Add PTS transaction history
5. Create referee dashboard

### Phase 4: Testing & Tuning (Week 6)

1. Run comprehensive tests
2. Load testing
3. Balance tuning (adjust weights if needed)
4. Security audit
5. Performance optimization

### Phase 5: Soft Launch (Week 7)

1. Deploy to production
2. Monitor for issues
3. Gather user feedback
4. Make adjustments

### Phase 6: Full Launch (Week 8)

1. Public announcement
2. First tournament
3. Ongoing monitoring
4. Regular balance updates

---

## Configuration Variables

```javascript
// config/pts.config.js
module.exports = {
  // Category weights
  weights: {
    competitive: 2.0,
    gameplay: 1.5,
    record: 1.5,
    social: 1.0,
    achievement: 0.8
  },

  // Daily caps
  dailyCaps: {
    move_pts: 100,
    time_pts: 50,
    chat_pts: 10,
    host_pts: 100
  },

  // Tier thresholds (total PTS)
  tiers: {
    bronze: { min: 0, max: 499 },
    silver: { min: 500, max: 1499 },
    gold: { min: 1500, max: 2999 },
    platinum: { min: 3000, max: 4999 },
    diamond: { min: 5000, max: 11999 },
    grandmaster: { min: 12000, max: Infinity }
  },

  // Season configuration
  season: {
    duration_months: 6,
    carryover_percentage: 0.20,
    tier_bonuses: {
      grandmaster: 2500,
      diamond: 1500,
      platinum: 1000,
      gold: 500,
      silver: 250,
      bronze: 0
    }
  },

  // World record eligibility
  recordEligibility: {
    total_pts: 1500,
    competitive_pts: 500,
    account_age_days: 30,
    games_played: 100,
    email_verified: true,
    two_factor_enabled: true
  },

  // Abuse detection thresholds
  abuseDetection: {
    win_trading: {
      min_games: 10,
      time_window_hours: 24,
      max_win_diff: 2,
      min_alternating_ratio: 0.7
    },
    move_farming: {
      multiplier_threshold: 3.0,
      min_repetitive_sequences: 10
    },
    afk_farming: {
      min_duration_minutes: 10,
      max_inputs_per_minute: 0.5
    }
  }
};
```

---

## Next Steps for Implementation

1. **Review this document** with your development team
2. **Set up the database** using the provided schema
3. **Use the professional mockup** (`romgon-pts-professional.html`) as a visual reference
4. **Implement backend APIs** following the endpoint specifications
5. **Integrate frontend** using the provided component examples
6. **Test thoroughly** using the test cases provided
7. **Deploy gradually** following the migration plan

---

## Support & Documentation

- **Technical Questions**: Refer to this document
- **Visual Reference**: Use `romgon-pts-professional.html` mockup
- **Balance Adjustments**: Modify `config/pts.config.js`
- **Referee Guide**: See `ROMGON_PTS_Referee_Guide.docx` for rules

---

**Document Version:** 1.0  
**Last Updated:** November 3, 2025  
**Status:** Ready for Implementation

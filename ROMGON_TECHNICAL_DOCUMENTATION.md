# 🎮 ROMGON.NET - Complete Technical Documentation

> **Live Production Site:** https://romgon.net  
> **API Backend:** https://api.romgon.net  
> **GitHub Repository:** https://github.com/romgon-coder/Romgon  
> **Created by:** Nikolaos Angelosoulis

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Frontend Details](#frontend-details)
- [Backend Details](#backend-details)
- [Hosting & Infrastructure](#hosting--infrastructure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [WebSocket Events](#websocket-events)
- [Game Mechanics](#game-mechanics)
- [Security & Authentication](#security--authentication)
- [Deployment Pipeline](#deployment-pipeline)
- [Performance & Optimization](#performance--optimization)

---

## 🎯 Project Overview

**ROMGON** is a real-time multiplayer hexagon-based strategy game built entirely from scratch with vanilla JavaScript and Node.js. No game engines, no heavy frameworks—just pure web technologies optimized for performance and scalability.

### What Makes ROMGON Special

- **Pure Vanilla Stack**: No React, Vue, or Angular. Just HTML5, CSS3, and JavaScript for maximum performance
- **Real-Time Multiplayer**: Socket.io WebSocket implementation with sub-100ms latency
- **Hexagonal Board System**: Custom hexagon grid engine using axial coordinates
- **Advanced AI**: Multiple difficulty levels with Monte Carlo-inspired evaluation
- **Professional UI/UX**: Dark theme, responsive design, drag-and-drop, click-to-move
- **Game Variants**: Classic, Flip Mode, Fog of War, and custom game creator
- **ELO Rating System**: 7-tier ranking system with persistent statistics
- **Global Chat**: Real-time messaging with profanity filtering and rate limiting
- **Account System**: JWT authentication, Google OAuth, guest support

---

## 🏗️ Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │           index.html (37,197 lines)                 │     │
│  │  - All game logic in vanilla JavaScript            │     │
│  │  - Canvas-based hexagon rendering                  │     │
│  │  - Drag-and-drop + click-to-move                   │     │
│  │  - Real-time UI updates                            │     │
│  │  - Local storage for offline features              │     │
│  └────────────────────────────────────────────────────┘     │
│           │                          │                       │
│           │ HTTPS/REST              │ WSS (Socket.io)       │
│           ▼                          ▼                       │
└───────────────────────────────────────────────────────────┘
            │                          │
            │                          │
┌───────────┴──────────────────────────┴───────────────────┐
│                  BACKEND SERVER                           │
│         (Railway: Node.js + Express + Socket.io)         │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Express.js REST API                              │    │
│  │  - /api/auth (register, login, OAuth)            │    │
│  │  - /api/users (profiles, stats)                  │    │
│  │  - /api/games (game management)                  │    │
│  │  - /api/ratings (leaderboard)                    │    │
│  │  - /api/chat (global chat)                       │    │
│  │  - /api/rooms (multiplayer rooms)                │    │
│  │  - /api/engine-analysis (AI evaluation)          │    │
│  │  - /api/custom-games (game variants)             │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Socket.io WebSocket Namespaces                  │    │
│  │  - /game (game state sync)                       │    │
│  │  - /chat (real-time messaging)                   │    │
│  └──────────────────────────────────────────────────┘    │
│                        │                                   │
│                        ▼                                   │
│  ┌──────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database (Railway)                   │    │
│  │  - users, games, chat_messages                   │    │
│  │  - rating_history, custom_games                  │    │
│  └──────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

### Frontend-Backend Flow

```
User Action → Frontend JS → REST API → Backend Processing → Database
                    ↓                                           ↓
              WebSocket ← Socket.io Server ← Event Emission ←──┘
                    ↓
              UI Update (Real-time)
```

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose | Details |
|------------|---------|---------|
| **HTML5** | Markup | Single-page application (index.html - 37,197 lines) |
| **CSS3** | Styling | Inline styles + responsive design, dark theme |
| **Vanilla JavaScript** | Logic | No frameworks, pure ES6+ JavaScript |
| **Canvas API** | Rendering | Hexagon board, pieces, animations |
| **Socket.io Client** | WebSocket | Real-time multiplayer sync |
| **LocalStorage** | State | JWT tokens, user data, offline features |
| **Web Audio API** | Sound | Click sounds, move sounds, background music |

**Key JavaScript Libraries:**
- `socket.io-client v4.5.4` - WebSocket communication
- **No other external dependencies** - Everything else is custom code

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x / 22.x | Runtime environment |
| **Express.js** | 4.18.2 | REST API framework |
| **Socket.io** | 4.5.4 | WebSocket server |
| **PostgreSQL** | 16.x | Production database (Railway) |
| **SQLite3** | 5.1.6 | Local development database |
| **bcryptjs** | 2.4.3 | Password hashing |
| **jsonwebtoken** | 9.0.0 | JWT authentication |
| **Helmet** | 7.0.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **dotenv** | 16.0.3 | Environment variables |
| **uuid** | 9.0.0 | Unique ID generation |

**Backend Structure:**
```
backend/
├── server.js (331 lines) - Main entry point
├── package.json
├── config/
│   └── database.js - PostgreSQL/SQLite abstraction
├── routes/
│   ├── auth.js - Authentication endpoints
│   ├── users.js - User management
│   ├── games.js - Game creation/management
│   ├── ratings.js - Leaderboard & ELO
│   ├── stats.js - Statistics
│   ├── rooms.js - Multiplayer rooms
│   ├── chat.js - Global chat
│   ├── custom-games.js - Game variants
│   ├── engine-analysis.js - AI evaluation
│   └── api-keys.js - API key management
├── websocket/
│   ├── gameSocket.js - Game events
│   └── chatSocket.js - Chat events
└── utils/
    ├── auth.js - JWT helpers
    └── rating.js - ELO calculations
```

### Infrastructure & Hosting

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **Vercel** | Frontend hosting | Auto-deploy from GitHub main branch |
| **Railway** | Backend hosting | Node.js container, PostgreSQL addon |
| **Cloudflare** | DNS & CDN | romgon.net, api.romgon.net |
| **GitHub** | Version control | CI/CD trigger for deployments |

**Domain Setup:**
- `romgon.net` → Vercel (Frontend)
- `api.romgon.net` → Railway (Backend)
- SSL certificates managed automatically by hosting providers

---

## 🎨 Frontend Details

### File Structure

**Main File:** `deploy/index.html` (37,197 lines)

The frontend is a **monolithic single-page application** with all code in one HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ROMGON - Multiplayer Strategy Game</title>
    <!-- Inline CSS (~2,000 lines) -->
    <style>
        /* Responsive dark theme */
        /* Hexagon board styles */
        /* UI component styles */
    </style>
</head>
<body>
    <!-- All HTML structure (~5,000 lines) -->
    <!-- Modals, menus, game board, chat interface -->
    
    <!-- JavaScript (~30,000 lines) -->
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
    <script>
        // Game engine
        // Board renderer
        // Multiplayer manager
        // UI controllers
        // WebSocket handlers
    </script>
</body>
</html>
```

### Key Frontend Systems

#### 1. **Hexagon Board Engine**

**Coordinate System:** Axial coordinates (q, r)

```javascript
// Hexagon storage structure
const hexagons = {
    "0,0": { q: 0, r: 0, x: 400, y: 300, piece: null },
    "1,0": { q: 1, r: 0, x: 452, y: 330, piece: null },
    // ... 64 total hexagons
};

// Neighbor calculation (6 directions)
const directions = [
    { q: 1, r: 0 },   // East
    { q: 1, r: -1 },  // Northeast
    { q: 0, r: -1 },  // Northwest
    { q: -1, r: 0 },  // West
    { q: -1, r: 1 },  // Southwest
    { q: 0, r: 1 }    // Southeast
];
```

**Rendering:** Canvas API with pixel-perfect hexagon drawing

```javascript
function drawHexagon(ctx, x, y, radius) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + radius * Math.cos(angle);
        const hy = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
```

#### 2. **Interaction System**

**Dual Input Methods:**
- **Drag-and-Drop**: Native HTML5 drag events
- **Click-to-Move**: Custom mousedown/mouseup detection

```javascript
// Click detection (avoiding conflicts with drag)
let mouseDownTime = 0;
let mouseMovedDuringDrag = false;

piece.addEventListener('mousedown', (e) => {
    mouseDownTime = Date.now();
    mouseMovedDuringDrag = false;
});

piece.addEventListener('mousemove', (e) => {
    if (mouseDownTime > 0) mouseMovedDuringDrag = true;
});

piece.addEventListener('mouseup', (e) => {
    const clickDuration = Date.now() - mouseDownTime;
    const wasClick = clickDuration < 200 && !mouseMovedDuringDrag;
    
    if (wasClick) {
        // Handle click-to-select
        selectPiece(piece);
    }
});
```

#### 3. **WebSocket Integration**

**Connection Setup:**

```javascript
const BACKEND_API_URL = 'https://api.romgon.net';

// Game socket
gameSocket = io(BACKEND_API_URL + '/game', {
    auth: { token: jwtToken },
    transports: ['websocket', 'polling']
});

// Chat socket
chatSocket = io(BACKEND_API_URL + '/chat', {
    auth: { token: jwtToken },
    transports: ['websocket', 'polling']
});
```

**Event Handlers:**

```javascript
// Real-time game state updates
gameSocket.on('room:state', (data) => {
    updateBoardState(data.gameState);
    updatePlayerTurn(data.currentTurn);
});

// Move synchronization
gameSocket.on('game:moveUpdate', (data) => {
    animateMove(data.from, data.to);
    updateGameState(data.newState);
});

// Game end
gameSocket.on('game:end', (data) => {
    showWinScreen(data.winner, data.reason);
    updatePlayerStats(data.stats);
});
```

#### 4. **State Management**

**Local Storage Keys:**
- `romgon-user` - Current user object with JWT token
- `romgon-users` - All registered users (for offline mode)
- `romgon-jwt` - JWT token backup
- `romgon-settings` - User preferences (sound, theme, etc.)

**Global State Variables:**

```javascript
// Game state
let gameMode = 'classic'; // classic, flipMode, fogOfWar
let flipModeEnabled = false;
let currentGameState = { /* board state */ };
let playerColor = null; // 'white' or 'black'
let currentTurn = 'white';
let selectedPiece = null;

// Multiplayer state
let gameSocket = null;
let chatSocket = null;
let currentRoomCode = null;
let isMultiplayer = false;

// User state
let currentUser = null;
let isLoggedIn = false;
```

#### 5. **UI Components**

**Modal System:**
- Account Modal (professional gradient design)
- Lobby/Home Modal (purple gradient, stats cards)
- Game Variants Modal (custom game creator)
- Chat Modal (global chat interface)
- Settings Modal (preferences)
- Welcome Modal (What's New)
- Analysis Modal (game analysis)

**Top Navigation Bar:**

```html
<div style="position: fixed; top: 0; width: 100%; height: 45px; 
            background: linear-gradient(135deg, #1a1e26 0%, #2d3139 100%); 
            z-index: 10000;">
    <span>⚙️</span> <!-- Settings -->
    <span>👤</span> <!-- Account -->
    <span>💬</span> <!-- Chat -->
    <span>📖</span> <!-- Game Rules -->
    <a href="game-creator.html">Game Creator</a>
    <div>🆕</div> <!-- What's New -->
</div>
```

---

## ⚙️ Backend Details

### Server Configuration

**Main Entry Point:** `backend/server.js`

```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🎮 ROMGON Backend Server running on port ${PORT}`);
});
```

### Environment Variables

**Required Variables (Railway):**

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/romgon_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://romgon.net,https://www.romgon.net

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Database Abstraction Layer

**Dual Database Support** (PostgreSQL for production, SQLite for development):

```javascript
// config/database.js
const usePostgres = !!process.env.DATABASE_URL;

if (usePostgres) {
    // PostgreSQL connection
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    dbPromise = {
        run: async (sql, params) => {
            // Convert ? to $1, $2, $3...
            sql = convertSqliteToPg(sql);
            const result = await pool.query(sql, params);
            return { id: result.rows[0]?.id, changes: result.rowCount };
        },
        get: async (sql, params) => { /* ... */ },
        all: async (sql, params) => { /* ... */ }
    };
} else {
    // SQLite connection for local dev
    db = new sqlite3.Database('./romgon.db');
    dbPromise = { /* Promise wrappers for SQLite */ };
}
```

### API Route Structure

#### Authentication Routes (`/api/auth`)

```javascript
// POST /api/auth/register
// Register new user
{
    username: string (3-20 chars),
    email: string (valid email),
    password: string (min 6 chars)
}

// POST /api/auth/login
// Login existing user
{
    username: string,
    password: string
}

// POST /api/auth/google
// Google OAuth login
{
    token: string (Google ID token)
}

// GET /api/auth/verify
// Verify JWT token
Headers: { Authorization: "Bearer <token>" }
```

#### User Routes (`/api/users`)

```javascript
// GET /api/users/profile
// Get user profile
Headers: { Authorization: "Bearer <token>" }

// GET /api/users/stats
// Get user statistics
Headers: { Authorization: "Bearer <token>" }

// PUT /api/users/profile
// Update user profile
{
    avatar: string,
    avatar_type: string
}
```

#### Game Routes (`/api/games`)

```javascript
// POST /api/games/create
// Create new game
{
    white_player_id: number,
    black_player_id: number,
    mode: string
}

// POST /api/games/:gameId/move
// Record game move
{
    from: { q: number, r: number },
    to: { q: number, r: number },
    piece: string
}

// GET /api/games/history
// Get player game history
Query: { limit: number, offset: number }

// GET /api/games/all-history
// Get all games (paginated)
Query: { limit: number, offset: number, player: string }
```

#### Rating Routes (`/api/ratings`)

```javascript
// GET /api/ratings/leaderboard
// Get top players by rating
Query: { limit: number }

// GET /api/ratings/tier-distribution
// Get player distribution across tiers
```

#### Room Routes (`/api/rooms`)

```javascript
// POST /api/rooms/create
// Create multiplayer room
{
    isRanked: boolean,
    gameMode: string,
    timeControl: { enabled: boolean, minutes: number }
}

// POST /api/rooms/:roomCode/join
// Join existing room

// GET /api/rooms/active
// Get list of active rooms
```

#### Chat Routes (`/api/chat`)

```javascript
// POST /api/chat/send
// Send global chat message
{
    message: string (max 500 chars)
}

// GET /api/chat/messages
// Get recent chat messages
Query: { limit: number }
```

### WebSocket Events

#### Game Namespace (`/game`)

**Client → Server:**
- `createRoom` - Create multiplayer room
- `joinRoom` - Join room by code
- `makeMove` - Submit game move
- `leaveRoom` - Leave current room
- `sendChallenge` - Challenge another player

**Server → Client:**
- `room:created` - Room successfully created
- `room:joined` - Successfully joined room
- `room:playerJoined` - Another player joined
- `room:playerLeft` - Player left room
- `room:state` - Current game state
- `room:gameStarted` - Game started (includes gameMode, isRanked)
- `game:moveUpdate` - Move made by opponent
- `game:end` - Game ended
- `challenge:received` - Received challenge
- `challenge:accepted` - Challenge accepted

#### Chat Namespace (`/chat`)

**Client → Server:**
- `chat:send` - Send message (rate-limited)
- `chat:history` - Request message history

**Server → Client:**
- `chat:message` - New message received
- `chat:history` - Message history response
- `user:online` - User came online
- `user:offline` - User went offline

---

## 🗄️ Database Schema

### PostgreSQL Tables

#### `users` Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    rating INTEGER DEFAULT 1600,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    total_moves INTEGER DEFAULT 0,
    total_captures INTEGER DEFAULT 0,
    member_level TEXT DEFAULT 'Bronze',
    is_guest INTEGER DEFAULT 0,
    google_id TEXT UNIQUE,
    avatar TEXT DEFAULT '😀',
    avatar_type TEXT DEFAULT 'emoji',
    badge TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rating ON users(rating DESC);
```

#### `games` Table

```sql
CREATE TABLE games (
    id TEXT PRIMARY KEY,
    white_player_id INTEGER REFERENCES users(id),
    black_player_id INTEGER REFERENCES users(id),
    winner_id INTEGER REFERENCES users(id),
    winner_color TEXT,
    reason TEXT,
    moves TEXT, -- JSON array of moves
    status TEXT DEFAULT 'active',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    total_moves INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_games_white_player ON games(white_player_id);
CREATE INDEX idx_games_black_player ON games(black_player_id);
CREATE INDEX idx_games_status ON games(status);
```

#### `chat_messages` Table

```sql
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    username TEXT NOT NULL,
    message TEXT NOT NULL,
    avatar TEXT DEFAULT '😀',
    avatar_type TEXT DEFAULT 'emoji',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_chat_created_at ON chat_messages(created_at DESC);
```

### ELO Rating System

**7-Tier System:**

| Tier | Rating Range | Name |
|------|-------------|------|
| 🥉 Bronze | 0 - 1199 | Bronze |
| 🥈 Silver | 1200 - 1399 | Silver |
| 🥇 Gold | 1400 - 1599 | Gold |
| 💎 Platinum | 1600 - 1799 | Platinum |
| 💠 Diamond | 1800 - 1999 | Diamond |
| 🏆 Master | 2000 - 2199 | Master |
| 👑 Grandmaster | 2200+ | Grandmaster |

**ELO Calculation:**

```javascript
// K-factor: 32 (standard chess)
const K = 32;

function calculateEloChange(playerRating, opponentRating, result) {
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const actualScore = result; // 1.0 for win, 0.5 for draw, 0.0 for loss
    const ratingChange = Math.round(K * (actualScore - expectedScore));
    return ratingChange;
}

// Example:
// Player (1500) beats Opponent (1600)
// Expected: 0.36, Actual: 1.0
// Change: +20 rating points
```

---

## 🔒 Security & Authentication

### JWT Token System

**Token Generation:**

```javascript
const jwt = require('jsonwebtoken');

function generateToken(userId, username) {
    return jwt.sign(
        { 
            userId, 
            username,
            iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
    );
}
```

**Token Verification Middleware:**

```javascript
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
    
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}
```

### Password Security

**bcrypt Hashing:**

```javascript
const bcrypt = require('bcryptjs');

// Register
const saltRounds = 10;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Login
const isValid = await bcrypt.compare(password, user.password_hash);
```

### Security Headers (Helmet.js)

```javascript
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts for single-page app
    crossOriginEmbedderPolicy: false
}));
```

### Rate Limiting

**Chat Rate Limiting:**

```javascript
const userLastMessage = new Map();
const RATE_LIMIT_SECONDS = 2;

function checkRateLimit(userId) {
    const now = Date.now();
    const lastMessageTime = userLastMessage.get(userId) || 0;
    
    if (now - lastMessageTime < RATE_LIMIT_SECONDS * 1000) {
        const retryAfter = Math.ceil((RATE_LIMIT_SECONDS * 1000 - (now - lastMessageTime)) / 1000);
        return { allowed: false, retryAfter };
    }
    
    userLastMessage.set(userId, now);
    return { allowed: true };
}
```

### Input Validation

**express-validator:**

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/auth/register',
    body('username').isLength({ min: 3, max: 20 }).isAlphanumeric(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // ... register logic
    }
);
```

---

## 🚀 Deployment Pipeline

### Automated CI/CD

```
Local Development
     │
     │ git commit -m "feature"
     │ git push origin main
     ▼
GitHub Repository (main branch)
     │
     ├─────────────────────────┬────────────────────────┐
     │                         │                        │
     ▼                         ▼                        ▼
Vercel Deploy          Railway Deploy           GitHub Actions
(Frontend)             (Backend)                (Future: Tests)
     │                         │                        │
     │ Build & Deploy          │ Build & Deploy         │
     ▼                         ▼                        ▼
romgon.net              api.romgon.net           Status Checks
(Live in ~30s)          (Live in ~2min)          (Pass/Fail)
```

### Build Script

**`build.bat` (Windows):**

```batch
@echo off
echo Building ROMGON for Vercel...

REM Copy deploy folder to frontend
xcopy /E /Y deploy\* frontend\

echo Build complete! Push to GitHub to deploy.
```

**Manual Deploy:**

```bash
# 1. Make changes to deploy/index.html
# 2. Run build script
./build.bat  # Windows
# or
./build.sh   # Linux/Mac

# 3. Commit and push
git add .
git commit -m "Update: describe changes"
git push origin main

# Vercel auto-deploys frontend in ~30 seconds
# Railway auto-deploys backend in ~2 minutes
```

### Environment-Specific Configuration

**Frontend (deploy/index.html):**

```javascript
// Auto-detects production vs local
const BACKEND_API_URL = 'https://api.romgon.net';

// For local development, change to:
// const BACKEND_API_URL = 'http://localhost:3000';
```

**Backend (Railway Environment Variables):**

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
NODE_ENV=production
ALLOWED_ORIGINS=https://romgon.net,https://www.romgon.net
PORT=3000
```

---

## 🎮 Game Mechanics

### Core Rules

**Objective:** Capture 3+ opponent pieces

**Board:**
- 8×8 hexagonal grid (64 hexagons)
- Axial coordinate system (q, r)

**Pieces:**
- White: ⚪
- Black: ⚫

**Turn Order:**
1. White places first
2. Black places second
3. Players alternate until game ends

**Capture Rule:**
- A piece surrounded by 3+ opponent pieces on adjacent hexagons is immediately captured
- Captured pieces are removed from the board

**Win Conditions:**
- Capture 3+ opponent pieces → Win
- 100 moves with no captures → Draw

### Game Variants

#### 1. **Classic Mode** (Standard)
- Traditional rules
- No modifications

#### 2. **Flip Mode**
- After placing a piece, player can flip ONE opponent piece to their color
- Adds strategic depth
- One flip per turn

#### 3. **Fog of War**
- Limited vision (3-hex radius)
- Can't see opponent pieces outside vision
- Hidden information strategy

#### 4. **Custom Games**
- Game Creator tool allows custom board layouts
- Custom win conditions
- Experimental variants

### AI Opponent

**Difficulty Levels:**

| Level | Strategy | Depth |
|-------|----------|-------|
| Easy | Random moves | 0 |
| Medium | Basic evaluation | 1-2 moves ahead |
| Hard | Advanced evaluation + capture priority | 2-3 moves ahead |
| Expert | Monte Carlo-inspired evaluation | 3-4 moves ahead |

**AI Evaluation Function:**

```javascript
function evaluatePosition(gameState, color) {
    let score = 0;
    
    // Material advantage
    score += (myPieces.length - opponentPieces.length) * 100;
    
    // Center control
    score += centerHexagons.filter(h => h.piece === color).length * 10;
    
    // Threat detection (pieces at risk of capture)
    score -= threatenedPieces.length * 50;
    
    // Attack opportunities
    score += capturableOpponentPieces.length * 80;
    
    // Mobility (number of legal moves)
    score += legalMoves.length * 5;
    
    return score;
}
```

---

## 📊 Performance & Optimization

### Frontend Optimization

**Single HTML File Benefits:**
- Zero HTTP requests for additional resources
- Instant page load (no JS/CSS file fetching)
- Browser cache advantage
- Reduced latency

**Canvas Rendering:**
- Hardware-accelerated drawing
- 60 FPS board rendering
- Efficient redraw on state changes only

**WebSocket Benefits:**
- Persistent connection (no HTTP overhead)
- Sub-100ms latency for moves
- Real-time game state sync

### Backend Optimization

**Connection Pooling:**

```javascript
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Max 20 concurrent connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});
```

**Database Indexing:**

```sql
-- Critical indexes for fast queries
CREATE INDEX idx_users_rating ON users(rating DESC);
CREATE INDEX idx_games_white_player ON games(white_player_id);
CREATE INDEX idx_games_black_player ON games(black_player_id);
CREATE INDEX idx_chat_created_at ON chat_messages(created_at DESC);
```

**WebSocket Room Management:**

```javascript
// Efficient room-based broadcasting
io.to(`room-${roomCode}`).emit('game:moveUpdate', moveData);

// Avoids sending to all connected clients
```

### Scalability

**Current Capacity:**
- **Frontend:** Vercel serverless (unlimited scale)
- **Backend:** Railway Hobby Plan
  - 512 MB RAM
  - 1 vCPU
  - ~500 concurrent WebSocket connections
  - ~10,000 requests/hour

**Future Scaling Options:**
- Upgrade Railway to Team plan (8 GB RAM, 8 vCPU)
- Horizontal scaling with Redis for session management
- Database read replicas for leaderboard queries
- CDN for static assets (ASSETS/ folder)

---

## 📝 API Response Examples

### Successful Login Response

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 42,
    "username": "player123",
    "email": "player@example.com",
    "rating": 1580,
    "wins": 45,
    "losses": 23,
    "total_games": 68,
    "member_level": "Gold",
    "avatar": "😎",
    "avatar_type": "emoji",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Game State WebSocket Event

```json
{
  "event": "room:state",
  "data": {
    "gameState": {
      "board": {
        "0,0": { "q": 0, "r": 0, "piece": "white" },
        "1,0": { "q": 1, "r": 0, "piece": null },
        "2,0": { "q": 2, "r": 0, "piece": "black" }
      },
      "capturedPieces": {
        "white": 0,
        "black": 1
      },
      "moveCount": 5
    },
    "currentTurn": "white",
    "players": {
      "white": { "id": 42, "username": "player1" },
      "black": { "id": 56, "username": "player2" }
    }
  }
}
```

### Leaderboard Response

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "GrandmasterPro",
      "rating": 2350,
      "wins": 250,
      "losses": 50,
      "total_games": 300,
      "member_level": "Grandmaster",
      "avatar": "👑"
    },
    {
      "rank": 2,
      "username": "ChessKnight",
      "rating": 2180,
      "wins": 180,
      "losses": 70,
      "total_games": 250,
      "member_level": "Master",
      "avatar": "🏆"
    }
  ]
}
```

---

## 🔧 Development Setup

### Prerequisites

- Node.js 18+ or 22+
- npm or yarn
- Git
- PostgreSQL (for production simulation) or SQLite (auto-created)

### Local Setup

#### Backend

```bash
# 1. Clone repository
git clone https://github.com/romgon-coder/Romgon.git
cd Romgon/backend

# 2. Install dependencies
npm install

# 3. Create .env file
echo "JWT_SECRET=your-local-secret" > .env
echo "PORT=3000" >> .env
echo "NODE_ENV=development" >> .env

# 4. Start server (SQLite auto-created)
npm start

# Server runs on http://localhost:3000
```

#### Frontend

```bash
# 1. Navigate to deploy folder
cd ../deploy

# 2. Update API URL in index.html
# Change: const BACKEND_API_URL = 'https://api.romgon.net';
# To:     const BACKEND_API_URL = 'http://localhost:3000';

# 3. Serve with any local server
python -m http.server 8000
# or
npx http-server -p 8000

# Open http://localhost:8000 in browser
```

### Testing Multiplayer Locally

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd deploy && python -m http.server 8000

# Open two browser windows:
# Window 1: http://localhost:8000 (Player 1)
# Window 2: http://localhost:8000 (Player 2)

# Both players create accounts and challenge each other
```

---

## 📈 Project Statistics

**Code Metrics:**
- **Total Lines:** ~40,000+
- **Frontend:** 37,197 lines (deploy/index.html)
- **Backend:** ~3,000 lines (multiple files)
- **Languages:** JavaScript (ES6+), SQL, HTML5, CSS3
- **Frameworks:** Express.js, Socket.io
- **Database:** PostgreSQL (production), SQLite (dev)

**Features:**
- ✅ Real-time multiplayer (WebSocket)
- ✅ AI opponent (4 difficulty levels)
- ✅ ELO rating system (7 tiers)
- ✅ Global chat with moderation
- ✅ Game variants (Classic, Flip Mode, Fog of War)
- ✅ Custom game creator
- ✅ Account system (JWT + Google OAuth)
- ✅ Guest support
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode theme
- ✅ Sound effects & background music
- ✅ Move history & game analysis
- ✅ Leaderboard & statistics
- ✅ Drag-and-drop + click-to-move
- ✅ Auto-save & persistent state

**Performance:**
- ⚡ <100ms WebSocket latency
- ⚡ <1s page load time
- ⚡ 60 FPS canvas rendering
- ⚡ 0 additional HTTP requests (single HTML file)

---

## 🌐 Live URLs

- **Main Site:** https://romgon.net
- **Backend API:** https://api.romgon.net
- **GitHub:** https://github.com/romgon-coder/Romgon
- **Game Creator:** https://romgon.net/game-creator.html

---

## 👨‍💻 Creator

**Nikolaos Angelosoulis**
- GitHub: romgon-coder
- Project: ROMGON - Multiplayer Strategy Game
- Built: 2024-2025

---

## 📄 License

MIT License - Free and open source

---

**This documentation covers the complete technical architecture of ROMGON.net. For more details, see the GitHub repository or explore the live site.**

*Last Updated: November 10, 2025*

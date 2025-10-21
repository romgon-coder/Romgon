# Lobby Backend Requirements Analysis

## Current Lobby Features Requiring Backend

### ✅ Already Implemented (Chat System)
1. **💬 Global Chat** - COMPLETE
   - Backend: `backend/websocket/chatSocket.js`
   - Real-time messaging
   - Message history
   - Online users count

2. **👥 Friends & DM** - COMPLETE
   - Backend: `backend/websocket/chatSocket.js`
   - Friend requests
   - Direct messaging
   - Online/offline status

### ⚠️ Missing Backend Integration

#### 1. **🎮 Active Games Section**
**Current Status**: Placeholder only
**What's Needed**:
- List of user's ongoing games
- Game state (whose turn, move count, time)
- Opponent info (name, avatar, rating)
- Click to resume game
- Real-time updates when opponent moves

**Backend Required**:
```javascript
// GET /api/games/active/:userId
{
    games: [
        {
            gameId: "uuid",
            opponent: { name: "Player2", avatar: "P", rating: 1650 },
            yourColor: "white",
            turn: "your" | "opponent",
            moveCount: 15,
            timeRemaining: "10:00",
            lastMove: "2m ago"
        }
    ]
}

// WebSocket: game:stateUpdate
{
    gameId: "uuid",
    turn: "opponent",
    lastMove: { from: "e2", to: "e4" },
    moveCount: 16
}
```

#### 2. **📊 Your Stats Section**
**Current Status**: Shows localStorage data (wins/losses)
**What's Needed**:
- Real rating from backend (not hardcoded 1420)
- Actual win/loss record
- Win rate calculation
- Total games played
- Sync across devices

**Backend Required**:
```javascript
// GET /api/stats/player/:userId
{
    rating: 1650,
    wins: 24,
    losses: 18,
    winRate: 57.14,
    totalGames: 42,
    rank: "Intermediate",
    tier: "🥈"
}

// Also update on game end
// POST /api/ratings/update (already exists)
```

#### 3. **🧩 Daily Puzzle**
**Current Status**: Alert "coming soon"
**What's Needed**:
- Daily puzzle generation
- Puzzle library
- User progress tracking
- Difficulty levels
- Hints system

**Backend Required**:
```javascript
// GET /api/puzzles/daily
{
    puzzleId: "uuid",
    date: "2025-10-21",
    fen: "position-string",
    difficulty: "medium",
    solution: ["e2e4", "e7e5"],
    theme: "fortress-breaking",
    rating: 1600
}

// POST /api/puzzles/:puzzleId/attempt
{
    moves: ["e2e4"],
    correct: true,
    timeSpent: 45
}

// GET /api/puzzles/stats/:userId
{
    solved: 120,
    streak: 5,
    accuracy: 78.5,
    avgTime: 52
}
```

#### 4. **🏆 Achievements**
**Current Status**: Alert "coming soon"
**What's Needed**:
- Achievement definitions
- Progress tracking
- Unlock notifications
- Display earned badges

**Backend Required**:
```javascript
// GET /api/achievements
{
    achievements: [
        {
            id: "first-win",
            name: "First Victory",
            description: "Win your first game",
            icon: "🏆",
            unlocked: true,
            unlockedAt: "2025-10-15T10:30:00Z"
        },
        {
            id: "fortress-breaker",
            name: "Fortress Breaker",
            description: "Break 10 enemy fortresses",
            icon: "💥",
            progress: 7,
            target: 10,
            unlocked: false
        }
    ]
}

// POST /api/achievements/check (called after game events)
{
    newAchievements: ["first-win"]
}
```

#### 5. **📜 Match History**
**Current Status**: Placeholder "No games played yet"
**What's Needed**:
- List of completed games
- Game results (win/loss/draw)
- Opponent info
- Date/time played
- Click to review game
- Filter by date range

**Backend Required**:
```javascript
// GET /api/games/history/:userId?limit=10&offset=0
{
    games: [
        {
            gameId: "uuid",
            date: "2025-10-21T15:30:00Z",
            opponent: { name: "Player2", rating: 1650 },
            yourColor: "white",
            result: "win" | "loss" | "draw",
            reason: "checkmate",
            moves: 45,
            ratingChange: +15,
            duration: "15:30"
        }
    ],
    total: 42,
    hasMore: true
}

// GET /api/games/:gameId/replay (for game review)
{
    moves: [...],
    fen: [...],
    timestamps: [...]
}
```

#### 6. **📖 Learn / Opening Book**
**Current Status**: Has showOpeningBook() function
**What's Needed**:
- Opening library storage
- User's repertoire
- Study progress tracking
- Spaced repetition

**Backend Required**:
```javascript
// GET /api/openings
{
    openings: [
        {
            id: "hex-gambit",
            name: "Hex Gambit",
            moves: ["e2", "e4", ...],
            description: "Aggressive opening",
            popularity: 65,
            winRate: 58
        }
    ]
}

// GET /api/openings/user/:userId
{
    studied: ["hex-gambit", "fortress-defense"],
    mastery: {
        "hex-gambit": 75,
        "fortress-defense": 45
    }
}

// POST /api/openings/practice
{
    openingId: "hex-gambit",
    correct: true
}
```

#### 7. **🎮 Spectate Mode**
**Current Status**: Alert "coming soon"
**What's Needed**:
- Live games list
- Spectator rooms
- Real-time move updates
- Player ratings visible
- Chat for spectators

**Backend Required**:
```javascript
// GET /api/games/live
{
    games: [
        {
            gameId: "uuid",
            whitePlayer: { name: "GrandMaster", rating: 2400 },
            blackPlayer: { name: "Pro", rating: 2350 },
            spectators: 15,
            moveCount: 25,
            startedAt: "2025-10-21T15:00:00Z"
        }
    ]
}

// WebSocket: spectate:join
socket.emit('spectate:join', { gameId: "uuid" })

// WebSocket: spectate:move (real-time updates)
socket.on('spectate:move', { move: {...}, position: {...} })
```

#### 8. **🌐 Online Matchmaking**
**Current Status**: Alert "coming soon"
**What's Needed**:
- Matchmaking queue
- Rating-based pairing
- Time control selection
- Accept/decline matches
- Timeout handling

**Backend Required**:
```javascript
// POST /api/matchmaking/queue
{
    timeControl: "10+0",
    ratingRange: 100
}

// WebSocket: matchmaking:found
{
    opponent: { name: "Player2", rating: 1650 },
    gameId: "uuid",
    yourColor: "white",
    timeControl: "10+0"
}

// POST /api/matchmaking/accept
{
    matchId: "uuid",
    accept: true
}

// DELETE /api/matchmaking/queue (leave queue)
```

#### 9. **🔔 Notifications**
**Current Status**: Button in header, alert "coming soon"
**What's Needed**:
- Friend requests
- Game invites
- Your turn reminders
- Achievement unlocks
- System announcements

**Backend Required**:
```javascript
// GET /api/notifications/:userId
{
    notifications: [
        {
            id: "uuid",
            type: "friend_request",
            from: { name: "Player2", avatar: "P" },
            message: "sent you a friend request",
            timestamp: "2025-10-21T15:30:00Z",
            read: false,
            actionUrl: "/friends"
        },
        {
            id: "uuid",
            type: "your_turn",
            gameId: "game-uuid",
            message: "It's your turn vs Player3",
            timestamp: "2025-10-21T14:00:00Z",
            read: false,
            actionUrl: "/game/game-uuid"
        }
    ],
    unreadCount: 2
}

// PUT /api/notifications/:notificationId/read
// DELETE /api/notifications/:notificationId

// WebSocket: notification:new
{
    notification: {...}
}
```

#### 10. **⚙️ Settings / Preferences**
**Current Status**: Button in header, calls showSettingsModal()
**What's Needed**:
- Save preferences to backend
- Sync across devices
- Audio settings
- Display settings
- Theme preferences
- Notification preferences

**Backend Required**:
```javascript
// GET /api/users/settings/:userId
{
    audio: {
        enabled: true,
        volume: 0.7,
        soundEffects: true,
        music: false
    },
    display: {
        theme: "dark",
        boardStyle: "wood",
        animations: true,
        showCoordinates: true
    },
    notifications: {
        email: true,
        push: false,
        friendRequests: true,
        gameInvites: true,
        yourTurn: true
    },
    privacy: {
        onlineStatus: "friends",
        profileVisibility: "public"
    }
}

// PUT /api/users/settings/:userId
{
    audio: { volume: 0.8 }
}
```

## Summary: What Needs Backend

| Feature | Priority | Complexity | Backend Exists? |
|---------|----------|------------|-----------------|
| **Chat** | ✅ Done | High | ✅ Yes |
| **Friends/DM** | ✅ Done | High | ✅ Yes |
| **Active Games** | 🔴 Critical | Medium | ⚠️ Partial |
| **User Stats** | 🔴 Critical | Low | ✅ Yes |
| **Match History** | 🟡 High | Medium | ⚠️ Partial |
| **Online Matchmaking** | 🟡 High | High | ❌ No |
| **Notifications** | 🟡 High | Medium | ❌ No |
| **Settings Sync** | 🟢 Medium | Low | ❌ No |
| **Daily Puzzle** | 🟢 Medium | Medium | ❌ No |
| **Achievements** | 🟢 Medium | Medium | ❌ No |
| **Spectate Mode** | 🟢 Low | High | ❌ No |
| **Opening Book** | 🟢 Low | Low | ❌ No |

## Backend Files Status

### ✅ Already Exist (from README)
- `server.js` - Main server
- `config/database.js` - SQLite setup
- `utils/auth.js` - JWT/bcrypt
- `utils/rating.js` - ELO system
- `routes/auth.js` - Login/register
- `routes/users.js` - User profiles
- `routes/games.js` - Game management ⚠️ **Needs extension**
- `routes/ratings.js` - Rating system
- `routes/stats.js` - Statistics ⚠️ **Needs extension**
- `websocket/gameSocket.js` - Game WebSocket
- `websocket/chatSocket.js` - Chat WebSocket ✅

### ❌ Need to Create
- `routes/puzzles.js` - Daily puzzles
- `routes/achievements.js` - Achievement system
- `routes/notifications.js` - Notification management
- `routes/matchmaking.js` - Online matchmaking
- `routes/openings.js` - Opening book
- `websocket/spectateSocket.js` - Spectator mode
- `websocket/matchmakingSocket.js` - Matchmaking queue

## Recommended Implementation Order

### Phase 1: Critical Features (Week 1)
1. **Active Games Integration**
   - Extend `routes/games.js` with `GET /api/games/active/:userId`
   - WebSocket updates in `gameSocket.js`
   - Frontend: Populate active games list

2. **User Stats Sync**
   - Connect stats section to `GET /api/stats/player/:userId`
   - Real-time rating updates
   - Remove hardcoded values

3. **Match History**
   - Extend `routes/games.js` with history endpoint
   - Frontend: Render match history list
   - Click to review game

### Phase 2: High Priority (Week 2)
4. **Notifications System**
   - Create `routes/notifications.js`
   - WebSocket: `notification:new` event
   - Frontend: Notification dropdown
   - Badge counter in header

5. **Online Matchmaking**
   - Create `routes/matchmaking.js`
   - Create `websocket/matchmakingSocket.js`
   - Queue management (rating-based)
   - Accept/decline system

6. **Settings Sync**
   - Add settings endpoints to `routes/users.js`
   - Save preferences to database
   - Load on login

### Phase 3: Medium Priority (Week 3)
7. **Daily Puzzles**
   - Create `routes/puzzles.js`
   - Puzzle database/generator
   - Progress tracking
   - Hints system

8. **Achievements**
   - Create `routes/achievements.js`
   - Achievement definitions
   - Progress tracking
   - Unlock system

### Phase 4: Nice-to-Have (Week 4)
9. **Spectate Mode**
   - Create `websocket/spectateSocket.js`
   - Live games list
   - Real-time move broadcasts
   - Spectator chat

10. **Opening Book**
    - Create `routes/openings.js`
    - Opening library
    - Study progress
    - Repertoire builder

## Immediate Next Steps

1. **Start with Active Games** - Most visible impact
2. **Connect User Stats** - Quick win, already have API
3. **Build Match History** - Reuse existing game data
4. **Add Notifications** - Essential for user engagement

## Backend vs Frontend Priority

**Backend First** (can't work without it):
- Active Games
- Match History
- Online Matchmaking
- Notifications
- Daily Puzzles
- Achievements

**Frontend First** (can mock/placeholder):
- Settings modal UI
- Opening book display
- Spectate mode UI
- Achievement display

## Conclusion

**Yes, we need significant backend work!** 

The lobby UI is beautiful and feature-rich, but most features are placeholders. We have:
- ✅ **2/12 features** fully implemented (Chat, Friends)
- ⚠️ **2/12 features** partially implemented (Stats, Games)
- ❌ **8/12 features** need full backend implementation

**Recommendation**: Start with Phase 1 (Active Games, Stats, History) to make the lobby functional, then move to Phase 2 (Notifications, Matchmaking) for competitive play.

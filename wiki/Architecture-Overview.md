# Architecture Overview

System design and technology stack for ROMGON.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Database Design](#database-design)
- [Deployment Architecture](#deployment-architecture)
- [Security](#security)

## 🏗️ System Overview

ROMGON is a **3-tier web application** with real-time multiplayer capabilities:

```
┌─────────────────┐
│   Frontend      │  Vercel (Static Hosting)
│  (Vanilla JS)   │  - HTML5 Canvas rendering
│                 │  - Client-side game logic
└────────┬────────┘  - Socket.io client
         │
         ├── REST API
         ├── WebSocket
         │
┌────────┴────────┐
│   Backend       │  Railway (Node.js Server)
│  (Node.js +     │  - Express REST API
│   Socket.io)    │  - Socket.io server
│                 │  - Game engine
└────────┬────────┘  - AI engine
         │
         │
┌────────┴────────┐
│   Database      │  Railway (PostgreSQL)
│  (PostgreSQL)   │  or SQLite (dev)
└─────────────────┘
```

## 🛠️ Technology Stack

### Frontend

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Language** | Vanilla JavaScript | Lightweight, no build step |
| **Rendering** | HTML5 Canvas | Hexagonal board drawing |
| **Styling** | CSS3 + Variables | Theming support |
| **Real-time** | Socket.io Client | Live multiplayer |
| **Hosting** | Vercel | CDN, auto-deploy |

**Why Vanilla JS?**
- ✅ Fast load times (~50ms)
- ✅ No build step needed
- ✅ Works offline (client-side AI fallback)
- ✅ Easy to debug
- ❌ Harder to maintain (monolithic HTML)

### Backend

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | Node.js 22.x | Server-side JavaScript |
| **Framework** | Express.js | REST API |
| **Real-time** | Socket.io | WebSocket server |
| **Database** | PostgreSQL / SQLite | Data persistence |
| **Auth** | JWT + bcrypt | Secure authentication |
| **Security** | Helmet + CORS | Security headers |
| **Hosting** | Railway | Auto-deploy, scaling |

**Why Node.js?**
- ✅ JavaScript full-stack (shared code)
- ✅ Excellent WebSocket support
- ✅ Fast I/O for real-time games
- ✅ Large ecosystem (npm)

### Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| **Frontend CDN** | Vercel | Static hosting, global CDN |
| **Backend Server** | Railway | Node.js hosting, auto-scaling |
| **Database** | Railway PostgreSQL | Managed database |
| **DNS** | Cloudflare | DNS, DDoS protection |
| **Version Control** | GitHub | Code repository |

## 🎯 Component Architecture

### Frontend Components

```
Frontend Architecture
├── index.html (20,223 lines)
│   ├── Game UI
│   │   ├── Board Canvas Renderer
│   │   ├── Piece Event Handlers
│   │   ├── Movement Highlighting
│   │   └── Action Panel (Rotate/Flip/Push)
│   │
│   ├── Game Logic (Client-side)
│   │   ├── Move Generation (getPossibleMoves)
│   │   ├── Move Validation (isValidMove)
│   │   ├── AI Fallback (makeAIMoveClientSide)
│   │   └── Flip Mode Logic
│   │
│   ├── Multiplayer Manager
│   │   ├── Socket.io Client
│   │   ├── Room Management
│   │   ├── Challenge System
│   │   └── Live Game Sync
│   │
│   ├── UI Manager
│   │   ├── Modal System
│   │   ├── Notifications
│   │   ├── Lobby Display
│   │   └── Leaderboard
│   │
│   └── API Client
│       ├── REST Wrapper
│       ├── Authentication
│       └── Game Submission
│
└── keyboard-navigation.js
    ├── WASD Navigation
    ├── Piece Selection
    └── Keyboard Shortcuts
```

### Backend Components

```
Backend Architecture
├── server.js (Entry Point)
│   ├── Express App Setup
│   ├── Socket.io Server
│   ├── Middleware Registration
│   └── Route Registration
│
├── routes/
│   ├── auth.js           - Registration, Login, JWT
│   ├── games.js          - Game CRUD, Move submission
│   ├── users.js          - Profile, Stats
│   ├── ratings.js        - ELO, Leaderboard
│   ├── ai-moves.js       - AI Move API
│   ├── engine-analysis.js - Engine health, metrics
│   ├── rooms.js          - Multiplayer rooms
│   ├── chat.js           - Chat messages
│   ├── custom-games.js   - Game variants
│   ├── ai-training.js    - RL training
│   ├── stats.js          - Statistics
│   └── notifications.js  - User notifications
│
├── engine/
│   ├── romgon-real-engine.js  - Core game engine
│   │   ├── Move Generation
│   │   ├── Position Evaluation
│   │   ├── Flip Mode Logic
│   │   └── Legal Move Filtering
│   │
│   ├── romgon-patterns.js     - Movement patterns
│   │   ├── Square L-shaped
│   │   ├── Triangle Directional
│   │   ├── Rhombus Adjacent
│   │   ├── Circle Zone-based
│   │   └── Hexagon Flexible
│   │
│   └── romgon-engine.js       - Simplified (deprecated)
│
├── ai/
│   └── reinforcement-learning.js
│       ├── Q-Learning
│       ├── Position Hashing
│       ├── Exploration vs Exploitation
│       └── Game Learning
│
├── websocket/
│   ├── gameSocket.js    - Game events
│   └── chatSocket.js    - Chat events
│
├── config/
│   └── database.js      - DB connection, migrations
│
└── utils/
    └── auth.js          - JWT helpers, validation
```

## 🔄 Data Flow

### Game Move Flow

```
1. User clicks piece
   ↓
2. Frontend: getPossibleMoves()
   ↓
3. Highlights shown on canvas
   ↓
4. User clicks destination
   ↓
5. Frontend: isValidMove()
   ↓
6. WebSocket: emit('make_move')
   ↓
7. Backend: Validate move
   ↓
8. Backend: Update game state
   ↓
9. Backend: Broadcast to room
   ↓
10. Frontend: Update canvas
    ↓
11. Check win condition
    ↓
12. If game over: Submit result to API
```

### AI Move Flow

```
1. User's turn ends
   ↓
2. Frontend: makeAIMoveBackend()
   ↓
3. buildBoardStateFromDOM()
   - Extract all pieces from canvas
   - Include flip states
   ↓
4. POST /api/ai/move
   {
     board: { "3-4": {...}, ... },
     playerColor: "white",
     flipModeEnabled: true
   }
   ↓
5. Backend: generateAllMoves()
   - For each piece, get legal moves
   - Apply flip mode rules
   ↓
6. Backend: evaluatePosition()
   - Material, mobility, threats
   - Flip mode bonuses
   - Center control
   ↓
7. Backend: findBestMove()
   - Sort by evaluation
   - Return top candidate
   ↓
8. Response: { move: {...}, evaluation: 1250 }
   ↓
9. Frontend: executeMove()
   - Update canvas
   - Emit WebSocket event
```

### Authentication Flow

```
1. User submits login form
   ↓
2. POST /api/auth/login
   ↓
3. Backend: Hash password check (bcrypt)
   ↓
4. Backend: Generate JWT token
   ↓
5. Response: { token, user }
   ↓
6. Frontend: Store token in localStorage
   ↓
7. Future requests: Include token in headers
   Authorization: Bearer <token>
   ↓
8. Backend: Verify token middleware
   ↓
9. Extract user from token
   ↓
10. Proceed with request
```

## 🗄️ Database Design

### Schema Overview

```sql
-- Core Tables
users
  ├── games (white_player_id, black_player_id)
  ├── rating_changes (user_id)
  ├── friends (user_id, friend_id)
  ├── messages (sender_id, recipient_id)
  └── achievements (user_id)

games
  ├── rating_changes (game_id)
  ├── custom_games (game_id)
  └── rooms (game_id)
```

### Key Tables

**users**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- bcrypt hashed
  rating INTEGER DEFAULT 1200,
  tier TEXT DEFAULT 'beginner',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**games**
```sql
CREATE TABLE games (
  id INTEGER PRIMARY KEY,
  white_player_id INTEGER,
  black_player_id INTEGER,
  winner TEXT,  -- 'white', 'black', 'draw'
  status TEXT DEFAULT 'active',
  move_history TEXT,  -- JSON string
  move_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (white_player_id) REFERENCES users(id),
  FOREIGN KEY (black_player_id) REFERENCES users(id)
);
```

**rating_changes**
```sql
CREATE TABLE rating_changes (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  game_id INTEGER,
  old_rating INTEGER,
  new_rating INTEGER,
  change INTEGER,
  opponent_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (game_id) REFERENCES games(id)
);
```

### Indexes

```sql
-- Performance optimization
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_players ON games(white_player_id, black_player_id);
CREATE INDEX idx_rating_changes_user ON rating_changes(user_id);
CREATE INDEX idx_users_rating ON users(rating DESC);
```

## 🚀 Deployment Architecture

### Production Environment

```
┌──────────────────────────────────────┐
│         Cloudflare DNS               │
│      (romgon.net, DDoS protection)   │
└──────────┬────────────┬──────────────┘
           │            │
           │            │
   ┌───────┴────┐  ┌────┴────────┐
   │   Vercel   │  │   Railway   │
   │  Frontend  │  │   Backend   │
   └────────────┘  └──────┬──────┘
                          │
                   ┌──────┴──────┐
                   │ Railway PG  │
                   │  Database   │
                   └─────────────┘
```

### Deployment Pipeline

**Frontend (Vercel):**
```
1. Push to main branch
   ↓
2. Vercel detects commit
   ↓
3. Build: node build-frontend.js
   ↓
4. Deploy: /public/ → CDN
   ↓
5. DNS update (if needed)
   ↓
6. Live at romgon.net
```

**Backend (Railway):**
```
1. Push to main branch
   ↓
2. Railway detects commit
   ↓
3. Install: npm install (in /backend/)
   ↓
4. Start: node server.js
   ↓
5. Health check
   ↓
6. Switch traffic to new instance
   ↓
7. Live at romgon-backend.railway.app
```

### Environment Variables

**Vercel:**
```
(None - static frontend)
```

**Railway:**
```
NODE_ENV=production
PORT=3000  (auto-set by Railway)
JWT_SECRET=<strong-random-secret>
DATABASE_URL=postgresql://...
FRONTEND_URL=https://romgon.net
ALLOWED_ORIGINS=https://romgon.net
```

## 🔒 Security

### Authentication

**Password Security:**
```javascript
// bcrypt with 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

**JWT Tokens:**
```javascript
// 7-day expiration
const token = jwt.sign({ userId, email }, JWT_SECRET, {
  expiresIn: '7d'
});

// Verification
const decoded = jwt.verify(token, JWT_SECRET);
```

### Middleware Stack

```javascript
app.use(helmet());  // Security headers
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(authMiddleware);  // JWT verification
```

### Input Validation

```javascript
// Express-validator
body('email').isEmail().normalizeEmail(),
body('password').isLength({ min: 8 }),
body('username').isAlphanumeric().isLength({ min: 3, max: 20 })
```

### CORS Configuration

```javascript
const allowedOrigins = [
  'https://romgon.net',
  'http://localhost:5173'  // Dev only
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

### WebSocket Security

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});
```

## 📊 Performance Considerations

### Frontend Optimization

- **Canvas Rendering:** ~60 FPS
- **Lazy Loading:** Only render visible hexes
- **Event Delegation:** Single listener per board
- **Debouncing:** Mouse/touch event throttling

### Backend Optimization

- **Connection Pooling:** PostgreSQL connections
- **Caching:** In-memory game state cache
- **Compression:** Gzip response compression
- **Rate Limiting:** 60 req/min per endpoint

### Database Optimization

- **Indexes:** On frequently queried columns
- **Connection Pool:** Max 10 connections
- **Query Optimization:** Avoid N+1 queries
- **Pagination:** Limit result sets

## 🔧 Monitoring & Logging

### Health Checks

```javascript
GET /api/engine/health
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "memory": "ok",
    "uptime": "1d 5h 32m"
  }
}
```

### Error Logging

```javascript
// Console logging (development)
console.error('Error:', error.message);

// Structured logging (production)
logger.error({
  message: error.message,
  stack: error.stack,
  userId: req.userId,
  endpoint: req.path
});
```

## 📈 Scalability

### Current Limits

- **Users:** ~1000 concurrent
- **Games:** ~500 simultaneous
- **Database:** 10GB storage
- **Bandwidth:** Unlimited (Vercel/Railway)

### Scaling Strategy

**Horizontal:**
- Railway auto-scales backend instances
- Vercel CDN auto-scales globally

**Vertical:**
- Increase Railway instance size
- Upgrade PostgreSQL plan

**Future:**
- Redis for session storage
- Message queue for game events
- Microservices for AI engine

## 🔗 Related Pages

- [Development Setup](Development-Setup) - Local development
- [API Documentation](API-Documentation) - API reference
- [AI Implementation](AI-Implementation) - AI engine details
- [Database Schema](Database-Schema) - Data models

---

**Architecture Version:** 1.0.0
**Last Updated:** 2025-01-18
**System Status:** Production-ready

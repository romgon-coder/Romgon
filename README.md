# 🎮 ROMGON - Multiplayer Strategy Game

> A real-time multiplayer hexagon-based strategy game built with modern web technologies.

**Live at:** https://romgon.net

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

**ROMGON** is a turn-based multiplayer strategy game played on a hexagonal board. Players compete by placing pieces and capturing opponent pieces through strategic positioning. The game features real-time multiplayer using WebSocket, ELO rating system, and persistent player statistics.

### Core Mechanics

- **Hexagon Board**: 8×8 hexagonal grid using axial coordinates
- **Turn-Based**: White moves first, then alternates
- **Piece Capture**: Pieces surrounded by 3+ opponent pieces are automatically captured
- **Win Conditions**:
  - Capture 3+ opponent pieces to win
  - 100 moves with no captures = Draw
- **Rating System**: ELO-based ranking with 7 tiers

---

## ✨ Features

### 🎮 Gameplay
- ✅ Real-time multiplayer with WebSocket
- ✅ Interactive hexagon board with canvas rendering
- ✅ Automatic piece capture detection
- ✅ Turn management and game state sync
- ✅ Win/Draw detection
- ✅ Move history tracking

### 👥 Player Features
- ✅ User registration and authentication (JWT)
- ✅ Player profiles with statistics
- ✅ ELO rating system (7 tiers)
- ✅ Leaderboard rankings
- ✅ Game history
- ✅ Win rate tracking

### 🔧 Technical
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode UI
- ✅ Auto-save game progress
- ✅ Persistent database
- ✅ Auto-deploy on git push (Vercel + Railway)
- ✅ Real-time notifications

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 22+
- npm or yarn
- Git

### Local Development

#### Backend Setup
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:3000
```

#### Frontend Setup
```bash
cd frontend
# Serve with Python
python -m http.server 8000
# Or use any local server
# Access at http://localhost:8000
```

#### Testing Multiplayer Locally
```bash
# Terminal 1: Start backend
cd backend && npm start

# Terminal 2: Start frontend
cd frontend && python -m http.server 8000

# Open in two browser windows:
# Window 1: http://localhost:8000 (Player 1)
# Window 2: http://localhost:8000 (Player 2, incognito)
```

### Deployment

#### Backend (Railway)
```bash
# Deployed at: https://romgon-api.up.railway.app
# Auto-deploys on git push to main branch
```

#### Frontend (Vercel)
```bash
# Deployed at: https://romgon.net (via Cloudflare)
# Auto-deploys on git push to main branch
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                    User Browser                      │
└──────────────────────┬────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   HTTP REST API                  WebSocket
   (JSON)                        (Socket.io)
        │                             │
        ├──────────────┬──────────────┤
        │              │              │
   ┌────▼──────────────▼─────────────▼────┐
   │   Express.js Backend (Railway)       │
   │ ─────────────────────────────────── │
   │ • 24 REST API endpoints              │
   │ • Socket.io real-time server         │
   │ • Game engine processing             │
   │ • ELO rating calculations            │
   └────┬──────────────────────────────────┘
        │
        │ Read/Write
        │
   ┌────▼──────────────────────────────────┐
   │   SQLite Database                     │
   │ ─────────────────────────────────── │
   │ • Users (authentication, stats)       │
   │ • Games (match records)               │
   │ • Ratings (ELO history)               │
   │ • Achievements                        │
   │ • Friends list                        │
   └───────────────────────────────────────┘
```

### Frontend Architecture

```
index.html
    │
    ├── src/css/style.css (responsive styling)
    │
    ├── src/api/
    │   ├── client.js (REST API wrapper)
    │   └── websocket.js (Socket.io client)
    │
    ├── src/js/
    │   ├── error-handler.js (global error handling)
    │   ├── state.js (state management)
    │   ├── ui.js (UI components & pages)
    │   ├── app.js (app initialization)
    │   ├── game-engine.js (game logic)
    │   ├── board-renderer.js (canvas rendering)
    │   ├── multiplayer-manager.js (game sync)
    │   └── game-integration.js (UI-to-game bridge)
```

### Backend Architecture

```
backend/
    │
    ├── server.js (Express app, Socket.io setup)
    │
    ├── config/
    │   ├── database.js (SQLite initialization)
    │   └── romgon.db (SQLite database file)
    │
    ├── routes/
    │   ├── auth.js (login, register, JWT)
    │   ├── users.js (profile, stats)
    │   ├── games.js (game creation, moves)
    │   ├── ratings.js (leaderboard, ELO)
    │   └── stats.js (statistics, achievements)
    │
    ├── utils/
    │   ├── auth.js (JWT, bcrypt)
    │   └── rating.js (ELO calculations)
    │
    └── websocket/
        └── gameSocket.js (Socket.io event handlers)
```

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Responsive design with CSS variables
- **Vanilla JavaScript** - No frameworks (lightweight)
- **Canvas API** - Board rendering
- **Socket.io Client** - Real-time communication
- **LocalStorage** - Token persistence

### Backend
- **Node.js** - Runtime
- **Express.js** - REST API framework
- **Socket.io** - Real-time WebSocket server
- **SQLite3** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Helmet** - Security headers

### Infrastructure
- **Vercel** - Frontend hosting (auto-deploy)
- **Railway** - Backend hosting (auto-deploy)
- **Cloudflare** - DNS & CDN
- **GitHub** - Version control & CI/CD

---

## 📡 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player@example.com",
  "password": "securepassword"
}

Response: 201 Created
{
  "user": { "id": 1, "username": "player1", ... },
  "token": "eyJhbGc..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "securepassword"
}

Response: 200 OK
{
  "user": { "id": 1, "username": "player1", ... },
  "token": "eyJhbGc..."
}
```

### Game Endpoints

#### Create Game
```http
POST /api/games/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "opponentId": 2,
  "color": "white"
}

Response: 201 Created
{
  "gameId": "game-123",
  "status": "waiting"
}
```

#### Make Move
```http
POST /api/games/{gameId}/move
Authorization: Bearer {token}
Content-Type: application/json

{
  "move": { "q": 0, "r": 0 },
  "boardState": [...]
}

Response: 200 OK
{
  "success": true,
  "boardState": [...]
}
```

#### Get Leaderboard
```http
GET /api/ratings/leaderboard?limit=10&offset=0
Authorization: Bearer {token}

Response: 200 OK
{
  "players": [
    {
      "rank": 1,
      "username": "champion",
      "rating": 2000,
      "tier": "Gold",
      "wins": 50,
      "losses": 10
    },
    ...
  ]
}
```

### WebSocket Events

#### Player Connected
```javascript
socket.emit('userConnected', userId);
```

#### Game Move
```javascript
socket.emit('gameMove', {
  gameId: 'game-123',
  move: { q: 0, r: 0, color: 'white' },
  boardState: [...],
  gameState: {...}
});

socket.on('gameMove', (data) => {
  // Handle opponent's move
});
```

#### Game End
```javascript
socket.on('gameEnded', (data) => {
  console.log('Winner:', data.winner);
  console.log('Reason:', data.reason);
});
```

---

## 📦 Deployment

### Frontend (Vercel)

**Automatic Deployment:**
- Every `git push` to `main` triggers auto-deploy
- Deployment typically completes in 1-2 minutes
- Access at: https://romgon.net (via Cloudflare)

**Manual Deployment:**
```bash
vercel --prod
```

### Backend (Railway)

**Automatic Deployment:**
- Every `git push` to `main` triggers auto-deploy
- Deployment includes npm install and start
- Access at: https://romgon-api.up.railway.app

**Environment Variables:**
```
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key-here
ALLOWED_ORIGINS=https://romgon.net,https://www.romgon.net
```

### Database

**SQLite Persistent Storage:**
- Database file stored on Railway
- Persists across deployments
- Tables auto-created on first run
- 7 tables: users, games, ratings, messages, achievements, friends, rating_changes

---

## 🔒 Security

### Authentication
- ✅ JWT tokens (7-day expiration)
- ✅ bcryptjs password hashing
- ✅ CORS protection
- ✅ Helmet security headers

### Data Protection
- ✅ HTTPS/TLS encryption
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection
- ✅ CSRF tokens

### Rate Limiting
- ✅ API request rate limiting
- ✅ WebSocket connection limits
- ✅ DDoS protection (via Cloudflare)

---

## 📊 Game Engine

### Board System

**Axial Coordinate System:**
```
         (-1,1) (0,1) (1,1)
              \ | /
    (-2,0)─────(0,0)─────(2,0)
              / | \
         (-1,-1)(0,-1)(1,-1)
```

**Valid Moves:**
1. First move must be at center (0,0)
2. Subsequent moves must be adjacent to existing pieces
3. Cannot place on occupied hexagon

### Capture Mechanics

**Piece Capture Rules:**
- A piece is captured when surrounded by 3+ opponent pieces
- Captures happen automatically after each move
- Multiple pieces can be captured in one move

**Win Conditions:**
- **Victory**: First player to capture 3+ opponent pieces
- **Draw**: 100 moves with no captures
- **Resignation**: Opponent resigns

### Rating System

**ELO Calculation:**
```
K-factor = 32 (standard)
Initial rating = 1600
Updated rating = Old rating + K × (Result - Expected)

Tiers (based on rating):
• Gold (👑): 2000+
• Pink (🏆): 1800-1999
• Red (⭐): 1600-1799
• Orange (🥇): 1400-1599
• Cyan (🥈): 1200-1399
• Green (🥉): 1000-1199
• Blue (🎯): <1000
```

---

## 🐛 Troubleshooting

### Game Won't Connect
**Problem:** Can't connect to WebSocket
- Check backend is running: `https://romgon-api.up.railway.app/api/health`
- Check browser console for errors
- Try hard-refresh: Ctrl+Shift+R

### Moves Not Syncing
**Problem:** Opponent doesn't see your moves
- Check WebSocket connection in DevTools
- Verify game ID matches both players
- Restart game if connection drops

### Login Issues
**Problem:** Login fails or token invalid
- Clear localStorage: `localStorage.clear()`
- Hard refresh browser
- Check backend is responding to auth requests

### Board Not Rendering
**Problem:** Game board appears blank
- Check canvas is visible in DevTools
- Verify boardSize configuration
- Clear browser cache and restart

---

## 📝 Development Roadmap

### Completed ✅
- [x] Core game engine
- [x] Hexagon board rendering
- [x] Real-time multiplayer
- [x] User authentication
- [x] ELO rating system
- [x] Leaderboard
- [x] Database persistence
- [x] Auto-deployment

### In Progress 🔄
- [ ] Game chat system
- [ ] Friend system
- [ ] Achievement system
- [ ] Game replays
- [ ] Spectator mode

### Planned 📋
- [ ] Mobile app (React Native)
- [ ] AI opponent (minimax algorithm)
- [ ] Tournament mode
- [ ] Streaming integration
- [ ] Analytics dashboard

---

## 🤝 Contributing

### Local Development

1. **Clone repository:**
   ```bash
   git clone https://github.com/romgon-coder/Romgon.git
   cd Romgon
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make changes and test:**
   ```bash
   # Test locally
   cd backend && npm start  # Terminal 1
   cd frontend && python -m http.server 8000  # Terminal 2
   ```

4. **Commit with descriptive messages:**
   ```bash
   git commit -m "feat: Add your feature description"
   git push origin feature/your-feature
   ```

5. **Create Pull Request on GitHub**

### Code Style
- **JavaScript**: Use modern ES6+ syntax
- **Comments**: Add JSDoc for functions
- **Naming**: camelCase for variables, PascalCase for classes
- **Formatting**: 2-space indentation

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Contact**: romgon-coder@example.com

---

## 🙏 Acknowledgments

Built with modern web technologies for fast, scalable multiplayer gaming.

---

**Made with 💚 by ROMGON Team**

*Last Updated: October 2025*

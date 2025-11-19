# Development Setup

Complete guide to setting up ROMGON for local development.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Database Setup](#database-setup)
- [Testing](#testing)
- [Deployment](#deployment)

## 🛠️ Prerequisites

### Required Software

- **Node.js** v22.x or higher ([Download](https://nodejs.org/))
- **npm** v9.x or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Optional Tools

- **PostgreSQL** 14+ (for production-like database)
- **VS Code** (recommended IDE)
- **Postman** (for API testing)

### Verify Installation

```bash
node --version
# v22.x.x

npm --version
# 9.x.x

git --version
# git version 2.x.x
```

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/romgon-coder/Romgon.git
cd Romgon
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Root (for build scripts):**
```bash
cd ..
npm install
```

### 3. File Structure

```
Romgon/
├── backend/                 # Node.js backend
│   ├── server.js           # Entry point
│   ├── config/             # Database config
│   ├── routes/             # API routes
│   ├── engine/             # Game engine
│   ├── ai/                 # AI implementation
│   ├── utils/              # Utilities
│   └── package.json        # Backend dependencies
│
├── frontend/               # Vanilla JS frontend
│   ├── index.html          # Main app
│   └── src/                # JS/CSS modules
│
├── public/                 # Build output (served by Vercel)
│   └── index.html          # Built frontend
│
├── package.json            # Root package.json
└── build-frontend.js       # Build script
```

## ⚙️ Configuration

### Environment Variables

Create `.env` file in `/backend/`:

```bash
cd backend
touch .env
```

**Backend `.env`:**
```env
# Server
NODE_ENV=development
PORT=3000

# Database (SQLite for dev)
DB_TYPE=sqlite
DB_PATH=./romgon.db

# Or PostgreSQL for production-like:
# DB_TYPE=postgres
# DATABASE_URL=postgresql://user:password@localhost:5432/romgon

# Authentication
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS (frontend URL)
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Optional: AI Configuration
AI_DIFFICULTY_DEFAULT=hard
AI_RATING=1600
```

### Frontend Configuration

Update API URL in `/public/index.html` (around line 12000+):

```javascript
// Development
const API_URL = 'http://localhost:3000';

// Production
// const API_URL = 'https://romgon-backend.railway.app';
```

Or use environment detection:

```javascript
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://romgon-backend.railway.app';
```

## 🚀 Running Locally

### Start Backend

```bash
cd backend
npm start
```

**Output:**
```
Server running on http://localhost:3000
Database connected: SQLite (romgon.db)
WebSocket server ready
```

**Development Mode (auto-restart):**
```bash
npm run dev
```

### Serve Frontend

**Option 1: Simple HTTP Server**
```bash
# Install globally (once)
npm install -g http-server

# Serve public directory
cd public
http-server -p 5173 -c-1
```

**Option 2: Python Server**
```bash
cd public
python3 -m http.server 5173
```

**Option 3: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `public/index.html`
3. Select "Open with Live Server"

### Access Application

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **API Health:** http://localhost:3000/api/engine/health

## 🗄️ Database Setup

### SQLite (Default for Development)

No setup needed! Database file created automatically:

```bash
backend/romgon.db
```

**View Database:**
```bash
cd backend
sqlite3 romgon.db

# List tables
.tables

# View users
SELECT * FROM users;

# Exit
.quit
```

### PostgreSQL (Production-like)

**1. Install PostgreSQL:**
```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**2. Create Database:**
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE romgon;

# Create user
CREATE USER romgon_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE romgon TO romgon_user;

# Exit
\q
```

**3. Update `.env`:**
```env
DB_TYPE=postgres
DATABASE_URL=postgresql://romgon_user:your_password@localhost:5432/romgon
```

**4. Initialize Tables:**

Tables are created automatically on first run. Or manually:

```bash
cd backend
node -e "require('./config/database')"
```

### Database Schema

```sql
-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password TEXT,
  rating INTEGER DEFAULT 1200,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Games
CREATE TABLE games (
  id INTEGER PRIMARY KEY,
  white_player_id INTEGER,
  black_player_id INTEGER,
  winner TEXT,
  status TEXT,
  move_history TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rating Changes
CREATE TABLE rating_changes (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  game_id INTEGER,
  old_rating INTEGER,
  new_rating INTEGER,
  change INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Manual Testing

**1. Test Backend Health:**
```bash
curl http://localhost:3000/api/engine/health
```

**2. Test AI Endpoint:**
```bash
curl -X POST http://localhost:3000/api/ai/move \
  -H "Content-Type: application/json" \
  -d '{
    "board": {
      "3-4": {"color": "white", "type": "rhombus", "flipped": false}
    },
    "playerColor": "white",
    "flipModeEnabled": true,
    "difficulty": "hard"
  }'
```

**3. Test WebSocket:**
```javascript
// In browser console
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('Connected!'));
```

### AI Testing

Run included test suite:

```bash
cd backend
node test-flip-ai.js
```

**Expected Output:**
```
=== Testing AI Flip Mode Improvements ===

--- Test 1: Generate moves WITHOUT flip mode ---
✓ Generated 13 legal moves for white (flip mode OFF)

--- Test 2: Generate moves WITH flip mode ---
✓ Generated 11 legal moves for white (flip mode ON)

--- Test 3: Position Evaluation ---
✓ Flip mode evaluation difference: -406 points

...

=== All Tests Completed Successfully! ===
```

### Automated Testing (Future)

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 📝 Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit files, test locally:

```bash
# Backend changes
cd backend
npm run dev  # Auto-restart on changes

# Frontend changes
# Just refresh browser (or use Live Server auto-reload)
```

### 3. Test Changes

```bash
# Manual testing
# - Play a game
# - Test AI moves
# - Check console for errors

# Automated tests
npm test
```

### 4. Commit Changes

```bash
git add .
git commit -m "Add feature: description"
```

### 5. Push & Deploy

```bash
git push origin feature/your-feature-name
```

## 🚢 Deployment

### Vercel (Frontend)

**1. Install Vercel CLI:**
```bash
npm install -g vercel
```

**2. Login:**
```bash
vercel login
```

**3. Deploy:**
```bash
vercel --prod
```

**Or use GitHub integration:**
- Push to `main` branch
- Vercel auto-deploys
- Frontend served from `/public/`

### Railway (Backend)

**1. Install Railway CLI:**
```bash
npm install -g @railway/cli
```

**2. Login:**
```bash
railway login
```

**3. Link Project:**
```bash
cd backend
railway link
```

**4. Deploy:**
```bash
railway up
```

**Or use GitHub integration:**
- Push to `main` branch
- Railway auto-deploys
- Uses `/backend/` directory

### Environment Variables (Production)

**Vercel:**
```
Settings → Environment Variables
(None needed for static frontend)
```

**Railway:**
```
Settings → Variables

NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DATABASE_URL=<postgresql-connection-string>
FRONTEND_URL=https://romgon.net
PORT=3000  (Railway auto-sets this)
```

## 🐛 Troubleshooting

### Backend Won't Start

**Check Node version:**
```bash
node --version
# Should be 22.x or higher
```

**Check dependencies:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Check port availability:**
```bash
lsof -i :3000  # macOS/Linux
# Kill process using port 3000
kill -9 <PID>
```

### Database Errors

**SQLite locked:**
```bash
# Close all connections
rm backend/romgon.db
# Restart backend (recreates DB)
```

**PostgreSQL connection failed:**
```bash
# Check PostgreSQL is running
pg_isready

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

### Frontend Not Loading

**CORS errors:**
```javascript
// Check ALLOWED_ORIGINS in backend/.env
ALLOWED_ORIGINS=http://localhost:5173
```

**API_URL incorrect:**
```javascript
// In public/index.html, verify:
const API_URL = 'http://localhost:3000';
```

### AI Not Working

**Check engine import:**
```bash
# In backend/ai/reinforcement-learning.js
# Should be: require('../engine/romgon-real-engine')
# NOT: require('../engine/romgon-engine')
```

**Check flip mode passed:**
```javascript
// Verify flipModeEnabled in API request
{
  "board": {...},
  "flipModeEnabled": true  // ← Must be included!
}
```

## 🔧 Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ritwickdey.liveserver",
    "ms-vscode.vscode-node-debug2",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Debugging

**Backend (VS Code):**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/server.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

**Frontend (Browser DevTools):**
```javascript
// Console logging
console.log('Board state:', board);
console.log('AI move:', move);

// Breakpoints
debugger;  // Pauses execution
```

## 📚 Additional Resources

- [Architecture Overview](Architecture-Overview) - System design
- [API Documentation](API-Documentation) - Backend API
- [AI Implementation](AI-Implementation) - AI engine
- [Contributing Guide](Contributing) - Contribution guidelines

## ❓ FAQ

**Q: Do I need PostgreSQL for development?**
A: No, SQLite works fine for local development.

**Q: How do I reset the database?**
A: Delete `backend/romgon.db` and restart backend.

**Q: Can I use a different port?**
A: Yes, change `PORT` in `.env` and update frontend `API_URL`.

**Q: How do I update dependencies?**
A: Run `npm update` in backend directory.

**Q: Where are logs stored?**
A: Console output. Use `console.log()` for debugging.

---

**Next Steps:**
- Read [Architecture Overview](Architecture-Overview)
- Explore [API Documentation](API-Documentation)
- Study [AI Implementation](AI-Implementation)
- Join development discussions on GitHub

**Need Help?**
- GitHub Issues: https://github.com/romgon-coder/Romgon/issues
- Documentation: This wiki!

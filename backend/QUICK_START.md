# ROMGON Backend - Quick Start Guide

Get the backend running in 5 minutes!

## 1. Prerequisites

Make sure you have:
- **Node.js 14+** - [Download](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** - For version control

Verify installation:
```bash
node --version    # Should be 14.0.0 or higher
npm --version     # Should be 6.0.0 or higher
```

## 2. Installation

### Step 1: Navigate to backend directory
```bash
cd "c:\Users\mansonic\Documents\Romgon Game\backend"
```

### Step 2: Install dependencies
```bash
npm install
```

This installs all required packages (takes ~30 seconds):
- express.js (web framework)
- socket.io (real-time)
- sqlite3 (database)
- bcryptjs (password security)
- jsonwebtoken (JWT auth)
- And more...

## 3. Configuration

### Step 1: Create `.env` file
Copy the template and create your configuration:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

Or create manually - create a file named `.env` with:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-at-least-32-characters-long!
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
```

### Step 2: Verify `.env` file
The `.env` file should be in the `backend/` directory alongside `server.js`

## 4. Start the Server

### Option A: Normal Start (production-like)
```bash
npm start
```

### Option B: Development Mode (with auto-restart)
```bash
npm run dev
```

**Expected Output:**
```
╔════════════════════════════════════════╗
║   🎮 ROMGON Backend Server             ║
║   Version 1.0.0                        ║
╚════════════════════════════════════════╝

📡 Server running on: http://localhost:3000
🌍 Environment: development
📍 Health check: http://localhost:3000/api/health

✅ Server ready to accept connections!
```

## 5. Test the Server

### In another terminal, test the health check:

**PowerShell:**
```powershell
curl http://localhost:3000/api/health
```

**Command Prompt:**
```cmd
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
    "status": "OK",
    "timestamp": "2024-01-15T10:30:00Z",
    "uptime": 2.345
}
```

## 6. Try Your First API Call

### Register a User

**PowerShell:**
```powershell
$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    username = "testplayer"
    email = "test@example.com"
    password = "TestPass123"
    confirmPassword = "TestPass123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

Or use a tool like [Postman](https://www.postman.com/) or [VS Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

**Expected Response:**
```json
{
    "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "testplayer",
        "email": "test@example.com",
        "rating": 1600,
        "wins": 0,
        "losses": 0,
        "totalGames": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "User created successfully"
}
```

## 7. Database

The database is automatically created on first run:
- **Location**: `backend/romgon.db`
- **Type**: SQLite (local file)
- **Size**: Grows with data
- **Tables**: 7 (users, games, ratings, etc.)

View database with:
- [SQLite Browser](https://sqlitebrowser.org/) - GUI tool
- `sqlite3 romgon.db` - Command line

## 8. Project Structure

```
backend/
├── server.js                 # Main server (run this)
├── package.json              # Dependencies
├── .env                      # Configuration (CREATE THIS)
├── romgon.db                 # Database (auto-created)
├── config/
│   └── database.js           # Database setup
├── utils/
│   ├── auth.js              # Authentication
│   └── rating.js            # Rating system
├── routes/
│   ├── auth.js              # Login/register
│   ├── users.js             # User profiles
│   ├── games.js             # Game logic
│   ├── ratings.js           # Ratings
│   └── stats.js             # Statistics
├── websocket/
│   └── gameSocket.js        # Real-time
├── README.md                # Full docs
└── API_DOCUMENTATION.md     # API reference
```

## 9. Common Commands

```bash
# Start server
npm start

# Start with auto-reload (better for development)
npm run dev

# Stop server
# Press Ctrl+C

# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process on port 3000 (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

## 10. Troubleshooting

### Port Already in Use
```bash
# Windows - Find what's using port 3000
netstat -ano | findstr :3000

# Kill it
Get-Process -Id [PID] | Stop-Process -Force

# Or use a different port
# Edit .env and set PORT=3001
```

### Node/npm Not Found
```bash
# Add Node to PATH or reinstall
node --version
npm --version

# If not found, install from https://nodejs.org/
```

### Dependencies Won't Install
```bash
# Clear npm cache and retry
npm cache clean --force
npm install
```

### Database Locked
```bash
# Delete the database and let it recreate
rm backend/romgon.db
npm start  # Recreates database
```

### JWT_SECRET Not Set
Make sure `.env` file exists with:
```
JWT_SECRET=your-secret-key-here
```

## 11. Example Requests

### Using REST Client Extension (VS Code)

Create `requests.http`:
```http
### Health Check
GET http://localhost:3000/api/health

### Register User
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "Password123"
}

### Get User Profile (requires token from login)
GET http://localhost:3000/api/users/profile/me
Authorization: Bearer YOUR_TOKEN_HERE

### Create Game
POST http://localhost:3000/api/games/create
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "color": "white"
}

### Get Leaderboard
GET http://localhost:3000/api/ratings

### Get Global Stats
GET http://localhost:3000/api/stats/global
```

Then use VS Code REST Client extension to send requests!

## 12. Next Steps

1. **Frontend Integration**
   - Update frontend to use backend API
   - Connect authentication
   - Sync game state

2. **Testing**
   - Test all 24 endpoints
   - Load testing
   - Security testing

3. **Deployment**
   - Choose hosting (Heroku, Railway, etc.)
   - Configure production environment
   - Set up SSL/HTTPS

4. **Monitoring**
   - Set up logging
   - Error tracking
   - Performance monitoring

## 13. Documentation

- **Full API Docs**: See `API_DOCUMENTATION.md` (detailed endpoint reference)
- **Setup Guide**: See `README.md` (comprehensive guide)
- **Backend Summary**: See `BACKEND_IMPLEMENTATION_SUMMARY.md` (overview)

## 14. Support

### Useful Resources
- [Express.js Docs](https://expressjs.com/)
- [Socket.io Docs](https://socket.io/docs/)
- [SQLite Docs](https://www.sqlite.org/docs.html)
- [JWT Auth](https://jwt.io/)

### Debug Mode
Add debug logging to server start:
```bash
DEBUG=* npm start
```

## 15. File Checklist

Make sure you have:
- ✅ `server.js` - Main server file
- ✅ `package.json` - Dependencies
- ✅ `.env` - Your configuration
- ✅ `config/database.js` - Database setup
- ✅ `utils/auth.js` - Authentication
- ✅ `utils/rating.js` - Rating system
- ✅ `routes/auth.js` - Auth routes
- ✅ `routes/users.js` - User routes
- ✅ `routes/games.js` - Game routes
- ✅ `routes/ratings.js` - Rating routes
- ✅ `routes/stats.js` - Stats routes
- ✅ `websocket/gameSocket.js` - WebSocket setup

## Summary

```
1. Install: npm install
2. Configure: Create .env
3. Start: npm start or npm run dev
4. Test: curl http://localhost:3000/api/health
5. Deploy: See README.md
```

**You're ready to go!** 🚀

Questions? Check `README.md` or `API_DOCUMENTATION.md`

---

**Version**: 1.0.0  
**Last Updated**: January 2024


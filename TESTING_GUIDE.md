# Active Games Testing Guide

## 🚀 Quick Start Testing

### Step 1: Start the Backend Server

```powershell
# Open a PowerShell terminal
cd "C:\Users\mansonic\Documents\Romgon Game\backend"

# Install dependencies (if not done already)
npm install

# Start the backend server
npm start
```

**Expected Output:**
```
Server running on port 3000
✅ Database connected
✅ WebSocket server initialized
```

---

### Step 2: Open the Frontend

**Option A: Live Server (Recommended)**
1. Open VS Code
2. Right-click `public/index.html`
3. Select "Open with Live Server"
4. Browser opens to `http://127.0.0.1:5500/public/index.html`

**Option B: File System**
1. Navigate to `C:\Users\mansonic\Documents\Romgon Game\public`
2. Double-click `index.html`
3. Opens in your default browser

---

### Step 3: Login/Create Account

1. Click "Sign In" or "Guest Login"
2. If using backend auth:
   - Create account or login
   - Token stored in localStorage
3. You'll see the lobby/user-home page

---

### Step 4: Check Browser Console

Press `F12` to open DevTools, then check Console tab.

**Expected Console Output:**
```javascript
✅ Game WebSocket connected
🏠 Initializing lobby...
⚠️ No userId, skipping active games load  // (if not logged in)
✅ Lobby initialized
```

---

## 🧪 Testing Scenarios

### Test 1: Active Games API (No Games Yet)

**Check Browser Console:**
```javascript
// Should see:
⚠️ No token, skipping active games load
// OR
Failed to load active games: 401  // (not authenticated)
// OR
// Empty active games list displays
```

**Check UI:**
- Lobby shows "No active games. Start a new game to get started!"

---

### Test 2: Test API Endpoints Directly (Postman/curl)

#### Get Active Games:
```powershell
# Replace YOUR_TOKEN with actual JWT token from localStorage
# Replace USER_ID with actual user ID

curl -H "Authorization: Bearer YOUR_TOKEN" `
  http://localhost:3000/api/games/active/USER_ID
```

**Expected Response:**
```json
{
  "games": []
}
```

#### Get Match History:
```powershell
curl -H "Authorization: Bearer YOUR_TOKEN" `
  "http://localhost:3000/api/games/history/USER_ID?limit=10&offset=0"
```

**Expected Response:**
```json
{
  "games": [],
  "total": 0,
  "hasMore": false
}
```

---

### Test 3: Create Test Game Data (SQL)

#### Open SQLite Database:
```powershell
cd "C:\Users\mansonic\Documents\Romgon Game\backend"

# Install sqlite3 CLI if needed
# Or use DB Browser for SQLite (GUI)

sqlite3 romgon.db
```

#### Create Test Users:
```sql
-- Check existing users
SELECT id, username, rating FROM users;

-- Create test users if needed
INSERT INTO users (id, username, email, rating) 
VALUES ('test-user-1', 'TestPlayer1', 'test1@example.com', 1450);

INSERT INTO users (id, username, email, rating) 
VALUES ('test-user-2', 'TestPlayer2', 'test2@example.com', 1520);
```

#### Create Test Active Game:
```sql
-- Create an active game
INSERT INTO games (
  id, 
  white_player_id, 
  black_player_id, 
  moves, 
  total_moves, 
  status,
  created_at,
  updated_at
) VALUES (
  'test-game-123',
  'test-user-1',
  'test-user-2',
  '[]',
  0,
  'active',
  datetime('now'),
  datetime('now')
);

-- Verify
SELECT * FROM games WHERE id = 'test-game-123';
```

#### Create Test Finished Game:
```sql
INSERT INTO games (
  id, 
  white_player_id, 
  black_player_id, 
  moves, 
  total_moves, 
  status,
  winner_id,
  result,
  created_at,
  updated_at
) VALUES (
  'test-game-finished',
  'test-user-1',
  'test-user-2',
  '[{"from":"a1","to":"b2","timestamp":"2025-10-21T10:00:00Z"}]',
  12,
  'finished',
  'test-user-1',
  'white_wins',
  datetime('now', '-2 hours'),
  datetime('now', '-1 hour')
);
```

---

### Test 4: Verify Active Games Display

After creating test data:

1. **Refresh the browser** (or reload lobby)
2. **Check Console:**
   ```javascript
   🎯 Move update received: {...}
   🏠 Initializing lobby...
   ✅ Lobby initialized
   ```

3. **Check Active Games Section:**
   - Should show test game card
   - Opponent name: "TestPlayer2"
   - Rating: 1520
   - Turn indicator: 🟢 YOUR TURN or ⏳ Waiting...
   - Time: "Just now" (if just created)

---

### Test 5: Verify Match History Display

After creating finished game:

1. **Scroll to Match History section**
2. **Should display:**
   - 🏆 Victory (if you won)
   - vs TestPlayer2
   - Rating: 1520
   - Duration: "1:00" (1 hour)
   - 12 moves
   - Rating change: +0 (not calculated yet)

---

### Test 6: Test WebSocket Real-Time Updates

#### Terminal 1 - Start Backend:
```powershell
cd backend
npm start
```

#### Terminal 2 - Node.js WebSocket Test:
```javascript
// Save as test-websocket.js
const io = require('socket.io-client');

const socket = io('http://localhost:3000/game', {
  auth: {
    token: 'YOUR_JWT_TOKEN_HERE'
  }
});

socket.on('connect', () => {
  console.log('✅ Connected to game WebSocket');
  
  // Join a game
  socket.emit('game:join', {
    gameId: 'test-game-123',
    userId: 'test-user-1'
  });
});

socket.on('game:moveUpdate', (data) => {
  console.log('🎯 Move update:', data);
});

socket.on('lobby:gameUpdate', (data) => {
  console.log('🔄 Lobby update:', data);
});

// Simulate a move after 2 seconds
setTimeout(() => {
  socket.emit('game:move', {
    gameId: 'test-game-123',
    userId: 'test-user-1',
    move: { from: 'a1', to: 'b2' }
  });
}, 2000);
```

Run:
```powershell
node test-websocket.js
```

---

### Test 7: Test Frontend Functions Directly

Open browser console (`F12`) and run:

```javascript
// Test active games load
await loadActiveGames();

// Check what was loaded
console.log('Active games loaded');

// Test match history
await loadMatchHistory(10, 0);

// Test stats load
await loadUserStats();

// Test game socket
console.log('Game socket:', gameSocket);
console.log('Connected?', gameSocket?.connected);
```

---

## 🔍 Debugging Checklist

### Backend Not Starting?
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <PID_NUMBER> /F

# Check Node.js version
node --version  # Should be v14+

# Reinstall dependencies
cd backend
rm -r node_modules
npm install
```

### Frontend Not Loading Active Games?

**Check Browser Console for Errors:**
1. Press `F12` → Console tab
2. Look for red errors
3. Common issues:
   - `CORS error` → Backend not running or wrong URL
   - `401 Unauthorized` → No token or invalid token
   - `404 Not Found` → Wrong API endpoint

**Check localStorage:**
```javascript
// In browser console
console.log('Token:', localStorage.getItem('token'));
console.log('User ID:', localStorage.getItem('userId'));
console.log('User:', localStorage.getItem('romgon-user'));
```

**Check Backend URL:**
```javascript
// In browser console (or search in index.html)
console.log('Backend URL:', BACKEND_API_URL);
// Should be: 'http://localhost:3000' (for local testing)
```

### WebSocket Not Connecting?

**Check Backend Console:**
```
🎮 Game connection: socket-id-here
👤 User userId joined game gameId
```

**Check Frontend Console:**
```javascript
✅ Game WebSocket connected
// OR
❌ Game WebSocket disconnected
```

**Test WebSocket Manually:**
```javascript
// In browser console
const testSocket = io('http://localhost:3000/game', {
  auth: { token: localStorage.getItem('token') }
});

testSocket.on('connect', () => console.log('✅ Test socket connected'));
testSocket.on('connect_error', (err) => console.error('❌ Error:', err));
```

---

## 📋 Full Testing Workflow

### Complete Test Sequence:

1. **Start Backend** ✅
   ```powershell
   cd backend
   npm start
   ```

2. **Create Test Data** ✅
   ```sql
   -- Create 2 users and 2 games (1 active, 1 finished)
   ```

3. **Open Frontend** ✅
   ```
   http://127.0.0.1:5500/public/index.html
   ```

4. **Login** ✅
   - Use test-user-1 credentials
   - Or guest login

5. **Check Active Games** ✅
   - Should see 1 active game
   - Opponent: TestPlayer2
   - Click on it (shows alert for now)

6. **Check Match History** ✅
   - Should see 1 finished game
   - Result: Victory or Defeat
   - Rating change displayed

7. **Test Real-Time** ✅
   - Open in 2 browser tabs (different users)
   - Make move in one tab
   - See update in other tab

8. **Check Stats** ✅
   - Rating displays correctly
   - Wins/Losses accurate

---

## 🎯 Expected Results Summary

| Test | Expected Result | How to Verify |
|------|----------------|---------------|
| Backend starts | Port 3000 listening | `npm start` output |
| API endpoints work | JSON responses | curl or Postman |
| Frontend loads | No console errors | Browser F12 |
| WebSocket connects | "✅ Connected" log | Browser console |
| Active games display | Game cards visible | Lobby UI |
| Match history display | History cards visible | Scroll down |
| Real-time updates | Games refresh on move | Two browser tabs |
| Turn indicator | Green glow when your turn | Active game card |
| Time tracking | "Xm ago" format | Active game card |
| Pagination | Load More button | Match history |

---

## 🐛 Common Issues & Fixes

### Issue: "No active games" always shows
**Fix:**
1. Check database has games with `status='active'`
2. Verify userId matches game's white_player_id or black_player_id
3. Check console for API errors

### Issue: WebSocket not connecting
**Fix:**
1. Ensure backend is running (`npm start`)
2. Check Socket.IO is installed: `npm list socket.io`
3. Verify URL is correct (localhost:3000 for local)
4. Check firewall/antivirus not blocking

### Issue: API returns 401 Unauthorized
**Fix:**
1. Get valid token: Login via frontend
2. Copy token from localStorage
3. Use in Authorization header: `Bearer YOUR_TOKEN`

### Issue: Turn indicator wrong
**Fix:**
1. Check moves array: `SELECT moves FROM games WHERE id = 'game-id'`
2. Verify move count matches array length
3. Debug turn calculation: `moves.length % 2 === 0` should be white's turn

### Issue: Time shows wrong format
**Fix:**
1. Check game updated_at timestamp
2. Verify system time is correct
3. Console.log the time calculation

---

## 📝 Sample Test Data Script

Save as `backend/test-data.sql`:

```sql
-- Clean up existing test data
DELETE FROM games WHERE id LIKE 'test-%';
DELETE FROM users WHERE id LIKE 'test-%';

-- Create test users
INSERT INTO users (id, username, email, rating, created_at) VALUES
('test-user-1', 'Alice', 'alice@test.com', 1420, datetime('now')),
('test-user-2', 'Bob', 'bob@test.com', 1550, datetime('now')),
('test-user-3', 'Charlie', 'charlie@test.com', 1380, datetime('now'));

-- Create active games
INSERT INTO games (id, white_player_id, black_player_id, moves, total_moves, status, created_at, updated_at) VALUES
('test-active-1', 'test-user-1', 'test-user-2', '[{"from":"a1","to":"b2","timestamp":"2025-10-21T10:00:00Z"}]', 1, 'active', datetime('now', '-30 minutes'), datetime('now', '-5 minutes')),
('test-active-2', 'test-user-3', 'test-user-1', '[]', 0, 'active', datetime('now', '-1 hour'), datetime('now', '-45 minutes'));

-- Create finished games
INSERT INTO games (id, white_player_id, black_player_id, moves, total_moves, status, winner_id, result, created_at, updated_at) VALUES
('test-finished-1', 'test-user-1', 'test-user-2', '[{"from":"a1","to":"b2"}]', 24, 'finished', 'test-user-1', 'white_wins', datetime('now', '-2 days'), datetime('now', '-2 days', '+30 minutes')),
('test-finished-2', 'test-user-2', 'test-user-1', '[{"from":"a1","to":"b2"}]', 18, 'finished', 'test-user-2', 'black_wins', datetime('now', '-1 day'), datetime('now', '-1 day', '+20 minutes')),
('test-finished-3', 'test-user-1', 'test-user-3', '[{"from":"a1","to":"b2"}]', 35, 'finished', 'test-user-1', 'white_wins', datetime('now', '-5 hours'), datetime('now', '-4 hours'));

-- Verify
SELECT 'Users Created:' as info, COUNT(*) as count FROM users WHERE id LIKE 'test-%'
UNION ALL
SELECT 'Active Games:', COUNT(*) FROM games WHERE status = 'active' AND id LIKE 'test-%'
UNION ALL
SELECT 'Finished Games:', COUNT(*) FROM games WHERE status = 'finished' AND id LIKE 'test-%';
```

Run:
```powershell
cd backend
sqlite3 romgon.db < test-data.sql
```

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ Backend starts without errors
2. ✅ Browser console shows "Game WebSocket connected"
3. ✅ Active games section shows test games
4. ✅ Opponent names and ratings display correctly
5. ✅ Turn indicator shows 🟢 YOUR TURN or ⏳ Waiting...
6. ✅ Time shows "5m ago", "1h ago", etc.
7. ✅ Match history shows finished games
8. ✅ Win/Loss icons colored correctly (green/red)
9. ✅ Clicking active game shows alert (resume placeholder)
10. ✅ Load More button appears if > 10 history games

---

## 🚀 Next Steps After Testing

Once everything works:

1. **Deploy Backend to Railway:**
   ```bash
   cd backend
   git add .
   git commit -m "feat: Active games backend"
   git push railway main
   ```

2. **Update Frontend URL:**
   ```javascript
   // In deploy/index.html
   const BACKEND_API_URL = 'https://romgon-backend.railway.app';
   ```

3. **Build and Deploy Frontend:**
   ```powershell
   node build-frontend.js
   git add public/
   git commit -m "feat: Active games frontend"
   git push origin main
   ```

4. **Test Production:**
   - Visit https://romgon.net
   - Login
   - Check active games load from Railway backend
   - Verify WebSocket connects

---

**Need Help?** Check the console logs - they'll tell you exactly what's happening! 🔍

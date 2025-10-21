# Two-Browser Testing Guide for Active Games

## Setup

### Browser 1: TestAlice (Player 1)
**URL:** `http://127.0.0.1:5500/public/index.html`

1. Open browser (Chrome/Edge/Firefox)
2. Open Console (F12)
3. Go to: `http://127.0.0.1:5500/public/index.html`
4. Open Console and run:
   ```javascript
   // Login as TestAlice (has 2 active games)
   localStorage.setItem('userId', '1');
   localStorage.setItem('token', 'test-token');
   localStorage.setItem('romgon-user', JSON.stringify({
       id: 1,
       username: 'TestAlice',
       rating: 1420,
       type: 'registered'
   }));
   ```
5. **Refresh page** (F5)
6. Click **"Lobby"** button

**Expected:**
- ✅ Should see 2 active game cards
- ✅ Game vs TestBob (rating 1550)
- ✅ Game vs TestCharlie (rating 1380)
- ✅ Console shows "✅ Active games loaded: 2"

---

### Browser 2: TestBob (Player 2)
**URL:** `http://127.0.0.1:5500/public/index.html`

1. Open **different browser** or **Incognito/Private window**
2. Open Console (F12)
3. Go to: `http://127.0.0.1:5500/public/index.html`
4. Open Console and run:
   ```javascript
   // Login as TestBob (opponent of TestAlice)
   localStorage.setItem('userId', '2');
   localStorage.setItem('token', 'test-token');
   localStorage.setItem('romgon-user', JSON.stringify({
       id: 2,
       username: 'TestBob',
       rating: 1550,
       type: 'registered'
   }));
   ```
5. **Refresh page** (F5)
6. Click **"Lobby"** button

**Expected:**
- ✅ Should see 1 active game card (vs TestAlice)
- ✅ Console shows "✅ Active games loaded: 1"

---

## Test Scenarios

### Test 1: Real-Time Game Updates (WebSocket)

**Goal:** Verify that when one player makes a move, the other player's lobby updates in real-time.

**Steps:**

1. **Both browsers:** Make sure you're on the Lobby page
2. **Browser 1 (TestAlice):** Open Console
3. **Browser 1:** Simulate a game update by running:
   ```javascript
   // Emit a move event (simulating a game move)
   gameSocket.emit('game:move', {
       gameId: 'test-active-1',
       playerId: 1,
       move: {
           type: 'move',
           from: 'e2',
           to: 'e4',
           piece: 'pawn'
       },
       gameState: {
           currentTurn: 'black', // Now TestBob's turn
           moveCount: 2
       }
   });
   ```

4. **Browser 2 (TestBob):** Watch the lobby
   - Should see the game card update
   - Turn indicator should change to "Your turn"
   - Console should show: `📡 Game move update received`

5. **Browser 1 (TestAlice):** Watch the lobby
   - Turn indicator should change to "Opponent's turn"

---

### Test 2: New Game Created

**Goal:** Verify that when a new game starts, both players see it in their active games.

**Steps:**

1. **Browser 1 (TestAlice):** Run in Console:
   ```javascript
   // Simulate new game creation
   fetch('http://localhost:3000/api/games', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json',
           'Authorization': 'Bearer test-token'
       },
       body: JSON.stringify({
           whitePlayerId: 1,  // TestAlice
           blackPlayerId: 3,  // TestCharlie
           timeControl: '10+5'
       })
   }).then(r => r.json()).then(data => console.log('✅ Game created:', data));
   ```

2. **Both browsers:** Should automatically update (WebSocket broadcast)
   - Browser 1 should now show 3 active games
   - Browser 2 (TestBob) still shows 1 active game

---

### Test 3: Game Completed

**Goal:** Verify that when a game ends, it moves from Active Games to Match History.

**Steps:**

1. **Browser 1 (TestAlice):** Run in Console:
   ```javascript
   // Simulate game ending (TestAlice wins)
   fetch('http://localhost:3000/api/games/test-active-1', {
       method: 'PATCH',
       headers: {
           'Content-Type': 'application/json',
           'Authorization': 'Bearer test-token'
       },
       body: JSON.stringify({
           status: 'finished',
           winner: 'white',  // TestAlice wins
           result: 'checkmate'
       })
   }).then(r => r.json()).then(data => console.log('✅ Game ended:', data));
   ```

2. **Both browsers:** Should update automatically
   - Browser 1 (TestAlice): Active games goes from 2 to 1, Match History gains 1 game
   - Browser 2 (TestBob): Active games goes from 1 to 0, Match History gains 1 game

3. **Check Match History tab:**
   - Should show the completed game
   - Result should show "Victory" for TestAlice
   - Result should show "Defeat" for TestBob

---

### Test 4: Guest vs Registered User

**Goal:** Verify that guest users can see their games and interact with registered users.

**Steps:**

1. **Browser 1:** Keep TestAlice logged in
2. **Browser 2:** Logout and click "Guest Login"
3. **Browser 2:** Should create backend guest account
   - Console shows: "✅ Guest account created"
   - Note the guest userId (probably 4 or 5)
4. **Browser 2:** Click "Lobby"
   - Should see "No active games" (new guest)
5. **Browser 1 (TestAlice):** Create game with guest:
   ```javascript
   // Replace '4' with actual guest ID from Browser 2
   fetch('http://localhost:3000/api/games', {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json',
           'Authorization': 'Bearer test-token'
       },
       body: JSON.stringify({
           whitePlayerId: 1,  // TestAlice
           blackPlayerId: 4,  // Guest (use actual ID)
           timeControl: '10+5'
       })
   }).then(r => r.json()).then(data => console.log('✅ Game created:', data));
   ```

6. **Browser 2 (Guest):** Should automatically see new game appear!
   - Active games updates from 0 to 1
   - Shows game vs TestAlice (rating 1420)

---

### Test 5: Offline vs Online Behavior

**Goal:** Verify graceful degradation when backend is unavailable.

**Steps:**

1. **Stop backend server:**
   - Go to backend terminal
   - Press `Ctrl+C`

2. **Browser 1:** Refresh page
   - Should show "Backend not connected" or similar
   - Guest login falls back to offline mode

3. **Browser 1:** Click "Guest Login" (offline mode)
   - Console shows: "Using offline mode"
   - userId is `guest_timestamp`
   - token is `'guest-offline-mode'`

4. **Browser 1:** Click "Lobby"
   - Should show: "No active games" (graceful empty state)
   - Console shows: "👤 Guest in offline mode - no backend games"
   - **No errors!**

5. **Restart backend server:**
   ```powershell
   cd backend
   npm start
   ```

6. **Browser 1:** Refresh page
7. **Browser 1:** Click "Guest Login" (online mode)
   - Should create backend guest account
   - Full functionality restored

---

## Console Debugging Commands

### Check Current User
```javascript
console.log('userId:', localStorage.getItem('userId'));
console.log('token:', localStorage.getItem('token'));
console.log('user:', JSON.parse(localStorage.getItem('romgon-user')));
```

### Force Reload Active Games
```javascript
loadActiveGames();
```

### Force Reload Match History
```javascript
loadMatchHistory();
```

### Force Reload Stats
```javascript
loadUserStats();
```

### Check WebSocket Connection
```javascript
console.log('Game socket connected:', gameSocket?.connected);
console.log('Lobby socket connected:', lobbySocket?.connected);
```

### Manually Join Game Room (WebSocket)
```javascript
gameSocket.emit('game:join', {
    gameId: 'test-active-1',
    userId: localStorage.getItem('userId')
});
```

### Listen for All Game Events
```javascript
// Listen for move updates
gameSocket.on('game:moveUpdate', (data) => {
    console.log('📡 Move update:', data);
});

// Listen for game end
gameSocket.on('game:ended', (data) => {
    console.log('🏁 Game ended:', data);
});

// Listen for new games
gameSocket.on('game:created', (data) => {
    console.log('🆕 New game:', data);
});
```

---

## Expected Console Output

### Browser 1 (TestAlice):
```
✅ userId: 1
🏠 Initializing lobby...
✅ Game WebSocket connected
✅ Lobby WebSocket connected
📡 Fetching active games for player: 1
✅ Active games loaded: 2
📊 Rendering 2 active games
✅ Match history loaded: 3
✅ Stats loaded: {rating: 1420, wins: 2, losses: 1, winRate: 66.7%}
✅ Lobby initialized
```

### Browser 2 (TestBob):
```
✅ userId: 2
🏠 Initializing lobby...
✅ Game WebSocket connected
✅ Lobby WebSocket connected
📡 Fetching active games for player: 2
✅ Active games loaded: 1
📊 Rendering 1 active games
✅ Match history loaded: 0
✅ Stats loaded: {rating: 1550, wins: 0, losses: 0, winRate: 0%}
✅ Lobby initialized
```

---

## Troubleshooting

### Problem: "No active games" for TestAlice
**Solution:** Make sure test data is loaded in backend:
```powershell
cd backend
node insert-test-data.js
```

### Problem: WebSocket not connecting
**Solution:** Check backend is running:
```powershell
cd backend
npm start
```

### Problem: Browser 2 doesn't update when Browser 1 makes changes
**Solution:** Check WebSocket events are being emitted:
```javascript
// In Browser 1 console
gameSocket.emit('game:move', { gameId: 'test-active-1', playerId: 1 });

// In Browser 2 console - should see:
// 📡 Game move update received
```

### Problem: CORS errors
**Solution:** Backend should have CORS enabled for localhost:
```javascript
// backend/server.js should have:
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true
}));
```

---

## Success Criteria ✅

After testing, you should have verified:

- ✅ Both browsers can see their active games
- ✅ Real-time updates work via WebSocket
- ✅ Game state changes reflect immediately in both lobbies
- ✅ Guest users can see their games
- ✅ Match history updates when games finish
- ✅ Stats update correctly
- ✅ Offline mode shows graceful empty states (no errors)
- ✅ Turn indicators update correctly
- ✅ Opponent info displays correctly (username, rating)

---

## Next Steps After Testing

1. **Implement `resumeGame()` function**
   - Fetch game state from backend
   - Reconstruct board from moves array
   - Join WebSocket room
   - Show game board

2. **Create game functionality**
   - Button to create new game
   - Opponent selection (AI or human)
   - Time control selection

3. **Deploy to production**
   - Update BACKEND_API_URL to Railway
   - Build and deploy frontend to Vercel
   - Test on live site

---

**Ready to test? Open two browsers and let's see the real-time magic! 🚀**

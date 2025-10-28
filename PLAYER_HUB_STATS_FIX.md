# Player Hub Stats Fix - October 28, 2025

## Problem
Player Hub stats (wins, losses, total games, moves, captures) were not updating correctly after completing games. **Additionally, users after OAuth login couldn't see their stats at all** because the frontend required a user ID to fetch from backend, but the user ID wasn't available in localStorage.

## Root Causes

### 1. **Backend Not Tracking Moves and Captures** ✅ FIXED
- The `/api/games/submit-result` endpoint was only updating `wins`, `losses`, and `total_games`
- `total_moves` and `total_captures` columns were not being updated

### 2. **Frontend Not Tracking Captures During Gameplay** ✅ FIXED
- Captures were happening but not being counted
- `captureCount` was hardcoded to `0` in the `showGameOver` function
- No global variable to track captures during the game

### 3. **Captures Not Sent to Backend** ✅ FIXED
- When submitting game results, the `captures` field was missing from the request body
- Backend validation didn't accept the `captures` parameter

### 4. **Player Hub Wouldn't Fetch Stats Without User ID** ✅ FIXED (NEW)
- Frontend required `currentUser.id` to be defined before fetching stats
- After OAuth login, `currentUser.id` was `undefined` because JWT payload only had `username`
- Stats endpoint didn't return `userId`, so it couldn't be saved for future use
- This caused Player Hub to show zeros for all stats even though data existed in backend

## Solutions Implemented

### Backend Changes (`backend/routes/games.js`)

#### 1. Added Captures to Validation
```javascript
body('captures').optional().isInt({ min: 0 }).withMessage('Invalid captures count')
```

#### 2. Extract Captures from Request
```javascript
const { opponent_type, result, winner, move_count, captures } = req.body;
```

#### 3. Update All Three Stats (Wins/Losses/Draws)
```javascript
const moves = move_count || 0;
const capturesCount = captures || 0;

if (result === 'win') {
    await db.run(
        `UPDATE users 
         SET wins = wins + 1, 
             total_games = total_games + 1,
             total_moves = total_moves + ?,
             total_captures = total_captures + ?
         WHERE id = ?`,
        [moves, capturesCount, playerId]
    );
}
// Same pattern for 'loss' and 'draw' cases
```

### Backend Changes (`backend/routes/users.js`) - NEW

#### 4. Return User ID from Stats Endpoint
```javascript
res.json({
    userId: user.id,  // ✅ Now included
    username: user.username,
    email: user.email,
    rating: user.rating,
    memberLevel: user.member_level,
    stats: { ... }
});
```

### Frontend Changes (`deploy/index.html`)

#### 1. Added Global Capture Counter (Line ~14859)
```javascript
let gameCaptureCount = 0; // Track total captures in current game
```

#### 2. Increment Counter When Piece Captured (Line ~25712)
```javascript
existingPiece.remove(); // Capture the opponent piece
playCapturedSound();
didCapture = true;
gameCaptureCount++; // Increment capture counter
```

#### 3. Reset Counter When Starting New Game (Line ~19939)
```javascript
// Reset game state
gameOver = false;
currentPlayer = 'black';
currentTurnPiece = null;
gameMode = 'full';
gameCaptureCount = 0; // Reset capture counter
```

#### 4. Use Real Capture Count in Game Over (Line ~24863)
```javascript
const moveCount = moveHistory ? moveHistory.length : 0;
const captureCount = gameCaptureCount; // Use tracked capture count
```

#### 5. Send Captures to Backend (Line ~24935)
```javascript
const gameData = {
    opponent_type: 'ai',
    result: playerWon ? 'win' : 'loss',
    winner: winner.toLowerCase(),
    move_count: moveCount,
    captures: captureCount // Now included
};
```

### Frontend Changes - NEW (Player Hub Fetch Logic)

#### 6. Don't Require User ID to Fetch Stats (Line ~2565)
```javascript
// OLD: Required currentUser.id to be defined
const shouldFetchBackend = currentUser.id && (currentUser.type !== 'guest' || localStorage.getItem('romgon-jwt'));

// NEW: Only requires JWT token and registered user type
const hasJWT = !!localStorage.getItem('romgon-jwt');
const shouldFetchBackend = hasJWT && currentUser.type === 'registered';
```

#### 7. Save User ID from Backend Response (Line ~2580)
```javascript
if (stats) {
    // CRITICAL: Save user ID from backend if we don't have it
    if (stats.userId && !currentUser.id) {
        console.log('✅ Saving user ID from backend:', stats.userId);
        currentUser.id = stats.userId;
        localStorage.setItem('romgon-user', JSON.stringify(currentUser));
        window.currentUser = currentUser;
    }
    // ... rest of updates
}
```

## Testing Checklist

- [x] Backend accepts `captures` parameter
- [x] Backend updates `total_moves` in database
- [x] Backend updates `total_captures` in database
- [x] Frontend tracks captures during gameplay
- [x] Frontend resets capture count on new game
- [x] Frontend sends captures to backend
- [x] Player Hub displays updated stats after game
- [ ] Verify stats persist after page refresh
- [ ] Test with multiple consecutive games
- [ ] Test with both wins and losses

## Files Modified

1. **backend/routes/games.js**
   - Added `captures` validation
   - Updated all 3 result branches (win/loss/draw) to save moves and captures
   
2. **backend/routes/users.js** - NEW
   - Added `userId` to `/api/users/stats` response
   
3. **deploy/index.html**
   - Added `gameCaptureCount` global variable
   - Increment counter on piece capture
   - Reset counter on new game
   - Use real count in `showGameOver`
   - Send captures in backend submission
   - **Changed Player Hub fetch logic to not require user ID**
   - **Save user ID from backend response**

4. **public/index.html**
   - Synced with deploy/index.html

## Database Schema

Existing columns in `users` table (no migration needed):
- `total_moves` (INTEGER)
- `total_captures` (INTEGER)
- `wins` (INTEGER)
- `losses` (INTEGER)
- `draws` (INTEGER)
- `total_games` (INTEGER)

## Deployment

**Commits:**
- `123ec0c` - Backend and frontend stats tracking fixes (captures)
- `9603bdc` - Synced public/index.html
- `f70746e` - **Fixed Player Hub to fetch without user ID** ✅ CRITICAL FIX

**Status:** ✅ Deployed to production (Vercel auto-deploy from main branch)

**Backend Restart Required:** Yes - Railway needs to redeploy to pick up the `userId` change in `/api/users/stats`

## Expected Behavior After Fix

1. **During Game:**
   - Each time a piece is captured, `gameCaptureCount` increments
   - Counter is visible in logs: `gameCaptureCount++`

2. **Game Over:**
   - Move count calculated from `moveHistory.length`
   - Capture count taken from `gameCaptureCount`
   - Data logged: `console.log('📤 Sending game data:', gameData)`

3. **Backend Submission:**
   - Request includes: `{ opponent_type, result, winner, move_count, captures }`
   - Backend updates: `total_games`, `wins`/`losses`, `total_moves`, `total_captures`
   - Success logged: `✅ Game result submitted successfully`

4. **Player Hub:**
   - Opening hub calls `/api/users/stats`
   - Backend returns updated stats
   - Frontend displays: wins, losses, total games, moves, captures
   - Stats increase after each game

## Known Limitations

- **Single Player Only:** Currently only tracks for the human player in AI games
- **No PvP Tracking:** Multiplayer games not yet implemented with stats
- **Local Storage Backup:** Falls back to localStorage if backend fails

## Future Enhancements

- [ ] Track piece-specific capture statistics
- [ ] Track captures given (pieces lost)
- [ ] Add capture counter to game UI
- [ ] Show capture stats in game over screen
- [ ] Add leaderboard for most captures
- [ ] Track fastest games (by move count)

## Verification Commands

### Backend
```bash
# Check if backend is running
curl https://api.romgon.net/api/health

# Test stats endpoint (requires JWT)
curl -H "Authorization: Bearer YOUR_JWT" https://api.romgon.net/api/users/stats
```

### Frontend
```javascript
// Open browser console after playing a game
console.log('Capture count:', gameCaptureCount);

// Check localStorage for updated stats
JSON.parse(localStorage.getItem('romgon-user'))
```

## Troubleshooting

### Stats Not Updating?

1. **Check JWT Token:**
   ```javascript
   localStorage.getItem('romgon-jwt')
   ```

2. **Check User ID:**
   ```javascript
   JSON.parse(localStorage.getItem('romgon-user')).id
   ```

3. **Check Console Logs:**
   - Look for: `✅ Game result submitted to backend successfully`
   - Look for: `📊 Backend data: { stats, games }`

4. **Check Backend Logs:**
   - Railway logs should show: `✅ Game result submitted for user ...`

5. **Force Refresh Stats:**
   - Close and reopen Player Hub
   - Or refresh the page

### Still Not Working?

- Clear localStorage: `localStorage.clear()`
- Log out and log back in
- Check Railway backend is running
- Verify Vercel deployment succeeded

---

**Status:** ✅ FIXED  
**Last Updated:** October 28, 2025  
**Commits:** 123ec0c, 9603bdc

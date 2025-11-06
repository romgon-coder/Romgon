# Challenge Multiplayer Turn Display Fix

## Issue Summary
In challenge-based multiplayer games:
1. **Turn display didn't update** after BLACK player made a move
2. **BLACK couldn't see WHITE's moves** (while WHITE could see BLACK's moves)

## Root Cause
The turn switching logic had a conditional that prevented local turn updates in multiplayer mode:

```javascript
// OLD BUGGY CODE
if (!multiplayerMode || myPlayerColor === 'both') {
    switchTurn(); // Only switch in single-player or spectator mode
}
```

This created a problem:
- Player makes move → broadcasts to server → **doesn't switch turn locally**
- Server echoes move back → player's own move is skipped (early return) → **turn never updates**

## Solution
**Always call `switchTurn()` locally** after a move, regardless of multiplayer mode:

```javascript
// NEW FIXED CODE
switchTurn(); // Always switch turn locally after making a move
```

### Why This Works
1. **Local player makes move:**
   - Broadcasts move to server
   - Switches turn locally immediately ✅
   - Receives own move back → skips it (early return)
   - Turn stays correct ✅

2. **Opponent receives move:**
   - Applies opponent's move to board
   - Syncs turn from server data
   - Both players stay in sync ✅

## Files Changed
- `deploy/index.html`

### Changes Made

#### 1. Drop Handler (Lines 33478-33493)
**Removed conditional turn switching:**
```javascript
// BEFORE
if (isCapture) {
    playEndTurnSound();
    if (!multiplayerMode || myPlayerColor === 'both') {
        switchTurn(); // Only in single-player
    }
    updateBaseDefenceDisplay();
}

// AFTER
if (isCapture) {
    playEndTurnSound();
    switchTurn(); // ALWAYS switch turn
    updateBaseDefenceDisplay();
}
```

#### 2. KEEP Button Handler (Line 29439)
**Removed conditional turn switching:**
```javascript
// BEFORE
if (multiplayerMode && myPlayerColor !== 'both') {
    broadcastTurnEndMultiplayer(); // Only broadcast, don't switch
} else {
    switchTurn(); // Only in single-player
}

// AFTER
switchTurn(); // ALWAYS switch turn
```

## Testing Checklist
- [x] Single-player mode still works
- [ ] Online multiplayer (room codes) still works
- [ ] Challenge multiplayer turn display updates correctly
- [ ] BLACK player can see WHITE's moves
- [ ] WHITE player can see BLACK's moves
- [ ] Turn notifications show correctly
- [ ] KEEP button ends turn properly
- [ ] Rotation + KEEP ends turn properly

## Related Commits
- `c410fd7` - Fix turn display in challenge multiplayer
- `09926d6` - Added turn notifications for challenge games (previous fix)
- `ad09224` - Improved WebSocket connection reliability (previous fix)
- `01ce468` - Fixed move broadcasting gameId mismatch (previous fix)
- `4a66be1` - Fixed color assignment (previous fix)

## Notes
- The `game:moveUpdate` handler still has an early return for the player's own moves (line 21331), which prevents double-application of moves
- The server still broadcasts moves to all players in the room, ensuring synchronization
- Turn switching is now **immediate and local**, with server data used only for opponent moves

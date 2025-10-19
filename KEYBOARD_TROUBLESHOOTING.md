# ⌨️ Keyboard Navigation - Troubleshooting & Testing Guide

## Quick Test

1. **Open** https://romgon.net
2. **Start a game** (select Player 1 vs Player 2 or Player 1 vs AI)
3. **Look for** an indicator in the top-right corner showing:
   - `⌨️ KB: Player 1 (Black)` or similar
4. **Try pressing** arrow keys or WASD to control pieces

## Expected Behavior

### What Should Happen
- **Indicator appears** in top-right showing current player
- **Help overlay** appears in bottom-left showing keyboard controls
- **Arrow keys/WASD work** to select and move pieces
- **Piece highlights** with cyan glow when selected
- **Console shows** debug messages (F12 to open)

### What To Check

#### 1. UI Elements Visible?
- **Top-right**: Should see `⌨️ KB: Player X (Color)`
- **Bottom-left**: Should see keyboard controls list
- If NOT visible: Check browser console for errors

#### 2. Keyboard Events Firing?
- **Open browser console**: F12 → Console tab
- **Press arrow key**: Should see `[KeyboardNav]` messages
- **Example output**:
  ```
  [KeyboardNav] Player 1 pressed: Right
  [KeyboardNav] Selected first black piece at [3, 4]
  [KeyboardNav] Piece moved to: [3, 5]
  ```

#### 3. Piece Selection Working?
- **Press UP arrow**: First black piece should highlight with cyan outline
- **Press DOWN/LEFT/RIGHT**: Should navigate around board
- **Press ESCAPE**: Highlight should disappear

#### 4. Full Game Integration?
- **After movement**: Board should update
- **Captures work**: Opponent pieces should disappear
- **Turns switch**: Control should move to opponent
- **Win condition**: Game should detect checkmate/win

## Debug Mode

Debug mode is **enabled by default** and shows console messages.

### To Disable Debug
Edit browser console:
```javascript
window.keyboardNav.debugMode = false;
```

### To Enable Detailed Logging
```javascript
window.keyboardNav.debugMode = true;
```

## Console Commands

### Check System Status
```javascript
// See if keyboard system loaded
console.log(typeof window.KeyboardNavigationSystem);  // Should be 'function'
console.log(typeof window.keyboardNav);  // Should be 'object'

// Get current state
console.log(window.keyboardNav.getState());

// Example output:
// {
//   activePlayer: 1,
//   selectedPiece: {row: 3, col: 4},
//   enabled: true
// }
```

### Manual Test
```javascript
// Select first piece
window.keyboardNav.selectFirstPlayerPiece();

// Check if selected
window.keyboardNav.getState();

// Move piece right
window.keyboardNav.handleMovement(0, 1, 'Right');

// Get new state
window.keyboardNav.getState();
```

## Browser Console Errors

### Common Issues

#### `KeyboardNavigationSystem is not defined`
- **Cause**: Script didn't load
- **Fix**: 
  - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
  - Check Network tab in DevTools - look for `keyboard-navigation.js`
  - Verify file downloads successfully (should see 200 status code)

#### `kb-player-indicator not found`
- **Cause**: HTML element missing from body
- **Fix**:
  - Inspect HTML (F12 → Elements)
  - Search for `kb-player-indicator`
  - Should be in `<body>` near top

#### Arrow keys don't work
- **Cause**: Event not firing or page loses focus
- **Fix**:
  - Click on page before pressing arrow keys
  - Open browser console - see if `[KeyboardNav]` appears
  - Try letter keys (W, A, S, D) instead

#### Piece doesn't highlight
- **Cause**: Selection working but CSS not applied
- **Fix**:
  - Check if `.kb-selected` CSS class exists
  - Inspect element (F12 → Elements → click piece)
  - Look for `style="outline: 3px solid #4ecdc4"`

## Testing Checklist

- [ ] **Indicator visible** in top-right
- [ ] **Help text visible** in bottom-left  
- [ ] **Arrow Up** works (↑) selects piece
- [ ] **Arrow Down** works (↓) navigates
- [ ] **Arrow Left** works (←) navigates
- [ ] **Arrow Right** works (→) navigates
- [ ] **WASD keys** work as alternative
- [ ] **Space bar** confirms moves
- [ ] **Enter key** confirms moves
- [ ] **Escape** deselects pieces
- [ ] **Piece highlights** with cyan glow
- [ ] **Player indicator updates** after moves
- [ ] **Captures work** (opponent pieces disappear)
- [ ] **Turns switch** properly
- [ ] **Player 2 sees correct view** (rotated)
- [ ] **Player 2 arrow keys feel natural** from opposite side
- [ ] **Console shows debug messages**

## Network Issues

### Script Files Not Loading?
Check Network tab in DevTools (F12 → Network):

1. **Look for**: 
   - `keyboard-navigation.js` ✅ 200 OK
   - `keyboard-game-integration.js` ✅ 200 OK

2. **If showing 404 or timeout**:
   - Files may not be deployed yet
   - Wait 2-5 minutes for GitHub Pages to update
   - Hard refresh: Ctrl+Shift+R
   - Check repo: https://github.com/romgon-coder/Romgon/

3. **If cache issue**:
   - Clear browser cache (Ctrl+Shift+Delete)
   - Try private/incognito window
   - Add `?v=3` to URL: https://romgon.net/?v=3

## Mobile Testing

⚠️ **Note**: Keyboard navigation designed for desktop keyboards

For mobile:
- Tap on pieces to select (drag-drop)
- Keyboard won't work on touchscreen
- Physical Bluetooth keyboard may work

## Performance Considerations

- Keyboard system adds ~5KB JS (minified)
- Minimal CPU impact
- No network requests after initial load
- Memory: ~1MB per game session

## Accessibility

- ✅ Works with physical keyboards
- ✅ Works with keyboard navigation apps
- ✅ Screen readers: Compatible with standard keyboard shortcuts
- ⚠️ Color blind: Cyan highlight may be hard to see - consider enabling high contrast mode

## Reporting Issues

If keyboard controls don't work:

1. **Check console**:
   - F12 → Console tab
   - Look for red errors
   - Copy/paste errors in bug report

2. **Include in report**:
   - Browser name and version
   - What keys you pressed
   - What you expected to happen
   - What actually happened
   - Screenshots if possible
   - Console error messages

3. **Example report**:
   ```
   Browser: Chrome 119.0
   OS: Windows 11
   Issue: Arrow keys don't move pieces
   
   Console shows:
   ERROR: hex-3-4 element not found
   
   Expected: Piece moves right
   Actual: Nothing happens
   ```

## Quick Restart

If keyboard system stops working:

1. **Reload page**: F5 or Cmd+R
2. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Clear cache**: Ctrl+Shift+Delete
4. **Try incognito**: Ctrl+Shift+N

## Video of Usage

Keyboard controls should work like this:

```
1. Press ↑ Arrow → First piece highlights
2. Press → Arrow → Piece moves right  
3. Press → Arrow → Piece moves right again
4. Press Space → Move confirms, turn switches
5. Player 2 sees board rotated 180°
6. Player 2 presses ↑ → Feels like moving "up" from their view
7. System rotates it to match game state
```

## Still Need Help?

1. **Enable debug**: Window loads with debug=true by default
2. **Read console**: F12 → Console shows all actions
3. **Check status**: Run `window.keyboardNav.getState()` in console
4. **Report**: Include console output and browser info

---

**Last Updated**: October 19, 2025
**Version**: 2025-10-19-003+
**Status**: Active and Deployed

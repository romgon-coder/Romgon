# 🧪 Testing Checklist for Casual Engine & Game Info Modal

## Quick Start

**Local Server URL:**
```
http://127.0.0.1:5500/deploy/game-creator.html
```

---

## Test 1: Game Creator Enhancements ✅

### Engine Selector:
1. [ ] Open Game Creator
2. [ ] Go to **Step 4: Game Rules & Features**
3. [ ] Find **"🎯 Game Engine Selection"** section
4. [ ] Click dropdown - should show 3 options:
   - 🏰 Classic Romgon Engine
   - 🎮 Casual/Puzzle Engine  
   - 🔀 Hybrid Engine
5. [ ] Select each option
6. [ ] Verify info box updates with correct description
7. [ ] Check that features list changes for each engine

**Expected:**
- Dropdown works smoothly
- Info text updates instantly
- All 3 engines have unique descriptions

---

## Test 2: Random Game Generator 🎲

### Generate Random Game:
1. [ ] Go to **Step 5: Test & Publish**
2. [ ] Click **"🎲 Generate Random Game"** button at top
3. [ ] Confirm when prompted
4. [ ] Verify it navigates to Step 1 (pieces)
5. [ ] Check that 3-6 pieces were created
6. [ ] Go to Step 3 (board)
7. [ ] Verify board has colored zones
8. [ ] Check special zone icons (emojis) visible on hexes

**Expected:**
- Confirmation dialog appears
- Random data generated (name, pieces, zones)
- Board displays with zones
- Zone legend shows only used zones
- Each generation creates different results

### Test Multiple Generations:
1. [ ] Click random generator 3 times
2. [ ] Verify each time creates different:
   - Game name
   - Number of pieces
   - Board size
   - Zone distribution
   - Active mechanics

**Expected:**
- Each generation is unique
- No errors in console
- Previous data is replaced

---

## Test 3: Game Info Modal (In-Game) ℹ️

### Open Game Info During Play:
1. [ ] Start any game (PvP or vs AI)
2. [ ] Wait for game to load
3. [ ] Click **≡ menu button** (top-left of screen)
4. [ ] Menu panel should slide out from right
5. [ ] Scroll down to find **ℹ️ Game Info** button
6. [ ] Click the Game Info button
7. [ ] Verify modal opens with game information

**Expected:**
- Menu panel opens smoothly
- Game Info button visible
- Modal appears centered
- Content is readable

### Check Modal Content:
1. [ ] **🎯 Objective Section:**
   - Should show win condition
   - Text makes sense for current game
   
2. [ ] **🗺️ Zone Guide:**
   - 5 classic zones always visible:
     - 🔵 Base Zone
     - 🟣 Inner Zone
     - 🔷 Middle Zone
     - 🟢 Outer Zone
     - ⚫ Dead Zone
   - Each has icon and description
   
3. [ ] **✨ Special Mechanics** (if applicable):
   - Only appears if game has special zones
   - Shows relevant zones with icons
   - Descriptions are clear
   
4. [ ] **🎮 Active Mechanics:**
   - Lists enabled game mechanics
   - Falls back to default if none
   
5. [ ] **⌨️ Quick Controls:**
   - Shows control reference
   - All actions listed

**Expected:**
- All sections visible
- Content is properly formatted
- Icons display correctly
- Text is readable on dark background

### Close Modal:
1. [ ] Click **✖️** button (top-right)
2. [ ] Verify modal closes
3. [ ] Click ℹ️ button again
4. [ ] Click **"Got It!"** button at bottom
5. [ ] Verify modal closes

**Expected:**
- Both close buttons work
- Modal disappears smoothly
- Can reopen without issues

---

## Test 4: Custom Game with Special Zones 🎨

### Create Custom Game with Zones:
1. [ ] Go to Game Creator
2. [ ] Create a simple game
3. [ ] In Step 3 (Board Config), select special zones:
   - Enable "Teleport Zones"
   - Enable "Goal Zones"
   - Enable "Collectibles"
4. [ ] In Step 3 (Board Designer):
   - Select "Special Mechanic Zone to Paint"
   - Choose "🌀 Teleport Zone"
   - Click 2-3 hexes to paint them
   - Choose "🎯 Goal Zone"
   - Paint 1 hex
   - Choose "⭐ Collectible"
   - Paint 3-4 hexes
5. [ ] Verify emojis appear on painted hexes
6. [ ] Check Zone Legend Preview updates
7. [ ] Publish game

**Expected:**
- Emojis visible on hexes
- Zone legend shows only used zones
- Multiple zones can be painted per hex (classic + special)

### Play Custom Game:
1. [ ] Load the custom game
2. [ ] Click ℹ️ Game Info button
3. [ ] Verify Special Mechanics section appears
4. [ ] Check that it shows:
   - 🌀 Teleport Zone
   - 🎯 Goal Zone
   - ⭐ Collectible
5. [ ] Verify descriptions match what you painted

**Expected:**
- Modal detects custom zones
- Shows only zones actually used
- Descriptions are accurate

---

## Test 5: Engine Selector Persistence 💾

### Save and Load Game Config:
1. [ ] Create a game
2. [ ] Select **"🎮 Casual/Puzzle Engine"**
3. [ ] Add some mechanics (collectibles, timed mode)
4. [ ] Click **"🔍 Preview Configuration"**
5. [ ] Find `metadata.gameEngine` in JSON
6. [ ] Verify it says `"casual"`
7. [ ] Click **"💾 Download JSON"**
8. [ ] Open downloaded file
9. [ ] Confirm engine is saved

**Expected:**
- Engine choice saved in config
- JSON shows correct engine type
- File downloads successfully

---

## Test 6: Casual Engine File 📁

### Verify File Exists:
1. [ ] Check `deploy/casual-engine.js` exists
2. [ ] Check `public/casual-engine.js` exists
3. [ ] Open file in editor
4. [ ] Verify it contains `class CasualGameEngine`
5. [ ] Check it has ~480 lines of code

**Expected:**
- File exists in both locations
- Contains complete CasualGameEngine class
- No syntax errors

### Console Test:
1. [ ] Open browser dev tools (F12)
2. [ ] Go to Console tab
3. [ ] Type:
   ```javascript
   fetch('/deploy/casual-engine.js').then(r => r.text()).then(code => {
     console.log('Casual engine loaded:', code.includes('CasualGameEngine'));
   });
   ```
4. [ ] Press Enter
5. [ ] Should log: `Casual engine loaded: true`

**Expected:**
- File loads successfully
- No 404 errors
- Contains expected code

---

## Test 7: Responsive Design 📱

### Test Modal on Different Sizes:
1. [ ] Open Game Info modal
2. [ ] Press F12 (dev tools)
3. [ ] Click device toolbar icon
4. [ ] Test on different screen sizes:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
5. [ ] Verify modal scales properly
6. [ ] Check all text is readable

**Expected:**
- Modal adapts to screen size
- No horizontal scrolling needed
- Buttons are clickable
- Text doesn't overflow

---

## Test 8: Error Handling 🔧

### Test with Missing Config:
1. [ ] Start a regular PvP game
2. [ ] Open browser console (F12)
3. [ ] Type: `window.currentGameConfig = null;`
4. [ ] Press Enter
5. [ ] Click ℹ️ Game Info button
6. [ ] Verify modal opens with defaults
7. [ ] Should show "Eliminate all opponent pieces or capture their base"

**Expected:**
- Modal doesn't crash
- Falls back to default content
- No console errors
- Still functional

### Test Multiple Opens/Closes:
1. [ ] Open Game Info modal
2. [ ] Close it
3. [ ] Repeat 5 times quickly
4. [ ] Check for memory leaks in console
5. [ ] Verify modal still works

**Expected:**
- No lag or slowdown
- Modal opens/closes smoothly
- No duplicate modals
- No console warnings

---

## Common Issues & Solutions

### Issue: Game Info button not visible
**Solution:** 
- Make sure you clicked the ≡ menu button first
- Panel should slide out from right side
- Button is after "Game Help" button

### Issue: Modal shows empty content
**Solution:**
- Check `window.currentGameConfig` is set
- Verify game config has proper structure
- Check browser console for errors

### Issue: Special zones don't appear in modal
**Solution:**
- Verify special zones were painted on board
- Check config has `board.specialZones` object
- Ensure zones are in supported list

### Issue: Emojis not displaying
**Solution:**
- Update browser to latest version
- Check emoji font support
- Verify HTML character encoding is UTF-8

---

## Success Criteria ✅

**All tests pass if:**
- [x] Engine selector works and saves choice
- [x] Random generator creates valid games
- [x] Game Info button appears in menu
- [x] Modal opens and displays content
- [x] Special zones detected and shown
- [x] Mechanics list generated correctly
- [x] Both close buttons work
- [x] No console errors during any test
- [x] Files exist in deploy and public folders
- [x] Casual engine file loads successfully

---

## Performance Benchmarks

**Target Times:**
- Modal open: < 100ms
- Modal close: < 100ms
- Random generation: < 500ms
- Zone detection: < 50ms
- Config parse: < 20ms

**Test in Console:**
```javascript
console.time('modal-open');
showGameInfoModal(window.currentGameConfig);
console.timeEnd('modal-open');
```

---

## Next Steps After Testing

1. [ ] Fix any bugs found
2. [ ] Optimize performance if needed
3. [ ] Add missing features
4. [ ] Update documentation
5. [ ] Commit to git
6. [ ] Push to production
7. [ ] Monitor for errors

---

## 🎉 Testing Complete!

Once all tests pass, you're ready to:
1. Commit changes to git
2. Push to Railway
3. Announce new features
4. Gather user feedback

**Testing URL:**
http://127.0.0.1:5500/deploy/game-creator.html

**Happy Testing! 🚀**

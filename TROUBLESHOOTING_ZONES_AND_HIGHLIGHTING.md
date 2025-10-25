# Troubleshooting: No Zones or Move Highlighting

## Issue Summary
When playing a custom game in `play.html`, you experience:
1. **❌ All hexagons show same color** (no zone differentiation)
2. **❌ No move highlighting** when clicking pieces

## Root Causes

### Problem 1: No Zone Colors
**Symptom:** All hexagons are orange (#f57d2d - middle zone)

**Console shows:**
```
🔷 Zones: 0 zones
🎨 Applied zone-middle to hex 0-0
🎨 Applied zone-middle to hex 0-1
...
```

**Root Cause:** The game was saved with an **empty zones object** (`zones: {}`)

**Why:** The **Zone Painting Tool** was never used during game creation in Step 3: Board Designer

---

### Problem 2: No Move Highlighting
**Symptom:** Clicking pieces doesn't show green/red highlights

**Console shows:**
```
✅ Selected Pawn at (3,2)
⚠️ No movement data found for piece: Pawn
```

**Root Cause:** Pieces have **no movement patterns defined**

**Why:** Movement patterns were not configured in Step 2: Movement Patterns

---

## Solutions

### Fix 1: Add Zone Colors

#### Step-by-Step in Game Creator

1. **Navigate to Step 3: Board Designer**
   - You'll see the hexagonal board canvas

2. **Locate the Tool Buttons**
   - Look for: "Delete Hex", "Paint Zone", "Place Shape"

3. **Click "Paint Zone" Button (🎨)**
   - A dropdown will appear: "Zone to Paint"

4. **Select Zone Type**
   ```
   Base Zone (Starting Positions) - Brown #8b4513
   Inner Zone - Dark Brown #6d3a13
   Middle Zone (Battlefield) - Orange #f57d2d ← Default
   Outer Zone (Edge) - Light Orange #fcc49c
   Dead Zone - Black #333333
   ```

5. **Click Hexagons to Paint**
   - Each click paints the hex with selected zone
   - Console shows: `Hex 3-5 set to base zone ✓`

6. **Verify Zones Saved**
   - Continue through steps
   - In Step 5 before publishing, check console:
     ```javascript
     gameData.board.zones // Should NOT be empty
     ```

7. **Publish Game**
   - Zones will be saved in game configuration

#### Example Zone Layout
```
Row 0-2:  Base zones (player 1 starting area)
Row 3-7:  Middle zones (battlefield)
Row 8-10: Base zones (player 2 starting area)
Edges:    Outer zones or Dead zones
```

---

### Fix 2: Add Movement Patterns

#### Step-by-Step in Game Creator

1. **Navigate to Step 2: Movement Patterns**
   - You'll see each piece you created in Step 1

2. **For Each Piece, Click "Edit Movement"**
   - A pattern designer opens

3. **Define Move Pattern**
   - Click hexagons around center to set valid moves
   - **Green = Regular moves** (empty spaces)
   - **Red = Attack moves** (capture opponent pieces)

4. **Example Patterns**

   **King (moves 1 hex in any direction):**
   ```
       R R R
      R · · · R
     R · · K · · R
      R · · · R
       R R R
   
   Green: All adjacent hexes
   Red: All adjacent hexes
   ```

   **Pawn (moves forward, attacks diagonal):**
   ```
         R   R
          ↖ ↑ ↗
         R P R
   
   Green: Forward 1 hex
   Red: Diagonal forward
   ```

   **Knight (L-shape jump):**
   ```
       R     R
     G   G G   G
       G K G
     G   G G   G
       R     R
   
   Green: 2 forward + 1 side (4 positions)
   Red: Same pattern
   ```

5. **Save Pattern**
   - Click "Save Movement Pattern"
   - Pattern is stored as hardcoded offsets:
     ```javascript
     {
       hardcodedMove: [
         {rowOffset: -1, colOffset: 0},
         {rowOffset: 1, colOffset: 0},
         ...
       ],
       hardcodedAttack: [...]
     }
     ```

6. **Repeat for All Pieces**
   - Every piece needs a movement pattern!

---

## Verification Checklist

### Before Publishing
- [ ] All pieces have movement patterns defined
- [ ] Board has zones painted (not all same color)
- [ ] Piece placements are on appropriate zones
- [ ] Game features configured (Step 5)

### After Publishing
**Load game and check console:**

✅ **Zones Working:**
```
🔷 Zones: 5 zones
🎨 Applied zone-base to hex 0-0
🎨 Applied zone-inner to hex 2-3
🎨 Applied zone-middle to hex 5-5
```

✅ **Movement Working:**
```
✅ Selected King at (3,2)
🔍 Attempting to highlight moves
🎯 Movement data: {hardcodedMove: Array(6), hardcodedAttack: Array(6)}
🟢 Processing hardcodedMove patterns
  → Trying to highlight move hex-2-2: ✅ Found
  → Trying to highlight move hex-4-2: ✅ Found
💡 Successfully highlighted 6 moves, 6 attacks
```

❌ **Zones Missing:**
```
🔷 Zones: 0 zones
🎨 Applied zone-middle to hex 0-0  ← All same!
```
**Fix:** Repaint zones in Game Creator

❌ **Movement Missing:**
```
✅ Selected King at (3,2)
⚠️ No movement data found for piece: King
```
**Fix:** Define movement patterns in Game Creator

---

## Technical Details

### Zone Data Format (OLD)
Game Creator saves:
```javascript
{
  zones: {
    '0-0': 'base',
    '0-1': 'base',
    '5-5': 'middle'
  }
}
```

### Zone Data Format (NEW)
Some systems use:
```javascript
{
  zones: {
    base: ['0-0', '0-1', '1-0'],
    middle: ['5-5', '5-6']
  }
}
```

**play.html supports BOTH formats automatically!**

### Movement Data Format
```javascript
{
  name: "King",
  shape: "hexagon",
  color: "white",
  movement: {
    hardcodedMove: [
      {rowOffset: -1, colOffset: 0},  // Up
      {rowOffset: 1, colOffset: 0},   // Down
      {rowOffset: 0, colOffset: -1},  // Left
      {rowOffset: 0, colOffset: 1}    // Right
    ],
    hardcodedAttack: [
      {rowOffset: -1, colOffset: 0},
      {rowOffset: 1, colOffset: 0}
    ]
  }
}
```

---

## Common Mistakes

### ❌ Mistake 1: Skipping Zone Painting
**Symptom:** "I created the board but all hexes are orange"
**Solution:** Use the Zone Paint tool! It's not automatic.

### ❌ Mistake 2: Not Saving Movement Patterns
**Symptom:** "I clicked the hexes but nothing highlights"
**Solution:** Click "Save Movement Pattern" button after designing!

### ❌ Mistake 3: Forgetting Some Pieces
**Symptom:** "My King moves but my Pawn doesn't"
**Solution:** Define movement for EVERY piece!

### ❌ Mistake 4: No Attack Pattern
**Symptom:** "I can't capture enemy pieces"
**Solution:** Define attack patterns (red hexes) in Movement Designer

---

## Quick Fix Workflow

If your game has issues, follow this workflow:

1. **Open Game Creator**
2. **Step 1: Shapes** - Verify all pieces exist
3. **Step 2: Movement** - Define patterns for EACH piece
4. **Step 3: Board** - Use Zone Paint tool to color zones
5. **Step 4: Placement** - Place pieces on board
6. **Step 5: Features** - Enable features you want
7. **Publish** - Save the game
8. **Test in Game Library** - Load and click pieces
9. **Check Console (F12)** - Verify zones and movement data

---

## Still Not Working?

### Debug Commands

Open browser console (F12) and paste:

```javascript
// Check if zones exist
console.log('Zones:', currentGameConfig.board.zones);

// Check piece movement
console.log('Pieces:', currentGameConfig.pieces.map(p => ({
  name: p.name,
  hasMovement: !!p.movement,
  moveCount: p.movement?.hardcodedMove?.length || 0,
  attackCount: p.movement?.hardcodedAttack?.length || 0
})));

// Check game features
console.log('Features:', currentGameConfig.rules);
```

### Expected Output

✅ **Working Game:**
```javascript
Zones: {0-0: 'base', 0-1: 'base', 5-5: 'middle'}

Pieces: [
  {name: 'King', hasMovement: true, moveCount: 6, attackCount: 6},
  {name: 'Pawn', hasMovement: true, moveCount: 1, attackCount: 2}
]

Features: {showPreview: true, enableDragDrop: true, ...}
```

❌ **Broken Game:**
```javascript
Zones: {}  ← PROBLEM!

Pieces: [
  {name: 'King', hasMovement: false, moveCount: 0, attackCount: 0}  ← PROBLEM!
]
```

---

## Related Documentation

- **Game Creator Guide:** `START_HERE.md`
- **Movement Pattern System:** `ROMGON_HARDCODED_PIECE_MOVES.md`
- **Game Features:** `GAME_FEATURES_IMPLEMENTATION.md`
- **Board Configuration:** `HEXAGON_DIMENSIONS_GUIDE.md`

---

## Summary

| Issue | Root Cause | Solution |
|-------|------------|----------|
| No zone colors | Zones not painted | Use Zone Paint tool in Step 3 |
| No highlights | No movement patterns | Define patterns in Step 2 |
| Can't drag pieces | Drag & Drop disabled | Enable in Step 5 features |
| Can't capture | No attack patterns | Add red hexes in Movement Designer |

**Remember:** The Game Creator has ALL the tools you need. You just have to USE them! 🎨🎮

# ROMGON Keyboard Navigation System v2 - Multi-Phase Controls

## Overview
This redesigned keyboard system uses a **multi-phase approach** where each game step has dedicated controls:

---

## Control Scheme

### **PHASE 1: Piece Selection** 🎯
*Choose which piece to move*

| Key | Action |
|-----|--------|
| **W** | Previous piece |
| **S** | Next piece |
| **A** | Previous piece |
| **D** | Next piece |
| **E** | ✅ Confirm selection |
| **Escape** | Cancel |

**UI Indicator**: Blue background with "🎯 Piece Selection"

**How it works**:
1. Press any WASD key to start navigating your pieces
2. The system highlights the current piece
3. Press E to confirm and move to the next phase

---

### **PHASE 2: Move Selection** 📍
*Choose where to move the selected piece*

| Key | Action |
|-----|--------|
| **W** | Previous highlighted move |
| **S** | Next highlighted move |
| **A** | Previous highlighted move |
| **D** | Next highlighted move |
| **Space** | ✅ Confirm move destination |
| **R** | (Future) Enter rotation mode |
| **Escape** | ← Back to piece selection |

**UI Indicator**: Green background with "📍 Move Selection"

**How it works**:
1. After confirming piece selection, all valid moves are highlighted on the board
2. Use WASD to cycle through the highlighted destination hexes
3. Press Space to confirm the destination
4. If your piece is rotatable (Triangle, Hexagon), enter Phase 3
5. If not rotatable, move executes immediately

---

### **PHASE 3: Rotation Selection** 🔄
*Choose rotation for rotatable pieces (Triangle, Hexagon)*

| Key | Action |
|-----|--------|
| **W** | Rotate Left (←) |
| **A** | Rotate Left (←) |
| **D** | Rotate Right (→) |
| **S** | Rotate Right (→) |
| **E** | ⚙️ Confirm rotation choice |
| **Space** | ✅ Execute move with selected rotation |
| **Escape** | ← Back to move selection |

**UI Indicator**: Orange background with "🔄 Rotation" and visual choices

**Rotation Options**:
- **LEFT** (←): Rotate piece 60° counter-clockwise
- **KEEP** (↕): Keep original orientation
- **RIGHT** (→): Rotate piece 60° clockwise

**How it works**:
1. After move selection, if piece is rotatable, you enter rotation mode
2. Use WASD to navigate between LEFT/KEEP/RIGHT options
3. Press E to confirm your rotation choice
4. Press Space to execute the move with selected rotation

---

## Full Example Flow

### Playing as Black (Player 1):

```
START → Press W
  ↓
Phase 1: Piece Selection (Blue)
  - Black piece highlighted
  - Press E
  ↓
Phase 2: Move Selection (Green)
  - Valid moves highlighted on board
  - Press WASD to navigate
  - Press Space
  ↓
Phase 3: Rotation (Orange) [if piece is Triangle/Hexagon]
  - Rotation options shown
  - Press WASD to choose
  - Press Space to execute
  ↓
Move complete → Turn switches to White (Player 2)
  - Keyboard auto-syncs
  - Start with piece selection...
```

---

## Key Features

### ✅ **Auto-Sync with Game Turns**
- Keyboard automatically detects when turn changes
- `activePlayer` updates from game's `currentPlayer`
- Piece colors automatically match current player

### ✅ **Player 2 180° Rotation**
- When it's White's turn, WASD inputs are rotated 180°
- Everything feels natural from each player's perspective
- Board coordinates are translated automatically

### ✅ **Easy Navigation**
- WASD for all movement (forward/backward, left/right)
- Phase system prevents misclicks
- Escape key always goes back one phase

### ✅ **Visual Feedback**
- Phase indicator shows current state and instructions
- Color-coded phases for quick recognition
- Selected pieces and moves highlighted on board

### ✅ **Compatible with Mouse**
- Keyboard and mouse work together
- Can switch between them mid-game
- No conflicts with drag-drop

---

## Phase Indicator UI

The keyboard system displays a **persistent indicator** at the bottom-left of the screen:

```
⌨️ Press any key to start - WASD to select piece, E to confirm
🎯 Piece Selection: WASD to navigate, E to confirm
📍 Move Selection: WASD to navigate, SPACE to confirm
🔄 Rotation: WASD to choose (Left/Keep/Right), SPACE to execute
```

Color changes with phase:
- **Gray** (#666): Idle - waiting to start
- **Blue** (#0066cc): Piece selection
- **Green** (#009933): Move selection
- **Orange** (#ff6b00): Rotation selection

---

## CSS Classes for Styling

The system uses these CSS classes for highlighting:

- `.kb-piece-selected` - Currently selected piece
- `.kb-move-navigating` - Currently highlighted move destination

You can customize styling in your CSS:

```css
.kb-piece-selected {
  border: 3px solid #ffff00;
  box-shadow: 0 0 10px #ffff00;
}

.kb-move-navigating {
  border: 2px solid #00ff00;
  background: rgba(0, 255, 0, 0.2);
}
```

---

## Developer Notes

### State Management
Access current keyboard state programmatically:

```javascript
const state = window.keyboardNav.getState();
console.log(state.phase);           // 'pieceSelection', 'moveSelection', 'rotationSelection'
console.log(state.activePlayer);    // 1 (Black) or 2 (White)
console.log(state.selectedPiece);   // { row, col }
console.log(state.selectedMove);    // { row, col }
console.log(state.rotationChoice);  // 'left', 'keep', 'right'
```

### Debug Mode
Enable detailed console logging:

```javascript
window.keyboardNav = new KeyboardNavigationSystemV2({ debug: true });
```

### Disable Keyboard
Temporarily disable keyboard input:

```javascript
window.keyboardNav.setEnabled(false);
window.keyboardNav.setEnabled(true);
```

### Manual Phase Control
Switch phases manually:

```javascript
window.keyboardNav.phase = 'moveSelection';
window.keyboardNav.syncWithGameTurn();
window.keyboardNav.resetPhase();
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Keyboard doesn't respond | Check browser console for errors; ensure game is fully loaded |
| Turn doesn't sync | Game's `currentPlayer` variable may not exist; check game initialization |
| Rotation not working | Verify piece is Triangle or Hexagon class |
| Can't navigate moves | Ensure all valid moves are highlighted; check `showMovementPattern()` |
| Escaping doesn't work | Try from moveSelection phase; idleSelection doesn't go further back |

---

## Compatibility

- ✅ Works with all rotatable pieces (Triangle, Hexagon)
- ✅ Works with non-rotatable pieces (Square, Rhombus, Circle)
- ✅ Compatible with Player 1 and Player 2
- ✅ Works alongside mouse drag-drop
- ✅ No interference with existing game mechanics

---

## Version History

- **v2.0** (2025-10-19): Multi-phase control scheme redesign
  - Separated piece selection from move selection
  - Added dedicated rotation phase for rotatable pieces
  - Improved phase indicators and visual feedback
  - Better turn synchronization

- **v1.0** (2025-10-xx): Original single-phase keyboard system
  - Basic arrow key navigation
  - Single-step piece and move selection

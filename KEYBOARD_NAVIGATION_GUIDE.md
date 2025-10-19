# ⌨️ Keyboard Navigation & Player 2 Rotation Implementation

**Topic**: How to implement keyboard navigation with proper handling for Player 2 (white) on a hexagonal board  
**Status**: Design Document - Ready for Implementation  
**Complexity**: Medium

---

## 🎯 Problem Statement

In a PvP game on a hexagonal board:
- Player 1 (Black) sees the board in normal orientation
- Player 2 (White) sees the board rotated 180°
- Both players should use intuitive controls (arrow keys feel natural from their perspective)
- Challenge: Keeping game logic consistent while rotating player perspective

---

## 🔷 Hexagonal Coordinate System

ROMGON uses the **Axial Coordinate System (q, r)** for hex positions:

```
        (0,-3)
      /        \
  (-1,-2)    (1,-2)
    /  \      /  \
(-2,-1)(0,-1)(2,-1)
  \    /  \    /
 (-2,0)(0,0)(2,0)    ← Red pieces (Player 1 - Black)
  /    \    /  \
(-2,1) (0,1)(2,1)
  \     /  \    /
  (-1,2)    (1,2)
    \      /
      (0,3)           ← White pieces (Player 2 - White)
```

**Key Properties**:
- q increases going right →
- r increases going down ↓
- Hexagon neighbors are 6 directions: NW, NE, E, SE, SW, W

---

## ⌨️ Control Mapping Strategy

### Option A: Input Mapping (RECOMMENDED for PvP)

**Concept**: Players use the same keys, but inputs are rotated for Player 2.

**Player 1 (Black) - Normal View**:
```
        ↑ ArrowUp
        
  ↑    up    ↑
   \   |    /
   A ← + → D    (ArrowLeft, ArrowRight)
    \  |  /
   S   ↓   W
        ArrowDown
```

**Player 2 (White) - 180° Rotated View**:
```
When Player 2 presses ArrowUp, it should feel like "forward" from their rotated perspective.
From their view:
- ArrowUp = moves down-right (from normal board view)
- ArrowDown = moves up-left
- ArrowLeft = moves up-right
- ArrowRight = moves down-left
```

**Implementation**:
```javascript
// Unified movement in axial coordinates
const NORMAL_MOVES = {
  'ArrowUp': { dq: 0, dr: -1 },    // NW direction
  'ArrowDown': { dq: 0, dr: 1 },   // SE direction
  'ArrowLeft': { dq: -1, dr: 0 },  // W direction
  'ArrowRight': { dq: 1, dr: 0 },  // E direction
  
  // Alternative WASD controls
  'w': { dq: 0, dr: -1 },
  'a': { dq: -1, dr: 0 },
  's': { dq: 0, dr: 1 },
  'd': { dq: 1, dr: 0 },
};

function getMovementDelta(key, playerNumber) {
  let delta = NORMAL_MOVES[key.toLowerCase()];
  
  if (!delta) return null;
  
  // For Player 2, rotate 180° by negating both coordinates
  if (playerNumber === 2) {
    return { 
      dq: -delta.dq, 
      dr: -delta.dr 
    };
  }
  
  return delta;
}

// Usage:
const newPos = {
  q: currentPos.q + delta.dq,
  r: currentPos.r + delta.dr
};
```

---

### Option B: Relative Controls (Alternative)

**Concept**: Each player has their own control scheme based on visual board orientation.

```javascript
const PLAYER_1_CONTROLS = {
  'ArrowUp': { dq: 0, dr: -1 },
  'ArrowLeft': { dq: -1, dr: 0 },
  'ArrowDown': { dq: 0, dr: 1 },
  'ArrowRight': { dq: 1, dr: 0 },
};

const PLAYER_2_CONTROLS = {
  'ArrowUp': { dq: 0, dr: 1 },      // Opposite of Player 1
  'ArrowLeft': { dq: 1, dr: 0 },    // Opposite of Player 1
  'ArrowDown': { dq: 0, dr: -1 },   // Opposite of Player 1
  'ArrowRight': { dq: -1, dr: 0 },  // Opposite of Player 1
};

function getMovementDelta(key, playerNumber) {
  const controls = playerNumber === 1 ? PLAYER_1_CONTROLS : PLAYER_2_CONTROLS;
  return controls[key];
}
```

**Verdict**: Same result as Option A, but more explicit.

---

## 🎨 Visual Board Rotation

### Option C: Rotate Canvas for Player 2

If you want to display the board rotated 180° for Player 2's view:

```javascript
function renderGameBoard(activePlayer) {
  const canvas = document.getElementById('game-board');
  const ctx = canvas.getContext('2d');
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Save canvas state
  ctx.save();
  
  // Rotate for Player 2
  if (activePlayer === 2) {
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI); // 180 degrees
    ctx.translate(-centerX, -centerY);
  }
  
  // Draw all hexagons (coordinate system unchanged)
  for (let q = -3; q <= 3; q++) {
    for (let r = -3; r <= 3; r++) {
      const valid = Math.abs(q) + Math.abs(r) + Math.abs(-q-r) <= 6;
      if (valid) {
        drawHexagon(q, r, ctx);
      }
    }
  }
  
  // Draw pieces
  drawAllPieces(ctx);
  
  // Restore canvas state
  ctx.restore();
}
```

**Important**: ALL game logic remains unchanged. Only visual rendering is rotated.

---

## 🎮 Complete Implementation Example

### 1. Hex Position Class

```javascript
class HexPosition {
  constructor(q, r) {
    this.q = q;
    this.r = r;
    this.s = -q - r; // Third coordinate for validation
  }
  
  // Get neighboring hex in direction
  getNeighbor(direction) {
    const directions = {
      'N': { dq: 0, dr: -1 },   // North
      'NE': { dq: 1, dr: -1 },  // Northeast
      'SE': { dq: 1, dr: 0 },   // Southeast
      'S': { dq: 0, dr: 1 },    // South
      'SW': { dq: -1, dr: 1 },  // Southwest
      'NW': { dq: -1, dr: 0 },  // Northwest
    };
    
    const delta = directions[direction];
    if (!delta) return null;
    
    return new HexPosition(
      this.q + delta.dq,
      this.r + delta.dr
    );
  }
  
  // Check if valid board position
  isValid() {
    return Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s) <= 6;
  }
  
  equals(other) {
    return this.q === other.q && this.r === other.r;
  }
}
```

### 2. Keyboard Handler

```javascript
class KeyboardNavigator {
  constructor(gameBoard) {
    this.gameBoard = gameBoard;
    this.activePlayer = 1;
    this.selectedPiece = null;
    
    this.setupKeyListeners();
  }
  
  setupKeyListeners() {
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e.key);
    });
  }
  
  handleKeyPress(key) {
    const delta = this.getMovementDelta(key, this.activePlayer);
    
    if (!delta) return;
    
    // Update selected piece position
    if (this.selectedPiece) {
      const newPos = new HexPosition(
        this.selectedPiece.position.q + delta.dq,
        this.selectedPiece.position.r + delta.dr
      );
      
      if (newPos.isValid()) {
        this.selectedPiece.position = newPos;
        this.gameBoard.render(this.activePlayer);
        
        // Highlight possible moves
        this.showValidMoves(this.selectedPiece);
      }
    }
  }
  
  getMovementDelta(key, playerNumber) {
    const normalMoves = {
      'ArrowUp': { dq: 0, dr: -1 },
      'ArrowDown': { dq: 0, dr: 1 },
      'ArrowLeft': { dq: -1, dr: 0 },
      'ArrowRight': { dq: 1, dr: 0 },
      'w': { dq: 0, dr: -1 },
      'a': { dq: -1, dr: 0 },
      's': { dq: 0, dr: 1 },
      'd': { dq: 1, dr: 0 },
    };
    
    let delta = normalMoves[key.toLowerCase()];
    if (!delta) return null;
    
    // Rotate for Player 2 (180°)
    if (playerNumber === 2) {
      return { dq: -delta.dq, dr: -delta.dr };
    }
    
    return delta;
  }
  
  selectPiece(hexPos) {
    this.selectedPiece = this.gameBoard.getPieceAt(hexPos);
  }
  
  switchPlayer() {
    this.activePlayer = this.activePlayer === 1 ? 2 : 1;
    this.selectedPiece = null; // Deselect on player switch
  }
  
  showValidMoves(piece) {
    const moves = piece.getValidMoves();
    this.gameBoard.highlightHexes(moves);
  }
}
```

### 3. Game Board Renderer

```javascript
class GameBoard {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.pieces = new Map(); // Map<"q,r", Piece>
    this.hexSize = 40;
  }
  
  render(activePlayer) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    
    // Rotate for Player 2
    if (activePlayer === 2) {
      const cx = this.canvas.width / 2;
      const cy = this.canvas.height / 2;
      
      this.ctx.translate(cx, cy);
      this.ctx.rotate(Math.PI);
      this.ctx.translate(-cx, -cy);
    }
    
    // Draw hexagons
    this.drawBoard();
    
    // Draw pieces
    this.drawPieces();
    
    this.ctx.restore();
  }
  
  drawBoard() {
    for (let q = -3; q <= 3; q++) {
      for (let r = -3; r <= 3; r++) {
        const valid = Math.abs(q) + Math.abs(r) + Math.abs(-q-r) <= 6;
        if (valid) {
          this.drawHexagon(q, r);
        }
      }
    }
  }
  
  drawHexagon(q, r) {
    const pos = this.pixelFromHex(q, r);
    
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = pos.x + this.hexSize * Math.cos(angle);
      const y = pos.y + this.hexSize * Math.sin(angle);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.stroke();
  }
  
  pixelFromHex(q, r) {
    const x = this.hexSize * (3/2 * q);
    const y = this.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
    
    return {
      x: this.canvas.width / 2 + x,
      y: this.canvas.height / 2 + y
    };
  }
  
  drawPieces() {
    for (let [key, piece] of this.pieces) {
      const pos = this.pixelFromHex(piece.position.q, piece.position.r);
      this.drawPiece(piece, pos);
    }
  }
  
  drawPiece(piece, pos) {
    this.ctx.fillStyle = piece.color === 'black' ? '#333' : '#fff';
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, this.hexSize / 3, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // Draw border
    this.ctx.strokeStyle = piece.color === 'black' ? '#fff' : '#333';
    this.ctx.stroke();
  }
  
  getPieceAt(hexPos) {
    return this.pieces.get(`${hexPos.q},${hexPos.r}`);
  }
  
  highlightHexes(hexes) {
    // Implementation for highlighting valid moves
  }
}
```

### 4. Usage

```javascript
// Initialize game board
const canvas = document.getElementById('game-board');
const gameBoard = new GameBoard(canvas);

// Initialize keyboard navigator
const navigator = new KeyboardNavigator(gameBoard);

// Add some test pieces
gameBoard.pieces.set('0,0', new Piece('black', new HexPosition(0, 0)));
gameBoard.pieces.set('2,2', new Piece('white', new HexPosition(2, 2)));

// Render initial board
gameBoard.render(1);

// Game loop: switch players after move confirmation
function confirmMove() {
  // Apply move logic
  gameBoard.render(navigator.activePlayer);
  navigator.switchPlayer();
  gameBoard.render(navigator.activePlayer);
}
```

---

## 🧪 Testing Scenarios

### Test Case 1: Player 1 Navigation
```
Player 1 (Black) presses ArrowRight
Expected: Piece moves from (0,0) → (1,0)
Actual: ✓ Should match
```

### Test Case 2: Player 2 Navigation
```
Player 2 (White) presses ArrowRight
Expected: Piece moves from (0,0) → (-1,0)  [opposite of Player 1]
Actual: ✓ Should match
```

### Test Case 3: Board Rotation
```
Player 1 sees:  Piece at (1,0) is to the RIGHT
Player 2 sees:  Same piece appears to the LEFT (rotated view)
After Player 2 presses ArrowRight: Piece moves to (-1,0)
Visual result: Piece moves to the RIGHT in Player 2's rotated view
Actual: ✓ Should match
```

### Test Case 4: Edge Cases
```
- Piece at edge moving out of bounds
  → Movement blocked, no state change
  
- Rapid key presses
  → Only last valid direction taken
  
- Player switching
  → Previous selection cleared
  → Controls immediately reversed
  
- Diagonal movements (if implemented)
  → Consistent 180° rotation for Player 2
```

---

## 🚀 Implementation Roadmap

### Phase 1: Basic Keyboard Input
- [ ] Implement `HexPosition` class with neighbor calculation
- [ ] Add basic arrow key listener
- [ ] Map keys to coordinate deltas
- [ ] Update piece position on keypress
- **Time**: 1-2 hours

### Phase 2: Player 2 Rotation Logic
- [ ] Add player number tracking
- [ ] Modify delta calculation to rotate for Player 2
- [ ] Test both player controls work
- **Time**: 30 minutes

### Phase 3: Visual Board Rotation
- [ ] Implement canvas rotation for Player 2 view
- [ ] Ensure visual matches input controls
- [ ] Test board appearance matches controls
- **Time**: 1 hour

### Phase 4: Move Validation & UI
- [ ] Add boundary checking
- [ ] Implement move highlighting
- [ ] Add visual feedback (selected piece indicator)
- [ ] Add player indicator (whose turn)
- **Time**: 2-3 hours

### Phase 5: Integration with Game Logic
- [ ] Connect to existing piece movement system
- [ ] Add move confirmation/rejection
- [ ] Handle piece captures
- [ ] Test full game flow
- **Time**: 2-3 hours

**Total Estimated Time**: 6-10 hours for complete implementation

---

## 🎯 Recommendation

**Use Option A (Input Mapping) for your PvP implementation**:

✅ Pros:
- Players use same controls (familiar)
- Single movement delta system
- Easy to maintain
- Intuitive from both perspectives

❌ Cons:
- Requires conceptual understanding of coordinate rotation
- Board rotation (if visual) adds complexity

**Quick Start**:
1. Copy the `KeyboardNavigator` class
2. Modify your piece movement to call `getMovementDelta()`
3. Add canvas rotation to render function
4. Test both players

---

## 📚 References

- **Hexagonal Grids**: https://www.redblobgames.com/grids/hexagons/
- **Axial Coordinates**: https://www.redblobgames.com/grids/hexagons/#coordinates
- **Canvas Rotation**: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate

---

**Status**: Ready for Implementation  
**Last Updated**: October 19, 2025  
**Complexity**: Medium (straightforward with clear examples)

# Game Rules

Complete guide to playing ROMGON, the hexagonal strategy board game.

## 📋 Table of Contents

- [Board Setup](#board-setup)
- [Pieces](#pieces)
- [Movement Rules](#movement-rules)
- [Win Conditions](#win-conditions)
- [Special Rules](#special-rules)
- [Game Flow](#game-flow)

## 🎲 Board Setup

### Board Structure
- **Shape:** Hexagonal grid
- **Size:** 7 rows with varying columns
- **Total Hexes:** 49 hexagons
- **Row Configuration:**
  - Row 0: 6 hexes
  - Row 1: 7 hexes
  - Row 2: 8 hexes
  - Row 3: 9 hexes (center)
  - Row 4: 8 hexes
  - Row 5: 7 hexes
  - Row 6: 6 hexes

### Starting Positions

**White Pieces (Row 0):**
```
0-0: Square
1-0: Triangle
2-0: Circle
3-0: Rhombus (King)
4-0: Hexagon
5-0: Triangle
6-0: Square
```

**Black Pieces (Rows 5-6):**
```
0-5: Square
1-6: Triangle
2-7: Hexagon
3-8: Rhombus (King)
4-7: Circle
5-6: Triangle
6-5: Square
```

## 🎯 Pieces

Each player has **7 pieces** with unique movement patterns:

### Piece Values
- **Rhombus (King):** 1000 points - Most valuable
- **Triangle:** 6 points - Directional attacker
- **Hexagon:** 5 points - Flexible movement
- **Circle:** 4 points - Zone-based movement
- **Square:** 3 points - L-shaped jumper

### Piece Counts
- **2 Squares** - Left and right flanks
- **2 Triangles** - Directional attackers
- **1 Rhombus** - King (win condition)
- **1 Circle** - Special zone movement
- **1 Hexagon** - Central flexible piece

## 🚶 Movement Rules

### General Rules
1. **Turn-based** - Players alternate turns
2. **One action per turn** - Move OR rotate OR flip (in flip mode)
3. **Capture by replacement** - Move to opponent's hex to capture
4. **No friendly fire** - Cannot capture your own pieces
5. **Mandatory move** - Must make a legal move if available

### Movement Validation
- ✅ Must move to valid target hex based on piece type
- ✅ Target hex must be empty OR contain opponent piece
- ✅ Cannot move to hex occupied by friendly piece
- ✅ Cannot move off the board
- ❌ Rhombus cannot capture rhombus (special rule)

### Piece-Specific Movement

See [Piece Movement Patterns](Piece-Movement-Patterns) for detailed diagrams and examples.

**Square:**
- L-shaped movement (like chess knight)
- Can jump over other pieces
- 2 hexes in one direction, then 1 hex perpendicular

**Triangle:**
- Directional movement (rotation matters!)
- Moves in direction it's pointing
- White triangles: Move forward (increasing row/col)
- Black triangles: Move backward (decreasing row/col)

**Rhombus (King):**
- One hex in any direction (6 adjacent hexes)
- Most important piece
- Cannot capture opponent rhombus
- Protected piece (lose if captured)

**Circle:**
- Zone-based movement
- Different movement zones based on board position
- Cannot enter dead zone (3-3, 3-4, 3-5) in flip mode

**Hexagon:**
- Flexible movement pattern
- Can rotate for different options
- Multi-directional capabilities

## 🏆 Win Conditions

### Primary Win Conditions

**1. Rhombus Capture**
- Capture opponent's rhombus
- Instant win
- Most common win condition

**2. Base Capture**
- Move your rhombus to opponent's starting base
- White base: 3-8
- Black base: 3-0
- Instant win

**3. Stalemate**
- 200 moves reached without win
- Result: Draw
- Rare occurrence

### Game Over Scenarios

```
IF opponent rhombus captured THEN
    Winner: Current player
    Reason: "Rhombus captured"

ELSE IF rhombus reached opponent base THEN
    Winner: Current player
    Reason: "Base captured"

ELSE IF moves >= 200 THEN
    Winner: Draw
    Reason: "Move limit"
END IF
```

## ⚡ Special Rules

### Rhombus Protection
- **Cannot capture opponent rhombus** with your rhombus
- Other pieces CAN capture rhombus
- Rhombus is vulnerable to all other pieces

### Dead Zone (Flip Mode Only)
- **Positions:** 3-3, 3-4, 3-5 (center row)
- **Fortress Strategy:** Pieces in dead zone can flip to become safe
- **Circle Restriction:** Circles cannot enter dead zone in flip mode
- **Tactical Value:** +30-50 points in AI evaluation

### Check Rules (Flip Mode)
- When rhombus is in check (under attack):
  - **Standard:** Only rhombus can move
  - **Flip Mode Exception:** Rhombus can make moves that expose it to check (because player can RELEASE before confirming)

### Move Priority
1. **Capture moves** - Higher value
2. **Advance moves** - Push rhombus forward
3. **Safe moves** - Avoid threats
4. **Development moves** - Improve position

## 🎮 Game Flow

### 1. Game Start
```
1. Board is initialized with standard setup
2. White moves first
3. Timer starts (if applicable)
4. Players alternate turns
```

### 2. Turn Structure
```
EACH TURN:
  1. Select your piece
  2. View legal moves (highlighted)
  3. Choose destination OR rotation
  4. Confirm move
  5. Turn passes to opponent
```

### 3. Action Types

**Move:**
- Select piece → Select destination → Confirm
- Captures opponent piece if on destination

**Rotate (if piece supports rotation):**
- Select piece → Click rotate button → Confirm
- Changes piece orientation for different attack patterns

**Flip (Flip Mode only):**
- Select piece → Click flip button
- Enables omnidirectional 6-hex attack
- Creates flip state (flipped vs unflipped)

**Keep (Flip Mode only):**
- Maintain current flip state
- Used with rotation

**Release (Flip Mode only):**
- Cancel flip action
- Return to normal state

### 4. Move Validation

```javascript
function isValidMove(piece, from, to):
  // Check piece ownership
  IF piece.color != currentPlayer THEN
    RETURN false

  // Check movement pattern
  IF !isPieceMovementValid(piece.type, from, to) THEN
    RETURN false

  // Check target hex
  targetPiece = board[to]
  IF targetPiece AND targetPiece.color == currentPlayer THEN
    RETURN false // Cannot capture own piece

  // Flip mode: Check flip state matching
  IF flipModeEnabled AND targetPiece THEN
    IF piece.flipped != targetPiece.flipped THEN
      RETURN false // Cannot attack different flip state

  // Special: Rhombus cannot capture rhombus
  IF piece.type == 'rhombus' AND targetPiece.type == 'rhombus' THEN
    RETURN false

  RETURN true
```

## 📊 Scoring & Rating

### ELO Rating System
- **Starting Rating:** 1200
- **Rating Tiers:**
  1. Beginner: < 1000
  2. Novice: 1000-1199
  3. Intermediate: 1200-1399
  4. Advanced: 1400-1599
  5. Expert: 1600-1799
  6. Master: 1800-1999
  7. Grandmaster: 2000+

### Rating Calculation
```javascript
// K-factor: 32 for new players, 24 for rated
expectedScore = 1 / (1 + 10^((opponentRating - yourRating) / 400))
newRating = oldRating + K * (actualScore - expectedScore)

// actualScore: 1 (win), 0.5 (draw), 0 (loss)
```

### AI Rating
- **AI Rating:** 1600 (fixed)
- Used for ELO calculation in single-player games

## 🎯 Strategy Tips

### Opening
- ✅ Control center hexes (3-3, 3-4, 3-5, 3-6)
- ✅ Develop all pieces (don't just move rhombus)
- ✅ Protect rhombus early
- ❌ Don't overextend pieces
- ❌ Don't leave rhombus exposed

### Midgame
- ✅ Create threats against opponent pieces
- ✅ Coordinate pieces (multiple attackers)
- ✅ Trade when ahead in material
- ✅ Push rhombus when safe
- ❌ Don't trade when behind

### Endgame
- ✅ Push rhombus toward opponent base
- ✅ Use remaining pieces to clear path
- ✅ Control dead zone in flip mode
- ✅ Calculate forcing moves
- ❌ Don't rush rhombus into danger

### Flip Mode Strategy
- ✅ Flip to escape threats (change flip state)
- ✅ Use dead zone as fortress
- ✅ Coordinate flip states (group flipped pieces)
- ✅ Omnidirectional attack value (+10 points)
- ❌ Don't isolate single flipped piece
- ❌ Don't flip circle in dead zone

## 🔍 Move Notation

### Position Format
```
Format: "row-col"
Examples:
  0-0: Top-left corner (white square)
  3-4: Center (dead zone)
  3-8: Black base
```

### Move Notation
```
Format: "from→to [C]"
Examples:
  0-0→1-1: Square moves from 0-0 to 1-1
  2-3→3-4 C: Piece captures at 3-4
  3-4→3-5: Rhombus moves to dead zone
```

## 📱 Interface Controls

### Desktop
- **Select Piece:** Click piece
- **Move:** Click destination hex
- **Rotate:** Click rotate button (if available)
- **Flip:** Click flip button (flip mode)
- **Cancel:** Click piece again or press Esc

### Keyboard (PVP Mode)
- **WASD:** Navigate pieces
- **Space:** Execute move
- **R:** Rotate
- **Shift:** Flip (flip mode)

## ❓ FAQ

**Q: Can I undo a move?**
A: No, moves are final once confirmed.

**Q: What happens if I have no legal moves?**
A: This is rare. If it occurs, you must pass (or game ends in stalemate).

**Q: Can I capture my own pieces?**
A: No, friendly fire is not allowed.

**Q: Why can't rhombus capture rhombus?**
A: Special rule to prevent direct king confrontation.

**Q: How does flip mode change the game?**
A: See [Flip Mode Mechanics](Flip-Mode-Mechanics) for detailed explanation.

**Q: Can pieces move through other pieces?**
A: Only squares (L-shaped jump). Other pieces need clear path.

**Q: What is the dead zone?**
A: Positions 3-3, 3-4, 3-5. Special fortress area in flip mode.

---

**Next Steps:**
- Learn [Piece Movement Patterns](Piece-Movement-Patterns)
- Explore [Flip Mode Mechanics](Flip-Mode-Mechanics)
- Play online at https://romgon.net

**Related Pages:**
- [Home](Home)
- [Flip Mode Mechanics](Flip-Mode-Mechanics)
- [AI Implementation](AI-Implementation)

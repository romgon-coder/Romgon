# ROMGON Game - Beta v0.1 Documentation

## Overview
ROMGON is a strategic board game featuring 5 unique piece types with complex movement patterns, rotation mechanics, and tactical gameplay on a hexagonal grid board.

---

## Game Board
- **Hexagonal grid layout**: 7 rows (0-6) with varying column counts
- **Special zones**:
  - **Dead Zone**: Central positions (3-3, 3-4, 3-5) - strategic center positions
  - **Inner Perimeter**: Positions surrounding dead zone (4-2, 4-3, 4-4, 4-5, 2-2, 2-3, 2-4, 2-5)
  - **Outer Perimeter**: Edge positions
- **Visual coordinate display**: Shows position numbers (e.g., "3-4") on each hexagon

---

## Piece Types & Movement

### 1. Square Piece
- **Basic Movement**: Orthogonal movement (adjacent hexagons)
- **Special Abilities**: Standard movement and attack in same directions
- **Strategic Role**: Basic unit with predictable movement

### 2. Triangle Piece
- **Rotation System**: 6 visual orientations (0-5) with 3 unique movement patterns
- **Rotation Repetition**: Orientations 3-5 repeat patterns 0-2 respectively
- **Position-Specific Patterns**: Different movement patterns based on board position
- **Color Variants**:
  - White triangles: Face toward black pieces
  - Black triangles: Face toward white pieces
- **Rotation Control**: Can rotate left/right during turn (affects movement pattern)
- **Movement Patterns**: Vary by row position (rows 0-6 have unique patterns)

### 3. Rhombus Piece (King)
- **Win Condition**: Must reach opponent's base to win
  - White Rhombus: Must reach position 3-8
  - Black Rhombus: Must reach position 3-0
- **Standard Movement**: Orthogonal movement pattern
- **Special Ability - Diagonal Movement**:
  - Can move diagonally between Dead Zone and Inner Perimeter
  - **Movement-Only**: Diagonal moves CANNOT capture (purple highlight)
  - **Bidirectional**: Works both ways (dead zone ↔ inner perimeter)
- **Restriction**: Cannot capture other rhombuses
- **Checkmate Protection**: Illegal to make moves that put own rhombus under attack (unless capturing attacker)

### 4. Circle Piece
- **Movement Pattern**: Unique circular/curved movement pattern
- **Strategic Role**: Specialized movement for flanking

### 5. Hexagon Piece
- **Rotation System**: 6 visual orientations (0-5) with 3 unique movement patterns
- **Rotation Repetition**: Orientations 3-5 repeat patterns 0-2 respectively
- **Comprehensive Patterns**: Position-specific and rotation-aware movement
- **Rotation Control**: Can rotate left/right during turn
- **Complete Implementation**: All rows (0-5) with all positions have hardcoded patterns

---

## Rotation Mechanics

### Triangle Rotation
- **6 Orientations**: Visual angles at 0°, 60°, 120°, 180°, 240°, 300°
- **3 Unique Patterns**: Orientations repeat in pairs (0/3, 1/4, 2/5)
- **Row-Specific Patterns**: Different for each row (0-6)
- **Position-Specific**: Some rows have unique patterns per column position

### Hexagon Rotation
- **Complete Coverage**:
  - **Row 0**: 6 positions (col 0-5), 3 rotations each
  - **Row 1**: 7 positions (col 0-6), 3 rotations each
  - **Row 2**: 8 positions (col 0-7), 3 rotations each
  - **Row 3**: 9 positions (col 0-8), 3 rotations each
  - **Row 4**: 8 positions (col 0-7), 3 rotations each
  - **Row 5**: 7 positions (col 0-6), 3 rotations each
- **Pattern Format**: Offset-based `[rowOffset, colOffset]` converted to absolute coordinates
- **Orientation Pairing**: Uses `||` conditions (orientation === 0 || orientation === 3)

---

## Visual Highlight System

### Movement Highlights
- **Green Highlight** (`highlight-green`): Valid movement positions (empty hexagons)
- **Red Highlight** (`highlight-red`): Attack/capture positions (opponent pieces)
- **Purple Highlight** (`highlight-diagonal`): Rhombus diagonal movement (movement-only, no attack)
- **Orange/Danger Highlight** (`highlight-danger`): Piece under threat warning

### Threat Detection
- **Real-time Analysis**: Shows which pieces are under attack
- **Turn-Based Updates**: Recalculates after each move
- **Visual Warning**: Orange highlight on threatened pieces

---

## Game Rules & Systems

### Turn System
- **Two Players**: White pieces vs Black pieces
- **One Action Per Turn**: Move OR rotate one piece per turn
- **Turn Tracking**: System prevents multiple actions per turn
- **Piece Lock**: Once a piece is selected/moved, no other piece can act that turn

### Capture System
- **Attack Method**: Move to hexagon occupied by opponent piece
- **Capture Display**: Eliminated pieces shown in sidebar
- **Special Rules**:
  - Rhombus cannot capture another rhombus
  - Diagonal rhombus moves cannot capture
- **Sound Effect**: Plays capture sound on successful capture

### Action Tracking
- **Per-Piece Tracking**: Records moved, attacked, rotated status
- **Rotation Limits**: Can rotate before or after moving (with restrictions)
- **Attack Restrictions**: Cannot rotate after attacking

### Win Conditions
1. **Rhombus Reaches Base**:
   - White rhombus reaches position 3-8
   - Black rhombus reaches position 3-0
2. **Win Detection**: Automatic detection and announcement
3. **Victory Sound**: Plays win sound effect

### Checkmate System
- **Illegal Move Prevention**: Cannot make moves that expose own rhombus to attack
- **Exception**: Can make such moves ONLY if capturing the attacking piece
- **Real-time Validation**: Checks before allowing move execution

---

## Audio System

### Sound Effects
1. **Click Sound** (`click.mp3`): Piece movement
2. **Captured Sound** (`captured.mp3`): Piece capture
3. **Win Sound** (`win.mp3`): Victory condition met

### Audio Management
- **Initialization**: Audio preloaded on page load
- **Volume Control**: Adjustable volume levels
- **Event Triggers**: Sounds play on specific game events

---

## User Interface

### Rotation Controls
- **Visibility**: Shows only for Triangle and Hexagon pieces
- **Buttons**:
  - "Rotate Left" (⟲): Counterclockwise rotation
  - "Rotate Right" (⟳): Clockwise rotation
- **Dynamic Display**: Appears/disappears based on selected piece
- **Turn Integration**: Rotation counts as piece action for the turn

### Drag-and-Drop System
- **Piece Selection**: Click and drag any piece
- **Movement Preview**: Highlights shown on drag start
- **Drop Validation**: Only allows drops on highlighted hexagons
- **Visual Feedback**: Pieces snap to hexagon centers

### Eliminated Pieces Display
- **Sidebar Panel**: Shows captured pieces for both players
- **Visual Representation**: Displays piece type and color
- **Persistent Display**: Remains visible throughout game

---

## Multiplayer Support

### Server Integration
- **Node.js Server** (`server.js`): WebSocket-based multiplayer
- **Move Broadcasting**: Sends moves to opponent in real-time
- **Synchronization**: Keeps both players' boards in sync
- **Turn Management**: Coordinates turn-taking between players

### Network Features
- **Real-time Updates**: Instant move transmission
- **Connection Status**: Tracks player connections
- **Move Validation**: Server validates moves before broadcasting

---

## AI Opponent System

### AI Implementation
The game includes a basic AI opponent for single-player mode with strategic evaluation.

### AI Capabilities

**Strategic Awareness**:
- ✅ **Win Condition Recognition**: AI knows to push rhombus to position 3-8 for victory
- ✅ **Threat Detection**: Evaluates if pieces are under attack before moving
- ✅ **Self-Preservation**: Won't make moves that expose rhombus to capture
- ✅ **Defensive Play**: Blocks opponent's rhombus from reaching their goal
- ✅ **Tactical Threats**: Actively creates threats on opponent pieces
- ✅ **Capture Evaluation**: Prioritizes valuable captures (Triangle > Hexagon > Circle > Square)
- ✅ **Positional Play**: Values center control and forward positioning
- ✅ **Mobility Assessment**: Prefers moves that maintain piece flexibility

**Difficulty Levels**:
1. **Easy**: Random move selection from bottom 50% of evaluated moves
2. **Medium**: Random move selection from top 50% of evaluated moves
3. **Hard**: Always selects best evaluated move

**Move Evaluation Scoring**:
- Win detection: +100,000 points
- Avoid walking into threats: -2,000 points
- Escape rhombus from danger: +1,500 points
- Block threat to own rhombus: +1,000 points
- Threaten opponent rhombus: +600 points
- Escape piece from danger: +300 points
- Capture opponent piece: +120-150 points
- Rhombus advancement to goal: +15 points per step closer
- Center control: +30-50 points
- Threaten opponent pieces: +40 points each
- Forward progress: +15 points

### Current AI Limitations

**Missing Features**:
- ❌ **No Strategic Rotation**: AI doesn't actively rotate Triangle/Hexagon pieces for tactical advantage
- ❌ **No Stalemate Detection**: Can't recognize or avoid stalemate positions
- ❌ **No Repetition Detection**: No 3-fold or 5-fold repetition draw logic
- ❌ **No Position History**: Doesn't track previous board states
- ❌ **Single Move Depth**: Only evaluates immediate moves, no multi-move planning
- ❌ **No Opening Theory**: No knowledge of strong opening positions
- ❌ **No Endgame Patterns**: No specialized endgame strategy

**Rotation Handling**:
- AI uses pieces' current rotation state for move generation
- Does NOT actively rotate pieces to gain tactical advantage
- Triangle and Hexagon moves are based on their current orientation
- Rotation actions are not considered in AI decision-making

**Future AI Improvements Needed**:
1. Add rotation evaluation to move scoring
2. Implement stalemate detection algorithm
3. Track position history for repetition detection
4. Add multi-move lookahead (minimax or similar)
5. Create opening position database
6. Implement endgame tablebase
7. Add time management for competitive play

---

## Technical Implementation

### Core Functions

#### Movement Pattern Functions
- `getSquareTargets(row, col)`: Returns valid square moves
- `getRotatedTriangleTargets(row, col, orientation, isWhite)`: Returns rotation-aware triangle moves
- `getRhombusMoves(row, col)`: Returns rhombus moves including diagonal ability
- `getCircleMoves(row, col)`: Returns circle movement pattern
- `getRotatedHexgonTargets(row, col, orientation, isWhite)`: Returns rotation-aware hexagon moves
- `getHexgonMoves(row, col, rotation)`: Base hexagon movement (fallback)

#### Attack Validation Functions
- `canSquareAttack(fromRow, fromCol, toRow, toCol)`: Validates square attacks
- `canTriangleAttack(fromRow, fromCol, toRow, toCol, isWhite)`: Validates triangle attacks with rotation
- `canRhombusAttack(fromRow, fromCol, toRow, toCol)`: Validates rhombus attacks (excludes diagonal)
- `canCircleAttack(fromRow, fromCol, toRow, toCol)`: Validates circle attacks
- `canHexgonAttack(fromRow, fromCol, toRow, toCol)`: Validates hexagon attacks with rotation

#### Highlight Functions
- `showSquareMovementPattern(centerRow, centerCol)`: Displays square move highlights
- `showTriangleMovementPattern(centerRow, centerCol)`: Displays triangle move highlights
- `showRhombusMovementPattern(centerRow, centerCol)`: Displays rhombus move highlights (includes purple diagonal)
- `showCircleMovementPattern(centerRow, centerCol)`: Displays circle move highlights
- `showHexgonMovementPattern(centerRow, centerCol)`: Displays hexagon move highlights

#### Rotation Functions
- `getTriangleOrientation(hexId)`: Gets triangle's current rotation
- `setTriangleOrientation(hexId, orientation)`: Sets triangle rotation
- `updateTriangleVisual(hexId)`: Updates triangle visual display
- `rotateTriangleLeft(hexId)`: Rotates triangle counterclockwise
- `rotateTriangleRight(hexId)`: Rotates triangle clockwise
- `getHexgonOrientation(hexId)`: Gets hexagon's current rotation
- `setHexgonOrientation(hexId, orientation)`: Sets hexagon rotation
- `updateHexgonVisual(hexId)`: Updates hexagon visual display
- `rotateHexgonLeft(hexId)`: Rotates hexagon counterclockwise
- `rotateHexgonRight(hexId)`: Rotates hexagon clockwise

#### Game State Functions
- `isCurrentPlayerPiece(piece)`: Checks if piece belongs to current player
- `highlightAllPiecesUnderAttack()`: Shows threat warnings
- `isPieceUnderThreat(row, col, checkForWhite)`: Checks if position is under attack
- `wouldMoveResultInOwnCheckmate(fromId, toId, pieceClasses, existingPiece)`: Validates move legality
- `checkWinCondition(pieceClasses, targetRow, targetCol)`: Checks for victory
- `addToEliminatedPieces(piece)`: Adds captured piece to sidebar

#### Utility Functions
- `setupDragAndDrop()`: Initializes drag-and-drop system
- `initAudio()`: Preloads and initializes sound effects
- `playClickSound()`: Plays movement sound
- `playCapturedSound()`: Plays capture sound
- `playWinSound()`: Plays victory sound
- `broadcastMove(fromHexId, toHexId, pieceClasses, didCapture)`: Sends move to opponent

### Data Structures
- `triangleOrientations`: Map storing triangle rotations by hexId
- `hexgonOrientations`: Map storing hexagon rotations by hexId
- `pieceActions`: Map tracking piece actions per turn (moved, attacked, rotated)
- `currentTurnPiece`: Tracks which piece is active in current turn
- `selectedPiece`: Currently selected piece for rotation
- `draggedPiece`: Piece being dragged
- `draggedFromHex`: Original position of dragged piece
- `gameOver`: Boolean flag for game state

### Pattern Storage Format
- **Offset-based coordinates**: `[[rowOffset, colOffset], ...]`
- **Conversion to absolute**: `[row + rowOffset, col + colOffset]`
- **Orientation pairing**: `if (orientation === 0 || orientation === 3)`

---

## Asset Files

### Images
- Board: `ROMGON deluxe board2.png`, `numbered board.png`
- Black pieces: `circle black front.png`, `hexagon black front.png`, `Rhombus black front.png`, `square black front.png`, `Triangle black front.png`
- White pieces: `circle white front.png`, `hexagon white front.png`, `Rhombus white front.png`, `square white Front.png`, `Triangle white front.png`

### Audio
- `click.mp3`: Movement sound
- `captured.mp3`: Capture sound
- `win.mp3`: Victory sound

### Documentation
- `START_HERE.md`: Quick start guide
- `README_MULTIPLAYER.md`: Multiplayer setup instructions
- `Romgon Manual Flip Edition 2.pdf`: Full game manual

---

## Files Structure

### Main Game Files
- `ROMGON 2 SHAPES WORKING.html`: Main game file (Beta v0.1)
- `board.HTML`: Alternative board view
- `server.js`: Multiplayer server
- `package.json`: Node.js dependencies
- `claude-helpers.js`: Helper utilities

### Asset Folders
- `ASSETS/`: Game images and sounds
- `ROMGON HEX/`: Design files and reference materials
- `ROMGON RULES DELUXE P&P VERSION 1.1.9/`: Rule images (1-15.png)

---

## Known Features & Behaviors

### Movement Patterns
1. **Rhombus Diagonal Ability**:
   - Purple highlights indicate movement-only (no capture)
   - Works bidirectionally between zones
   - Strategic positioning tool

2. **Rotation Impact**:
   - Changes available moves dramatically
   - Must be planned strategically
   - Counts as turn action

3. **Position-Specific Patterns**:
   - Board position affects available moves
   - Edge positions have limited options
   - Center positions have more mobility

### Strategic Elements
1. **Rhombus Protection**: Must keep rhombus safe from checkmate
2. **Rotation Timing**: When to rotate vs when to move
3. **Zone Control**: Importance of dead zone and inner perimeter
4. **Piece Coordination**: Using pieces together for attacks
5. **Diagonal Positioning**: Strategic use of rhombus diagonal ability

---

## Version History

### Beta v0.1 (Current)
**Completed Features**:
- ✅ All 5 piece types implemented
- ✅ Complete rotation system (triangles & hexagons)
- ✅ Position-specific movement patterns
- ✅ Rhombus diagonal movement ability
- ✅ Complete hexagon rotation patterns (all rows 0-5)
- ✅ Visual highlight system (green, red, purple, orange)
- ✅ Turn-based gameplay
- ✅ Capture system with display
- ✅ Win condition detection
- ✅ Checkmate prevention system
- ✅ Sound effects
- ✅ Multiplayer support
- ✅ Rotation controls UI
- ✅ Threat detection and display

**Pattern Coverage**:
- Row 0: 6 positions × 3 rotations = 18 patterns
- Row 1: 7 positions × 3 rotations = 21 patterns
- Row 2: 8 positions × 3 rotations = 24 patterns
- Row 3: 9 positions × 3 rotations = 27 patterns
- Row 4: 8 positions × 3 rotations = 24 patterns
- Row 5: 7 positions × 3 rotations = 21 patterns
- **Total Hexagon Patterns**: 135 unique position-rotation combinations

---

## Future Considerations

### Potential Enhancements
- **AI opponent enhancements**:
  - Rotation strategy (currently AI doesn't rotate pieces strategically)
  - Stalemate/deadlock detection
  - Draw by repetition detection (3-fold, 5-fold)
  - Opening book/position database
  - Endgame tablebase
- Move history/replay
- Save/load game state
- Tournament mode
- Time controls
- Move validation UI improvements
- Undo/redo functionality
- Tutorial mode
- Achievement system

### Current AI Limitations
**What AI Has**:
- ✅ Win condition awareness (recognizes winning moves to 3-8)
- ✅ Threat avoidance (won't walk into danger)
- ✅ Rhombus protection (defends own rhombus)
- ✅ Opponent rhombus blocking (interferes with opponent's path)
- ✅ Capture prioritization (values capturing pieces)
- ✅ Positional evaluation (prefers center control)
- ✅ Piece mobility scoring (values having more options)
- ✅ Threat generation (tries to threaten opponent pieces)
- ✅ Basic rotation awareness (uses current rotation state for moves)
- ✅ Three difficulty levels (Easy, Medium, Hard)

**What AI Lacks**:
- ❌ Strategic rotation decisions (doesn't actively rotate pieces for advantage)
- ❌ Stalemate/deadlock detection
- ❌ Draw by repetition detection (3-fold, 5-fold)
- ❌ Position repetition tracking
- ❌ Long-term planning (only evaluates individual moves)
- ❌ Opening theory knowledge
- ❌ Endgame patterns

**AI Evaluation Priorities** (in order):
1. **Win Detection** (+100,000): Recognizes instant win at position 3-8
2. **Threat Avoidance** (-2,000): Won't move into danger unless capturing
3. **Rhombus Safety** (+1,500): Escapes when rhombus is threatened
4. **Threat Blocking** (+1,000): Blocks threats to own rhombus
5. **Capture Bonus** (+120-150): Values capturing opponent pieces
6. **Opponent Rhombus Threat** (+600): Tries to threaten opponent's rhombus
7. **Escape from Danger** (+300): Moves threatened pieces to safety
8. **Rhombus Advancement** (+15 per step): Pushes rhombus toward goal
9. **Opponent Blocking** (+30 per distance): Blocks opponent's path
10. **Positional Control** (+30-50): Prefers center and row 3
11. **Piece Threats** (+40 each): Creates threats on opponent pieces
12. **Forward Progress** (+15): Moves toward opponent side


### Balance Testing
- Piece strength evaluation
- Opening position optimization
- Win rate analysis
- Strategy documentation

---

## ⚡ Advanced Features (Expert/Hidden)

- **Repetition Detection**: Three-fold repetition rule, draw offers, and visual warnings.
- **Base Defense System**: Prevents early base captures, toggleable in settings.
- **Threat Analysis**: Real-time threat and checkmate detection, highlights threatened pieces.
- **Show All Moves**: Toggle to display all legal moves and rotations for current player.
- **Defense Highlights**: Highlights pieces defended by others, optional toggle.
- **Dark Mode**: Switch between light/dark themes, remembers your preference.
- **Game Variants**: Blitz, Fog of War, King of the Hill (see Quick Reference for more).
- **Statistics Dashboard**: Win/loss tracking, piece performance, progress charts, personal records (planned).

---

## Credits

**Game Design**: Romgon Game System
**Beta v0.1 Implementation**: Comprehensive implementation of all core mechanics
**Documentation**: Complete technical and gameplay documentation

---

## Support & Contact

For questions, bug reports, or feedback about Romgon Beta v0.1, refer to:
- `START_HERE.md` for quick start
- `README_MULTIPLAYER.md` for multiplayer setup
- `Romgon Manual Flip Edition 2.pdf` for complete rules

---

**Last Updated**: Beta v0.1 - Full Implementation Complete
**Status**: Ready for Testing & Feedback

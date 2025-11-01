# 🎮 ROMGON Game Engine Architecture Map

## 🎯 Purpose
**This document is your control panel.** When you want to modify gameplay, UI, or mechanics, search this file for keywords to find the exact line numbers and function names.

---

## 📁 File Structure Overview

### **Primary Game File**
- **`public/index.html`** (29,891 lines) - **THIS IS THE REAL GAME ENGINE**
  - PvP multiplayer game screen
  - All core game logic
  - Movement validation
  - Win conditions
  - AI opponent
  - All UI panels and menus

### **Other Files (Secondary)**
- `deploy/index.html` - Copy for testing before deployment
- `play.html` - Custom game player (Game Maker platform)
- `game-creator.js` - Game Maker creation tool
- `casual-engine.js` - Non-combat game engine
- `romgon-engine-api.js` - API wrapper
- Various keyboard/modal files

---

## 🏗️ CORE ARCHITECTURE (`public/index.html`)

### **1. GAME INITIALIZATION FLOW**

```
User Action → Function Call → Line Number
```

#### **Starting a Game**
```
Lobby Click → Function → Line → What It Does
──────────────────────────────────────────────
"⚔️ PvP Local"   → startPvPLocal()       → ~16680  → Initializes 2-player local game
"🤖 vs AI"       → startAIGame()         → ~19835  → Initializes vs computer
"🛠️ Practice"    → startSandboxMode()    → ~16804  → Position editor mode
"⏱️ Timed"       → startGameWithTime()   → ~16680  → Game with timer
"🎯 Variant"     → startGameWithVariant()→ ~3285   → Special rule variants
```

#### **Initialization Chain**
```
1. startPvPLocal() / startAIGame() / startSandboxMode()
   ↓
2. initializeBoard(mode)              → Line 16144
   ↓
3. setupDragAndDrop()                 → Line ~15990
   ↓
4. updateTurnDisplay()                → Line ~XX
   ↓
5. Game loop begins (waiting for player input)
```

---

### **2. MOVEMENT SYSTEM (The Real Engine)**

#### **Drag & Drop Event Chain**
```
User drags piece → Event Sequence → Functions Called
────────────────────────────────────────────────────

1. MOUSEDOWN/TOUCHSTART on piece
   └─> addEventListener('dragstart')   → Line 15998, 27340, 27907
       └─> Sets draggedPiece variable
       └─> Highlights valid moves

2. DRAG OVER valid hex
   └─> addEventListener('dragover')    → Multiple locations
       └─> Shows drop indicator
       └─> Validates move legality

3. DROP on target hex
   └─> addEventListener('drop')        → Line 27533 (main)
       ├─> validateMove()              → Checks movement rules
       ├─> Capture opponent piece (if any)
       ├─> Move piece DOM element
       ├─> recordMoveRPN()             → Save to move history
       ├─> highlightLastMove()         → Visual feedback
       ├─> checkWinConditions()        → Line 25426
       ├─> switchTurn()                → Change active player
       └─> Update UI elements
```

#### **Movement Validation Functions**
| Function | Line | Purpose |
|----------|------|---------|
| `validateMove()` | Search needed | Checks if move matches piece's movement pattern |
| `isValidHexagonMove()` | Search needed | Hexagon piece special rules |
| `isValidTriangleMove()` | Search needed | Triangle piece special rules |
| `isValidSquareMove()` | Search needed | Square piece movement |
| `isValidRhombusMove()` | Search needed | Rhombus piece movement |
| `isValidCircleMove()` | Search needed | Circle piece movement |

---

### **3. PIECE TYPES & MOVEMENT RULES**

#### **Where Movement Rules Are Defined**

**Hardcoded Movement Patterns:**
```javascript
// Search for these in public/index.html:

// Triangle Movement (lines ~XXXX)
if (piece.classList.contains('triangle-piece')) {
    // Forward movement only
    // Different for white vs black
}

// Square Movement (lines ~XXXX)
if (piece.classList.contains('square-piece')) {
    // Orthogonal + diagonal
    // 1 space in any direction
}

// Hexagon Movement (lines ~XXXX)
if (piece.classList.contains('hexgon-piece')) {
    // Special 6-directional
    // Can rotate
}

// Rhombus Movement (lines ~XXXX)
if (piece.classList.contains('rhombus-piece')) {
    // Diagonal only
    // Long-range
}

// Circle Movement (lines ~XXXX)
if (piece.classList.contains('circle-piece')) {
    // Orthogonal only
    // Long-range
}
```

#### **Search Keywords to Find Piece Logic**
```
"triangle-piece" → Triangle movement & capture rules
"square-piece"   → Square movement & capture rules
"hexgon-piece"   → Hexagon movement & rotation
"rhombus-piece"  → Rhombus diagonal movement
"circle-piece"   → Circle orthogonal movement
```

#### **⚠️ CRITICAL: Attack vs Movement Patterns**

**RULE DISTINCTION:**

| Piece Type | Movement = Attack? | Special Rules |
|------------|-------------------|---------------|
| **Square** | ✅ YES | Movement and attack are identical |
| **Triangle** | ✅ YES | Movement and attack are identical |
| **Circle** | ✅ YES | Movement and attack are identical |
| **Hexagon** | ✅ YES | **Movement and attack are identical** |
| **Rhombus** | ❌ NO | **Has diagonal ESCAPE moves that cannot attack** |

**Key Functions:**

```javascript
// Line 14062: canSquareAttack() - uses same pattern as movement
// Line 14097: canWhiteTriangleAttack() - uses same pattern as movement
// Line 14117: canBlackTriangleAttack() - uses same pattern as movement
// Line 14143: canCircleAttack() - uses same pattern as movement
// Line 14224: canHexgonAttack() - uses getRotatedHexgonTargets() [SAME as movement]
// Line 14249: canRhombusAttack() - SPECIAL: excludes diagonal escape moves

// Movement Display Functions:
// Line 14926: showSquareMovementPattern()
// Line 14456: showTriangleMovementPattern()
// Line 15069: showRhombusMovementPattern() - shows diagonal escapes
// Line ~XXXX: showCircleMovementPattern()
// Line 28003: showHexgonMovementPattern() - uses getRotatedHexgonTargets()

// Shared Movement/Attack Function (Hexagon only):
// Line 22306: getRotatedHexgonTargets() - used for BOTH movement AND attack
```

**HEXAGON IMPLEMENTATION:**
- Function `canHexgonAttack()` calls `getRotatedHexgonTargets()` → Line 22306
- Function `showHexgonMovementPattern()` calls `getRotatedHexgonTargets()` → Line 22306
- **Result: Hexagons have NO escape-only moves**

**RHOMBUS IMPLEMENTATION (The Exception):**
- Rhombus pieces can use diagonal moves from Dead Zone ↔ Inner Perimeter
- These diagonal moves are for MOVEMENT ONLY (escape/positioning)
- Function `canRhombusAttack()` has special check that returns `false` for diagonal moves
- Search for: `isDiagonalMove` in canRhombusAttack() function

---

### **4. WIN CONDITIONS**

#### **Win Detection Function**
```javascript
// Line 25426 in public/index.html
function checkWinConditions(row, col, piece) {
    // Called after EVERY move
    // Checks:
    // 1. Base capture (hexagon piece in opponent's base)
    // 2. King elimination (all 5 piece types captured)
    // 3. No legal moves (stalemate)
    // 4. Rhombus deadlock (special case)
}
```

#### **Win Condition Locations**
| Condition | Search Keyword | Line |
|-----------|---------------|------|
| Base Capture | `checkBaseCapture` | ~25426 |
| King Capture | `checkKingCapture` or `allPiecesCaptured` | ~25426 |
| Stalemate | `checkStalemate` | ~25426 |
| Rhombus Deadlock | `checkRhombusDeadlock` | Search needed |

---

### **5. USER INTERFACE PANELS**

#### **Main Game Panels**
| Panel Name | ID | Line | Function |
|------------|-----|------|----------|
| **Lobby Menu** | `start-menu` | ~7300 | Game mode selection |
| **Board Container** | `board-display-container` | ~10650 | Main game board |
| **Sandbox Panel** | `sandbox-tools-panel` | ~10695 | Practice mode controls |
| **Camera Panel** | `camera-panel` | ~12800 | 3D camera controls |
| **Eliminated Pieces** | `eliminated-pieces-container` | ~10670 | Captured pieces display |
| **Turn Indicator** | `turn-display` | Search | Shows current player |
| **Timer Display** | `player-timers` | ~10660 | Game timer (if enabled) |
| **Move History** | `white-moves`, `black-moves` | ~10685 | Move list panels |

#### **Modal Dialogs**
| Modal | ID | Line | Purpose |
|-------|-----|------|---------|
| **Game Over** | `game-over-modal` | Search | Victory/defeat screen |
| **Settings** | `settings-modal` | Search | Game settings |
| **Pause Menu** | `pause-modal` | Search | Pause screen |
| **ChatGPT Mode** | `chatgpt-modal` | Search | AI analysis |
| **Analysis** | `analysis-modal` | Search | Position analysis |

---

### **6. BUTTON & CONTROL LOCATIONS**

#### **Lobby Buttons (Line ~7300)**
```html
<button onclick="startPvPLocal()">⚔️ PvP Local</button>
<button onclick="startAIGame()">🤖 vs AI</button>
<button onclick="startSandboxMode()">🛠️ Practice</button>
<button onclick="openTimerModal()">⏱️ Timed Game</button>
<button onclick="openVariantModal()">🎯 Variants</button>
```

#### **In-Game Controls**
| Button | onclick Function | Line | Purpose |
|--------|-----------------|------|---------|
| Quit Game | `quitAndLogout()` | ~10653 | Exit to lobby |
| Undo Move | `undoLastMove()` | Search | Take back move |
| Offer Draw | `offerDraw()` | Search | Propose draw |
| Resign | `resignGame()` | Search | Forfeit game |
| 3D Camera | `toggleCamera3D()` | ~12890 | Toggle camera |
| Sound Toggle | `toggleSound()` | Search | Mute/unmute |

#### **Sandbox Mode Buttons (Line ~10746)**
```html
<button onclick="switchSandboxTurn()">🔄 Turn</button>
<button onclick="resetSandboxBoard()">♻️ Reset</button>
<button onclick="clearSandboxBoard()">🗑️ Clear</button>
<button onclick="saveSandboxPosition()">💾 Save</button>
<button onclick="loadSandboxPosition()">📂 Load</button>
<button onclick="openPositionAnalyzer()">🔍 Analyze</button>
<button onclick="exitSandboxMode()">❌ Exit</button>
```

---

### **7. AI OPPONENT SYSTEM**

#### **AI Functions**
| Function | Line | Purpose |
|----------|------|---------|
| `startAIGame()` | ~19835 | Initialize AI mode |
| `makeAIMove()` | Search | AI calculates and executes move |
| `evaluatePosition()` | Search | Board evaluation function |
| `minimax()` | Search | AI decision algorithm |
| `getAIMove()` | Search | Get best move from AI |

#### **AI Difficulty Levels**
- Search for: `aiDifficulty` or `AI_DIFFICULTY`
- Likely around line ~19835 area

---

### **8. GAME STATE VARIABLES**

#### **Global Variables (Critical)**
```javascript
// Search for "let " or "var " near top of script section

let gameInProgress = false;      // Is game active?
let currentPlayer = 'black';     // Current turn
let gameOver = false;            // Game ended?
let draggedPiece = null;         // Piece being dragged
let draggedFromHex = null;       // Source hex
let aiEnabled = false;           // AI opponent active?
let sandboxMode = false;         // Practice mode?
let timerEnabled = false;        // Timer active?
let moveHistory = [];            // All moves made
let capturedPieces = {           // Eliminated pieces
    white: [],
    black: []
};
```

---

### **9. SPECIAL FEATURES**

#### **Tablebase System**
| Component | Line | Purpose |
|-----------|------|---------|
| `loadTablebase()` | ~25030 | Load endgame database |
| `probeTablebase()` | ~25150 | Query position |
| `encodeCurrentPosition()` | ~25075 | Convert board to tablebase key |
| Tablebase files | `/tablebases/*.json` | Endgame solutions |

#### **Opening Book**
- Search for: `openingBook` or `OPENING_BOOK`
- Stores common opening sequences

#### **Engine Analysis**
- Search for: `analyzePosition` or `engineAnalysis`
- Shows best moves and evaluation

---

### **10. VISUAL EFFECTS & FEEDBACK**

#### **Highlighting System**
| Function | Purpose |
|----------|---------|
| `highlightValidMoves()` | Show legal moves for piece |
| `highlightLastMove()` | Mark previous move |
| `highlightPiecesUnderAttack()` | Show threatened pieces |
| `clearHighlights()` | Remove all highlights |

#### **Animation Functions**
- Search for: `animate` or `transition`
- Piece movement animations
- Capture effects
- Win celebration

---

### **11. SOUND SYSTEM**

#### **Sound Functions**
| Function | Sound | When Played |
|----------|-------|-------------|
| `playMoveSound()` | Piece move | After valid move |
| `playCaptureSound()` | Capture | When piece taken |
| `playCheckSound()` | Alert | Base under threat |
| `playWinSound()` | Victory | Game won |
| `playLoseSound()` | Defeat | Game lost |

---

### **12. NETWORK/MULTIPLAYER** (If Implemented)

- Search for: `WebSocket` or `socket.io`
- Search for: `matchmaking` or `lobby`
- Search for: `sendMove` or `receiveMove`

---

## 🔍 HOW TO FIND ANYTHING

### **Quick Search Guide**

#### **Want to Modify...** → **Search For...**
```
Movement Rules        → "triangle-piece" or piece type class
Win Conditions        → "checkWinConditions"
AI Behavior          → "makeAIMove" or "minimax"
Button Actions       → onclick="functionName"
Panel Visibility     → element ID + "style.display"
Sound Effects        → "playSound" or sound function name
Highlighting         → "highlight" + type
Timer Logic          → "timer" or "countdown"
Drag & Drop          → "addEventListener('drag"
Base Capture         → "base" + "capture"
Piece Rotation       → "rotate" + "hexgon"
Move History         → "moveHistory" or "recordMove"
Captured Pieces      → "eliminated" or "captured"
Turn Switching       → "switchTurn"
Board Initialization → "initializeBoard"
```

#### **Example Search Workflow**
```
Task: Change triangle movement pattern

1. Search "triangle-piece" in public/index.html
2. Find movement validation function (~line XXXX)
3. Locate hardcoded movement offsets
4. Modify the allowed moves array
5. Test in Sandbox mode
```

---

## 📊 FUNCTION CALL ORDER

### **Game Start Sequence**
```
1. User clicks "⚔️ PvP Local"
   ↓
2. startPvPLocal() called (line ~16680)
   ↓
3. hideUserHome() - hide lobby
   ↓
4. initializeBoard('full') - create board (line 16144)
   ↓
5. setupDragAndDrop() - enable piece dragging
   ↓
6. gameInProgress = true
   ↓
7. currentPlayer = 'black'
   ↓
8. updateTurnDisplay() - show whose turn
   ↓
9. Wait for player input...
```

### **Move Execution Sequence**
```
1. Player drags piece
   ↓
2. dragstart event fires (line 15998)
   ↓
3. highlightValidMoves() called
   ↓
4. Player drops on hex
   ↓
5. drop event fires (line 27533)
   ↓
6. validateMove() checks legality
   ↓
7. If valid:
   ├─> Move piece DOM element
   ├─> Check for capture
   ├─> recordMoveRPN()
   ├─> highlightLastMove()
   ├─> playMoveSound()
   ├─> checkWinConditions() (line 25426)
   ├─> If no win: switchTurn()
   └─> updateTurnDisplay()
   ↓
8. If AI enabled:
   └─> makeAIMove() calculates response
```

### **Win Detection Sequence**
```
1. checkWinConditions(row, col, piece) called after move
   ↓
2. Check base capture:
   ├─> Is hexagon piece?
   ├─> In opponent's base?
   └─> If yes: WIN
   ↓
3. Check king capture:
   ├─> Count opponent pieces
   ├─> All 5 types captured?
   └─> If yes: WIN
   ↓
4. Check stalemate:
   ├─> Can opponent move?
   └─> If no: DRAW
   ↓
5. If win/draw:
   ├─> gameOver = true
   ├─> showGameOverModal()
   ├─> playWinSound() or playLoseSound()
   └─> Disable further moves
```

---

## 🛠️ COMMON MODIFICATION TASKS

### **Task 1: Change Piece Movement**
```
File: public/index.html
Search: "triangle-piece" (or target piece type)
Locate: Movement validation function
Modify: Allowed move offsets array
Test: Use Sandbox mode to verify
```

### **Task 2: Add New Win Condition**
```
File: public/index.html
Search: "checkWinConditions"
Line: ~25426
Add: New if-statement with condition check
Return: Winner or null
Test: Create position that triggers it
```

### **Task 3: Modify AI Difficulty**
```
File: public/index.html
Search: "AI_DIFFICULTY" or "aiDepth"
Locate: minimax depth parameter
Change: Higher = harder, Lower = easier
Test: Play vs AI on different settings
```

### **Task 4: Add Button to Panel**
```
File: public/index.html
Search: Panel ID (e.g., "sandbox-tools-panel")
Locate: Button container (~line 10746)
Add: <button onclick="yourFunction()">Text</button>
Define: function yourFunction() { ... }
Test: Click button in game
```

### **Task 5: Change Sound Effect**
```
File: public/index.html
Search: "playMoveSound" or target sound function
Locate: Audio element or howl definition
Change: src="new-sound.mp3"
Test: Trigger action that plays sound
```

---

## 🚨 CRITICAL WARNING AREAS

### **Don't Touch Unless You Know What You're Doing:**

1. **Drag & Drop Event Listeners** (lines ~15998, ~27533)
   - Breaking these breaks all piece movement
   - Very fragile system

2. **Win Condition Logic** (line ~25426)
   - Must handle all edge cases
   - Can create infinite loops or false wins

3. **Turn Switching** (search `switchTurn`)
   - Must happen at right time
   - Affects AI timing

4. **Board Initialization** (line ~16144)
   - Creates all hexagons
   - Sets up event listeners
   - Wrong changes = broken board

5. **Global Variables**
   - Changing names breaks references everywhere
   - Many functions rely on these

---

## 📝 QUICK REFERENCE TABLE

### **Most Common Lines You'll Need**

| What | Line | Function/ID |
|------|------|-------------|
| Game start | ~16680 | `startPvPLocal()` |
| Board creation | ~16144 | `initializeBoard()` |
| Move validation | Search | `validateMove()` |
| Win check | ~25426 | `checkWinConditions()` |
| Sandbox panel | ~10695 | `#sandbox-tools-panel` |
| Camera panel | ~12800 | `#camera-panel` |
| Lobby menu | ~7300 | `#start-menu` |
| Drag start | ~15998 | drag event listener |
| Drop handler | ~27533 | drop event listener |
| AI move | ~19835 | `makeAIMove()` |

---

## 🎓 TIPS FOR NAVIGATING THE CODE

### **1. Use VS Code's Search**
- `Ctrl+F` - Search current file
- `Ctrl+Shift+F` - Search all files
- Use regex for patterns

### **2. Follow Function Calls**
```
Right-click function → "Find All References"
```

### **3. Use Bookmarks**
- Add `// BOOKMARK: Description` comments
- Install bookmark extension

### **4. Console Logging**
```javascript
console.log('🔍 Debug checkpoint', variable);
```

### **5. Test in Sandbox Mode**
- Safest place to test changes
- Can reset easily
- No AI interference

---

## 🔄 UPDATE THIS DOCUMENT

**When you add features, update these sections:**
1. Function locations (with line numbers)
2. New panels/modals (with IDs)
3. New buttons (with onclick functions)
4. New game modes (with start functions)
5. Search keywords

---

## ✅ VERIFICATION CHECKLIST

**When making changes, verify:**
- [ ] Game still starts from lobby
- [ ] Pieces still move via drag & drop
- [ ] Win conditions still work
- [ ] AI still functions (if AI mode)
- [ ] Sandbox mode still accessible
- [ ] No console errors
- [ ] All buttons still respond
- [ ] Panels still draggable
- [ ] Timers work (if enabled)
- [ ] Sounds play correctly

---

**Last Updated:** November 2024  
**File Version:** 1.0  
**Primary File:** `public/index.html` (29,891 lines)

**Remember:** This file is your map. When lost, search this document first, then the code.

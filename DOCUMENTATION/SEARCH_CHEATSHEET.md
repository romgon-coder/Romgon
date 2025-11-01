# 🔍 QUICK SEARCH CHEAT SHEET - Romgon Game Engine

## 🎯 Purpose
**Copy-paste these search terms** when you need to find something specific in `public/index.html`.

---

## 🎮 GAME MECHANICS

### Movement & Validation
```
"triangle-piece"                → Triangle movement rules
"square-piece"                  → Square movement rules
"circle-piece"                  → Circle movement rules
"hexgon-piece"                  → Hexagon movement rules
"rhombus-piece"                 → Rhombus movement rules

"canSquareAttack"               → Square attack check (Line 14062)
"canWhiteTriangleAttack"        → White triangle attack (Line 14097)
"canBlackTriangleAttack"        → Black triangle attack (Line 14117)
"canCircleAttack"               → Circle attack check (Line 14143)
"canHexgonAttack"               → Hexagon attack check (Line 14224) ⚠️ SAME as movement
"canRhombusAttack"              → Rhombus attack check (Line 14249) ⚠️ EXCLUDES diagonal escapes

"showSquareMovementPattern"     → Square highlights (Line 14926)
"showTriangleMovementPattern"   → Triangle highlights (Line 14456)
"showWhiteTriangleMovementPattern" → White triangle (Line 14355)
"showRhombusMovementPattern"    → Rhombus highlights (Line 15069)
"showCircleMovementPattern"     → Circle highlights (Line ~15149)
"showHexgonMovementPattern"     → Hexagon highlights (Line 28003) ⚠️ SAME as attack

"getRotatedHexgonTargets"       → Hexagon targets (Line 22306) ⚠️ Used for BOTH attack AND movement

"clearHighlights"               → Remove highlights
```

### ⚠️ Attack vs Movement Distinction
```
⚠️ IMPORTANT RULE:

HEXAGON:  Movement = Attack  (NO escape-only moves)
RHOMBUS:  Movement ≠ Attack  (HAS diagonal escape moves from Dead Zone ↔ Inner Perimeter)
ALL OTHER PIECES: Movement = Attack

Search "isDiagonalMove" in canRhombusAttack to see escape implementation
```

### Win Conditions
```
"checkWinConditions"      → Main win check (Line 25426)
"checkBaseCapture"        → Hexagon base capture
"checkKingCapture"        → All pieces captured
"checkStalemate"          → No legal moves
"checkRhombusDeadlock"    → Rhombus deadlock
"gameOver"                → Game ended state
"showGameOverModal"       → Victory/defeat screen
```

### Turn System
```
"switchTurn"              → Change player (Line 23367)
"currentPlayer"           → Active player variable
"updateTurnDisplay"       → UI turn indicator
"currentTurnPiece"        → Piece needing action
```

### Capture System
```
"eliminatedPieces"        → Captured pieces array
"eliminated-pieces"       → Captured pieces panel
"capturepiece"            → Capture logic
"addToEliminated"         → Add to capture list
```

---

## 🎨 UI ELEMENTS

### Panels & Containers
```
"#start-menu"             → Lobby screen (Line ~7300)
"#board-display-container"→ Game board (Line 10650)
"#sandbox-tools-panel"    → Practice panel (Line 10695)
"#camera-panel"           → 3D camera (Line 12800)
"#eliminated-pieces-container" → Captured pieces (Line 10670)
"#white-eliminated"       → White captured
"#black-eliminated"       → Black captured
"#white-moves"            → White move history
"#black-moves"            → Black move history
```

### Modals & Dialogs
```
"game-over-modal"         → Victory/defeat screen
"settings-modal"          → Settings screen
"chatgpt-modal"           → AI analysis
"analysis-modal"          → Position analysis
"timer-modal"             → Timer settings
"variant-modal"           → Game variants
```

### Buttons (Search by onclick function)
```
"startPvPLocal"           → PvP button
"startAIGame"             → AI button
"startSandboxMode"        → Practice button
"startGameWithTime"       → Timed game
"quitAndLogout"           → Quit button
"undoLastMove"            → Undo button
"resignGame"              → Resign button
"offerDraw"               → Draw offer
"toggleCamera3D"          → Camera toggle
```

---

## 🎬 GAME FLOW FUNCTIONS

### Initialization
```
"function initializeBoard" → Board setup (Line 16144)
"function startPvPLocal"   → PvP start (Line 16680)
"function startAIGame"     → AI start (Line 19835)
"function startSandboxMode"→ Practice start (Line 16804)
"setupDragAndDrop"        → Drag system setup
```

### Move Execution
```
"addEventListener('dragstart" → Drag start (Line 15998)
"addEventListener('drop"      → Drop handler (Line 27533)
"addEventListener('dragover"  → Drag over handler
"draggedPiece"                → Currently dragged piece
"draggedFromHex"              → Source hex
```

### Move Recording
```
"recordMoveRPN"           → Save move notation
"moveHistory"             → Move list array
"highlightLastMove"       → Show last move
"playMoveSound"           → Move sound effect
```

---

## 🤖 AI SYSTEM

### AI Functions
```
"function makeAIMove"     → AI move (Line 21442)
"aiEnabled"               → AI active flag
"AI_DIFFICULTY"           → Difficulty setting
"minimax"                 → AI algorithm
"evaluatePosition"        → Board evaluation
"getAIMove"               → Get best move
"llmMode"                 → ChatGPT mode
```

---

## 🔊 SOUND SYSTEM

### Sound Functions
```
"playMoveSound"           → Move sound
"playCaptureSound"        → Capture sound
"playCheckSound"          → Alert sound
"playWinSound"            → Victory sound
"playLoseSound"           → Defeat sound
"toggleSound"             → Mute/unmute
```

---

## ⏱️ TIMER SYSTEM

### Timer Functions
```
"timerEnabled"            → Timer active flag
"startTimer"              → Begin countdown
"stopTimer"               → Pause countdown
"resetTimer"              → Reset to start
"updateTimerDisplay"      → UI update
"player-timers"           → Timer container
"white-timer"             → White timer
"black-timer"             → Black timer
```

---

## 🎥 CAMERA SYSTEM

### 3D Camera Functions
```
"toggleCamera3D"          → Show/hide camera
"rotateCamera3D"          → Rotate view
"tiltCamera3D"            → Tilt view
"zoomCamera3D"            → Zoom in/out
"resetCamera3D"           → Reset view
"setCamera3DView"         → Preset views
"camera3DEnabled"         → Camera active flag
```

---

## 🛠️ SANDBOX MODE

### Sandbox Functions
```
"sandboxMode"             → Practice mode flag
"sandboxEditMode"         → Edit mode flag
"toggleSandboxEditMode"   → Toggle editing
"toggleSandboxPlayMode"   → Toggle testing
"switchSandboxTurn"       → Change turn
"resetSandboxBoard"       → Reset to start
"clearSandboxBoard"       → Empty board
"saveSandboxPosition"     → Save position
"loadSandboxPosition"     → Load position
"exitSandboxMode"         → Return to lobby
```

---

## 📊 TABLEBASE SYSTEM

### Tablebase Functions
```
"loadTablebase"           → Load endgame DB (Line ~25030)
"probeTablebase"          → Query position (Line ~25150)
"encodeCurrentPosition"   → Position to key (Line ~25075)
"tablebaseEnabled"        → Tablebase active
"loadedTablebases"        → Loaded databases
```

---

## 🎯 GAME VARIANTS

### Variant Functions
```
"currentVariant"          → Active variant
"FOG_OF_WAR"              → Fog variant
"ATOMIC"                  → Atomic variant
"THREE_CHECK"             → Three check variant
"startGameWithVariant"    → Start variant (Line ~3285)
```

---

## 📝 MOVE NOTATION

### Notation Functions
```
"recordMoveRPN"           → Save move
"parseRPN"                → Parse notation
"exportPGN"               → Export game
"importPGN"               → Import game
"moveNotation"            → Notation string
```

---

## 🎨 HIGHLIGHTING SYSTEM

### Highlight Functions
```
"highlightValidMoves"     → Show legal moves
"highlightLastMove"       → Show last move
"highlightPiecesUnderAttack" → Show threats
"clearHighlights"         → Remove all
"hex-highlight"           → Highlight class
"attack-highlight"        → Attack class
"last-move-highlight"     → Last move class
```

---

## 🔧 DRAGGABLE PANELS

### Drag Functions
```
"initializeDraggablePanels" → Eliminated panels
"initializeSandboxDraggable"→ Sandbox panel (Line ~24973)
"initializeCameraDraggable" → Camera panel (Line ~25062)
"draggedPanel"             → Panel being dragged
"sandbox-panel-header"     → Sandbox drag header
"camera-panel-header"      → Camera drag header
```

---

## 🎮 KEYBOARD NAVIGATION

### Keyboard Functions
```
"keyboard-navigation"     → Nav system
"keyboardEnabled"         → Keyboard active
"handleKeyPress"          → Key handler
"moveCursor"              → Navigate board
"selectPiece"             → Pick piece
"confirmMove"             → Execute move
```

---

## 🌐 MULTIPLAYER (If Implemented)

### Network Functions
```
"WebSocket"               → Connection
"socket.io"               → Library
"sendMove"                → Send to opponent
"receiveMove"             → Get from opponent
"matchmaking"             → Find game
"onlineOpponent"          → Opponent ID
```

---

## 🐛 DEBUG & LOGGING

### Debug Functions
```
"console.log"             → Basic logging
"debugMode"               → Debug flag
"showDebugInfo"           → Show debug panel
"logGameState"            → Log state
"validateBoardState"      → Check consistency
```

---

## 📦 DATA STRUCTURES

### Key Variables
```
"gameInProgress"          → Game active
"boardState"              → Board array
"piecePositions"          → Piece locations
"capturedPieces"          → Eliminated pieces
"moveHistory"             → Move list
"currentPlayer"           → Active player
"gameOver"                → Game ended
```

---

## 🎨 CSS CLASSES

### Piece Classes
```
".triangle-piece"         → Triangle pieces
".square-piece"           → Square pieces
".circle-piece"           → Circle pieces
".hexgon-piece"           → Hexagon pieces
".rhombus-piece"          → Rhombus pieces
".white-piece"            → White color
".black-piece"            → Black color
".white-triangle"         → White triangle
".black-triangle"         → Black triangle
(etc. for all combinations)
```

### State Classes
```
".dragging"               → Being dragged
".highlighted"            → Valid move
".last-move"              → Previous move
".under-attack"           → Threatened
".selected"               → Currently selected
".captured"               → Eliminated
```

---

## 🔍 SEARCH TIPS

### How to Search Efficiently

**1. Function Definition:**
```
Search: "function functionName"
Example: "function checkWinConditions"
```

**2. Function Call:**
```
Search: "functionName("
Example: "checkWinConditions("
```

**3. Element ID:**
```
Search: "id=\"element-id\""
Example: "id=\"sandbox-tools-panel\""
```

**4. CSS Class:**
```
Search: "class=\"class-name\""
Example: "class=\"triangle-piece\""
```

**5. Event Listener:**
```
Search: "addEventListener('event"
Example: "addEventListener('dragstart"
```

**6. Variable Assignment:**
```
Search: "variableName ="
Example: "gameOver ="
```

**7. onclick Handler:**
```
Search: "onclick=\"functionName"
Example: "onclick=\"startSandboxMode"
```

---

## 🎯 COMMON TASKS QUICK SEARCH

### "I want to change how pieces move"
```
1. Search: piece type (e.g., "triangle-piece")
2. Look for: movement validation
3. Find: move offset arrays
```

### "I want to add a new win condition"
```
1. Search: "checkWinConditions"
2. Go to: Line 25426
3. Add: New if-statement
```

### "I want to modify the UI"
```
1. Search: Element ID or class
2. Find: HTML structure
3. Modify: Inline styles or add classes
```

### "I want to add a new button"
```
1. Search: Panel ID
2. Find: Button container
3. Add: <button onclick="...">
4. Define: function
```

### "I want to change AI behavior"
```
1. Search: "makeAIMove"
2. Go to: Line 21442
3. Modify: AI logic
```

---

## 📊 LINE NUMBER REFERENCE

```
Critical Locations:
─────────────────────
7300    Lobby menu
10650   Board container
10670   Eliminated panels
10695   Sandbox panel
12800   Camera panel
14062   Square attack logic
14097   White triangle attack
14117   Black triangle attack
14143   Circle attack logic
14249   Rhombus attack logic
14355   White triangle movement
14456   Black triangle movement
14926   Square movement pattern
15069   Rhombus movement pattern
15149   Circle movement pattern
15998   Drag start
16144   Initialize board
16680   Start PvP
16804   Start sandbox
19835   Start AI
21442   Make AI move
23367   Switch turn
24973   Sandbox draggable
25030   Tablebase loading
25062   Camera draggable
25426   Check win
27533   Drop handler (MAIN MOVE EXECUTION)
```

---

## 🎓 PRO TIPS

### Use Multiple Searches
```
1. Search "function name"
2. Search "name(" to find calls
3. Search "name =" to find assignments
```

### Use Regex in VS Code
```
Ctrl+F → Click .* icon
Search: function\s+\w+Move
Finds: All move functions
```

### Find All References
```
Right-click function → "Find All References"
Shows everywhere it's used
```

### Search in Selection
```
Select code block
Ctrl+F searches only there
```

---

**Keep this file open while coding!**  
**Most common searches are at the top.**

**Last Updated:** November 2024  
**File:** public/index.html (29,891 lines)

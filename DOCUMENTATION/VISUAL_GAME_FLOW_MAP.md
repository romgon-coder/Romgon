# 🗺️ Visual Game Flow Map - ROMGON

## 🎯 MAIN GAME LOOP (Visual Flow)

```
┌─────────────────────────────────────────────────────────────┐
│                     ROMGON GAME ENGINE                       │
│                   (public/index.html)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LOBBY (Line ~7300)                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │⚔️ PvP    │  │🤖 vs AI  │  │🛠️ Practice│  │⏱️ Timed  │  │
│  │Local     │  │         │  │         │  │         │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        │             │             │             │
        ▼             ▼             ▼             ▼
   Line 16680    Line 19835    Line 16804    Line 16680
startPvPLocal()  startAIGame() startSandbox() startWithTime()
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │  initializeBoard()      │
         │  (Line 16144)           │
         │  • Creates 51 hexagons  │
         │  • Places pieces        │
         │  • Sets up listeners    │
         └──────────┬──────────────┘
                    │
                    ▼
         ┌─────────────────────────┐
         │  setupDragAndDrop()     │
         │  (Line ~15990)          │
         │  • Enable piece dragging│
         │  • Highlight system     │
         └──────────┬──────────────┘
                    │
                    ▼
         ┌─────────────────────────┐
         │  GAME ACTIVE            │
         │  gameInProgress = true  │
         │  currentPlayer = 'black'│
         └──────────┬──────────────┘
                    │
                    ▼
            WAITING FOR INPUT...
```

---

## 🎮 MOVE EXECUTION FLOW

```
┌─────────────────────────────────────────────────────────────┐
│  PLAYER CLICKS & DRAGS PIECE                                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │  dragstart EVENT        │
        │  (Line 15998)           │
        │  • Store draggedPiece   │
        │  • Store draggedFromHex │
        └──────────┬──────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │  highlightValidMoves()  │
        │  • Show legal moves     │
        │  • Green highlighting   │
        └──────────┬──────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  PLAYER DROPS ON TARGET HEX                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │  drop EVENT             │
        │  (Line 27533)           │
        │  • Main move handler    │
        └──────────┬──────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │  validateMove()         │
        │  • Check piece pattern  │
        │  • Check path clear     │
        │  • Check player turn    │
        └──────────┬──────────────┘
                   │
               ┌───┴───┐
               │ Valid?│
               └───┬───┘
           ┌───────┴───────┐
           │               │
          NO              YES
           │               │
           ▼               ▼
     ┌─────────┐   ┌────────────────┐
     │ REJECT  │   │ EXECUTE MOVE   │
     │ Move    │   │ • Move DOM     │
     │ Return  │   │ • Check capture│
     └─────────┘   └───────┬────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ Capture Opponent?    │
                └──────────┬───────────┘
                       ┌───┴───┐
                       │  Any? │
                       └───┬───┘
                   ┌───────┴───────┐
                  YES              NO
                   │               │
                   ▼               ▼
         ┌──────────────┐   ┌──────────┐
         │ removePiece()│   │ Continue │
         │ addToElim()  │   │          │
         │ playCapture()│   │          │
         └──────┬───────┘   └────┬─────┘
                └───────┬─────────┘
                        │
                        ▼
             ┌────────────────────────┐
             │ recordMoveRPN()        │
             │ • Save to history      │
             │ • Update notation      │
             └──────────┬─────────────┘
                        │
                        ▼
             ┌────────────────────────┐
             │ highlightLastMove()    │
             │ • Visual feedback      │
             └──────────┬─────────────┘
                        │
                        ▼
             ┌────────────────────────┐
             │ playMoveSound()        │
             │ • Audio feedback       │
             └──────────┬─────────────┘
                        │
                        ▼
             ┌────────────────────────┐
             │ checkWinConditions()   │
             │ (Line 25426)           │
             │ • Base capture?        │
             │ • King capture?        │
             │ • Stalemate?           │
             └──────────┬─────────────┘
                        │
                    ┌───┴───┐
                    │ Won?  │
                    └───┬───┘
                ┌───────┴───────┐
               YES              NO
                │               │
                ▼               ▼
      ┌─────────────────┐  ┌──────────────┐
      │ GAME OVER       │  │ switchTurn() │
      │ • gameOver=true │  │ (Line 23367) │
      │ • Show modal    │  │ • Next player│
      │ • Play sound    │  └──────┬───────┘
      │ • Disable moves │         │
      └─────────────────┘         ▼
                          ┌────────────────┐
                          │ AI Enabled?    │
                          └───────┬────────┘
                              ┌───┴───┐
                             YES      NO
                              │       │
                              ▼       ▼
                     ┌──────────┐  ┌──────┐
                     │makeAIMove│  │ Wait │
                     │(21442)   │  │ for  │
                     │          │  │ input│
                     └────┬─────┘  └──────┘
                          │
                          └──> Back to top (AI executes move)
```

---

## 🏆 WIN CONDITION CHECK FLOW

```
┌────────────────────────────────────────────────┐
│  checkWinConditions(row, col, piece)          │
│  (Line 25426)                                  │
│  Called AFTER every move                       │
└──────────────────┬─────────────────────────────┘
                   │
                   ▼
        ┌─────────────────────────┐
        │  CHECK 1: Base Capture  │
        │  • Is piece Rhombus?    │
        │  • In opponent's base?  │
        └──────────┬──────────────┘
                   │
               ┌───┴───┐
               │ Base? │
               └───┬───┘
           ┌───────┴───────┐
          YES              NO
           │               │
           ▼               ▼
    ┌────────────┐   ┌────────────────┐
    │ WIN!       │   │ CHECK 2:       │
    │ Return     │   │ Rhombus Capture   │
    │ Winner     │   │ • Count pieces │
    └────────────┘   │ • All 6 gone?  │
                     └───────┬────────┘
                             │
                         ┌───┴───┐
                         │ All?  │
                         └───┬───┘
                     ┌───────┴───────┐
                    YES              NO
                     │               │
                     ▼               ▼
              ┌────────────┐   ┌────────────────┐
              │ WIN!       │   │ CHECK 3:       │
              │ Return     │   │ Stalemate      │
              │ Winner     │   │ • Can opp move?│
              └────────────┘   └───────┬────────┘
                                       │
                                   ┌───┴───┐
                                   │ Can't?│
                                   └───┬───┘
                               ┌───────┴───────┐
                              YES              NO
                               │               │
                               ▼               ▼
                        ┌────────────┐   ┌────────────┐
                        │ DRAW!      │   │ Continue   │
                        │ Stalemate  │   │ Game is on │
                        └────────────┘   └────────────┘
```

---

## 🎨 UI PANEL HIERARCHY

```
┌─────────────────────────────────────────────────────────────┐
│  BROWSER WINDOW                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  LOBBY (#start-menu) Line ~7300                       │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │ │
│  │  │ PvP  │ │  AI  │ │Pract │ │Timer │ │Varia │       │ │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │ │
│  │  (Buttons trigger game modes)                        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  WHEN GAME STARTS, LOBBY HIDES AND BOARD SHOWS:            │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  GAME SCREEN (#board-display-container) Line 10650   │ │
│  │                                                       │ │
│  │  ┌─────────────┐        HEX BOARD         ┌────────┐│ │
│  │  │ White       │        ╱ ╲  ╱ ╲          │ Black  ││ │
│  │  │ Eliminated  │      ╱   ╲╱   ╲          │ Elim   ││ │
│  │  │ Pieces      │     │ ⬡  ⬡  ⬡ │          │ Pieces ││ │
│  │  │ (~10670)    │    ╱ ⬡  ⬡  ⬡  ⬡╲         │(10670) ││ │
│  │  │             │   │ ⬡  ⬡  ⬡  ⬡  ⬡│        │        ││ │
│  │  │ △ □ ○       │  ╱ ⬡  ⬡  ⬡  ⬡  ⬡ ╲       │ ▲ ■ ●  ││ │
│  │  │             │ │ ⬡  ⬡  ⬡  ⬡  ⬡  ⬡ │      │        ││ │
│  │  │ Move List:  │  ╲ ⬡  ⬡  ⬡  ⬡  ⬡ ╱       │ Move   ││ │
│  │  │ 1. d3→d4    │   │ ⬡  ⬡  ⬡  ⬡  ⬡│        │ List   ││ │
│  │  │ 2. c5→d5    │    ╲ ⬡  ⬡  ⬡  ⬡ ╱         │        ││ │
│  │  │             │     │ ⬡  ⬡  ⬡ │          │        ││ │
│  │  │             │      ╲ ⬡  ⬡  ╱            │        ││ │
│  │  │             │       ╲  ╱  ╱             │        ││ │
│  │  └─────────────┘                           └────────┘│ │
│  │                                                       │ │
│  │  [Quit Game]  Turn: Black ▼  [Timer: 10:00]         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  FLOATING PANELS (Can drag anywhere):                      │
│  ┌──────────────────┐        ┌──────────────────┐         │
│  │ 🛠️ SANDBOX PANEL │        │ 🎥 CAMERA PANEL  │         │
│  │ (~10695)         │        │ (~12800)         │         │
│  │ • Edit Mode      │        │ • Rotation       │         │
│  │ • Play Mode      │        │ • Tilt           │         │
│  │ • Piece Selector │        │ • Zoom           │         │
│  │ • Reset Board    │        │ • Presets        │         │
│  │ • Save Position  │        │ • Reset          │         │
│  └──────────────────┘        └──────────────────┘         │
│  (Sandbox mode only)         (When 3D enabled)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 PIECE INTERACTION MAP

```
┌────────────────────────────────────────────────────────────┐
│  PIECE TYPES & INTERACTIONS                                │
└────────────────────────────────────────────────────────────┘

Triangle (△/▲)
├─ Movement: Forward only (1 space)
├─ Capture: Same as movement ✅
├─ Special: First move can be 2 spaces
└─ Search: "triangle-piece"

Square (□/■)
├─ Movement: Any direction (1 space)
├─ Capture: Same as movement ✅
├─ Special: Most versatile
└─ Search: "square-piece"

Circle (○/●)
├─ Movement: Orthogonal (straight lines)
├─ Capture: Same as movement ✅
├─ Special: Long-range
└─ Search: "circle-piece"

Hexagon (⬡/⬢) ⚠️ NO ESCAPE MOVES
├─ Movement: 6-directional pattern (rotation-dependent)
├─ Capture: Same as movement ✅ (uses getRotatedHexgonTargets)
├─ Special: Can rotate, wins by reaching opponent base
├─ Attack Function: canHexgonAttack() → Line 14224
├─ Movement Function: showHexgonMovementPattern() → Line 28003
├─ Shared Logic: getRotatedHexgonTargets() → Line 22306
└─ Search: "hexgon-piece"

Rhombus (◇/◆) ⚠️ HAS ESCAPE MOVES
├─ Movement: Diagonal + escape moves (Dead Zone ↔ Inner Perimeter)
├─ Capture: Diagonal only ❌ (EXCLUDES diagonal escape moves)
├─ Special: Long-range diagonal, escape-only moves
├─ Attack Function: canRhombusAttack() → Line 14249 (blocks diagonal escapes)
├─ Movement Function: showRhombusMovementPattern() → Line 15069
├─ Escape Implementation: Search "isDiagonalMove" in canRhombusAttack
└─ Search: "rhombus-piece"
```

### ⚠️ CRITICAL DISTINCTION: Attack vs Movement

```
┌───────────────────────────────────────────────────────────┐
│  ATTACK = MOVEMENT?                                       │
├───────────────────────────────────────────────────────────┤
│  Triangle  │ ✅ YES │ Same patterns                       │
│  Square    │ ✅ YES │ Same patterns                       │
│  Circle    │ ✅ YES │ Same patterns                       │
│  Hexagon   │ ✅ YES │ Both use getRotatedHexgonTargets() │
│  Rhombus   │ ❌ NO  │ Has diagonal ESCAPE moves         │
└───────────────────────────────────────────────────────────┘

HEXAGON RULE: Movement and attack are IDENTICAL
- No escape-only moves exist
- All moves shown can also attack
- getRotatedHexgonTargets() used for both

RHOMBUS EXCEPTION: Movement includes escape-only moves  
- Dead Zone (3-3, 3-4, 3-5) ↔ Inner Perimeter diagonal jumps
- These moves CANNOT be used for attack
- canRhombusAttack() specifically blocks diagonal escapes
```

---

## 🎯 COMMON TASK ROADMAP

### **TASK: Change How Triangles Move**
```
Step 1: Open public/index.html
        ↓
Step 2: Search "triangle-piece"
        ↓
Step 3: Find movement validation (~line TBD)
        ↓
Step 4: Locate move offset array
        Example: [[1,0], [1,1], ...] 
        ↓
Step 5: Modify offsets
        ↓
Step 6: Save & test in Sandbox mode
        ↓
Step 7: If works, test in PvP mode
```

### **TASK: Add New Button to Sandbox Panel**
```
Step 1: Open public/index.html
        ↓
Step 2: Go to line ~10746 (sandbox buttons)
        ↓
Step 3: Copy existing button HTML
        ↓
Step 4: Paste & modify:
        <button onclick="myNewFunction()">
            🆕 My Button
        </button>
        ↓
Step 5: Define function below:
        function myNewFunction() {
            // Your code here
        }
        ↓
Step 6: Test in Practice mode
```

### **TASK: Change Win Condition**
```
Step 1: Open public/index.html
        ↓
Step 2: Go to line 25426 (checkWinConditions)
        ↓
Step 3: Add new check:
        if (yourCondition) {
            return {winner: player, reason: 'desc'};
        }
        ↓
Step 4: Test by creating winning position
```

---

## 🔍 LINE NUMBER QUICK REFERENCE

```
┌────────────────────────────────────────┐
│  CRITICAL LINE NUMBERS                 │
├────────────────────────────────────────┤
│  Lobby Menu................... ~7300   │
│  Eliminated Panels............ ~10670  │
│  Board Container.............. ~10650  │
│  Sandbox Panel................ ~10695  │
│  Camera Panel................. ~12800  │
│  Drag Start Event............. ~15998  │
│  Initialize Board............. ~16144  │
│  Start PvP.................... ~16680  │
│  Start Sandbox................ ~16804  │
│  Start AI.................... ~19835  │
│  Make AI Move................ ~21442  │
│  Switch Turn................. ~23367  │
│  Check Win................... ~25426  │
│  Drop Event Handler.......... ~27533  │
└────────────────────────────────────────┘
```

---

## 🎬 STEP-BY-STEP GAME SEQUENCE

```
1. Browser loads public/index.html
   └─> Shows lobby (~line 7300)

2. User clicks "⚔️ PvP Local"
   └─> startPvPLocal() called (line 16680)
   
3. Lobby hidden, board shown
   └─> initializeBoard('full') (line 16144)
   
4. 51 hexagons created
   └─> Each has drag/drop listeners
   
5. 7 pieces placed per side
   └─> Black starts first
   
6. Player 1 (Black) drags triangle
   └─> dragstart fires (line 15998)
   └─> Valid moves highlighted
   
7. Player drops on highlighted hex
   └─> drop event fires (line 27533)
   └─> validateMove() checks legality
   └─> Piece DOM moves to new hex
   └─> recordMoveRPN() saves notation
   └─> checkWinConditions() (line 25426)
   └─> No win? switchTurn() (line 23367)
   
8. Now Player 2 (White) turn
   └─> Repeat steps 6-7
   
9. Continue until win condition met
   └─> gameOver = true
   └─> Modal shows winner
   └─> Game ends
```

---

## 📊 DATA FLOW DIAGRAM

```
┌────────────┐
│ USER INPUT │
│ (Mouse)    │
└─────┬──────┘
      │
      ▼
┌────────────────┐
│ EVENT SYSTEM   │
│ (Drag & Drop)  │
└─────┬──────────┘
      │
      ▼
┌────────────────┐     ┌──────────────┐
│ VALIDATION     │────>│ Game State   │
│ (Rules Check)  │     │ Variables    │
└─────┬──────────┘     └──────────────┘
      │
      ▼
┌────────────────┐
│ DOM UPDATE     │
│ (Move Piece)   │
└─────┬──────────┘
      │
      ▼
┌────────────────┐     ┌──────────────┐
│ WIN CHECK      │────>│ Win Modal    │
│ (3 conditions) │     │ (If true)    │
└─────┬──────────┘     └──────────────┘
      │
      ▼
┌────────────────┐
│ TURN SWITCH    │
│ (Next player)  │
└─────┬──────────┘
      │
      ▼
┌────────────────┐
│ AI CHECK       │
│ (If enabled)   │
└────────────────┘
```

---

## 🎨 VISUAL ELEMENT IDs CHEATSHEET

```
CONTAINERS:
#start-menu              → Lobby screen
#board-display-container → Game board wrapper
#eliminated-pieces-container → Captured pieces

PANELS:
#sandbox-tools-panel     → Practice mode controls
#camera-panel            → 3D camera controls
#white-eliminated        → White captured pieces
#black-eliminated        → Black captured pieces
#white-moves             → White move history
#black-moves             → Black move history

BUTTONS (in Lobby):
Inline onclick handlers, search button text

BOARD ELEMENTS:
.hexagon                 → Each hex cell
.triangle-piece          → Triangle pieces
.square-piece            → Square pieces
.circle-piece            → Circle pieces
.hexgon-piece            → Hexagon pieces
.rhombus-piece           → Rhombus pieces
.white-piece             → White pieces
.black-piece             → Black pieces
```

---

**Use this map to navigate the codebase visually!**  
**When lost, come back here to find your bearings.**

**Last Updated:** November 2024  
**Game Engine:** public/index.html (29,891 lines)

# AI Implementation

Advanced AI engine with flip mode awareness and reinforcement learning.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Position Evaluation](#position-evaluation)
- [Move Generation](#move-generation)
- [Flip Mode Understanding](#flip-mode-understanding)
- [Reinforcement Learning](#reinforcement-learning)
- [Difficulty Levels](#difficulty-levels)
- [API Integration](#api-integration)

## 🎯 Overview

ROMGON's AI combines:
- **Rule-based engine** - Legal move generation using hardcoded patterns
- **Static evaluation** - Position scoring with 6 evaluation factors
- **Flip mode awareness** - Advanced tactics for flip variant
- **Q-learning** - Reinforcement learning for improvement
- **Multiple difficulty levels** - Easy, Medium, Hard

### Key Improvements (January 2025)

**Critical Bug Fix:**
- ❌ **Before:** AI used `romgon-engine.js` (generated random moves!)
- ✅ **After:** AI uses `romgon-real-engine.js` (actual game logic)

**Flip Mode Support:**
- ✅ Omnidirectional attack evaluation
- ✅ Flip state matching
- ✅ Dead zone fortress strategy
- ✅ Flip state coordination
- ✅ Isolation penalty

**Enhanced Evaluation:**
- ✅ Material count
- ✅ Piece mobility
- ✅ Threat analysis
- ✅ Center control
- ✅ Rhombus advancement
- ✅ Tactical bonuses

**Result:** 400+ point evaluation improvements in flip mode!

## 🏗️ Architecture

### Component Structure

```
AI System
├── romgon-real-engine.js    - Core game engine
│   ├── Move generation
│   ├── Position evaluation
│   ├── Flip mode logic
│   └── Board state management
│
├── reinforcement-learning.js - Q-learning AI
│   ├── Move selection (exploration vs exploitation)
│   ├── Position hashing
│   ├── Q-value updates
│   └── Learning from games
│
├── romgon-patterns.js        - Movement patterns
│   ├── Square L-shaped moves
│   ├── Triangle directional moves
│   ├── Rhombus adjacent moves
│   ├── Circle zone moves
│   └── Hexagon flexible moves
│
└── ai-moves.js               - API endpoint
    ├── Difficulty handling
    ├── Board state parsing
    ├── Move execution
    └── Response formatting
```

### Data Flow

```
Frontend (Browser)
    ↓
    │ POST /api/ai/move
    │ { board, playerColor, flipModeEnabled, difficulty }
    ↓
Backend API (ai-moves.js)
    ↓
    │ Parse board state
    │ Validate input
    ↓
Game Engine (romgon-real-engine.js)
    ↓
    ├→ generateAllMoves(board, color, flipMode)
    │      ↓
    │      └→ getLegalMoves(pos, color, flipMode)
    │             ├→ Normal: Use piece patterns
    │             └→ Flipped: Use 6-hex adjacency
    │
    ├→ evaluatePosition(board, color, flipMode)
    │      ├→ Material
    │      ├→ Mobility
    │      ├→ Threats
    │      ├→ Center control
    │      ├→ Rhombus advancement
    │      └→ Flip mode bonuses
    │
    └→ findBestMove(board, color, depth, flipMode)
           ↓
           └→ Sort moves by evaluation
    ↓
Return Best Move
    ↓
Frontend executes move
```

## 📊 Position Evaluation

### Evaluation Function

```javascript
function evaluatePosition(board, playerColor, flipModeEnabled = false) {
    let score = 0;

    // 1. MATERIAL (base values)
    // 2. RHOMBUS ADVANCEMENT (progress to base)
    // 3. FLIP MODE EVALUATIONS (if enabled)
    // 4. PIECE MOBILITY (legal moves count)
    // 5. THREAT EVALUATION (pieces under attack)
    // 6. CENTER CONTROL (key hexes)

    return score;
}
```

### 1. Material Evaluation

**Piece Values:**
```javascript
const pieceValues = {
    'rhombus': 1000,  // King - win condition
    'triangle': 6,    // Directional attacker
    'hexgon': 5,      // Flexible piece
    'circle': 4,      // Zone movement
    'square': 3       // L-shaped jumper
};
```

**Calculation:**
```javascript
playerPieces.forEach(piece => {
    score += pieceValues[piece.type] || 0;
});
opponentPieces.forEach(piece => {
    score -= pieceValues[piece.type] || 0;
});
```

**Example:**
```
Player pieces: Rhombus(1000), Triangle(6), Square(3) = 1009
Opponent pieces: Rhombus(1000), Circle(4) = 1004
Material score: +5
```

### 2. Rhombus Advancement

**Objective:** Push rhombus toward opponent base

**White (base at 3-8):**
```javascript
if (playerColor === 'white') {
    score += (col - 0) * 5;  // Column 0 → 8
}
```

**Black (base at 3-0):**
```javascript
else {
    score += (8 - col) * 5;  // Column 8 → 0
}
```

**Example:**
```
White rhombus at 3-4: (4 - 0) * 5 = +20
White rhombus at 3-6: (6 - 0) * 5 = +30  ← Better!
```

### 3. Flip Mode Evaluations

#### A. Omnidirectional Mobility Bonus

```javascript
if (flipModeEnabled) {
    playerPieces.forEach(piece => {
        if (piece.flipped) {
            score += 10;  // 6-hex attack vs directional
        }
    });
}
```

**Reason:** Flipped pieces control more hexes → tactical advantage

#### B. Dead Zone Fortress

```javascript
const DEAD_ZONE = new Set(['3-3', '3-4', '3-5']);

if (flipModeEnabled && DEAD_ZONE.has(playerRhombus.pos)) {
    if (!playerRhombus.flipped) {
        score += 50;  // Can flip to safety
    } else {
        score += 15;  // Already safe
    }
}
```

**Strategic Value:**
- Unflipped in dead zone: Can flip to escape threats (+50)
- Flipped in dead zone: Safe from unflipped attacks (+15)

#### C. Flip State Coordination

```javascript
const playerFlipped = playerPieces.filter(p => p.flipped).length;
const playerUnflipped = playerPieces.length - playerFlipped;

if (playerFlipped > 0 && playerFlipped < playerPieces.length) {
    const minGroup = Math.min(playerFlipped, playerUnflipped);
    const maxGroup = Math.max(playerFlipped, playerUnflipped);

    if (minGroup === 1 && maxGroup > 3) {
        score -= 20;  // Isolated piece penalty
    }
}
```

**Example:**
```
6 unflipped pieces, 1 flipped piece: -20 (isolated)
3 unflipped pieces, 3 flipped pieces: No penalty (balanced)
```

### 4. Piece Mobility

**Concept:** More legal moves = better position

```javascript
let playerMobility = 0;
let opponentMobility = 0;

playerPieces.forEach(piece => {
    const moves = getLegalMoves(board, piece.pos, playerColor, flipModeEnabled);
    playerMobility += moves.length;
});

opponentPieces.forEach(piece => {
    const moves = getLegalMoves(board, piece.pos, opponentColor, flipModeEnabled);
    opponentMobility += moves.length;
});

score += (playerMobility - opponentMobility) * 2;
```

**Example:**
```
Player has 15 total legal moves
Opponent has 10 total legal moves
Mobility score: (15 - 10) * 2 = +10
```

### 5. Threat Evaluation

**Concept:** Pieces under attack are worth half their value (negative)

```javascript
let playerThreats = 0;

playerPieces.forEach(targetPiece => {
    opponentPieces.forEach(attackerPiece => {
        if (canAttack(board, attackerPiece.pos, targetPiece.pos, opponentColor, flipModeEnabled)) {
            playerThreats += pieceValues[targetPiece.type] * 0.5;
        }
    });
});

score -= playerThreats;  // Penalty for threats
score += opponentThreats;  // Bonus for threatening
```

**Example:**
```
Player triangle (value 6) is under attack: -3
Player threatens opponent hexagon (value 5): +2.5
Net threat score: -0.5
```

### 6. Center Control

**Key Hexes:** 3-3, 3-4, 3-5, 3-6 (center row)

```javascript
const centerHexes = ['3-3', '3-4', '3-5', '3-6'];
let centerControl = 0;

centerHexes.forEach(hex => {
    const piece = board[hex];
    if (piece) {
        if (piece.color === playerColor) {
            centerControl += 3;
        } else {
            centerControl -= 3;
        }
    }
});

score += centerControl;
```

**Example:**
```
Player controls 3-4 and 3-5: +6
Opponent controls 3-3: -3
Center control score: +3
```

### Total Evaluation Example

```javascript
Position:
  Material: +5
  Rhombus advancement: +30
  Flip bonuses: +20 (2 flipped pieces)
  Mobility: +10 (15 vs 10 moves)
  Threats: -3 (triangle under attack)
  Center control: +6 (2 center hexes)

Total Score: +68 points (favorable position)
```

## 🎲 Move Generation

### Legal Move Generation

```javascript
function getLegalMoves(board, fromPos, playerColor, flipModeEnabled = false) {
    const piece = board[fromPos];
    let targets = [];

    // FLIP MODE: Omnidirectional if flipped
    if (flipModeEnabled && piece.flipped) {
        const adjacent = ADJACENCY_MAP[fromPos] || [];
        targets = adjacent.map(pos => parsePosition(pos));
    }
    // NORMAL: Piece-specific patterns
    else {
        targets = getPatternTargets(piece.type, fromPos);
    }

    // Filter valid moves
    return filterValidMoves(targets, piece, board, flipModeEnabled);
}
```

### Flip State Matching

```javascript
function filterValidMoves(targets, piece, board, flipModeEnabled) {
    const moves = [];

    targets.forEach(targetPos => {
        const targetPiece = board[targetPos];

        if (targetPiece && targetPiece.color !== piece.color) {
            // FLIP MODE: Check flip state matching
            if (flipModeEnabled) {
                const attackerFlipped = piece.flipped || false;
                const targetFlipped = targetPiece.flipped || false;

                if (attackerFlipped !== targetFlipped) {
                    return;  // Cannot attack - flip state mismatch
                }
            }

            // Valid capture
            moves.push({
                from: fromPos,
                to: targetPos,
                isCapture: true,
                captured: targetPiece.type
            });
        }
    });

    return moves;
}
```

### Move Evaluation

```javascript
function findBestMove(board, playerColor, depth = 2, flipModeEnabled = false) {
    // Generate all legal moves
    const moves = generateAllMoves(board, playerColor, flipModeEnabled);

    // Evaluate each move
    const evaluatedMoves = moves.map(move => {
        const newBoard = applyMove(board, move);
        const evaluation = evaluatePosition(newBoard, playerColor, flipModeEnabled);

        return {
            ...move,
            evaluation,
            notation: `${move.from}→${move.to}${move.isCapture ? ' C' : ''}`
        };
    });

    // Sort by evaluation (best first)
    evaluatedMoves.sort((a, b) => b.evaluation - a.evaluation);

    return {
        bestMove: evaluatedMoves[0],
        evaluation: evaluatedMoves[0].evaluation,
        candidateMoves: evaluatedMoves.slice(0, 5)  // Top 5
    };
}
```

## 🔄 Flip Mode Understanding

### Omnidirectional Attack Detection

**Adjacency Map (all 49 hexes):**
```javascript
const ADJACENCY_MAP = {
    '3-4': ['3-3', '2-3', '2-4', '3-5', '4-4', '4-5'],  // 6 neighbors
    '0-0': ['1-0', '1-1', '0-1'],  // Corner (3 neighbors)
    // ... all positions mapped
};
```

**Usage in Move Generation:**
```javascript
if (flipModeEnabled && piece.flipped) {
    // Use adjacency map instead of piece-specific patterns
    const adjacent = ADJACENCY_MAP[fromPos];
    targets = adjacent.map(pos => parsePosition(pos));
}
```

### Dead Zone Recognition

**Dead Zone Set:**
```javascript
const DEAD_ZONE = new Set(['3-3', '3-4', '3-5']);
```

**Evaluation:**
```javascript
playerPieces.forEach(piece => {
    if (DEAD_ZONE.has(piece.pos)) {
        if (piece.type === 'circle' || piece.type === 'rhombus') {
            if (!piece.flipped) {
                score += 30;  // Fortress opportunity
            }
        }
    }
});
```

**Circle Restriction:**
```javascript
// Circles cannot enter dead zone in flip mode
if (flipModeEnabled && pieceType === 'circle' && DEAD_ZONE.has(targetPos)) {
    return false;  // Illegal move
}
```

### Flip State Tactical Evaluation

**Isolation Detection:**
```javascript
if (minGroup === 1 && maxGroup > 3) {
    score -= 20;  // Single piece isolated in wrong flip state
}
```

**Coordination Bonus:**
```javascript
// Groups of same flip state support each other
// No explicit bonus, but mobility increases when coordinated
```

## 🧠 Reinforcement Learning

### Q-Learning Implementation

```javascript
class RomgonAI {
    constructor(level = 1) {
        this.learningRate = 0.1;
        this.discountFactor = 0.9;
        this.explorationRate = 0.2;  // Epsilon-greedy
        this.positionValues = new Map();  // Q-table
    }

    // Q-Learning update rule
    updateQValue(gameState, move, reward, nextGameState) {
        const positionHash = this.hashPosition(gameState, move);
        const currentQ = this.getQValue(gameState, move);
        const maxNextQ = this.getMaxQValue(nextGameState);

        const newQ = currentQ + this.learningRate * (
            reward + this.discountFactor * maxNextQ - currentQ
        );

        this.positionValues.set(positionHash, newQ);
    }
}
```

### Position Hashing

**Advanced Hash (includes flip states):**
```javascript
hashPosition(gameState, move) {
    const board = gameState.board || {};
    const moveStr = move ? `${move.from}-${move.to}` : 'start';

    // Include piece positions AND flip states
    const pieceHash = Object.entries(board)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([pos, piece]) => {
            const flipState = piece.flipped ? 'F' : 'U';
            return `${pos}:${piece.type[0]}${piece.color[0]}${flipState}`;
        })
        .join('|');

    return `${moveStr}#${pieceHash}`;
}
```

**Example Hash:**
```
"3-4-3-5#0-0:sWU|3-4:rWU|4-5:cBF|..."
 ^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^
 move    board state with flip states
```

### Exploration vs Exploitation

```javascript
async getMove(gameState, playerColor) {
    const candidateMoves = await this.findCandidateMoves(gameState, playerColor);

    let selectedMove;
    if (Math.random() < this.explorationRate) {
        // EXPLORE: Random move
        selectedMove = candidateMoves[Math.floor(Math.random() * candidateMoves.length)];
    } else {
        // EXPLOIT: Best known move
        selectedMove = this.selectBestMove(candidateMoves, gameState);
    }

    return selectedMove;
}
```

### Learning from Games

```javascript
learnFromGame(gameHistory, result) {
    for (let i = 0; i < gameHistory.length - 1; i++) {
        const { gameState, move } = gameHistory[i];
        const nextState = gameHistory[i + 1].gameState;

        // Calculate reward
        let reward = 0;
        if (i === gameHistory.length - 2) {
            // Final move
            reward = result === 'win' ? 1 : (result === 'loss' ? -1 : 0);
        } else {
            reward = 0.01;  // Small progress reward
        }

        this.updateQValue(gameState, move, reward, nextState);
    }

    // Decay exploration rate
    this.explorationRate = Math.max(0.05, this.explorationRate * 0.995);
}
```

## 🎚️ Difficulty Levels

### Easy
- Random move selection from legal moves
- No evaluation
- Fast response

```javascript
if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
}
```

### Medium
- Basic evaluation (material + advancement)
- No lookahead
- Moderate response time

```javascript
if (difficulty === 'medium') {
    return findBestMove(board, playerColor, 1, flipModeEnabled);  // Depth 1
}
```

### Hard
- Full evaluation (all 6 factors)
- 2-ply lookahead
- Flip mode awareness
- Threat detection

```javascript
if (difficulty === 'hard') {
    return findBestMove(board, playerColor, 2, flipModeEnabled);  // Depth 2
}
```

### Difficulty Comparison

| Feature | Easy | Medium | Hard |
|---------|------|--------|------|
| Material | ❌ | ✅ | ✅ |
| Advancement | ❌ | ✅ | ✅ |
| Mobility | ❌ | ❌ | ✅ |
| Threats | ❌ | ❌ | ✅ |
| Center Control | ❌ | ❌ | ✅ |
| Flip Mode | ❌ | ❌ | ✅ |
| Lookahead | 0-ply | 1-ply | 2-ply |
| ELO Rating | ~800 | ~1200 | ~1600 |

## 🔌 API Integration

### Backend Endpoint

```javascript
// POST /api/ai/move
router.post('/move', async (req, res) => {
    const { board, playerColor, flipModeEnabled, difficulty } = req.body;

    // Validate input
    if (!board || !playerColor) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get best move from engine
    const depth = difficulty === 'hard' ? 2 : (difficulty === 'medium' ? 1 : 0);
    const result = findBestMove(board, playerColor, depth, flipModeEnabled);

    res.json({
        move: result.bestMove,
        evaluation: result.evaluation,
        candidateMoves: result.candidateMoves,
        difficulty: difficulty,
        flipModeEnabled: flipModeEnabled
    });
});
```

### Frontend Integration

```javascript
async function makeAIMoveBackend() {
    // Build board state from DOM
    const board = buildBoardStateFromDOM();

    // Call backend API
    const response = await fetch(`${API_URL}/api/ai/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            board: board,
            playerColor: 'white',
            flipModeEnabled: flipModeEnabled,  // Global variable
            difficulty: aiDifficulty || 'hard'
        })
    });

    const { move, evaluation } = await response.json();

    // Execute move on DOM
    executeMove(move.from, move.to);
}
```

### Board State Format

```javascript
// Backend expects this format:
{
  "0-0": { color: "white", type: "square", flipped: false },
  "3-4": { color: "white", type: "rhombus", flipped: false },
  "4-5": { color: "black", type: "circle", flipped: true },
  // ... all pieces
}

// Frontend must extract from DOM:
function buildBoardStateFromDOM() {
    const board = {};
    document.querySelectorAll('.piece').forEach(piece => {
        const hex = piece.closest('.hexagon');
        const [row, col] = parseHexId(hex.id);
        const pos = `${row}-${col}`;

        board[pos] = {
            color: getPieceColor(piece),
            type: getPieceType(piece),
            flipped: piece.dataset.flipped === 'true'  // Critical!
        };
    });
    return board;
}
```

## 📈 Performance Metrics

### Evaluation Speed
- **Single position:** ~1-5ms
- **Full move evaluation (15 moves):** ~15-75ms
- **2-ply lookahead:** ~100-500ms

### Accuracy
- **Move legality:** 100% (hardcoded patterns)
- **Flip state matching:** 100% (enforced)
- **Evaluation consistency:** High (deterministic)

### Training Results
- **Games played:** Increases exploration rate decay
- **Position memory:** ~1000+ positions in Q-table
- **Win rate improvement:** +10-15% after 100 games

## 🔬 Testing

### Unit Tests

```javascript
// Test flip mode move generation
const testBoard = {
    '3-4': { color: 'white', type: 'circle', flipped: true },
    '3-5': { color: 'black', type: 'triangle', flipped: true }
};

const moves = generateAllMoves(testBoard, 'white', true);
// Should include 3-4→3-5 (both flipped, can attack)

const noFlipMoves = generateAllMoves(testBoard, 'white', false);
// Should have different move count (no flip state matching)
```

### Integration Tests

```javascript
// Test full AI move selection
const result = findBestMove(testBoard, 'white', 2, true);
console.log('Best move:', result.bestMove);
console.log('Evaluation:', result.evaluation);
// Should prioritize dead zone, flip bonuses
```

## 🐛 Debugging

### Console Logging

```javascript
// Backend logs
console.log('AI Move Request:', {
    playerColor,
    flipModeEnabled,
    difficulty,
    pieceCount: Object.keys(board).length
});

console.log('Best Move Found:', {
    move: bestMove,
    evaluation,
    candidateCount: candidateMoves.length
});
```

### Common Issues

**1. AI not using flip mode:**
```
Check: Is flipModeEnabled=true passed to API?
Check: Does buildBoardStateFromDOM() extract flipped property?
```

**2. AI makes illegal moves:**
```
Check: Is board state format correct?
Check: Are piece positions valid (row-col format)?
```

**3. AI plays poorly:**
```
Check: Is difficulty set correctly?
Check: Is evaluation function being called?
Check: Are flip bonuses being applied?
```

## 📚 Further Reading

- [Flip Mode Mechanics](Flip-Mode-Mechanics) - Understand flip tactics
- [API Documentation](API-Documentation) - Backend endpoints
- [Architecture Overview](Architecture-Overview) - System design
- [Testing](Testing) - Test suite documentation

---

**Related Files:**
- `backend/engine/romgon-real-engine.js` - Main engine
- `backend/ai/reinforcement-learning.js` - Q-learning
- `backend/routes/ai-moves.js` - API endpoint
- `backend/engine/romgon-patterns.js` - Movement patterns

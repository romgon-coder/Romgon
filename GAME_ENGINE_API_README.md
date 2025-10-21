# 🎮 Romgon Game Engine API

## Overview

The Romgon Game Engine API is a universal interface that allows AI systems, LLMs (ChatGPT, Claude, etc.), and external applications to understand, play, and analyze Romgon games programmatically.

---

## 🚀 Quick Start

### For Developers:

1. **Access the API Documentation Page:**
   ```
   http://localhost:5500/public/game-engine-api.html
   ```

2. **Include the Engine in your game page:**
   ```html
   <script src="romgon-engine-api.js"></script>
   ```

3. **Start using the API:**
   ```javascript
   // Get current game state
   const state = window.RomgonEngine.getGameState();
   
   // Get legal moves
   const moves = window.RomgonEngine.getLegalMoves();
   
   // Make a move
   window.RomgonEngine.makeMove("3-0→3-1");
   ```

---

## 📚 Core Features

### 1. Game State Export
Get complete board state including:
- All piece positions
- Current turn
- Base defense status
- Repetition counts
- Game-over status

### 2. Legal Move Generation
Query all legal moves for:
- Current player (all pieces)
- Specific piece at a position
- Returns moves in standardized RPN notation

### 3. Move Validation & Execution
- Validate moves before making them
- Execute moves programmatically
- Get detailed results (capture, check, game-over)

### 4. Position Analysis
- Material count and evaluation
- Rhombus distance to goal
- Threatened pieces detection
- Strategic evaluation score

### 5. Import/Export
- Export games in RPN format
- Import games from RPN strings
- Compatible with existing RPN system

---

## 🤖 AI/LLM Integration

### For ChatGPT Custom GPTs:

**Add to GPT Instructions:**
```
You are a Romgon game assistant with access to the game engine via window.RomgonEngine.

ALWAYS follow these steps:
1. Get game state: window.RomgonEngine.getGameState()
2. Get legal moves: window.RomgonEngine.getLegalMoves()
3. Analyze position: window.RomgonEngine.analyzePosition()
4. Suggest best move considering:
   - Captures (highest priority)
   - Threats to opponent pieces
   - Rhombus safety and advancement
   - Material advantage

Move Notation: Use "row-col→row-col" format (e.g., "3-0→3-1")
Piece Values: Triangle(180) > Hexagon(170) > Circle(160) > Square(150)

NEVER suggest illegal moves. Always validate against getLegalMoves() first.
```

### For Claude Projects:

**Project Knowledge:**
```markdown
# Romgon Game Engine API

Access via: window.RomgonEngine

Key Methods:
- getGameState() - Full board state
- getLegalMoves([position]) - Valid moves
- makeMove(notation) - Execute move
- analyzePosition() - Position evaluation
- getSuggestedMoves(n) - Top n moves

Strategy:
1. Captures are highest value (150-180 points)
2. Protect rhombus (lose if checkmated)
3. Advance rhombus when supported
4. Control center (row 3)
5. Avoid repetitions (3x = loss)

Always verify moves are legal before suggesting.
```

---

## 💡 Use Cases

### 1. **External AI Player**
```python
# Python with Selenium
from selenium import webdriver

driver = webdriver.Chrome()
driver.get("http://localhost:5500/public/index.html")

# Get moves and pick best one
moves = driver.execute_script("""
    return window.RomgonEngine.getSuggestedMoves(1)[0].move;
""")

# Make the move
driver.execute_script(f"""
    window.RomgonEngine.makeMove('{moves}');
""")
```

### 2. **Game Analysis Tool**
```javascript
// Analyze multiple positions
const positions = [/* saved game states */];

positions.forEach(pos => {
    const analysis = window.RomgonEngine.analyzePosition();
    console.log(`Material: ${analysis.materialValue.white} vs ${analysis.materialValue.black}`);
    console.log(`Evaluation: ${analysis.evaluation > 0 ? 'White advantage' : 'Black advantage'}`);
});
```

### 3. **Training AI**
```javascript
// Generate training data
const games = [];
for (let i = 0; i < 1000; i++) {
    // Play random game
    while (!window.gameOver) {
        const moves = window.RomgonEngine.getLegalMoves();
        const move = moves[Math.floor(Math.random() * moves.length)];
        window.RomgonEngine.makeMove(move);
    }
    games.push(window.RomgonEngine.exportGameRPN());
    // Reset game
}
```

### 4. **REST API Wrapper**
```javascript
// Node.js/Express server
const express = require('express');
const puppeteer = require('puppeteer');

app.post('/api/move', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:5500/public/index.html');
    
    const result = await page.evaluate((move) => {
        return window.RomgonEngine.makeMove(move);
    }, req.body.move);
    
    res.json(result);
    await browser.close();
});
```

---

## 📖 API Reference

### Core Methods

#### `getGameState()`
**Returns:** Complete game state object
```javascript
{
    turn: "black"|"white",
    moveNumber: number,
    pieces: {
        "3-0": {type: "rhombus", color: "black", orientation: 0, canMove: true},
        ...
    },
    gameOver: boolean,
    winner: "black"|"white"|null,
    baseDefense: {black: boolean, white: boolean}
}
```

#### `getLegalMoves([position])`
**Parameters:**
- `position` (optional): Specific position like "3-0"

**Returns:** Array of legal moves in RPN format
```javascript
["3-0→3-1", "3-0→4-1", "2-2→3-3 C", ...]
```

#### `makeMove(moveNotation)`
**Parameters:**
- `moveNotation`: Move in format "FROM→TO" or "FROM→TO C"

**Returns:** Result object
```javascript
{
    success: true,
    move: "3-0→3-1",
    captured: null|"square"|"triangle"|...,
    check: boolean,
    gameOver: boolean,
    winner: null|"black"|"white"
}
```

#### `validateMove(moveNotation)`
**Returns:** Validation result
```javascript
{
    valid: boolean,
    reason: null|string
}
```

#### `analyzePosition()`
**Returns:** Position analysis
```javascript
{
    materialCount: {white: {square:2, ...}, black: {...}},
    materialValue: {white: 300, black: 280},
    rhombusDistanceToGoal: {white: 8, black: 12},
    evaluation: 20  // Positive = white advantage
}
```

#### `getSuggestedMoves(count=5)`
**Returns:** Top moves with scores
```javascript
[
    {move: "2-2→3-3 C", score: 250},
    {move: "3-0→3-1", score: 120},
    ...
]
```

---

## 🎯 Strategic Guidelines for AI

### Opening (Moves 1-5)
- Develop pieces toward center
- Keep rhombus safe at base
- Control row 3

### Middlegame (Moves 6-15)
- **Prioritize captures** (150-180 points)
- Create threats against opponent
- Advance rhombus when supported
- Maintain material advantage

### Endgame (Moves 16+)
- Push rhombus toward goal
- Use tactical pieces to clear path
- Watch for opponent's rhombus race

### Tactical Priorities:
1. **Captures:** Always highest value
2. **Threatening enemy rhombus:** Critical tactical advantage
3. **Rhombus safety:** Don't expose to capture
4. **Center control:** Row 3 is key
5. **Avoid repetitions:** 3x same position = loss, 5x shuttle = loss

---

## 🔧 Integration with Existing AI

The Game Engine API can **improve your current AI** by:

1. **Providing structured game state** instead of DOM parsing
2. **Legal move validation** before evaluation
3. **Position analysis** for better evaluation functions
4. **Move suggestions** as fallback when evaluation is uncertain

### Example: Enhancing Current AI

```javascript
// In your makeAIMove() function:
function makeAIMove() {
    // Get structured state
    const state = window.RomgonEngine.getGameState();
    
    // Get only legal moves (faster than DOM queries)
    const legalMoves = window.RomgonEngine.getLegalMoves();
    
    // Use existing evaluation but with better data
    const scoredMoves = legalMoves.map(move => ({
        move,
        score: evaluateMove(move, state)  // Your existing function
    }));
    
    // Pick best move
    const bestMove = scoredMoves.sort((a,b) => b.score - a.score)[0];
    
    // Execute using engine (handles all edge cases)
    window.RomgonEngine.makeMove(bestMove.move);
}
```

---

## 📝 RPN Move Notation

### Standard Format:
```
FROM→TO [MODIFIERS]
```

### Examples:
```
"3-0→3-1"          // Simple move
"2-2→3-3 C"        // Capture
"4-4 R+"           // Rotation only
"2-3→3-4 C R+"     // Capture + rotation
```

### Coordinates:
- Format: `row-column`
- Black starts at top (row 0)
- White starts at bottom (row 6)
- Goals: Black=3-0, White=3-8

---

## 🚦 Status & Roadmap

### ✅ Complete:
- Game state export
- Legal move generation
- Move validation & execution
- Position analysis
- Import/Export (RPN)
- Interactive documentation page

### 🔄 In Progress:
- WebSocket support for real-time updates
- REST API wrapper server
- Python SDK
- Tournament mode integration

### 📋 Planned:
- Opening book database
- Endgame tablebase
- Machine learning training data export
- Multi-game batch analysis

---

## 📞 Support & Contribution

**Documentation:** `game-engine-api.html`  
**Source:** `romgon-engine-api.js`  
**Version:** 1.0.0

For questions or feature requests, please create an issue in the repository.

---

**🎉 The Game Engine API makes Romgon accessible to AI systems worldwide!**

# 🎮 Game Engine API - Visual Guide

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                  YOUR ROMGON GAME (index.html)               ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                               ┃
┃  ┌─────────────────────────────────────────────────────┐    ┃
┃  │  🎯 YOUR CURRENT GAME CODE                          │    ┃
┃  │  • Hex board rendering                              │    ┃
┃  │  • Piece movement logic                             │    ┃
┃  │  • AI (makeAIMove function)                         │    ┃
┃  │  • All existing features                            │    ┃
┃  └─────────────────────────────────────────────────────┘    ┃
┃                           ↓                                   ┃
┃  ┌─────────────────────────────────────────────────────┐    ┃
┃  │  🆕 NEW: Game Engine API (romgon-engine-api.js)     │    ┃
┃  │  <script src="romgon-engine-api.js"></script>       │    ┃
┃  └─────────────────────────────────────────────────────┘    ┃
┃                           ↓                                   ┃
┃  ┌─────────────────────────────────────────────────────┐    ┃
┃  │  ⚙️ window.RomgonEngine Object                      │    ┃
┃  │  • getGameState()                                    │    ┃
┃  │  • getLegalMoves()                                   │    ┃
┃  │  • makeMove(notation)                                │    ┃
┃  │  • validateMove(notation)                            │    ┃
┃  │  • analyzePosition()                                 │    ┃
┃  │  • getSuggestedMoves(n)                              │    ┃
┃  │  • exportGameRPN() / importGameRPN()                 │    ┃
┃  └─────────────────────────────────────────────────────┘    ┃
┃                           ↓                                   ┃
┃              ┌────────────┴─────────────┐                    ┃
┃              ↓                           ↓                    ┃
┃   ┌────────────────────┐     ┌────────────────────┐         ┃
┃   │  INTERNAL USE      │     │  EXTERNAL USE      │         ┃
┃   │  (Your AI)         │     │  (Outside tools)   │         ┃
┃   └────────────────────┘     └────────────────────┘         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                 ↓                           ↓
                 ↓                           ↓
    ┌────────────────────────┐   ┌─────────────────────────┐
    │  YOUR AI IMPROVED      │   │  EXTERNAL TOOLS         │
    │  ✅ Faster moves       │   │  🤖 ChatGPT             │
    │  ✅ Better data        │   │  🤖 Claude              │
    │  ✅ Structured state   │   │  🐍 Python scripts      │
    └────────────────────────┘   │  🌐 REST APIs           │
                                  │  📱 Mobile apps         │
                                  └─────────────────────────┘
```

---

## 📊 The Menu System

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ☰ MAIN MENU                                      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                    ┃
┃  📖 RULEBOOK                                      ┃
┃     Rules • How to play                           ┃
┃                                                    ┃
┃  🎮 GAME ENGINE API ← NEW!                        ┃
┃     For developers • AI tools                     ┃
┃                                                    ┃
┃  👤 ACCOUNT                                        ┃
┃     Profile • Stats                               ┃
┃                                                    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
         ↓
         Click "🎮 GAME ENGINE API"
         ↓
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  GAME ENGINE API DOCUMENTATION (New Tab)          ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  • Full API reference                             ┃
┃  • Integration examples                           ┃
┃  • Interactive tester                             ┃
┃  • ChatGPT instructions                           ┃
┃  • Python code samples                            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🔄 Data Flow

### Internal Use (Your AI):

```
┌──────────────┐
│ Your AI      │
│ makeAIMove() │
└──────┬───────┘
       │
       │ Call API directly
       │
       ↓
┌──────────────────────────────────────┐
│ window.RomgonEngine.getLegalMoves()  │
│ • No DOM queries                      │
│ • Instant response                    │
│ • Pre-validated moves                 │
└──────┬───────────────────────────────┘
       │
       │ Returns: [{from: "3-0", to: "3-1", ...}, ...]
       │
       ↓
┌──────────────┐
│ Your AI      │
│ • Score moves│
│ • Pick best  │
│ • Execute    │
└──────────────┘
```

### External Use (Python/GPT):

```
┌─────────────────────┐
│ Python Script       │
│ or ChatGPT         │
└─────────┬───────────┘
          │
          │ Selenium/Browser Automation
          │
          ↓
┌──────────────────────────────────────────┐
│ driver.execute_script(                   │
│   "return window.RomgonEngine..."        │
│ )                                         │
└─────────┬────────────────────────────────┘
          │
          │ JavaScript executes in browser
          │
          ↓
┌──────────────────────────────────────────┐
│ window.RomgonEngine.getGameState()       │
│ • Reads current board                    │
│ • Returns structured JSON                │
└─────────┬────────────────────────────────┘
          │
          │ Returns to Python/GPT
          │
          ↓
┌─────────────────────┐
│ AI analyzes state   │
│ • Material count    │
│ • Position eval     │
│ • Picks best move   │
└─────────┬───────────┘
          │
          │ Execute move via API
          │
          ↓
┌──────────────────────────────────────────┐
│ driver.execute_script(                   │
│   "return window.RomgonEngine.makeMove(  │
│     '3-0→3-1'                            │
│   )"                                      │
│ )                                         │
└──────────────────────────────────────────┘
```

---

## 🎯 Where Files Are Located

```
Romgon Game/
│
├── deploy/
│   ├── index.html ← Your main game (API LOADED HERE)
│   ├── romgon-engine-api.js ← API module (THE ENGINE)
│   └── game-engine-api.html ← Documentation page (GUIDE)
│
└── public/ (after build)
    ├── index.html ← Deployed game
    ├── romgon-engine-api.js ← Deployed API
    └── game-engine-api.html ← Deployed docs

```

---

## 🧪 Testing the API

### Test 1: Check if API is loaded

```javascript
// In browser console (F12):
typeof window.RomgonEngine
// Expected: "object" ✅

window.RomgonEngine
// Expected: {getGameState: ƒ, getLegalMoves: ƒ, ...} ✅
```

### Test 2: Get current game state

```javascript
const state = window.RomgonEngine.getGameState();
console.log(state);
/* Expected:
{
  currentPlayer: "white",
  turnNumber: 1,
  pieces: [
    {position: "3-0", type: "rhombus", color: "white"},
    {position: "3-1", type: "square", color: "white"},
    ...
  ],
  baseDefenseStatus: {white: true, black: true}
}
*/
```

### Test 3: Get legal moves

```javascript
const moves = window.RomgonEngine.getLegalMoves();
console.log(moves.length);
// Expected: 15-30 moves (depending on position)

console.log(moves[0]);
/* Expected:
{
  from: "3-0",
  to: "3-1",
  piece: "rhombus",
  notation: "3-0→3-1"
}
*/
```

### Test 4: Validate a move

```javascript
const result = window.RomgonEngine.validateMove("3-0→3-1");
console.log(result);
/* Expected:
{
  legal: true,
  reason: "Valid move"
}
*/
```

### Test 5: Execute a move

```javascript
const result = window.RomgonEngine.makeMove("3-0→3-1");
console.log(result);
/* Expected:
{
  success: true,
  message: "Move executed"
}
*/
// The piece should move on the board! ✅
```

---

## 🎓 Understanding the Script Tag

### What This Line Does:

```html
<script src="romgon-engine-api.js"></script>
```

**Breakdown:**
1. `<script>` → Tells browser to load JavaScript
2. `src="romgon-engine-api.js"` → Load this file
3. `</script>` → End of script tag

**What Happens:**
1. Browser loads `romgon-engine-api.js`
2. File creates `window.RomgonEngine` object
3. Object has 8+ methods (getGameState, getLegalMoves, etc.)
4. Now available everywhere in your game!

**Where It Goes:**
- At the **END** of your HTML (before `</body>`)
- After all other scripts
- So it can access your game functions

---

## 🚀 Quick Start Guide

### For You (Game Developer):

1. ✅ **Already done!** API is loaded
2. ✅ Menu button added
3. ✅ Documentation page created

**Next:** Test AI improvements using API

### For External Developers:

1. Open documentation: `http://localhost:5500/public/game-engine-api.html`
2. Read integration examples
3. Choose platform (Python/GPT/Node.js)
4. Follow code samples
5. Build custom tools!

---

## 🎉 Success Checklist

- ✅ `romgon-engine-api.js` loaded in game
- ✅ Menu button added ("🎮 GAME ENGINE API")
- ✅ `window.RomgonEngine` available globally
- ✅ Documentation page accessible
- ✅ Built and deployed to `public/`

**Your game now has enterprise-level API support!** 🚀

---

## 📖 Next Steps

1. **Test the API:**
   - Open game
   - Press F12 (console)
   - Type: `window.RomgonEngine.getGameState()`

2. **Read Documentation:**
   - Click menu
   - Click "🎮 GAME ENGINE API"
   - Explore examples

3. **Improve Your AI (Optional):**
   - Use `getLegalMoves()` for faster move generation
   - Use `analyzePosition()` for better evaluation
   - Use `getSuggestedMoves()` as fallback

4. **Share with Community:**
   - External developers can build tools
   - GPTs can learn to play
   - Python scripts can analyze games

**The API is ready! Test it now!** 🎮✨

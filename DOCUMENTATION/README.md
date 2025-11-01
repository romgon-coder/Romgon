# 📚 ROMGON Game Engine Documentation

**Your control panel for the 29,891-line game engine.**

---

## 🎯 Start Here

**New to the codebase?** Read these in order:

1. **DO_WE_KNOW_EVERYTHING.md** - Overview & coverage analysis
2. **SEARCH_CHEATSHEET.md** - Quick reference for finding anything
3. **GAME_ENGINE_ARCHITECTURE_MAP.md** - Complete technical reference
4. **VISUAL_GAME_FLOW_MAP.md** - Flow diagrams & visual guides
5. **AI_IMPROVEMENT_GUIDE.md** - Making AI understand all rules and play like a human

---

## 📖 Document Guide

### **🔍 SEARCH_CHEATSHEET.md**
**Use this FIRST when you need to find something.**

**Contains:**
- Copy-paste search terms for every game mechanic
- Function names with line numbers
- UI element IDs and locations
- Quick task guides
- Search tips and tricks

**When to use:**
- "Where's the triangle movement code?"
- "How do I find the win condition?"
- "What's the ID of the sandbox panel?"

---

### **🗺️ GAME_ENGINE_ARCHITECTURE_MAP.md**
**The complete technical reference.**

**Contains:**
- File structure overview
- Game initialization flow
- Movement system architecture
- Win condition logic
- All UI panels and buttons
- Function call order
- Critical line numbers
- Modification guides

**When to use:**
- Understanding how the engine works
- Planning major changes
- Learning the codebase structure
- Finding related functions

---

### **🎨 VISUAL_GAME_FLOW_MAP.md**
**ASCII diagrams showing how everything connects.**

**Contains:**
- Main game loop diagram
- Move execution flowchart
- Win detection flow
- UI panel hierarchy
- Piece interaction map
- Call chain visualization

**When to use:**
- Understanding game flow
- Seeing the big picture
- Planning feature integration
- Explaining to others

---

### **✅ DO_WE_KNOW_EVERYTHING.md**
**Coverage analysis & what we've mapped.**

**Contains:**
- Complete knowledge summary
- What's fully mapped (with lines)
- What's searchable
- Minor gaps (non-critical)
- Before/after examples
- Confidence assessment

**When to use:**
- Checking if something is documented
- Understanding documentation coverage
- Quick reference to line numbers
- Explaining to AI agents

---

### **🤖 AI_IMPROVEMENT_GUIDE.md**
**Making the AI understand and use ALL game rules.**

**Contains:**
- What AI currently knows vs. what it's missing
- Critical gaps in win condition awareness
- Piece-specific strategy improvements
- Attack vs. movement distinction fixes
- Strategic concepts (coordination, tempo, endgame)
- Implementation priority guide
- Code locations for AI functions
- Quick-start minimal AI fix

**When to use:**
- Improving AI behavior
- Understanding why AI makes certain moves
- Adding new AI strategies
- Teaching AI about game rules
- Making AI play more like a human expert

---

## 🚀 Common Workflows

### **Task: Change Piece Movement**
```
1. Open SEARCH_CHEATSHEET.md
2. Find: "Movement & Validation" section
3. Copy search term: "showTriangleMovementPattern"
4. Search in public/index.html → Line 14456
5. Modify the movement offsets
6. Test in Sandbox mode
```

### **Task: Add New Button**
```
1. Open SEARCH_CHEATSHEET.md
2. Find: "Panels & Containers" section
3. Note panel ID: "sandbox-tools-panel" → Line 10695
4. Go to public/index.html line 10746
5. Copy existing button HTML
6. Add your onclick function
7. Test
```

### **Task: Understand Win Conditions**
```
1. Open VISUAL_GAME_FLOW_MAP.md
2. Look at "WIN CONDITION CHECK FLOW" diagram
3. See it calls checkWinConditions() at Line 25426
4. Go to GAME_ENGINE_ARCHITECTURE_MAP.md
5. Read "Win Conditions" section
6. Modify at Line 25426 in public/index.html
```

### **Task: Find Any Function**
```
1. Open SEARCH_CHEATSHEET.md
2. Ctrl+F for the function type
3. Copy the search term
4. Search in public/index.html
5. Done in <30 seconds
```

---

## 📊 Key Line Numbers

**Most Critical Locations:**
```
Line 7300    → Lobby menu
Line 10695   → Sandbox panel
Line 12800   → Camera panel
Line 14062   → Square movement
Line 14456   → Triangle movement
Line 15069   → Rhombus movement
Line 16144   → Board initialization
Line 16804   → Start sandbox mode
Line 21442   → AI move logic
Line 23367   → Turn switching
Line 25426   → Win condition check
Line 27533   → Main drop handler (CORE ENGINE)
```

---

## 🎓 Tips for Using This Documentation

### **For Quick Answers:**
→ Use **SEARCH_CHEATSHEET.md**

### **For Understanding Systems:**
→ Use **GAME_ENGINE_ARCHITECTURE_MAP.md**

### **For Visual Learning:**
→ Use **VISUAL_GAME_FLOW_MAP.md**

### **For Coverage Check:**
→ Use **DO_WE_KNOW_EVERYTHING.md**

---

## 🔧 Working with AI Agents

### **Before (Without Documentation):**
```
You: "Find the triangle movement code"
AI: *searches blindly for 20 minutes*
AI: "I found some triangle code, maybe this is it?"
```

### **After (With Documentation):**
```
You: "Check SEARCH_CHEATSHEET.md for triangle movement"
AI: "Found it! Line 14456, showTriangleMovementPattern()"
You: "Change the movement offsets"
AI: *makes precise change in 30 seconds*
```

**Pro tip:** Always start with: "Check [document name] for [topic]"

---

## 📁 Main Game File

**Primary Engine:**
- `public/index.html` (29,891 lines)
- This is where 99% of game logic lives
- PvP, AI, Sandbox, all movement, all UI
- **Line 27533** is the main move execution handler

**Secondary Files:**
- `play.html` - Game Maker player
- `game-creator.js` - Game Maker tool
- Various helper scripts

---

## 🎮 Game Engine Quick Facts

**Architecture:**
- Single-file monolith (public/index.html)
- Event-driven (drag & drop)
- No external game engine framework
- Pure HTML/CSS/JavaScript

**Core Systems:**
- Movement: Lines 14000-15200
- Win Check: Line 25426
- Turn System: Line 23367
- AI: Lines 19835-21442
- UI: Lines 7300-12800

**Piece Types:**
- 5 types: Triangle, Square, Circle, Hexagon, Rhombus
- Each has unique movement patterns
- All defined in 14000-15200 range

---

## 🔍 Search Strategy

**For Functions:**
```javascript
Search: "function functionName"
Example: "function switchTurn"
```

**For UI Elements:**
```html
Search: "id=\"element-name\""
Example: "id=\"sandbox-tools-panel\""
```

**For Event Handlers:**
```javascript
Search: "addEventListener('event"
Example: "addEventListener('drop"
```

**For Piece Logic:**
```javascript
Search: "piece-type"
Example: "triangle-piece"
```

---

## 📮 Document Maintenance

**When adding new features:**
1. Update SEARCH_CHEATSHEET.md with new search terms
2. Add to GAME_ENGINE_ARCHITECTURE_MAP.md if major
3. Update line numbers if they shift significantly

**Last Updated:** November 2024  
**Coverage:** ~95% of critical systems  
**Main File:** public/index.html (29,891 lines)

---

## 🎉 You're Ready!

Pick a document and start exploring. The game engine is no longer a mystery - you have complete maps with precise coordinates.

**Happy coding!** 🚀

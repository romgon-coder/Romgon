# 🤖 How to Connect ChatGPT to Your Romgon Game

There are **3 ways** to use ChatGPT with your game:

---

## ✅ **Option 1: Manual Copy-Paste (Easiest - Works NOW!)**

**What you do:**
1. Open your game in browser
2. Ask ChatGPT: "Give me code to analyze my Romgon game position"
3. ChatGPT gives you JavaScript code
4. You paste it in browser console (F12)
5. Code runs and makes moves

**Example conversation:**

```
You: "I'm playing Romgon. Give me JavaScript code to get the 
      best move using window.RomgonEngine API"

ChatGPT: "Sure! Paste this in your browser console:

const moves = window.RomgonEngine.getSuggestedMoves(5);
console.log('Top 5 moves:', moves);
window.RomgonEngine.makeMove(moves[0].move);
"

You: [Opens game, presses F12, pastes code, press Enter]

Game: [AI makes suggested move! ✅]
```

**Pros:**
- ✅ Works immediately
- ✅ No installation needed
- ✅ Works with localhost

**Cons:**
- ❌ Manual copy-paste each move
- ❌ Not automated

---

## ✅ **Option 2: Python Bridge Script (Fully Automated!)**

**What you do:**
1. Install Python packages
2. Get OpenAI API key
3. Run the script
4. ChatGPT plays automatically!

### **Setup (One-Time):**

```powershell
# Install Python packages
pip install selenium openai

# Get OpenAI API key from: https://platform.openai.com/api-keys

# Set your API key (Windows PowerShell)
$env:OPENAI_API_KEY = "sk-your-key-here"

# Or set permanently:
# setx OPENAI_API_KEY "sk-your-key-here"
```

### **Run the Script:**

```powershell
# Start your game in browser first
# Then run:
python chatgpt-romgon-player.py
```

**What happens:**
1. Script opens your game in Chrome
2. Gets game state via API
3. Sends state to ChatGPT
4. ChatGPT analyzes and returns best move
5. Script executes move in game
6. Repeats until game over

**Pros:**
- ✅ Fully automated
- ✅ ChatGPT plays entire game
- ✅ You can watch it play
- ✅ Works with localhost

**Cons:**
- ❌ Requires OpenAI API key (costs money)
- ❌ Requires Python installation

---

## ✅ **Option 3: Custom GPT (Most Advanced)**

**Requirements:**
- Your game must be **publicly accessible** (not localhost)
- ChatGPT Plus subscription ($20/month)

### **Steps:**

1. **Deploy game to public URL:**
   ```
   Vercel: https://romgon.vercel.app
   Railway: https://romgon.railway.app
   GitHub Pages: https://yourusername.github.io/romgon
   ```

2. **Create Custom GPT:**
   - Go to: https://chat.openai.com/gpts/editor
   - Click "Create a GPT"
   - Name: "Romgon Master"
   - Description: "Expert Romgon player using Game Engine API"

3. **Add Instructions:**
   ```
   You are an expert Romgon player. You can analyze positions and suggest moves.

   When user shares a game URL, use Actions to:
   1. GET /api/game-state - Get current position
   2. POST /api/make-move - Execute moves

   Strategy:
   - Prioritize captures (150-180 points)
   - Threaten opponent rhombus (+400)
   - Protect your rhombus
   - Advance rhombus when safe
   ```

4. **Configure Actions:**
   ```json
   {
     "openapi": "3.0.0",
     "servers": [
       {"url": "https://romgon.vercel.app"}
     ],
     "paths": {
       "/api/game-state": {
         "get": {
           "operationId": "getGameState",
           "summary": "Get current game state"
         }
       },
       "/api/make-move": {
         "post": {
           "operationId": "makeMove",
           "summary": "Execute a move",
           "requestBody": {
             "required": true,
             "content": {
               "application/json": {
                 "schema": {
                   "properties": {
                     "move": {"type": "string"}
                   }
                 }
               }
             }
           }
         }
       }
     }
   }
   ```

**Pros:**
- ✅ Most seamless experience
- ✅ Just talk to GPT naturally
- ✅ No manual code execution

**Cons:**
- ❌ Requires public deployment
- ❌ Requires ChatGPT Plus
- ❌ Requires REST API setup

---

## 🎯 **Which Option Should You Use?**

### **Right Now (Testing):**
→ **Option 1: Manual Copy-Paste**
- No setup required
- Works immediately
- Perfect for testing

### **For Regular AI Games:**
→ **Option 2: Python Bridge Script**
- Fully automated
- ChatGPT plays entire games
- Great for testing AI quality

### **For Public Release:**
→ **Option 3: Custom GPT**
- Professional integration
- Anyone can use it
- Best user experience

---

## 🚀 **Quick Start: Option 2 (Python Script)**

### **1. Install Requirements:**

```powershell
# Install Python packages
pip install selenium openai

# Download ChromeDriver (if needed)
# Selenium Manager will handle this automatically in modern versions
```

### **2. Get OpenAI API Key:**

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

### **3. Set API Key:**

```powershell
# Windows PowerShell (temporary - this session only)
$env:OPENAI_API_KEY = "sk-your-key-here"

# Windows PowerShell (permanent)
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-your-key-here', 'User')

# Verify it's set
echo $env:OPENAI_API_KEY
```

### **4. Run the Script:**

```powershell
# Make sure your game is running on localhost:5500
# Then:
python chatgpt-romgon-player.py
```

### **5. Watch ChatGPT Play!**

The script will:
1. Open Chrome browser
2. Load your game
3. Analyze position
4. Ask ChatGPT for best move
5. Execute move
6. Repeat until game ends

**Console output:**
```
🎮 Starting ChatGPT Romgon Player...
✅ Game loaded!
🤖 ChatGPT is analyzing the position...

==================================================
Move 1 - ChatGPT's turn (Black)
==================================================
🤔 Asking ChatGPT for best move...
🎯 ChatGPT chose: 3-6→3-5
✅ Move executed: 3-6→3-5

⏳ Waiting for White (human) to move...

[continues...]
```

---

## 📊 **Cost Estimate (Option 2)**

**OpenAI API Pricing:**
- GPT-4: ~$0.03 per 1000 tokens
- GPT-3.5-turbo: ~$0.002 per 1000 tokens

**Per move:**
- Input: ~500 tokens (game state)
- Output: ~50 tokens (move notation)
- Cost: ~$0.015 per move (GPT-4) or ~$0.001 (GPT-3.5)

**Full game (40 moves):**
- GPT-4: ~$0.60
- GPT-3.5-turbo: ~$0.04

**Recommendation:** Use GPT-3.5-turbo for testing (way cheaper!)

---

## 🛠️ **Troubleshooting**

### **Error: "OPENAI_API_KEY not set"**
```powershell
# Set it:
$env:OPENAI_API_KEY = "sk-your-key-here"

# Verify:
echo $env:OPENAI_API_KEY
```

### **Error: "ChromeDriver not found"**
```powershell
# Install webdriver-manager
pip install webdriver-manager

# Or download manually from:
# https://chromedriver.chromium.org/
```

### **Error: "Game not loaded"**
- Make sure game is running on `http://localhost:5500/public/index.html`
- Check browser opens correctly
- Increase `time.sleep(3)` to `time.sleep(5)` in script

### **ChatGPT suggests illegal moves**
- Script automatically falls back to first legal move
- This is normal - GPT doesn't see the full board context
- It learns from the game state description

---

## 🎓 **How It Works (Technical)**

```
┌─────────────────┐
│ Python Script   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────────┐
│ Selenium        │ ---> │ Chrome Browser   │
│ WebDriver       │      │ (Your Game)      │
└────────┬────────┘      └─────────┬────────┘
         │                          │
         │                          ↓
         │               ┌──────────────────────┐
         │               │ window.RomgonEngine  │
         │               │ • getGameState()     │
         │               │ • getLegalMoves()    │
         │               │ • makeMove()         │
         │               └──────────┬───────────┘
         │                          │
         ↓                          ↓
┌─────────────────┐      ┌──────────────────────┐
│ Format state    │ <--- │ Game state (JSON)    │
│ for ChatGPT     │      └──────────────────────┘
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ OpenAI API      │
│ (ChatGPT)       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Best move       │
│ (notation)      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Execute via     │
│ Selenium        │
└─────────────────┘
```

---

## 🎉 **Summary**

**Easy Way (NOW):** 
- Ask ChatGPT for code → Paste in console → Manual

**Automated Way (BEST):**
- Run Python script → ChatGPT plays automatically → Watch it play

**Professional Way (LATER):**
- Deploy publicly → Create Custom GPT → Anyone can use

**Start with Option 2 (Python script) - it's the most fun!** 🤖🎮

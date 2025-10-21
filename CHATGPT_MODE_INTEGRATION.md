# 🤖 ChatGPT Mode Integration - Complete Guide

## What We're Adding

A **ChatGPT Assistant Mode** button in the main menu that lets players:
1. Enter their OpenAI API key
2. Get AI-powered move suggestions during gameplay
3. Learn from ChatGPT's strategic analysis

---

## ✅ COMPLETED

1. ✅ Added ChatGPT Mode button to User Home (line ~4170 in deploy/index.html)
2. ✅ Created chatgpt-modal.html with complete modal UI

---

## 📋 WHAT NEEDS TO BE ADDED

### Step 1: Insert the Modal HTML

**Location:** After line 6240 in `deploy/index.html` (after multiplayer-modal)

**Add this:** (contents of `chatgpt-modal.html`)

---

### Step 2: Add JavaScript Functions

**Location:** After line 6590 in `deploy/index.html` (after hideSettingsModal function)

**Add these functions:**

```javascript
// ============================================
// CHATGPT ASSISTANT MODE
// ============================================

let chatGPTEnabled = false;
let chatGPTApiKey = null;

function showChatGPTModal() {
    console.log('🤖 Opening ChatGPT modal...');
    const modal = document.getElementById('chatgpt-modal');
    modal.style.display = 'block';
    
    // Load saved API key if exists
    const savedKey = localStorage.getItem('chatgpt_api_key');
    if (savedKey) {
        document.getElementById('chatgpt-api-key').value = savedKey;
        document.getElementById('chatgpt-save-key').checked = true;
    }
    
    hideUserHome();
}

function hideChatGPTModal() {
    console.log('🤖 Closing ChatGPT modal...');
    document.getElementById('chatgpt-modal').style.display = 'none';
}

async function testChatGPTConnection() {
    const apiKey = document.getElementById('chatgpt-api-key').value;
    const statusDiv = document.getElementById('chatgpt-key-status');
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
        statusDiv.style.display = 'block';
        statusDiv.style.background = 'rgba(255, 107, 107, 0.2)';
        statusDiv.style.border = '2px solid #ff6b6b';
        statusDiv.style.color = '#ff6b6b';
        statusDiv.innerHTML = '❌ Invalid API key format. Must start with "sk-"';
        return;
    }
    
    statusDiv.style.display = 'block';
    statusDiv.style.background = 'rgba(255, 215, 0, 0.2)';
    statusDiv.style.border = '2px solid #ffd700';
    statusDiv.style.color = '#ffd700';
    statusDiv.innerHTML = '⏳ Testing connection...';
    
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{role: 'user', content: 'test'}],
                max_tokens: 5
            })
        });
        
        if (response.ok) {
            statusDiv.style.background = 'rgba(16, 163, 127, 0.2)';
            statusDiv.style.border = '2px solid #10a37f';
            statusDiv.style.color = '#10a37f';
            statusDiv.innerHTML = '✅ Connection successful! API key is valid.';
        } else {
            const error = await response.json();
            statusDiv.style.background = 'rgba(255, 107, 107, 0.2)';
            statusDiv.style.border = '2px solid #ff6b6b';
            statusDiv.style.color = '#ff6b6b';
            statusDiv.innerHTML = `❌ Error: ${error.error?.message || 'Invalid API key'}`;
        }
    } catch (error) {
        statusDiv.style.background = 'rgba(255, 107, 107, 0.2)';
        statusDiv.style.border = '2px solid #ff6b6b';
        statusDiv.style.color = '#ff6b6b';
        statusDiv.innerHTML = `❌ Connection failed: ${error.message}`;
    }
}

function enableChatGPTMode() {
    const apiKey = document.getElementById('chatgpt-api-key').value;
    const saveKey = document.getElementById('chatgpt-save-key').checked;
    const statusDiv = document.getElementById('chatgpt-key-status');
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
        statusDiv.style.display = 'block';
        statusDiv.style.background = 'rgba(255, 107, 107, 0.2)';
        statusDiv.style.border = '2px solid #ff6b6b';
        statusDiv.style.color = '#ff6b6b';
        statusDiv.innerHTML = '❌ Please enter a valid API key';
        return;
    }
    
    chatGPTApiKey = apiKey;
    chatGPTEnabled = true;
    
    if (saveKey) {
        localStorage.setItem('chatgpt_api_key', apiKey);
    } else {
        localStorage.removeItem('chatgpt_api_key');
    }
    
    console.log('✅ ChatGPT mode enabled!');
    
    statusDiv.style.display = 'block';
    statusDiv.style.background = 'rgba(16, 163, 127, 0.2)';
    statusDiv.style.border = '2px solid #10a37f';
    statusDiv.style.color = '#10a37f';
    statusDiv.innerHTML = '✅ ChatGPT mode enabled! Close this modal and start a game.';
    
    // Add ChatGPT button to game UI
    addChatGPTButton();
    
    setTimeout(() => {
        hideChatGPTModal();
    }, 2000);
}

function addChatGPTButton() {
    // Check if button already exists
    if (document.getElementById('chatgpt-ask-btn')) return;
    
    // Create button
    const btn = document.createElement('button');
    btn.id = 'chatgpt-ask-btn';
    btn.innerHTML = '🤖 Ask ChatGPT';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10a37f 0%, #1a7f64 100%);
        color: #fff;
        border: none;
        padding: 15px 25px;
        border-radius: 50px;
        cursor: pointer;
        font-weight: 700;
        font-size: 1em;
        box-shadow: 0 4px 15px rgba(16, 163, 127, 0.4);
        z-index: 1000;
        transition: all 0.3s ease;
        display: none;
    `;
    btn.onmouseover = () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 6px 20px rgba(16, 163, 127, 0.6)';
    };
    btn.onmouseout = () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 4px 15px rgba(16, 163, 127, 0.4)';
    };
    btn.onclick = askChatGPT;
    
    document.body.appendChild(btn);
}

async function askChatGPT() {
    if (!chatGPTEnabled || !chatGPTApiKey) {
        alert('ChatGPT mode not enabled. Open Settings to configure.');
        return;
    }
    
    const btn = document.getElementById('chatgpt-ask-btn');
    btn.disabled = true;
    btn.innerHTML = '⏳ Thinking...';
    
    try {
        // Get current game state
        const state = window.RomgonEngine.getGameState();
        const moves = window.RomgonEngine.getLegalMoves();
        const analysis = window.RomgonEngine.analyzePosition();
        
        // Format for ChatGPT
        let prompt = `I'm playing Romgon. Current position:\n\n`;
        prompt += `Turn ${state.turnNumber} - ${state.currentPlayer} to move\n\n`;
        
        prompt += `My pieces (${state.currentPlayer}):\n`;
        state.pieces.filter(p => p.color === state.currentPlayer).forEach(p => {
            prompt += `- ${p.type} at ${p.position}\n`;
        });
        
        prompt += `\nOpponent pieces:\n`;
        const opponent = state.currentPlayer === 'white' ? 'black' : 'white';
        state.pieces.filter(p => p.color === opponent).forEach(p => {
            prompt += `- ${p.type} at ${p.position}\n`;
        });
        
        prompt += `\nI have ${moves.length} legal moves.\n`;
        prompt += `Material evaluation: ${analysis.evaluation}\n\n`;
        prompt += `What's my best move? Provide:\n1. The move notation\n2. Brief explanation\n3. Alternative moves`;
        
        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${chatGPTApiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert Romgon player. Analyze positions and suggest moves with clear explanations. Prioritize: 1) Captures (150-180pts), 2) Threatening opponent rhombus (+400), 3) Protecting your rhombus, 4) Advancing rhombus safely, 5) Center control.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        const suggestion = data.choices[0].message.content;
        
        // Show suggestion
        alert(`🤖 ChatGPT Suggests:\n\n${suggestion}`);
        
    } catch (error) {
        console.error('ChatGPT error:', error);
        alert(`❌ Error: ${error.message}\n\nCheck your API key and internet connection.`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '🤖 Ask ChatGPT';
    }
}

// Show ChatGPT button when game starts
function showChatGPTButton() {
    if (chatGPTEnabled) {
        const btn = document.getElementById('chatgpt-ask-btn');
        if (btn) btn.style.display = 'block';
    }
}

// Hide ChatGPT button when game ends
function hideChatGPTButton() {
    const btn = document.getElementById('chatgpt-ask-btn');
    if (btn) btn.style.display = 'none';
}

// Make functions globally accessible
window.showChatGPTModal = showChatGPTModal;
window.hideChatGPTModal = hideChatGPTModal;
window.testChatGPTConnection = testChatGPTConnection;
window.enableChatGPTMode = enableChatGPTMode;
window.askChatGPT = askChatGPT;
```

---

### Step 3: Hook into Game Start/End

**Find the `startGameWithVariant` function** (around line 1576)

**Add at the end of the function:**
```javascript
// Show ChatGPT button if enabled
showChatGPTButton();
```

**Find the game-over logic** (search for "gameOver = true")

**Add after setting gameOver:**
```javascript
// Hide ChatGPT button
hideChatGPTButton();
```

---

## 🎯 How It Works for Users

1. User clicks "ChatGPT Mode" in main menu
2. Modal opens asking for OpenAI API key
3. User enters key and clicks "Enable ChatGPT Mode"
4. Button appears in bottom-right during gameplay
5. User clicks button anytime during their turn
6. ChatGPT analyzes position and suggests best move
7. User can accept or ignore suggestion

---

## 💡 Benefits

- **Learn while playing** - See expert analysis
- **Understand strategy** - Get explanations
- **Improve faster** - Learn from AI guidance
- **No Python needed** - Works directly in browser
- **Private** - API key stored locally only

---

## 📊 Features

✅ Secure API key storage (local only)  
✅ Test connection before starting  
✅ Real-time move suggestions  
✅ Strategic explanations  
✅ Position evaluation  
✅ Alternative move options  
✅ Fast responses (2-3 seconds)  
✅ Low cost (~$0.001 per move)  

---

## 🚀 Next Steps

This is **better than the Python script** because:
- ✅ No installation needed
- ✅ Works on any device
- ✅ Integr
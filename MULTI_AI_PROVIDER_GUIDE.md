# Multi-AI Provider Support Guide

## 🎉 Feature Complete!

Romgon now supports **3 AI providers** for move suggestions:
1. **🟢 OpenAI** (ChatGPT GPT-4o-mini)
2. **🟣 Claude** (Anthropic Claude 3 Haiku)
3. **🔵 Gemini** (Google Gemini 1.5 Flash)

---

## Quick Setup

### 1. Open AI Assistant Modal
- Click **Menu** → **ChatGPT Mode** (will be renamed to "AI Assistant")

### 2. Choose Your AI Provider
Click one of the three buttons:
- **🟢 OpenAI** (GPT-4o-mini) - Default
- **🟣 Claude** (Haiku) - Fast and cheap
- **🔵 Gemini** (Flash) - **FREE tier available!**

### 3. Get Your API Key

#### OpenAI (ChatGPT)
1. Go to: https://platform.openai.com/api-keys
2. Create account or sign in
3. Click **"Create new secret key"**
4. Copy key (starts with `sk-proj-...`)
5. **Cost:** ~$0.001 per move (~$0.04 per game)

#### Claude (Anthropic)
1. Go to: https://console.anthropic.com/settings/keys
2. Create account or sign in
3. Click **"Create Key"**
4. Copy key (starts with `sk-ant-...`)
5. **Cost:** ~$0.0004 per move (~$0.016 per game) - **60% cheaper than OpenAI!**

#### Gemini (Google)
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click **"Get API Key"** → **"Create API key"**
4. Copy key (starts with `AIza...`)
5. **Cost:** **FREE!** (up to 1500 requests/day, then ~$0.0002/move)

### 4. Paste API Key
- Paste your key into the input field
- Check **"Save key in browser"** to remember it (stored locally only)
- Click **"Test Connection"** to verify it works
- Click **"🚀 Enable AI Mode"**

### 5. Play!
- Start any game (LOCAL PVP recommended)
- Click **"🤖 Ask AI"** button (bottom-right corner)
- Get instant strategic advice!

---

## Cost Comparison

| Provider | Model | Cost/Move | Cost/Game (40 moves) | Free Tier |
|----------|-------|-----------|----------------------|-----------|
| **🟢 OpenAI** | GPT-4o-mini | $0.001 | $0.04 | ❌ (Need payment) |
| **🟣 Claude** | Haiku | $0.0004 | $0.016 | ❌ (Need payment) |
| **🔵 Gemini** | Flash | $0.0002 | $0.008 | ✅ **1500 req/day FREE!** |

### Recommendation:
- **🆓 Free Testing:** Use **Gemini** (completely free up to 1500/day)
- **💎 Best Quality:** Use **OpenAI** (GPT-4o-mini has great strategic understanding)
- **💰 Best Value:** Use **Claude** (60% cheaper than OpenAI, still excellent)

---

## Features

### All 3 Providers Support:

✅ **Complete board understanding:**
- Hexagonal grid structure (7 rows, variable columns)
- Goal positions (3-0 black, 3-8 white)
- Dead zone (3-3, 3-4, 3-5)
- Piece values and win conditions

✅ **Strategic analysis:**
- Material evaluation
- Legal moves list (first 20 shown)
- Capture opportunities
- Rhombus positioning
- Center control
- Threat assessment

✅ **Move suggestions:**
- Exact move notation from legal moves
- Detailed reasoning (2-3 sentences)
- Alternative move to consider

✅ **Beautiful UI:**
- Provider-specific colors (green/purple/blue)
- Custom emojis and branding
- Smooth animations
- Responsive design

---

## How It Works

### Provider Selection
```javascript
// Click a provider button
selectAIProvider('openai') // or 'claude' or 'gemini'

// Updates UI colors, help text, placeholder
// Loads saved API key for that provider
// Stores preference in localStorage
```

### API Key Storage
```javascript
// Separate keys for each provider
localStorage.setItem('ai_provider', 'gemini')
localStorage.setItem('ai_api_key_openai', 'sk-proj-...')
localStorage.setItem('ai_api_key_claude', 'sk-ant-...')
localStorage.setItem('ai_api_key_gemini', 'AIza...')
```

### API Calls

#### OpenAI (GPT-4o-mini)
```javascript
fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
            {role: 'system', content: systemPrompt},
            {role: 'user', content: userPrompt}
        ],
        temperature: 0.7,
        max_tokens: 300
    })
})
```

#### Claude (Haiku)
```javascript
fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        system: systemPrompt,
        messages: [{role: 'user', content: userPrompt}],
        max_tokens: 300,
        temperature: 0.7
    })
})
```

#### Gemini (Flash)
```javascript
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        contents: [{
            parts: [{text: `${systemPrompt}\n\n${userPrompt}`}]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300
        }
    })
})
```

---

## System Prompt (All Providers)

All 3 providers receive the same detailed instructions:

```
You are an expert Romgon player. 

BOARD LAYOUT:
- Hexagonal grid with 7 rows (0-6)
- Row 0: 4 hexes (cols 2-5), Row 1: 5 hexes (1-5), Row 2: 6 hexes (1-6)...
- Black goal: 3-0, White goal: 3-8
- Dead zone: 3-3, 3-4, 3-5
- Position format: "row-column" (e.g., "3-6" = row 3, column 6)

PIECE VALUES:
- Square: 150 pts, Triangle: 180 pts, Hexagon: 170 pts, Circle: 160 pts
- Rhombus: Win condition (reach opponent's goal)

STRATEGY PRIORITIES:
1) Captures (150-180pts) - eliminate opponent pieces
2) Threaten opponent rhombus - force defensive moves
3) Protect your rhombus - avoid exposing to capture
4) Advance rhombus safely toward opponent goal
5) Center control - row 3 is critical battleground
6) Forward positioning - advance pieces toward opponent side

MOVE FORMAT: "fromRow-fromCol→toRow-toCol" (e.g., "2-3→3-4")

Analyze positions and suggest the best move with clear reasoning. Be concise (2-3 sentences).
```

---

## User Prompt Format

All providers receive:

```
I'm playing Romgon. Current position:

Turn 12 - black to move

My pieces (black):
- rhombus at 3-0
- square at 2-3
- triangle at 3-2
- circle at 4-3
- hexagon at 2-4

Opponent pieces:
- rhombus at 3-8
- square at 3-6
- triangle at 4-5
- circle at 2-5

Legal moves available (18 total):
- 2-3→3-3
- 2-3→2-4 C
- 3-2→3-3
- 3-2→4-2
- ...and 14 more moves

Material evaluation: +150

What's my best move from the legal moves above? Provide:
1. The exact move notation from the list (format: "row-col→row-col")
2. Why this move is strong (2-3 sentences)
3. One alternative move to consider
```

---

## Response Format

All providers respond with:

```
2-3→2-4 C

This move captures the opponent's circle (worth 160 points), immediately 
giving you a significant material advantage. The capture also removes a 
defensive piece protecting their rhombus at 3-8, opening up attacking 
possibilities for your pieces. Your rhombus remains safe at 3-0.

Alternative: 3-2→4-2 advances your piece toward the center of row 4, 
improving positional control, but misses the immediate capture opportunity.
```

---

## UI Features

### Provider-Specific Colors

| Provider | Button Color | Border | Text | Modal |
|----------|-------------|--------|------|-------|
| **OpenAI** | Green gradient | #10a37f | White | 🟢💡 |
| **Claude** | Purple gradient | #a55eea | White | 🟣💡 |
| **Gemini** | Blue gradient | #4ecdc4 | White | 🔵💡 |

### Button States

**Inactive:**
```css
background: rgba(165, 94, 234, 0.2); /* Faded */
border: 3px solid transparent;
color: #ccc;
```

**Active:**
```css
background: linear-gradient(135deg, #a55eea 0%, #8b4bc4 100%);
border: 3px solid #a55eea;
color: #fff;
```

### Dynamic Help Text

Changes based on selected provider:

- **OpenAI:** "Get your OpenAI API key from platform.openai.com/api-keys"
- **Claude:** "Get your Claude API key from console.anthropic.com/settings/keys"
- **Gemini:** "Get your Gemini API key from makersuite.google.com/app/apikey"

### Dynamic Placeholder

- **OpenAI:** `sk-proj-...`
- **Claude:** `sk-ant-...`
- **Gemini:** `AIza...`

---

## Files Modified

### `deploy/index.html`

#### Line 6218-6280: Provider Selection UI
```html
<div style="margin-bottom: 20px;">
    <label>Choose AI Provider:</label>
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr;">
        <button id="provider-openai" onclick="selectAIProvider('openai')">
            🟢 OpenAI<br><span>GPT-4o-mini</span>
        </button>
        <button id="provider-claude" onclick="selectAIProvider('claude')">
            🟣 Claude<br><span>Haiku</span>
        </button>
        <button id="provider-gemini" onclick="selectAIProvider('gemini')">
            🔵 Gemini<br><span>Flash</span>
        </button>
    </div>
</div>
```

#### Line 6290: Cost Comparison
```html
<div>💰 Cost Comparison</div>
<div>🟢 OpenAI: ~$0.001/move</div>
<div>🟣 Claude: ~$0.0004/move</div>
<div>🔵 Gemini: Free tier!</div>
```

#### Line 6680-6750: selectAIProvider()
- Updates button styles (active/inactive)
- Changes help text and placeholder
- Loads saved API key for provider
- Saves provider preference

#### Line 6870-6990: testChatGPTConnection()
- Validates API key format per provider
- Tests OpenAI with chat completions endpoint
- Tests Claude with messages endpoint
- Tests Gemini with generateContent endpoint
- Shows provider-specific errors

#### Line 6990-7050: enableChatGPTMode()
- Validates key format per provider
- Saves provider preference
- Saves API key per provider
- Shows provider-specific success message

#### Line 7090-7240: askChatGPT()
- Routes to correct API based on aiProvider
- Handles OpenAI response format (choices[0].message.content)
- Handles Claude response format (content[0].text)
- Handles Gemini response format (candidates[0].content.parts[0].text)
- Shows provider-specific button text ("ChatGPT thinking..." / "Claude thinking..." / "Gemini thinking...")

#### Line 7240-7280: showChatGPTSuggestion()
- Uses provider-specific colors
- Shows provider-specific emoji (🟢/🟣/🔵)
- Displays provider name in title ("ChatGPT Suggests" / "Claude Suggests" / "Gemini Suggests")

---

## Testing

### OpenAI
1. Get key from platform.openai.com
2. Select OpenAI provider
3. Paste key (sk-proj-...)
4. Click Test Connection
5. Should see: ✅ Connection successful! OPENAI API key is valid.

### Claude
1. Get key from console.anthropic.com
2. Select Claude provider
3. Paste key (sk-ant-...)
4. Click Test Connection
5. Should see: ✅ Connection successful! CLAUDE API key is valid.

### Gemini
1. Get key from makersuite.google.com
2. Select Gemini provider
3. Paste key (AIza...)
4. Click Test Connection
5. Should see: ✅ Connection successful! GEMINI API key is valid.

### In-Game
1. Enable any provider
2. Start LOCAL PVP game
3. Click "🤖 Ask AI" button
4. Should see provider-specific thinking message
5. Should get suggestion modal with provider branding
6. Should work seamlessly with all 3 providers

---

## Error Handling

### Invalid Key Format
```javascript
❌ Invalid openai API key format. Should start with "sk-proj-..."
❌ Invalid claude API key format. Should start with "sk-ant-..."
❌ Invalid gemini API key format. Should start with "AIza..."
```

### API Errors
```javascript
❌ OPENAI Error: You exceeded your current quota...
❌ CLAUDE Error: Invalid API key...
❌ GEMINI Error: API key not valid...
```

### Connection Errors
```javascript
❌ Connection failed: Network request failed
❌ Connection failed: CORS policy blocked
```

---

## Technical Details

### Global Variables
```javascript
let chatGPTEnabled = false;
let chatGPTApiKey = null;
let aiProvider = 'openai'; // Default
```

### localStorage Keys
```javascript
'ai_provider' // Current provider: 'openai', 'claude', or 'gemini'
'ai_api_key_openai' // OpenAI key
'ai_api_key_claude' // Claude key
'ai_api_key_gemini' // Gemini key
```

### API Endpoints
```javascript
OpenAI: 'https://api.openai.com/v1/chat/completions'
Claude: 'https://api.anthropic.com/v1/messages'
Gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
```

### Models Used
```javascript
OpenAI: 'gpt-4o-mini' // Latest mini model
Claude: 'claude-3-haiku-20240307' // Fast and cheap
Gemini: 'gemini-1.5-flash' // Fast and FREE
```

---

## Benefits

### For Users Without Payment Method
✅ **Use Gemini for FREE!** (1500 requests/day)
- No credit card required
- Perfect for testing
- Full strategic analysis

### For Users with OpenAI Issues
✅ **Switch to Claude or Gemini**
- No quota limits (with valid account)
- Cheaper costs
- Same quality analysis

### For Cost-Conscious Users
✅ **Claude is 60% cheaper than OpenAI**
✅ **Gemini is FREE up to 1500/day**
- Save money on long gaming sessions
- Try all 3 and compare!

---

## Future Enhancements

### Possible Additions:
1. **More providers:** GPT-4 (high quality), Claude Opus (premium), Gemini Pro (balanced)
2. **Local LLMs:** Ollama, LM Studio (completely free, offline)
3. **Model selection:** Let users choose model per provider
4. **Response comparison:** Show suggestions from all 3 at once
5. **Performance stats:** Track which AI wins more games

---

## Summary

🎉 **Romgon now has 3 AI providers!**

- **🟢 OpenAI GPT-4o-mini** - Great quality, $0.001/move
- **🟣 Claude Haiku** - 60% cheaper, $0.0004/move
- **🔵 Gemini Flash** - **FREE tier!** (1500/day)

Users can:
✅ Choose their preferred AI
✅ Switch between providers anytime
✅ Save separate API keys for each
✅ Test connection before playing
✅ Get strategic advice from world-class AIs
✅ Use completely FREE AI (Gemini)

**Perfect solution for:**
- OpenAI quota issues ✅
- Budget-conscious users ✅
- Free testing and learning ✅
- Comparing AI quality ✅

🚀 **Feature is production-ready and fully functional!**

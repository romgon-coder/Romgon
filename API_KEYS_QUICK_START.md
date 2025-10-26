# 🚀 API Keys Quick Start Guide

## 5-Minute Setup

### Step 1: Log In (30 seconds)
1. Go to https://romgon-coder.github.io/Romgon/
2. Click **ACCOUNT** → **LOG IN**
3. Enter your credentials

### Step 2: Access API Keys (10 seconds)
1. Click **ADVANCED OPTIONS** in main menu
2. Click **🔑 API KEYS**
3. You're now in the management dashboard!

### Step 3: Generate Your First Key (2 minutes)
1. **Fill in the form:**
   - **Name:** `My First API Key`
   - **Expiration:** `30 days`
   - **Permissions:** Select `Read Games` and `Read Moves`

2. **Click "Generate API Key"**

3. **📋 IMPORTANT - Copy & Save:**
   ```
   API Key: rmg_abc123...
   Secret: xyz789...
   ```
   ⚠️ **The secret will NEVER be shown again!**

### Step 4: Test Your Key (2 minutes)
```bash
curl -X POST https://api.romgon.net/api/keys/validate \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_API_KEY_HERE",
    "secret": "YOUR_SECRET_HERE"
  }'
```

**Expected Response:**
```json
{
  "valid": true,
  "userId": 42,
  "keyName": "My First API Key",
  "permissions": ["read:games", "read:moves"]
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Chess Bot
**Permissions Needed:**
- ✅ Read Games
- ✅ Read Moves  
- ✅ Submit Moves

**Quick Code:**
```javascript
const apiKey = 'rmg_...';
const secret = '...';

async function makeMove(gameId, move) {
    const response = await fetch(`https://api.romgon.net/api/games/${gameId}/move`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
            'X-API-Secret': secret
        },
        body: JSON.stringify({ move })
    });
    return await response.json();
}
```

### Use Case 2: Statistics Dashboard
**Permissions Needed:**
- ✅ Read Games
- ✅ Read Users
- ✅ Read Statistics

**Quick Code:**
```javascript
async function getLeaderboard() {
    const response = await fetch('https://api.romgon.net/api/stats/leaderboard', {
        headers: {
            'X-API-Key': apiKey,
            'X-API-Secret': secret
        }
    });
    return await response.json();
}
```

---

## 🔐 Security Checklist

Before going live, ensure:

- [ ] API secret stored in environment variable (not hardcoded)
- [ ] Using HTTPS only
- [ ] Key has minimal required permissions
- [ ] Expiration date set (not "never")
- [ ] .env file in .gitignore
- [ ] Using try/catch for error handling
- [ ] Rate limiting implemented

---

## 📊 Permission Quick Reference

| Permission | What It Does | Use For |
|-----------|--------------|---------|
| `read:games` | View game data | Bots, Dashboards |
| `read:moves` | See move history | Analysis, Replay |
| `write:games` | Create games | Tournament Bots |
| `write:moves` | Submit moves | Playing Bots |
| `read:users` | User profiles | Stats, Leaderboards |
| `read:stats` | Global stats | Analytics |
| `read:custom_games` | Custom variants | Game Creator |
| `read:analysis` | Engine eval | Analysis Tools |

---

## ⚡ Quick Commands

### Generate Key (API)
```bash
curl -X POST https://api.romgon.net/api/keys/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Bot",
    "permissions": ["read:games", "write:moves"],
    "expiresIn": "30"
  }'
```

### List Your Keys
```bash
curl https://api.romgon.net/api/keys/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Revoke Key
```bash
curl -X DELETE https://api.romgon.net/api/keys/123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🐛 Common Issues

### Issue: "Invalid API key or secret"
**Fix:** Copy the exact key/secret, including the `rmg_` prefix

### Issue: "Permission denied"
**Fix:** Add the missing permission in dashboard → Edit Key

### Issue: "Key has expired"
**Fix:** Generate a new key with longer expiration

---

## 📚 Next Steps

1. **Read Full Docs:** `API_KEYS_DOCUMENTATION.md`
2. **Explore API:** https://romgon-coder.github.io/Romgon/game-engine-api.html
3. **Build Something:** Start with a simple stat reader
4. **Join Community:** Share your projects!

---

**Need Help?**  
- 📖 Documentation: Full API reference available
- 🎮 Dashboard: https://romgon-coder.github.io/Romgon/api-keys.html
- 🔧 Engine API: https://romgon-coder.github.io/Romgon/game-engine-api.html

**Happy Coding! 🚀**

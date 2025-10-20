# 🚀 Railway Environment Variables - Update Required

## Current Setup
Your backend uses `ALLOWED_ORIGINS` environment variable for CORS.

## What to Update on Railway

### ⚙️ Go to Railway Dashboard:

1. Open: https://railway.app/dashboard
2. Select your ROMGON Backend project
3. Click **Settings**
4. Scroll to **Environment Variables**
5. Find or create: `ALLOWED_ORIGINS`

### ✏️ Current Value (Old)
```
http://localhost:8000,http://localhost:3000,https://romgon.net,https://www.romgon.net,https://romgon-frontapi.vercel.app
```

### ✏️ New Value (Updated)
```
http://localhost:8000,http://localhost:3000,https://romgon.net,https://www.romgon.net,https://romgon-frontapi.vercel.app,https://api.romgon.net
```

### 📝 Steps:
1. Copy the new value above
2. In Railway, update the `ALLOWED_ORIGINS` variable
3. **Click Save** (auto-redeploy)
4. Wait for deployment to complete (1-2 minutes)

---

## ✅ Verification

After Railway redeploys, test with:

```bash
# Test API endpoint
curl https://api.romgon.net/api/health

# Should return:
# {"status":"ok","timestamp":"2025-10-20T..."}
```

---

## 📋 Summary of Changes Made

✅ **frontend/src/api/client.js**
- Changed: `https://romgon-api.up.railway.app/api` → `https://api.romgon.net/api`

✅ **frontend/src/api/websocket.js**
- Changed: `https://romgon-api.up.railway.app` → `https://api.romgon.net`

⏳ **Railway Environment Variable**
- Need to add: `https://api.romgon.net` to `ALLOWED_ORIGINS`

---

**Next Steps:**
1. Update Railway environment variable
2. Push code changes to GitHub
3. Wait for auto-deploy
4. Test the endpoint

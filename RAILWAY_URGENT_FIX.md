# 🚨 URGENT: Railway Backend Not Responding

**Date**: October 26, 2025  
**Issue**: api.romgon.net timing out - WebSocket and API requests failing

## Current Errors in Console:
```
❌ Chat connection error: websocket error
❌ Game socket connection error: websocket error
API Request Error: TypeError: Failed to fetch
Error: timeout at manager.js:141:38
```

## 🔧 IMMEDIATE FIXES NEEDED

### Step 1: Check Railway Dashboard
**Go to**: https://railway.app/dashboard

1. **Is the service running?** Look for green "Active" status
2. **Check deployment logs** - Click on the service → "Deployments" tab
3. **Look for errors** in the latest deployment

### Step 2: Required Environment Variables

Railway → Your Backend Service → Variables tab → Add these:

```env
PORT=3000
NODE_ENV=production
DATABASE_PATH=./romgon.db
JWT_SECRET=CHANGE_THIS_TO_RANDOM_64_CHAR_STRING
ALLOWED_ORIGINS=https://romgon.net,https://www.romgon.net
FRONTEND_URL=https://romgon.net
```

### Step 3: Verify Domain Configuration

Railway → Your Backend Service → Settings → Domains

- Should have: `api.romgon.net`
- Status should be: ✅ Active
- If not, add custom domain and point DNS

### Step 4: Force Redeploy

**Option A - From Dashboard:**
- Railway Dashboard → Your Service → "..." menu → "Redeploy"

**Option B - From Git:**
```bash
git commit --allow-empty -m "Trigger Railway redeploy"
git push
```

## 🐛 Common Railway Errors

### Error 1: "Cannot find module 'sqlite3'"
**Fix**: Add `nixpacks.toml` to root:
```toml
[phases.setup]
nixPkgs = ['nodejs-18_x', 'python39', 'gcc', 'gnumake']

[phases.install]
cmds = ['cd backend && npm install']

[start]
cmd = 'cd backend && npm start'
```

### Error 2: "EADDRINUSE: Port already in use"
**Fix**: Railway sets PORT automatically. Code already handles this correctly:
```javascript
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', ...);
```

### Error 3: "Database locked" or "SQLITE_BUSY"
**Fix**: Use Railway's persistent volume for database
- Railway Dashboard → Service → Data → Add Volume
- Mount path: `/app/backend`

## ✅ Verify Backend is Working

After deployment, test these URLs:

1. **Health Check**:
   ```
   https://api.romgon.net/api/health
   ```
   Should return: `{"status":"OK","timestamp":"...","uptime":...}`

2. **Database Check**:
   ```
   https://api.romgon.net/api/debug/database
   ```
   Should list database tables

3. **WebSocket Test**:
   Open browser console on romgon.net and check for:
   ```
   ✅ Game socket connected
   ✅ Chat socket connected
   ```

## 📊 Expected Railway Logs

When backend starts successfully, you should see:
```
✅ Database initialized successfully
✅ Custom games initialized
📡 Database tables created/verified
🌐 Socket.IO initialized
✅ Server running on port 3000
```

## 🚀 Quickest Fix Right Now

1. **Go to Railway Dashboard** → Your backend service
2. **Click "View Logs"** → Look for error messages
3. **Click "Redeploy"** button (three dots menu)
4. **Wait 2-3 minutes** for deployment
5. **Test** https://api.romgon.net/api/health
6. **Hard refresh** romgon.net (Ctrl+Shift+R)

## 📞 If Still Not Working

Check Railway logs and look for ONE of these:

- ❌ `EADDRINUSE` → Another service using the port
- ❌ `Cannot find module` → Dependency issue (check package.json)
- ❌ `SQLITE_ERROR` → Database initialization failed
- ❌ `ECONNREFUSED` → Not listening on 0.0.0.0
- ❌ Out of memory → Upgrade Railway plan

**Share the specific error** and we can fix it immediately!

---

**Quick Test Command**:
```bash
curl -v https://api.romgon.net/api/health
```

If this times out, backend is definitely not responding. Check Railway logs ASAP!

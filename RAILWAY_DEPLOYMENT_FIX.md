# 🚀 Railway Backend Deployment - URGENT FIX

## 🔴 Current Issue

The backend is returning **502 Bad Gateway** and **CORS errors** when accessed from the frontend.

**Error:**
```
Access to fetch at 'https://api.romgon.net/api/engine/stats' from origin 'https://romgon.net' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## ✅ Solution: Update Railway Environment Variables

### Step 1: Go to Railway Dashboard

1. Visit: https://railway.app/
2. Login to your account
3. Select your **ROMGON Backend** project

### Step 2: Update Environment Variables

Click on **"Variables"** tab and add/update these:

```bash
# Required Variables
PORT=3000
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_here_minimum_32_chars

# CRITICAL: Add ALL frontend origins
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000,https://localhost:5500,https://romgon.net,https://api.romgon.net,https://www.romgon.net,https://romgon-coder.github.io
```

### Step 3: Verify Git Push

The backend code is already updated and pushed. Railway should auto-deploy when it detects changes.

**Latest commits:**
- `5a6ca68` - Added WebSocket tracking
- `5c8986a` - Synced to public folder

### Step 4: Trigger Redeploy

If Railway doesn't auto-deploy:

1. Go to **Deployments** tab
2. Click **"Deploy"** button
3. Or click **"Redeploy"** on the latest deployment

### Step 5: Check Deployment Logs

1. Click on your latest deployment
2. Check **Build Logs** for errors
3. Check **Deploy Logs** to see:
   ```
   ✅ Server running on: http://localhost:3000
   ✅ Database connected
   ```

### Step 6: Verify Domain

1. Go to **Settings** → **Domains**
2. Verify `api.romgon.net` is pointing to your Railway service
3. Click **"Generate Domain"** if needed

## 🧪 Test Backend

Once deployed, test these endpoints:

```bash
# Health check
curl https://api.romgon.net/api/health

# Engine stats
curl https://api.romgon.net/api/engine/health

# Should return JSON, not 502
```

## 🎯 Expected Response

**Success (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2025-10-26T..."
}
```

**502 Bad Gateway** means:
- Backend is not running
- Wrong start command
- Port configuration issue

## 🔍 Troubleshooting

### Issue: 502 Bad Gateway

**Causes:**
1. Backend not running
2. Wrong PORT variable
3. Database connection failed
4. Build failed

**Fix:**
```bash
# Check Railway logs for:
1. "Server running on: http://localhost:3000"
2. "Database connected"
3. No error messages in logs
```

### Issue: CORS Error

**Cause:** Missing origin in `ALLOWED_ORIGINS`

**Fix:**
```bash
# Add to Railway environment variables:
ALLOWED_ORIGINS=https://romgon.net,https://www.romgon.net,https://romgon-coder.github.io
```

### Issue: Build Failed

**Check:**
1. `package.json` exists in `/backend` folder
2. `npm install` runs successfully
3. All dependencies are listed

**Fix:**
```bash
# In railway.json, verify:
"startCommand": "cd backend && npm install && npm start"
```

## 📋 Quick Checklist

- [ ] Railway project created
- [ ] Environment variables set:
  - [ ] `PORT=3000`
  - [ ] `NODE_ENV=production`
  - [ ] `JWT_SECRET=<secure_value>`
  - [ ] `ALLOWED_ORIGINS=<all_domains>`
- [ ] Latest code pushed to GitHub
- [ ] Railway connected to GitHub repo
- [ ] Deployment triggered
- [ ] Build completed successfully
- [ ] Deploy logs show "Server running"
- [ ] Domain `api.romgon.net` configured
- [ ] Health check returns 200 OK

## 🚀 Alternative: Manual Railway Setup

If auto-deploy isn't working:

### 1. Create New Service

```bash
# In Railway dashboard:
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your "Romgon" repository
4. Select "backend" as root directory
```

### 2. Configure Service

```bash
# Settings → General
Name: ROMGON Backend API
Root Directory: /backend

# Settings → Deploy
Build Command: npm install
Start Command: npm start

# Variables
(Add all environment variables listed above)
```

### 3. Add Custom Domain

```bash
# Settings → Domains
1. Click "Add Domain"
2. Enter: api.romgon.net
3. Copy the CNAME record
4. Add CNAME in your DNS provider:
   Name: api
   Value: <railway-url>.railway.app
```

## 🔄 After Deployment

1. **Wait 2-3 minutes** for DNS propagation
2. **Test health endpoint:**
   ```bash
   curl https://api.romgon.net/api/health
   ```
3. **Refresh Engine Analysis page:**
   - https://romgon-coder.github.io/Romgon/engine-analysis.html
4. **Check Connections tab** - Should show all green ✅

## 📞 Still Having Issues?

### Check Railway Logs

```bash
1. Railway Dashboard → Your Project
2. Click on latest deployment
3. View "Deploy Logs"
4. Look for error messages
```

### Common Errors

**"Cannot find module"**
```bash
Fix: npm install didn't run
Solution: Verify startCommand includes "npm install"
```

**"Port 3000 already in use"**
```bash
Fix: Multiple instances running
Solution: Stop old deployment
```

**"Database locked"**
```bash
Fix: SQLite write conflict
Solution: Restart deployment
```

## ✅ Success Indicators

When everything is working:

1. **Railway Logs:**
   ```
   ✅ Server running on: http://localhost:3000
   ✅ Connected to SQLite database
   ✅ Users table ready
   ✅ Games table ready
   ```

2. **Health Check:**
   ```bash
   curl https://api.romgon.net/api/health
   # Returns: {"status":"OK"}
   ```

3. **Engine Analysis:**
   - All tabs load successfully
   - No CORS errors in console
   - WebSocket shows "CONNECTED"
   - All stats populate

---

## 🎯 Summary

**Problem:** 502 Bad Gateway + CORS errors  
**Cause:** Backend not running or missing CORS origins  
**Solution:** Deploy to Railway with correct environment variables  

**Critical Environment Variable:**
```
ALLOWED_ORIGINS=https://romgon.net,https://www.romgon.net,https://romgon-coder.github.io
```

**Once deployed, the Engine Analysis dashboard will work perfectly!** 🎉

---

**Last Updated:** October 26, 2025  
**Status:** Waiting for Railway deployment

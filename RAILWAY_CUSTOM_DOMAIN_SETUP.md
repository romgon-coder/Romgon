# 🚀 Railway Custom Domain Setup Guide

## Step-by-Step: Point `api.romgon.net` to Railway Backend

### Prerequisites
- ✅ Railway account with deployed backend
- ✅ Cloudflare account managing `romgon.net`
- ✅ Current Railway URL: `https://romgon-api.up.railway.app`

---

## 🎯 Goal

Connect your custom domain `api.romgon.net` to Railway backend instead of using `romgon-api.up.railway.app`.

**Current**: `https://romgon-api.up.railway.app`  
**Target**: `https://api.romgon.net`

---

## 📋 Step 1: Get Railway's CNAME Target

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/dashboard
   - Select your ROMGON Backend project

2. **Navigate to Settings:**
   - Click **Settings** (gear icon)
   - Scroll to **Custom Domain** section

3. **Railway shows you a CNAME target:**
   - You'll see something like: `cname.railway.internal` or a Railway domain
   - **Copy this value** - you'll need it for Cloudflare

---

## 🌐 Step 2: Configure Cloudflare DNS Records

1. **Open Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com
   - Select your domain: `romgon.net`

2. **Go to DNS Records:**
   - Left sidebar → **DNS** → **Records**

3. **Add CNAME Record for API:**
   - Click **Add Record**
   - **Type**: CNAME
   - **Name**: `api` (this creates `api.romgon.net`)
   - **Target**: Paste Railway's CNAME target
   - **TTL**: Auto
   - **Proxy status**: Proxied (orange cloud) or DNS Only (gray cloud)
     - ⚠️ **Recommendation**: Use **DNS Only (gray)** for API
     - Reason: SSL/TLS handled by Railway
   - Click **Save**

4. **Your DNS records should now look like:**
   ```
   Type    Name              Target
   ─────────────────────────────────────────────────
   CNAME   www               cname.vercel-dns.com
   CNAME   api               cname.railway.internal (or Railway's target)
   A       @                 [Vercel IP]
   ```

---

## 🔐 Step 3: Enable SSL/TLS on Railway

1. **In Railway Dashboard:**
   - Go to Settings → **Custom Domain**

2. **Add Domain:**
   - Enter: `api.romgon.net`
   - Click **Add Domain**

3. **Railway will:**
   - ✅ Generate SSL certificate automatically
   - ✅ Set up HTTPS encryption
   - ✅ Update your backend to use this domain

---

## ⚙️ Step 4: Update Your Frontend API URL

**File**: `frontend/src/api/client.js`

Change the production API URL:

```javascript
// OLD
const API_BASE_URL = 
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://romgon-api.up.railway.app/api';

// NEW
const API_BASE_URL = 
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://api.romgon.net/api';
```

---

## ⚙️ Step 5: Update WebSocket URL

**File**: `frontend/src/api/websocket.js`

Change the WebSocket connection URL:

```javascript
// OLD
const SOCKET_URL = 
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://romgon-api.up.railway.app';

// NEW
const SOCKET_URL = 
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://api.romgon.net';
```

---

## 🔄 Step 6: Update CORS on Railway Backend

**File**: `backend/server.js`

Update the CORS allowed origins:

```javascript
// OLD
const allowedOrigins = [
  'http://localhost:8000',
  'http://localhost:3000',
  'https://romgon.net',
  'https://www.romgon.net',
  'https://romgon-frontapi.vercel.app'
];

// NEW
const allowedOrigins = [
  'http://localhost:8000',
  'http://localhost:3000',
  'https://romgon.net',
  'https://www.romgon.net',
  'https://romgon-frontapi.vercel.app',
  'https://api.romgon.net'
];
```

---

## 📤 Step 7: Deploy Changes

Push all changes to GitHub (auto-deploy both services):

```bash
git add -A
git commit -m "feat: Update API URLs to use custom domain api.romgon.net"
git push origin main
```

**This triggers:**
- ✅ Vercel redeploy (frontend)
- ✅ Railway redeploy (backend with new CORS)

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# Test API health endpoint
curl https://api.romgon.net/api/health

# Should return:
# {"status":"ok","timestamp":"2025-10-20T..."}

# Test WebSocket connection
# Open browser console on https://romgon.net and check Network tab
# Should see WebSocket connection to wss://api.romgon.net
```

---

## 🎯 Final DNS Setup

After all steps, your DNS should look like:

```
┌─────────────────────────────────────────────┐
│           romgon.net Domain                  │
├─────────────────────────────────────────────┤
│                                              │
│  Root (@):                                   │
│  ├─ A Record → Vercel IP (for romgon.net)   │
│  │                                           │
│  Subdomains:                                 │
│  ├─ www.romgon.net → Vercel (Frontend) ✅   │
│  ├─ api.romgon.net → Railway (Backend) ✅   │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 🚨 Troubleshooting

### API returns 404 or connection refused

**Issue**: Domain not yet propagated
- **Solution**: Wait 5-15 minutes for DNS propagation
- **Check**: `nslookup api.romgon.net` in terminal
- **Expected**: Should resolve to Railway's IP

### CORS error in browser console

**Issue**: `"Access to XMLHttpRequest blocked by CORS policy"`
- **Solution**: Check CORS in `backend/server.js` includes `https://api.romgon.net`
- **Verify**: Restart backend after changes

### SSL certificate error

**Issue**: `"SEC_ERROR_UNKNOWN_ISSUER"` or certificate warning
- **Solution**: Railway auto-generates cert, may take 5 minutes
- **Verify**: Use `https://api.romgon.net/api/health` (not http)

### WebSocket not connecting

**Issue**: `"WebSocket connection to 'wss://...' failed"`
- **Solution**: 
  1. Check `websocket.js` uses `https://api.romgon.net`
  2. Verify WebSocket is enabled in Railway settings
  3. Check no firewall blocking WebSocket traffic

---

## 📊 Before vs After

### Before (Current Setup)
```
Frontend: https://romgon.net (Vercel via Cloudflare)
Backend: https://romgon-api.up.railway.app (Direct Railway URL)
```

### After (Custom Domain Setup)
```
Frontend: https://romgon.net (Vercel via Cloudflare)
Backend: https://api.romgon.net (Railway via Cloudflare)
```

**Benefits:**
✅ Professional branding (all under romgon.net)
✅ Single domain for everything
✅ Easier to remember API URL
✅ Better for documentation
✅ Can easily switch backends later

---

## 🔧 Reference: Railway Custom Domain Configuration

| Setting | Value |
|---------|-------|
| Domain | api.romgon.net |
| Protocol | HTTPS (auto) |
| SSL/TLS | Automatic |
| Ports | 443 (standard) |
| Redirect HTTP | Yes (recommended) |

---

## ✨ Summary

1. ✅ Get Railway's CNAME target
2. ✅ Add CNAME record in Cloudflare for `api.romgon.net`
3. ✅ Enable custom domain in Railway settings
4. ✅ Update API URL in `frontend/src/api/client.js`
5. ✅ Update WebSocket URL in `frontend/src/api/websocket.js`
6. ✅ Add domain to CORS in `backend/server.js`
7. ✅ Push to GitHub (auto-deploy)
8. ✅ Test with `https://api.romgon.net/api/health`

**Estimated time**: 10-15 minutes  
**Difficulty**: Easy  
**Risk**: Low (no breaking changes)

---

**Made with 💚 by ROMGON Team**

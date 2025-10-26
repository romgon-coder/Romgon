# Vercel Deployment Checklist - Google OAuth Fixed

## Changes Made (Ready to Deploy)

### ✅ Fixed Files
- **`public/index.html`** - Removed Google One Tap, now uses backend OAuth flow
- **`frontend/index.html`** - Same fixes applied
- **`backend/routes/auth.js`** - Enhanced error handling for OAuth
- **`backend/.env`** - Google OAuth credentials configured

## Pre-Deployment Checklist

### 1. Environment Variables on Vercel
Make sure these are set in your Vercel backend project:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://api.romgon.net/api/auth/google/callback
FRONTEND_URL=https://romgon.net

# JWT Secret (use a strong secret in production)
JWT_SECRET=your_production_jwt_secret_here

# Allowed Origins
ALLOWED_ORIGINS=https://romgon.net,https://www.romgon.net,https://romgon-coder.github.io
```

### 2. Google Cloud Console - Authorized Redirect URIs
Ensure these URIs are added in Google Cloud Console:

**Project**: ROMGON (or your project name)  
**OAuth 2.0 Client ID**: Web application

**Authorized redirect URIs**:
- ✅ `https://api.romgon.net/api/auth/google/callback` (production)
- ✅ `http://localhost:3000/api/auth/google/callback` (local dev)

**Authorized JavaScript origins** (if needed):
- `https://romgon.net`
- `https://www.romgon.net`
- `http://localhost:8000` (local dev)

### 3. Files to Deploy

#### Backend (Railway/Vercel)
```
backend/
├── routes/auth.js ✅ Updated
├── .env ✅ Updated (add to Railway/Vercel env vars)
└── server.js (no changes)
```

#### Frontend (Vercel)
```
public/
└── index.html ✅ Updated - OAuth flow
```

## Deployment Commands

### Option 1: Git Push (Recommended)
```bash
# From project root
git add .
git commit -m "Fix: Migrate Google auth from One Tap to OAuth 2.0 flow"
git push origin main
```

Vercel will automatically deploy from your GitHub repository.

### Option 2: Vercel CLI
```bash
# Deploy frontend
cd public
vercel --prod

# Deploy backend (if using Vercel for backend)
cd ../backend
vercel --prod
```

## Testing After Deployment

### 1. Test Backend Health
```bash
curl https://api.romgon.net/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-10-26T...",
  "uptime": 123.45
}
```

### 2. Test Google OAuth Endpoint
Visit in browser: `https://api.romgon.net/api/auth/google`

**Expected**: Redirects to Google sign-in page  
**If misconfigured**: Returns JSON error with clear message

### 3. Test Full OAuth Flow
1. Visit `https://romgon.net`
2. Click **"Continue with Google"**
3. Should redirect to Google
4. Sign in with Google account
5. Should redirect back to `https://romgon.net?token=...`
6. Should be logged in ✅

### 4. Verify Console is Clean
Open browser console (F12):
- ❌ Should NOT see FedCM warnings
- ❌ Should NOT see "One-tap not shown"
- ✅ Should see "🔄 Initiating Google OAuth flow..."

## What Was Fixed

### Before (❌ Broken)
```javascript
// Used Google One Tap (deprecated)
google.accounts.id.initialize({ ... });
google.accounts.id.prompt(); // ❌ FedCM errors
```

**Issues**:
- FedCM network errors
- Deprecation warnings
- "One-tap not shown" errors

### After (✅ Fixed)
```javascript
// Uses backend OAuth 2.0 flow
window.location.href = `${apiUrl}/api/auth/google`;
```

**Benefits**:
- ✅ No FedCM warnings
- ✅ Future-proof
- ✅ Better security
- ✅ Clean console

## Rollback Plan (If Needed)

If something goes wrong:

### Quick Rollback via Git
```bash
git revert HEAD
git push origin main
```

### Vercel Rollback
1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Find previous working deployment
5. Click "..." → "Promote to Production"

## Environment-Specific URLs

| Environment | Frontend | Backend |
|-------------|----------|---------|
| Production | `https://romgon.net` | `https://api.romgon.net` |
| Local Dev | `http://localhost:8000` | `http://localhost:3000` |

## Post-Deployment Verification

- [ ] Backend health check returns OK
- [ ] Google OAuth redirects to Google
- [ ] After signing in, redirects back to frontend
- [ ] User is logged in successfully
- [ ] No FedCM warnings in console
- [ ] Email/Password login still works
- [ ] Guest mode still works

## Support Links

- **Google OAuth Setup**: `GOOGLE_OAUTH_SETUP.md`
- **FedCM Fix Details**: `FEDCM_WARNINGS_FIXED.md`
- **Quick Fix Guide**: `GOOGLE_SIGNIN_QUICK_FIX.md`

## Notes

### Production Domain Configuration
Make sure your production domain is configured correctly:

**Frontend URL**: `https://romgon.net`  
**Backend URL**: `https://api.romgon.net`  

If using different domains, update:
- `GOOGLE_REDIRECT_URI` in backend env vars
- `FRONTEND_URL` in backend env vars
- Authorized redirect URIs in Google Cloud Console

### CORS Configuration
Backend should allow requests from frontend:
```javascript
ALLOWED_ORIGINS=https://romgon.net,https://www.romgon.net
```

## Troubleshooting

### Issue: "Google sign-in not available"
**Cause**: Environment variables not set  
**Fix**: Add Google OAuth env vars to Vercel backend project

### Issue: "Redirect URI mismatch"
**Cause**: Google Cloud Console redirect URI doesn't match  
**Fix**: Add exact callback URL to Google Cloud Console

### Issue: CORS errors
**Cause**: Frontend domain not in ALLOWED_ORIGINS  
**Fix**: Add frontend URL to backend ALLOWED_ORIGINS env var

---

**Ready to Deploy**: ✅  
**Last Updated**: October 26, 2025  
**Changes**: Migrated from Google One Tap to OAuth 2.0 flow

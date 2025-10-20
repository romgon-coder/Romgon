# Vercel Configuration Guide

## Current Issue
Vercel cannot find `frontend/index.html` because it's looking in the root directory.

## Solution Options

### Option 1: Simple vercel.json (RECOMMENDED)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/index.html",
      "use": "@vercel/static"
    }
  ]
}
```

### Option 2: Via Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select ROMGON project
3. Settings → Build & Development Settings
4. Set **Root Directory** to: `frontend`
5. Save and redeploy

### Option 3: Copy frontend to public folder
```bash
cp -r frontend/* .
```

## Recommended: Use Dashboard Method
The cleanest approach is to use Vercel's dashboard UI to set the root directory.

## Testing After Fix
After fixing, visit: https://romgon.net
Should see: 🎮 ROMGON Login Page

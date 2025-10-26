# Railway Setup - Quick Steps

## ✅ Code Pushed to GitHub

Your changes are now live on GitHub. Railway will auto-deploy.

## 🚂 Next: Add Environment Variables to Railway

### Step 1: Go to Railway Dashboard
Visit: https://railway.app/

### Step 2: Open Your Backend Project
Click on your **backend** project (the Node.js server)

### Step 3: Add Variables
Click **Variables** tab, then add these 4 variables:

| Name | Value |
|------|-------|
| `GOOGLE_CLIENT_ID` | Copy from your local `backend/.env` |
| `GOOGLE_CLIENT_SECRET` | Copy from your local `backend/.env` |
| `GOOGLE_REDIRECT_URI` | `https://api.romgon.net/api/auth/google/callback` |
| `FRONTEND_URL` | `https://romgon.net` |

### Step 4: Railway Auto-Redeploys
After saving variables, Railway will automatically redeploy your backend.

### Step 5: Test
Visit: https://api.romgon.net/api/auth/google

**Expected**: Redirects to Google sign-in page ✅

## That's It!

Google OAuth will now work in production.

---

**Need the values?** Check your local file: `backend/.env`

# 🔐 Adding Google OAuth to Railway Backend

## Prerequisites
✅ You already created OAuth credentials in Google Cloud Console  
✅ Backend is deployed on Railway at `api.romgon.net`

---

## Step 1: Get Your Google Credentials

### From Google Cloud Console:
1. Go to: https://console.cloud.google.com/
2. Select your project (ROMGON)
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Click on it to view details

### Copy These Values:
```
Client ID: [Something like: 123456789-abcdefghijklm.apps.googleusercontent.com]
Client Secret: [Something like: GOCSPX-xxxxxxxxxxxxxxxxx]
```

---

## Step 2: Update Authorized Redirect URIs (IMPORTANT!)

In Google Cloud Console, make sure you have these redirect URIs:

### ✅ Add These URIs:
```
Production:
https://api.romgon.net/api/auth/google/callback

Development (if testing locally):
http://localhost:3000/api/auth/google/callback
```

### How to Add:
1. In Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs" click **+ ADD URI**
4. Paste: `https://api.romgon.net/api/auth/google/callback`
5. Click **SAVE**

⚠️ **This MUST match exactly or Google OAuth won't work!**

---

## Step 3: Add Environment Variables to Railway

### Go to Railway Dashboard:
1. Visit: https://railway.app/dashboard
2. Select your **ROMGON Backend** project
3. Click **Variables** tab (or Settings → Environment Variables)

### Add These 4 New Variables:

#### Variable 1: GOOGLE_CLIENT_ID
```
Name: GOOGLE_CLIENT_ID
Value: [Paste your Client ID from Google Console]
```

#### Variable 2: GOOGLE_CLIENT_SECRET
```
Name: GOOGLE_CLIENT_SECRET
Value: [Paste your Client Secret from Google Console]
```

#### Variable 3: GOOGLE_REDIRECT_URI
```
Name: GOOGLE_REDIRECT_URI
Value: https://api.romgon.net/api/auth/google/callback
```

#### Variable 4: FRONTEND_URL
```
Name: FRONTEND_URL
Value: https://romgon.net
```

### Click **Save** or **Add Variable** for each one

---

## Step 4: Railway Auto-Deploys

After adding variables, Railway will automatically redeploy your backend.

### Wait for deployment:
- Check the **Deployments** tab
- Wait until status shows: ✅ **Success**
- Usually takes 1-2 minutes

---

## Step 5: Test Google OAuth

### Test the Flow:
1. Go to https://romgon.net
2. Click **"Continue with Google"** button
3. Should redirect to Google sign-in page
4. Sign in with your Google account
5. Authorize ROMGON
6. Should redirect back to romgon.net and you're logged in! 🎉

### What Happens Behind the Scenes:
```
User clicks "Continue with Google"
    ↓
Redirects to: api.romgon.net/api/auth/google
    ↓
Redirects to: Google sign-in page
    ↓
User authorizes
    ↓
Google redirects to: api.romgon.net/api/auth/google/callback
    ↓
Backend creates/finds user, generates JWT token
    ↓
Redirects to: romgon.net?token=xxx
    ↓
Frontend stores token and logs user in ✅
```

---

## ✅ Summary of Environment Variables

Your Railway backend should now have:

```env
# Existing variables (keep these)
PORT=3000
DATABASE_URL=...
JWT_SECRET=...
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000,https://romgon.net,https://www.romgon.net

# NEW Google OAuth variables (add these)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_REDIRECT_URI=https://api.romgon.net/api/auth/google/callback
FRONTEND_URL=https://romgon.net
```

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution**: Check that the redirect URI in Google Console matches **exactly**:
```
https://api.romgon.net/api/auth/google/callback
```
(No trailing slash, no typos)

### Error: "OAuth client not configured"
**Solution**: Check that environment variables are set correctly in Railway

### Button does nothing or shows error
**Solution**: 
1. Check browser console for errors (F12)
2. Check Railway deployment logs
3. Make sure frontend is deployed with latest code

### Still not working?
1. Check Railway logs: Railway Dashboard → Deployments → View Logs
2. Look for "Google OAuth" errors
3. Verify all 4 environment variables are set

---

## 📱 Features Once Working

### ✅ Users Can:
- Sign in with one click using Google account
- No need to remember another password
- Auto-creates account on first Google sign-in
- Email from Google is used for account

### ✅ Guest Mode Also Works:
- Click "Play as Guest"
- No configuration needed for this
- Works immediately!

---

**Created**: October 20, 2025  
**Status**: Ready to Configure - Just add the 4 environment variables!

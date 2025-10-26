# Railway Environment Variables Setup

## After Deployment - Add These to Railway

Go to your Railway backend project and add these environment variables:

### Required Variables

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret-here
GOOGLE_REDIRECT_URI=https://api.romgon.net/api/auth/google/callback
FRONTEND_URL=https://romgon.net
```

**Note**: Use the actual values from your local `backend/.env` file

## How to Add Variables on Railway

1. Go to https://railway.app/
2. Click on your **backend project**
3. Click on **Variables** tab (or **Settings** → **Environment Variables**)
4. Click **+ New Variable**
5. Add each variable:
   - Name: `GOOGLE_CLIENT_ID`
   - Value: `your-client-id.apps.googleusercontent.com` (from backend/.env)
6. Repeat for:
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `FRONTEND_URL`
7. **Railway will automatically redeploy** after you save

## Verify After Deployment

1. Check deployment logs for:
   ```
   ✅ Server ready to accept connections!
   ```

2. Test OAuth endpoint:
   ```
   https://api.romgon.net/api/auth/google
   ```
   Should redirect to Google sign-in page

## That's It!

Once Railway redeploys, Google sign-in will work on production.

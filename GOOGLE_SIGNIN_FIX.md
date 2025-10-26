# Google Sign-In Fix

## Issue
**Error**: "Google sign-in failed: Endpoint not found"

## Root Cause
Google OAuth is not configured. The authentication endpoint exists, but it requires Google OAuth credentials (Client ID and Client Secret) to be set in the backend environment variables.

## Quick Fix

### Option 1: Configure Google OAuth (Recommended for Production)

1. **Get Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable "Google+ API" or "Google Identity Services"
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - Local: `http://localhost:3000/api/auth/google/callback`
     - Production: `https://api.romgon.net/api/auth/google/callback`
   - Copy the Client ID and Client Secret

2. **Update Backend Environment**:
   - Open `backend/.env`
   - Add your credentials:
     ```env
     GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your-client-secret-here
     GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
     FRONTEND_URL=http://localhost:8000
     ```

3. **Restart Backend Server**:
   ```bash
   cd backend
   npm start
   ```

### Option 2: Use Alternative Login Methods (Quick Workaround)

If you don't want to set up Google OAuth right now, users can still:

1. **Register with Email/Password**:
   - Use the traditional registration form
   - Create an account with username, email, and password

2. **Play as Guest**:
   - Click "Play as Guest" button
   - Get instant access with temporary account
   - Username format: `Guest_XXXXXX`

## Files Modified

✅ `backend/.env` - Added Google OAuth configuration placeholders  
✅ `backend/routes/auth.js` - Improved error messaging when OAuth is not configured

## Testing

After configuring Google OAuth:

1. Start backend: `cd backend && npm start`
2. Open frontend: `http://localhost:8000`
3. Click "Continue with Google"
4. Should redirect to Google sign-in page
5. After authorization, redirects back and logs you in

## Additional Documentation

- **Detailed Setup Guide**: `GOOGLE_OAUTH_SETUP.md`
- **Railway Deployment**: `GOOGLE_OAUTH_RAILWAY_SETUP.md`

## Status

- ✅ Backend routes configured correctly
- ✅ Frontend integration working
- ⚠️ **Requires**: Google OAuth credentials to be added to `.env` file
- ✅ Alternative login methods (Email/Guest) working

---

**Last Updated**: October 26, 2025  
**Priority**: Medium (Alternative login methods available)

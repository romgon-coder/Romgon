# Google OAuth Setup for ROMGON

## Overview
ROMGON now supports Google OAuth for easy sign-in!

## Backend Environment Variables

Add these to your Railway backend (or `.env` file for local development):

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=https://api.romgon.net/api/auth/google/callback
FRONTEND_URL=https://romgon.net
```

## How to Get Google OAuth Credentials

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project
- Click "Select a project" → "New Project"
- Name: "ROMGON"
- Click "Create"

### 3. Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click "Enable"

### 4. Create OAuth Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Application type: "Web application"
- Name: "ROMGON Web App"

### 5. Configure Authorized Redirect URIs
Add these URIs:
```
Production:
https://api.romgon.net/api/auth/google/callback

Local Development:
http://localhost:3000/api/auth/google/callback
```

### 6. Copy Credentials
- Copy the **Client ID**
- Copy the **Client Secret**
- Add them to your Railway environment variables

## Features

### ✅ What Works:
- **Google Sign In** - One-click authentication with Google account
- **Guest Mode** - Play without registration (username: Guest_XXXXXX)
- **Traditional Auth** - Email/password registration still works

### 🎮 User Experience:
1. User clicks "Continue with Google"
2. Redirects to Google sign-in page
3. User authorizes ROMGON
4. Redirects back with token
5. User is logged in and ready to play!

### 👤 Guest Mode:
- Click "Play as Guest"
- Auto-generates username like `Guest_a1b2c3`
- Can play games immediately
- Rating saved temporarily (cleared if not converted to full account)

## Testing Locally

1. Start backend: `cd backend && npm start`
2. Open: `http://localhost:3000`
3. Click "Continue with Google"
4. Should redirect through Google and back

## Security Notes

- ✅ Tokens are JWT-based
- ✅ Google IDs are stored securely
- ✅ Password not required for Google users
- ✅ Guest accounts use temporary tokens

## Support

If Google OAuth doesn't work:
- Check environment variables are set correctly
- Verify redirect URIs match exactly
- Check Google Cloud Console for API limits
- Review backend logs for errors

---

**Created**: October 20, 2025  
**Status**: Implemented and Ready to Configure

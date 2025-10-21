# 🚀 Production Deployment Guide - Active Games + Online Players

## Pre-Deployment Checklist ✅

### Frontend Changes:
- ✅ Backend URL set to `https://romgon-backend.railway.app`
- ✅ Guest support implemented (backend + offline modes)
- ✅ Active Games feature complete
- ✅ Match History feature complete
- ✅ Online Players tracking complete
- ✅ WebSocket real-time updates
- ✅ Frontend built to `public/` directory

### Backend Changes:
- ✅ Active Games API (`/api/games/active/:playerId`)
- ✅ Match History API (`/api/games/history/:playerId`)
- ✅ User Stats API (`/api/stats/player/:userId`)
- ✅ WebSocket game namespace (`/game`)
- ✅ Online players tracking
- ✅ Real-time event broadcasting
- ✅ Draw logic removed
- ✅ Database schema ready

---

## 📦 Files Modified (Summary)

### Frontend:
1. `deploy/index.html` (+500 lines)
   - Active Games section
   - Match History section
   - Online Players section
   - WebSocket integration
   - Guest support

2. `public/index.html` (built from deploy)

### Backend:
1. `backend/routes/games.js` (+191 lines)
   - GET /api/games/active/:playerId
   - GET /api/games/history/:playerId
   - Removed draw logic

2. `backend/websocket/gameSocket.js` (+60 lines)
   - Online players Map
   - Connection tracking
   - Event broadcasting

3. `backend/insert-test-data.js` (new file - for testing only)

---

## 🔧 Railway Backend Deployment

### Step 1: Check Railway Environment Variables

**Required variables (already set):**
```bash
DATABASE_URL=<sqlite-path>
JWT_SECRET=<your-secret>
NODE_ENV=production
PORT=3000
```

**New variables needed:**
```bash
FRONTEND_URL=https://romgon.net
```

### Step 2: Update Railway CORS Settings

The backend needs to allow requests from `romgon.net`. This should already be configured in `backend/server.js`, but verify:

```javascript
app.use(cors({
    origin: [
        'https://romgon.net',
        'http://localhost:3000',
        'http://127.0.0.1:5500'
    ],
    credentials: true
}));
```

### Step 3: Deploy Backend to Railway

```bash
# Navigate to backend directory
cd backend

# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "feat: Add Active Games, Online Players, and Guest Support

- Added Active Games API endpoint with opponent info
- Added Match History API with pagination
- Added User Stats API
- Implemented Online Players tracking via WebSocket
- Added real-time game updates
- Fixed guest authentication support
- Removed draw logic (Romgon has no draws)
- Enhanced WebSocket event system"

# Push to Railway
git push railway main
```

**Expected Railway logs:**
```
✅ Build successful
✅ Deployment started
✅ Server running on port 3000
✅ Database connected
✅ WebSocket server initialized
```

---

## 🌐 Vercel Frontend Deployment

### Step 1: Commit Frontend Changes

```bash
# From main project directory
cd "c:\Users\mansonic\Documents\Romgon Game"

# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "feat: Add Active Games, Online Players, and Guest Support UI

- Added Active Games lobby section
- Added Match History display with pagination
- Added Online Players tracking with real-time updates
- Implemented comprehensive guest support (online + offline)
- Added WebSocket real-time game synchronization
- Enhanced lobby UI with player cards
- Added challenge player placeholder
- Backend URL configured for production"

# Push to GitHub (Vercel auto-deploys from GitHub)
git push origin main
```

**Expected Vercel logs:**
```
✅ Build successful
✅ Deployment ready
✅ Domain: https://romgon.net
```

---

## 🧪 Post-Deployment Testing

### Test 1: Guest Login
1. Go to https://romgon.net
2. Click "Guest Login"
3. **Expected:** Guest account created via Railway backend
4. **Console:** "✅ Guest account created: {id: X, ...}"
5. Click "Lobby"
6. **Expected:** Online Players section shows "X Players Online"

### Test 2: Active Games
1. Login as registered user (or guest)
2. Click "Lobby"
3. **Expected:** "No active games" message
4. Start a new game
5. **Expected:** Game appears in Active Games section
6. **Expected:** Real-time updates via WebSocket

### Test 3: Online Players
1. Open two browser tabs/windows
2. Login as different users (or guests)
3. Click "Lobby" in both
4. **Expected:** Each sees the other in "X Players Online"
5. **Expected:** Player cards show username and rating
6. Close one tab
7. **Expected:** Other tab updates to "0 Players Online"

### Test 4: Match History
1. Finish a game
2. Click "Lobby"
3. Go to "Match History" tab
4. **Expected:** Completed game appears
5. **Expected:** Shows opponent, result, time

### Test 5: WebSocket Real-Time Updates
1. Two browsers, both in lobby
2. One player makes a move in active game
3. **Expected:** Other player's lobby updates instantly
4. **Expected:** Turn indicator changes
5. **Expected:** Time updates

---

## 🐛 Troubleshooting

### Issue: "0 Players Online"
**Possible causes:**
- WebSocket not connecting
- Railway backend not running
- CORS blocking WebSocket

**Debug:**
```javascript
// In browser console
console.log('Socket connected:', gameSocket?.connected);
console.log('Backend URL:', 'https://romgon-backend.railway.app');

// Test backend health
fetch('https://romgon-backend.railway.app/api/health')
    .then(r => r.json())
    .then(d => console.log('✅ Backend:', d))
    .catch(e => console.log('❌ Backend error:', e));
```

**Fix:**
- Check Railway logs: `railway logs`
- Verify WebSocket endpoint is accessible
- Check CORS settings in backend

---

### Issue: "Failed to fetch active games"
**Possible causes:**
- Backend API endpoint not deployed
- Database not connected
- Authentication issue

**Debug:**
```javascript
// In browser console
const userId = localStorage.getItem('userId');
const token = localStorage.getItem('token');

fetch(`https://romgon-backend.railway.app/api/games/active/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('✅ Active games:', d))
.catch(e => console.log('❌ Error:', e));
```

**Fix:**
- Verify backend deployment completed
- Check Railway database connection
- Test with valid userId

---

### Issue: "Guest login not working"
**Possible causes:**
- Backend guest endpoint not responding
- CORS issue
- Database write issue

**Debug:**
```javascript
// In browser console
fetch('https://romgon-backend.railway.app/api/auth/guest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(d => console.log('✅ Guest created:', d))
.catch(e => console.log('❌ Error:', e));
```

**Fix:**
- Check Railway logs for errors
- Verify guest creation route exists
- Check database permissions

---

## 📋 Railway-Specific Commands

### View Logs:
```bash
cd backend
railway logs
```

### Check Status:
```bash
railway status
```

### Open Railway Dashboard:
```bash
railway open
```

### Restart Service:
```bash
railway restart
```

### Environment Variables:
```bash
# List all
railway variables

# Add new variable
railway variables set FRONTEND_URL=https://romgon.net
```

---

## 🔍 Backend Health Checks

### Manual Test Endpoints:

1. **Health Check:**
   ```bash
   curl https://romgon-backend.railway.app/api/health
   ```
   Expected: `{"status":"ok","timestamp":"..."}`

2. **Active Games (with userId):**
   ```bash
   curl https://romgon-backend.railway.app/api/games/active/1
   ```
   Expected: `{"games":[...]}`

3. **Create Guest:**
   ```bash
   curl -X POST https://romgon-backend.railway.app/api/auth/guest
   ```
   Expected: `{"user":{...},"token":"..."}`

4. **WebSocket Test:**
   - Open browser console on https://romgon.net
   - Check: `gameSocket.connected` should be `true`

---

## 📊 Expected Railway Resources

### After Deployment:
- **Memory:** ~100-200 MB
- **CPU:** Minimal (idle)
- **Database Size:** Small (<10 MB initially)
- **WebSocket Connections:** 1 per online user

### Scaling Considerations:
- Railway free tier: Good for testing
- Production: Consider upgrading if >100 concurrent users
- WebSocket connections scale linearly with users

---

## ✅ Deployment Success Criteria

- [ ] Railway backend deployed successfully
- [ ] Backend health check returns 200 OK
- [ ] Vercel frontend deployed successfully
- [ ] Frontend loads at https://romgon.net
- [ ] Guest login creates backend account
- [ ] Active Games section displays
- [ ] Match History section displays
- [ ] Online Players section displays
- [ ] WebSocket connects successfully
- [ ] Real-time updates work between browsers
- [ ] No console errors
- [ ] Backend logs show connections

---

## 🚀 Final Deployment Commands

### 1. Deploy Backend to Railway:
```bash
cd backend
git add .
git commit -m "feat: Active Games + Online Players + Guest Support"
git push railway main
```

### 2. Deploy Frontend to Vercel (via GitHub):
```bash
cd ..
git add .
git commit -m "feat: Active Games + Online Players UI + Guest Support"
git push origin main
```

### 3. Verify Deployment:
```bash
# Check Railway
railway logs

# Test backend
curl https://romgon-backend.railway.app/api/health

# Test frontend
open https://romgon.net
```

---

## 📝 Post-Deployment Notes

### Test Data:
- Test users (TestAlice, TestBob, TestCharlie) are for **local testing only**
- They are **NOT** deployed to production
- Production starts with empty database
- First users will be real guests/registered users

### Features Now Live:
✅ Active Games with real-time updates  
✅ Match History with pagination  
✅ Online Players tracking  
✅ Guest support (online + offline)  
✅ WebSocket real-time synchronization  
✅ Turn indicators and time tracking  

### Next Features to Build:
- [ ] Create game button (challenge players)
- [ ] Accept/decline challenges
- [ ] Friend system
- [ ] Player profiles
- [ ] Chat in game rooms
- [ ] Spectator mode

---

## 🎉 Summary

**Total Changes:**
- Frontend: ~600 lines added
- Backend: ~250 lines added
- New features: 5 major systems
- Real-time capabilities: WebSocket integration
- Guest philosophy: Fully implemented

**Ready for Production:** ✅ YES

**Deployment Time:** ~5-10 minutes total

**Next Steps After Push:**
1. Wait for Railway deployment (~2 minutes)
2. Wait for Vercel deployment (~1 minute)
3. Test on https://romgon.net
4. Monitor Railway logs for any issues
5. Test with 2+ users for multiplayer features

---

**Good luck with the deployment! 🚀**

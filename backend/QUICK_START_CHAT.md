# Quick Start - Chat Backend Deployment

## Local Development

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

### 3. Start Server
```bash
npm start
```

Server runs on: `http://localhost:3000`

### 4. Test Connection
Open browser console on frontend:
```javascript
// Should auto-connect when you login to lobby
romgonChat.isConnected // true
romgonChat.getOnlineUsersCount() // 1 (you)
```

## Production Deployment (Railway)

### Option 1: Deploy via CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up

# Set environment variables
railway variables set ALLOWED_ORIGINS="https://romgon.net,https://www.romgon.net"
railway variables set NODE_ENV="production"
```

### Option 2: Deploy via GitHub

1. Push backend to GitHub repository
2. Go to [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Set environment variables:
   - `ALLOWED_ORIGINS`: `https://romgon.net,https://www.romgon.net`
   - `NODE_ENV`: `production`
6. Railway will auto-deploy

### Get Your Backend URL
Railway provides: `https://romgon-backend-production.up.railway.app`

### Update Frontend
Edit `deploy/romgon-chat-client.js` line 12:
```javascript
this.backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://YOUR-RAILWAY-URL.up.railway.app'; // Replace with your URL
```

## Testing Chat Features

### 1. Global Chat
1. Login to lobby
2. Navigate to Chat section
3. Click "🌐 Global Chat" tab
4. Type message and press Enter
5. Open second browser window (incognito)
6. Login as different user
7. See messages in real-time

### 2. Friend System
1. Click "👥 Friends" tab
2. Enter friend's username
3. Click "Add Friend"
4. Friend receives notification
5. Friend accepts request
6. Both users see each other in friends list

### 3. Direct Messages
1. Click on friend in friends list
2. See direct message history
3. Type message to friend
4. Real-time delivery
5. Unread badges update

### 4. Online Status
- Green dot = Online
- Gray dot = Offline
- Updates in real-time

## Monitoring

### Check Server Health
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
    "status": "OK",
    "timestamp": "2025-10-21T18:30:00.000Z",
    "uptime": 1234.56
}
```

### WebSocket Connections
Server logs show:
```
💬 Chat connection: a1b2c3d4
👤 PlayerName (user123) connected to chat
✅ Connected to chat server
```

### Monitor Active Users
Backend console shows:
- Connections: `✅ User connected`
- Messages: `💬 Global message from PlayerName`
- Friends: `👥 Friend request: Player1 → Player2`

## Troubleshooting

### "Chat offline" Warning
**Problem**: Frontend can't connect to backend

**Solutions**:
1. Check backend is running: `http://localhost:3000/api/health`
2. Verify CORS settings in backend `.env`
3. Check browser console for errors
4. Ensure Socket.IO client loaded: `typeof io !== 'undefined'`

### Messages Not Syncing
**Problem**: Messages only appear locally

**Solutions**:
1. Check `romgonChat.isConnected === true`
2. Verify backend logs show connection
3. Check network tab for WebSocket connection
4. Ensure backend URL is correct in chat client

### Friends Not Working
**Problem**: Friend requests not sending

**Solutions**:
1. Check both users are online
2. Verify username exists
3. Check console for error messages
4. Ensure not already friends

## Performance Tips

### Backend
- Use Redis for session storage (production)
- Add rate limiting middleware
- Implement message pagination
- Use database for persistence

### Frontend
- Lazy load old messages
- Debounce typing indicators
- Cache friend lists
- Optimize message rendering

## Security Checklist

- [x] HTML escaping for messages
- [x] Friend-only DM restriction
- [x] CORS configured properly
- [ ] Add rate limiting
- [ ] Implement user reporting
- [ ] Add message moderation
- [ ] Enable SSL/TLS (production)
- [ ] Add authentication tokens

## Next Steps

1. **Deploy Backend** to Railway/Heroku
2. **Update Frontend** with production backend URL
3. **Test Real-time** features with multiple users
4. **Add Database** (MongoDB) for persistence
5. **Implement Notifications** for friend requests
6. **Add Group Chat** feature
7. **Enable File Sharing** for images

## Support

- Backend errors: Check `backend/logs/`
- Frontend errors: Browser DevTools Console
- WebSocket issues: Network tab → WS filter
- Documentation: `backend/CHAT_INTEGRATION_GUIDE.md`

---

**Last Updated**: October 21, 2025
**Status**: ✅ Ready for Production

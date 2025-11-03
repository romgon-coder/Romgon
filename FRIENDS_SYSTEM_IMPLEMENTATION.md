# Friends & Social System Implementation

## Overview
Discord-like social system for Romgon with friends list, online status, private chat, and room sharing.

## Backend Status ✅
**Already Implemented** in `backend/websocket/chatSocket.js`:
- Friend requests (send, accept, reject)
- Friends list management
- Online/offline status tracking
- Direct messaging between friends
- Typing indicators
- Message history

## Frontend Requirements 📋

### 1. Lobby UI Components
- **Friends Panel** - Sidebar showing friends list
- **Online Players List** - All online users
- **Friend Requests** - Pending requests UI
- **Direct Chat** - Private messaging with friends
- **Add Friend Button** - Search and add by username

### 2. Features Section Updates
- Add "Friends" button under features
- Add "Online Players" button
- Integrate with existing global chat

### 3. Visual Design (Discord-like)
- Collapsible friends sidebar
- Online status indicators (green dot)
- Unread message badges
- Friend request notifications
- Room code sharing buttons

## Implementation Plan 🎯

### Phase 1: UI Structure
1. Create friends panel HTML structure
2. Add CSS styling (Discord-inspired)
3. Add toggle buttons to show/hide panels

### Phase 2: Socket Integration
4. Connect to `/chat` namespace
5. Emit `chat:userConnected` on lobby load
6. Listen for friends list updates
7. Listen for online status changes

### Phase 3: Friend Management
8. Add friend search/request UI
9. Accept/reject friend requests
10. Remove friends functionality
11. Display online/offline status

### Phase 4: Direct Messaging
12. Click friend to open DM
13. Send/receive private messages
14. Message notifications
15. Typing indicators

### Phase 5: Room Sharing
16. "Share Room Code" button in multiplayer lobby
17. Send room code via DM
18. Click room code to join game

## Socket Events Reference

### Emitting (Frontend → Backend)
```javascript
socket.emit('chat:userConnected', {userId, displayName, avatar, avatarType})
socket.emit('chat:sendFriendRequest', {targetUsername})
socket.emit('chat:acceptFriendRequest', {requestId})
socket.emit('chat:rejectFriendRequest', {requestId})
socket.emit('chat:removeFriend', {friendId})
socket.emit('chat:sendDirectMessage', {recipientId, message})
socket.emit('chat:loadDirectMessages', {friendId})
socket.emit('chat:markMessagesRead', {friendId})
socket.emit('chat:typing', {roomType, roomId})
socket.emit('chat:stopTyping', {roomType, roomId})
```

### Listening (Backend → Frontend)
```javascript
socket.on('chat:friendsList', data)
socket.on('chat:friendRequestReceived', request)
socket.on('chat:friendRequestSent', data)
socket.on('chat:friendAdded', data)
socket.on('chat:friendRemoved', data)
socket.on('chat:userOnline', data)
socket.on('chat:userOffline', data)
socket.on('chat:onlineCount', data)
socket.on('chat:directMessage', message)
socket.on('chat:directMessagesHistory', data)
socket.on('chat:messagesRead', data)
socket.on('chat:userTyping', data)
socket.on('chat:userStoppedTyping', data)
```

## File Locations
- Backend: `backend/websocket/chatSocket.js` ✅ (Already done)
- Frontend: `public/index.html` (Needs implementation)
- Styles: Inline CSS in index.html

## Current Status
- [x] Backend implementation complete
- [ ] Frontend UI structure
- [ ] Socket connection
- [ ] Friend management UI
- [ ] Direct messaging UI
- [ ] Room code sharing

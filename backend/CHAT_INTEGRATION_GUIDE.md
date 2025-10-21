# ROMGON Chat Backend - Complete Integration Guide

## Overview
Real-time chat and messaging system with WebSocket integration for ROMGON game platform.

## Features Implemented

### ✅ Global Chat
- Real-time messaging across all online users
- Message history (last 100 messages in memory)
- Online user count tracking
- Typing indicators
- Message timestamps with "time ago" display
- HTML escaping for security (XSS prevention)
- Auto-scroll to latest messages

### ✅ Friend System
- Send/accept/reject friend requests
- Friend list management
- Online/offline status indicators
- Unread message badges
- Friend removal

### ✅ Direct Messaging
- Private 1-on-1 chat between friends
- Message read receipts
- Unread message counters
- Message history per conversation
- Typing indicators in DMs

### ✅ User Presence
- Real-time online/offline status
- Connection/disconnection broadcasts
- Automatic status updates

## Backend Architecture

### WebSocket Namespace: `/chat`

All chat functionality runs on the `/chat` namespace separate from game logic.

### Event Reference

#### Client → Server Events

**Connection**
```javascript
socket.emit('chat:userConnected', {
    userId: 'user123',
    displayName: 'PlayerName',
    avatar: 'P'
});
```

**Global Chat**
```javascript
// Send message
socket.emit('chat:sendGlobalMessage', {
    message: 'Hello world!'
});

// Load history
socket.emit('chat:loadGlobalHistory');
```

**Friend Management**
```javascript
// Send friend request
socket.emit('chat:sendFriendRequest', {
    targetUsername: 'friend123'
});

// Accept request
socket.emit('chat:acceptFriendRequest', {
    requestId: 'req_123456789'
});

// Reject request
socket.emit('chat:rejectFriendRequest', {
    requestId: 'req_123456789'
});

// Remove friend
socket.emit('chat:removeFriend', {
    friendId: 'user456'
});
```

**Direct Messages**
```javascript
// Send DM
socket.emit('chat:sendDirectMessage', {
    recipientId: 'user456',
    message: 'Hey! Want to play?'
});

// Load DM history
socket.emit('chat:loadDirectMessages', {
    friendId: 'user456'
});

// Mark as read
socket.emit('chat:markMessagesRead', {
    friendId: 'user456'
});
```

**Typing Indicators**
```javascript
// Start typing
socket.emit('chat:typing', {
    roomType: 'global' // or 'direct'
    roomId: 'user456' // for direct messages
});

// Stop typing
socket.emit('chat:stopTyping', {
    roomType: 'global',
    roomId: 'user456'
});
```

#### Server → Client Events

**User Status**
```javascript
socket.on('chat:userOnline', (data) => {
    // { userId, displayName, avatar, timestamp }
});

socket.on('chat:userOffline', (data) => {
    // { userId, timestamp }
});

socket.on('chat:onlineCount', (data) => {
    // { count: 42, users: [...] }
});
```

**Messages**
```javascript
socket.on('chat:globalMessage', (data) => {
    // { id, userId, displayName, avatar, message, timestamp, type: 'global' }
});

socket.on('chat:globalHistory', (data) => {
    // { messages: [...] }
});

socket.on('chat:directMessage', (data) => {
    // { id, senderId, senderName, senderAvatar, recipientId, message, timestamp, type: 'direct', read: false }
});

socket.on('chat:directMessagesHistory', (data) => {
    // { friendId, messages: [...] }
});
```

**Friend Events**
```javascript
socket.on('chat:friendsList', (data) => {
    // { friends: [{ userId, isOnline }] }
});

socket.on('chat:friendRequestReceived', (data) => {
    // { id, from, fromName, to, timestamp, status: 'pending' }
});

socket.on('chat:friendRequestSent', (data) => {
    // { targetUserId, requestId }
});

socket.on('chat:friendAdded', (data) => {
    // { friendId, isOnline }
});

socket.on('chat:friendRemoved', (data) => {
    // { friendId }
});
```

**Errors**
```javascript
socket.on('chat:error', (data) => {
    // { error: 'Error message' }
});
```

## Frontend Integration

### 1. Include Dependencies

```html
<!-- Socket.IO Client -->
<script src="https://cdn.socket.io/4.6.1/socket.io.min.js"></script>

<!-- Chat Client -->
<script src="romgon-chat-client.js"></script>
```

### 2. Connect to Chat

```javascript
// Get user info
const user = JSON.parse(localStorage.getItem('romgon-user'));
const userId = user.userId || user.uid;
const displayName = user.displayName || user.email?.split('@')[0] || 'Guest';
const avatar = displayName.charAt(0).toUpperCase();

// Connect
romgonChat.connect(userId, displayName, avatar);
```

### 3. Setup Event Handlers

```javascript
// Online count
romgonChat.on('onlineCount', (data) => {
    document.getElementById('online-users-count').textContent = data.count;
});

// Global messages
romgonChat.on('globalMessage', (data) => {
    addMessageToUI(data);
});

// Friend requests
romgonChat.on('friendRequestReceived', (data) => {
    showNotification(`Friend request from ${data.fromName}`);
});
```

### 4. Send Messages

```javascript
// Global chat
romgonChat.sendGlobalMessage('Hello everyone!');

// Direct message
romgonChat.sendDirectMessage('user456', 'Hey, want to play?');

// Friend request
romgonChat.sendFriendRequest('playerName');
```

## Data Structures

### In-Memory Storage

```javascript
// Chat rooms
chatRooms = Map<roomId, Set<socketId>>

// User socket mapping
userSockets = Map<userId, socketId>

// Online users
onlineUsers = Set<userId>

// Global chat history
chatHistory = Map<roomId, Array<message>>

// Friend requests
friendRequests = Map<userId, Array<request>>

// Friends
userFriends = Map<userId, Array<friendId>>

// Direct messages
directMessages = Map<userId_userId, Array<message>>
```

### Message Object
```javascript
{
    id: 'msg_1234567890_abc123',
    userId: 'user123',
    displayName: 'Player',
    avatar: 'P',
    message: 'Hello!',
    timestamp: '2025-10-21T18:30:00.000Z',
    type: 'global' // or 'direct'
}
```

### Friend Request Object
```javascript
{
    id: 'req_1234567890',
    from: 'user123',
    fromName: 'Player1',
    to: 'user456',
    timestamp: '2025-10-21T18:30:00.000Z',
    status: 'pending'
}
```

## Backend Configuration

### Environment Variables

```env
# Backend URL
BACKEND_URL=http://localhost:3000

# Production URL
BACKEND_URL=https://romgon-backend.up.railway.app

# CORS Origins
ALLOWED_ORIGINS=http://localhost:5500,https://romgon.net
```

### Starting the Server

```bash
cd backend
npm install
npm start
```

Server runs on port 3000 by default.

### Chat Namespace Endpoint
```
ws://localhost:3000/chat
```

## Security Features

- ✅ HTML escaping for all user messages (XSS prevention)
- ✅ Friend-only direct messaging
- ✅ Message validation (empty check)
- ✅ User authentication required
- ✅ Rate limiting ready (can be added via middleware)

## Performance Optimizations

- ✅ Message history limited to 100 messages per room
- ✅ In-memory storage (fast access)
- ✅ Efficient Map/Set data structures
- ✅ Event-driven architecture
- ✅ Namespace isolation (chat separate from game)

## Future Enhancements

### Planned Features
- [ ] Database persistence (MongoDB)
- [ ] Message pagination
- [ ] File/image sharing
- [ ] Emoji reactions
- [ ] @mentions and notifications
- [ ] Chat moderation (ban/mute)
- [ ] Message search
- [ ] Voice chat integration
- [ ] Group chats
- [ ] Encrypted DMs

### Scalability
- [ ] Redis for distributed sessions
- [ ] Message queue (RabbitMQ/Kafka)
- [ ] Horizontal scaling with Socket.IO adapter
- [ ] Database sharding
- [ ] CDN for static assets

## Testing

### Manual Testing
1. Open two browser windows
2. Login as different users
3. Test global chat messages
4. Send friend requests
5. Accept and chat via DMs
6. Check online/offline status updates

### Backend Testing
```bash
cd backend
npm test
```

## Troubleshooting

### Connection Issues
- Check backend is running: `http://localhost:3000/api/health`
- Verify CORS settings allow frontend origin
- Check browser console for WebSocket errors
- Ensure Socket.IO client version matches server

### Message Not Appearing
- Check `romgonChat.isConnected` status
- Verify user is authenticated
- Check browser console for errors
- Ensure message is not empty

### Friend System Issues
- Verify both users are registered
- Check friend request was sent successfully
- Ensure users are not already friends
- Check console logs for error messages

## API Client Reference

### RomgonChatClient Class

```javascript
// Connection
connect(userId, displayName, avatar)
disconnect()

// Messaging
sendGlobalMessage(message)
sendDirectMessage(recipientId, message)
loadGlobalHistory()
loadDirectMessages(friendId)
markMessagesRead(friendId)

// Friends
sendFriendRequest(targetUsername)
acceptFriendRequest(requestId)
rejectFriendRequest(requestId)
removeFriend(friendId)

// Typing
startTyping(roomType, roomId)
stopTyping(roomType, roomId)

// Event Handlers
on(eventName, handler)
off(eventName, handler)

// Utilities
isUserOnline(userId)
isFriend(userId)
getUnreadCount(friendId)
getTotalUnreadCount()
getOnlineUsersCount()
getFriendsList()
```

## Documentation Version
- **Created**: October 21, 2025
- **Backend Version**: 1.0.0
- **Frontend Client**: romgon-chat-client.js v1.0.0
- **Socket.IO Version**: 4.6.1

---

**Status**: ✅ Production Ready
**Deployment**: Ready for Railway/Vercel deployment
**Integration**: Complete with frontend lobby UI

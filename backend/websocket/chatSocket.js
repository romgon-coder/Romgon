// ============================================
// CHAT WEBSOCKET HANDLER
// Real-time messaging and friend management
// ============================================

const { dbPromise } = require('../config/database');

const chatRooms = new Map(); // Map<roomId, Set<socketId>>
const userSockets = new Map(); // Map<userId, socketId>
const onlineUsers = new Set(); // Set<userId>
const friendRequests = new Map(); // Map<userId, Array<friendRequest>>
const userFriends = new Map(); // Map<userId, Array<friendId>>
const typingUsers = new Map(); // Map<roomId, Set<userId>>
const directMessages = new Map(); // Map<userId_userId, Array<message>>

// Maximum messages to keep in database
const MAX_HISTORY_SIZE = 100;

module.exports = (io) => {
    const chatNamespace = io.of('/chat');

    chatNamespace.on('connection', (socket) => {
        console.log(`💬 Chat connection: ${socket.id}`);

        // ============================================
        // USER CONNECTION & STATUS
        // ============================================

        socket.on('chat:userConnected', (data) => {
            const { userId, displayName, avatar } = data;
            
            // Store user mapping
            userSockets.set(userId, socket.id);
            onlineUsers.add(userId);
            
            // Store user info on socket
            socket.userId = userId;
            socket.displayName = displayName;
            socket.avatar = avatar;
            
            // Join global chat room
            socket.join('global-chat');
            
            console.log(`👤 ${displayName} (${userId}) connected to chat`);
            
            // Broadcast online status
            chatNamespace.emit('chat:userOnline', {
                userId,
                displayName,
                avatar,
                timestamp: new Date().toISOString()
            });
            
            // Send online users count
            socket.emit('chat:onlineCount', {
                count: onlineUsers.size,
                users: Array.from(onlineUsers)
            });
            
            // Load user's friends list
            const friends = userFriends.get(userId) || [];
            socket.emit('chat:friendsList', {
                friends: friends.map(friendId => ({
                    userId: friendId,
                    isOnline: onlineUsers.has(friendId)
                }))
            });
            
            // Load pending friend requests
            const requests = friendRequests.get(userId) || [];
            socket.emit('chat:friendRequests', { requests });
        });

        // ============================================
        // GLOBAL CHAT
        // ============================================

        socket.on('chat:sendGlobalMessage', async (data) => {
            const { message } = data;
            const userId = socket.userId;
            const displayName = socket.displayName;
            const avatar = socket.avatar;
            
            if (!message || !message.trim()) {
                return socket.emit('chat:error', { error: 'Message cannot be empty' });
            }
            
            try {
                // Save to database
                const result = await dbPromise.run(
                    'INSERT INTO global_messages (user_id, display_name, avatar, message, created_at) VALUES (?, ?, ?, ?, ?)',
                    [userId, displayName, avatar, message.trim(), new Date().toISOString()]
                );
                
                const messageData = {
                    id: result.id,
                    userId,
                    displayName,
                    avatar,
                    message: message.trim(),
                    timestamp: new Date().toISOString(),
                    type: 'global'
                };
                
                console.log(`💬 Global message from ${displayName}: ${message.substring(0, 50)}...`);
                
                // Broadcast to all users in global chat
                chatNamespace.to('global-chat').emit('chat:globalMessage', messageData);
                
                // Clean up old messages (keep last 100)
                await dbPromise.run(
                    'DELETE FROM global_messages WHERE id NOT IN (SELECT id FROM global_messages ORDER BY created_at DESC LIMIT ?)',
                    [MAX_HISTORY_SIZE]
                );
            } catch (error) {
                console.error('❌ Error saving global message:', error);
                socket.emit('chat:error', { error: 'Failed to send message' });
            }
        });

        socket.on('chat:loadGlobalHistory', async () => {
            try {
                // Load last 100 messages from database
                const messages = await dbPromise.all(
                    'SELECT id, user_id as userId, display_name as displayName, avatar, message, created_at as timestamp FROM global_messages ORDER BY created_at DESC LIMIT ?',
                    [MAX_HISTORY_SIZE]
                );
                
                // Reverse to show oldest first
                socket.emit('chat:globalHistory', {
                    messages: messages.reverse()
                });
                
                console.log(`📋 Loaded ${messages.length} messages for ${socket.displayName}`);
            } catch (error) {
                console.error('❌ Error loading global history:', error);
                socket.emit('chat:globalHistory', { messages: [] });
            }
        });

        // ============================================
        // FRIEND MANAGEMENT
        // ============================================

        socket.on('chat:sendFriendRequest', (data) => {
            const { targetUsername } = data;
            const senderId = socket.userId;
            const senderName = socket.displayName;
            
            if (!targetUsername) {
                return socket.emit('chat:error', { error: 'Username required' });
            }
            
            // TODO: Look up user by username from database
            // For now, simulate with userId
            const targetUserId = targetUsername; // In real implementation, look up from DB
            
            if (targetUserId === senderId) {
                return socket.emit('chat:error', { error: 'Cannot add yourself as friend' });
            }
            
            // Check if already friends
            const friends = userFriends.get(senderId) || [];
            if (friends.includes(targetUserId)) {
                return socket.emit('chat:error', { error: 'Already friends with this user' });
            }
            
            // Create friend request
            const request = {
                id: `req_${Date.now()}`,
                from: senderId,
                fromName: senderName,
                to: targetUserId,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };
            
            // Add to target's pending requests
            if (!friendRequests.has(targetUserId)) {
                friendRequests.set(targetUserId, []);
            }
            friendRequests.get(targetUserId).push(request);
            
            console.log(`👥 Friend request: ${senderName} → ${targetUserId}`);
            
            // Notify sender
            socket.emit('chat:friendRequestSent', {
                targetUserId,
                requestId: request.id
            });
            
            // Notify target if online
            const targetSocketId = userSockets.get(targetUserId);
            if (targetSocketId) {
                chatNamespace.to(targetSocketId).emit('chat:friendRequestReceived', request);
            }
        });

        socket.on('chat:acceptFriendRequest', (data) => {
            const { requestId } = data;
            const userId = socket.userId;
            
            // Find request
            const requests = friendRequests.get(userId) || [];
            const requestIndex = requests.findIndex(r => r.id === requestId);
            
            if (requestIndex === -1) {
                return socket.emit('chat:error', { error: 'Request not found' });
            }
            
            const request = requests[requestIndex];
            const friendId = request.from;
            
            // Add to both users' friend lists
            if (!userFriends.has(userId)) {
                userFriends.set(userId, []);
            }
            if (!userFriends.has(friendId)) {
                userFriends.set(friendId, []);
            }
            
            userFriends.get(userId).push(friendId);
            userFriends.get(friendId).push(userId);
            
            // Remove request
            requests.splice(requestIndex, 1);
            
            console.log(`✅ Friend request accepted: ${userId} ↔ ${friendId}`);
            
            // Notify both users
            socket.emit('chat:friendAdded', {
                friendId,
                isOnline: onlineUsers.has(friendId)
            });
            
            const friendSocketId = userSockets.get(friendId);
            if (friendSocketId) {
                chatNamespace.to(friendSocketId).emit('chat:friendAdded', {
                    friendId: userId,
                    isOnline: true
                });
            }
        });

        socket.on('chat:rejectFriendRequest', (data) => {
            const { requestId } = data;
            const userId = socket.userId;
            
            const requests = friendRequests.get(userId) || [];
            const requestIndex = requests.findIndex(r => r.id === requestId);
            
            if (requestIndex !== -1) {
                const request = requests[requestIndex];
                requests.splice(requestIndex, 1);
                
                console.log(`❌ Friend request rejected: ${userId} rejected ${request.from}`);
                
                socket.emit('chat:friendRequestRejected', { requestId });
            }
        });

        socket.on('chat:removeFriend', (data) => {
            const { friendId } = data;
            const userId = socket.userId;
            
            // Remove from both friend lists
            const userFriendsList = userFriends.get(userId) || [];
            const friendFriendsList = userFriends.get(friendId) || [];
            
            const userIndex = userFriendsList.indexOf(friendId);
            const friendIndex = friendFriendsList.indexOf(userId);
            
            if (userIndex !== -1) userFriendsList.splice(userIndex, 1);
            if (friendIndex !== -1) friendFriendsList.splice(friendIndex, 1);
            
            console.log(`💔 Friendship removed: ${userId} ↔ ${friendId}`);
            
            socket.emit('chat:friendRemoved', { friendId });
            
            const friendSocketId = userSockets.get(friendId);
            if (friendSocketId) {
                chatNamespace.to(friendSocketId).emit('chat:friendRemoved', { friendId: userId });
            }
        });

        // ============================================
        // DIRECT MESSAGING (FRIENDS)
        // ============================================

        socket.on('chat:sendDirectMessage', (data) => {
            const { recipientId, message } = data;
            const senderId = socket.userId;
            const senderName = socket.displayName;
            const senderAvatar = socket.avatar;
            
            if (!message || !message.trim()) {
                return socket.emit('chat:error', { error: 'Message cannot be empty' });
            }
            
            // Check if users are friends
            const friends = userFriends.get(senderId) || [];
            if (!friends.includes(recipientId)) {
                return socket.emit('chat:error', { error: 'Can only message friends' });
            }
            
            // Create DM room ID (consistent ordering)
            const roomId = [senderId, recipientId].sort().join('_');
            
            const messageData = {
                id: `dm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                senderId,
                senderName,
                senderAvatar,
                recipientId,
                message: message.trim(),
                timestamp: new Date().toISOString(),
                type: 'direct',
                read: false
            };
            
            // Store in DM history
            if (!directMessages.has(roomId)) {
                directMessages.set(roomId, []);
            }
            const dmHistory = directMessages.get(roomId);
            dmHistory.push(messageData);
            
            // Limit history
            if (dmHistory.length > MAX_HISTORY_SIZE) {
                dmHistory.shift();
            }
            
            console.log(`💌 DM: ${senderName} → ${recipientId}: ${message.substring(0, 50)}...`);
            
            // Send to sender (confirmation)
            socket.emit('chat:directMessage', messageData);
            
            // Send to recipient if online
            const recipientSocketId = userSockets.get(recipientId);
            if (recipientSocketId) {
                chatNamespace.to(recipientSocketId).emit('chat:directMessage', messageData);
            }
        });

        socket.on('chat:loadDirectMessages', (data) => {
            const { friendId } = data;
            const userId = socket.userId;
            
            // Create DM room ID
            const roomId = [userId, friendId].sort().join('_');
            const messages = directMessages.get(roomId) || [];
            
            socket.emit('chat:directMessagesHistory', {
                friendId,
                messages: messages.slice(-50) // Last 50 messages
            });
        });

        socket.on('chat:markMessagesRead', (data) => {
            const { friendId } = data;
            const userId = socket.userId;
            
            const roomId = [userId, friendId].sort().join('_');
            const messages = directMessages.get(roomId) || [];
            
            // Mark messages from friend as read
            messages.forEach(msg => {
                if (msg.recipientId === userId && msg.senderId === friendId) {
                    msg.read = true;
                }
            });
            
            // Notify friend
            const friendSocketId = userSockets.get(friendId);
            if (friendSocketId) {
                chatNamespace.to(friendSocketId).emit('chat:messagesRead', {
                    userId,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // ============================================
        // TYPING INDICATORS
        // ============================================

        socket.on('chat:typing', (data) => {
            const { roomType, roomId } = data;
            const userId = socket.userId;
            
            if (roomType === 'global') {
                chatNamespace.to('global-chat').emit('chat:userTyping', {
                    userId,
                    displayName: socket.displayName,
                    roomType: 'global'
                });
            } else if (roomType === 'direct') {
                const recipientSocketId = userSockets.get(roomId);
                if (recipientSocketId) {
                    chatNamespace.to(recipientSocketId).emit('chat:userTyping', {
                        userId,
                        displayName: socket.displayName,
                        roomType: 'direct'
                    });
                }
            }
        });

        socket.on('chat:stopTyping', (data) => {
            const { roomType, roomId } = data;
            const userId = socket.userId;
            
            if (roomType === 'global') {
                chatNamespace.to('global-chat').emit('chat:userStoppedTyping', { userId });
            } else if (roomType === 'direct') {
                const recipientSocketId = userSockets.get(roomId);
                if (recipientSocketId) {
                    chatNamespace.to(recipientSocketId).emit('chat:userStoppedTyping', { userId });
                }
            }
        });

        // ============================================
        // DISCONNECT
        // ============================================

        socket.on('disconnect', () => {
            const userId = socket.userId;
            
            if (userId) {
                console.log(`💬 ${socket.displayName} (${userId}) disconnected from chat`);
                
                // Remove from online users
                onlineUsers.delete(userId);
                userSockets.delete(userId);
                
                // Broadcast offline status
                chatNamespace.emit('chat:userOffline', {
                    userId,
                    timestamp: new Date().toISOString()
                });
                
                // Update online count
                chatNamespace.emit('chat:onlineCount', {
                    count: onlineUsers.size
                });
            }
        });

        // ============================================
        // ADMIN/MODERATION (Optional)
        // ============================================

        socket.on('chat:deleteMessage', (data) => {
            const { messageId, roomType } = data;
            const userId = socket.userId;
            
            // TODO: Check if user is admin/moderator
            
            if (roomType === 'global') {
                const history = chatHistory.get('global-chat') || [];
                const index = history.findIndex(m => m.id === messageId);
                
                if (index !== -1) {
                    history.splice(index, 1);
                    chatNamespace.to('global-chat').emit('chat:messageDeleted', {
                        messageId,
                        roomType: 'global'
                    });
                    console.log(`🗑️ Message ${messageId} deleted by ${userId}`);
                }
            }
        });
    });

    return chatNamespace;
};

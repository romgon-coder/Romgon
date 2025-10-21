// ============================================
// ROMGON CHAT CLIENT
// Frontend WebSocket integration for chat
// ============================================

class RomgonChatClient {
    constructor() {
        this.socket = null;
        this.userId = null;
        this.displayName = null;
        this.avatar = null;
        this.isConnected = false;
        this.messageHandlers = new Map();
        this.onlineUsers = new Set();
        this.friends = [];
        this.unreadMessages = new Map(); // friendId -> count
        this.currentChatWith = null;
        
        // Backend URL (adjust based on environment)
        this.backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000'
            : 'https://romgon-backend.up.railway.app'; // Adjust to your backend URL
    }

    // ============================================
    // CONNECTION MANAGEMENT
    // ============================================

    connect(userId, displayName, avatar) {
        if (this.isConnected) {
            console.log('💬 Already connected to chat');
            return;
        }

        this.userId = userId;
        this.displayName = displayName;
        this.avatar = avatar;

        console.log(`💬 Connecting to chat server: ${this.backendUrl}/chat`);

        // Connect to chat namespace
        this.socket = io(`${this.backendUrl}/chat`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.setupEventHandlers();

        // Send connection event
        this.socket.on('connect', () => {
            console.log('✅ Connected to chat server');
            this.isConnected = true;
            
            this.socket.emit('chat:userConnected', {
                userId: this.userId,
                displayName: this.displayName,
                avatar: this.avatar
            });
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from chat server');
            this.isConnected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Chat connection error:', error);
            // Fallback to offline mode
            this.isConnected = false;
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
            console.log('💬 Disconnected from chat');
        }
    }

    // ============================================
    // EVENT HANDLERS SETUP
    // ============================================

    setupEventHandlers() {
        // Online/Offline status
        this.socket.on('chat:userOnline', (data) => {
            this.onlineUsers.add(data.userId);
            this.handleEvent('userOnline', data);
        });

        this.socket.on('chat:userOffline', (data) => {
            this.onlineUsers.delete(data.userId);
            this.handleEvent('userOffline', data);
        });

        this.socket.on('chat:onlineCount', (data) => {
            this.handleEvent('onlineCount', data);
        });

        // Global chat messages
        this.socket.on('chat:globalMessage', (data) => {
            this.handleEvent('globalMessage', data);
        });

        this.socket.on('chat:globalHistory', (data) => {
            this.handleEvent('globalHistory', data);
        });

        // Direct messages
        this.socket.on('chat:directMessage', (data) => {
            // Increment unread count if not currently chatting with sender
            if (data.senderId !== this.userId && data.senderId !== this.currentChatWith) {
                const count = this.unreadMessages.get(data.senderId) || 0;
                this.unreadMessages.set(data.senderId, count + 1);
            }
            this.handleEvent('directMessage', data);
        });

        this.socket.on('chat:directMessagesHistory', (data) => {
            this.handleEvent('directMessagesHistory', data);
        });

        this.socket.on('chat:messagesRead', (data) => {
            this.handleEvent('messagesRead', data);
        });

        // Friend management
        this.socket.on('chat:friendsList', (data) => {
            this.friends = data.friends;
            this.handleEvent('friendsList', data);
        });

        this.socket.on('chat:friendRequestSent', (data) => {
            this.handleEvent('friendRequestSent', data);
        });

        this.socket.on('chat:friendRequestReceived', (data) => {
            this.handleEvent('friendRequestReceived', data);
        });

        this.socket.on('chat:friendRequests', (data) => {
            this.handleEvent('friendRequests', data);
        });

        this.socket.on('chat:friendAdded', (data) => {
            this.friends.push(data.friendId);
            this.handleEvent('friendAdded', data);
        });

        this.socket.on('chat:friendRemoved', (data) => {
            this.friends = this.friends.filter(f => f !== data.friendId);
            this.unreadMessages.delete(data.friendId);
            this.handleEvent('friendRemoved', data);
        });

        this.socket.on('chat:friendRequestRejected', (data) => {
            this.handleEvent('friendRequestRejected', data);
        });

        // Typing indicators
        this.socket.on('chat:userTyping', (data) => {
            this.handleEvent('userTyping', data);
        });

        this.socket.on('chat:userStoppedTyping', (data) => {
            this.handleEvent('userStoppedTyping', data);
        });

        // Errors
        this.socket.on('chat:error', (data) => {
            console.error('💬 Chat error:', data.error);
            this.handleEvent('error', data);
        });

        // Message deletion
        this.socket.on('chat:messageDeleted', (data) => {
            this.handleEvent('messageDeleted', data);
        });
    }

    // ============================================
    // MESSAGE SENDING
    // ============================================

    sendGlobalMessage(message) {
        if (!this.isConnected) {
            console.warn('💬 Not connected to chat server');
            return false;
        }

        this.socket.emit('chat:sendGlobalMessage', { message });
        return true;
    }

    sendDirectMessage(recipientId, message) {
        if (!this.isConnected) {
            console.warn('💬 Not connected to chat server');
            return false;
        }

        this.socket.emit('chat:sendDirectMessage', {
            recipientId,
            message
        });
        return true;
    }

    loadGlobalHistory() {
        if (!this.isConnected) return;
        this.socket.emit('chat:loadGlobalHistory');
    }

    loadDirectMessages(friendId) {
        if (!this.isConnected) return;
        
        this.currentChatWith = friendId;
        this.unreadMessages.set(friendId, 0); // Clear unread
        
        this.socket.emit('chat:loadDirectMessages', { friendId });
    }

    markMessagesRead(friendId) {
        if (!this.isConnected) return;
        this.socket.emit('chat:markMessagesRead', { friendId });
    }

    // ============================================
    // FRIEND MANAGEMENT
    // ============================================

    sendFriendRequest(targetUsername) {
        if (!this.isConnected) {
            console.warn('💬 Not connected to chat server');
            return false;
        }

        this.socket.emit('chat:sendFriendRequest', { targetUsername });
        return true;
    }

    acceptFriendRequest(requestId) {
        if (!this.isConnected) return;
        this.socket.emit('chat:acceptFriendRequest', { requestId });
    }

    rejectFriendRequest(requestId) {
        if (!this.isConnected) return;
        this.socket.emit('chat:rejectFriendRequest', { requestId });
    }

    removeFriend(friendId) {
        if (!this.isConnected) return;
        this.socket.emit('chat:removeFriend', { friendId });
    }

    // ============================================
    // TYPING INDICATORS
    // ============================================

    startTyping(roomType, roomId = null) {
        if (!this.isConnected) return;
        this.socket.emit('chat:typing', { roomType, roomId });
    }

    stopTyping(roomType, roomId = null) {
        if (!this.isConnected) return;
        this.socket.emit('chat:stopTyping', { roomType, roomId });
    }

    // ============================================
    // EVENT HANDLER REGISTRATION
    // ============================================

    on(eventName, handler) {
        if (!this.messageHandlers.has(eventName)) {
            this.messageHandlers.set(eventName, []);
        }
        this.messageHandlers.get(eventName).push(handler);
    }

    off(eventName, handler) {
        if (!this.messageHandlers.has(eventName)) return;
        
        const handlers = this.messageHandlers.get(eventName);
        const index = handlers.indexOf(handler);
        if (index !== -1) {
            handlers.splice(index, 1);
        }
    }

    handleEvent(eventName, data) {
        const handlers = this.messageHandlers.get(eventName);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in ${eventName} handler:`, error);
                }
            });
        }
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    isUserOnline(userId) {
        return this.onlineUsers.has(userId);
    }

    isFriend(userId) {
        return this.friends.includes(userId);
    }

    getUnreadCount(friendId) {
        return this.unreadMessages.get(friendId) || 0;
    }

    getTotalUnreadCount() {
        let total = 0;
        for (const count of this.unreadMessages.values()) {
            total += count;
        }
        return total;
    }

    getOnlineUsersCount() {
        return this.onlineUsers.size;
    }

    getFriendsList() {
        return this.friends.map(friendId => ({
            userId: friendId,
            isOnline: this.onlineUsers.has(friendId),
            unreadCount: this.unreadMessages.get(friendId) || 0
        }));
    }
}

// Create global chat client instance
const romgonChat = new RomgonChatClient();

// Make available globally
if (typeof window !== 'undefined') {
    window.romgonChat = romgonChat;
}

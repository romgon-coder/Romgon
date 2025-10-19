// ============================================
// WEBSOCKET CLIENT - Real-time Communication
// ============================================

class WebSocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.userId = null;
        this.currentGameId = null;
        this.listeners = {};
    }

    /**
     * Connect to WebSocket server
     */
    connect(userId) {
        return new Promise((resolve, reject) => {
            try {
                // Determine WebSocket URL
                const wsURL = this.getWebSocketURL();

                // Create connection
                this.socket = io(wsURL, {
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    reconnectionAttempts: 5
                });

                // Set user ID
                this.userId = userId;

                // Connection handlers
                this.socket.on('connect', () => {
                    console.log('✅ Connected to WebSocket');
                    this.connected = true;

                    // Notify server of user connection
                    this.socket.emit('userConnected', userId);

                    // Register event listeners
                    this.setupEventListeners();

                    resolve();
                });

                this.socket.on('disconnect', () => {
                    console.log('❌ Disconnected from WebSocket');
                    this.connected = false;
                    this.emit('disconnected', {});
                });

                this.socket.on('connect_error', (error) => {
                    console.error('❌ Connection error:', error);
                    reject(new Error(`WebSocket connection failed: ${error}`));
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Get WebSocket URL based on environment
     */
    getWebSocketURL() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        }
        // Production - Railway backend
        return 'https://romgon-api.up.railway.app';
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // User status changes
        this.socket.on('userStatusChanged', (data) => {
            this.emit('userStatusChanged', data);
        });

        // Game events
        this.socket.on('playerJoined', (data) => {
            this.emit('playerJoined', data);
        });

        this.socket.on('moveMade', (data) => {
            this.emit('moveMade', data);
        });

        this.socket.on('playerLeft', (data) => {
            this.emit('playerLeft', data);
        });

        this.socket.on('gameStateUpdated', (data) => {
            this.emit('gameStateUpdated', data);
        });

        this.socket.on('timeUpdated', (data) => {
            this.emit('timeUpdated', data);
        });

        this.socket.on('chatMessage', (data) => {
            this.emit('chatMessage', data);
        });

        this.socket.on('gameEnded', (data) => {
            this.emit('gameEnded', data);
        });
    }

    /**
     * Join game room
     */
    joinGame(gameId) {
        if (!this.connected) {
            throw new Error('WebSocket not connected');
        }

        this.currentGameId = gameId;
        this.socket.emit('joinGame', {
            gameId,
            userId: this.userId
        });
    }

    /**
     * Send game move
     */
    sendMove(move) {
        if (!this.connected || !this.currentGameId) {
            throw new Error('Not connected to game');
        }

        this.socket.emit('gameMove', {
            gameId: this.currentGameId,
            userId: this.userId,
            move
        });
    }

    /**
     * Send chat message
     */
    sendChatMessage(content) {
        if (!this.connected || !this.currentGameId) {
            throw new Error('Not connected to game');
        }

        this.socket.emit('sendMessage', {
            gameId: this.currentGameId,
            userId: this.userId,
            content
        });
    }

    /**
     * Leave game
     */
    leaveGame() {
        if (!this.connected || !this.currentGameId) {
            return;
        }

        this.socket.emit('leaveGame', {
            gameId: this.currentGameId,
            userId: this.userId
        });

        this.currentGameId = null;
    }

    /**
     * Register event listener
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Unregister event listener
     */
    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    /**
     * Emit local event
     */
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.userId = null;
            this.currentGameId = null;
        }
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.connected && this.socket?.connected;
    }
}

// Export WebSocket client instance
const wsClient = new WebSocketClient();

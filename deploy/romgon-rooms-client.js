// ============================================
// ROMGON ROOMS & MATCHMAKING CLIENT
// ============================================

// Use BACKEND_API_URL from global scope (defined in index.html)
// Derive WebSocket URL from BACKEND_API_URL
function getBackendAPIURL() {
    return typeof BACKEND_API_URL !== 'undefined' ? BACKEND_API_URL : 'https://api.romgon.net';
}

function getWebSocketURL() {
    const apiUrl = getBackendAPIURL();
    return apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');
}

class RoomClient {
    constructor() {
        this.socket = null;
        this.currentRoom = null;
        this.isInMatchmaking = false;
        this.matchmakingInterval = null;
    }

    // ============================================
    // CONNECTION
    // ============================================

    connect() {
        if (this.socket?.connected) {
            console.log('✅ Already connected to game server');
            return;
        }

        const token = localStorage.getItem('romgon-jwt');
        if (!token) {
            console.error('❌ No JWT token found');
            return;
        }

        // Decode JWT to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        const { userId, username } = payload;

        console.log('🔌 Connecting to game server...', { userId, username });

        const wsUrl = getWebSocketURL();
        console.log('🔌 WebSocket URL:', wsUrl);

        this.socket = io(`${wsUrl}/game`, {
            auth: {
                userId,
                username,
                rating: 1600
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ Connected to game server:', this.socket.id);
            // Clear any error messages
            if (typeof showMultiplayerConnectionStatus === 'function') {
                showMultiplayerConnectionStatus('connected', 'Connected to server');
            }
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from game server');
            if (typeof showMultiplayerConnectionStatus === 'function') {
                showMultiplayerConnectionStatus('disconnected', 'Disconnected from server');
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error);
            
            // Show user-friendly error message
            const errorMsg = 'Unable to connect to multiplayer server. The server may be starting up or temporarily unavailable. Please try again in a moment.';
            
            if (typeof showMultiplayerConnectionStatus === 'function') {
                showMultiplayerConnectionStatus('error', errorMsg);
            }
            
            // Also show in UI if we're in the multiplayer modal
            const errorElement = document.getElementById('mp-error-message');
            if (errorElement && errorElement.offsetParent !== null) {
                errorElement.textContent = errorMsg;
                errorElement.style.display = 'block';
            }
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('❌ Failed to reconnect to server');
            const errorMsg = 'Failed to connect to multiplayer server after multiple attempts. Please try again later.';
            
            if (typeof showMultiplayerConnectionStatus === 'function') {
                showMultiplayerConnectionStatus('error', errorMsg);
            }
        });

        // Room events
        this.socket.on('room:playerJoined', (data) => {
            console.log('👤 Player joined room:', data);
            this.onPlayerJoinedRoom(data);
        });

        this.socket.on('room:playerLeft', (data) => {
            console.log('👋 Player left room:', data);
            this.onPlayerLeftRoom(data);
        });

        this.socket.on('room:playerReady', (data) => {
            console.log('✅ Player ready:', data);
            this.onPlayerReady(data);
        });

        this.socket.on('room:gameStarted', (data) => {
            console.log('🎮 Game started!', data);
            this.onGameStarted(data);
        });

        this.socket.on('room:state', (data) => {
            console.log('📋 Room state:', data);
            this.currentRoom = data.room;
            this.updateRoomUI(data.room);
        });

        // Matchmaking events
        this.socket.on('matchmaking:status', (data) => {
            console.log('🔍 Matchmaking status:', data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // ============================================
    // ROOM MANAGEMENT
    // ============================================

    async createRoom(options = {}) {
        try {
            const token = localStorage.getItem('romgon-jwt');
            const response = await fetch(`${getBackendAPIURL()}/api/rooms/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(options)
            });

            const data = await response.json();

            if (data.success) {
                this.currentRoom = data.room;
                this.socket.emit('room:join', { roomCode: data.room.code });
                console.log('✅ Room created:', data.room.code);
                return data.room;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Error creating room:', error);
            throw error;
        }
    }

    async joinRoom(roomCode) {
        try {
            const token = localStorage.getItem('romgon-jwt');
            const response = await fetch(`${getBackendAPIURL()}/api/rooms/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ roomCode: roomCode.toUpperCase() })
            });

            const data = await response.json();

            if (data.success) {
                this.currentRoom = data.room;
                this.socket.emit('room:join', { roomCode: data.room.code });
                console.log('✅ Joined room:', data.room.code);
                return data.room;
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Error joining room:', error);
            throw error;
        }
    }

    async leaveRoom() {
        if (!this.currentRoom) return;

        try {
            const token = localStorage.getItem('romgon-jwt');
            const roomCode = this.currentRoom.code;
            
            const response = await fetch(`${getBackendAPIURL()}/api/rooms/${roomCode}/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                this.socket.emit('room:leave', { roomCode });
                this.currentRoom = null;
                console.log('✅ Left room');
            }
        } catch (error) {
            console.error('❌ Error leaving room:', error);
        }
    }

    async setReady(ready) {
        if (!this.currentRoom) return;

        try {
            const token = localStorage.getItem('romgon-jwt');
            const roomCode = this.currentRoom.code;
            
            const response = await fetch(`${getBackendAPIURL()}/api/rooms/${roomCode}/ready`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ ready })
            });

            const data = await response.json();

            if (data.success) {
                this.socket.emit('room:ready', { roomCode, ready });
                
                if (data.gameStarted) {
                    this.socket.emit('room:gameStarted', { roomCode, gameId: data.gameId });
                    this.onGameStarted({ gameId: data.gameId });
                }
                
                console.log('✅ Ready status updated:', ready);
                return data;
            }
        } catch (error) {
            console.error('❌ Error setting ready:', error);
        }
    }

    async getRoomInfo(roomCode) {
        try {
            const token = localStorage.getItem('romgon-jwt');
            const response = await fetch(`${getBackendAPIURL()}/api/rooms/${roomCode}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data.success ? data.room : null;
        } catch (error) {
            console.error('❌ Error getting room info:', error);
            return null;
        }
    }

    async listPublicRooms() {
        try {
            const token = localStorage.getItem('romgon-jwt');
            const response = await fetch(`${getBackendAPIURL()}/api/rooms/list/public`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data.success ? data.rooms : [];
        } catch (error) {
            console.error('❌ Error listing rooms:', error);
            return [];
        }
    }

    // ============================================
    // MATCHMAKING
    // ============================================

    async joinMatchmaking(options = {}) {
        try {
            const token = localStorage.getItem('romgon-jwt');
            const response = await fetch(`${getBackendAPIURL()}/api/rooms/matchmaking/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(options)
            });

            const data = await response.json();

            if (data.success) {
                this.isInMatchmaking = true;
                
                if (data.matched) {
                    // Match found immediately
                    this.isInMatchmaking = false;
                    this.currentRoom = data.room;
                    this.socket.emit('room:join', { roomCode: data.room.code });
                    console.log('🎯 Match found!', data.room);
                    return { matched: true, room: data.room };
                } else {
                    // Start polling for match
                    this.startMatchmakingPolling();
                    console.log('🔍 Searching for match...');
                    return { matched: false, message: data.message };
                }
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('❌ Error joining matchmaking:', error);
            throw error;
        }
    }

    async leaveMatchmaking() {
        try {
            const token = localStorage.getItem('romgon-jwt');
            const response = await fetch(`${getBackendAPIURL()}/api/rooms/matchmaking/leave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            this.isInMatchmaking = false;
            this.stopMatchmakingPolling();
            console.log('✅ Left matchmaking');
        } catch (error) {
            console.error('❌ Error leaving matchmaking:', error);
        }
    }

    startMatchmakingPolling() {
        this.stopMatchmakingPolling();
        
        this.matchmakingInterval = setInterval(async () => {
            if (!this.isInMatchmaking) {
                this.stopMatchmakingPolling();
                return;
            }

            try {
                const token = localStorage.getItem('romgon-jwt');
                const response = await fetch(`${getBackendAPIURL()}/api/rooms/matchmaking/status`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                
                if (!data.inQueue) {
                    // Match might have been found
                    const rooms = await this.listPublicRooms();
                    // Check if we're in any room now
                    // This is handled by WebSocket events
                }
            } catch (error) {
                console.error('❌ Matchmaking polling error:', error);
            }
        }, 2000); // Poll every 2 seconds
    }

    stopMatchmakingPolling() {
        if (this.matchmakingInterval) {
            clearInterval(this.matchmakingInterval);
            this.matchmakingInterval = null;
        }
    }

    // ============================================
    // UI CALLBACKS (Override these in your app)
    // ============================================

    onPlayerJoinedRoom(data) {
        console.log('🎮 Override onPlayerJoinedRoom in your app');
    }

    onPlayerLeftRoom(data) {
        console.log('🎮 Override onPlayerLeftRoom in your app');
    }

    onPlayerReady(data) {
        console.log('🎮 Override onPlayerReady in your app');
    }

    onGameStarted(data) {
        console.log('🎮 Override onGameStarted in your app');
    }

    updateRoomUI(room) {
        console.log('🎮 Override updateRoomUI in your app');
    }
}

// Global instance
window.roomClient = new RoomClient();

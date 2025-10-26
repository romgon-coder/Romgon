// ============================================
// WEBSOCKET GAME HANDLERS
// ============================================

const db = require('../config/database');
const { activeRooms, matchmakingQueue } = require('../routes/rooms');

/**
 * Setup WebSocket event handlers for game synchronization
 */
function setupSocketHandlers(io) {
    const gameNamespace = io.of('/game');
    
    // Track online players: Map<userId, {socketId, username, rating, status}>
    const onlinePlayers = new Map();

    gameNamespace.on('connection', (socket) => {
        console.log(`🎮 Game connection: ${socket.id}`);
        
        // Extract user info from auth token
        const userId = socket.handshake.auth.userId || socket.handshake.query.userId;
        const username = socket.handshake.auth.username || 'Guest';
        const rating = socket.handshake.auth.rating || 1600;
        
        // Store userId on socket for later use
        socket.userId = userId;
        socket.username = username;
        
        if (userId) {
            // Add player to online list
            onlinePlayers.set(userId.toString(), {
                socketId: socket.id,
                userId: userId.toString(),
                username,
                rating,
                status: 'online'
            });
            
            console.log(`👤 User ${username} (${userId}) connected - ${onlinePlayers.size} players online`);
            
            // Notify all clients of new player
            gameNamespace.emit('lobby:playerJoined', {
                userId: userId.toString(),
                username,
                rating,
                status: 'online'
            });
            
            // Send current online players list to the new connection
            socket.emit('lobby:onlinePlayers', Array.from(onlinePlayers.values()));
            
            console.log(`📋 Sent online players list:`, Array.from(onlinePlayers.values()).map(p => p.username));
        } else {
            console.log(`⚠️ Connection without userId`);
        }
        
        // Handle request for online players list
        socket.on('lobby:getOnlinePlayers', () => {
            console.log(`📋 Online players requested by ${username}`);
            socket.emit('lobby:onlinePlayers', Array.from(onlinePlayers.values()));
        });

        // ============================================
        // ROOM EVENTS
        // ============================================

        // Join a room
        socket.on('room:join', (data) => {
            const { roomCode } = data;
            const room = activeRooms.get(roomCode);
            
            if (room) {
                socket.join(`room-${roomCode}`);
                socket.roomCode = roomCode;
                
                console.log(`🚪 ${username} joined room ${roomCode}`);
                
                // Notify others in the room
                socket.to(`room-${roomCode}`).emit('room:playerJoined', {
                    userId: userId.toString(),
                    username,
                    players: room.players,
                    timestamp: new Date().toISOString()
                });
                
                // Send room state to joining player
                socket.emit('room:state', {
                    room: {
                        code: roomCode,
                        hostUsername: room.hostUsername,
                        players: room.players,
                        status: room.status,
                        gameId: room.gameId
                    }
                });
            }
        });

        // Leave a room
        socket.on('room:leave', (data) => {
            const { roomCode } = data;
            socket.leave(`room-${roomCode}`);
            
            const room = activeRooms.get(roomCode);
            if (room) {
                console.log(`🚪 ${username} left room ${roomCode}`);
                
                // Notify others
                socket.to(`room-${roomCode}`).emit('room:playerLeft', {
                    userId: userId.toString(),
                    username,
                    players: room.players,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Player ready status changed
        socket.on('room:ready', (data) => {
            const { roomCode, ready } = data;
            const room = activeRooms.get(roomCode);
            
            if (room) {
                // Notify all in room
                gameNamespace.to(`room-${roomCode}`).emit('room:playerReady', {
                    userId: userId.toString(),
                    username,
                    ready,
                    players: room.players,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Game started in room
        socket.on('room:gameStarted', (data) => {
            const { roomCode, gameId } = data;
            
            // Notify all in room
            gameNamespace.to(`room-${roomCode}`).emit('room:gameStarted', {
                gameId,
                timestamp: new Date().toISOString()
            });
        });

        // ============================================
        // MATCHMAKING EVENTS
        // ============================================

        // Matchmaking status update
        socket.on('matchmaking:checkStatus', () => {
            const inQueue = matchmakingQueue.has(userId?.toString());
            
            socket.emit('matchmaking:status', {
                inQueue,
                queueSize: matchmakingQueue.size,
                timestamp: new Date().toISOString()
            });
        });

        // ============================================
        // GAME EVENTS
        // ============================================

        // Join a game room
        socket.on('game:join', (data) => {
            const { gameId, userId } = data;
            socket.join(`game-${gameId}`);
            socket.gameId = gameId;
            socket.userId = userId;
            
            // Update player status
            if (onlinePlayers.has(userId)) {
                const player = onlinePlayers.get(userId);
                player.status = 'in-game';
                onlinePlayers.set(userId, player);
                
                // Notify all about status change
                gameNamespace.emit('lobby:playerStatusUpdate', {
                    userId,
                    status: 'in-game'
                });
            }

            console.log(`👤 User ${userId} joined game ${gameId}`);

            // Notify others in the game
            socket.to(`game-${gameId}`).emit('game:playerJoined', {
                userId,
                timestamp: new Date().toISOString()
            });
        });

        // Leave a game room
        socket.on('game:leave', (data) => {
            const { gameId, userId } = data;
            socket.leave(`game-${gameId}`);
            
            // Update player status back to online
            if (onlinePlayers.has(userId)) {
                const player = onlinePlayers.get(userId);
                player.status = 'online';
                onlinePlayers.set(userId, player);
                
                // Notify all about status change
                gameNamespace.emit('lobby:playerStatusUpdate', {
                    userId,
                    status: 'online'
                });
            }

            console.log(`👤 User ${userId} left game ${gameId}`);

            socket.to(`game-${gameId}`).emit('game:playerLeft', {
                userId,
                timestamp: new Date().toISOString()
            });
        });

        // Move made - broadcast to opponent
        socket.on('game:move', async (data) => {
            const { gameId, move, userId } = data;

            console.log(`🎯 Move in game ${gameId} by ${userId}:`, move);

            try {
                // Get updated game state
                const game = await db.get('SELECT * FROM games WHERE id = ?', [gameId]);
                
                if (game) {
                    const moves = JSON.parse(game.moves || '[]');
                    const isWhiteTurn = moves.length % 2 === 0;

                    // Broadcast to all players in game
                    gameNamespace.to(`game-${gameId}`).emit('game:moveUpdate', {
                        gameId,
                        move,
                        userId,
                        moveCount: game.total_moves,
                        turn: isWhiteTurn ? 'white' : 'black',
                        timestamp: new Date().toISOString()
                    });

                    // Notify lobby of updated game state
                    io.of('/').emit('lobby:gameUpdate', {
                        gameId,
                        moveCount: game.total_moves,
                        updatedAt: game.updated_at
                    });
                }
            } catch (error) {
                console.error('Error broadcasting move:', error);
                socket.emit('game:error', { error: error.message });
            }
        });

        // Game ended
        socket.on('game:end', async (data) => {
            const { gameId, reason, winnerId } = data;

            console.log(`🏁 Game ${gameId} ended: ${reason}`);

            try {
                // Broadcast game end to all players
                gameNamespace.to(`game-${gameId}`).emit('game:ended', {
                    gameId,
                    reason,
                    winnerId,
                    timestamp: new Date().toISOString()
                });

                // Update lobby - remove from active games
                io.of('/').emit('lobby:gameEnded', {
                    gameId,
                    reason,
                    winnerId
                });
            } catch (error) {
                console.error('Error broadcasting game end:', error);
            }
        });

        // Chat message in game
        socket.on('game:chat', (data) => {
            const { gameId, userId, message } = data;

            gameNamespace.to(`game-${gameId}`).emit('game:chatMessage', {
                userId,
                message,
                timestamp: new Date().toISOString()
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            if (socket.gameId && socket.userId) {
                console.log(`❌ User ${socket.userId} disconnected from game ${socket.gameId}`);

                gameNamespace.to(`game-${socket.gameId}`).emit('game:playerDisconnected', {
                    userId: socket.userId,
                    timestamp: new Date().toISOString()
                });
            }
            
            // Remove from online players list
            const userId = socket.userId;
            if (userId && onlinePlayers.has(userId.toString())) {
                const player = onlinePlayers.get(userId.toString());
                onlinePlayers.delete(userId.toString());
                
                console.log(`👋 User ${player.username} disconnected - ${onlinePlayers.size} players online`);
                
                // Notify all clients
                gameNamespace.emit('lobby:playerLeft', userId.toString());
            }
        });
    });

    // Return helper functions for use in other modules
    return {
        // Handler for game state updates
        broadcastGameState: async (gameId, gameState) => {
            gameNamespace.to(`game-${gameId}`).emit('gameStateUpdated', {
                gameId,
                gameState,
                timestamp: new Date()
            });
        },

        // Handler for chat messages
        sendGameChat: (gameId, message) => {
            gameNamespace.to(`game-${gameId}`).emit('chatMessage', {
                gameId,
                message,
                timestamp: new Date()
            });
        },

        // Handler for time updates (for timed games)
        updateGameTime: (gameId, whiteTime, blackTime) => {
            gameNamespace.to(`game-${gameId}`).emit('timeUpdated', {
                gameId,
                whiteTime,
                blackTime,
                timestamp: new Date()
            });
        },

        // Notify lobby of active game updates
        notifyLobbyGameUpdate: (gameId, updateData) => {
            io.of('/').emit('lobby:gameUpdate', {
                gameId,
                ...updateData,
                timestamp: new Date().toISOString()
            });
        }
    };
}

module.exports = setupSocketHandlers;

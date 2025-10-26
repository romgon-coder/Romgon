// ============================================
// ROOMS ROUTES - Multiplayer Room Management
// ============================================

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../config/database');
const { authenticateToken } = require('../utils/auth');
const { v4: uuidv4 } = require('uuid');

// In-memory room storage (for quick access)
// In production, consider using Redis
const activeRooms = new Map();
const matchmakingQueue = new Map();

// ============================================
// ROOM CREATION
// ============================================

/**
 * POST /api/rooms/create
 * Create a new game room
 */
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { userId, username } = req.user;
        const { isPrivate = false, timeControl = null, variant = 'standard' } = req.body;

        // Generate unique room code (6 characters)
        const roomCode = generateRoomCode();
        const roomId = uuidv4();

        const room = {
            id: roomId,
            code: roomCode,
            hostId: userId,
            hostUsername: username,
            players: [{
                userId,
                username,
                color: 'white', // Host is always white
                ready: false
            }],
            isPrivate,
            timeControl,
            variant,
            status: 'waiting', // waiting, active, finished
            createdAt: new Date().toISOString(),
            gameId: null
        };

        activeRooms.set(roomCode, room);

        console.log(`🎮 Room created: ${roomCode} by ${username} (${userId})`);

        res.json({
            success: true,
            room: {
                code: roomCode,
                id: roomId,
                hostUsername: username,
                status: 'waiting'
            }
        });
    } catch (error) {
        console.error('❌ Error creating room:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// JOIN ROOM
// ============================================

/**
 * POST /api/rooms/join
 * Join an existing game room
 */
router.post('/join', authenticateToken, async (req, res) => {
    try {
        const { userId, username } = req.user;
        const { roomCode } = req.body;

        if (!roomCode) {
            return res.status(400).json({
                success: false,
                error: 'Room code is required'
            });
        }

        const room = activeRooms.get(roomCode.toUpperCase());

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        if (room.status !== 'waiting') {
            return res.status(400).json({
                success: false,
                error: 'Room is not available'
            });
        }

        if (room.players.length >= 2) {
            return res.status(400).json({
                success: false,
                error: 'Room is full'
            });
        }

        if (room.players.some(p => p.userId === userId)) {
            return res.status(400).json({
                success: false,
                error: 'You are already in this room'
            });
        }

        // Add player as black
        room.players.push({
            userId,
            username,
            color: 'black',
            ready: false
        });

        console.log(`👤 ${username} joined room ${roomCode}`);

        res.json({
            success: true,
            room: {
                code: roomCode,
                id: room.id,
                hostUsername: room.hostUsername,
                players: room.players,
                status: room.status
            }
        });
    } catch (error) {
        console.error('❌ Error joining room:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// GET ROOM INFO
// ============================================

/**
 * GET /api/rooms/:roomCode
 * Get room information
 */
router.get('/:roomCode', authenticateToken, async (req, res) => {
    try {
        const { roomCode } = req.params;
        const room = activeRooms.get(roomCode.toUpperCase());

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        res.json({
            success: true,
            room: {
                code: roomCode,
                id: room.id,
                hostUsername: room.hostUsername,
                players: room.players,
                status: room.status,
                variant: room.variant,
                timeControl: room.timeControl
            }
        });
    } catch (error) {
        console.error('❌ Error getting room info:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// LEAVE ROOM
// ============================================

/**
 * POST /api/rooms/:roomCode/leave
 * Leave a game room
 */
router.post('/:roomCode/leave', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { roomCode } = req.params;
        const room = activeRooms.get(roomCode.toUpperCase());

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        // Remove player from room
        room.players = room.players.filter(p => p.userId !== userId);

        // If host left or room is empty, delete room
        if (room.hostId === userId || room.players.length === 0) {
            activeRooms.delete(roomCode.toUpperCase());
            console.log(`🗑️ Room ${roomCode} deleted`);
        }

        res.json({
            success: true,
            message: 'Left room successfully'
        });
    } catch (error) {
        console.error('❌ Error leaving room:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// PLAYER READY
// ============================================

/**
 * POST /api/rooms/:roomCode/ready
 * Mark player as ready
 */
router.post('/:roomCode/ready', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { roomCode } = req.params;
        const { ready } = req.body;

        const room = activeRooms.get(roomCode.toUpperCase());

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        const player = room.players.find(p => p.userId === userId);
        if (!player) {
            return res.status(404).json({
                success: false,
                error: 'Player not in room'
            });
        }

        player.ready = ready;

        // Check if both players are ready
        const allReady = room.players.length === 2 && room.players.every(p => p.ready);

        if (allReady && room.status === 'waiting') {
            // Create game in database
            const gameId = uuidv4();
            const whitePlayer = room.players.find(p => p.color === 'white');
            const blackPlayer = room.players.find(p => p.color === 'black');

            await dbPromise.run(`
                INSERT INTO games (id, white_player_id, black_player_id, status, moves, start_time)
                VALUES (?, ?, ?, 'active', '[]', datetime('now'))
            `, [gameId, whitePlayer.userId, blackPlayer.userId]);

            room.gameId = gameId;
            room.status = 'active';

            console.log(`🎮 Game started in room ${roomCode}: ${gameId}`);

            res.json({
                success: true,
                ready: true,
                gameStarted: true,
                gameId
            });
        } else {
            res.json({
                success: true,
                ready: player.ready,
                gameStarted: false
            });
        }
    } catch (error) {
        console.error('❌ Error setting ready status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// LIST ACTIVE ROOMS
// ============================================

/**
 * GET /api/rooms/list
 * Get list of public rooms
 */
router.get('/list/public', authenticateToken, async (req, res) => {
    try {
        const publicRooms = Array.from(activeRooms.values())
            .filter(room => !room.isPrivate && room.status === 'waiting')
            .map(room => ({
                code: room.code,
                id: room.id,
                hostUsername: room.hostUsername,
                playerCount: room.players.length,
                maxPlayers: 2,
                variant: room.variant,
                timeControl: room.timeControl,
                createdAt: room.createdAt
            }));

        res.json({
            success: true,
            rooms: publicRooms
        });
    } catch (error) {
        console.error('❌ Error listing rooms:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// MATCHMAKING
// ============================================

/**
 * POST /api/rooms/matchmaking/join
 * Join matchmaking queue
 */
router.post('/matchmaking/join', authenticateToken, async (req, res) => {
    try {
        const { userId, username } = req.user;
        const { variant = 'standard', timeControl = null } = req.body;

        // Get user rating
        const user = await dbPromise.get('SELECT rating FROM users WHERE id = ?', [userId]);
        const rating = user?.rating || 1600;

        // Add to matchmaking queue
        const queueEntry = {
            userId,
            username,
            rating,
            variant,
            timeControl,
            joinedAt: Date.now()
        };

        matchmakingQueue.set(userId, queueEntry);

        console.log(`🔍 ${username} joined matchmaking (rating: ${rating})`);

        // Try to find a match
        const match = findMatch(userId, queueEntry);

        if (match) {
            // Create room with matched players
            const roomCode = generateRoomCode();
            const roomId = uuidv4();

            const room = {
                id: roomId,
                code: roomCode,
                hostId: match.player1.userId,
                hostUsername: match.player1.username,
                players: [
                    {
                        userId: match.player1.userId,
                        username: match.player1.username,
                        color: 'white',
                        ready: true
                    },
                    {
                        userId: match.player2.userId,
                        username: match.player2.username,
                        color: 'black',
                        ready: true
                    }
                ],
                isPrivate: false,
                timeControl,
                variant,
                status: 'waiting',
                createdAt: new Date().toISOString(),
                gameId: null
            };

            activeRooms.set(roomCode, room);

            // Remove from queue
            matchmakingQueue.delete(match.player1.userId);
            matchmakingQueue.delete(match.player2.userId);

            // Create game
            const gameId = uuidv4();
            await dbPromise.run(`
                INSERT INTO games (id, white_player_id, black_player_id, status, moves, start_time)
                VALUES (?, ?, ?, 'active', '[]', datetime('now'))
            `, [gameId, match.player1.userId, match.player2.userId]);

            room.gameId = gameId;
            room.status = 'active';

            console.log(`🎯 Match found! Room ${roomCode} created for ${match.player1.username} vs ${match.player2.username}`);

            res.json({
                success: true,
                matched: true,
                room: {
                    code: roomCode,
                    id: roomId,
                    gameId,
                    opponent: match.opponent
                }
            });
        } else {
            res.json({
                success: true,
                matched: false,
                message: 'Searching for opponent...',
                queueSize: matchmakingQueue.size
            });
        }
    } catch (error) {
        console.error('❌ Error joining matchmaking:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/rooms/matchmaking/leave
 * Leave matchmaking queue
 */
router.post('/matchmaking/leave', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        
        if (matchmakingQueue.has(userId)) {
            matchmakingQueue.delete(userId);
            console.log(`❌ User ${userId} left matchmaking`);
        }

        res.json({
            success: true,
            message: 'Left matchmaking queue'
        });
    } catch (error) {
        console.error('❌ Error leaving matchmaking:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/rooms/matchmaking/status
 * Check matchmaking status
 */
router.get('/matchmaking/status', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const inQueue = matchmakingQueue.has(userId);

        res.json({
            success: true,
            inQueue,
            queueSize: matchmakingQueue.size,
            estimatedWaitTime: Math.max(10, matchmakingQueue.size * 5) // seconds
        });
    } catch (error) {
        console.error('❌ Error checking matchmaking status:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a random 6-character room code
 */
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters
    let code;
    let attempts = 0;
    
    do {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        attempts++;
    } while (activeRooms.has(code) && attempts < 100);
    
    return code;
}

/**
 * Find a match for a player in the queue
 */
function findMatch(userId, player) {
    const ratingRange = 200; // Match players within 200 rating points
    
    for (const [queueUserId, queuePlayer] of matchmakingQueue.entries()) {
        if (queueUserId === userId) continue;
        
        // Check variant match
        if (queuePlayer.variant !== player.variant) continue;
        
        // Check rating difference
        const ratingDiff = Math.abs(queuePlayer.rating - player.rating);
        if (ratingDiff <= ratingRange) {
            return {
                player1: player,
                player2: queuePlayer,
                opponent: {
                    username: queuePlayer.username,
                    rating: queuePlayer.rating
                }
            };
        }
    }
    
    return null;
}

// ============================================
// CLEANUP
// ============================================

// Clean up old rooms every 30 minutes
setInterval(() => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    for (const [code, room] of activeRooms.entries()) {
        const age = now - new Date(room.createdAt).getTime();
        if (age > maxAge && room.status === 'waiting') {
            activeRooms.delete(code);
            console.log(`🧹 Cleaned up old room: ${code}`);
        }
    }
}, 30 * 60 * 1000);

// Export for WebSocket integration
module.exports = {
    router,
    activeRooms,
    matchmakingQueue
};

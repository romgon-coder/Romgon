// ============================================
// ROOMS ROUTES - Multiplayer Room Management
// ============================================

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../config/database');
const { authenticateToken } = require('../utils/auth');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

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

        // Remove player from ANY other rooms first
        for (const [code, r] of activeRooms.entries()) {
            if (code !== roomCode.toUpperCase()) {
                const playerIndex = r.players.findIndex(p => p.userId === userId);
                if (playerIndex !== -1) {
                    r.players.splice(playerIndex, 1);
                    console.log(`👋 Removed ${username} from room ${code} before joining new room`);
                    
                    // Clean up empty non-permanent rooms
                    if (!r.isPermanent && r.players.length === 0) {
                        activeRooms.delete(code);
                        console.log(`🗑️ Deleted empty room ${code}`);
                    }
                }
            }
        }

        // If player is already in this room, just return the room info
        if (room.players.some(p => p.userId === userId)) {
            console.log(`👤 ${username} is already in room ${roomCode}, returning room info`);
            return res.json({
                success: true,
                room: {
                    code: roomCode,
                    id: room.id,
                    hostUsername: room.hostUsername,
                    players: room.players,
                    status: room.status
                }
            });
        }

        // For permanent rooms, assign colors based on join order
        let playerColor;
        if (room.isPermanent && room.players.length === 0) {
            playerColor = 'white'; // First player is white
            room.hostId = userId; // First player becomes host
            room.hostUsername = username;
        } else {
            playerColor = 'black'; // Second player is black
        }

        // Add player
        room.players.push({
            userId,
            username,
            color: playerColor,
            ready: false
        });

        console.log(`👤 ${username} joined room ${roomCode} as ${playerColor}`);

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

/**
 * POST /api/rooms/join/guest
 * Join a guest-friendly room without authentication
 */
router.post('/join/guest', async (req, res) => {
    try {
        const { roomCode, guestName } = req.body;

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

        if (!room.allowGuests) {
            return res.status(403).json({
                success: false,
                error: 'This room does not allow guest players. Please log in.'
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

        // Generate guest user ID and username
        const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        const guestUsername = guestName || ('Guest_' + Math.random().toString(36).substring(2, 6).toUpperCase());

        // Create a JWT token for the guest
        const guestToken = jwt.sign(
            {
                userId: guestId,
                username: guestUsername,
                isGuest: true
            },
            process.env.JWT_SECRET || 'your-secret-key-change-in-production',
            { expiresIn: '24h' }
        );

        // Assign color based on join order
        let playerColor;
        if (room.players.length === 0) {
            playerColor = 'white';
            room.hostId = guestId;
            room.hostUsername = guestUsername;
        } else {
            playerColor = 'black';
        }

        // Add guest player
        room.players.push({
            userId: guestId,
            username: guestUsername,
            color: playerColor,
            ready: false,
            isGuest: true
        });

        console.log(`👤 Guest ${guestUsername} joined room ${roomCode} as ${playerColor}`);

        res.json({
            success: true,
            room: {
                code: roomCode,
                id: room.id,
                hostUsername: room.hostUsername,
                players: room.players,
                status: room.status
            },
            guestInfo: {
                guestId,
                guestUsername,
                token: guestToken  // Add the JWT token
            }
        });
    } catch (error) {
        console.error('❌ Error joining room as guest:', error);
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

        // For permanent rooms, reset them instead of deleting
        if (room.isPermanent) {
            if (room.players.length === 0) {
                // Reset permanent room to initial state
                room.hostId = 'system';
                room.hostUsername = 'System';
                room.status = 'waiting';
                room.gameId = null;
                console.log(`🔄 Reset permanent room ${roomCode}`);
            }
        } else {
            // For regular rooms, delete if host left or room is empty
            if (room.hostId === userId || room.players.length === 0) {
                activeRooms.delete(roomCode.toUpperCase());
                console.log(`🗑️ Room ${roomCode} deleted`);
            }
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

            try {
                await dbPromise.run(`
                    INSERT INTO games (id, white_player_id, black_player_id, status, moves, start_time)
                    VALUES (?, ?, ?, 'active', '[]', datetime('now'))
                `, [gameId, whitePlayer.userId, blackPlayer.userId]);
                
                console.log(`✅ Game created in database: ${gameId}`);
            } catch (dbError) {
                console.error('❌ Database error creating game:', dbError);
                console.log('⚠️ Continuing without database entry (guest players may not be in users table)');
                // Continue even if DB insert fails (e.g., for guest players)
            }

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
                name: room.name || null,
                description: room.description || null,
                isPermanent: room.isPermanent || false,
                allowGuests: room.allowGuests || false,
                hostUsername: room.hostUsername,
                playerCount: room.players.length,
                maxPlayers: 2,
                variant: room.variant,
                timeControl: room.timeControl,
                createdAt: room.createdAt
            }))
            .sort((a, b) => {
                // Permanent rooms first
                if (a.isPermanent && !b.isPermanent) return -1;
                if (!a.isPermanent && b.isPermanent) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

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

/**
 * GET /api/rooms/list/guest
 * Get list of public rooms (no auth required - for guests)
 */
router.get('/list/guest', async (req, res) => {
    try {
        const publicRooms = Array.from(activeRooms.values())
            .filter(room => !room.isPrivate && room.status === 'waiting')
            .map(room => ({
                code: room.code,
                id: room.id,
                name: room.name || null,
                description: room.description || null,
                isPermanent: room.isPermanent || false,
                allowGuests: room.allowGuests || false,
                hostUsername: room.hostUsername,
                playerCount: room.players.length,
                maxPlayers: 2,
                variant: room.variant,
                timeControl: room.timeControl,
                createdAt: room.createdAt
            }))
            .sort((a, b) => {
                // Permanent rooms first
                if (a.isPermanent && !b.isPermanent) return -1;
                if (!a.isPermanent && b.isPermanent) return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

        res.json({
            success: true,
            rooms: publicRooms,
            message: 'Rooms marked with 🎭 allow guest players'
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
// DEBUG ENDPOINT (No Auth Required)
// ============================================

/**
 * GET /api/rooms/debug/count
 * Get room count for debugging (no auth)
 */
router.get('/debug/count', (req, res) => {
    try {
        const totalRooms = activeRooms.size;
        const permanentRooms = Array.from(activeRooms.values()).filter(r => r.isPermanent);
        const roomCodes = Array.from(activeRooms.keys());
        
        res.json({
            success: true,
            totalRooms,
            permanentRoomCount: permanentRooms.length,
            allRoomCodes: roomCodes,
            permanentRooms: permanentRooms.map(r => ({
                code: r.code,
                name: r.name,
                playerCount: r.players.length
            }))
        });
    } catch (error) {
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
// PERMANENT PUBLIC ROOMS
// ============================================

// Initialize 4 permanent public rooms on server start
function initializePermanentRooms() {
    const permanentRooms = [
        {
            code: 'ROOM01',
            name: 'Beginners Lounge',
            description: 'Welcome new players! Casual games.'
        },
        {
            code: 'ROOM02',
            name: 'Quick Match Arena',
            description: 'Fast-paced games for everyone.'
        },
        {
            code: 'ROOM03',
            name: 'Masters Hall',
            description: 'Competitive play for experienced players.'
        },
        {
            code: 'GUEST1',
            name: '🎭 Guest Arena',
            description: 'Open to all! No login required.',
            allowGuests: true
        }
    ];

    permanentRooms.forEach(config => {
        if (!activeRooms.has(config.code)) {
            const room = {
                id: uuidv4(),
                code: config.code,
                name: config.name,
                description: config.description,
                hostId: 'system',
                hostUsername: 'System',
                players: [],
                isPrivate: false,
                isPermanent: true, // Mark as permanent so it's not cleaned up
                allowGuests: config.allowGuests || false, // Allow guests to join
                timeControl: null,
                variant: 'standard',
                status: 'waiting',
                createdAt: new Date().toISOString(),
                gameId: null
            };
            activeRooms.set(config.code, room);
            console.log(`🎮 Initialized permanent room: ${config.name} (${config.code})`);
        }
    });
}

// Initialize permanent rooms on startup
initializePermanentRooms();

// ============================================
// CLEANUP
// ============================================

// Clean up old rooms every 30 minutes
setInterval(() => {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    for (const [code, room] of activeRooms.entries()) {
        // Don't clean up permanent rooms
        if (room.isPermanent) continue;
        
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

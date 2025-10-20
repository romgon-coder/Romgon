// ============================================
// STATISTICS ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { param, query, validationResult } = require('express-validator');
const { getRatingTier } = require('../utils/rating');
const db = require('../config/database');

// In-memory store for active sessions (for production, use Redis)
const activeSessions = new Map(); // userId -> lastActivity timestamp
const ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

// WebSocket online players tracking
let onlinePlayersCount = 0;

/**
 * Update active session
 */
function updateActiveSession(userId) {
    activeSessions.set(userId, Date.now());
}

/**
 * Clean up old sessions
 */
function cleanupSessions() {
    const now = Date.now();
    for (const [userId, lastActivity] of activeSessions.entries()) {
        if (now - lastActivity > ACTIVE_THRESHOLD) {
            activeSessions.delete(userId);
        }
    }
}

// Clean up every minute
setInterval(cleanupSessions, 60 * 1000);

/**
 * Get total registered users count
 * GET /api/stats/total-users
 */
router.get('/total-users', async (req, res) => {
    try {
        const result = await db.get('SELECT COUNT(*) as count FROM users WHERE is_guest = 0');
        
        res.json({
            totalUsers: result.count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting total users:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get active players count (sessions within last 5 minutes)
 * GET /api/stats/active-players
 */
router.get('/active-players', async (req, res) => {
    try {
        cleanupSessions(); // Clean up before counting
        
        const activePlayers = activeSessions.size;
        
        res.json({
            activePlayers,
            threshold: ACTIVE_THRESHOLD / 60000, // in minutes
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting active players:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get online players count (WebSocket connections)
 * GET /api/stats/online-players
 */
router.get('/online-players', (req, res) => {
    try {
        res.json({
            onlinePlayers: onlinePlayersCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting online players:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Record activity (for tracking active players)
 * POST /api/stats/activity
 */
router.post('/activity', async (req, res) => {
    try {
        const userId = req.user?.id; // From JWT auth middleware
        
        if (userId) {
            updateActiveSession(userId);
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error recording activity:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get combined player counts
 * GET /api/stats/player-counts
 */
router.get('/player-counts', async (req, res) => {
    try {
        cleanupSessions();
        
        const totalUsers = await db.get('SELECT COUNT(*) as count FROM users WHERE is_guest = 0');
        const totalGuests = await db.get('SELECT COUNT(*) as count FROM users WHERE is_guest = 1');
        
        res.json({
            totalRegistered: totalUsers.count,
            totalGuests: totalGuests.count,
            activePlayers: activeSessions.size,
            onlinePlayers: onlinePlayersCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting player counts:', error);
        res.status(500).json({ error: error.message });
    }
});

// Export for WebSocket usage
module.exports.setOnlineCount = (count) => {
    onlinePlayersCount = count;
};

module.exports.updateActiveSession = updateActiveSession;

/**
 * Get global statistics
 * GET /api/stats/global
 */
router.get('/global', async (req, res) => {
    try {
        const stats = await db.get(`
            SELECT 
                COUNT(*) as totalPlayers,
                AVG(rating) as avgRating,
                MAX(rating) as maxRating,
                MIN(rating) as minRating,
                SUM(total_games) as totalGames,
                SUM(wins) as totalWins,
                SUM(total_moves) as totalMoves,
                SUM(total_captures) as totalCaptures
            FROM users
        `);

        const gameStats = await db.get(`
            SELECT 
                COUNT(*) as totalGames,
                SUM(total_moves) as totalMoves
            FROM games
            WHERE status = 'finished'
        `);

        const avgGameLength = gameStats.totalGames > 0 ? (gameStats.totalMoves / gameStats.totalGames).toFixed(2) : 0;
        const avgWinRate = stats.totalGames > 0 ? (stats.totalWins / stats.totalGames * 100).toFixed(2) : 0;

        res.json({
            players: {
                total: stats.totalPlayers,
                ratings: {
                    average: Math.round(stats.avgRating),
                    highest: stats.maxRating,
                    lowest: stats.minRating
                }
            },
            games: {
                total: gameStats.totalGames,
                totalMoves: gameStats.totalMoves,
                avgGameLength: parseFloat(avgGameLength),
                totalCaptures: stats.totalCaptures || 0
            },
            aggregated: {
                totalGames: stats.totalGames,
                totalWins: stats.totalWins,
                globalWinRate: parseFloat(avgWinRate),
                globalAverageMoves: stats.totalMoves > 0 ? (stats.totalMoves / stats.totalPlayers).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error('Error getting global stats:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get player statistics
 * GET /api/stats/player/:userId
 */
router.get('/player/:userId',
    [param('userId').isString()],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userId } = req.params;

            // Get user
            const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Calculate stats
            const winRate = user.total_games > 0 ? (user.wins / user.total_games * 100).toFixed(2) : 0;
            const avgMovesPerGame = user.total_games > 0 ? (user.total_moves / user.total_games).toFixed(2) : 0;
            const avgCapturesPerGame = user.total_games > 0 ? (user.total_captures / user.total_games).toFixed(2) : 0;

            // Get detailed game stats
            const gameStats = await db.all(`
                SELECT 
                    CASE WHEN white_player_id = ? THEN winner_color ELSE NULL END as white_result,
                    CASE WHEN black_player_id = ? THEN winner_color ELSE NULL END as black_result,
                    reason,
                    total_moves
                FROM games
                WHERE (white_player_id = ? OR black_player_id = ?) AND status = 'finished'
                ORDER BY updated_at DESC
                LIMIT 50
            `, [userId, userId, userId, userId]);

            // Categorize wins by reason
            const winsByReason = {};
            const losses = gameStats.filter(g => {
                if (g.white_result === 'white' || g.black_result === 'black') return false;
                return true;
            }).length;

            gameStats.forEach(game => {
                if (game.white_result === 'white' || game.black_result === 'black') {
                    winsByReason[game.reason] = (winsByReason[game.reason] || 0) + 1;
                }
            });

            // Get tier
            const tier = getRatingTier(user.rating);

            // Get recent games
            const recentGames = await db.all(`
                SELECT 
                    id, white_player_id, black_player_id, winner_id, winner_color, 
                    reason, total_moves, updated_at
                FROM games
                WHERE (white_player_id = ? OR black_player_id = ?) AND status = 'finished'
                ORDER BY updated_at DESC
                LIMIT 10
            `, [userId, userId]);

            const formattedRecentGames = recentGames.map(game => ({
                gameId: game.id,
                opponent: game.white_player_id === userId ? game.black_player_id : game.white_player_id,
                playerColor: game.white_player_id === userId ? 'white' : 'black',
                result: game.winner_id === userId ? 'win' : 'loss',
                reason: game.reason,
                totalMoves: game.total_moves,
                completedAt: game.updated_at
            }));

            res.json({
                userId: user.id,
                username: user.username,
                rating: user.rating,
                tier: tier,
                memberLevel: user.member_level,
                stats: {
                    games: {
                        total: user.total_games,
                        wins: user.wins,
                        losses: user.losses,
                        winRate: parseFloat(winRate)
                    },
                    moves: {
                        total: user.total_moves,
                        avgPerGame: parseFloat(avgMovesPerGame)
                    },
                    captures: {
                        total: user.total_captures,
                        avgPerGame: parseFloat(avgCapturesPerGame)
                    },
                    winsByReason: winsByReason
                },
                recentGames: formattedRecentGames,
                timestamps: {
                    createdAt: user.created_at,
                    updatedAt: user.updated_at
                }
            });
        } catch (error) {
            console.error('Error getting player stats:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get leaderboard by rating
 * GET /api/stats/leaderboard
 */
router.get('/leaderboard',
    [query('limit').optional().isInt({ min: 1, max: 100 })],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const limit = req.query.limit || 100;
            const offset = req.query.offset || 0;

            const leaderboard = await db.all(`
                SELECT id, username, rating, wins, losses, total_games, member_level
                FROM users
                ORDER BY rating DESC
                LIMIT ? OFFSET ?
            `, [limit, offset]);

            const total = await db.get('SELECT COUNT(*) as count FROM users');

            const formattedLeaderboard = leaderboard.map((user, index) => {
                const tier = getRatingTier(user.rating);
                const winRate = user.total_games > 0 ? (user.wins / user.total_games * 100).toFixed(2) : 0;

                return {
                    rank: offset + index + 1,
                    userId: user.id,
                    username: user.username,
                    rating: user.rating,
                    tier: tier,
                    memberLevel: user.member_level,
                    stats: {
                        wins: user.wins,
                        losses: user.losses,
                        totalGames: user.total_games,
                        winRate: parseFloat(winRate)
                    }
                };
            });

            res.json({
                leaderboard: formattedLeaderboard,
                pagination: {
                    limit,
                    offset,
                    total: total.count
                }
            });
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get statistics for specific rating range
 * GET /api/stats/ratings/:minRating/:maxRating
 */
router.get('/ratings/:minRating/:maxRating',
    [
        param('minRating').isInt(),
        param('maxRating').isInt(),
        query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { minRating, maxRating } = req.params;
            const limit = req.query.limit || 50;

            if (parseInt(minRating) > parseInt(maxRating)) {
                return res.status(400).json({ error: 'minRating must be less than maxRating' });
            }

            const players = await db.all(`
                SELECT id, username, rating, wins, losses, total_games, member_level
                FROM users
                WHERE rating >= ? AND rating <= ?
                ORDER BY rating DESC
                LIMIT ?
            `, [minRating, maxRating, limit]);

            const count = await db.get(`
                SELECT COUNT(*) as count FROM users
                WHERE rating >= ? AND rating <= ?
            `, [minRating, maxRating]);

            const formattedPlayers = players.map(user => {
                const tier = getRatingTier(user.rating);
                const winRate = user.total_games > 0 ? (user.wins / user.total_games * 100).toFixed(2) : 0;

                return {
                    userId: user.id,
                    username: user.username,
                    rating: user.rating,
                    tier: tier,
                    memberLevel: user.member_level,
                    stats: {
                        wins: user.wins,
                        losses: user.losses,
                        totalGames: user.total_games,
                        winRate: parseFloat(winRate)
                    }
                };
            });

            res.json({
                ratingRange: {
                    min: parseInt(minRating),
                    max: parseInt(maxRating)
                },
                players: formattedPlayers,
                pagination: {
                    limit,
                    returned: formattedPlayers.length,
                    total: count.count
                }
            });
        } catch (error) {
            console.error('Error getting rating range stats:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get head-to-head statistics between two players
 * GET /api/stats/h2h/:userId1/:userId2
 */
router.get('/h2h/:userId1/:userId2',
    [param('userId1').isString(), param('userId2').isString()],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userId1, userId2 } = req.params;

            // Get mutual games
            const games = await db.all(`
                SELECT id, white_player_id, black_player_id, winner_id, winner_color, reason, total_moves, updated_at
                FROM games
                WHERE (white_player_id = ? AND black_player_id = ?) 
                   OR (white_player_id = ? AND black_player_id = ?)
                AND status = 'finished'
                ORDER BY updated_at DESC
            `, [userId1, userId2, userId2, userId1]);

            // Calculate stats
            let player1Wins = 0, player2Wins = 0;
            const winsByReason = {};

            games.forEach(game => {
                if (game.winner_id === userId1) {
                    player1Wins++;
                } else if (game.winner_id === userId2) {
                    player2Wins++;
                }
                winsByReason[game.reason] = (winsByReason[game.reason] || 0) + 1;
            });

            // Get player info
            const user1 = await db.get('SELECT username, rating FROM users WHERE id = ?', [userId1]);
            const user2 = await db.get('SELECT username, rating FROM users WHERE id = ?', [userId2]);

            res.json({
                player1: {
                    userId: userId1,
                    username: user1.username,
                    rating: user1.rating,
                    wins: player1Wins
                },
                player2: {
                    userId: userId2,
                    username: user2.username,
                    rating: user2.rating,
                    wins: player2Wins
                },
                totalGames: games.length,
                winsByReason: winsByReason,
                recentGames: games.slice(0, 10)
            });
        } catch (error) {
            console.error('Error getting h2h stats:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router;

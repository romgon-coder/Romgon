// ============================================
// RATING ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { param, body, query, validationResult } = require('express-validator');
const { authenticateToken } = require('../utils/auth');
const { calculateEloRating, getRatingTier, INITIAL_RATING } = require('../utils/rating');
const db = require('../config/database');

/**
 * Update rating after game
 * POST /api/ratings/update
 */
router.post('/update',
    authenticateToken,
    [
        body('gameId').isString().notEmpty(),
        body('winnerId').optional().isString(),
        body('loser').isString().notEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { gameId, winnerId, loser } = req.body;

            // Get winner and loser data
            const winner = await db.get('SELECT * FROM users WHERE id = ?', [winnerId]);
            const loserUser = await db.get('SELECT * FROM users WHERE id = ?', [loser]);

            if (!winner || !loserUser) {
                return res.status(404).json({ error: 'Player not found' });
            }

            // Calculate new ratings
            const winnerNewRating = calculateEloRating(winner.rating, loserUser.rating, 1);
            const loserNewRating = calculateEloRating(loserUser.rating, winner.rating, 0);

            const winnerChange = winnerNewRating - winner.rating;
            const loserChange = loserNewRating - loserUser.rating;

            // Update winner
            await db.run(
                `UPDATE users SET rating = ?, wins = wins + 1, total_games = total_games + 1 WHERE id = ?`,
                [winnerNewRating, winnerId]
            );

            // Update loser
            await db.run(
                `UPDATE users SET rating = ?, losses = losses + 1, total_games = total_games + 1 WHERE id = ?`,
                [loserNewRating, loser]
            );

            // Record rating changes
            await db.run(
                `INSERT INTO rating_changes (player_id, old_rating, new_rating, change, game_id, opponent_id, opponent_rating, result)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'win')`,
                [winnerId, winner.rating, winnerNewRating, winnerChange, gameId, loser, loserUser.rating]
            );

            await db.run(
                `INSERT INTO rating_changes (player_id, old_rating, new_rating, change, game_id, opponent_id, opponent_rating, result)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'loss')`,
                [loser, loserUser.rating, loserNewRating, loserChange, gameId, winnerId, winner.rating]
            );

            res.json({
                winner: {
                    userId: winnerId,
                    oldRating: winner.rating,
                    newRating: winnerNewRating,
                    change: winnerChange
                },
                loser: {
                    userId: loser,
                    oldRating: loserUser.rating,
                    newRating: loserNewRating,
                    change: loserChange
                },
                message: 'Rating updated successfully'
            });
        } catch (error) {
            console.error('Error updating rating:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get player rating
 * GET /api/ratings/:userId
 */
router.get('/:userId',
    [param('userId').isString()],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userId } = req.params;

            const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const tier = getRatingTier(user.rating);
            const winRate = user.total_games > 0 ? (user.wins / user.total_games * 100).toFixed(2) : 0;

            // Get rating history
            const history = await db.all(
                `SELECT * FROM rating_changes WHERE player_id = ? ORDER BY created_at DESC LIMIT 10`,
                [userId]
            );

            res.json({
                userId: user.id,
                username: user.username,
                rating: user.rating,
                tier: tier,
                stats: {
                    wins: user.wins,
                    losses: user.losses,
                    totalGames: user.total_games,
                    winRate: parseFloat(winRate)
                },
                history: history.map(h => ({
                    oldRating: h.old_rating,
                    newRating: h.new_rating,
                    change: h.change,
                    result: h.result,
                    opponentId: h.opponent_id,
                    opponentRating: h.opponent_rating,
                    timestamp: h.created_at
                }))
            });
        } catch (error) {
            console.error('Error getting rating:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get leaderboard
 * GET /api/ratings/leaderboard
 */
router.get('/',
    [query('limit').optional().isInt({ min: 1, max: 100 })],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const limit = req.query.limit || 100;
            const offset = req.query.offset || 0;

            const leaderboard = await db.all(
                `SELECT id, username, rating, wins, losses, total_games 
                 FROM users 
                 ORDER BY rating DESC 
                 LIMIT ? OFFSET ?`,
                [limit, offset]
            );

            const formattedLeaderboard = leaderboard.map((user, index) => {
                const tier = getRatingTier(user.rating);
                const winRate = user.total_games > 0 ? (user.wins / user.total_games * 100).toFixed(2) : 0;

                return {
                    rank: offset + index + 1,
                    userId: user.id,
                    username: user.username,
                    rating: user.rating,
                    tier: tier,
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
                    total: await db.get('SELECT COUNT(*) as count FROM users').then(r => r.count)
                }
            });
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get rating history for a player
 * GET /api/ratings/:userId/history
 */
router.get('/:userId/history',
    [
        param('userId').isString(),
        query('limit').optional().isInt({ min: 1, max: 100 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userId } = req.params;
            const limit = req.query.limit || 50;

            const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const history = await db.all(
                `SELECT * FROM rating_changes WHERE player_id = ? ORDER BY created_at DESC LIMIT ?`,
                [userId, limit]
            );

            const formattedHistory = history.map(record => ({
                gameId: record.game_id,
                timestamp: record.created_at,
                result: record.result,
                oldRating: record.old_rating,
                newRating: record.new_rating,
                change: record.change,
                opponent: {
                    userId: record.opponent_id,
                    rating: record.opponent_rating
                }
            }));

            res.json({
                userId,
                username: user.username,
                currentRating: user.rating,
                history: formattedHistory,
                pagination: {
                    limit,
                    returned: formattedHistory.length
                }
            });
        } catch (error) {
            console.error('Error getting rating history:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get rating stats
 * GET /api/ratings/stats/global
 */
router.get('/stats/global', async (req, res) => {
    try {
        const stats = await db.get(`
            SELECT 
                COUNT(*) as totalPlayers,
                AVG(rating) as avgRating,
                MAX(rating) as maxRating,
                MIN(rating) as minRating,
                SUM(total_games) as totalGames,
                SUM(wins) as totalWins
            FROM users
        `);

        const avgWinRate = stats.totalGames > 0 ? (stats.totalWins / stats.totalGames * 100).toFixed(2) : 0;

        res.json({
            totalPlayers: stats.totalPlayers,
            ratings: {
                average: Math.round(stats.avgRating),
                highest: stats.maxRating,
                lowest: stats.minRating
            },
            games: {
                totalGames: stats.totalGames,
                totalWins: stats.totalWins,
                globalWinRate: parseFloat(avgWinRate)
            }
        });
    } catch (error) {
        console.error('Error getting global stats:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

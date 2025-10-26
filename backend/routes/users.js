// ============================================
// USER ROUTES
// ============================================

const express = require('express');
const { dbPromise } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../utils/auth');

const router = express.Router();

// ============================================
// DEBUG: LIST ALL USERS (remove in production)
// ============================================

router.get('/debug/list', async (req, res) => {
    try {
        const users = await dbPromise.all(
            `SELECT id, username, email, rating, is_guest, google_id, created_at 
             FROM users 
             ORDER BY id DESC 
             LIMIT 20`
        );
        
        res.json({
            total: users.length,
            users: users.map(u => ({
                id: u.id,
                username: u.username,
                email: u.email,
                rating: u.rating,
                isGuest: u.is_guest === 1,
                hasGoogleId: !!u.google_id,
                createdAt: u.created_at
            }))
        });
    } catch (err) {
        console.error('❌ Error listing users:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// GET CURRENT USER STATS (for frontend Player Hub)
// ============================================

router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        
        console.log(`📊 Fetching stats for user ID: ${userId}`);

        const user = await dbPromise.get(
            `SELECT id, username, email, rating, wins, losses, total_games, 
                    total_moves, total_captures, member_level, created_at 
             FROM users WHERE id = ?`,
            [userId]
        );

        if (!user) {
            console.error(`❌ User ID ${userId} not found in database`);
            return res.status(404).json({
                error: 'User not found',
                userId: userId,
                message: `No user exists with ID ${userId}. The user may need to be created or re-authenticated.`
            });
        }
        
        console.log(`✅ User found: ${user.username} (${user.email})`);

        // Calculate win rate
        const winRate = user.total_games > 0 
            ? ((user.wins / user.total_games) * 100).toFixed(1)
            : 0;

        // Calculate averages
        const avgMovesPerGame = user.total_games > 0
            ? (user.total_moves / user.total_games).toFixed(1)
            : 0;

        const avgCapturesPerGame = user.total_games > 0
            ? (user.total_captures / user.total_games).toFixed(1)
            : 0;

        // Get recent performance (last 10 games)
        const recentGames = await dbPromise.all(
            `SELECT winner_id, white_player_id, black_player_id, total_moves, 
                    reason, updated_at
             FROM games 
             WHERE (white_player_id = ? OR black_player_id = ?) AND status = 'finished'
             ORDER BY updated_at DESC LIMIT 10`,
            [userId, userId]
        );

        let recentWins = 0;
        recentGames.forEach(game => {
            if (game.winner_id === userId) recentWins++;
        });

        const recentWinRate = recentGames.length > 0
            ? ((recentWins / recentGames.length) * 100).toFixed(1)
            : 0;

        res.json({
            username: user.username,
            email: user.email,
            rating: user.rating,
            memberLevel: user.member_level,
            stats: {
                totalGames: user.total_games,
                wins: user.wins,
                losses: user.losses,
                winRate: parseFloat(winRate),
                totalMoves: user.total_moves,
                avgMovesPerGame: parseFloat(avgMovesPerGame),
                totalCaptures: user.total_captures,
                avgCapturesPerGame: parseFloat(avgCapturesPerGame),
                recentWinRate: parseFloat(recentWinRate),
                recentGamesCount: recentGames.length
            },
            createdAt: user.created_at
        });

    } catch (err) {
        console.error('❌ Error fetching user stats:', err);
        res.status(500).json({
            error: 'Error fetching user stats',
            message: err.message
        });
    }
});

// ============================================
// GET USER PROFILE
// ============================================

router.get('/:userId', optionalAuth, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await dbPromise.get(
            `SELECT id, username, email, rating, wins, losses, total_games, 
                    total_moves, total_captures, member_level, created_at 
             FROM users WHERE id = ?`,
            [userId]
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                userId
            });
        }

        // Get recent games
        const recentGames = await dbPromise.all(
            `SELECT id, white_player_id, black_player_id, winner_id, reason, 
                    start_time, end_time FROM games 
             WHERE (white_player_id = ? OR black_player_id = ?) AND status = 'finished'
             ORDER BY end_time DESC LIMIT 10`,
            [userId, userId]
        );

        // Calculate win rate
        const winRate = user.total_games > 0 
            ? ((user.wins / user.total_games) * 100).toFixed(1)
            : 0;

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                rating: user.rating,
                stats: {
                    wins: user.wins,
                    losses: user.losses,
                    totalGames: user.total_games,
                    totalMoves: user.total_moves,
                    totalCaptures: user.total_captures,
                    winRate: parseFloat(winRate),
                    memberLevel: user.member_level
                },
                createdAt: user.created_at,
                recentGames
            }
        });

    } catch (err) {
        console.error('❌ Error fetching user:', err);
        res.status(500).json({
            error: 'Error fetching user profile',
            message: err.message
        });
    }
});

// ============================================
// GET CURRENT USER PROFILE
// ============================================

router.get('/profile/me', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await dbPromise.get(
            `SELECT id, username, email, rating, wins, losses, total_games, 
                    total_moves, total_captures, member_level, created_at 
             FROM users WHERE id = ?`,
            [userId]
        );

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Get rating history
        const ratingHistory = await dbPromise.all(
            `SELECT change, new_rating, result, opponent_id, created_at 
             FROM rating_changes WHERE player_id = ?
             ORDER BY created_at DESC LIMIT 10`,
            [userId]
        );

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                rating: user.rating,
                stats: {
                    wins: user.wins,
                    losses: user.losses,
                    totalGames: user.total_games,
                    totalMoves: user.total_moves,
                    totalCaptures: user.total_captures,
                    winRate: user.total_games > 0 
                        ? ((user.wins / user.total_games) * 100).toFixed(1)
                        : 0,
                    memberLevel: user.member_level
                },
                createdAt: user.created_at,
                ratingHistory
            }
        });

    } catch (err) {
        console.error('❌ Error fetching current user:', err);
        res.status(500).json({
            error: 'Error fetching profile',
            message: err.message
        });
    }
});

// ============================================
// UPDATE USER PROFILE
// ============================================

router.put('/profile/me', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { email, username } = req.body;

        // Can only update email (username is permanent)
        if (!email) {
            return res.status(400).json({
                error: 'Email is required'
            });
        }

        // Check if new email is taken (if different)
        const currentUser = await dbPromise.get(
            'SELECT email FROM users WHERE id = ?',
            [userId]
        );

        if (email !== currentUser.email) {
            const existingEmail = await dbPromise.get(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, userId]
            );

            if (existingEmail) {
                return res.status(409).json({
                    error: 'Email already in use'
                });
            }
        }

        await dbPromise.run(
            'UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [email, userId]
        );

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: userId,
                email
            }
        });

    } catch (err) {
        console.error('❌ Error updating profile:', err);
        res.status(500).json({
            error: 'Error updating profile',
            message: err.message
        });
    }
});

// ============================================
// SEARCH USERS
// ============================================

router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;

        if (query.length < 2) {
            return res.status(400).json({
                error: 'Search query must be at least 2 characters'
            });
        }

        const users = await dbPromise.all(
            `SELECT id, username, rating, member_level FROM users 
             WHERE username LIKE ? 
             LIMIT 20`,
            [`${query}%`]
        );

        res.json({
            query,
            results: users,
            count: users.length
        });

    } catch (err) {
        console.error('❌ Error searching users:', err);
        res.status(500).json({
            error: 'Error searching users',
            message: err.message
        });
    }
});

module.exports = router;

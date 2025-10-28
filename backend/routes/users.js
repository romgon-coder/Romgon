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
        const { userId, username } = req.user;
        
        console.log(`📊 Fetching stats for user ID: ${userId}, username: ${username}`);

        const user = await dbPromise.get(
            `SELECT id, username, email, rating, wins, losses, total_games, 
                    total_moves, total_captures, member_level, created_at 
             FROM users WHERE id = ?`,
            [userId]
        );

        if (!user) {
            console.error(`❌ User ID ${userId} (${username}) not found in database`);
            return res.status(404).json({
                error: 'User not found',
                userId: userId,
                username: username,
                message: `User ID ${userId} doesn't exist in the production database. Please log out and log in again with Google to create your account.`,
                action: 'Please clear your session and re-authenticate'
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
                    reason, end_time
             FROM games 
             WHERE (white_player_id = ? OR black_player_id = ?) AND status = 'finished'
             ORDER BY end_time DESC LIMIT 10`,
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
            userId: user.id,
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
        const { email, username, avatar, avatarType, badge } = req.body;

        // Build update fields dynamically
        const updates = [];
        const params = [];

        // Email update (if provided)
        if (email) {
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
            
            updates.push('email = ?');
            params.push(email);
        }

        // Avatar update (if provided)
        if (avatar !== undefined) {
            updates.push('avatar = ?');
            params.push(avatar);
        }

        // Avatar type update (if provided)
        if (avatarType !== undefined) {
            updates.push('avatar_type = ?');
            params.push(avatarType);
        }

        // Badge update (if provided)
        if (badge !== undefined) {
            updates.push('badge = ?');
            params.push(badge);
        }

        // If no updates, return error
        if (updates.length === 0) {
            return res.status(400).json({
                error: 'No fields to update'
            });
        }

        // Add updated_at timestamp
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(userId); // For WHERE clause

        // Execute update
        await dbPromise.run(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        // Fetch updated user data
        const updatedUser = await dbPromise.get(
            'SELECT id, username, email, avatar, avatar_type, badge FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
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

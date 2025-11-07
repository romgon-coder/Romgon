// ============================================
// GAME ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { body, param, query, validationResult } = require('express-validator');
const { authenticateToken } = require('../utils/auth');
const { db, dbPromise } = require('../config/database');

/**
 * Create a new game
 * POST /api/games/create
 */
router.post('/create', 
    authenticateToken,
    [
        body('opponentId').optional().isString().notEmpty(),
        body('color').optional().isIn(['white', 'black', 'random'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { opponentId, color } = req.body;
            const playerId = req.user.id;
            const gameId = uuidv4();

            // Determine colors
            let whiteId, blackId;
            if (color === 'white') {
                whiteId = playerId;
                blackId = opponentId || null;
            } else if (color === 'black') {
                whiteId = opponentId || null;
                blackId = playerId;
            } else {
                // Random assignment
                whiteId = Math.random() > 0.5 ? playerId : (opponentId || null);
                blackId = whiteId === playerId ? (opponentId || null) : playerId;
            }

            // Create game
            const query = `
                INSERT INTO games (id, white_player_id, black_player_id, status, moves, total_moves)
                VALUES (?, ?, ?, 'active', '[]', 0)
            `;

            await db.run(query, [gameId, whiteId, blackId]);

            res.status(201).json({
                gameId,
                whitePlayerId: whiteId,
                blackPlayerId: blackId,
                status: 'active',
                message: 'Game created successfully'
            });
        } catch (error) {
            console.error('Error creating game:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Join a game
 * POST /api/games/:gameId/join
 */
router.post('/:gameId/join',
    authenticateToken,
    [param('gameId').isUUID()],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { gameId } = req.params;
            const playerId = req.user.id;

            // Get game
            const game = await dbPromise.get('SELECT * FROM games WHERE id = ?', [gameId]);
            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }

            // Check if game is active
            if (game.status !== 'active') {
                return res.status(409).json({ error: 'Game is not active' });
            }

            // Join as whichever player is empty
            let updateQuery;
            if (!game.white_player_id) {
                updateQuery = 'UPDATE games SET white_player_id = ? WHERE id = ?';
            } else if (!game.black_player_id) {
                updateQuery = 'UPDATE games SET black_player_id = ? WHERE id = ?';
            } else {
                return res.status(409).json({ error: 'Game is full' });
            }

            await db.run(updateQuery, [playerId, gameId]);

            const updatedGame = await dbPromise.get('SELECT * FROM games WHERE id = ?', [gameId]);
            res.json({
                gameId,
                whitePlayerId: updatedGame.white_player_id,
                blackPlayerId: updatedGame.black_player_id,
                status: updatedGame.status,
                message: 'Joined game successfully'
            });
        } catch (error) {
            console.error('Error joining game:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Make a move
 * POST /api/games/:gameId/move
 */
router.post('/:gameId/move',
    authenticateToken,
    [
        param('gameId').isUUID(),
        body('move').isObject(),
        body('move.from').notEmpty(),
        body('move.to').notEmpty()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { gameId } = req.params;
            const { move } = req.body;
            const playerId = req.user.id;

            const game = await dbPromise.get('SELECT * FROM games WHERE id = ?', [gameId]);
            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }

            if (game.status !== 'active') {
                return res.status(409).json({ error: 'Game is not active' });
            }

            // Verify it's this player's turn
            const moves = JSON.parse(game.moves || '[]');
            const isWhiteTurn = moves.length % 2 === 0;
            const playerIsWhite = game.white_player_id === playerId;

            if (isWhiteTurn !== playerIsWhite) {
                return res.status(409).json({ error: 'Not your turn' });
            }

            // Add move
            moves.push({
                from: move.from,
                to: move.to,
                timestamp: new Date().toISOString(),
                playerId
            });

            const totalMoves = moves.length;

            // Update game
            await db.run(
                'UPDATE games SET moves = ?, total_moves = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [JSON.stringify(moves), totalMoves, gameId]
            );

            res.json({
                gameId,
                move,
                totalMoves,
                message: 'Move recorded successfully'
            });
        } catch (error) {
            console.error('Error making move:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * End game (resign or finish)
 * POST /api/games/:gameId/end
 */
router.post('/:gameId/end',
    authenticateToken,
    [
        param('gameId').isUUID(),
        body('reason').isIn(['checkmate', 'resignation', 'stalemate', 'insufficient_material', 'threefold_repetition', 'fifty_move_rule']),
        body('winner').optional().isString()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { gameId } = req.params;
            const { reason, winner } = req.body;
            const playerId = req.user.id;

            const game = await dbPromise.get('SELECT * FROM games WHERE id = ?', [gameId]);
            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }

            if (game.status !== 'active') {
                return res.status(409).json({ error: 'Game is already finished' });
            }

            // Determine winner
            let winnerId = winner;
            let winnerColor;
            if (reason === 'resignation') {
                // The player who resigned is not the winner
                winnerId = playerId === game.white_player_id ? game.black_player_id : game.white_player_id;
                winnerColor = playerId === game.white_player_id ? 'black' : 'white';
            }

            // Update game
            await db.run(
                `UPDATE games SET status = 'finished', winner_id = ?, winner_color = ?, reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [winnerId, winnerColor, reason, gameId]
            );

            res.json({
                gameId,
                status: 'finished',
                winnerId,
                winnerColor,
                reason,
                message: 'Game ended'
            });
        } catch (error) {
            console.error('Error ending game:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get player's games
 * GET /api/games/player/:playerId
 */
router.get('/player/:playerId',
    [
        param('playerId').isString(),
        body('limit').optional().isInt({ min: 1, max: 100 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { playerId } = req.params;
            const limit = req.query.limit || 20;

            const games = await dbPromise.all(
                `SELECT * FROM games 
                 WHERE white_player_id = ? OR black_player_id = ? 
                 ORDER BY updated_at DESC 
                 LIMIT ?`,
                [playerId, playerId, limit]
            );

            const formattedGames = games.map(game => ({
                gameId: game.id,
                whitePlayerId: game.white_player_id,
                blackPlayerId: game.black_player_id,
                status: game.status,
                totalMoves: game.total_moves,
                winner: game.winner_id,
                winnerColor: game.winner_color,
                reason: game.reason,
                createdAt: game.created_at,
                updatedAt: game.updated_at
            }));

            res.json(formattedGames);
        } catch (error) {
            console.error('Error getting player games:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get player's active games (for lobby display)
 * GET /api/games/active/:playerId
 */
router.get('/active/:playerId',
    [param('playerId').isString()],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { playerId } = req.params;

            // Check if this is a guest user
            if (playerId.startsWith('guest_')) {
                // Guests don't have persistent games
                return res.json({ games: [] });
            }

            // Get active games where player is involved
            const games = await dbPromise.all(
                `SELECT 
                    g.*,
                    w.username as white_username,
                    w.rating as white_rating,
                    b.username as black_username,
                    b.rating as black_rating
                 FROM games g
                 LEFT JOIN users w ON g.white_player_id = w.id
                 LEFT JOIN users b ON g.black_player_id = b.id
                 WHERE (g.white_player_id = ? OR g.black_player_id = ?)
                 AND g.status = 'active'
                 ORDER BY g.updated_at DESC
                 LIMIT 10`,
                [playerId, playerId]
            );

            const activeGames = games.map(game => {
                const moves = JSON.parse(game.moves || '[]');
                const isWhiteTurn = moves.length % 2 === 0;
                const playerIsWhite = game.white_player_id === playerId;
                const isPlayerTurn = isWhiteTurn === playerIsWhite;

                const opponentId = playerIsWhite ? game.black_player_id : game.white_player_id;
                const opponentName = playerIsWhite ? game.black_username : game.white_username;
                const opponentRating = playerIsWhite ? game.black_rating : game.white_rating;

                // Calculate time since last move
                const lastMoveTime = moves.length > 0 ? new Date(moves[moves.length - 1].timestamp) : new Date(game.created_at);
                const timeSinceLastMove = Date.now() - lastMoveTime.getTime();
                const minutes = Math.floor(timeSinceLastMove / 60000);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                let lastMoveAgo;
                if (days > 0) lastMoveAgo = `${days}d ago`;
                else if (hours > 0) lastMoveAgo = `${hours}h ago`;
                else if (minutes > 0) lastMoveAgo = `${minutes}m ago`;
                else lastMoveAgo = 'Just now';

                return {
                    gameId: game.id,
                    opponent: {
                        id: opponentId,
                        name: opponentName || 'Waiting...',
                        avatar: opponentName ? opponentName.charAt(0).toUpperCase() : '?',
                        rating: opponentRating || 1600
                    },
                    yourColor: playerIsWhite ? 'white' : 'black',
                    turn: isPlayerTurn ? 'your' : 'opponent',
                    moveCount: game.total_moves,
                    lastMove: lastMoveAgo,
                    createdAt: game.created_at,
                    updatedAt: game.updated_at
                };
            });

            res.json({ games: activeGames });
        } catch (error) {
            console.error('Error getting active games:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get current user's game history (simplified for frontend)
 * GET /api/games/history
 */
router.get('/history',
    authenticateToken,
    [query('limit').optional().isInt({ min: 1, max: 100 })],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const playerId = req.user.userId; // Get from JWT token
            const limit = parseInt(req.query.limit) || 10;

            // Get finished games
            const games = await dbPromise.all(
                `SELECT 
                    g.*,
                    w.username as white_username,
                    w.rating as white_rating,
                    b.username as black_username,
                    b.rating as black_rating
                 FROM games g
                 LEFT JOIN users w ON g.white_player_id = w.id
                 LEFT JOIN users b ON g.black_player_id = b.id
                 WHERE (g.white_player_id = ? OR g.black_player_id = ?)
                 AND g.status = 'finished'
                 ORDER BY COALESCE(g.end_time, g.start_time) DESC
                 LIMIT ?`,
                [playerId, playerId, limit]
            );

            const history = games.map(game => {
                const playerIsWhite = game.white_player_id === playerId;
                const opponentName = playerIsWhite ? game.black_username : game.white_username;
                const opponentRating = playerIsWhite ? game.black_rating : game.white_rating;

                const result = game.winner_id === playerId ? 'win' : 'loss';

                return {
                    gameId: game.id,
                    date: game.end_time || game.start_time,
                    opponent: {
                        name: opponentName || 'Unknown',
                        rating: opponentRating || 1600
                    },
                    yourColor: playerIsWhite ? 'white' : 'black',
                    result,
                    reason: game.reason,
                    moves: game.total_moves,
                    duration: calculateGameDuration(game.start_time, game.end_time)
                };
            });

            res.json(history);
        } catch (error) {
            console.error('Error getting game history:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get player's game history (for match history display)
 * GET /api/games/history/:playerId
 */
router.get('/history/:playerId',
    [
        param('playerId').isString(),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('offset').optional().isInt({ min: 0 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { playerId } = req.params;
            const limit = parseInt(req.query.limit) || 10;
            const offset = parseInt(req.query.offset) || 0;

            // Check if this is a guest user
            if (playerId.startsWith('guest_')) {
                // Guests don't have persistent game history
                return res.json({
                    games: [],
                    total: 0,
                    hasMore: false
                });
            }

            // Get finished games
            const games = await dbPromise.all(
                `SELECT 
                    g.*,
                    w.username as white_username,
                    w.rating as white_rating,
                    b.username as black_username,
                    b.rating as black_rating
                 FROM games g
                 LEFT JOIN users w ON g.white_player_id = w.id
                 LEFT JOIN users b ON g.black_player_id = b.id
                 WHERE (g.white_player_id = ? OR g.black_player_id = ?)
                 AND g.status = 'finished'
                 ORDER BY g.updated_at DESC
                 LIMIT ? OFFSET ?`,
                [playerId, playerId, limit, offset]
            );

            // Get total count
            const countResult = await dbPromise.get(
                `SELECT COUNT(*) as total FROM games 
                 WHERE (white_player_id = ? OR black_player_id = ?) 
                 AND status = 'finished'`,
                [playerId, playerId]
            );

            const history = games.map(game => {
                const playerIsWhite = game.white_player_id === playerId;
                const opponentName = playerIsWhite ? game.black_username : game.white_username;
                const opponentRating = playerIsWhite ? game.black_rating : game.white_rating;

                // Determine result (Romgon has no draws - every game has a winner)
                const result = game.winner_id === playerId ? 'win' : 'loss';

                // Get rating change (would need to query rating_changes table)
                // For now, estimate based on result
                let ratingChange = 0;
                // This should come from rating_changes table in production

                return {
                    gameId: game.id,
                    date: game.updated_at,
                    opponent: {
                        name: opponentName || 'Unknown',
                        rating: opponentRating || 1600
                    },
                    yourColor: playerIsWhite ? 'white' : 'black',
                    result,
                    reason: game.reason,
                    moves: game.total_moves,
                    ratingChange,
                    duration: calculateGameDuration(game.created_at, game.updated_at)
                };
            });

            res.json({
                games: history,
                total: countResult.total,
                hasMore: (offset + limit) < countResult.total
            });
        } catch (error) {
            console.error('Error getting game history:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Helper function to calculate game duration
 */
function calculateGameDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
        return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`;
    }
    return `${minutes}:00`;
}

// ============================================
// SUBMIT COMPLETED GAME RESULT (for local/AI games)
// POST /api/games/submit-result
// ============================================
router.post('/submit-result',
    authenticateToken,
    [
        body('opponent_type').isIn(['ai', 'local', 'human']).withMessage('Invalid opponent type'),
        body('result').isIn(['win', 'loss', 'draw']).withMessage('Invalid result'),
        body('winner').isString().notEmpty().withMessage('Winner is required'),
        body('move_count').optional().isInt({ min: 0 }).withMessage('Invalid move count'),
        body('captures').optional().isInt({ min: 0 }).withMessage('Invalid captures count'),
        body('old_rating').optional().isInt({ min: 0 }).withMessage('Invalid old rating'),
        body('new_rating').optional().isInt({ min: 0 }).withMessage('Invalid new rating'),
        body('rating_change').optional().isInt().withMessage('Invalid rating change'),
        body('moves').optional().isArray().withMessage('Moves must be an array'),
        body('reason').optional().isString().withMessage('Reason must be a string')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { 
                opponent_type, result, winner, move_count, captures, 
                old_rating, new_rating, rating_change, moves, reason 
            } = req.body;
            const playerId = req.user.userId;
            const gameId = uuidv4();

            // Get current user data including rating
            const db = await dbPromise;
            const user = await db.get('SELECT * FROM users WHERE id = ?', [playerId]);
            
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const currentRating = user.rating || 1600;

            // Determine player color based on winner
            const playerIsWhite = winner.toLowerCase() === 'white';
            const whitePlayerId = playerIsWhite ? playerId : null;
            const blackPlayerId = playerIsWhite ? null : playerId;

            // Determine winner_id based on result
            let winnerId = null;
            if (result === 'win') {
                winnerId = playerId;
            } else if (result === 'loss') {
                winnerId = null; // Opponent won (could be AI)
            }

            // Prepare moves array (default to empty array if not provided)
            const movesArray = moves || [];
            const movesJson = JSON.stringify(movesArray);
            const winnerColor = winner.toLowerCase(); // 'white' or 'black'

            // Insert the game as finished
            // Use CURRENT_TIMESTAMP for PostgreSQL, datetime('now') for SQLite
            const isPostgres = !!process.env.DATABASE_URL;
            const nowFunc = isPostgres ? 'CURRENT_TIMESTAMP' : "datetime('now')";
            
            await db.run(
                `INSERT INTO games (
                    id, white_player_id, black_player_id, 
                    status, winner_id, winner_color, reason,
                    moves, total_moves,
                    start_time, end_time
                ) VALUES (?, ?, ?, 'finished', ?, ?, ?, ?, ?, ${nowFunc}, ${nowFunc})`,
                [gameId, whitePlayerId, blackPlayerId, winnerId, winnerColor, reason || 'Game ended', movesJson, move_count || movesArray.length]
            );

            // Calculate rating change
            let calculatedNewRating = currentRating;
            let calculatedRatingChange = 0;
            
            if (opponent_type === 'ai') {
                // For AI games, use Elo calculation with AI rating of 1600
                const { calculateEloRating } = require('../utils/rating');
                const AI_RATING = 1600;
                const score = result === 'win' ? 1 : (result === 'loss' ? 0 : 0.5);
                
                calculatedNewRating = calculateEloRating(currentRating, AI_RATING, score);
                calculatedRatingChange = calculatedNewRating - currentRating;
                
                console.log(`🎯 Rating calculation for user ${playerId}:`, {
                    oldRating: currentRating,
                    newRating: calculatedNewRating,
                    change: calculatedRatingChange,
                    result,
                    opponent: 'AI'
                });
            } else if (new_rating !== undefined && rating_change !== undefined) {
                // Use frontend-provided rating if available (for PvP games)
                calculatedNewRating = new_rating;
                calculatedRatingChange = rating_change;
            }

            const totalMoves = move_count || movesArray.length;
            const capturesCount = captures || 0;
            
            // Update user stats including rating
            if (result === 'win') {
                await db.run(
                    `UPDATE users 
                     SET wins = wins + 1, 
                         total_games = total_games + 1,
                         total_moves = total_moves + ?,
                         total_captures = total_captures + ?,
                         rating = ?
                     WHERE id = ?`,
                    [totalMoves, capturesCount, calculatedNewRating, playerId]
                );
            } else if (result === 'loss') {
                await db.run(
                    `UPDATE users 
                     SET losses = losses + 1, 
                         total_games = total_games + 1,
                         total_moves = total_moves + ?,
                         total_captures = total_captures + ?,
                         rating = ?
                     WHERE id = ?`,
                    [totalMoves, capturesCount, calculatedNewRating, playerId]
                );
            } else {
                await db.run(
                    `UPDATE users 
                     SET draws = draws + 1, 
                         total_games = total_games + 1,
                         total_moves = total_moves + ?,
                         total_captures = total_captures + ?,
                         rating = ?
                     WHERE id = ?`,
                    [totalMoves, capturesCount, calculatedNewRating, playerId]
                );
            }

            // Record rating change in rating_changes table if available
            try {
                await db.run(
                    `INSERT INTO rating_changes (
                        player_id, old_rating, new_rating, change, 
                        game_id, opponent_id, opponent_rating, result
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        playerId, 
                        currentRating, 
                        calculatedNewRating, 
                        calculatedRatingChange,
                        gameId,
                        null, // No opponent ID for AI games
                        opponent_type === 'ai' ? 1600 : null,
                        result
                    ]
                );
            } catch (ratingError) {
                // rating_changes table might not exist, just log and continue
                console.warn('Could not insert rating change record:', ratingError.message);
            }

            console.log(`✅ Game result submitted for user ${playerId}: ${result} vs ${opponent_type} | Rating: ${currentRating} → ${calculatedNewRating} (${calculatedRatingChange >= 0 ? '+' : ''}${calculatedRatingChange})`);

            res.status(201).json({
                success: true,
                gameId,
                message: 'Game result submitted successfully',
                rating: calculatedNewRating,
                ratingChange: calculatedRatingChange,
                oldRating: currentRating
            });

        } catch (error) {
            console.error('Error submitting game result:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get all games history from all users (public leaderboard/history view)
 * GET /api/games/all-history
 */
router.get('/all-history',
    [
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('offset').optional().isInt({ min: 0 }),
        query('player').optional().isString(),
        query('result').optional().isIn(['win', 'loss', 'all'])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const playerFilter = req.query.player;
            const resultFilter = req.query.result;

            // Build the query
            let whereClause = "g.status = 'finished'";
            const params = [];

            // Filter by player if specified
            if (playerFilter) {
                whereClause += " AND (w.username LIKE ? OR b.username LIKE ?)";
                params.push(`%${playerFilter}%`, `%${playerFilter}%`);
            }

            // Get all finished games with player info
            const games = await dbPromise.all(
                `SELECT 
                    g.id,
                    g.white_player_id,
                    g.black_player_id,
                    g.winner_id,
                    g.winner_color,
                    g.reason,
                    g.total_moves,
                    g.status,
                    g.start_time,
                    g.end_time,
                    g.created_at,
                    g.updated_at,
                    w.username as white_username,
                    w.rating as white_rating,
                    w.avatar as white_avatar,
                    b.username as black_username,
                    b.rating as black_rating,
                    b.avatar as black_avatar
                 FROM games g
                 LEFT JOIN users w ON g.white_player_id = w.id
                 LEFT JOIN users b ON g.black_player_id = b.id
                 WHERE ${whereClause}
                 ORDER BY g.updated_at DESC
                 LIMIT ? OFFSET ?`,
                [...params, limit, offset]
            );

            // Get total count
            const countResult = await dbPromise.get(
                `SELECT COUNT(*) as total FROM games g
                 LEFT JOIN users w ON g.white_player_id = w.id
                 LEFT JOIN users b ON g.black_player_id = b.id
                 WHERE ${whereClause}`,
                params
            );

            // Format the games
            const formattedGames = games.map(game => {
                const winnerName = game.winner_color === 'white' 
                    ? (game.white_username || 'Unknown')
                    : (game.black_username || 'Unknown');

                const loserName = game.winner_color === 'white'
                    ? (game.black_username || 'Unknown')
                    : (game.white_username || 'Unknown');

                return {
                    gameId: game.id,
                    whitePlayer: {
                        id: game.white_player_id,
                        name: game.white_username || 'Unknown',
                        rating: game.white_rating || 1600,
                        avatar: game.white_avatar || '😀'
                    },
                    blackPlayer: {
                        id: game.black_player_id,
                        name: game.black_username || 'Unknown',
                        rating: game.black_rating || 1600,
                        avatar: game.black_avatar || '😀'
                    },
                    winner: {
                        color: game.winner_color,
                        name: winnerName
                    },
                    loser: {
                        name: loserName
                    },
                    reason: game.reason || 'Unknown',
                    moves: game.total_moves || 0,
                    date: game.end_time || game.updated_at,
                    duration: calculateGameDuration(game.start_time, game.end_time)
                };
            });

            res.json({
                success: true,
                games: formattedGames,
                total: countResult.total,
                hasMore: (offset + limit) < countResult.total,
                pagination: {
                    limit,
                    offset,
                    currentPage: Math.floor(offset / limit) + 1,
                    totalPages: Math.ceil(countResult.total / limit)
                }
            });
        } catch (error) {
            console.error('Error getting all games history:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * Get game state (MUST BE LAST - catches all unmatched routes)
 * GET /api/games/:gameId
 */
router.get('/:gameId',
    [param('gameId').isUUID()],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { gameId } = req.params;

            const game = await dbPromise.get('SELECT * FROM games WHERE id = ?', [gameId]);
            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }

            // Parse moves
            const moves = JSON.parse(game.moves || '[]');

            res.json({
                gameId: game.id,
                whitePlayerId: game.white_player_id,
                blackPlayerId: game.black_player_id,
                status: game.status,
                moves,
                totalMoves: game.total_moves,
                winner: game.winner_id,
                winnerColor: game.winner_color,
                reason: game.reason,
                createdAt: game.created_at,
                updatedAt: game.updated_at
            });
        } catch (error) {
            console.error('Error getting game:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router;


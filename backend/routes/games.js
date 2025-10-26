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
 * Get game state
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

module.exports = router;


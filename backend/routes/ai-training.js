// ============================================
// AI VS AI TRAINING & SPECTATOR ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { RomgonAI } = require('../ai/reinforcement-learning');
const realEngine = require('../engine/romgon-real-engine');
const { v4: uuidv4 } = require('uuid');
const { generateRPN, generateGameRPN, parseRPN } = require('../utils/rpn-generator');
const { dbPromise } = require('../config/database');

// Active AI training sessions
const trainingGames = new Map();
const aiInstances = new Map();

// Training game statistics
let totalTrainingGames = 0;
let trainingStartTime = null;

/**
 * Initialize AI instances
 */
function initializeAIs() {
    // Create two AI players at different levels
    aiInstances.set('white', new RomgonAI(5)); // Level 5
    aiInstances.set('black', new RomgonAI(5)); // Level 5
    console.log('🤖 AI instances initialized');
}

initializeAIs();

// ============================================
// DEBUG ENDPOINT - Check all games
// ============================================

/**
 * GET /api/ai-training/debug-games
 * Check all games in database (for debugging)
 */
router.get('/debug-games', async (req, res) => {
    try {
        const isPostgres = !!process.env.DATABASE_URL;
        
        // Get ALL games to see what's stored
        let query;
        if (isPostgres) {
            query = `
                SELECT 
                    g.id,
                    g.status,
                    g.winner_color,
                    g.moves,
                    g.total_moves,
                    g.white_player_id,
                    g.black_player_id,
                    g.created_at
                FROM games g
                ORDER BY g.created_at DESC
                LIMIT 20
            `;
        } else {
            query = `
                SELECT 
                    id,
                    status,
                    winner_color,
                    moves,
                    total_moves,
                    white_player_id,
                    black_player_id,
                    created_at
                FROM games
                ORDER BY created_at DESC
                LIMIT 20
            `;
        }
        
        const games = await dbPromise.all(query, []);
        
        // Analyze games
        const analysis = {
            totalGames: games.length,
            byStatus: {},
            withMoves: 0,
            withWinner: 0,
            completedWithMovesAndWinner: 0,
            games: games.map(g => {
                let movesArray = [];
                try {
                    movesArray = typeof g.moves === 'string' ? JSON.parse(g.moves) : (g.moves || []);
                } catch (e) {
                    movesArray = [];
                }
                
                return {
                    id: g.id,
                    status: g.status,
                    winner_color: g.winner_color,
                    total_moves: g.total_moves,
                    moves_length: movesArray.length,
                    has_moves: movesArray.length > 0,
                    white_player_id: g.white_player_id,
                    black_player_id: g.black_player_id,
                    created_at: g.created_at
                };
            })
        };
        
        // Count by status
        games.forEach(g => {
            analysis.byStatus[g.status] = (analysis.byStatus[g.status] || 0) + 1;
            
            let movesArray = [];
            try {
                movesArray = typeof g.moves === 'string' ? JSON.parse(g.moves) : (g.moves || []);
            } catch (e) {}
            
            if (movesArray.length > 0) analysis.withMoves++;
            if (g.winner_color) analysis.withWinner++;
            if (g.status === 'completed' && movesArray.length > 0 && g.winner_color) {
                analysis.completedWithMovesAndWinner++;
            }
        });
        
        res.json({
            success: true,
            analysis,
            message: `Found ${games.length} games. ${analysis.completedWithMovesAndWinner} meet training criteria (status=completed, has moves, has winner)`
        });
        
    } catch (error) {
        console.error('❌ Error debugging games:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// TRAINING DATA ENDPOINT
// ============================================

/**
 * GET /api/ai-training/training-data
 * Get completed games for AI training
 */
router.get('/training-data', async (req, res) => {
    try {
        const { limit = 1000, minRating = 1200 } = req.query;
        
        // Detect if using PostgreSQL or SQLite
        const isPostgres = !!process.env.DATABASE_URL;
        
        // Build query based on database type
        let query;
        if (isPostgres) {
            // PostgreSQL syntax
            query = `
                SELECT 
                    g.id,
                    g.moves,
                    g.winner_color as result,
                    g.total_moves,
                    g.created_at,
                    g.updated_at,
                    wu.rating as white_rating,
                    bu.rating as black_rating,
                    wu.username as white_username,
                    bu.username as black_username
                FROM games g
                LEFT JOIN users wu ON g.white_player_id = wu.id
                LEFT JOIN users bu ON g.black_player_id = bu.id
                WHERE g.status = 'completed'
                    AND g.winner_color IS NOT NULL
                    AND g.moves IS NOT NULL
                    AND g.moves != '[]'
                    AND (
                        (wu.rating >= $1 OR bu.rating >= $2)
                        OR (wu.rating IS NULL AND bu.rating IS NULL)
                    )
                ORDER BY g.updated_at DESC
                LIMIT $3
            `;
        } else {
            // SQLite syntax
            query = `
                SELECT 
                    g.id,
                    g.moves,
                    g.winner_color as result,
                    g.total_moves,
                    g.created_at,
                    g.updated_at,
                    wu.rating as white_rating,
                    bu.rating as black_rating,
                    wu.username as white_username,
                    bu.username as black_username
                FROM games g
                LEFT JOIN users wu ON g.white_player_id = wu.id
                LEFT JOIN users bu ON g.black_player_id = bu.id
                WHERE g.status = 'completed'
                    AND g.winner_color IS NOT NULL
                    AND g.moves IS NOT NULL
                    AND json_array_length(g.moves) > 5
                    AND (
                        (wu.rating >= ? OR bu.rating >= ?)
                        OR (wu.rating IS NULL AND bu.rating IS NULL)
                    )
                ORDER BY g.updated_at DESC
                LIMIT ?
            `;
        }
        
        const games = await dbPromise.all(query, [minRating, minRating, parseInt(limit)]);
        
        // Format games for training
        const trainingGames = games.map(game => {
            let moves = [];
            try {
                moves = typeof game.moves === 'string' ? JSON.parse(game.moves) : game.moves;
            } catch (e) {
                console.error(`Failed to parse moves for game ${game.id}:`, e);
            }
            
            return {
                id: game.id,
                moves: moves,
                result: game.result, // "white", "black", or "draw"
                whiteRating: game.white_rating || 1500,
                blackRating: game.black_rating || 1500,
                whitePlayer: game.white_username || 'Unknown',
                blackPlayer: game.black_username || 'Unknown',
                totalMoves: game.total_moves || moves.length,
                date: game.updated_at || game.created_at
            };
        });
        
        console.log(`📊 Retrieved ${trainingGames.length} games for AI training (minRating: ${minRating})`);
        
        res.json({
            success: true,
            games: trainingGames,
            count: trainingGames.length,
            filters: {
                limit: parseInt(limit),
                minRating: parseInt(minRating)
            }
        });
        
    } catch (error) {
        console.error('❌ Error getting training data:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: 'Failed to retrieve training data from database'
        });
    }
});

// ============================================
// START AI VS AI TRAINING
// ============================================

/**
 * POST /api/ai-training/start
 * Start a new AI vs AI training game
 */
router.post('/start', async (req, res) => {
    try {
        const { spectate = true, speed = 'normal' } = req.body;
        
        const gameId = uuidv4();
        const whiteAI = aiInstances.get('white');
        const blackAI = aiInstances.get('black');
        
        const trainingGame = {
            id: gameId,
            status: 'active',
            currentPlayer: 'white',
            moveHistory: [],
            gameHistory: [], // For learning
            board: initializeBoard(),
            moveNumber: 1,
            startTime: new Date().toISOString(),
            spectators: new Set(),
            speed: speed, // slow (2s), normal (1s), fast (500ms), instant (0ms)
            rpn: '', // RPN notation of the game
            whiteAI: {
                level: whiteAI.level,
                stats: whiteAI.getStats()
            },
            blackAI: {
                level: blackAI.level,
                stats: blackAI.getStats()
            }
        };
        
        trainingGames.set(gameId, trainingGame);
        totalTrainingGames++;
        
        if (!trainingStartTime) {
            trainingStartTime = new Date();
        }
        
        // Start the game loop (non-blocking)
        playAIGame(gameId);
        
        console.log(`🤖 Started AI vs AI training game: ${gameId}`);
        
        res.json({
            success: true,
            gameId,
            message: 'AI training game started',
            spectateUrl: `/api/ai-training/${gameId}/spectate`
        });
        
    } catch (error) {
        console.error('❌ Error starting AI training:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// SPECTATE AI GAME
// ============================================

/**
 * GET /api/ai-training/list/active
 * Get list of active training games
 */
router.get('/list/active', (req, res) => {
    try {
        const activeGames = Array.from(trainingGames.values())
            .filter(game => game.status === 'active')
            .map(game => ({
                id: game.id,
                moveNumber: game.moveNumber,
                currentPlayer: game.currentPlayer,
                spectatorCount: game.spectators.size,
                startTime: game.startTime,
                whiteWinRate: game.whiteAI.stats.winRate,
                blackWinRate: game.blackAI.stats.winRate
            }));
        
        res.json({
            success: true,
            games: activeGames,
            totalGames: activeGames.length
        });
        
    } catch (error) {
        console.error('❌ Error listing AI games:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/ai-training/stats/overall
 * Get overall AI training statistics
 */
router.get('/stats/overall', (req, res) => {
    try {
        const whiteAI = aiInstances.get('white');
        const blackAI = aiInstances.get('black');
        
        const uptimeMs = trainingStartTime ? Date.now() - trainingStartTime.getTime() : 0;
        const uptimeHours = (uptimeMs / (1000 * 60 * 60)).toFixed(1);
        
        res.json({
            success: true,
            stats: {
                totalGames: totalTrainingGames,
                activeGames: trainingGames.size,
                uptimeHours: parseFloat(uptimeHours),
                whiteAI: whiteAI.getStats(),
                blackAI: blackAI.getStats(),
                gamesPerHour: uptimeHours > 0 ? (totalTrainingGames / parseFloat(uptimeHours)).toFixed(1) : 0
            }
        });
        
    } catch (error) {
        console.error('❌ Error getting AI stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/ai-training/:gameId
 * Get current AI game state for spectating
 */
router.get('/:gameId', (req, res) => {
    try {
        const { gameId } = req.params;
        const game = trainingGames.get(gameId);
        
        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Training game not found'
            });
        }
        
        res.json({
            success: true,
            game: {
                id: game.id,
                status: game.status,
                currentPlayer: game.currentPlayer,
                moveNumber: game.moveNumber,
                gameState: {
                    board: game.board,
                    lastMove: game.moveHistory.length > 0 ? game.moveHistory[game.moveHistory.length - 1] : null
                },
                board: game.board,
                moveHistory: game.moveHistory.slice(-10), // Last 10 moves
                rpn: game.rpn || '', // Current RPN notation
                whiteAI: game.whiteAI,
                blackAI: game.blackAI,
                spectatorCount: game.spectators.size
            }
        });
        
    } catch (error) {
        console.error('❌ Error getting AI game:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ============================================
// AI GAME LOGIC
// ============================================

/**
 * Play an AI vs AI game
 */
async function playAIGame(gameId) {
    const game = trainingGames.get(gameId);
    if (!game) return;
    
    const whiteAI = aiInstances.get('white');
    const blackAI = aiInstances.get('black');
    
    // Game loop
    while (game.status === 'active') {
        const currentAI = game.currentPlayer === 'white' ? whiteAI : blackAI;
        
        // Get all legal moves using real engine with hardcoded patterns
        const legalMoves = realEngine.generateAllMoves(game.board, game.currentPlayer);
        
        if (legalMoves.length === 0) {
            // No legal moves - game over
            game.status = 'finished';
            game.result = game.currentPlayer === 'white' ? 'black_wins' : 'white_wins';
            break;
        }
        
        // AI picks a random move from legal moves (using hardcoded patterns only)
        const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        
        if (!move) {
            game.status = 'finished';
            game.result = 'draw';
            break;
        }
        
        // Store piece info before applying move
        const movingPiece = game.board[move.from];
        
        // Apply move using real engine
        game.board = realEngine.applyMove(game.board, move);
        
        // Record move
        game.moveHistory.push({
            moveNumber: game.moveNumber,
            player: game.currentPlayer,
            from: move.from,
            to: move.to,
            piece: movingPiece,
            notation: move.notation || `${move.from}→${move.to}`,
            timestamp: new Date().toISOString(),
            evaluation: 0, // No evaluation - random moves only
            thinkingTime: Math.floor(Math.random() * 100) + 20, // Faster thinking
            isExploration: true, // All moves are exploration
            isCapture: move.isCapture,
            capturedPiece: move.captured
        });
        
        // Update RPN notation
        game.rpn = generateRPN(game.moveHistory);
        
        // Store for learning
        game.gameHistory.push({
            board: JSON.parse(JSON.stringify(game.board)),
            move,
            playerColor: game.currentPlayer,
            evaluation: 0
        });
        
        // Broadcast to spectators
        broadcastGameUpdate(game);
        
        // Check for game over using real engine
        const gameOver = realEngine.isGameOver(game.board, game.moveNumber);
        if (gameOver.over) {
            game.status = 'finished';
            game.result = gameOver.winner;
            game.endTime = new Date().toISOString();
            
            // Generate full game RPN with metadata
            game.fullRPN = generateGameRPN({
                moveHistory: game.moveHistory,
                result: gameOver.winner,
                whiteAI: game.whiteAI,
                blackAI: game.blackAI,
                startTime: game.startTime,
                endTime: game.endTime,
                moveNumber: game.moveNumber
            });
            
            console.log(`📝 Game RPN: ${game.fullRPN.substring(0, 100)}...`);
            
            // AI learning from game
            whiteAI.learnFromGame(
                game.gameHistory.filter(h => h.playerColor === 'white'),
                gameOver.winner === 'white' ? 'win' : gameOver.winner === 'black' ? 'loss' : 'draw'
            );
            
            blackAI.learnFromGame(
                game.gameHistory.filter(h => h.playerColor === 'black'),
                gameOver.winner === 'black' ? 'win' : gameOver.winner === 'white' ? 'loss' : 'draw'
            );
            
            console.log(`🏁 AI game ${gameId} finished: ${gameOver.winner} (${gameOver.reason})`);
            
            // Clean up after 5 minutes
            setTimeout(() => {
                trainingGames.delete(gameId);
            }, 5 * 60 * 1000);
            
            break;
        }
        
        // Switch player
        game.currentPlayer = game.currentPlayer === 'white' ? 'black' : 'white';
        if (game.currentPlayer === 'white') {
            game.moveNumber++;
        }
        
        // Delay based on speed setting
        const delays = { slow: 2000, normal: 1000, fast: 500, instant: 0 };
        const delay = delays[game.speed] || 1000;
        
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Initialize game board with real pieces
 */
function initializeBoard() {
    return realEngine.initializeRealBoard();
}

/**
 * Broadcast game update to spectators (via WebSocket)
 */
function broadcastGameUpdate(game) {
    // This will be handled by WebSocket in gameSocket.js
    // For now, just update the game object
    game.lastUpdate = new Date().toISOString();
}

/**
 * Replay RPN game move by move
 */
async function replayRPNGame(gameId) {
    const game = trainingGames.get(gameId);
    if (!game || !game.isReplay) return;
    
    console.log(`📼 Starting replay of ${game.replayMoves.length} moves...`);
    
    while (game.replayIndex < game.replayMoves.length && game.status === 'replaying') {
        const rpnMove = game.replayMoves[game.replayIndex];
        
        // Validate move exists in current position
        const piece = game.board[rpnMove.from];
        if (!piece) {
            console.warn(`⚠️ Piece not found at ${rpnMove.from}, skipping move`);
            game.replayIndex++;
            continue;
        }
        
        // Apply move
        const move = {
            from: rpnMove.from,
            to: rpnMove.to,
            isCapture: game.board[rpnMove.to] ? true : false,
            captured: game.board[rpnMove.to]?.type
        };
        
        const movingPiece = game.board[move.from];
        game.board = realEngine.applyMove(game.board, move);
        
        // Record move
        game.moveHistory.push({
            moveNumber: game.moveNumber,
            player: game.currentPlayer,
            from: move.from,
            to: move.to,
            piece: movingPiece,
            notation: rpnMove.notation || `${move.from}→${move.to}`,
            timestamp: new Date().toISOString(),
            evaluation: 0,
            thinkingTime: 0,
            isExploration: false,
            isCapture: move.isCapture,
            capturedPiece: move.captured
        });
        
        // Broadcast update
        broadcastGameUpdate(game);
        
        // Switch player
        game.currentPlayer = game.currentPlayer === 'white' ? 'black' : 'white';
        if (game.currentPlayer === 'white') {
            game.moveNumber++;
        }
        
        game.replayIndex++;
        
        // Delay based on speed
        const delays = { slow: 2000, normal: 1000, fast: 500, instant: 0 };
        const delay = delays[game.speed] || 1000;
        
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    // Mark as finished
    game.status = 'finished';
    game.result = 'replay_complete';
    console.log(`✅ Replay finished: ${game.moveHistory.length} moves played`);
    
    // Clean up after 5 minutes
    setTimeout(() => {
        trainingGames.delete(gameId);
        console.log(`🧹 Cleaned up replay game: ${gameId}`);
    }, 300000);
}

// ============================================
// RPN EXPORT ROUTES
// ============================================

/**
 * GET /api/ai-training/:gameId/rpn
 * Get RPN notation for a game
 */
router.get('/:gameId/rpn', (req, res) => {
    try {
        const { gameId } = req.params;
        const game = trainingGames.get(gameId);
        
        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Training game not found'
            });
        }
        
        const rpn = game.status === 'finished' && game.fullRPN ? 
            game.fullRPN : 
            generateRPN(game.moveHistory);
        
        res.json({
            success: true,
            gameId: game.id,
            rpn: rpn,
            moveCount: game.moveHistory.length,
            status: game.status,
            result: game.result
        });
        
    } catch (error) {
        console.error('❌ Error getting RPN:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/ai-training/:gameId/export
 * Download game as RPN file
 */
router.get('/:gameId/export', (req, res) => {
    try {
        const { gameId } = req.params;
        const game = trainingGames.get(gameId);
        
        if (!game) {
            return res.status(404).json({
                success: false,
                error: 'Training game not found'
            });
        }
        
        const rpn = game.status === 'finished' && game.fullRPN ? 
            game.fullRPN : 
            generateGameRPN({
                moveHistory: game.moveHistory,
                result: game.result,
                whiteAI: game.whiteAI,
                blackAI: game.blackAI,
                startTime: game.startTime,
                endTime: game.endTime,
                moveNumber: game.moveNumber
            });
        
        const filename = `romgon-ai-game-${gameId.substring(0, 8)}.rpn`;
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(rpn);
        
    } catch (error) {
        console.error('❌ Error exporting RPN:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/ai-training/import
 * Import and replay RPN game
 */
router.post('/import', async (req, res) => {
    try {
        const { rpn, speed = 'normal', autoPlay = true } = req.body;
        
        if (!rpn || typeof rpn !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'RPN string is required'
            });
        }
        
        // Parse RPN to moves
        const moves = parseRPN(rpn);
        
        if (moves.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid RPN format or empty game'
            });
        }
        
        // Create replay game
        const gameId = uuidv4();
        const replayGame = {
            id: gameId,
            status: 'replaying',
            currentPlayer: 'white',
            moveHistory: [],
            gameHistory: [],
            board: initializeBoard(),
            moveNumber: 1,
            startTime: new Date().toISOString(),
            spectators: new Set(),
            speed: speed,
            rpn: rpn,
            isReplay: true,
            replayMoves: moves,
            replayIndex: 0,
            whiteAI: { level: 0, stats: { gamesPlayed: 0, wins: 0, losses: 0, winRate: 0 } },
            blackAI: { level: 0, stats: { gamesPlayed: 0, wins: 0, losses: 0, winRate: 0 } }
        };
        
        trainingGames.set(gameId, replayGame);
        
        // Start replaying if autoPlay
        if (autoPlay) {
            replayRPNGame(gameId);
        }
        
        console.log(`📼 Started RPN replay: ${gameId} (${moves.length} moves)`);
        
        res.json({
            success: true,
            gameId,
            moveCount: moves.length,
            message: 'RPN game imported and replay started'
        });
        
    } catch (error) {
        console.error('❌ Error importing RPN:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Export for WebSocket integration
module.exports = {
    router,
    trainingGames,
    aiInstances
};

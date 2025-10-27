// ============================================
// AI VS AI TRAINING & SPECTATOR ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { RomgonAI } = require('../ai/reinforcement-learning');
const { v4: uuidv4 } = require('uuid');

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
                board: game.board,
                moveHistory: game.moveHistory.slice(-10), // Last 10 moves
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
 * GET /api/ai-training/stats
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
        
        // Get AI move
        const gameState = {
            board: game.board,
            currentPlayer: game.currentPlayer,
            moveHistory: game.moveHistory
        };
        
        const move = await currentAI.getMove(gameState, game.currentPlayer);
        
        if (!move) {
            // No legal moves - game over
            game.status = 'finished';
            game.result = game.currentPlayer === 'white' ? 'black_wins' : 'white_wins';
            break;
        }
        
        // Apply move
        applyMove(game, move);
        
        // Store for learning
        game.gameHistory.push({
            gameState: { ...gameState },
            move,
            playerColor: game.currentPlayer
        });
        
        // Broadcast to spectators via WebSocket (if available)
        broadcastGameUpdate(game);
        
        // Check for game over
        if (isGameOver(game)) {
            game.status = 'finished';
            const result = determineWinner(game);
            game.result = result;
            
            // AI learning from game
            whiteAI.learnFromGame(
                game.gameHistory.filter(h => h.playerColor === 'white'),
                result === 'white_wins' ? 'win' : result === 'black_wins' ? 'loss' : 'draw'
            );
            
            blackAI.learnFromGame(
                game.gameHistory.filter(h => h.playerColor === 'black'),
                result === 'black_wins' ? 'win' : result === 'white_wins' ? 'loss' : 'draw'
            );
            
            console.log(`🏁 AI game ${gameId} finished: ${result}`);
            
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
 * Initialize game board
 */
function initializeBoard() {
    // Simplified board representation
    return {
        white: { pieces: 12, positions: [] },
        black: { pieces: 12, positions: [] }
    };
}

/**
 * Apply move to game
 */
function applyMove(game, move) {
    game.moveHistory.push({
        moveNumber: game.moveNumber,
        player: game.currentPlayer,
        from: move.from,
        to: move.to,
        notation: move.notation || `${move.from}-${move.to}`,
        timestamp: new Date().toISOString(),
        evaluation: move.evaluation,
        thinkingTime: move.thinkingTime,
        isExploration: move.isExploration
    });
}

/**
 * Check if game is over
 */
function isGameOver(game) {
    // Simplified: game ends after 100 moves or if a player has no pieces
    return game.moveNumber > 100 || 
           game.board.white.pieces === 0 || 
           game.board.black.pieces === 0;
}

/**
 * Determine winner
 */
function determineWinner(game) {
    if (game.board.white.pieces === 0) return 'black_wins';
    if (game.board.black.pieces === 0) return 'white_wins';
    return 'draw';
}

/**
 * Broadcast game update to spectators (via WebSocket)
 */
function broadcastGameUpdate(game) {
    // This will be handled by WebSocket in gameSocket.js
    // For now, just update the game object
    game.lastUpdate = new Date().toISOString();
}

// Export for WebSocket integration
module.exports = {
    router,
    trainingGames,
    aiInstances
};

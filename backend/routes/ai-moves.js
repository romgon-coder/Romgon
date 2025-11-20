// ============================================
// AI MOVES API - Uses Improved Backend Engine
// ============================================

const express = require('express');
const router = express.Router();
const { RomgonAI } = require('../ai/reinforcement-learning');
const { generateAllMoves, evaluatePosition } = require('../engine/romgon-real-engine');

// Initialize AI instance
const ai = new RomgonAI();

// Track game histories for learning (keyed by gameId or session)
const gameHistories = new Map();

/**
 * POST /api/ai/move
 * Get AI move using improved backend engine with flip mode support
 * 
 * Body:
 * {
 *   board: { "3-4": { color: "white", type: "rhombus", flipped: false }, ... },
 *   currentPlayer: "white" | "black",
 *   flipModeEnabled: boolean,
 *   difficulty: "easy" | "medium" | "hard"
 * }
 * 
 * Response:
 * {
 *   move: { from: "3-4", to: "4-5", score: 150 },
 *   evaluation: 250,
 *   thinkingTime: 123
 * }
 */
router.post('/move', async (req, res) => {
    try {
        const startTime = Date.now();
        const { board, currentPlayer, flipModeEnabled = false, difficulty = 'hard' } = req.body;

        // Validate request
        if (!board || !currentPlayer) {
            return res.status(400).json({
                error: 'Missing required fields: board, currentPlayer'
            });
        }

        console.log(`🤖 AI Move Request: ${currentPlayer} player, flip mode: ${flipModeEnabled}, difficulty: ${difficulty}`);
        console.log(`📋 Board state:`, Object.keys(board).length, 'pieces');
        
        // DEBUG: Log flip states in board
        const flippedPieces = Object.entries(board).filter(([pos, piece]) => piece.flipped === true);
        console.log(`🔄 Flipped pieces received: ${flippedPieces.length}`);
        if (flippedPieces.length > 0) {
            console.log('   Flipped:', flippedPieces.map(([pos, p]) => `${pos}:${p.color[0]}${p.type[0]}`).join(', '));
        }

        // Generate all legal moves using improved engine
        const legalMoves = generateAllMoves(board, currentPlayer, flipModeEnabled);
        
        if (legalMoves.length === 0) {
            return res.status(200).json({
                move: null,
                evaluation: 0,
                thinkingTime: Date.now() - startTime,
                message: 'No legal moves available'
            });
        }

        console.log(`✅ Generated ${legalMoves.length} legal moves`);
        
        // DEBUG: Show move breakdown by piece type
        const movesByType = {};
        legalMoves.forEach(move => {
            const piece = board[move.from];
            if (piece) {
                const key = piece.type;
                movesByType[key] = (movesByType[key] || 0) + 1;
            }
        });
        console.log('📊 Moves by piece type:', movesByType);

        // Select best move based on difficulty
        let selectedMove;
        
        if (difficulty === 'easy') {
            // Easy: Pick random move
            selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            console.log('🎲 Easy mode: Selected random move');
        } else if (difficulty === 'medium') {
            // Medium: Evaluate each move and pick from top 3
            const evaluatedMoves = legalMoves.map(move => {
                // Apply move temporarily
                const testBoard = JSON.parse(JSON.stringify(board));
                const piece = testBoard[move.from];
                testBoard[move.to] = piece;
                delete testBoard[move.from];
                
                // Evaluate resulting position
                const score = evaluatePosition(testBoard, currentPlayer, flipModeEnabled);
                
                return { ...move, score };
            });

            // Sort by score and pick from top 3
            evaluatedMoves.sort((a, b) => b.score - a.score);
            const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
            selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
            console.log(`🎯 Medium mode: Selected from top ${topMoves.length} moves (score: ${selectedMove.score})`);
        } else {
            // Hard: Use full AI with Q-learning
            const gameState = {
                board,
                flipModeEnabled,
                currentPlayer
            };
            const bestMove = await ai.getMove(gameState, currentPlayer);
            
            if (bestMove) {
                selectedMove = bestMove;
                console.log(`🧠 Hard mode: AI selected move with Q-learning (score: ${bestMove.evaluation || 'N/A'})`);
            } else {
                // Fallback to evaluation if AI returns nothing
                const evaluatedMoves = legalMoves.map(move => {
                    const testBoard = JSON.parse(JSON.stringify(board));
                    const piece = testBoard[move.from];
                    testBoard[move.to] = piece;
                    delete testBoard[move.from];
                    
                    const score = evaluatePosition(testBoard, currentPlayer, flipModeEnabled);
                    return { ...move, score };
                });

                evaluatedMoves.sort((a, b) => b.score - a.score);
                selectedMove = evaluatedMoves[0];
                console.log(`📊 Hard mode fallback: Selected best evaluated move (score: ${selectedMove.score})`);
            }
        }

        // Calculate final evaluation
        const testBoard = JSON.parse(JSON.stringify(board));
        const piece = testBoard[selectedMove.from];
        testBoard[selectedMove.to] = piece;
        delete testBoard[selectedMove.from];
        const finalEvaluation = evaluatePosition(testBoard, currentPlayer, flipModeEnabled);

        const thinkingTime = Date.now() - startTime;

        console.log(`✅ AI Move: ${selectedMove.from} → ${selectedMove.to} (evaluation: ${finalEvaluation}, time: ${thinkingTime}ms)`);

        res.json({
            move: selectedMove,
            evaluation: finalEvaluation,
            thinkingTime,
            totalMoves: legalMoves.length
        });

    } catch (error) {
        console.error('❌ AI Move Error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to generate AI move',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

/**
 * POST /api/ai/evaluate
 * Evaluate a board position
 */
router.post('/evaluate', async (req, res) => {
    try {
        const { board, currentPlayer, flipModeEnabled = false } = req.body;

        if (!board || !currentPlayer) {
            return res.status(400).json({
                error: 'Missing required fields: board, currentPlayer'
            });
        }

        const evaluation = evaluatePosition(board, currentPlayer, flipModeEnabled);

        res.json({
            evaluation,
            flipModeEnabled
        });

    } catch (error) {
        console.error('❌ Evaluation Error:', error);
        res.status(500).json({
            error: 'Failed to evaluate position',
            message: error.message
        });
    }
});

/**
 * GET /api/ai/health
 * Check AI system health
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        engine: 'romgon-real-engine',
        aiModel: 'reinforcement-learning',
        flipModeSupported: true,
        stats: ai.getStats()
    });
});

/**
 * POST /api/ai/game-start
 * Initialize a new game for tracking
 */
router.post('/game-start', (req, res) => {
    try {
        const { gameId, flipModeEnabled = false } = req.body;
        
        if (!gameId) {
            return res.status(400).json({
                error: 'Missing required field: gameId'
            });
        }

        gameHistories.set(gameId, {
            moves: [],
            flipModeEnabled,
            startTime: Date.now()
        });

        console.log(`📝 Started tracking game: ${gameId}`);

        res.json({
            success: true,
            gameId,
            message: 'Game tracking initialized'
        });

    } catch (error) {
        console.error('❌ Error starting game tracking:', error);
        res.status(500).json({
            error: 'Failed to initialize game tracking',
            message: error.message
        });
    }
});

/**
 * POST /api/ai/game-move
 * Record a move in game history
 */
router.post('/game-move', (req, res) => {
    try {
        const { gameId, board, move, playerColor } = req.body;
        
        if (!gameId || !board || !move || !playerColor) {
            return res.status(400).json({
                error: 'Missing required fields: gameId, board, move, playerColor'
            });
        }

        const gameHistory = gameHistories.get(gameId);
        if (!gameHistory) {
            return res.status(404).json({
                error: 'Game not found. Call /game-start first'
            });
        }

        // Record the move with game state
        gameHistory.moves.push({
            gameState: {
                board: JSON.parse(JSON.stringify(board)),
                flipModeEnabled: gameHistory.flipModeEnabled,
                currentPlayer: playerColor
            },
            move: move,
            playerColor: playerColor,
            timestamp: Date.now()
        });

        res.json({
            success: true,
            movesRecorded: gameHistory.moves.length
        });

    } catch (error) {
        console.error('❌ Error recording move:', error);
        res.status(500).json({
            error: 'Failed to record move',
            message: error.message
        });
    }
});

/**
 * POST /api/ai/game-end
 * Complete a game and trigger learning
 */
router.post('/game-end', async (req, res) => {
    try {
        const { gameId, winner } = req.body;
        
        if (!gameId || !winner) {
            return res.status(400).json({
                error: 'Missing required fields: gameId, winner'
            });
        }

        const gameHistory = gameHistories.get(gameId);
        if (!gameHistory) {
            return res.status(404).json({
                error: 'Game not found'
            });
        }

        console.log(`🎓 Learning from game ${gameId}: winner = ${winner}, moves = ${gameHistory.moves.length}`);

        // Determine result from AI's perspective (AI plays white)
        const result = winner === 'white' ? 'win' : (winner === 'black' ? 'loss' : 'draw');

        // Learn from the game
        if (gameHistory.moves.length > 0) {
            ai.learnFromGame(gameHistory.moves, result);
            console.log(`✅ AI learned from ${gameHistory.moves.length} moves`);
        }

        // Clean up
        gameHistories.delete(gameId);

        // Get updated stats
        const stats = ai.getStats();

        res.json({
            success: true,
            learned: true,
            movesProcessed: gameHistory.moves.length,
            result: result,
            aiStats: stats
        });

    } catch (error) {
        console.error('❌ Error completing game:', error);
        res.status(500).json({
            error: 'Failed to complete game learning',
            message: error.message
        });
    }
});

/**
 * POST /api/ai/train-from-database
 * Train AI from completed games in database
 */
router.post('/train-from-database', async (req, res) => {
    try {
        const { minRating = 0, maxGames = 100 } = req.body;
        
        console.log(`🎓 Starting AI training from database (minRating: ${minRating}, maxGames: ${maxGames})`);

        // Fetch training data
        const trainingDataResponse = await fetch(`${req.protocol}://${req.get('host')}/api/ai-training/training-data?minRating=${minRating}&limit=${maxGames}`);
        
        if (!trainingDataResponse.ok) {
            throw new Error('Failed to fetch training data');
        }

        const trainingData = await trainingDataResponse.json();
        const games = trainingData.games || [];

        console.log(`📚 Fetched ${games.length} games for training`);

        let gamesProcessed = 0;
        let movesProcessed = 0;

        // Learn from each game
        for (const game of games) {
            if (!game.moves || game.moves.length === 0) continue;

            // Convert database format to learning format
            const gameHistory = convertGameToHistory(game);
            
            if (gameHistory.length === 0) continue;

            // Determine result
            const result = game.winner === 'white' ? 'win' : 
                          game.winner === 'black' ? 'loss' : 'draw';

            // Learn from game
            ai.learnFromGame(gameHistory, result);
            
            gamesProcessed++;
            movesProcessed += gameHistory.length;
        }

        console.log(`✅ Training complete: ${gamesProcessed} games, ${movesProcessed} moves`);

        const stats = ai.getStats();

        res.json({
            success: true,
            gamesProcessed,
            movesProcessed,
            aiStats: stats
        });

    } catch (error) {
        console.error('❌ Error training from database:', error);
        res.status(500).json({
            error: 'Failed to train from database',
            message: error.message
        });
    }
});

/**
 * Helper: Convert database game format to learning history format
 */
function convertGameToHistory(game) {
    const history = [];
    
    if (!game.moves || !Array.isArray(game.moves)) {
        return history;
    }

    // Reconstruct board state for each move
    let board = initializeBoard();
    
    for (const move of game.moves) {
        // Record state before move
        history.push({
            gameState: {
                board: JSON.parse(JSON.stringify(board)),
                flipModeEnabled: game.flipModeEnabled || false,
                currentPlayer: move.player
            },
            move: {
                from: move.from,
                to: move.to,
                isCapture: move.isCapture || false
            },
            playerColor: move.player
        });

        // Apply move to board
        board = applyMoveToBoard(board, move);
    }

    return history;
}

/**
 * Helper: Initialize board
 */
function initializeBoard() {
    const { initializeRealBoard } = require('../engine/romgon-real-engine');
    return initializeRealBoard();
}

/**
 * Helper: Apply move to board
 */
function applyMoveToBoard(board, move) {
    const newBoard = JSON.parse(JSON.stringify(board));
    const piece = newBoard[move.from];
    
    if (piece) {
        // Handle flip action
        if (move.isFlip || (move.from === move.to)) {
            piece.flipped = !piece.flipped;
        } else {
            // Handle normal move
            if (move.isCapture && newBoard[move.to]) {
                delete newBoard[move.to];
            }
            newBoard[move.to] = piece;
            delete newBoard[move.from];
        }
    }
    
    return newBoard;
}

/**
 * GET /api/ai/stats
 * Get detailed AI statistics
 */
router.get('/stats', (req, res) => {
    try {
        const stats = ai.getStats();
        
        res.json({
            success: true,
            stats: stats,
            activeGames: gameHistories.size
        });

    } catch (error) {
        console.error('❌ Error getting AI stats:', error);
        res.status(500).json({
            error: 'Failed to get AI stats',
            message: error.message
        });
    }
});

/**
 * POST /api/ai/save
 * Save AI state to file
 */
router.post('/save', async (req, res) => {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        
        const aiData = ai.serialize();
        const savePath = path.join(__dirname, '../data/ai-state.json');
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(savePath), { recursive: true });
        
        // Save AI state
        await fs.writeFile(savePath, JSON.stringify(aiData, null, 2));
        
        console.log(`💾 AI state saved to ${savePath}`);
        
        res.json({
            success: true,
            message: 'AI state saved successfully',
            stats: ai.getStats()
        });

    } catch (error) {
        console.error('❌ Error saving AI state:', error);
        res.status(500).json({
            error: 'Failed to save AI state',
            message: error.message
        });
    }
});

/**
 * POST /api/ai/load
 * Load AI state from file
 */
router.post('/load', async (req, res) => {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        
        const savePath = path.join(__dirname, '../data/ai-state.json');
        
        // Check if file exists
        try {
            await fs.access(savePath);
        } catch {
            return res.status(404).json({
                error: 'No saved AI state found'
            });
        }
        
        // Load AI state
        const aiDataJson = await fs.readFile(savePath, 'utf8');
        const aiData = JSON.parse(aiDataJson);
        
        // Restore AI from saved state
        const loadedAI = RomgonAI.deserialize(aiData);
        Object.assign(ai, loadedAI);
        
        console.log(`📂 AI state loaded from ${savePath}`);
        
        res.json({
            success: true,
            message: 'AI state loaded successfully',
            stats: ai.getStats()
        });

    } catch (error) {
        console.error('❌ Error loading AI state:', error);
        res.status(500).json({
            error: 'Failed to load AI state',
            message: error.message
        });
    }
});

module.exports = router;

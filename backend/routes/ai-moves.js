// ============================================
// AI MOVES API - Uses Improved Backend Engine
// ============================================

const express = require('express');
const router = express.Router();
const { RomgonAI } = require('../ai/reinforcement-learning');
const { generateAllMoves, evaluatePosition } = require('../engine/romgon-real-engine');

// Initialize AI instance
const ai = new RomgonAI();

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
            const bestMove = ai.selectMove(board, currentPlayer, flipModeEnabled);
            
            if (bestMove) {
                selectedMove = bestMove;
                console.log(`🧠 Hard mode: AI selected move with Q-learning (score: ${bestMove.score || 'N/A'})`);
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
        flipModeSupported: true
    });
});

module.exports = router;

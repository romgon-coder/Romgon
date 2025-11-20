// ============================================
// MINIMAX AI ENGINE - Stockfish-style search
// ============================================

const { generateAllMoves, initializeRealBoard } = require('../engine/romgon-real-engine');

/**
 * Advanced position evaluator - analyzes board state
 */
class PositionEvaluator {
    constructor() {
        // Piece values
        this.PIECE_VALUES = {
            rhombus: 10000,    // King equivalent - infinite value
            triangle: 300,     // Queen equivalent  
            circle: 500,       // Rook equivalent
            square: 300        // Bishop/Knight equivalent
        };

        // Position bonuses for center control
        this.CENTER_SQUARES = [
            '3-3', '3-4', '3-5',
            '4-3', '4-4', '4-5',
            '5-3', '5-4', '5-5'
        ];

        // Extended center (outer ring)
        this.EXTENDED_CENTER = [
            '2-2', '2-3', '2-4', '2-5', '2-6',
            '3-2', '3-6',
            '4-2', '4-6',
            '5-2', '5-6',
            '6-2', '6-3', '6-4', '6-5', '6-6'
        ];

        this.CENTER_CONTROL_BONUS = 50;
        this.EXTENDED_CENTER_BONUS = 20;
        this.MOBILITY_BONUS = 10;
        this.FLIP_ADVANTAGE_BONUS = 30;
        this.THREAT_PENALTY = 100;
        this.DEFENDING_RHOMBUS_BONUS = 150;
    }

    /**
     * Main evaluation function - returns score from perspective of player
     * Positive = good for player, Negative = bad for player
     */
    evaluate(board, player, flipModeEnabled = false) {
        let score = 0;

        const opponent = player === 'white' ? 'black' : 'white';
        
        // Material count
        score += this.evaluateMaterial(board, player, opponent);

        // Position evaluation
        score += this.evaluatePositions(board, player, opponent);

        // Mobility (number of moves available)
        score += this.evaluateMobility(board, player, opponent, flipModeEnabled);

        // Flip mode advantages
        if (flipModeEnabled) {
            score += this.evaluateFlipAdvantages(board, player, opponent);
        }

        // King safety (rhombus protection)
        score += this.evaluateKingSafety(board, player, opponent);

        // Control of center
        score += this.evaluateCenterControl(board, player, opponent);

        return Math.round(score);
    }

    /**
     * Material evaluation - piece count
     */
    evaluateMaterial(board, player, opponent) {
        let playerMaterial = 0;
        let opponentMaterial = 0;

        for (const [pos, piece] of Object.entries(board)) {
            const value = this.PIECE_VALUES[piece.type] || 0;
            
            if (piece.color === player) {
                playerMaterial += value;
            } else if (piece.color === opponent) {
                opponentMaterial += value;
            }
        }

        return playerMaterial - opponentMaterial;
    }

    /**
     * Position evaluation - piece placement quality
     */
    evaluatePositions(board, player, opponent) {
        let score = 0;

        for (const [pos, piece] of Object.entries(board)) {
            let positionValue = 0;

            // Center control bonus
            if (this.CENTER_SQUARES.includes(pos)) {
                positionValue += this.CENTER_CONTROL_BONUS;
            } else if (this.EXTENDED_CENTER.includes(pos)) {
                positionValue += this.EXTENDED_CENTER_BONUS;
            }

            // Apply to correct player
            if (piece.color === player) {
                score += positionValue;
            } else if (piece.color === opponent) {
                score -= positionValue;
            }
        }

        return score;
    }

    /**
     * Mobility evaluation - available moves
     */
    evaluateMobility(board, player, opponent, flipModeEnabled) {
        const playerMoves = generateAllMoves(board, player, flipModeEnabled);
        const opponentMoves = generateAllMoves(board, opponent, flipModeEnabled);

        const mobilityDiff = playerMoves.length - opponentMoves.length;
        return mobilityDiff * this.MOBILITY_BONUS;
    }

    /**
     * Flip mode specific evaluation
     */
    evaluateFlipAdvantages(board, player, opponent) {
        let score = 0;

        for (const [pos, piece] of Object.entries(board)) {
            // Flipped pieces are more flexible
            if (piece.flipped) {
                if (piece.color === player) {
                    score += this.FLIP_ADVANTAGE_BONUS;
                } else if (piece.color === opponent) {
                    score -= this.FLIP_ADVANTAGE_BONUS;
                }
            }
        }

        return score;
    }

    /**
     * King safety evaluation - rhombus protection
     */
    evaluateKingSafety(board, player, opponent) {
        let score = 0;

        // Find rhombuses
        const playerRhombus = this.findRhombus(board, player);
        const opponentRhombus = this.findRhombus(board, opponent);

        // Evaluate player's rhombus safety
        if (playerRhombus) {
            const threats = this.countThreats(board, playerRhombus, opponent);
            const defenders = this.countDefenders(board, playerRhombus, player);
            
            score -= threats * this.THREAT_PENALTY;
            score += defenders * this.DEFENDING_RHOMBUS_BONUS;
        }

        // Evaluate opponent's rhombus safety
        if (opponentRhombus) {
            const threats = this.countThreats(board, opponentRhombus, player);
            const defenders = this.countDefenders(board, opponentRhombus, opponent);
            
            score += threats * this.THREAT_PENALTY;
            score -= defenders * this.DEFENDING_RHOMBUS_BONUS;
        }

        return score;
    }

    /**
     * Center control evaluation
     */
    evaluateCenterControl(board, player, opponent) {
        let playerCenter = 0;
        let opponentCenter = 0;

        for (const pos of this.CENTER_SQUARES) {
            const piece = board[pos];
            if (piece) {
                if (piece.color === player) playerCenter++;
                else if (piece.color === opponent) opponentCenter++;
            }
        }

        return (playerCenter - opponentCenter) * this.CENTER_CONTROL_BONUS;
    }

    /**
     * Helper: Find rhombus position
     */
    findRhombus(board, color) {
        for (const [pos, piece] of Object.entries(board)) {
            if (piece.type === 'rhombus' && piece.color === color) {
                return pos;
            }
        }
        return null;
    }

    /**
     * Helper: Count threats to position
     */
    countThreats(board, targetPos, attackerColor) {
        let threats = 0;
        
        for (const [pos, piece] of Object.entries(board)) {
            if (piece.color === attackerColor) {
                // Check if this piece can attack target
                const moves = generateAllMoves(board, attackerColor, false);
                const canAttack = moves.some(m => m.from === pos && m.to === targetPos);
                if (canAttack) threats++;
            }
        }

        return threats;
    }

    /**
     * Helper: Count defenders of position
     */
    countDefenders(board, targetPos, defenderColor) {
        let defenders = 0;
        
        const [targetRow, targetCol] = targetPos.split('-').map(Number);
        
        for (const [pos, piece] of Object.entries(board)) {
            if (piece.color === defenderColor && pos !== targetPos) {
                const [row, col] = pos.split('-').map(Number);
                const distance = Math.abs(row - targetRow) + Math.abs(col - targetCol);
                
                // Adjacent pieces are defenders
                if (distance === 1) defenders++;
            }
        }

        return defenders;
    }
}

/**
 * Minimax AI Engine with Alpha-Beta Pruning
 */
class MinimaxEngine {
    constructor() {
        this.evaluator = new PositionEvaluator();
        this.nodesSearched = 0;
        this.pruneCount = 0;
        this.transpositionTable = new Map(); // Cache evaluated positions
        this.maxCacheSize = 10000;
        this.moveHistory = []; // Track recent moves to detect repetition
        this.maxHistorySize = 20;
    }

    /**
     * Get best move using minimax search
     * @param {Object} board - Current board state
     * @param {string} player - Current player color
     * @param {boolean} flipModeEnabled - Is flip mode active
     * @param {number} depth - Search depth (difficulty)
     * @param {number} timeLimit - Max thinking time in ms
     * @returns {Object} Best move with evaluation
     */
    getBestMove(board, player, flipModeEnabled = false, depth = 4, timeLimit = 5000) {
        this.nodesSearched = 0;
        this.pruneCount = 0;
        this.startTime = Date.now();
        this.timeLimit = timeLimit;
        this.maxDepth = depth;

        console.log(`🔍 Minimax search starting: depth=${depth}, timeLimit=${timeLimit}ms`);

        // Generate all legal moves
        const moves = generateAllMoves(board, player, flipModeEnabled);
        
        if (moves.length === 0) {
            return null;
        }

        // Order moves for better pruning
        const orderedMoves = this.orderMoves(board, moves, player);

        // ANTI-REPETITION: Penalize moves that repeat recent positions
        const scoredMoves = orderedMoves.map(move => {
            const moveKey = `${move.from}-${move.to}`;
            const repetitionCount = this.moveHistory.filter(m => m === moveKey).length;
            
            // Heavy penalty for repeated moves
            const repetitionPenalty = repetitionCount * 5000;
            
            return { move, repetitionPenalty };
        });

        let bestMove = null;
        let bestScore = -Infinity;
        let alpha = -Infinity;
        const beta = Infinity;

        // Evaluate each move
        for (const { move, repetitionPenalty } of scoredMoves) {
            // Check time limit
            if (Date.now() - this.startTime > this.timeLimit) {
                console.log(`⏰ Time limit reached, stopping search`);
                break;
            }

            // Apply move
            const newBoard = this.applyMove(board, move);

            // Search opponent's response (minimizing)
            const score = -this.minimax(
                newBoard,
                depth - 1,
                -beta,
                -alpha,
                player === 'white' ? 'black' : 'white',
                player,
                flipModeEnabled,
                false // not maximizing (opponent's turn)
            ) - repetitionPenalty; // Apply repetition penalty

            // Update best move
            if (score > bestScore) {
                bestScore = score;
                bestMove = { ...move, score };
            }

            // Update alpha
            alpha = Math.max(alpha, score);
        }

        // Record this move in history to detect future repetitions
        if (bestMove) {
            const moveKey = `${bestMove.from}-${bestMove.to}`;
            this.moveHistory.push(moveKey);
            
            // Keep history limited
            if (this.moveHistory.length > this.maxHistorySize) {
                this.moveHistory.shift();
            }
        }

        const searchTime = Date.now() - this.startTime;
        const nps = Math.round(this.nodesSearched / (searchTime / 1000));

        console.log(`✅ Search complete: ${this.nodesSearched} nodes, ${this.pruneCount} prunes, ${searchTime}ms, ${nps} nps`);
        console.log(`📊 Best move: ${bestMove.from} → ${bestMove.to} (score: ${bestScore})`);

        return {
            ...bestMove,
            evaluation: bestScore,
            nodesSearched: this.nodesSearched,
            pruneCount: this.pruneCount,
            searchTime
        };
    }

    /**
     * Minimax algorithm with alpha-beta pruning
     */
    minimax(board, depth, alpha, beta, player, originalPlayer, flipModeEnabled, maximizing) {
        this.nodesSearched++;

        // Check time limit
        if (Date.now() - this.startTime > this.timeLimit) {
            return this.evaluator.evaluate(board, originalPlayer, flipModeEnabled);
        }

        // Terminal node - evaluate position
        if (depth === 0) {
            return this.evaluator.evaluate(board, originalPlayer, flipModeEnabled);
        }

        // Check transposition table
        const boardHash = this.hashBoard(board);
        const cached = this.transpositionTable.get(boardHash);
        if (cached && cached.depth >= depth) {
            return cached.score;
        }

        // Generate moves
        const moves = generateAllMoves(board, player, flipModeEnabled);

        // Game over - no moves available
        if (moves.length === 0) {
            // Heavily penalize losing position
            return maximizing ? -999999 : 999999;
        }

        // Order moves for better pruning
        const orderedMoves = this.orderMoves(board, moves, player);

        if (maximizing) {
            let maxScore = -Infinity;

            for (const move of orderedMoves) {
                const newBoard = this.applyMove(board, move);
                
                const score = this.minimax(
                    newBoard,
                    depth - 1,
                    alpha,
                    beta,
                    player === 'white' ? 'black' : 'white',
                    originalPlayer,
                    flipModeEnabled,
                    false
                );

                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);

                // Beta cutoff - prune
                if (beta <= alpha) {
                    this.pruneCount++;
                    break;
                }
            }

            // Cache result
            this.cachePosition(boardHash, maxScore, depth);
            return maxScore;

        } else {
            let minScore = Infinity;

            for (const move of orderedMoves) {
                const newBoard = this.applyMove(board, move);
                
                const score = this.minimax(
                    newBoard,
                    depth - 1,
                    alpha,
                    beta,
                    player === 'white' ? 'black' : 'white',
                    originalPlayer,
                    flipModeEnabled,
                    true
                );

                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);

                // Alpha cutoff - prune
                if (beta <= alpha) {
                    this.pruneCount++;
                    break;
                }
            }

            // Cache result
            this.cachePosition(boardHash, minScore, depth);
            return minScore;
        }
    }

    /**
     * Order moves for better alpha-beta pruning
     * Best moves first = more cutoffs = faster search
     */
    orderMoves(board, moves, player) {
        const scoredMoves = moves.map(move => {
            let score = 0;

            const piece = board[move.from];
            const target = board[move.to];

            // Captures are good
            if (target) {
                score += 1000 + this.evaluator.PIECE_VALUES[target.type];
            }

            // Center moves are good
            if (this.evaluator.CENTER_SQUARES.includes(move.to)) {
                score += 100;
            }

            // Moving valuable pieces to safety
            if (piece) {
                score += this.evaluator.PIECE_VALUES[piece.type] * 0.1;
            }

            return { move, score };
        });

        // Sort descending by score
        scoredMoves.sort((a, b) => b.score - a.score);
        
        return scoredMoves.map(sm => sm.move);
    }

    /**
     * Apply move to board (returns new board)
     */
    applyMove(board, move) {
        const newBoard = JSON.parse(JSON.stringify(board));
        const piece = newBoard[move.from];

        if (!piece) return newBoard;

        // Handle flip
        if (move.isFlip || move.from === move.to) {
            piece.flipped = !piece.flipped;
        } else {
            // Normal move
            newBoard[move.to] = piece;
            delete newBoard[move.from];
        }

        return newBoard;
    }

    /**
     * Hash board state for transposition table
     */
    hashBoard(board) {
        const positions = Object.keys(board).sort();
        return positions.map(pos => {
            const piece = board[pos];
            return `${pos}:${piece.color[0]}${piece.type[0]}${piece.flipped ? 'f' : ''}`;
        }).join('|');
    }

    /**
     * Cache evaluated position
     */
    cachePosition(hash, score, depth) {
        // Limit cache size
        if (this.transpositionTable.size >= this.maxCacheSize) {
            // Remove oldest entries
            const keys = Array.from(this.transpositionTable.keys());
            for (let i = 0; i < 1000; i++) {
                this.transpositionTable.delete(keys[i]);
            }
        }

        this.transpositionTable.set(hash, { score, depth });
    }

    /**
     * Get statistics
     */
    getStats() {
        return {
            nodesSearched: this.nodesSearched,
            pruneCount: this.pruneCount,
            cacheSize: this.transpositionTable.size,
            moveHistorySize: this.moveHistory.length,
            pruneEfficiency: this.pruneCount > 0 
                ? Math.round((this.pruneCount / this.nodesSearched) * 100) 
                : 0
        };
    }

    /**
     * Clear cache and move history (call between games)
     */
    clearCache() {
        this.transpositionTable.clear();
        this.moveHistory = [];
        console.log('🧹 AI cache and move history cleared');
    }

    /**
     * Reset move history only (for new game)
     */
    resetMoveHistory() {
        this.moveHistory = [];
        console.log('🔄 AI move history reset');
    }
}

module.exports = { MinimaxEngine, PositionEvaluator };

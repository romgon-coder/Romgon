// ============================================
// ROMGON GAME ENGINE (Simplified for AI)
// ============================================

/**
 * Evaluate a board position
 * Returns a score from the perspective of the current player
 */
function evaluatePosition(gameState, playerColor) {
    // Simplified evaluation
    // In a real implementation, this would analyze:
    // - Material balance
    // - Position control
    // - Piece mobility
    // - Strategic advantage
    
    const board = gameState.board || { white: { pieces: 12 }, black: { pieces: 12 } };
    
    const whitePieces = board.white?.pieces || 12;
    const blackPieces = board.black?.pieces || 12;
    
    const materialScore = whitePieces - blackPieces;
    const positionScore = Math.random() * 2 - 1; // Random variation for learning
    
    const totalScore = materialScore * 10 + positionScore;
    
    return playerColor === 'white' ? totalScore : -totalScore;
}

/**
 * Find best move for current position
 */
async function findBestMove(gameState, playerColor, depth = 3) {
    try {
        // Generate candidate moves
        const candidateMoves = generateLegalMoves(gameState, playerColor);
        
        if (candidateMoves.length === 0) {
            return { bestMove: null, evaluation: 0, candidateMoves: [] };
        }
        
        // Evaluate each move
        const evaluatedMoves = candidateMoves.map(move => {
            const newState = applyMove(gameState, move, playerColor);
            const evaluation = evaluatePosition(newState, playerColor);
            
            return {
                ...move,
                evaluation,
                from: move.from,
                to: move.to,
                notation: `${move.from}${move.to}`
            };
        });
        
        // Sort by evaluation (best first)
        evaluatedMoves.sort((a, b) => b.evaluation - a.evaluation);
        
        return {
            bestMove: evaluatedMoves[0],
            evaluation: evaluatedMoves[0].evaluation,
            candidateMoves: evaluatedMoves.slice(0, 5) // Top 5 moves
        };
        
    } catch (error) {
        console.error('Error in findBestMove:', error);
        return { bestMove: null, evaluation: 0, candidateMoves: [] };
    }
}

/**
 * Generate legal moves (simplified)
 */
function generateLegalMoves(gameState, playerColor) {
    // Simplified move generation
    // In reality, this would:
    // - Analyze board state
    // - Find all pieces for current player
    // - Calculate legal moves per piece type
    // - Check for captures, special moves
    
    const moves = [];
    const positions = ['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8'];
    
    // Generate some random moves for simulation
    const numMoves = Math.floor(Math.random() * 5) + 3; // 3-7 moves
    
    for (let i = 0; i < numMoves; i++) {
        const fromPos = positions[Math.floor(Math.random() * positions.length)];
        const toPos = positions[Math.floor(Math.random() * positions.length)];
        
        if (fromPos !== toPos) {
            moves.push({
                from: fromPos,
                to: toPos,
                type: 'move',
                piece: playerColor === 'white' ? 'W' : 'B'
            });
        }
    }
    
    return moves;
}

/**
 * Apply a move to game state (returns new state)
 */
function applyMove(gameState, move, playerColor) {
    const newState = JSON.parse(JSON.stringify(gameState)); // Deep clone
    
    // Simplified: just update piece count randomly
    const captureChance = 0.3;
    if (Math.random() < captureChance) {
        const opponent = playerColor === 'white' ? 'black' : 'white';
        if (newState.board[opponent].pieces > 0) {
            newState.board[opponent].pieces--;
        }
    }
    
    return newState;
}

/**
 * Check if game is over
 */
function isGameOver(gameState) {
    const board = gameState.board || { white: { pieces: 12 }, black: { pieces: 12 } };
    
    return board.white.pieces === 0 || 
           board.black.pieces === 0 || 
           gameState.moveHistory?.length > 100;
}

/**
 * Get game result
 */
function getGameResult(gameState) {
    const board = gameState.board || { white: { pieces: 12 }, black: { pieces: 12 } };
    
    if (board.white.pieces === 0) return 'black_wins';
    if (board.black.pieces === 0) return 'white_wins';
    if (gameState.moveHistory?.length > 100) return 'draw';
    
    return null;
}

module.exports = {
    evaluatePosition,
    findBestMove,
    generateLegalMoves,
    applyMove,
    isGameOver,
    getGameResult
};

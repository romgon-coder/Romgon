// ============================================
// ROMGON REAL GAME ENGINE
// Exact Romgon rules with hardcoded patterns
// ============================================

const hardcodedPatterns = require('./romgon-patterns');

/**
 * Initialize a standard Romgon board
 * 7 pieces per player (2 triangles, 2 squares, 1 rhombus, 1 circle, 1 hexagon)
 */
function initializeRealBoard() {
    const board = {};
    
    // White pieces (starting positions from actual game)
    board['0-0'] = { color: 'white', type: 'square', id: 'ws1' };
    board['1-0'] = { color: 'white', type: 'triangle', id: 'wt1', rotation: 0 };
    board['2-0'] = { color: 'white', type: 'circle', id: 'wc1' };
    board['3-0'] = { color: 'white', type: 'rhombus', id: 'wr1' };
    board['4-0'] = { color: 'white', type: 'hexgon', id: 'wh1', rotation: 0 };
    board['5-0'] = { color: 'white', type: 'triangle', id: 'wt2', rotation: 0 };
    board['6-0'] = { color: 'white', type: 'square', id: 'ws2' };
    
    // Black pieces (starting positions from actual game)
    board['0-5'] = { color: 'black', type: 'square', id: 'bs1' };
    board['1-6'] = { color: 'black', type: 'triangle', id: 'bt1', rotation: 0 };
    board['2-7'] = { color: 'black', type: 'hexgon', id: 'bh1', rotation: 0 };
    board['3-8'] = { color: 'black', type: 'rhombus', id: 'br1' };
    board['4-7'] = { color: 'black', type: 'circle', id: 'bc1' };
    board['5-6'] = { color: 'black', type: 'triangle', id: 'bt2', rotation: 0 };
    board['6-5'] = { color: 'black', type: 'square', id: 'bs2' };
    
    return board;
}

/**
 * Get all legal moves for a piece at position
 */
function getLegalMoves(board, fromPos, playerColor) {
    const piece = board[fromPos];
    if (!piece || piece.color !== playerColor) return [];
    
    const [row, col] = fromPos.split('-').map(Number);
    let targets = [];
    
    // Get movement pattern based on piece type (using exact hardcoded patterns)
    if (piece.type === 'square') {
        targets = hardcodedPatterns.getSquareTargets(row, col);
    } else if (piece.type === 'triangle') {
        if (piece.color === 'white') {
            targets = hardcodedPatterns.getWhiteTriangleTargets(row, col);
        } else {
            targets = hardcodedPatterns.getBlackTriangleTargets(row, col);
        }
    } else if (piece.type === 'rhombus') {
        targets = hardcodedPatterns.getRhombusTargets(row, col);
    } else if (piece.type === 'circle') {
        targets = hardcodedPatterns.getCircleTargets(row, col);
    } else if (piece.type === 'hexgon') {
        targets = hardcodedPatterns.getHexagonTargets(row, col);
    }
    
    // Filter valid moves
    const moves = [];
    targets.forEach(([targetRow, targetCol]) => {
        // Check row bounds
        if (targetRow < 0 || targetRow > 6) return;
        
        // Check column bounds based on row
        const maxCols = [6, 7, 8, 9, 8, 7, 6]; // Columns per row
        if (targetCol < 0 || targetCol >= maxCols[targetRow]) return;
        
        const targetPos = `${targetRow}-${targetCol}`;
        const targetPiece = board[targetPos];
        
        if (!targetPiece) {
            // Empty - can move
            moves.push({ from: fromPos, to: targetPos, isCapture: false });
        } else if (targetPiece.color !== playerColor) {
            // Opponent piece - can capture (except rhombus vs rhombus)
            if (piece.type !== 'rhombus' || targetPiece.type !== 'rhombus') {
                moves.push({ from: fromPos, to: targetPos, isCapture: true, captured: targetPiece.type });
            }
        }
    });
    
    return moves;
}

/**
 * Apply a move to the board (returns new board state)
 */
function applyMove(board, move) {
    const newBoard = JSON.parse(JSON.stringify(board)); // Deep clone
    
    // Move piece
    const piece = newBoard[move.from];
    if (!piece) return newBoard;
    
    // Remove captured piece if any
    if (move.isCapture && newBoard[move.to]) {
        delete newBoard[move.to];
    }
    
    // Move to new position
    newBoard[move.to] = piece;
    delete newBoard[move.from];
    
    return newBoard;
}

/**
 * Check if game is over
 */
function isGameOver(board, moveCount) {
    const whitePieces = Object.values(board).filter(p => p.color === 'white');
    const blackPieces = Object.values(board).filter(p => p.color === 'black');
    
    // Check if either player lost their rhombus
    const whiteRhombus = whitePieces.find(p => p.type === 'rhombus');
    const blackRhombus = blackPieces.find(p => p.type === 'rhombus');
    
    if (!whiteRhombus) return { over: true, winner: 'black', reason: 'rhombus_captured' };
    if (!blackRhombus) return { over: true, winner: 'white', reason: 'rhombus_captured' };
    
    // Check if rhombus reached opponent base
    const whiteRhombusPos = Object.keys(board).find(pos => board[pos]?.id === 'wr1');
    const blackRhombusPos = Object.keys(board).find(pos => board[pos]?.id === 'br1');
    
    if (whiteRhombusPos === '3-8') return { over: true, winner: 'white', reason: 'base_captured' };
    if (blackRhombusPos === '3-0') return { over: true, winner: 'black', reason: 'base_captured' };
    
    // Move limit reached
    if (moveCount >= 200) return { over: true, winner: 'draw', reason: 'move_limit' };
    
    return { over: false };
}

/**
 * Evaluate board position
 */
function evaluatePosition(board, playerColor) {
    let score = 0;
    
    // Piece values
    const pieceValues = {
        'rhombus': 1000,
        'triangle': 6,
        'hexgon': 5,
        'circle': 4,
        'square': 3
    };
    
    // Material count
    Object.values(board).forEach(piece => {
        const value = pieceValues[piece.type] || 0;
        if (piece.color === playerColor) {
            score += value;
        } else {
            score -= value;
        }
    });
    
    // Rhombus advancement toward opponent base
    const rhombusPos = Object.keys(board).find(pos => 
        board[pos]?.type === 'rhombus' && board[pos]?.color === playerColor
    );
    
    if (rhombusPos) {
        const [row, col] = rhombusPos.split('-').map(Number);
        if (playerColor === 'white') {
            score += (col - 0) * 5; // Distance from column 0 to 8
        } else {
            score += (8 - col) * 5; // Distance from column 8 to 0
        }
    }
    
    return score;
}

/**
 * Generate all legal moves for current player
 */
function generateAllMoves(board, playerColor) {
    const allMoves = [];
    
    Object.keys(board).forEach(pos => {
        const piece = board[pos];
        if (piece && piece.color === playerColor) {
            const moves = getLegalMoves(board, pos, playerColor);
            allMoves.push(...moves);
        }
    });
    
    return allMoves;
}

/**
 * Find best move using minimax with alpha-beta pruning (simplified)
 */
function findBestMove(board, playerColor, depth = 2) {
    const moves = generateAllMoves(board, playerColor);
    
    if (moves.length === 0) {
        return { bestMove: null, evaluation: 0, candidateMoves: [] };
    }
    
    // Evaluate each move
    const evaluatedMoves = moves.map(move => {
        const newBoard = applyMove(board, move);
        const evaluation = evaluatePosition(newBoard, playerColor);
        
        return {
            ...move,
            evaluation,
            notation: `${move.from}→${move.to}${move.isCapture ? ' C' : ''}`
        };
    });
    
    // Sort by evaluation
    evaluatedMoves.sort((a, b) => b.evaluation - a.evaluation);
    
    return {
        bestMove: evaluatedMoves[0],
        evaluation: evaluatedMoves[0].evaluation,
        candidateMoves: evaluatedMoves.slice(0, 5)
    };
}

module.exports = {
    initializeRealBoard,
    getLegalMoves,
    applyMove,
    isGameOver,
    evaluatePosition,
    findBestMove,
    generateAllMoves
};

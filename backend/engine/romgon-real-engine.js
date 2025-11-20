// ============================================
// ROMGON REAL GAME ENGINE
// Exact Romgon rules with hardcoded patterns
// ============================================

const hardcodedPatterns = require('./romgon-patterns');

/**
 * FLIP MODE: Adjacency map for omnidirectional attacks when flipped
 * Returns all 6 adjacent hexes for any position
 */
const ADJACENCY_MAP = {
    // Row 0
    '0-0': ['1-0','1-1','0-1'],
    '0-1': ['0-0','1-2','1-1','0-2'],
    '0-2': ['0-1','1-2','1-3','0-3'],
    '0-3': ['0-2','1-3','1-4','0-4'],
    '0-4': ['0-3','1-4','1-5','0-5'],
    '0-5': ['1-6','1-5','0-4'],
    // Row 1
    '1-0': ['2-0','2-1','1-1','0-0'],
    '1-1': ['1-0','0-0','0-1','1-2','2-2','2-1'],
    '1-2': ['1-1','0-1','0-2','1-3','2-3','2-2'],
    '1-3': ['1-2','0-2','0-3','1-4','2-4','2-3'],
    '1-4': ['1-3','0-3','0-4','1-5','2-5','2-4'],
    '1-5': ['1-4','0-4','0-5','1-6','2-6','2-5'],
    '1-6': ['1-5','0-5','2-7','2-6'],
    // Row 2
    '2-0': ['3-0','3-1','2-1','1-0'],
    '2-1': ['2-0','1-0','1-1','2-2','3-2','3-1'],
    '2-2': ['2-1','1-1','1-2','2-3','3-3','3-2'],
    '2-3': ['2-2','1-2','1-3','2-4','3-4','3-3'],
    '2-4': ['2-3','1-3','1-4','2-5','3-5','3-4'],
    '2-5': ['2-4','1-4','1-5','2-6','3-6','3-5'],
    '2-6': ['2-5','1-5','1-6','2-7','3-7','3-6'],
    '2-7': ['2-6','1-6','3-8','3-7'],
    // Row 3 (center row - 9 hexes)
    '3-0': ['4-0','4-1','3-1','2-0'],
    '3-1': ['3-0','2-0','2-1','3-2','4-2','4-1'],
    '3-2': ['3-1','2-1','2-2','3-3','4-3','4-2'],
    '3-3': ['3-2','2-2','2-3','3-4','4-3','4-4'], // Dead zone
    '3-4': ['3-3','2-3','2-4','3-5','4-4','4-5'], // Dead zone
    '3-5': ['3-4','2-4','2-5','3-6','4-5','4-6'], // Dead zone
    '3-6': ['3-5','2-5','2-6','3-7','4-6','4-7'],
    '3-7': ['3-6','2-6','2-7','3-8','4-7','4-8'],
    '3-8': ['3-7','2-7','5-0','4-8'],
    // Row 4
    '4-0': ['5-0','5-1','4-1','3-0'],
    '4-1': ['4-0','3-0','3-1','4-2','5-2','5-1'],
    '4-2': ['4-1','3-1','3-2','4-3','5-3','5-2'],
    '4-3': ['4-2','3-2','3-3','4-4','5-4','5-3'],
    '4-4': ['4-3','3-3','3-4','4-5','5-5','5-4'],
    '4-5': ['4-4','3-4','3-5','4-6','5-6','5-5'],
    '4-6': ['4-5','3-5','3-6','4-7','5-7','5-6'],
    '4-7': ['4-6','3-6','3-7','4-8','5-8','5-7'],
    '4-8': ['4-7','3-7','3-8','6-0','5-8'],
    // Row 5
    '5-0': ['6-0','6-1','5-1','4-0','3-8'],
    '5-1': ['5-0','4-0','4-1','5-2','6-2','6-1'],
    '5-2': ['5-1','4-1','4-2','5-3','6-3','6-2'],
    '5-3': ['5-2','4-2','4-3','5-4','6-4','6-3'],
    '5-4': ['5-3','4-3','4-4','5-5','6-5','6-4'],
    '5-5': ['5-4','4-4','4-5','5-6','6-6','6-5'],
    '5-6': ['5-5','4-5','4-6','5-7','6-7','6-6'],
    '5-7': ['5-6','4-6','4-7','5-8','6-8','6-7'],
    '5-8': ['5-7','4-7','4-8','6-8'],
    // Row 6
    '6-0': ['6-1','5-0','4-8'],
    '6-1': ['6-0','5-0','5-1','6-2'],
    '6-2': ['6-1','5-1','5-2','6-3'],
    '6-3': ['6-2','5-2','5-3','6-4'],
    '6-4': ['6-3','5-3','5-4','6-5'],
    '6-5': ['6-4','5-4','5-5','6-6'],
    '6-6': ['6-5','5-5','5-6','6-7'],
    '6-7': ['6-6','5-6','5-7','6-8'],
    '6-8': ['6-7','5-7','5-8']
};

// Dead zone positions (fortress in flip mode)
const DEAD_ZONE = new Set(['3-3', '3-4', '3-5']);

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
 * Supports flip mode with omnidirectional attacks
 */
function getLegalMoves(board, fromPos, playerColor, flipModeEnabled = false) {
    const piece = board[fromPos];
    if (!piece || piece.color !== playerColor) return [];

    const [row, col] = fromPos.split('-').map(Number);
    let targets = [];

    // FLIP MODE: Flipped pieces use omnidirectional 6-hex adjacency
    if (flipModeEnabled && piece.flipped) {
        const adjacent = ADJACENCY_MAP[fromPos] || [];
        targets = adjacent.map(pos => {
            const [r, c] = pos.split('-').map(Number);
            return [r, c];
        });
    } else {
        // NORMAL MODE: Use piece-specific movement patterns
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
            // FLIP MODE: Flip state matching - can only attack if flip states match
            if (flipModeEnabled) {
                const attackerFlipped = piece.flipped || false;
                const targetFlipped = targetPiece.flipped || false;
                if (attackerFlipped !== targetFlipped) {
                    return; // Cannot attack - flip state mismatch
                }
            }

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
 * Handles both movement and flip actions
 */
function applyMove(board, move) {
    const newBoard = JSON.parse(JSON.stringify(board)); // Deep clone
    
    const piece = newBoard[move.from];
    if (!piece) return newBoard;
    
    // Handle flip action (from === to)
    if (move.isFlip) {
        piece.flipped = !piece.flipped;
        return newBoard;
    }
    
    // Handle normal movement
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
 * Evaluate board position with flip mode awareness
 */
function evaluatePosition(board, playerColor, flipModeEnabled = false) {
    let score = 0;

    // Piece values
    const pieceValues = {
        'rhombus': 1000,
        'triangle': 6,
        'hexgon': 5,
        'circle': 4,
        'square': 3
    };

    // Count pieces by color and flip state
    const playerPieces = [];
    const opponentPieces = [];
    const opponentColor = playerColor === 'white' ? 'black' : 'white';

    Object.entries(board).forEach(([pos, piece]) => {
        if (piece.color === playerColor) {
            playerPieces.push({ pos, ...piece });
        } else {
            opponentPieces.push({ pos, ...piece });
        }
    });

    // 1. MATERIAL EVALUATION
    playerPieces.forEach(piece => {
        score += pieceValues[piece.type] || 0;
    });
    opponentPieces.forEach(piece => {
        score -= pieceValues[piece.type] || 0;
    });

    // 2. RHOMBUS ADVANCEMENT (toward opponent base)
    const playerRhombus = playerPieces.find(p => p.type === 'rhombus');
    if (playerRhombus) {
        const [row, col] = playerRhombus.pos.split('-').map(Number);
        if (playerColor === 'white') {
            score += (col - 0) * 5; // White advances toward column 8
        } else {
            score += (8 - col) * 5; // Black advances toward column 0
        }

        // FLIP MODE: Dead zone fortress bonus for rhombus
        if (flipModeEnabled && DEAD_ZONE.has(playerRhombus.pos) && !playerRhombus.flipped) {
            score += 50; // Can flip to become safe from unflipped attackers
        }
    }

    // 3. FLIP MODE EVALUATIONS
    if (flipModeEnabled) {
        // Count flip states for coordination
        const playerFlipped = playerPieces.filter(p => p.flipped).length;
        const playerUnflipped = playerPieces.length - playerFlipped;

        // Mobility bonus for flipped pieces (omnidirectional attack)
        playerPieces.forEach(piece => {
            if (piece.flipped) {
                score += 10; // Flipped pieces have 6-direction attack vs directional
            }
        });

        // Dead zone control (fortress positions)
        playerPieces.forEach(piece => {
            if (DEAD_ZONE.has(piece.pos)) {
                if (piece.type === 'circle' || piece.type === 'rhombus') {
                    if (!piece.flipped) {
                        score += 30; // Strong defensive position, can flip to safety
                    } else {
                        score += 15; // Already flipped in fortress
                    }
                }
            }
        });

        // Flip state coordination penalty (isolated flip states are vulnerable)
        if (playerFlipped > 0 && playerFlipped < playerPieces.length) {
            const minGroup = Math.min(playerFlipped, playerUnflipped);
            const maxGroup = Math.max(playerFlipped, playerUnflipped);
            if (minGroup === 1 && maxGroup > 3) {
                score -= 20; // Isolated piece in wrong flip state
            }
        }
    }

    // 4. PIECE MOBILITY (tactical advantage)
    let playerMobility = 0;
    let opponentMobility = 0;

    playerPieces.forEach(piece => {
        const moves = getLegalMoves(board, piece.pos, playerColor, flipModeEnabled);
        playerMobility += moves.length;
    });

    opponentPieces.forEach(piece => {
        const moves = getLegalMoves(board, piece.pos, opponentColor, flipModeEnabled);
        opponentMobility += moves.length;
    });

    score += (playerMobility - opponentMobility) * 2; // Mobility advantage

    // 5. THREAT EVALUATION (pieces under attack)
    let playerThreats = 0;
    let opponentThreats = 0;

    playerPieces.forEach(targetPiece => {
        opponentPieces.forEach(attackerPiece => {
            if (canAttack(board, attackerPiece.pos, targetPiece.pos, opponentColor, flipModeEnabled)) {
                playerThreats += pieceValues[targetPiece.type] * 0.5; // Half value for threatened piece
            }
        });
    });

    opponentPieces.forEach(targetPiece => {
        playerPieces.forEach(attackerPiece => {
            if (canAttack(board, attackerPiece.pos, targetPiece.pos, playerColor, flipModeEnabled)) {
                opponentThreats += pieceValues[targetPiece.type] * 0.5;
            }
        });
    });

    score -= playerThreats;
    score += opponentThreats;

    // 6. CENTER CONTROL (control of key hexes)
    const centerHexes = ['3-3', '3-4', '3-5', '3-6']; // Center row
    let centerControl = 0;

    centerHexes.forEach(hex => {
        const piece = board[hex];
        if (piece) {
            if (piece.color === playerColor) {
                centerControl += 3;
            } else {
                centerControl -= 3;
            }
        }
    });

    score += centerControl;

    return score;
}

/**
 * Helper: Check if piece at attackerPos can attack targetPos
 */
function canAttack(board, attackerPos, targetPos, attackerColor, flipModeEnabled = false) {
    const moves = getLegalMoves(board, attackerPos, attackerColor, flipModeEnabled);
    return moves.some(move => move.to === targetPos && move.isCapture);
}

/**
 * Check if flipping a piece would be legal (not under threat)
 * Returns true if flip is safe
 */
function canFlipSafely(board, pos, playerColor, flipModeEnabled) {
    if (!flipModeEnabled) return false;
    
    const piece = board[pos];
    if (!piece || piece.color !== playerColor) return false;
    
    // Only certain pieces can flip (not rhombus in danger)
    const willBeFlipped = !piece.flipped;
    const opponentColor = playerColor === 'white' ? 'black' : 'white';
    
    // Check if any opponent piece can attack this position after flip
    const [row, col] = pos.split('-').map(Number);
    
    for (const oppPos in board) {
        const oppPiece = board[oppPos];
        if (oppPiece && oppPiece.color === opponentColor) {
            // Check if opponent has matching flip state after our flip
            if (oppPiece.flipped === willBeFlipped) {
                // Create temporary board with flipped piece
                const testBoard = JSON.parse(JSON.stringify(board));
                testBoard[pos].flipped = willBeFlipped;
                
                // Check if opponent can attack
                const oppMoves = getLegalMoves(testBoard, oppPos, opponentColor, flipModeEnabled);
                if (oppMoves.some(m => m.to === pos && m.isCapture)) {
                    // SPECIAL: Rhombus cannot flip into danger
                    if (piece.type === 'rhombus') {
                        return false;
                    }
                }
            }
        }
    }
    
    return true;
}

/**
 * Generate all legal moves for current player
 * Includes both movement and flip actions
 */
function generateAllMoves(board, playerColor, flipModeEnabled = false) {
    const allMoves = [];

    Object.keys(board).forEach(pos => {
        const piece = board[pos];
        if (piece && piece.color === playerColor) {
            // Add movement moves
            const moves = getLegalMoves(board, pos, playerColor, flipModeEnabled);
            allMoves.push(...moves);
            
            // Add flip moves (if flip mode enabled)
            if (flipModeEnabled) {
                const canFlip = canFlipSafely(board, pos, playerColor, flipModeEnabled);
                if (canFlip) {
                    allMoves.push({
                        from: pos,
                        to: pos, // Flip in place
                        isCapture: false,
                        isFlip: true // Mark as flip action
                    });
                }
            }
        }
    });

    return allMoves;
}

/**
 * Find best move using minimax with alpha-beta pruning (simplified)
 */
function findBestMove(board, playerColor, depth = 2, flipModeEnabled = false) {
    const moves = generateAllMoves(board, playerColor, flipModeEnabled);

    if (moves.length === 0) {
        return { bestMove: null, evaluation: 0, candidateMoves: [] };
    }

    // Evaluate each move
    const evaluatedMoves = moves.map(move => {
        const newBoard = applyMove(board, move);
        const evaluation = evaluatePosition(newBoard, playerColor, flipModeEnabled);

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

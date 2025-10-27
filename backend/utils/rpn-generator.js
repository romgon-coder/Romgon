// ============================================
// ROMGON PORTABLE NOTATION (RPN) GENERATOR
// ============================================

/**
 * Generate RPN notation from move history
 * Format: piece_from-to piece_from-to ...
 * Example: "S0-0>1-1 t5-6>5-5 R3-0>3-2 c4-7>4-6"
 */

/**
 * Get piece letter for RPN notation
 * White = uppercase, Black = lowercase
 */
function getPieceLetter(piece) {
    if (!piece) return '';
    
    const letters = {
        'square': 'S',
        'triangle': 'T',
        'rhombus': 'R',
        'circle': 'C',
        'hexagon': 'H'
    };
    
    const letter = letters[piece.type] || '';
    return piece.color === 'white' ? letter : letter.toLowerCase();
}

/**
 * Convert a single move to RPN notation
 * @param {Object} move - Move object with from, to, piece
 * @returns {string} RPN notation like "S0-0>1-1"
 */
function moveToRPN(move) {
    if (!move || !move.from || !move.to || !move.piece) {
        return '';
    }
    
    const pieceLetter = getPieceLetter(move.piece);
    return `${pieceLetter}${move.from}>${move.to}`;
}

/**
 * Convert move history array to RPN string
 * @param {Array} moveHistory - Array of move objects
 * @returns {string} Complete RPN notation
 */
function generateRPN(moveHistory) {
    if (!Array.isArray(moveHistory) || moveHistory.length === 0) {
        return '';
    }
    
    return moveHistory
        .map(move => moveToRPN(move))
        .filter(rpn => rpn.length > 0)
        .join(' ');
}

/**
 * Generate full game RPN with metadata
 * Format: "move1 move2 move3 | metadata"
 */
function generateGameRPN(gameData) {
    const { moveHistory, result, whiteAI, blackAI, startTime, endTime, moveNumber } = gameData;
    
    const moves = generateRPN(moveHistory);
    
    // Add metadata
    const metadata = {
        result: result || 'unfinished',
        moves: moveNumber || moveHistory.length,
        whiteAI: `Level${whiteAI?.level || 5}`,
        blackAI: `Level${blackAI?.level || 5}`,
        date: startTime ? new Date(startTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        duration: endTime && startTime ? 
            Math.round((new Date(endTime) - new Date(startTime)) / 1000) + 's' : 
            'ongoing'
    };
    
    const metaString = `${metadata.result}|${metadata.moves}m|${metadata.whiteAI}v${metadata.blackAI}|${metadata.date}|${metadata.duration}`;
    
    return `${moves} // ${metaString}`;
}

/**
 * Parse RPN notation back to move array
 * @param {string} rpnString - RPN notation
 * @returns {Array} Array of move objects
 */
function parseRPN(rpnString) {
    if (!rpnString || typeof rpnString !== 'string') {
        return [];
    }
    
    // Remove metadata if present
    const movesOnly = rpnString.split('//')[0].trim();
    
    const moves = movesOnly.split(/\s+/).filter(m => m.length > 0);
    
    return moves.map(moveStr => {
        const match = moveStr.match(/^([STRCHstrch])(\d-\d)>(\d-\d)$/);
        if (!match) return null;
        
        const [, pieceLetter, from, to] = match;
        const isWhite = pieceLetter === pieceLetter.toUpperCase();
        
        const pieceTypes = {
            'S': 'square', 's': 'square',
            'T': 'triangle', 't': 'triangle',
            'R': 'rhombus', 'r': 'rhombus',
            'C': 'circle', 'c': 'circle',
            'H': 'hexagon', 'h': 'hexagon'
        };
        
        return {
            from,
            to,
            piece: {
                type: pieceTypes[pieceLetter],
                color: isWhite ? 'white' : 'black'
            },
            notation: moveStr
        };
    }).filter(m => m !== null);
}

/**
 * Get RPN statistics for analysis
 */
function analyzeRPN(rpnString) {
    const moves = parseRPN(rpnString);
    
    const stats = {
        totalMoves: moves.length,
        whiteMoves: moves.filter((_, i) => i % 2 === 0).length,
        blackMoves: moves.filter((_, i) => i % 2 === 1).length,
        pieceActivity: {
            white: { square: 0, triangle: 0, rhombus: 0, circle: 0, hexagon: 0 },
            black: { square: 0, triangle: 0, rhombus: 0, circle: 0, hexagon: 0 }
        }
    };
    
    moves.forEach(move => {
        if (move.piece) {
            stats.pieceActivity[move.piece.color][move.piece.type]++;
        }
    });
    
    return stats;
}

module.exports = {
    generateRPN,
    generateGameRPN,
    parseRPN,
    moveToRPN,
    analyzeRPN,
    getPieceLetter
};

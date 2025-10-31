// ============================================
// ROMGON TABLEBASE GENERATOR
// ============================================
// Generates endgame tablebases using retrograde analysis
// Supports 1v1 and 2v1 endgame positions

const fs = require('fs');

// ============================================
// BOARD DEFINITION (51 hexes)
// ============================================

const ALL_HEXES = [
    // Row 0 (6 hexes)
    '0-0', '0-1', '0-2', '0-3', '0-4', '0-5',
    // Row 1 (7 hexes)
    '1-0', '1-1', '1-2', '1-3', '1-4', '1-5', '1-6',
    // Row 2 (8 hexes)
    '2-0', '2-1', '2-2', '2-3', '2-4', '2-5', '2-6', '2-7',
    // Row 3 (9 hexes) - includes dead zone 3-3, 3-4, 3-5
    '3-0', '3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8',
    // Row 4 (8 hexes)
    '4-0', '4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-7',
    // Row 5 (7 hexes)
    '5-0', '5-1', '5-2', '5-3', '5-4', '5-5', '5-6',
    // Row 6 (6 hexes)
    '6-0', '6-1', '6-2', '6-3', '6-4', '6-5'
];

// Dead zone hexes (bases)
const DEAD_ZONE = new Set(['3-3', '3-4', '3-5']);

// Base hexes for each color
const WHITE_BASE = '3-3';
const BLACK_BASE = '3-5';

// ============================================
// NEIGHBOR CALCULATION
// ============================================

function getNeighbors(hexId) {
    const [row, col] = hexId.split('-').map(Number);
    const neighbors = [];
    
    // Even rows (0, 2, 4, 6) have different offset patterns than odd rows (1, 3, 5)
    const isEvenRow = row % 2 === 0;
    
    const offsets = isEvenRow 
        ? [[1, 0], [1, 1], [0, 1], [-1, 0], [-1, 1], [0, -1]]  // even row
        : [[1, -1], [1, 0], [0, 1], [-1, -1], [-1, 0], [0, -1]]; // odd row
    
    for (const [rowOff, colOff] of offsets) {
        const newRow = row + rowOff;
        const newCol = col + colOff;
        const neighborId = `${newRow}-${newCol}`;
        
        // Check if neighbor exists in ALL_HEXES
        if (ALL_HEXES.includes(neighborId)) {
            neighbors.push(neighborId);
        }
    }
    
    return neighbors;
}

// ============================================
// MOVEMENT RULES
// ============================================

/**
 * Get all legal moves for a piece
 * @param {string} pieceType - 'square', 'triangle', 'rhombus', 'circle', 'hexagon'
 * @param {string} color - 'white' or 'black'
 * @param {string} position - hex coordinate like '0-0'
 * @param {Object} boardState - { white: [{type, pos}], black: [{type, pos}] }
 * @returns {Array} Array of target hex IDs
 */
function getLegalMoves(pieceType, color, position, boardState) {
    const occupied = getAllOccupiedHexes(boardState);
    const friendly = boardState[color].map(p => p.pos);
    const enemy = boardState[color === 'white' ? 'black' : 'white'].map(p => p.pos);
    
    switch (pieceType) {
        case 'square':
            return getSquareMoves(position, friendly, enemy, occupied);
        case 'triangle':
            return getTriangleMoves(position, friendly, enemy, occupied);
        case 'rhombus':
            return getRhombusMoves(position, friendly, enemy, occupied);
        case 'circle':
            return getCircleMoves(position, friendly, enemy, occupied);
        case 'hexagon':
            return getHexagonMoves(position, friendly, enemy, occupied);
        default:
            return [];
    }
}

function getAllOccupiedHexes(boardState) {
    const occupied = new Set();
    boardState.white.forEach(p => occupied.add(p.pos));
    boardState.black.forEach(p => occupied.add(p.pos));
    return occupied;
}

// Square: moves to 4 adjacent hexes (diagonal cross pattern)
function getSquareMoves(position, friendly, enemy, occupied) {
    const [row, col] = position.split('-').map(Number);
    const moves = [];
    
    // Get cross pattern neighbors (implementation depends on row)
    const neighbors = getCrossNeighbors(row, col);
    
    for (const neighbor of neighbors) {
        if (friendly.includes(neighbor)) continue; // Can't move to friendly piece
        if (ALL_HEXES.includes(neighbor)) {
            moves.push(neighbor);
        }
    }
    
    return moves;
}

// Get diagonal cross neighbors for squares
function getCrossNeighbors(row, col) {
    const isEvenRow = row % 2 === 0;
    let offsets;
    
    if (row === 0 || row === 6) {
        offsets = isEvenRow ? [[1, 0], [1, 1], [-1, 1], [-1, 0]] : [[1, -1], [1, 0], [-1, 0], [-1, -1]];
    } else if (row === 1 || row === 5) {
        offsets = [[1, 0], [1, 1], [-1, -1], [-1, 0]];
    } else if (row === 2 || row === 4) {
        offsets = [[1, 0], [1, 1], [-1, -1], [-1, 0]];
    } else { // row 3
        offsets = [[1, -1], [1, 0], [-1, 0], [-1, -1]];
    }
    
    return offsets.map(([r, c]) => `${row + r}-${col + c}`).filter(hex => ALL_HEXES.includes(hex));
}

// Triangle: moves to up to 2 adjacent hexes based on rotation (simplified - assume default rotation)
function getTriangleMoves(position, friendly, enemy, occupied) {
    const neighbors = getNeighbors(position);
    const moves = [];
    
    // Simplified: triangle can move to any 2 adjacent hexes (would need rotation state in full implementation)
    for (const neighbor of neighbors.slice(0, 2)) {
        if (!friendly.includes(neighbor) && ALL_HEXES.includes(neighbor)) {
            moves.push(neighbor);
        }
    }
    
    return moves;
}

// Rhombus: moves in rhombus pattern, has diagonal moves between dead zone and inner perimeter
function getRhombusMoves(position, friendly, enemy, occupied) {
    const [row, col] = position.split('-').map(Number);
    const moves = [];
    
    // Rhombus moves in a diamond pattern (2 hexes away in cardinal directions)
    const neighbors = getNeighbors(position);
    
    // For simplified tablebase, treat rhombus like square but with special diagonal rule
    for (const neighbor of neighbors) {
        if (!friendly.includes(neighbor) && ALL_HEXES.includes(neighbor)) {
            // Rhombus cannot capture on diagonal moves
            const isDiagonal = isDiagonalMove(position, neighbor);
            if (isDiagonal && enemy.includes(neighbor)) {
                continue; // Skip diagonal captures
            }
            moves.push(neighbor);
        }
    }
    
    return moves;
}

function isDiagonalMove(from, to) {
    const deadZone = new Set(['3-3', '3-4', '3-5']);
    const innerPerimeter = new Set(['4-2', '4-3', '4-4', '4-5', '2-2', '2-3', '2-4', '2-5']);
    
    return (deadZone.has(from) && innerPerimeter.has(to)) || 
           (innerPerimeter.has(from) && deadZone.has(to));
}

// Circle: moves along zone perimeters (simplified for tablebase)
function getCircleMoves(position, friendly, enemy, occupied) {
    // Simplified: circle can move to multiple hexes along its zone
    const neighbors = getNeighbors(position);
    const moves = [];
    
    for (const neighbor of neighbors) {
        if (!friendly.includes(neighbor) && ALL_HEXES.includes(neighbor) && !DEAD_ZONE.has(neighbor)) {
            moves.push(neighbor);
        }
    }
    
    return moves;
}

// Hexagon: moves to any adjacent hex (6 directions)
function getHexagonMoves(position, friendly, enemy, occupied) {
    const neighbors = getNeighbors(position);
    const moves = [];
    
    for (const neighbor of neighbors) {
        if (!friendly.includes(neighbor) && ALL_HEXES.includes(neighbor)) {
            moves.push(neighbor);
        }
    }
    
    return moves;
}

// ============================================
// WIN/LOSS DETECTION
// ============================================

function isTerminalPosition(boardState) {
    // Win condition: opponent's base is not defended
    const whiteDefendsBase = boardState.white.some(p => {
        const neighbors = getNeighbors(p.pos);
        return neighbors.includes(WHITE_BASE);
    });
    
    const blackDefendsBase = boardState.black.some(p => {
        const neighbors = getNeighbors(p.pos);
        return neighbors.includes(BLACK_BASE);
    });
    
    if (!whiteDefendsBase) {
        return { terminal: true, winner: 'black' };
    }
    if (!blackDefendsBase) {
        return { terminal: true, winner: 'white' };
    }
    
    // Check if all pieces of one type are eliminated (shape elimination win)
    // For simplified 1v1, this doesn't apply
    
    return { terminal: false, winner: null };
}

// ============================================
// POSITION ENCODING
// ============================================

function encodePosition(boardState, turn) {
    // Sort pieces for canonical representation
    const whitePieces = boardState.white.map(p => `${p.type[0].toUpperCase()}${p.pos}`).sort().join(',');
    const blackPieces = boardState.black.map(p => `${p.type[0].toLowerCase()}${p.pos}`).sort().join(',');
    
    return `${whitePieces}|${blackPieces}|${turn}`;
}

function decodePosition(encoded) {
    const [white, black, turn] = encoded.split('|');
    
    const parsePieces = (str, color) => {
        if (!str) return [];
        return str.split(',').map(p => {
            const type = p[0].toLowerCase();
            const pos = p.slice(1);
            const typeMap = { s: 'square', t: 'triangle', r: 'rhombus', c: 'circle', h: 'hexagon' };
            return { type: typeMap[type], pos, color };
        });
    };
    
    return {
        white: parsePieces(white, 'white'),
        black: parsePieces(black, 'black'),
        turn
    };
}

// ============================================
// RETROGRADE ANALYSIS
// ============================================

function generateAllPositions(pieceConfig) {
    console.log(`\nGenerating all positions for: ${JSON.stringify(pieceConfig)}`);
    
    const positions = [];
    const whitePieces = pieceConfig.white;
    const blackPieces = pieceConfig.black;
    
    // Generate all combinations of piece placements
    function* generatePlacements(pieces, color, usedHexes = new Set()) {
        if (pieces.length === 0) {
            yield [];
            return;
        }
        
        const [pieceType, ...restPieces] = pieces;
        
        for (const hex of ALL_HEXES) {
            if (usedHexes.has(hex)) continue;
            
            const newUsedHexes = new Set(usedHexes);
            newUsedHexes.add(hex);
            
            for (const restPlacement of generatePlacements(restPieces, color, newUsedHexes)) {
                yield [{ type: pieceType, pos: hex, color }, ...restPlacement];
            }
        }
    }
    
    // Generate white piece placements
    for (const whitePlacement of generatePlacements(whitePieces, 'white')) {
        const usedByWhite = new Set(whitePlacement.map(p => p.pos));
        
        // Generate black piece placements (avoiding white pieces)
        for (const blackPlacement of generatePlacements(blackPieces, 'black', usedByWhite)) {
            const boardState = {
                white: whitePlacement,
                black: blackPlacement
            };
            
            // Generate positions for both turns
            positions.push(encodePosition(boardState, 'white'));
            positions.push(encodePosition(boardState, 'black'));
        }
    }
    
    console.log(`Generated ${positions.length} total positions`);
    return positions;
}

function runRetrogradeAnalysis(positions) {
    console.log(`\nStarting retrograde analysis on ${positions.length} positions...`);
    
    const tablebase = {};
    
    // Step 1: Mark all positions as UNKNOWN
    for (const pos of positions) {
        tablebase[pos] = { result: 'UNKNOWN', dtm: null, bestMove: null };
    }
    
    // Step 2: Mark terminal positions
    let terminalCount = 0;
    for (const pos of positions) {
        const boardState = decodePosition(pos);
        const terminal = isTerminalPosition(boardState);
        
        if (terminal.terminal) {
            const turn = pos.split('|')[2];
            const result = terminal.winner === turn ? 'WIN' : 'LOSS';
            tablebase[pos] = { result, dtm: 0, bestMove: null };
            terminalCount++;
        }
    }
    
    console.log(`Marked ${terminalCount} terminal positions`);
    
    // Step 3: Retrograde analysis loop
    let depth = 1;
    let changed = true;
    let iterations = 0;
    const MAX_ITERATIONS = 100; // Safety limit
    
    while (changed && iterations < MAX_ITERATIONS) {
        changed = false;
        iterations++;
        let changedThisIteration = 0;
        
        for (const pos of positions) {
            if (tablebase[pos].result !== 'UNKNOWN') continue;
            
            const boardState = decodePosition(pos);
            const turn = pos.split('|')[2];
            const movingColor = turn;
            const pieces = boardState[movingColor];
            
            // Generate all legal moves from this position
            let hasWinningMove = false;
            let allMovesLose = true;
            let bestMoveFound = null;
            
            for (const piece of pieces) {
                const moves = getLegalMoves(piece.type, movingColor, piece.pos, boardState);
                
                for (const targetHex of moves) {
                    // Apply move and get resulting position
                    const newBoardState = applyMove(boardState, piece, targetHex);
                    const newPos = encodePosition(newBoardState, turn === 'white' ? 'black' : 'white');
                    
                    const nextResult = tablebase[newPos];
                    
                    if (nextResult && nextResult.result === 'LOSS') {
                        // Opponent loses = we win!
                        hasWinningMove = true;
                        bestMoveFound = `${piece.type[0]}${piece.pos}>${targetHex}`;
                        break;
                    }
                    
                    if (nextResult && nextResult.result !== 'WIN') {
                        allMovesLose = false;
                    }
                }
                
                if (hasWinningMove) break;
            }
            
            if (hasWinningMove) {
                tablebase[pos] = { result: 'WIN', dtm: depth, bestMove: bestMoveFound };
                changed = true;
                changedThisIteration++;
            } else if (allMovesLose) {
                tablebase[pos] = { result: 'LOSS', dtm: depth, bestMove: null };
                changed = true;
                changedThisIteration++;
            }
        }
        
        console.log(`Depth ${depth}: ${changedThisIteration} positions solved`);
        depth++;
    }
    
    // Mark remaining positions as DRAW
    let drawCount = 0;
    for (const pos of positions) {
        if (tablebase[pos].result === 'UNKNOWN') {
            tablebase[pos] = { result: 'DRAW', dtm: null, bestMove: null };
            drawCount++;
        }
    }
    
    console.log(`\nRetrograde analysis complete!`);
    console.log(`Iterations: ${iterations}, Max depth: ${depth - 1}`);
    console.log(`Draws: ${drawCount}`);
    
    return tablebase;
}

function applyMove(boardState, piece, targetHex) {
    const newState = JSON.parse(JSON.stringify(boardState)); // Deep clone
    
    // Remove captured piece if any
    newState.white = newState.white.filter(p => p.pos !== targetHex);
    newState.black = newState.black.filter(p => p.pos !== targetHex);
    
    // Move the piece
    const colorPieces = newState[piece.color];
    const pieceIndex = colorPieces.findIndex(p => p.pos === piece.pos && p.type === piece.type);
    if (pieceIndex !== -1) {
        colorPieces[pieceIndex].pos = targetHex;
    }
    
    return newState;
}

// ============================================
// STATISTICS
// ============================================

function analyzeTablebase(tablebase) {
    const stats = {
        total: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        maxDepth: 0
    };
    
    for (const pos in tablebase) {
        stats.total++;
        const entry = tablebase[pos];
        
        if (entry.result === 'WIN') stats.wins++;
        if (entry.result === 'LOSS') stats.losses++;
        if (entry.result === 'DRAW') stats.draws++;
        if (entry.dtm && entry.dtm > stats.maxDepth) stats.maxDepth = entry.dtm;
    }
    
    return stats;
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

function generateTablebase(pieceConfig, outputFile) {
    console.log('============================================');
    console.log('ROMGON TABLEBASE GENERATOR');
    console.log('============================================');
    
    const startTime = Date.now();
    
    // Generate all positions
    const positions = generateAllPositions(pieceConfig);
    
    // Run retrograde analysis
    const tablebase = runRetrogradeAnalysis(positions);
    
    // Analyze results
    const stats = analyzeTablebase(tablebase);
    
    console.log('\n============================================');
    console.log('TABLEBASE STATISTICS');
    console.log('============================================');
    console.log(`Total positions: ${stats.total}`);
    console.log(`Wins: ${stats.wins} (${(stats.wins / stats.total * 100).toFixed(1)}%)`);
    console.log(`Losses: ${stats.losses} (${(stats.losses / stats.total * 100).toFixed(1)}%)`);
    console.log(`Draws: ${stats.draws} (${(stats.draws / stats.total * 100).toFixed(1)}%)`);
    console.log(`Max depth to mate: ${stats.maxDepth}`);
    
    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\nGeneration time: ${elapsedTime}s`);
    
    // Save to file
    const output = {
        metadata: {
            generated: new Date().toISOString(),
            config: pieceConfig,
            stats,
            generationTime: elapsedTime
        },
        tablebase
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`\nTablebase saved to: ${outputFile}`);
    console.log(`File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
    
    return tablebase;
}

// ============================================
// CLI INTERFACE
// ============================================

if (require.main === module) {
    // Default: Generate Square vs Square (1v1)
    const config = {
        white: ['square'],
        black: ['square']
    };
    
    const outputFile = 'tablebases/square_vs_square.json';
    
    // Create tablebases directory if it doesn't exist
    if (!fs.existsSync('tablebases')) {
        fs.mkdirSync('tablebases');
    }
    
    generateTablebase(config, outputFile);
}

module.exports = {
    generateTablebase,
    encodePosition,
    decodePosition,
    getLegalMoves,
    isTerminalPosition
};

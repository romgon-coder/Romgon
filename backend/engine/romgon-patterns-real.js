// ============================================
// REAL ROMGON MOVEMENT PATTERNS
// Extracted from working game (deploy/index.html)
// Position-dependent patterns for hexagonal board
// ============================================

/**
 * SQUARE MOVEMENT PATTERNS
 * L-shaped knight-like moves
 * Different patterns for each row due to hexagon geometry
 */
const SQUARE_PATTERNS = {
    // Row 0 (even, shift-down)
    0: [[1, 0], [1, 1], [-1, 1], [-1, 0]],
    
    // Row 1 (odd, no shift)
    1: [[1, 0], [1, 1], [-1, -1], [-1, 0]],
    
    // Row 2 (even, shift-down)
    2: [[1, 0], [1, 1], [-1, -1], [-1, 0]],
    
    // Row 3 (odd, no shift - center row)
    3: [[1, -1], [1, 0], [-1, 0], [-1, -1]],
    
    // Row 4 (even, shift-down)
    4: [[-1, 0], [-1, 1], [1, -1], [1, 0]],
    
    // Row 5 (odd, no shift)
    5: [[1, -1], [1, 0], [-1, 0], [-1, 1]],
    
    // Row 6 (even, shift-down)
    6: [[1, 0], [1, 1], [-1, 1], [-1, 0]]
};

/**
 * TRIANGLE MOVEMENT PATTERNS  
 * Position-dependent patterns from actual game
 * Triangles have massive pattern lookup tables (see index.html lines 13976+)
 */
const TRIANGLE_BASE_PATTERNS = {
    // Sample patterns - full list is 60+ positions
    '0-0': [[1, 0], [0, 1]],
    '1-0': [[1, 0], [0, 1], [-1, 0]],
    '2-0': [[1, 0], [0, 1], [-1, 0], [-1, 1]],
    '3-0': [[1, 0], [0, 1], [-1, 0], [-1, 1]],
    // ... hundreds more patterns per position
};

/**
 * RHOMBUS MOVEMENT
 * Diagonal moves - works across zones
 * Special rules:
 * - Cannot capture other rhombuses
 * - Diagonal leap ability from dead zone
 * - Win condition: reach opponent's base
 */
function getRhombusMoves(row, col) {
    const isEvenRow = row % 2 === 0;
    
    // Base diagonal pattern
    let diagonals = isEvenRow 
        ? [[1, 0], [1, -1], [-1, 0], [-1, -1]]
        : [[1, 0], [1, 1], [-1, 0], [-1, 1]];
    
    // Check for diagonal leap ability (from dead zone)
    const deadZone = new Set(["3-3", "3-4", "3-5"]);
    const currentPos = `${row}-${col}`;
    
    if (deadZone.has(currentPos)) {
        // Add extended diagonal leaps
        const leaps = isEvenRow
            ? [[2, 0], [2, -2], [-2, 0], [-2, -2]]
            : [[2, 0], [2, 2], [-2, 0], [-2, 2]];
        diagonals = diagonals.concat(leaps);
    }
    
    return diagonals.map(([dr, dc]) => [row + dr, col + dc]);
}

/**
 * CIRCLE MOVEMENT
 * Zone-based perimeter movement
 * Three zones: Inner, Middle, Outer (Dead zone = no movement)
 * 
 * Rules:
 * - Moves along perimeter clockwise or counter-clockwise
 * - Stops at first friendly or opponent piece
 * - Can attack opponents on same perimeter
 * - Can also move to adjacent inner/outer zones
 */
const CIRCLE_ZONES = {
    dead: new Set(["3-3", "3-4", "3-5"]),
    inner: new Set(["2-2", "2-3", "2-4", "2-5", "2-6", "3-2", "3-6", "4-2", "4-3", "4-4", "4-5", "4-6"]),
    middle: new Set([
        "1-1", "1-2", "1-3", "1-4", "1-5",
        "2-1", "2-7",
        "3-1", "3-7",
        "4-1", "4-7",
        "5-1", "5-2", "5-3", "5-4", "5-5"
    ]),
    outer: new Set([
        "0-0", "0-1", "0-2", "0-3", "0-4", "0-5",
        "1-0", "1-6",
        "2-0", "2-8",
        "3-0", "3-8",
        "4-0", "4-8",
        "5-0", "5-6",
        "6-0", "6-1", "6-2", "6-3", "6-4", "6-5"
    ])
};

/**
 * HEXAGON MOVEMENT
 * All 6 adjacent hexagons
 * Has 6 visual orientations but only 3 unique movement patterns
 * Can rotate after moving
 */
function getHexagonMoves(row, col, rotation) {
    const isEvenRow = row % 2 === 0;
    
    // All 6 adjacent hexagons
    return isEvenRow
        ? [[1, 0], [1, 1], [0, 1], [-1, 0], [-1, 1], [0, -1]]
        : [[1, -1], [1, 0], [0, 1], [-1, -1], [-1, 0], [0, -1]];
}

/**
 * ADJACENCY HELPER
 * Get 6 adjacent hexagons (accounting for even/odd row offset)
 */
function getAdjacentHexagons(row, col) {
    const isEvenRow = row % 2 === 0;
    
    const offsets = isEvenRow
        ? [[1, 0], [1, 1], [0, 1], [-1, 0], [-1, 1], [0, -1]]  // shift-down rows
        : [[1, -1], [1, 0], [0, 1], [-1, -1], [-1, 0], [0, -1]]; // normal rows
    
    return offsets.map(([dr, dc]) => [row + dr, col + dc]);
}

module.exports = {
    SQUARE_PATTERNS,
    TRIANGLE_BASE_PATTERNS,
    getRhombusMoves,
    CIRCLE_ZONES,
    getHexagonMoves,
    getAdjacentHexagons
};

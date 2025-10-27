// ============================================
// ROMGON EXACT HARDCODED MOVEMENT PATTERNS
// Extracted from working game - DO NOT MODIFY
// ============================================

/**
 * SQUARE PATTERNS - Position-dependent L-shaped moves
 */
function getSquareTargets(row, col) {
    const targets = [];
    let offsets = [];
    
    if (row === 0) offsets = [[1, 0], [1, 1], [-1, 1], [-1, 0]];
    else if (row === 1) offsets = [[1, 0], [1, 1], [-1, -1], [-1, 0]];
    else if (row === 2) offsets = [[1, 0], [1, 1], [-1, -1], [-1, 0]];
    else if (row === 3) offsets = [[1, -1], [1, 0], [-1, 0], [-1, -1]];
    else if (row === 4) offsets = [[-1, 0], [-1, 1], [1, -1], [1, 0]];
    else if (row === 5) offsets = [[1, 0], [1, 1], [-1, -1], [-1, 0]];
    else if (row === 6) offsets = [[1, 0], [1, 1], [-1, 1], [-1, 0]];
    
    offsets.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        targets.push([newRow, newCol]);
    });
    
    return targets;
}

/**
 * WHITE TRIANGLE PATTERNS - Directional movement
 */
function getWhiteTriangleTargets(row, col) {
    const targets = [];
    let offsets = [];
    
    if (row === 0) offsets = [[1, 1], [-1, 1], [0, 1]];
    else if (row === 1) offsets = [[1, 1], [-1, 0], [0, 1]];
    else if (row === 2) offsets = [[1, 1], [-1, 0], [0, 1]];
    else if (row === 3) offsets = [[1, 0], [0, 1], [-1, 0]];
    else if (row === 4) offsets = [[1, 0], [0, 1], [-1, 1]];
    else if (row === 5) offsets = [[1, 0], [0, 1], [-1, 1]];
    else if (row === 6) offsets = [[1, 1], [-1, 1], [0, 1]];
    
    offsets.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        targets.push([newRow, newCol]);
    });
    
    return targets;
}

/**
 * BLACK TRIANGLE PATTERNS - Opposite direction from white
 */
function getBlackTriangleTargets(row, col) {
    const targets = [];
    let offsets = [];
    
    if (row === 0) offsets = [[1, 0], [-1, 0], [0, -1]];
    else if (row === 1) offsets = [[1, 0], [-1, -1], [0, -1]];
    else if (row === 2) offsets = [[1, 0], [-1, -1], [0, -1]];
    else if (row === 3) offsets = [[1, -1], [0, -1], [-1, -1]];
    else if (row === 4) offsets = [[1, -1], [0, -1], [-1, 0]];
    else if (row === 5) offsets = [[1, -1], [0, -1], [-1, 0]];
    else if (row === 6) offsets = [[1, 0], [-1, 0], [0, -1]];
    
    offsets.forEach(([dr, dc]) => {
        const newRow = row + dr;
        const newCol = col + dc;
        targets.push([newRow, newCol]);
    });
    
    return targets;
}

/**
 * RHOMBUS PATTERNS - Complex diagonal movement with special abilities
 */
function getRhombusTargets(centerRow, centerCol) {
    let targets = [];
    
    if (centerRow === 0) {
        switch (centerCol) {
            case 0: targets = [[2,1],[0,1],[0,2]]; break;
            case 1: targets = [[2,2],[0,2],[0,3],[0,0]]; break;
            case 2: targets = [[2,3],[0,3],[0,4],[0,0],[0,1]]; break;
            case 3: targets = [[2,4],[0,4],[0,5],[0,1],[0,2]]; break;
            case 4: targets = [[2,5],[0,5],[0,3],[0,2]]; break;
            case 5: targets = [[2,6],[0,4],[0,3]]; break;
        }
    } else if (centerRow === 1) {
        switch (centerCol) {
            case 0: targets = [[3,1],[1,2],[1,1]]; break;
            case 1: targets = [[3,2],[1,0],[1,2],[1,3]]; break;
            case 2: targets = [[3,3],[1,3],[1,4],[1,1],[1,0]]; break;
            case 3: targets = [[3,4],[1,4],[1,5],[1,2],[1,1]]; break;
            case 4: targets = [[3,5],[1,5],[1,6],[1,3],[1,2]]; break;
            case 5: targets = [[1,4],[1,3],[3,6]]; break;
            case 6: targets = [[3,7],[1,5],[1,4]]; break;
        }
    } else if (centerRow === 2) {
        switch (centerCol) {
            case 0: targets = [[4,0],[2,1],[2,2]]; break;
            case 1: targets = [[4,1],[2,2],[2,3],[0,0]]; break;
            case 2: targets = [[2,1],[2,0],[4,2],[2,3],[2,4],[0,1]]; break;
            case 3: targets = [[2,2],[2,1],[4,3],[2,4],[2,5],[0,2]]; break;
            case 4: targets = [[2,3],[2,2],[4,4],[2,5],[2,6],[0,3]]; break;
            case 5: targets = [[2,4],[2,3],[4,5],[2,6],[2,7],[0,4]]; break;
            case 6: targets = [[2,5],[2,4],[4,6],[2,7],[0,5]]; break;
            case 7: targets = [[2,6],[2,5],[4,7]]; break;
        }
    } else if (centerRow === 3) {
        switch (centerCol) {
            case 0: targets = [[3,2],[3,1]]; break;
            case 1: targets = [[1,0],[5,0],[3,2],[3,3]]; break;
            case 2: targets = [[1,1],[5,1],[3,1],[3,0],[3,3],[3,4]]; break;
            case 3: targets = [[1,2],[5,2],[3,2],[3,1],[3,4],[3,5]]; break;
            case 4: targets = [[1,3],[5,3],[3,3],[3,2],[3,5],[3,6]]; break;
            case 5: targets = [[1,4],[5,4],[3,4],[3,3],[3,6],[3,7]]; break;
            case 6: targets = [[1,5],[5,5],[3,5],[3,4],[3,7],[3,8]]; break;
            case 7: targets = [[1,6],[5,6],[3,6],[3,5],[3,8]]; break;
            case 8: targets = [[3,7],[3,6]]; break;
        }
    } else if (centerRow === 4) {
        switch (centerCol) {
            case 0: targets = [[4,1],[4,2],[2,0]]; break;
            case 1: targets = [[6,0],[2,1],[4,0],[4,2],[4,3]]; break;
            case 2: targets = [[6,1],[2,2],[4,1],[4,0],[4,3],[4,4]]; break;
            case 3: targets = [[6,2],[2,3],[4,2],[4,1],[4,4],[4,5]]; break;
            case 4: targets = [[6,3],[2,4],[4,3],[4,2],[4,5],[4,6]]; break;
            case 5: targets = [[6,4],[2,5],[4,4],[4,3],[4,6],[4,7]]; break;
            case 6: targets = [[6,5],[2,6],[4,5],[4,4],[4,7]]; break;
            case 7: targets = [[4,6],[4,5],[2,7]]; break;
        }
    } else if (centerRow === 5) {
        switch (centerCol) {
            case 0: targets = [[5,1],[5,2],[3,1]]; break;
            case 1: targets = [[3,2],[5,0],[5,2],[5,3]]; break;
            case 2: targets = [[3,3],[5,3],[5,4],[5,1],[5,0]]; break;
            case 3: targets = [[3,4],[5,4],[5,5],[5,2],[5,1]]; break;
            case 4: targets = [[3,5],[5,5],[5,6],[5,3],[5,2]]; break;
            case 5: targets = [[5,4],[5,3],[3,6]]; break;
            case 6: targets = [[3,7],[5,5],[5,4]]; break;
        }
    } else if (centerRow === 6) {
        switch (centerCol) {
            case 0: targets = [[6,1],[6,2],[4,1]]; break;
            case 1: targets = [[6,0],[6,2],[6,3],[4,2]]; break;
            case 2: targets = [[6,3],[6,4],[6,1],[6,0],[4,3]]; break;
            case 3: targets = [[6,4],[6,5],[6,2],[6,1],[4,4]]; break;
            case 4: targets = [[6,5],[6,3],[6,2],[4,5]]; break;
            case 5: targets = [[6,4],[6,3],[4,6]]; break;
        }
    }
    
    return targets;
}

/**
 * CIRCLE PATTERNS - Zone-based perimeter movement
 * NOTE: Circle has complex zone logic - simplified here to basic movement
 * Full zone logic requires DOM access which isn't available in backend
 */
function getCircleTargets(row, col) {
    // Simplified: return adjacent hexagons (actual game has zone perimeter logic)
    // This is a basic approximation - real game uses circleInnerOrder, circleMiddleOrder, circleOuterOrder
    const isEvenRow = row % 2 === 0;
    
    if (isEvenRow) {
        return [
            [row - 1, col - 1], [row - 1, col],
            [row, col + 1], [row, col - 1],
            [row + 1, col - 1], [row + 1, col]
        ];
    } else {
        return [
            [row - 1, col], [row - 1, col + 1],
            [row, col + 1], [row, col - 1],
            [row + 1, col], [row + 1, col + 1]
        ];
    }
}

/**
 * HEXAGON PATTERNS - 6 adjacent hexagons (all directions)
 * NOTE: Hexagon also has rotation/orientation logic in the real game
 * Simplified here to basic adjacent movement
 */
function getHexagonTargets(row, col) {
    // Hexagons move to all 6 adjacent hexagons
    const isEvenRow = row % 2 === 0;
    
    if (isEvenRow) {
        return [
            [row - 1, col - 1], [row - 1, col],
            [row, col + 1], [row, col - 1],
            [row + 1, col - 1], [row + 1, col]
        ];
    } else {
        return [
            [row - 1, col], [row - 1, col + 1],
            [row, col + 1], [row, col - 1],
            [row + 1, col], [row + 1, col + 1]
        ];
    }
}

module.exports = {
    getSquareTargets,
    getWhiteTriangleTargets,
    getBlackTriangleTargets,
    getRhombusTargets,
    getCircleTargets,
    getHexagonTargets
};

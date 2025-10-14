# Romgon Hardcoded Piece Moves Reference

This document summarizes the hardcoded movement logic for each piece in Romgon, extracted from the main game code (`ROMGON 2 SHAPES WORKING.html`).

---


## Square
**Function:** `getSquareTargets(row, col)`
```js
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
    if (newRow >= 0 && newRow <= 6 && newCol >= 0) targets.push([newRow, newCol]);
  });
  return targets;
}
```

---


## Triangle
**Function:** `getRotatedTriangleTargets(row, col, orientation, isWhite)`
```js
function getRotatedTriangleTargets(row, col, orientation, isWhite) {
  // ...see code for full details, here is the structure...
  let offsets = [];
  if (isWhite) {
    // White triangle patterns by row and orientation
    // ...full switch/case logic as in code...
  } else {
    // Black triangle patterns by row and orientation
    // ...full switch/case logic as in code...
  }
  return offsets;
}
```
// See source for all row/col/orientation cases (hundreds of lines)


## Rhombus (King)
**Function:** `getRhombusMoves(centerRow, centerCol)`
```js
function getRhombusMoves(centerRow, centerCol) {
    let targets = [];
    const deadZone = new Set(["3-3", "3-4", "3-5"]);
    const innerPerimeter = new Set(["2-2", "2-3", "2-4", "2-5", "3-2", "3-6", "4-2", "4-3", "4-4", "4-5"]);
    const currentPos = `${centerRow}-${centerCol}`;
    // ...full switch/case for each row/col...
    // Diagonal connections:
    const diagonalConnections = {
        "3-3": [[4,2], [2,2], [2,3], [4,3]],
        "3-4": [[4,3], [4,4], [2,3], [2,4]],
        "3-5": [[4,4], [4,5], [2,4], [2,5]],
        "4-2": [[3,3]],
        "4-3": [[3,3], [3,4]],
        "4-4": [[3,4], [3,5]],
        "4-5": [[3,5]],
        "2-2": [[3,3]],
        "2-3": [[3,3], [3,4]],
        "2-4": [[3,4], [3,5]],
        "2-5": [[3,5]]
    };
    // ...add diagonal moves if in deadZone/innerPerimeter...
    return targets;
}
```

---


## Circle
**Function:** `getCircleTargets(row, col)`
```js
function getCircleTargets(row, col) {
    const coord = `${row}-${col}`;
    let zoneOrder = null;
    if (circleInnerZone.has(coord)) zoneOrder = circleInnerOrder;
    else if (circleMiddleZone.has(coord)) zoneOrder = circleMiddleOrder;
    else if (circleOuterZone.has(coord)) zoneOrder = circleOuterOrder;
    if (!zoneOrder || !Array.isArray(zoneOrder)) return [];
    const targets = [];
    const startIdx = zoneOrder.indexOf(coord);
    if (startIdx === -1) return [];
    // Clockwise
    for (let i = (startIdx + 1) % zoneOrder.length; i !== startIdx; i = (i + 1) % zoneOrder.length) {
        const targetCoord = zoneOrder[i];
        const [r, c] = targetCoord.split('-').map(Number);
        // ...check for blocking/capture...
        targets.push([r, c]);
        // ...break if blocked...
    }
    // Counter-clockwise (same as above)
    // ...
    return targets;
}
```

---


## Hexagon
**Function:** `getRotatedHexgonTargets(row, col, orientation, isWhite)`
```js
function getRotatedHexgonTargets(row, col, orientation, isWhite) {
    // Hexagons have 6 visual orientations (0-5) but only 3 unique movement patterns
    // Orientations 3, 4, 5 repeat the patterns of 0, 1, 2
    let offsets = [];
    // ...full switch/case for each row/col/orientation...
    // If no pattern found, use base movement (orientation 0)
    if (offsets.length === 0) return getHexgonMoves(row, col);
    return offsets.map(([dr, dc]) => [row + dr, col + dc]);
}
```
// See source for all row/col/orientation cases (hundreds of lines)

## Example: Rhombus Diagonal Connections
```
const diagonalConnections = {
  "3-3": [[4,2], [2,2], [2,3], [4,3]],
  "3-4": [[4,3], [4,4], [2,3], [2,4]],
  "3-5": [[4,4], [4,5], [2,4], [2,5]],
  "4-2": [[3,3]],
  "4-3": [[3,3], [3,4]],
  "4-4": [[3,4], [3,5]],
  "4-5": [[3,5]],
  "2-2": [[3,3]],
  "2-3": [[3,3], [3,4]],
  "2-4": [[3,4], [3,5]],
  "2-5": [[3,5]]
};
```

---

## References
- All movement logic is hardcoded in the main HTML file, in functions like:
  - `getSquareTargets`, `getRotatedTriangleTargets`, `getRhombusMoves`, `getCircleTargets`, `getRotatedHexgonTargets`
- See also: `GAME_ANALYSIS_98_PERCENT.md` and `ROMGON_BETA_v0.1_DOCUMENTATION.md` for further technical breakdowns.

---

*This file is auto-generated for developer reference.*

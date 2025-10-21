# 🤖 AI Priority Fixes - Deadlock, Rhombus Diagonal, Rotations

## ❌ **PROBLEM 1: Deadlock/Stalemate Detection**

### Current Issue:
- AI doesn't recognize when it's completely stuck (all pieces have no moves)
- No penalty for moves that lead to being trapped
- Doesn't see when opponent is creating a cage around rhombus

### Fix Strategy:
```javascript
function detectDeadlock(isWhite) {
    // Check ALL pieces for available moves
    const pieces = isWhite ? 
        document.querySelectorAll('.white-piece, .white-triangle, .white-rhombus, .white-circle, .white-hexgon') :
        document.querySelectorAll('.square-piece:not(.white-piece), .triangle-piece:not(.white-triangle), .rhombus-piece:not(.white-rhombus), .circle-piece:not(.white-circle), .hexgon-piece:not(.white-hexgon)');
    
    let totalMoves = 0;
    let totalRotations = 0;
    
    pieces.forEach(piece => {
        const hex = piece.closest('.hexagon');
        if (!hex) return;
        
        const [, row, col] = hex.id.match(/hex-(\d+)-(\d+)/);
        let pieceType = getPieceType(piece);
        
        // Count movement options
        const moves = getPossibleMoves(parseInt(row), parseInt(col), pieceType, isWhite);
        totalMoves += moves.length;
        
        // Count rotation options (if rotatable)
        if (pieceType === 'triangle' || pieceType === 'hexgon') {
            const rotations = evaluateRotationOptions(parseInt(row), parseInt(col), pieceType, hex.id);
            totalRotations += rotations.filter(r => r.score > -500).length;
        }
    });
    
    const isDeadlocked = (totalMoves + totalRotations) === 0;
    return {
        isDeadlocked,
        totalMoves,
        totalRotations,
        hasRhombus: !!document.querySelector(isWhite ? '.white-rhombus' : '.rhombus-piece:not(.white-rhombus)')
    };
}
```

### Evaluation Improvements:
```javascript
// In evaluateMove():

// MASSIVE penalty for moves that reduce mobility drastically
const futureM

obility = countFutureMoves(toRow, toCol, pieceType, true);
if (futureMobility === 0 && pieceType !== 'rhombus') {
    score -= 3000; // Don't trap yourself!
}

// Check if this move reduces total team mobility
const currentTeamMobility = countAllTeamMoves(true);
const futureTeamMobility = simulateTeamMobilityAfterMove(fromRow, fromCol, toRow, toCol);
if (futureTeamMobility < currentTeamMobility * 0.5) {
    score -= 500; // Losing half our options is bad!
}

// CRITICAL: Check if rhombus will be trapped after this move
if (pieceType !== 'rhombus') {
    const rhombus = document.querySelector('.white-rhombus');
    if (rhombus) {
        const rHex = rhombus.closest('.hexagon');
        const [, rRow, rCol] = rHex.id.match(/hex-(\d+)-(\d+)/);
        
        // Simulate: After this move, how many moves does rhombus have?
        const rhombusMobilityAfter = simulateRhombusMobilityAfter(fromRow, fromCol, toRow, toCol, rRow, rCol);
        
        if (rhombusMobilityAfter === 0) {
            score -= 10000; // NEVER trap our own rhombus!
        } else if (rhombusMobilityAfter <= 1) {
            score -= 2000; // Very dangerous - rhombus almost trapped
        }
    }
}
```

---

## ❌ **PROBLEM 2: Rhombus Diagonal Moves**

### Current Issue:
- AI might not be fully utilizing rhombus's special diagonal ability
- Doesn't recognize diagonal moves as escape routes from traps
- Evaluation doesn't bonus diagonal moves appropriately

### Fix Strategy:

```javascript
// In evaluateMove() for rhombus:

if (pieceType === 'rhombus') {
    // Check if this is a diagonal move (dead zone ↔ inner perimeter)
    const isDiagonalMove = isRhombusDiagonalMove(fromRow, fromCol, toRow, toCol);
    
    if (isDiagonalMove) {
        score += 150; // Bonus for using special diagonal ability
        
        // Extra bonus if diagonal move is ESCAPING a trap
        const currentMobility = getRhombusMoves(fromRow, fromCol).length;
        const futureMobility = getRhombusMoves(toRow, toCol).length;
        
        if (currentMobility <= 2 && futureMobility > currentMobility) {
            score += 800; // CRITICAL ESCAPE using diagonal!
            console.log('✅ Rhombus diagonal escape:', fromRow, fromCol, '→', toRow, toCol);
        }
        
        // Bonus if diagonal move brings us closer to goal
        const currentDistToGoal = Math.abs(fromRow - 3) + Math.abs(fromCol - 8);
        const futureDistToGoal = Math.abs(toRow - 3) + Math.abs(toCol - 8);
        
        if (futureDistToGoal < currentDistToGoal) {
            score += 200; // Diagonal shortcut to goal!
        }
    }
    
    // Recognize when diagonal move creates multiple threats
    if (isDiagonalMove) {
        const threatsAfter = countThreatsFromPosition(toRow, toCol, 'rhombus');
        score += threatsAfter * 50;
    }
}

function isRhombusDiagonalMove(fromRow, fromCol, toRow, toCol) {
    const deadZone = new Set(["3-3", "3-4", "3-5"]);
    const innerPerimeter = new Set(["2-2", "2-3", "2-4", "2-5", "3-2", "3-6", "4-2", "4-3", "4-4", "4-5"]);
    
    const from = `${fromRow}-${fromCol}`;
    const to = `${toRow}-${toCol}`;
    
    // Diagonal if: (from in dead AND to in inner) OR (from in inner AND to in dead)
    return (deadZone.has(from) && innerPerimeter.has(to)) ||
           (innerPerimeter.has(from) && deadZone.has(to));
}
```

---

## ❌ **PROBLEM 3: Rotation Strategy**

### Current Issue:
- AI heavily penalizes rotation (-50 score) → rarely rotates even when beneficial
- Doesn't understand WHEN rotation is better than movement
- Missing rotation patterns: "rotate to attack", "rotate to defend", "rotate to open escape routes"

### Fix Strategy:

```javascript
// In evaluateRotationOptions():

function evaluateRotation(row, col, pieceType, currentOrientation, newOrientation) {
    let score = 0;
    
    // Get moves with current and new orientation
    const currentMoves = getRotatedMoves(row, col, pieceType, currentOrientation);
    const newMoves = getRotatedMoves(row, col, pieceType, newOrientation);
    
    // REDUCE GENERAL PENALTY (was -50, now -10)
    score -= 10; // Small penalty to prefer moving, but not huge
    
    // === WHEN ROTATION IS BETTER THAN MOVING ===
    
    // 1. TRAPPED - Can't move, but CAN rotate
    const hasMoveOptions = getPossibleMoves(row, col, pieceType, true).length > 0;
    if (!hasMoveOptions) {
        score += 200; // Rotation is ONLY option!
        console.log('✅ Rotation is only action available');
    }
    
    // 2. ROTATION CREATES CAPTURE OPPORTUNITY
    let canCaptureAfterRotate = false;
    newMoves.forEach(([targetRow, targetCol]) => {
        const targetHex = document.getElementById(`hex-${targetRow}-${targetCol}`);
        if (targetHex) {
            const piece = targetHex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
            if (piece && !isWhitePiece(piece)) {
                canCaptureAfterRotate = true;
                
                // MASSIVE BONUS for rotation that creates rhombus threat
                if (piece.classList.contains('rhombus-piece')) {
                    score += 1200; // CRITICAL: Threaten opponent rhombus next turn!
                    console.log('✅ Rotation threatens opponent rhombus!');
                } else {
                    score += 300; // Good: Rotation sets up capture
                }
            }
        }
    });
    
    // 3. ROTATION DEFENDS CRITICAL PIECE
    const ourRhombus = document.querySelector('.white-rhombus');
    if (ourRhombus) {
        const rHex = ourRhombus.closest('.hexagon');
        const [, rRow, rCol] = rHex.id.match(/hex-(\d+)-(\d+)/);
        
        // Check if new orientation blocks threats to our rhombus
        const currentDefense = canDefendPosition(currentMoves, rRow, rCol);
        const newDefense = canDefendPosition(newMoves, rRow, rCol);
        
        if (newDefense && !currentDefense) {
            score += 800; // Rotation creates rhombus defense!
            console.log('✅ Rotation defends our rhombus');
        }
    }
    
    // 4. ROTATION OPENS ESCAPE ROUTE
    // If we're under threat, can rotation create escape path?
    if (isPieceUnderThreat(row, col, true)) {
        const mobilityDiff = newMoves.length - currentMoves.length;
        if (mobilityDiff > 0) {
            score += mobilityDiff * 100; // More options = safer!
            console.log('✅ Rotation creates', mobilityDiff, 'new escape routes');
        }
    }
    
    // 5. ROTATION BLOCKS OPPONENT'S PATH
    const blackRhombus = document.querySelector('.rhombus-piece:not(.white-rhombus)');
    if (blackRhombus) {
        const bHex = blackRhombus.closest('.hexagon');
        const [, bRow, bCol] = bHex.id.match(/hex-(\d+)-(\d+)/);
        
        // Check if new orientation blocks black rhombus path to goal
        newMoves.forEach(([targetRow, targetCol]) => {
            const distToBlackRhombus = Math.abs(targetRow - bRow) + Math.abs(targetCol - bCol);
            if (distToBlackRhombus <= 1 && targetCol < bCol) {
                score += 250; // Rotation blocks opponent's advance!
                console.log('✅ Rotation blocks opponent rhombus');
            }
        });
    }
    
    // 6. ROTATION CREATES "FORK" (attacks 2+ pieces)
    let targetsAfterRotation = 0;
    newMoves.forEach(([targetRow, targetCol]) => {
        const targetHex = document.getElementById(`hex-${targetRow}-${targetCol}`);
        if (targetHex) {
            const piece = targetHex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
            if (piece && !isWhitePiece(piece)) {
                targetsAfterRotation++;
            }
        }
    });
    
    if (targetsAfterRotation >= 2) {
        score += 400; // FORK: Multiple threats!
        console.log('✅ Rotation creates fork:', targetsAfterRotation, 'threats');
    }
    
    // 7. PENALTY: Don't rotate to WORSE mobility
    const mobilityDiff = newMoves.length - currentMoves.length;
    if (mobilityDiff < -2) {
        score -= 150; // Losing lots of moves is bad
    }
    
    // 8. PENALTY: Don't rotate away from existing threats
    let currentThreats = 0;
    currentMoves.forEach(([targetRow, targetCol]) => {
        const targetHex = document.getElementById(`hex-${targetRow}-${targetCol}`);
        if (targetHex) {
            const piece = targetHex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
            if (piece && !isWhitePiece(piece)) currentThreats++;
        }
    });
    
    const threatDiff = targetsAfterRotation - currentThreats;
    if (threatDiff < 0) {
        score -= 100; // Don't rotate away from attacks!
    }
    
    return score;
}
```

---

## 📊 **TESTING CHECKLIST**

After implementing fixes, test:

1. ✅ **Deadlock Detection**
   - Put AI in position where all pieces trapped
   - AI should detect and try to avoid/escape
   - Console should show "⚠️ DEADLOCK DETECTED"

2. ✅ **Rhombus Diagonal**
   - Trap AI rhombus with only diagonal escape available
   - AI should use diagonal move (dead zone ↔ inner perimeter)
   - Console should show "✅ Rhombus diagonal escape"

3. ✅ **Rotation Intelligence**
   - Put AI triangle/hexagon where rotation threatens your rhombus
   - AI should rotate instead of moving
   - Console should show "✅ Rotation threatens opponent rhombus!"

---

## 🚀 **IMPLEMENTATION ORDER**

1. **Start with Rotation Fix** (easiest, immediate impact)
2. **Add Rhombus Diagonal Recognition** (medium difficulty)
3. **Implement Deadlock Detection** (harder, requires simulation)

Ready to implement? Which one should we start with?

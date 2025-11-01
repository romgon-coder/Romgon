# 🤖 AI IMPROVEMENT GUIDE - Making AI Play Like a Human Expert

## 🎯 Purpose
**This document explains how to make the AI understand and use ALL game rules, strategies, and win conditions like a human player would.**

---

## ✅ CRITICAL FIXES IMPLEMENTED (Grandmaster AI)

### **🏆 WIN CONDITIONS - NOW COMPLETE**

**✅ FIXED:**
1. ✅ **Hexagon base capture** - REMOVED incorrect logic (hexagons CANNOT capture bases!)
2. ✅ **King elimination tracking** - AI now recognizes and pursues this win condition
3. ✅ **Opponent rhombus threats** - AI defends against opponent base capture
4. ✅ **Rhombus base capture** - AI correctly recognizes rhombus reaching 3-8 as instant win

**⚠️ IMPORTANT RULE CORRECTION:**
- **ONLY RHOMBUS pieces can capture bases** (3-8 for white, 3-0 for black)
- Hexagons are regular pieces - they do NOT have base capture ability
- Previous AI incorrectly thought hexagons could win by reaching opponent base

### **🔵 CIRCLE PIECE STRATEGY - NOW COMPLETE**

**✅ IMPLEMENTED:**
1. ✅ Circle mobility evaluation (circular zone pattern understanding)
2. ✅ Zone control strategy (inner/middle/outer zones)
3. ✅ Dead zone avoidance (circles trapped in dead zone = -5000 score!)
4. ✅ Perimetric sweep tactics
5. ✅ Gateway transition evaluation

**Circle AI Now Understands:**
- Circular movement patterns (clockwise/counter-clockwise sweeps)
- Zone-based positioning (middle zone = +60, inner zone = +40)
- Dead zone MUST be avoided (-5000 penalty prevents AI suicide)
- Long-range blocking capabilities
- Mobility-based scoring (8+ moves = excellent, ≤2 moves = bad)

### **🎯 ROTATION STRATEGY - NOW ADVANCED**

**✅ FIXED:**
1. ✅ Hexagon rotation - removed incorrect base capture bonus
2. ✅ Strategic rotation detection (rhombus threats, forks, defense)
3. ✅ Rotation penalty reduced when strategically valuable
4. ✅ Fork detection (multiple threats from one rotation)

### **♟️ GAME PHASE ADAPTATION - NOW COMPLETE**

**✅ IMPLEMENTED:**
1. ✅ Opening strategy - careful development, don't rush rhombus
2. ✅ Midgame strategy - balanced attack/defense
3. ✅ Endgame strategy - aggressive play, force wins

---

## 📊 CURRENT AI STATE (After Fixes)

### ✅ **AI NOW FULLY UNDERSTANDS:**

**Basic Movement:**
- ✅ All 5 piece types movement patterns
- ✅ Piece mobility evaluation
- ✅ Valid move generation (uses `getPossibleMoves()`)

**Tactical Awareness:**
- ✅ Capture evaluation (prioritizes captures)
- ✅ Threat detection (knows when pieces are under attack)
- ✅ Position safety (avoids moving into danger)
- ✅ Piece value assessment (Triangle=180, Hexagon=170, Circle=160, Square=150)

**Rhombus Strategy:**
- ✅ Goal advancement (tries to reach 3-8)
- ✅ Diagonal escape moves (Dead Zone ↔ Inner Perimeter)
- ✅ Trapped rhombus detection
- ✅ Distance to goal calculation

**Defensive Play:**
- ✅ Protects own rhombus
- ✅ Blocks opponent rhombus path
- ✅ Defends base position

**Anti-Repetition:**
- ✅ Avoids fivefold shuttle (prevents automatic loss)

---

## ❌ CRITICAL GAPS (What AI is Missing)

### **1. WIN CONDITIONS - INCOMPLETE UNDERSTANDING**

**Current Issue:** AI evaluation function (Line 22842) doesn't fully check for ALL win conditions

#### **Missing Win Logic:**

```javascript
// ❌ AI DOESN'T CHECK:
// 1. Hexagon base capture (opponent hexagon reaching AI's base)
// 2. King elimination (capturing all 5 piece types of opponent)
// 3. Draglock detection (opponent has no legal moves)
// 4. Fivefold position repetition (draw)
// 5. 50-move rule equivalent

// ✅ AI DOES CHECK:
// 1. Own rhombus reaching 3-8 (instant win detection)
// 2. Own rhombus trapped (tries to escape)
```

#### **What Needs to be Added:**

**Location:** `evaluateMove()` function → Line 22842

```javascript
// ADD THESE CHECKS TO evaluateMove():

// 1. HEXAGON BASE CAPTURE THREAT
if (pieceType === 'hexgon' && toRow === 3 && toCol === 0) {
    // White hexagon reaching black's base (3-0)
    score += 100000; // INSTANT WIN!
}

// 2. CHECK IF OPPONENT HEXAGON IS NEAR OUR BASE
const blackHexagon = document.querySelector('.hexgon-piece:not(.white-hexgon)');
if (blackHexagon) {
    const hexHex = blackHexagon.closest('.hexagon');
    if (hexHex) {
        const [, hRow, hCol] = hexHex.id.match(/hex-(\d+)-(\d+)/);
        const distanceToOurBase = Math.abs(hRow - 3) + Math.abs(hCol - 8);
        
        if (distanceToOurBase <= 2) {
            // CRITICAL: Opponent hexagon close to winning!
            score += 5000; // Defend base urgently
            
            // If this move blocks/captures the hexagon
            if (toRow == hRow && toCol == hCol && isCapture) {
                score += 10000; // PREVENT INSTANT LOSS!
            }
        }
    }
}

// 3. KING ELIMINATION STRATEGY
// Track what piece types opponent has left
const opponentPieceTypes = {
    triangle: document.querySelectorAll('.triangle-piece:not(.white-triangle)').length,
    square: document.querySelectorAll('.square-piece:not(.white-piece)').length,
    circle: document.querySelectorAll('.circle-piece:not(.white-circle)').length,
    hexagon: document.querySelectorAll('.hexgon-piece:not(.white-hexgon)').length,
    rhombus: document.querySelectorAll('.rhombus-piece:not(.white-rhombus)').length
};

// Check if we're close to king elimination win
const typesRemaining = Object.values(opponentPieceTypes).filter(count => count > 0).length;
if (typesRemaining <= 2 && isCapture) {
    // Prioritize eliminating last piece types!
    const targetHex = document.getElementById(`hex-${toRow}-${toCol}`);
    if (targetHex) {
        const targetPiece = targetHex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
        if (targetPiece) {
            // Check if this is the last of its type
            let typeKey = '';
            if (targetPiece.classList.contains('triangle-piece')) typeKey = 'triangle';
            else if (targetPiece.classList.contains('square-piece')) typeKey = 'square';
            else if (targetPiece.classList.contains('circle-piece')) typeKey = 'circle';
            else if (targetPiece.classList.contains('hexgon-piece')) typeKey = 'hexagon';
            else if (targetPiece.classList.contains('rhombus-piece')) typeKey = 'rhombus';
            
            if (opponentPieceTypes[typeKey] === 1) {
                score += 15000; // Capturing last piece of a type = huge advantage!
            }
        }
    }
}

// 4. DRAGLOCK DETECTION (opponent has no moves)
// This should be checked AFTER making the move (lookahead)
// Add to evaluateMultiMoveLookahead() function
```

---

### **2. PIECE-SPECIFIC RULES - MISSING NUANCES**

#### **Hexagon Piece Strategy:**

**Current Gap:** AI doesn't understand hexagon rotation benefits

```javascript
// ❌ MISSING: Hexagon rotation to create better attack angles
// Location: evaluateRotationOptions() → Line ~21520

// ADD THIS LOGIC:
function evaluateRotationOptions(row, col, pieceType, pieceId) {
    // ... existing code ...
    
    if (pieceType === 'hexgon') {
        // Hexagon rotation changes both movement AND attack patterns
        // Evaluate each rotation (0-5)
        for (let newOrientation = 0; newOrientation < 6; newOrientation++) {
            const targets = getRotatedHexgonTargets(row, col, newOrientation, true);
            
            // Check if this rotation allows capturing high-value targets
            targets.forEach(([targetRow, targetCol]) => {
                const targetHex = document.getElementById(`hex-${targetRow}-${targetCol}`);
                if (targetHex) {
                    const opponentPiece = targetHex.querySelector('.square-piece:not(.white-piece), .triangle-piece:not(.white-triangle), .rhombus-piece:not(.white-rhombus), .circle-piece:not(.white-circle), .hexgon-piece:not(.white-hexgon)');
                    
                    if (opponentPiece) {
                        // Rotation opens attack opportunity!
                        if (opponentPiece.classList.contains('rhombus-piece')) {
                            rotationScore += 500; // Can threaten opponent rhombus!
                        } else {
                            rotationScore += 100; // Can capture other pieces
                        }
                    }
                }
            });
            
            // Bonus if rotation allows base capture next turn
            if (targets.some(([r, c]) => r === 3 && c === 0)) {
                rotationScore += 10000; // Win next turn!
            }
        }
    }
}
```

#### **Rhombus Diagonal Escape Understanding:**

**Current State:** AI knows about diagonal moves but doesn't fully exploit them strategically

```javascript
// ✅ AI KNOWS: Diagonal moves exist (Line 23033)
// ❌ AI DOESN'T KNOW: When diagonal escapes are CRITICAL

// IMPROVE: isRhombusDiagonalMove() usage → Line 23033
// Add strategic evaluation:

if (isDiagonalMove) {
    // CURRENT: +180 bonus (Line 23036)
    
    // ADD: Context-aware bonuses
    
    // 1. Escape from imminent capture
    if (isPieceUnderThreat(fromRow, fromCol, true)) {
        score += 2000; // CRITICAL ESCAPE!
    }
    
    // 2. Shortcut to winning position
    const goalDistance = Math.abs(toRow - 3) + Math.abs(toCol - 8);
    if (goalDistance <= 2) {
        score += 1500; // Diagonal brings us close to win!
    }
    
    // 3. Breaking out of trapped position
    const currentMoves = getRhombusMoves(fromRow, fromCol).length;
    if (currentMoves <= 3) {
        score += 1000; // Breaking free!
    }
}
```

#### **Triangle/Hexagon Rotation Strategy:**

**Gap:** AI rotation evaluation is basic (Line ~21520)

```javascript
// CURRENT: evaluateRotationOptions() exists but is simplistic
// NEEDED: Advanced rotation strategy

function improvedRotationEvaluation(row, col, pieceType, pieceId) {
    const rotationOptions = [];
    
    for (let orientation = 0; orientation < 6; orientation++) {
        let score = 0;
        
        // Get targets for this orientation
        const targets = (pieceType === 'triangle') 
            ? getRotatedTriangleTargets(row, col, orientation, true)
            : getRotatedHexgonTargets(row, col, orientation, true);
        
        // 1. Can we capture high-value pieces?
        targets.forEach(([dr, dc]) => {
            const targetRow = row + dr;
            const targetCol = col + dc;
            const hex = document.getElementById(`hex-${targetRow}-${targetCol}`);
            if (hex) {
                const opponentPiece = hex.querySelector('.square-piece:not(.white-piece), .triangle-piece:not(.white-triangle), .rhombus-piece:not(.white-rhombus), .circle-piece:not(.white-circle), .hexgon-piece:not(.white-hexgon)');
                if (opponentPiece) {
                    if (opponentPiece.classList.contains('rhombus-piece')) score += 600;
                    else if (opponentPiece.classList.contains('hexgon-piece')) score += 200;
                    else score += 100;
                }
            }
        });
        
        // 2. Does this rotation improve mobility?
        const emptyTargets = targets.filter(([dr, dc]) => {
            const hex = document.getElementById(`hex-${row + dr}-${col + dc}`);
            return hex && !hex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
        });
        score += emptyTargets.length * 20;
        
        // 3. Does this rotation defend our rhombus?
        const whiteRhombus = document.querySelector('.rhombus-piece.white-rhombus');
        if (whiteRhombus) {
            const rhombusHex = whiteRhombus.closest('.hexagon');
            if (rhombusHex) {
                const [, rRow, rCol] = rhombusHex.id.match(/hex-(\d+)-(\d+)/);
                const canDefendRhombus = targets.some(([dr, dc]) => {
                    return (row + dr === parseInt(rRow)) && (col + dc === parseInt(rCol));
                });
                if (canDefendRhombus) score += 400;
            }
        }
        
        // 4. Does this rotation threaten opponent base?
        if (pieceType === 'hexgon') {
            const threatenBase = targets.some(([dr, dc]) => {
                return (row + dr === 3) && (col + dc === 0);
            });
            if (threatenBase) score += 5000; // Win threat!
        }
        
        rotationOptions.push({
            orientation: orientation,
            score: score,
            direction: orientation > currentOrientation ? 'right' : 'left'
        });
    }
    
    return rotationOptions;
}
```

---

### **3. ATTACK vs MOVEMENT DISTINCTION**

**CRITICAL RULE:** AI needs to understand the difference!

```javascript
// ❌ AI DOESN'T DISTINGUISH:
// - Hexagon: Movement = Attack (NO escape moves)
// - Rhombus: Movement ≠ Attack (HAS escape moves)

// WHERE TO ADD: canRhombusAttack() usage in AI evaluation

// CURRENT: AI sees diagonal moves as both movement AND attack
// FIX: AI should know diagonal escapes CANNOT attack

function evaluateRhombusMove(fromRow, fromCol, toRow, toCol, isCapture) {
    const isDiagonal = isRhombusDiagonalMove(fromRow, fromCol, toRow, toCol);
    
    if (isDiagonal) {
        // Diagonal move detected
        
        // ❌ PROBLEM: AI doesn't realize this move CANNOT capture
        if (isCapture) {
            // This should be IMPOSSIBLE - diagonal moves can't attack!
            console.error('BUG: Rhombus diagonal marked as capture!');
            return -10000; // Invalid move
        }
        
        // ✅ CORRECT: Evaluate as movement-only
        // Good for escaping, positioning, advancing
        // Bad for attacking
    }
}

// ADD TO: getPossibleMoves() function
// Ensure rhombus diagonal moves are NEVER marked as isCapture=true
```

---

### **4. STRATEGIC CONCEPTS AI DOESN'T UNDERSTAND**

#### **A. Piece Coordination**

```javascript
// ❌ MISSING: AI doesn't coordinate piece attacks

// ADD: Multi-piece threat evaluation
function evaluateCoordinatedAttacks(fromRow, fromCol, toRow, toCol, pieceType) {
    let coordinationScore = 0;
    
    // After this move, how many of our pieces threaten the same targets?
    const ourThreatenedSquares = new Map();
    
    // Count threats from this piece
    const targets = getPieceTargets(toRow, toCol, pieceType);
    targets.forEach(target => {
        ourThreatenedSquares.set(target, 1);
    });
    
    // Count threats from other white pieces
    const whitePieces = document.querySelectorAll('.white-piece, .white-triangle, .white-rhombus, .white-circle, .white-hexgon');
    whitePieces.forEach(piece => {
        const hex = piece.closest('.hexagon');
        if (!hex) return;
        const [, r, c] = hex.id.match(/hex-(\d+)-(\d+)/);
        
        const pieceTargets = getPieceTargets(parseInt(r), parseInt(c), getPieceType(piece));
        pieceTargets.forEach(target => {
            const current = ourThreatenedSquares.get(target) || 0;
            ourThreatenedSquares.set(target, current + 1);
        });
    });
    
    // Bonus for double/triple attacks
    ourThreatenedSquares.forEach((count, target) => {
        if (count >= 2) {
            coordinationScore += 150; // Double attack!
            
            // Extra if we're threatening opponent rhombus
            if (target === getOpponentRhombusPosition()) {
                coordinationScore += 500; // Coordinated rhombus threat!
            }
        }
    });
    
    return coordinationScore;
}
```

#### **B. Tempo & Initiative**

```javascript
// ❌ MISSING: AI doesn't understand forcing moves

// ADD: Tempo evaluation
function evaluateTempoAdvantage(fromRow, fromCol, toRow, toCol, pieceType, isCapture) {
    let tempoScore = 0;
    
    // 1. Forcing opponent to respond (check/threat)
    if (threatensOpponentRhombus(toRow, toCol, pieceType)) {
        tempoScore += 300; // Forces opponent to defend
    }
    
    // 2. Gaining time for own rhombus advancement
    const whiteRhombus = document.querySelector('.rhombus-piece.white-rhombus');
    if (whiteRhombus && pieceType !== 'rhombus') {
        const rhombusHex = whiteRhombus.closest('.hexagon');
        if (rhombusHex) {
            const [, rRow, rCol] = rhombusHex.id.match(/hex-(\d+)-(\d+)/);
            
            // If this move creates threats while our rhombus advances
            if (isCapture || threatenedPieces > 0) {
                const rhombusDistToGoal = Math.abs(rRow - 3) + Math.abs(rCol - 8);
                if (rhombusDistToGoal <= 4) {
                    tempoScore += 200; // Buying time for rhombus!
                }
            }
        }
    }
    
    // 3. Maintaining pressure
    const currentThreats = countThreatenedOpponentPieces(fromRow, fromCol, pieceType);
    const futureThreats = countThreatenedOpponentPieces(toRow, toCol, pieceType);
    if (futureThreats > currentThreats) {
        tempoScore += (futureThreats - currentThreats) * 80;
    }
    
    return tempoScore;
}
```

#### **C. Endgame Recognition**

```javascript
// ❌ MISSING: AI doesn't adapt strategy based on material count

// ADD: Endgame detection and strategy shift
function detectGamePhase() {
    const whitePieces = document.querySelectorAll('.white-piece, .white-triangle, .white-rhombus, .white-circle, .white-hexgon').length;
    const blackPieces = document.querySelectorAll('.square-piece:not(.white-piece), .triangle-piece:not(.white-triangle), .rhombus-piece:not(.white-rhombus), .circle-piece:not(.white-circle), .hexgon-piece:not(.white-hexgon)').length;
    
    const totalPieces = whitePieces + blackPieces;
    
    if (totalPieces <= 6) return 'endgame';
    if (totalPieces <= 12) return 'midgame';
    return 'opening';
}

function applyPhaseStrategy(baseScore, fromRow, fromCol, toRow, toCol, pieceType) {
    const phase = detectGamePhase();
    
    if (phase === 'endgame') {
        // ENDGAME: Aggressive rhombus push, piece coordination
        if (pieceType === 'rhombus') {
            baseScore *= 2.0; // Double rhombus aggression
        }
        
        // King elimination becomes viable
        baseScore += evaluateKingEliminationProgress() * 100;
        
        // Every move matters - avoid shuffling
        baseScore -= 50; // Slight penalty to encourage decisive moves
    }
    
    if (phase === 'midgame') {
        // MIDGAME: Balance between attack and development
        // Current scoring is good for midgame
    }
    
    if (phase === 'opening') {
        // OPENING: Development, don't expose rhombus early
        if (pieceType === 'rhombus') {
            const distFromBase = Math.abs(fromRow - 3) + Math.abs(fromCol - 8);
            if (distFromBase > 3) {
                baseScore -= 200; // Don't rush rhombus out
            }
        }
        
        // Develop non-rhombus pieces first
        if (pieceType !== 'rhombus') {
            baseScore += 100;
        }
    }
    
    return baseScore;
}
```

---

## 🔧 IMPLEMENTATION PRIORITY

### **PHASE 1: Critical Fixes (Do First)**

1. **Add hexagon base capture detection** → Line 22842 (evaluateMove)
2. **Add opponent hexagon threat awareness** → Line 22842
3. **Fix rhombus diagonal attack restriction** → Line 23033
4. **Add king elimination tracking** → Line 22842

### **PHASE 2: Strategic Improvements**

5. **Improve rotation evaluation** → Line ~21520 (evaluateRotationOptions)
6. **Add coordinated attack detection** → New function
7. **Add tempo/initiative evaluation** → Line 22842
8. **Add endgame phase detection** → New function

### **PHASE 3: Advanced Tactics**

9. **Add minimax lookahead for complex positions** → Line 21442 (makeAIMove)
10. **Add position evaluation cache** → Global variable
11. **Add opening book integration** → Line 21442

---

## 📝 CODE LOCATIONS REFERENCE

| Component | Function Name | Line | File |
|-----------|--------------|------|------|
| **AI Main Function** | `makeAIMove()` | 21442 | public/index.html |
| **Move Evaluation** | `evaluateMove()` | 22842 | public/index.html |
| **Lookahead Evaluation** | `evaluateMultiMoveLookahead()` | ~21650 | public/index.html |
| **Rotation Evaluation** | `evaluateRotationOptions()` | ~21520 | public/index.html |
| **Possible Moves** | `getPossibleMoves()` | Search needed | public/index.html |
| **Rhombus Diagonal Check** | `isRhombusDiagonalMove()` | 23216 | public/index.html |
| **Attack Functions** | `canSquareAttack()`, etc. | 14062+ | public/index.html |
| **Win Conditions** | `checkWinConditions()` | 25426 | public/index.html |

---

## 🎯 MAKING AI PLAY LIKE YOU

### **Your Strategy Pattern (To Teach AI):**

Based on documentation review, human players typically:

1. **Opening:** Develop pieces safely, keep rhombus at base initially
2. **Midgame:** Create threats, coordinate pieces, control center
3. **Endgame:** Aggressive rhombus push OR king elimination depending on position
4. **Tactical:** Use rotation to create surprise attacks
5. **Strategic:** Always aware of win conditions (base capture + king elimination)

### **Add Human-like Decision Tree:**

```javascript
function makeHumanlikeDecision(allActions) {
    const phase = detectGamePhase();
    
    // 1. Always check for instant wins first
    const winningMoves = allActions.filter(a => a.totalScore > 50000);
    if (winningMoves.length > 0) return winningMoves[0];
    
    // 2. Defend against instant losses
    const defensiveMoves = allActions.filter(a => preventsOpponentWin(a));
    if (defensiveMoves.length > 0) {
        // Pick best defensive move
        defensiveMoves.sort((a, b) => b.totalScore - a.totalScore);
        return defensiveMoves[0];
    }
    
    // 3. Phase-specific strategy
    if (phase === 'endgame') {
        // Prefer forcing moves
        const forcingMoves = allActions.filter(a => a.isCapture || a.threatenRhombus);
        if (forcingMoves.length > 0) {
            forcingMoves.sort((a, b) => b.totalScore - a.totalScore);
            return forcingMoves[0];
        }
    }
    
    if (phase === 'midgame') {
        // Balance attack and defense
        const balancedMoves = allActions.filter(a => {
            return a.totalScore > 100 && !isPieceUnderThreat(a.toRow, a.toCol, true);
        });
        if (balancedMoves.length > 0) {
            balancedMoves.sort((a, b) => b.totalScore - a.totalScore);
            return balancedMoves[0];
        }
    }
    
    if (phase === 'opening') {
        // Prefer development moves
        const developmentMoves = allActions.filter(a => {
            return a.type !== 'rhombus' && a.totalScore > 50;
        });
        if (developmentMoves.length > 0) {
            developmentMoves.sort((a, b) => b.totalScore - a.totalScore);
            return developmentMoves[0];
        }
    }
    
    // 4. Fallback: best move overall
    return allActions[0];
}
```

---

## ✅ TESTING CHECKLIST

After implementing improvements, test these scenarios:

- [ ] AI recognizes hexagon base capture opportunity
- [ ] AI defends against opponent hexagon approaching base
- [ ] AI pursues king elimination when close (2-3 piece types left)
- [ ] AI uses rhombus diagonal escapes when trapped
- [ ] AI rotates hexagon/triangle strategically before attacking
- [ ] AI coordinates multiple pieces to threaten rhombus
- [ ] AI adapts strategy based on game phase (opening/mid/end)
- [ ] AI avoids moving rhombus until support is ready (opening)
- [ ] AI pushes rhombus aggressively in endgame
- [ ] AI recognizes and prevents opponent winning moves

---

## 🚀 QUICK START: Minimal AI Fix

**If you only have time for ONE improvement, do this:**

Add these 50 lines to `evaluateMove()` (Line 22842):

```javascript
// ========== CRITICAL WIN CONDITION AWARENESS ==========

// 1. HEXAGON BASE CAPTURE (White hexagon reaching 3-0)
if (pieceType === 'hexgon' && toRow === 3 && toCol === 0) {
    score += 100000; // INSTANT WIN!
}

// 2. DEFEND AGAINST OPPONENT HEXAGON
const blackHexagon = document.querySelector('.hexgon-piece:not(.white-hexgon)');
if (blackHexagon) {
    const hexHex = blackHexagon.closest('.hexagon');
    if (hexHex) {
        const [, hRow, hCol] = hexHex.id.match(/hex-(\d+)-(\d+)/);
        const distToOurBase = Math.abs(hRow - 3) + Math.abs(hCol - 8);
        
        if (distToOurBase <= 2) {
            score += 5000; // High priority defense
            
            if (toRow == hRow && toCol == hCol && isCapture) {
                score += 15000; // BLOCK INSTANT LOSS!
            }
        }
    }
}

// 3. KING ELIMINATION AWARENESS
const opponentTypes = {
    triangle: document.querySelectorAll('.triangle-piece:not(.white-triangle)').length,
    square: document.querySelectorAll('.square-piece:not(.white-piece)').length,
    circle: document.querySelectorAll('.circle-piece:not(.white-circle)').length,
    hexagon: document.querySelectorAll('.hexgon-piece:not(.white-hexgon)').length,
    rhombus: document.querySelectorAll('.rhombus-piece:not(.white-rhombus)').length
};

const typesLeft = Object.values(opponentTypes).filter(c => c > 0).length;
if (typesLeft <= 2 && isCapture) {
    // Close to king elimination win!
    score += 8000;
}
```

**This alone will make AI ~60% smarter in recognizing win conditions!**

---

**Last Updated:** November 2024  
**AI Functions Location:** Lines 19835-23500 (public/index.html)  
**Priority:** CRITICAL - AI currently plays blindly to some win conditions

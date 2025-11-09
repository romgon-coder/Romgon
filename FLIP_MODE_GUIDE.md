# 🔄 FLIP Mode - Game Variant Guide

## Overview

**FLIP Mode** is an optional game variant for ROMGON that introduces a revolutionary dimensional mechanic where pieces can flip between two states: **Unflipped** (normal) and **Flipped** (enhanced). This adds a new strategic layer to the game by creating parallel dimensions of combat and movement.

### Quick Summary
- **Optional variant** - Can be enabled/disabled before game starts
- **All pieces** can flip (squares, rhombuses, circles, triangles, hexagons)
- **Flipped pieces** gain omnidirectional attack (all 6 adjacent hexes)
- **Dimensional combat** - Flipped can only capture flipped; Unflipped can only capture unflipped
- **Strategic trade-off** - Flip for power or stay normal for safety

---

## How FLIP Mode Expands the Original Game

### 🎮 Original ROMGON
- **5 piece types** with unique movement patterns
- **Directional attacks** based on piece geometry
- **One-dimensional combat** - all pieces interact normally
- **Turn structure** - Move or attack, with rotation for some pieces

### 🔄 FLIP Mode ROMGON
- **Same 5 piece types** but with dual states
- **Enhanced attack patterns** when flipped (omnidirectional)
- **Two-dimensional combat** - flipped vs unflipped realms
- **Expanded turn structure** - Move/attack + flip OR rotate

### New Strategic Dimensions

#### 1. **Dimensional Warfare**
```
Unflipped Realm          Flipped Realm
     ♦                      ♦🔄
     │                      │
Can only capture      Can only capture
unflipped pieces      flipped pieces
```

**Impact**: Players must decide which dimension to operate in, creating two parallel battlefields on the same board.

#### 2. **Power vs Vulnerability Trade-off**
- **Flipping** grants omnidirectional attack (6 hexes instead of piece-specific patterns)
- **BUT** flipped pieces exist in a separate combat dimension
- **Creates tactical dilemmas**: Flip for power but risk isolation?

#### 3. **Expanded Piece Utility**

**Original Game:**
- Square: Forward/side attacks only
- Rhombus: Diagonal attacks only  
- Circle: 2-hex range attacks
- Triangle: Rotatable directional attacks
- Hexagon: Rotatable multi-direction attacks

**FLIP Mode:**
- **All pieces** can become omnidirectional attackers
- Square/Rhombus/Circle **gain flip button access** (not just rotation-capable pieces)
- Creates 10 effective piece types (5 pieces × 2 states)

---

## Game Rules & Mechanics

### How to Enable FLIP Mode

1. **Start a game** (Play vs AI, Play vs Friend, or Multiplayer)
2. **Variants modal** appears with checkboxes:
   - Base Defense (dropdown)
   - Fog of War (checkbox)
   - **🔄 Flip Mode** (checkbox) ← Enable this
3. **Check FLIP Mode** box
4. Select time limit and start game

**Persistence**: Your FLIP Mode preference is saved in browser localStorage and persists across sessions.

### Basic Flip Mechanics

#### Starting State
- All pieces begin **unflipped** (normal state)
- Standard movement and attack patterns apply
- Combat works normally (all pieces can capture each other)

#### Flipping a Piece

**Requirements:**
- It's your turn
- You've selected a piece
- Piece hasn't moved or attacked yet this turn

**How to Flip:**
1. Click your piece
2. Panel appears with buttons: **FLIP**, KEEP, RELEASE (and rotation buttons for Triangle/Hexagon)
3. Click **FLIP** button
4. Piece gains 🔄 blue icon indicator
5. Turn ends automatically

**Result:**
- Piece enters flipped dimension
- Gains omnidirectional attack pattern (all 6 adjacent hexes)
- Can only interact with other flipped pieces

#### Attack Patterns

**Unflipped Pieces:**
- Square: 3 hexes (forward + 2 sides)
- Rhombus: 3 hexes (diagonals)
- Circle: 6 hexes (2-hex range in 3 directions)
- Triangle: 3 hexes (based on rotation)
- Hexagon: 3 hexes (based on rotation)

**Flipped Pieces (All Types):**
- **6 adjacent hexes** (omnidirectional)
- Ignores piece-specific patterns
- Same attack power regardless of piece type

### Dimensional Combat Rules

#### Core Rule: Dimension Separation
```
FLIPPED ──╳── UNFLIPPED
          Cannot interact
```

**What This Means:**
1. **Flipped piece** → Can ONLY capture other **flipped pieces**
2. **Unflipped piece** → Can ONLY capture other **unflipped pieces**
3. **Cross-dimensional attacks** → Illegal (piece passes through as if empty)

#### Strategic Implications

**Offensive Flipping:**
- Flip to gain omnidirectional attacks
- Threaten multiple enemy pieces at once
- Useful for breaking through defensive formations

**Defensive Flipping:**
- Flip to escape capture by unflipped enemies
- Hide in flipped dimension temporarily
- Force opponent to flip pieces to counter

**Tactical Flipping:**
- Create flipped "zones" that enemies must flip to contest
- Mix flipped/unflipped pieces for dimensional pressure
- Flip key pieces before opponent can respond

### Turn Structure Changes

#### Original Game Turn Options:
1. **Move** a piece
2. **Attack** with a piece
3. **Rotate** Triangle/Hexagon (if didn't move/attack)

#### FLIP Mode Turn Options:
1. **Move** a piece
2. **Attack** with a piece  
3. **Flip** a piece (ends turn)
4. **Rotate** Triangle/Hexagon (if didn't move/attack/flip)

**Restrictions:**
- Cannot flip AND rotate in same turn
- Cannot flip after moving or attacking
- Cannot move/attack after flipping
- One action per turn (plus optional rotation for non-flipped pieces)

### Visual Indicators

**Unflipped Pieces:**
- Normal appearance
- Standard piece images
- Original attack highlights

**Flipped Pieces:**
- **🔄 Blue icon** overlay (top-right corner)
- Same piece image but with flip indicator
- Omnidirectional attack highlights (6 hexes)

---

## Strategic Depth Analysis

### Why FLIP Mode Transforms the Game

#### 1. **Dual-Layer Board State**
The game board effectively becomes two boards occupying the same space:
- **Unflipped layer**: Traditional ROMGON gameplay
- **Flipped layer**: Enhanced attack patterns but isolated from normal pieces

**Strategic Complexity:**
- Must track piece distribution across both dimensions
- Control of one dimension doesn't guarantee control of the board
- Dimensional imbalances create tactical opportunities

#### 2. **Power Budget Redistribution**

**Original Game**: Power is fixed per piece type
- Strong pieces (Circle, Hexagon) dominate
- Weak pieces (Square) struggle

**FLIP Mode**: Power becomes dynamic
- ANY piece can become powerful (by flipping)
- Formerly weak pieces gain utility
- Creates rock-paper-scissors between dimensions

#### 3. **New Tactical Patterns**

**Dimensional Pinning:**
```
Enemy Triangle (unflipped) threatens your King
→ Flip your defender
→ Enemy Triangle can't capture (dimension mismatch)
→ King escapes
```

**Dimensional Trapping:**
```
You flip multiple pieces around enemy King
Enemy King (unflipped) can't capture flipped pieces
→ Flip your pieces to create cage
→ Force enemy to flip King (risky) or lose mobility
```

**Flip Chain Reactions:**
```
Player A flips piece → gains omnidirectional attack
Player B must flip counter-piece → now vulnerable to Player A's other flipped pieces
Player B flips MORE pieces → creates flipped zone
Player A's unflipped pieces no longer threaten that zone
→ Dynamic see-saw between dimensions
```

#### 4. **Resource Management Layer**

**Flip Timing** becomes a critical resource:
- **Too early**: Enemy adapts, you waste dimensional advantage
- **Too late**: Lose pieces before flipping
- **Never flip**: Forfeit omnidirectional power

**Dimension Distribution** requires careful planning:
- All pieces in one dimension → Vulnerable to dimensional isolation
- Balanced distribution → Maintain pressure in both dimensions
- Shift between dimensions mid-game → Create tactical surprise

---

## Advanced Strategies

### Opening Game (Early Flips)

**Aggressive Opening:**
- Flip forward pieces immediately
- Create omnidirectional pressure
- Force opponent into reactive flips
- **Risk**: Flipped pieces may become isolated if opponent doesn't flip

**Conservative Opening:**
- Keep pieces unflipped initially
- Develop normal positioning
- Wait for opponent to flip first
- Counter-flip strategically
- **Risk**: Opponent gains early positional advantage with flipped pieces

**Hybrid Opening:**
- Flip 1-2 key pieces (e.g., central squares)
- Maintain unflipped majority
- Test opponent's response
- **Benefit**: Flexibility to commit to either dimension

### Mid-Game (Dimensional Control)

**Flipped Majority Strategy:**
- Flip 60-70% of pieces
- Dominate flipped dimension
- Force opponent to flip or lose relevance
- **Counter**: Opponent focuses on capturing your unflipped pieces

**Unflipped Majority Strategy:**
- Keep 60-70% pieces unflipped
- If opponent flips heavily, you attack their unflipped pieces freely
- Create "safe zones" opponent can't contest
- **Counter**: Opponent's flipped pieces gain positional superiority

**Balanced Distribution:**
- Maintain 50/50 split
- Contest both dimensions equally
- React to opponent's dimensional shifts
- **Benefit**: Flexible response to any strategy
- **Drawback**: No dimensional advantage

### End-Game (Flip Tactics)

**Flip Sacrifice:**
- Flip a piece to draw opponent's flipped pieces away
- Attack opponent's unflipped pieces with your unflipped forces
- Trade dimensional presence for positional gain

**Dimension Compression:**
- Flip multiple pieces near opponent's King
- Create omnidirectional threat web
- Force King into corner (can't escape through flipped pieces unless King flips)

**Flip Reservation:**
- Save flip ability for critical moment
- When opponent commits to one dimension, flip at last second
- Surprise dimensional shift wins positional battles

---

## Piece-Specific FLIP Strategies

### Square (Weakest → Most Improved)

**Original**: Forward + side attacks (3 hexes)  
**Flipped**: Omnidirectional (6 hexes) - **100% power increase!**

**Strategy:**
- Squares gain MOST from flipping
- Flip squares aggressively in opening
- Use as flipped "anchors" for map control
- Opponent must commit flipped pieces to remove

### Rhombus (Diagonal → Omnidirectional)

**Original**: 3 diagonal hexes  
**Flipped**: 6 hexes (adds forward/backward attacks)

**Strategy:**
- Flipping fills attack gaps (forward/backward)
- Great for controlling key hexes
- Flip when positioned in board center
- Unflipped Rhombuses good for diagonal pressure

### Circle (Already Strong → Different Strong)

**Original**: 2-hex range (6 hexes total, but not all adjacent)  
**Flipped**: 6 adjacent hexes (loses range, gains coverage)

**Strategy:**
- Flip trade-off: Range for adjacent coverage
- Keep unflipped for long-range attacks
- Flip when in close combat situations
- Circle's power remains high in both states

### Triangle (Rotatable → Rotatable + Flippable)

**Original**: 3 directional hexes + rotation  
**Flipped**: 6 hexes (but can't rotate after flipping)

**Strategy:**
- Rotation vs Flip decision every turn
- Flip if rotation won't help
- Keep unflipped for positional flexibility
- Flipped Triangles lose rotation advantage

### Hexagon (Most Flexible)

**Original**: Multiple directions + rotation  
**Flipped**: Omnidirectional (6 hexes) but no rotation

**Strategy:**
- Hexagon already versatile unflipped
- Flip for guaranteed 6-hex coverage
- Unflipped Hexagon can rotate for unexpected angles
- Flip when rotation options are limited

---

## Common Mistakes & How to Avoid

### ❌ Mistake 1: Flipping Everything
**Problem**: All your pieces exist in flipped dimension  
**Consequence**: Opponent ignores your flipped pieces, captures your unflipped King easily

**Solution**: Maintain 30-40% unflipped pieces minimum. Flip strategically, not automatically.

### ❌ Mistake 2: Never Flipping
**Problem**: Opponent flips aggressively, gains omnidirectional control  
**Consequence**: Your pieces are outmaneuvered by flipped omnidirectional attacks

**Solution**: Flip at least 2-3 pieces in response. Contest flipped dimension to prevent opponent's free reign.

### ❌ Mistake 3: Flipping After Moving
**Problem**: Pieces that moved/attacked can't flip same turn  
**Consequence**: Wasted moves, pieces left vulnerable in wrong dimension

**Solution**: Decide flip vs move BEFORE taking action. If flip is strategic, do it before moving.

### ❌ Mistake 4: Flipping the King Too Early
**Problem**: Flipped King can't be defended by unflipped pieces  
**Consequence**: Enemy flips 1-2 pieces, immediately threatens King in isolated dimension

**Solution**: Keep King unflipped until late game. Flip King ONLY if surrounded by flipped defenders.

### ❌ Mistake 5: Ignoring Dimensional Balance
**Problem**: All pieces in one dimension  
**Consequence**: Opponent dominates other dimension unopposed

**Solution**: Check dimensional distribution every 3-4 turns. Maintain presence in both dimensions.

---

## FLIP Mode vs Standard Game Comparison

| Aspect | Standard Game | FLIP Mode |
|--------|---------------|-----------|
| **Piece States** | 1 per piece (5 total) | 2 per piece (10 total) |
| **Attack Patterns** | Fixed per piece type | Dynamic (unflipped = normal, flipped = omni) |
| **Combat Rules** | All pieces can capture all pieces | Dimension-locked (flipped vs flipped only) |
| **Strategic Depth** | Positioning + piece type matchups | + Dimensional control + flip timing |
| **Weak Piece Utility** | Square/Rhombus limited | Square/Rhombus can become powerful via flip |
| **Turn Complexity** | Move/Attack/Rotate | + Flip decision (rotate XOR flip) |
| **Board Control** | Single-layer | Dual-layer (flipped + unflipped) |
| **Late Game** | Piece count advantage wins | Dimensional advantage can outweigh piece count |
| **Skill Ceiling** | High | **Very High** (adds dimensional strategy layer) |

---

## Frequently Asked Questions

### Q: Can I unflip a piece?
**A:** No. Once flipped, pieces remain flipped for the rest of the game. Flip is a permanent state change.

### Q: Can a flipped piece capture an unflipped piece?
**A:** No. Flipped pieces can ONLY capture other flipped pieces. Cross-dimensional capture is illegal.

### Q: What happens if I flip all my pieces and opponent stays unflipped?
**A:** Your pieces can't capture opponent's pieces (dimension mismatch). Opponent can capture your King if it's unflipped. Very risky strategy!

### Q: Can I flip and rotate in the same turn?
**A:** No. You can flip OR rotate, not both. This is a strategic trade-off for Triangle/Hexagon pieces.

### Q: Do flipped pieces move differently?
**A:** No. Movement is unchanged. Only ATTACK patterns become omnidirectional when flipped.

### Q: Is FLIP Mode always enabled?
**A:** No! It's an optional variant. You must check the "🔄 Flip Mode" checkbox in the variants menu before starting the game.

### Q: Can I see which pieces are flipped?
**A:** Yes. Flipped pieces have a **🔄 blue icon** overlay in the top-right corner of the piece.

### Q: Does the AI understand FLIP Mode?
**A:** Yes. The AI evaluates flip decisions and can flip pieces strategically. Higher difficulty AIs use FLIP Mode more effectively.

### Q: Can I flip an enemy piece?
**A:** No. You can only flip your own pieces on your turn.

### Q: What happens if I checkmate with a flipped piece?
**A:** Checkmate works across dimensions! If opponent's King is unflipped and your flipped piece delivers checkmate (because King can't escape using unflipped pieces), you win.

---

## Tips for New FLIP Mode Players

### 🎯 Beginner Tips

1. **Start Simple**: Flip 1-2 pieces per game to learn the mechanic
2. **Flip Weak Pieces First**: Squares and Rhombuses benefit most from omnidirectional attacks
3. **Watch the King**: Never leave your King isolated in either dimension
4. **Mirror Opponent**: If opponent flips, flip a counter-piece to contest that dimension
5. **Use Visual Indicators**: Track 🔄 icons to know dimensional distribution

### 🧠 Intermediate Tips

1. **Flip for Position**: Use flip to control key hexes (center, defensive zones)
2. **Dimensional Bait**: Flip a piece to draw enemy flips, then exploit other dimension
3. **Flip Timing**: Flip BEFORE opponent expects it to gain surprise advantage
4. **Count Dimensions**: Mental note of flipped vs unflipped count (yours and opponent's)
5. **Flip Recovery**: If opponent heavily flips, DON'T panic-flip everything—strategic flips only

### 🏆 Advanced Tips

1. **Dimensional Pressure**: Maintain 2-3 pieces more in one dimension to pressure opponent
2. **Flip Sequencing**: Order of flips matters—flip support pieces before offensive pieces
3. **Endgame Flips**: Late-game flips can trap opponent's King in dimensional cage
4. **Flip Feints**: Threaten flips without executing to force opponent's defensive flips
5. **Asymmetric Dimension**: Win one dimension decisively, survive in the other

---

## Conclusion

**FLIP Mode** transforms ROMGON from a complex positioning game into a multi-dimensional strategic masterpiece. By introducing dimensional combat and omnidirectional attack potential, every piece becomes dynamically powerful, and every decision carries dimensional consequences.

### Why Play FLIP Mode?

✅ **Adds replay value** - Same board setup plays completely differently  
✅ **Balances pieces** - Weak pieces (Square) gain utility  
✅ **Increases skill ceiling** - Dimensional mastery separates good players from great  
✅ **Creates new strategies** - Dimensional control, flip timing, cross-dimensional tactics  
✅ **Maintains simplicity** - Easy to learn (just press FLIP), hard to master  

### When to Play FLIP Mode?

- **Experienced players** looking for new challenges
- **Casual players** who want dynamic gameplay changes
- **Competitive matches** where both players know the mechanics
- **Experimenting** with new strategies and tactics

### When NOT to Play FLIP Mode?

- **First-time ROMGON players** (learn standard rules first)
- **Quick games** where you want simple, fast gameplay
- **Teaching new players** (introduce after they grasp base game)

---

**Enable FLIP Mode in your next game and discover a new dimension of ROMGON strategy!** 🔄🎮

---

## Version History

- **v0.3.0** (November 2025): FLIP Mode fully implemented as optional variant
- **v0.2.8** (October 2025): FLIP mechanic core implementation
- **v0.2.9** (October 2025): Dimensional combat rules added
- **v0.3.0** (November 2025): Variant toggle, universal piece access, UI polish

---

**Last Updated**: November 9, 2025  
**Game Version**: ALPHA v0.3.0  
**Mode Status**: ✅ Fully Implemented & Tested

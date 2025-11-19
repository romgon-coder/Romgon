# Flip Mode Mechanics

Advanced game variant with omnidirectional attacks and tactical depth.

## 📋 Table of Contents

- [What is Flip Mode?](#what-is-flip-mode)
- [Core Mechanics](#core-mechanics)
- [Flip State System](#flip-state-system)
- [Dead Zone Fortress](#dead-zone-fortress)
- [Tactical Implications](#tactical-implications)
- [AI Understanding](#ai-understanding)
- [Strategy Guide](#strategy-guide)

## 🔄 What is Flip Mode?

Flip Mode is an advanced ROMGON variant that adds a **flip state dimension** to gameplay:

- **Standard Mode:** Pieces use directional movement patterns
- **Flip Mode:** Pieces can flip to gain **omnidirectional 6-hex attacks**
- **Flip State Matching:** Flipped pieces can ONLY attack other flipped pieces
- **Dead Zone Fortress:** Center positions become strategic strongholds
- **Tactical Depth:** Adds escape mechanics and positional complexity

### Enabling Flip Mode

```javascript
// In game creation
const game = createGame({
  flipModeEnabled: true,
  // ... other options
});
```

**UI Toggle:**
- Game setup screen → "Flip Mode" checkbox
- PVP mode → Available in action panel
- Custom games → Optional variant

## ⚙️ Core Mechanics

### 1. Omnidirectional Attack

When a piece is **flipped**, it attacks **all 6 adjacent hexes**:

```
Standard Square Movement:
    [ ]
 [ ][S][ ]
    [ ][ ]
(L-shaped pattern)

Flipped Square Movement:
 [X][X][X]
[X][S][X]
 [X][X][X]
(6-hex omnidirectional)
```

**Implementation:**
```javascript
// From romgon-real-engine.js:114
if (flipModeEnabled && piece.flipped) {
    const adjacent = ADJACENCY_MAP[fromPos] || [];
    targets = adjacent.map(pos => {
        const [r, c] = pos.split('-').map(Number);
        return [r, c];
    });
}
```

### 2. Flip State Matching

**Critical Rule:** Pieces can ONLY attack pieces with **matching flip state**:

| Attacker State | Target State | Can Attack? |
|----------------|--------------|-------------|
| Unflipped      | Unflipped    | ✅ Yes      |
| Flipped        | Flipped      | ✅ Yes      |
| Unflipped      | Flipped      | ❌ No       |
| Flipped        | Unflipped    | ❌ No       |

**Code:**
```javascript
// From romgon-real-engine.js:91-96
if (flipModeEnabled) {
    const attackerFlipped = piece.flipped || false;
    const targetFlipped = targetPiece.flipped || false;
    if (attackerFlipped !== targetFlipped) {
        return; // Cannot attack - flip state mismatch
    }
}
```

### 3. Flip Actions

**Three Flip Buttons:**

**FLIP:**
- Toggle piece flip state
- Changes from unflipped → flipped OR flipped → unflipped
- Can be combined with rotation
- Consumes turn

**KEEP:**
- Maintain current flip state
- Used when rotating
- Preserves flip state through rotation

**RELEASE:**
- Cancel flip action
- Return to unflipped state
- Revert changes

**Action Flow:**
```
1. Select piece
2. (Optional) Rotate piece
3. Click FLIP button
   - Piece now flipped
   - Shows omnidirectional highlights
4. Options:
   a) KEEP - Confirm flip
   b) RELEASE - Cancel flip
   c) Move to destination
```

## 🏰 Dead Zone Fortress

### Dead Zone Positions
```
Center Row (Row 3):
  3-3, 3-4, 3-5
```

### Dead Zone Properties

**In Flip Mode:**
- **Fortress Strategy:** Pieces in dead zone can flip to become invulnerable to unflipped attackers
- **Tactical Value:** +30-50 points in AI evaluation
- **Circle Restriction:** Circles CANNOT enter dead zone (would get stuck)
- **Escape Mechanic:** Flip to escape from unflipped threats

**Code:**
```javascript
// From romgon-real-engine.js:186-188
if (flipModeEnabled && DEAD_ZONE.has(playerRhombus.pos) && !playerRhombus.flipped) {
    score += 50; // Can flip to become safe from unflipped attackers
}
```

### Dead Zone Strategy

**Defensive Use:**
```
1. Move rhombus/circle to dead zone (3-4)
2. Keep unflipped initially
3. When threatened:
   - Flip to flipped state
   - Unflipped attackers can't harm you
   - Creates safe fortress position
```

**Offensive Use:**
```
1. Position flipped pieces around dead zone
2. Coordinate flipped attackers
3. Control center with omnidirectional threats
4. Force opponent into flip state disadvantage
```

### Circle Dead Zone Rule

**Why Circles Can't Enter:**
```javascript
// From frontend index.html:29945-29953
if (flipModeEnabled && pieceType === 'circle') {
    // Dead zone positions
    const deadZone = new Set(["3-3", "3-4", "3-5"]);

    if (deadZone.has(`${targetRow}-${targetCol}`)) {
        return; // Circle cannot enter dead zone
    }
}
```

**Reason:** Circles have zone-based movement. Dead zone would trap circle with no escape routes in flip mode.

## 🎯 Tactical Implications

### 1. Escape Tactics

**Scenario: Unflipped piece under attack**
```
Before Flip:
[B][ ][W]  B = Black unflipped attacker
[ ][W][ ]  W = White unflipped piece (threatened)
[ ][ ][ ]

After White Flips:
[B][ ][W*]  W* = White flipped (safe!)
[ ][W][ ]   B cannot attack W* (flip state mismatch)
[ ][ ][ ]
```

### 2. Coordinated Attacks

**Flipped pieces support each other:**
```
[W*][B*][ ]  W* = White flipped
[W*][B ][W*] B* = Black flipped (under attack)
[ ][ ][ ]    B  = Black unflipped (safe from W*)
```

Black's flipped piece is under attack from 3 white flipped pieces!

### 3. Isolation Penalty

**AI Evaluation:**
```javascript
// From romgon-real-engine.js:217-224
if (playerFlipped > 0 && playerFlipped < playerPieces.length) {
    const minGroup = Math.min(playerFlipped, playerUnflipped);
    const maxGroup = Math.max(playerFlipped, playerUnflipped);
    if (minGroup === 1 && maxGroup > 3) {
        score -= 20; // Isolated piece in wrong flip state
    }
}
```

**Why:** A single flipped piece among many unflipped (or vice versa) is vulnerable and unsupported.

### 4. Omnidirectional Value

**AI Bonus:**
```javascript
// From romgon-real-engine.js:198-202
playerPieces.forEach(piece => {
    if (piece.flipped) {
        score += 10; // Flipped pieces have 6-direction attack
    }
});
```

**Value:** Flipped pieces control more hexes → Better mobility → Tactical advantage

## 🤖 AI Understanding

### Flip Mode Evaluation

The AI evaluates flip mode with these factors:

**1. Material (Base):**
```
Rhombus: 1000
Triangle: 6
Hexagon: 5
Circle: 4
Square: 3
```

**2. Flip Mode Bonuses:**
```
Flipped piece: +10 (omnidirectional)
Dead zone (rhombus/circle, unflipped): +30
Dead zone (rhombus/circle, flipped): +15
Isolated flip state: -20
```

**3. Positional:**
```
Center control: +3 per hex
Mobility: +2 per legal move
Rhombus advancement: +5 per column
```

**4. Tactical:**
```
Threats: -0.5 * piece value
Attacking: +0.5 * target value
```

### AI Move Selection

```javascript
// AI considers flip mode in move generation
const moves = generateAllMoves(board, playerColor, flipModeEnabled);

// Each move evaluated with flip awareness
moves.forEach(move => {
    const newBoard = applyMove(board, move);
    const score = evaluatePosition(newBoard, playerColor, flipModeEnabled);
    // Includes flip bonuses, dead zone value, etc.
});
```

### Backend API

```javascript
POST /api/ai/move
{
  "board": { "3-4": { color: "white", type: "rhombus", flipped: false }, ... },
  "playerColor": "white",
  "flipModeEnabled": true,  // ← Critical!
  "difficulty": "hard"
}

Response:
{
  "move": { from: "3-4", to: "3-5", isCapture: false },
  "evaluation": 1250.5,
  "reasoning": "Rhombus to dead zone fortress (+50 points)"
}
```

## 📚 Strategy Guide

### When to Flip

**✅ Flip when:**
- Escaping from unflipped attackers
- Gaining omnidirectional attack advantage
- Coordinating with other flipped pieces
- Entering/controlling dead zone
- Setting up multi-piece attacks

**❌ Don't flip when:**
- You're the only flipped piece (isolation penalty)
- Opponent has many flipped pieces (creates targets for them)
- You need piece-specific directional movement
- Flip state mismatch helps your defense

### Opening Strategy

**Standard Opening (Flip Mode):**
```
1. Develop pieces normally (unflipped)
2. Control center hexes
3. Keep pieces in same flip state initially
4. Flip reactively (escape or attack)
```

**Aggressive Opening:**
```
1. Flip 2-3 pieces early
2. Create flipped piece group
3. Omnidirectional pressure
4. Force opponent to flip defensively
```

### Midgame Tactics

**Flip State Coordination:**
```
Good: [W*][W*][W*]  All flipped - coordinated
      [ ][ ][ ]

Bad:  [W*][W ][W ]  One flipped - isolated
      [ ][ ][ ]
```

**Dead Zone Control:**
```
1. Position rhombus in 3-4 (dead zone)
2. Keep unflipped
3. Surround with unflipped pieces
4. If attacked by unflipped: Keep formation
5. If attacked by flipped: Flip rhombus
```

### Endgame

**Pushing Rhombus:**
```
Scenario: Few pieces left, need to advance rhombus

If opponent pieces are unflipped:
  → Keep your rhombus unflipped (can be attacked)
  → OR flip rhombus + flip supporting pieces

If opponent pieces are flipped:
  → Flip rhombus + supporting pieces
  → Omnidirectional defense
```

## 🧪 Advanced Techniques

### Flip State Traps

**Setup:**
```
1. Create group of flipped pieces
2. Leave one unflipped piece exposed (bait)
3. Opponent attacks with unflipped piece
4. Opponent now has unflipped piece near your flipped group
5. Opponent piece is safe from your flipped pieces!
```

**Counter:** Maintain flip state discipline, don't take bait

### Dead Zone Fortress

**Maximum Defense:**
```
Board State:
[ ][ ][B][B][ ][ ]
[ ][B][W*][ ][B][ ]  W* in dead zone, flipped
[ ][ ][B][B][ ][ ]   B = Black unflipped pieces

White is SAFE! Black cannot attack different flip state.
```

**Breaking:** Black must flip pieces to attack, but then White can flip others for defense.

### Flip State Switching

**Tactic:**
```
Turn 1: Flip piece A (now flipped)
Turn 2: Opponent responds
Turn 3: Flip piece A again (now unflipped)

Result: Changed "dimension" - previously safe opponent pieces now vulnerable
```

## 📊 Statistics

### Flip Mode Impact

**Move Count:**
```
Standard Mode: ~13 average moves per position
Flip Mode: ~11 average moves per position
(Reduced due to flip state matching)
```

**AI Evaluation Differences:**
```
Same position:
  Standard Mode: +100 points
  Flip Mode: +500 points (with optimal flip usage)

Difference: 400+ points from flip tactics!
```

### Dead Zone Value

**AI Scoring:**
```
Rhombus in dead zone (unflipped): +50
Rhombus in dead zone (flipped): +15
Circle in dead zone: Cannot enter
Other pieces in dead zone: +30
```

## 🔍 Technical Details

### Adjacency Map

```javascript
// 6-hex adjacency for each position
const ADJACENCY_MAP = {
  '3-4': ['3-3', '2-3', '2-4', '3-5', '4-4', '4-5'],
  // ... all 49 positions mapped
};
```

### Flip State Data

**DOM Attribute:**
```html
<div class="piece" data-flipped="true">
  <!-- Piece with flipped state -->
</div>
```

**Backend Board Object:**
```javascript
{
  '3-4': {
    color: 'white',
    type: 'rhombus',
    flipped: true  // ← Flip state
  }
}
```

### API Integration

**Frontend → Backend:**
```javascript
// buildBoardStateFromDOM() must extract flip state
const piece = {
  color: pieceColor,
  type: pieceType,
  flipped: element.dataset.flipped === 'true'  // Critical!
};
```

## ❓ FAQ

**Q: Can I flip multiple times per turn?**
A: No, flip consumes your turn like a move.

**Q: Does rotation change flip state?**
A: No, rotation is independent. Use KEEP to maintain flip state while rotating.

**Q: Can flipped pieces capture unflipped?**
A: No! Flip state must match for attacks.

**Q: Why can't circles enter dead zone?**
A: Zone-based movement would trap them with no escape.

**Q: How does AI know about flip mode?**
A: `flipModeEnabled` parameter passed through API. Backend engine evaluates flip tactics.

**Q: What's better: flipped or unflipped?**
A: Situational. Flipped = more mobility (+10). Unflipped = can coordinate with unflipped pieces.

**Q: Can I win with all flipped pieces?**
A: Yes, but opponent can flip to attack. Coordination matters more than flip state.

---

**Next Steps:**
- Practice flip mode at https://romgon.net
- Study [AI Implementation](AI-Implementation) for evaluation details
- Read [Game Rules](Game-Rules) for base mechanics

**Related Pages:**
- [Home](Home)
- [Game Rules](Game-Rules)
- [AI Implementation](AI-Implementation)
- [Piece Movement Patterns](Piece-Movement-Patterns)

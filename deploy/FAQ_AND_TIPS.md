# Romgon FAQ & Tips Guide

*Your comprehensive guide to mastering Romgon - from first moves to advanced tactics*

---

## 📚 Table of Contents

1. [Game Basics](#-game-basics)
2. [Pieces & Movement](#-pieces--movement)
3. [Board & Zones](#-board--zones)
4. [Special Rules & Win Conditions](#-special-rules--win-conditions)
5. [Base Defense System](#-base-defense-system)
6. [Tips for Beginners](#-tips-for-beginners)
7. [Advanced Strategy](#-advanced-strategy)
8. [Common Mistakes](#-common-mistakes)
9. [Did You Know?](#-did-you-know)

---

## 🎮 Game Basics

### Q: What is Romgon?
**A:** Romgon is a strategic hexagonal board game where each player controls **7 pieces** (2 Triangles, 2 Squares, 1 Rhombus, 1 Circle, 1 Hexagon). The goal is to move your rhombus to the opponent's base or trap their rhombus.

### Q: How do I win?
**A:** There are three ways to win:
1. **Base Capture**: Move your rhombus to the opponent's base (White: row 3, column 8 / Black: row 3, column 0)
2. **Deadlock**: Trap the opponent's rhombus with no legal moves while under attack
3. **Opponent Resignation**: Your opponent runs out of legal moves (draglock) or resigns

### Q: Who moves first?
**A:** Black always moves first in Romgon.

### Q: Can I undo moves?
**A:** Yes! You can use undo/redo freely in local games. However, undo is disabled in online matches and tournament play.

### Q: Is Romgon like chess?
**A:** Yes and no. Romgon has comparable complexity to chess (state space: 10²⁵ to 10³² positions, game tree: 10⁸⁰ to 10¹²⁰ possible games), but with unique hexagonal movement and **no draws** - repetition is a loss!

---

## 🎭 Pieces & Movement

### Q: What pieces are in the game?
**A:** Each player has 7 pieces:
- **2 Triangles** 🔺: Orientation-dependent movement (6 unique patterns)
- **2 Squares** ⬜: Orthogonal movement (adjacent hexes)
- **1 Rhombus** 💎: Must reach opponent's base, special rules apply
- **1 Circle** ⭕: Moves within zones, uses gateways
- **1 Hexagon** ⬡: Rotatable (3 unique movement patterns)

### Q: How does the Triangle move?
**A:** The Triangle has **6 unique movement patterns** - one for each orientation it can face. Unlike other pieces, each orientation has completely different moves (no repeats). After moving (not attacking), you can rotate it left or right to change its orientation.

**TIP:** Triangles are your most versatile tactical pieces. Master their orientations to unlock unexpected attacks!

### Q: What makes the Rhombus special?
**A:** The Rhombus is your **king piece**:
- Must reach the opponent's base to win
- Cannot capture other rhombuses
- Cannot be captured by opponent's rhombus
- Has a special diagonal move between Dead Zone and Inner Perimeter (cannot capture while using this move)
- Cannot voluntarily move into deadlock (unless capturing the attacking piece)

### Q: How does the Circle work?
**A:** The Circle is confined to **zones** and uses **gateways** to move between them:
- Moves freely within its current perimeter zone
- Cannot jump over friendly pieces
- Uses gateway hexes to change zones (ends turn when changing zones)
- Strategic for controlling territory

### Q: Can pieces rotate?
**A:** Only **Triangles** and **Hexagons** can rotate:
- Rotation allowed **after moving** (not after attacking)
- Rotate left (counterclockwise) or right (clockwise)
- Rotation counts as part of your turn

### Q: What's the difference between moving and attacking?
**A:** 
- **Moving**: Relocate to an empty hex
- **Attacking/Capturing**: Move to a hex occupied by an opponent's piece, removing it from the board
- **Key Rule**: You can only rotate after moving, NOT after attacking

---

## 🗺️ Board & Zones

### Q: How big is the board?
**A:** The board has **51 hexagonal spaces** arranged in 7 rows (labeled 0-6), with each hex identified by coordinates (e.g., "3-4" means row 3, column 4).

### Q: What are the zones?
**A:** The board is divided into concentric zones:
1. **Dead Zone** (center): The innermost hexes
2. **Inner Perimeter**: Surrounds the Dead Zone
3. **Middle Perimeter**: Mid-board territory
4. **Outer Perimeter**: Edge hexes, includes the bases

**Strategic Tip**: The Circle moves within zones and is key to controlling territory. Zone boundaries create natural defensive lines!

### Q: Where are the bases?
**A:**
- **Black's base**: Row 3, Column 0 (left side)
- **White's base**: Row 3, Column 8 (right side)

These are the goal hexes each player's rhombus must reach.

---

## ⚡ Special Rules & Win Conditions

### Q: What is "Deadlock"?
**A:** Deadlock occurs when a rhombus is under attack and has **no legal moves**. This is an instant win for the attacker!

**Example**: If your opponent's rhombus is surrounded and you attack it with no escape, you win immediately.

### Q: What is "Draglock"?
**A:** Draglock is when a player has **no legal moves at all** with any piece. If it's your turn and you cannot move, you must resign - you lose!

**Prevention Tip**: Always leave yourself escape options. Never sacrifice mobility for temporary gains.

### Q: What happens if I repeat the same position three times?
**A:** **YOU LOSE!** This is Romgon's most unique rule. Unlike chess where repetition is a draw, in Romgon **threefold repetition is an automatic loss**. The game detects this and warns you visually.

**Strategic Implication**: You cannot infinitely defend by repeating moves. Games MUST progress toward a conclusion.

### Q: What is the "Five-fold Shuttle" rule?
**A:** If you shuttle a piece back and forth (A→B→A) **five times** with the same piece, you lose. This prevents boring shuttle stalemates.

### Q: What is an "Escape Race"?
**A:** When **only rhombuses remain** on the board, Base Defense is disabled and it becomes a pure race to the goal. First rhombus to reach the opponent's base wins!

**Tip**: Count moves carefully - even one tempo advantage can decide the game in an Escape Race.

---

## 🛡️ Base Defense System

### Q: What is Base Defense?
**A:** Base Defense prevents easy wins by requiring you to deal with defenders before entering the enemy base. There are **two variants**:

### Variant 1: Original (Rhombus Defense Only)
- **Rule**: Only the opponent's rhombus (positioned on their own base) can block your rhombus from entering
- **Best for**: Casual games, faster-paced play
- **Strategy**: If the defending rhombus is away from base, your rhombus can enter and win

### Variant 2: Shape Defense
- **Rule**: **Any piece** attacking the base hex prevents the opponent's rhombus from entering until eliminated or moved
- **Best for**: Tactical games, deeper strategy
- **Strategy**: You can defend with Squares, Triangles, etc. - creates more complex endgames

### Q: Which Base Defense variant should I use?
**A:** 
- **New players**: Start with **Original** (simpler, faster games)
- **Experienced players**: Try **Shape Defense** (more tactical depth, fortress endgames)
- **Tournament play**: Usually **Shape Defense** for competitive fairness

You can toggle this in the game settings!

---

## 🌟 Tips for Beginners

### 1. **Control the Center**
The Dead Zone and Inner Perimeter are the most important areas. Controlling the center gives you:
- More mobility options
- Better piece coordination
- Defensive depth

### 2. **Protect Your Rhombus**
Your rhombus is precious:
- Keep it behind your other pieces early game
- Don't rush it forward without support
- Never let it get surrounded (deadlock = instant loss!)

### 3. **Learn Triangle Orientations**
Triangles are the most powerful pieces but also the most complex:
- Practice with each orientation in safe positions
- Rotate after moving to set up threats
- Remember: 6 orientations = 6 completely different move sets

### 4. **Use Squares for Board Control**
Squares move orthogonally (like chess rooks but 1 space):
- Excellent for creating defensive lines
- Can control key gateway hexes
- Great for early-game development

### 5. **Don't Ignore the Circle**
Beginners often undervalue the Circle:
- Controls entire zones once positioned
- Difficult to remove from strong zones
- Can create "safe havens" for retreating pieces

### 6. **Avoid Repetition**
Remember: **repetition = loss**
- Don't shuttle pieces back and forth
- Always have a plan to advance position
- If you feel stuck, change your approach before repeating

### 7. **Think Two Moves Ahead**
Early game branching factor: **20-40 legal moves**
- You can't calculate everything, but think 2-3 moves ahead
- Look for opponent's threats
- Plan piece coordination, not just individual moves

### 8. **Practice Base Defense**
- Know which pieces can defend (based on your variant setting)
- Position defenders proactively
- Don't abandon your base until you're winning

---

## 🧠 Advanced Strategy

### Zugzwang
**Definition**: A position where any move worsens your position.

**How to create zugzwang**:
- Force opponent to move first in a locked position
- Create situations where all their moves expose weaknesses
- Common in endgames with limited pieces

### Opening Theory (Still Developing)
The game's opening book is expanding, but known principles:
- **Average moves per game**: 60-120
- **Early game**: 20-40 legal moves per position
- **Key openings**: Center control, symmetrical development, aggressive rhombus push

**Tip**: Opening theory is still being discovered - you can create your own!

### Fortress Endgames
When pieces blockade each other, creating a "fortress":
- **Base Defense (Shape)** prevents quick wins
- **Repetition rule** forces fortress-breaker to find new moves
- **Tactical puzzle**: Find the one breakthrough move

**Common fortress types**:
1. **Blockade**: All paths blocked, must sacrifice to break through
2. **Perimeter Defense**: Circle + Square controlling zones
3. **Deadlock Setup**: Setting up traps for opponent's rhombus

### Piece Value Estimation
(Approximate - context-dependent)

| Piece | Value | Notes |
|-------|-------|-------|
| **Rhombus** | Infinite | Lose it = lose game |
| **Triangle** | 5-7 | Most versatile, orientation-dependent |
| **Hexagon** | 4-6 | Rotatable, 3 patterns |
| **Square** | 3-4 | Reliable, orthogonal |
| **Circle** | 3-5 | Zone control specialist |

**Context matters**: A Circle in the Dead Zone may be worth more than a Triangle on the perimeter!

### Endgame Technique
**Midgame** (10-30 legal moves):
- Piece trades favor the attacker
- Simplify if ahead, complicate if behind

**Endgame** (2-10 legal moves):
- Count tempos (move advantage)
- Calculate forced sequences
- Watch for deadlock traps

**Escape Race** (only rhombuses):
- Pure calculation - count exact moves to goal
- Shortest path may not be best (blockade considerations)

### Computational Complexity
Romgon is classified as **EXPTIME-complete**:
- Solving Romgon is provably difficult
- No perfect strategy exists for human computation
- Deep calculation is valuable but limited

**Practical implication**: Trust intuition + calculation, not pure calculation alone.

---

## ❌ Common Mistakes

### 1. **Moving Without Purpose**
**Mistake**: Making moves that don't advance your plan
**Fix**: Every move should either:
- Improve piece position
- Create threats
- Defend against opponent's plan
- Control key territory

### 2. **Ignoring Opponent's Threats**
**Mistake**: Tunnel vision on your own plans
**Fix**: After every opponent move, ask:
- "What are they threatening?"
- "Can they deadlock my rhombus?"
- "Am I about to repeat a position?"

### 3. **Rushing the Rhombus**
**Mistake**: Pushing rhombus forward too early
**Fix**: 
- Develop other pieces first
- Clear the path with supporting pieces
- Only advance rhombus when safe

### 4. **Not Rotating**
**Mistake**: Forgetting Triangles and Hexagons can rotate
**Fix**: 
- After moving, consider rotation
- Rotation can unlock new attacks/defenses
- Think of rotation as part of the move

### 5. **Neglecting Base Defense**
**Mistake**: Leaving base undefended to attack
**Fix**:
- Keep at least one defender near base
- Position rhombus on base if using Original variant
- Have pieces ready to return for defense

### 6. **Creating Accidental Repetition**
**Mistake**: Repeating position 3 times = instant loss
**Fix**:
- Watch for visual repetition warnings
- Vary your moves even when defending
- Change piece positions slightly to avoid repeats

### 7. **Overvaluing Material**
**Mistake**: Sacrificing position for captures
**Fix**:
- Position > Material in many cases
- A well-placed Circle can beat two poorly-placed Squares
- Don't trade pieces unless it improves your position

### 8. **Not Using "Show All Moves"**
**Mistake**: Missing legal moves in complex positions
**Fix**:
- Toggle "Show All Moves" in settings
- Review all options before committing
- Especially important for Triangle orientations

---

## 🤯 Did You Know?

### Complexity Stats
- **State Space**: 10²⁵ to 10³² possible board positions (comparable to chess at ~10⁴⁴)
- **Game Tree**: 10⁸⁰ to 10¹²⁰ possible games (chess is ~10¹²³)
- **Branching Factor**:
  - Early game: 20-40 legal moves
  - Mid game: 10-30 legal moves
  - Endgame: 2-10 legal moves
- **Average Game Length**: 60-120 moves
- **Computational Complexity**: EXPTIME-complete (provably hard)

### Symmetry & Redundancy
The hexagonal board creates **natural symmetry** between White and Black, but asymmetric opening moves create unique games. Unlike chess, there are fewer redundant positions due to hexagonal geometry.

### No Draws!
Romgon is designed with **zero draws**:
- Threefold repetition = loss
- Five-fold shuttle = loss
- Draglock (no legal moves) = loss
- Escape race forces decisive result

**Result**: Every game must have a winner - no boring draws!

### Opening Book Still Growing
Unlike chess with centuries of opening theory, Romgon's opening book is still being developed. You can discover new openings and contribute to theory!

### Game Variants Available
- **Standard**: Full 7-piece game
- **Square Attack**: Only Squares and Rhombuses (simplified)
- **Blitz**: Timed games
- **Fog of War**: Limited visibility
- **King of the Hill**: Control the center to win

---

## 🛠️ Advanced Features

### Threat Analysis
- Real-time threat detection
- Highlights threatened pieces
- Deadlock warnings

### Repetition Detection
- Three-fold repetition tracking
- Visual warnings before you lose
- Move history review

### Statistics Dashboard
Track your performance:
- Win/loss records
- Piece statistics
- Move quality analysis
- Opening repertoire
- Tactical success rate

### Notation System
- **RPN**: Romgon Position Notation (save positions)
- **RMN**: Romgon Move Notation (record games)
- Import/export via clipboard
- Full game archiving

### Dark Mode
Switch between light/dark themes for comfortable play.

---

## 🎯 Final Tips

1. **Practice makes perfect**: Play against AI to learn piece movements
2. **Study endgames**: Most games are decided in endgame technique
3. **Learn from losses**: Review games to understand mistakes
4. **Experiment**: Try different openings and piece setups
5. **Join the community**: Share strategies and learn from others
6. **Use analysis tools**: Toggle "Show All Moves" and threat highlights
7. **Stay calm**: Complex positions are solvable with careful thought
8. **Have fun**: Romgon is meant to be enjoyed!

---

**Ready to play?** Visit [romgon.net](https://romgon.net) and start your journey to mastery!

*Last updated: January 2025*
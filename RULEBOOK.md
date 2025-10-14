# ROMGON Official Rulebook

_Last updated: October 12, 2025_

---

## 📋 Contents
1. Game Overview
2. Board Layout
3. Piece Types & Movement
4. Turn Structure
5. Special Rules
6. Victory Conditions
7. Notation System
8. Advanced Features
9. Game Modes & Variants
10. FAQ & Tips
11. Base Defense Rule

---

## 1. Game Overview
Romgon is a strategic hexagonal board game. Each player controls **7 pieces**:
- 5 unique types (Square, Triangle, Rhombus, Circle, Hexagon)
- **Plus 1 extra Triangle and 1 extra Square** (total: 2 Triangles, 2 Squares, 1 Rhombus, 1 Circle, 1 Hexagon per player)

The objective is to advance your rhombus to the opponent's base or create a deadlock (see below).

---

## 2. Board Layout
- **Hexagonal grid**: 7 rows (0-6), variable columns per row
- **Zones**:
  - Dead Zone (center)
  - Inner, Middle, Outer Perimeter
- **Coordinates**: Each hex is labeled (e.g., 3-4)

---

## 3. Piece Types & Movement
### Square
- Moves orthogonally (adjacent hexes)
- Attacks in same directions

### Triangle
- 6 unique movement patterns (one for each orientation)
- Can rotate left/right after moving (not after attacking)
- Each orientation has its own movement pattern (no repeats)

### Rhombus
- Must reach opponent's base to win (White: 3-8, Black: 3-0)
- Moves orthogonally
- Special diagonal move between Dead Zone and Inner Perimeter (cannot capture)
- Cannot capture other rhombuses
- Cannot move into deadlock (unless capturing attacker)

### Circle
- Moves within current perimeter zone
- Uses gateways to change zones (ends turn)
- Cannot jump friendly pieces

### Hexagon
- 6 orientations (rotatable)
- 3 unique movement patterns
- Can rotate left/right after moving

---

## 4. Turn Structure
- Black moves first
- One piece may move (and/or rotate) per turn
- Triangles/Hexagons may rotate after moving (not after attacking)
- Captures: Move to opponent's hex to capture
- Cannot move to a hex occupied by a friendly piece

---

## 5. Special Rules
- **Base Defense**: Rhombus at base blocks opponent's win
- **Deadlock**: Win if opponent's rhombus is under attack with no legal moves
- **Draglock**: Lose if you have no legal moves (must resign)
- **Escape Race**: When only rhombuses remain, first to goal wins (Base Defense disabled)
- **Three-fold Repetition**: Loss if same position occurs three times (no draws in Romgon)
- **Five-fold Shuttle**: Lose if you repeat a shuttle pattern (A→B→A) five times
- **Undo/Redo**: Allowed unless playing online or in tournament

---

## 6. Victory Conditions
- Move your rhombus to the opponent's base (3-0 for Black, 3-8 for White)
- Create a deadlock (opponent's rhombus is under attack with no legal moves)
- Opponent resigns or runs out of time (in timed modes)
- Loss by three-fold repetition
- Loss by five-fold shuttle

---

## 7. Notation System
- **RPN**: Romgon Position Notation (custom format)
- **RMN**: Romgon Move Notation (custom format)
- Clipboard integration for import/export
- Move history and game archiving supported

---

## 8. Advanced Features
- **Repetition Detection**: Three-fold repetition rule, visual warnings (loss, not draw)
- **Base Defense System**: Prevents early base captures, toggleable in settings
- **Threat Analysis**: Real-time threat and deadlock detection, highlights threatened pieces
- **Show All Moves**: Toggle to display all legal moves and rotations
- **Defense Highlights**: Highlights defended pieces, optional toggle
- **Dark Mode**: Switch between light/dark themes
- **Game Variants**: Blitz, Fog of War, King of the Hill (see Quick Reference)
- **Statistics Dashboard**: Win/loss, piece stats, move quality, opening repertoire, tactical success

---

## 9. Game Modes & Variants
- **Standard**: All 5 piece types
- **Square Attack**: Only Squares and Rhombuses
- **Blitz**: Timed games
- **Fog of War**: Limited visibility
- **King of the Hill**: Control the center
- **Custom**: User-defined setups

---

## 10. FAQ & Tips
- **Q: Can I rotate a triangle after attacking?**
  - A: No, rotation is only allowed after a non-capturing move.
- **Q: What happens if both rhombuses reach the goal at the same time?**
  - A: The first to reach wins; if simultaneous, the player who moved first wins.
- **Q: Can I undo moves?**
  - A: Yes, unless in online/tournament mode.
- **Q: How do I export my game?**
  - A: Use the export button in the analysis modal or copy RPN/RMN.
- **Q: Where can I find more strategy?**
  - A: See the Opening Book and Analysis Features in the main menu.

---

## 11. Base Defense Rule

- **Standard Rule:** Only the defending rhombus (on its own base) can prevent the opponent’s rhombus from entering the base. Other pieces do not block entry, even if their attack pattern covers the base.
    - If the defending rhombus is not present, the opponent’s rhombus may enter and win.
    - The game will prevent illegal rhombus escapes if the base is defended by the rhombus.

- **Fortress Variant:** Any piece (not just the rhombus) that attacks the base hex can prevent the opponent’s rhombus from entering, until it is eliminated or moved.
    - The pop-up for illegal movement will appear if the base is defended by any opponent piece’s attack pattern.
    - This variant allows for more complex blockades and defensive tactics.

---

Enjoy playing Romgon! For more, see the in-game help, analysis, and statistics dashboards.

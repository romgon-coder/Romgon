# ROMGON Theoretical Aspects

_Last updated: October 12, 2025_

---

## 1. State Space Complexity
- **Estimated legal positions:**
  - The board has 51 hexes (variable per row, with central symmetry).
  - Each player has 7 pieces (2 Triangles, 2 Squares, 1 Rhombus, 1 Circle, 1 Hexagon), all distinguishable by type and color.
  - Many hexes can be empty, and piece orientation (for triangles/hexagons) increases the number of unique positions.
  - **Rough estimate:** If all pieces are on the board, ignoring illegal overlaps and orientation, there are C(51,14) × 7! × 7! ≈ 10^18 arrangements. Including empty hexes, captures, and orientation, the true number is much higher—likely **10^25 to 10^32**.
  - **Comparison:** This is similar to or greater than chess, but less than Go.

## 2. Game Tree Complexity
- **Possible games:**
  - Each turn, a player can have 10–40 legal moves (varies by position, phase, and piece count).
  - Rotations and zone transitions (for triangles/hexagons/circles) add to the branching factor.
  - Average game length: 60–120 moves (30–60 per player), but some games can be much longer due to repetition and fortress defense.
  - **Estimated total possible games:** 10^80 to 10^120, with the upper bound due to move/rotation options and variant rules.
  - **Longest forced win:** Unknown, but likely hundreds of moves in fortress/blockade endgames.

## 3. Move Types and Branching
- **Move types:**
  - Standard moves (orthogonal, diagonal, zone transitions)
  - Rotations (Triangles, Hexagons; 6 orientations each)
  - Captures (including forced captures in some variants)
  - Special moves (gateway, base entry, deadlock escapes)
- **Branching factor:**
  - Early game: 20–40 (high due to open board and rotations)
  - Midgame: 10–30 (as pieces are exchanged and board closes)
  - Endgame: 2–10 (few pieces, but fortress/zugzwang can increase depth)
  - **Note:** Rotational moves and zone transitions make Romgon's branching factor more volatile than chess.

## 4. Symmetry and Redundancy
- **Hexagonal symmetry:**
  - The board has 6-fold rotational symmetry, but piece orientation and color break most symmetries.
  - Some positions are equivalent under rotation/reflection, but most are unique due to orientation and zone rules.
- **Redundancy:**
  - Many positions are theoretically possible but illegal (e.g., two pieces on one hex, impossible captures). These are excluded from the state space.
  - Symmetry can be used to reduce tablebase or AI search space, but only partially.

## 5. Draws, Forced Wins, and Zugzwang
- **No draws by repetition:**
  - Threefold repetition and fivefold shuttle are losses, not draws, increasing decisiveness.
- **Forced wins:**
  - Endgames with only rhombuses are often races; fortress variant allows for blockades and forced wins by attrition.
  - Zugzwang (forced loss by moving) is common, especially in endgames with few pieces.
  - Some positions are mutual zugzwang, where either player to move loses.
- **Deadlock and draglock:**
  - Deadlock (opponent's rhombus under attack with no legal moves) is a win.
  - Draglock (no legal moves at all) is a loss.

## 6. Opening Theory
- **Opening book:**
  - Still developing; few forced lines, but early mistakes can be decisive.
  - Central control, base defense, and piece development are key.
  - Early circle and hexagon moves can create threats or open gateways.
  - Triangles are flexible but vulnerable to poor orientation.
- **Typical themes:**
  - Control of the Dead Zone and gateways
  - Early base defense (especially in fortress variant)
  - Avoiding piece congestion and maximizing mobility

## 7. Endgame Theory
- **Rhombus endgames:**
  - Often races to the base or blockades; fortress variant increases defensive resources.
  - Sacrifices and forced shuttles are common.
  - Endgames can be very deep, with forced wins requiring precise calculation.
- **Piece value:**
  - Value of pieces changes in the endgame; triangles and hexagons become more valuable for their mobility and rotation.
  - Circles can be decisive in zone transitions.

## 8. Computational Complexity
- **Solving Romgon:**
  - Likely EXPTIME-complete (like chess and hex), due to large state and game tree complexity.
  - No known perfect play algorithm; AI uses heuristics, alpha-beta search, and Monte Carlo methods.
  - Tablebases for small endgames are possible but would be very large.
- **AI challenges:**
  - Rotational moves and zone transitions make evaluation and search more difficult than in chess.
  - Threat detection and deadlock/draglock recognition are nontrivial.

## Fortress, Blockade, and Endgame Rules in Romgon

Romgon endgames can sometimes reach rare situations where a lone rhombus is blocked by non-rhombus pieces (such as two squares), creating a fortress or blockade. There are several ways to resolve these situations, each with different strategic implications:

### 1. Repetition Rule (Default)
- If the same position occurs three times (threefold repetition), the player who repeats loses.
- This prevents endless blockades: if the advanced rhombus cannot break through, the defender can force a repetition and win.
- **Pros:** Familiar, fair, and prevents infinite games.
- **Cons:** Sometimes a player with a big advantage cannot win if blocked by a fortress.

### 2. Unstoppable Rhombus Wins (Variant)
- If a rhombus is one move away from the goal and cannot be stopped or captured by any legal move, that player wins immediately.
- This rewards the player who creates an unstoppable threat, even if they have lost all other pieces.
- **Pros:** Dramatic finishes, rewards skillful play, avoids fortress draws.
- **Cons:** Requires clear adjudication; may not be suitable for all players.

### 3. Last Non-Rhombus Piece Lost = Game Over (Optional Variant)
- If a player loses their last non-rhombus piece, they lose the game.
- **Pros:** Simple, prevents fortress problems entirely.
- **Cons:** Removes rhombus-only races and can feel abrupt.

### Recommendation
- The default Romgon rules use the repetition rule to resolve fortress/blockade situations.
- For advanced or tournament play, you may use the "Unstoppable Rhombus Wins" rule to reward decisive play and avoid unsatisfying blockades.
- The "Last Non-Rhombus Piece Lost" rule is not recommended for standard play, but may be used as a fast-paced variant.

**Players should agree on which rule to use before the game begins.**

---

Romgon is a deep, complex game with rich theoretical possibilities. Its combination of hex geometry, piece rotation, and unique rules creates a vast landscape for exploration, analysis, and creative play. Ongoing research may reveal new forced wins, opening traps, and endgame studies in the years to come!
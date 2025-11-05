# 📖 ROMGON - OFFICIAL RULEBOOK

**Version 1.0 | November 2025**

---

## 🎯 GAME OBJECTIVE

**Win the game by either:**
1. **Fortress Victory** - Move your Rhombus (♦️) to the opponent's base hex
2. **Elimination Victory** - Capture all opponent pieces
3. **Base Capture** - Control the opponent's goal hexagon

---

## 🎲 GAME SETUP

### Board Structure
- **Hexagonal Grid** with **7 rows (0-6)** with variable columns per row
- **4 Zones** from center outward:
  - **Dead Zone** (center hex)
  - **Inner Zone**
  - **Middle Zone**
  - **Outer Perimeter**
- **Coordinates**: Each hex labeled by row-column (e.g., 3-4)
- **2 Base Hexagons**: 
  - **Black Base**: 3-0
  - **White Base**: 3-8

### Starting Positions
**White (Bottom):**
- **Rhombus** ♦️: Row 3, Column 0 (center)
- **2 Triangles** ▲: Rows 2 & 4, Column 1
- **2 Squares** ■: Rows 1 & 5, Column 0
- **2 Hexagons** ⬡: Rows 2 & 4, Column 0
- **2 Circles** ●: Rows 0 & 6, Column 0

**Black (Top):**
- **Rhombus** ♦️: Row 3, Column 8 (center)
- **2 Triangles** ▲: Rows 2 & 4, Column 6
- **2 Squares** ■: Rows 1 & 5, Column 7
- **2 Hexagons** ⬡: Rows 2 & 4, Column 7
- **2 Circles** ●: Rows 0 & 6, Column 7

---

## ♟️ PIECE TYPES & ABILITIES

### 1. ♦️ RHOMBUS (King Piece)
**Movement:** 
- 6 standard moves (adjacent hexes)
- **+4 diagonal moves** (special movement)
- Can move diagonally from **Dead Zone to Inner Zone** and vice versa (no attack allowed)
- **Only piece that can jump/escape over other pieces**

**Special Abilities:**
- Can move to any adjacent hex (forward, backward, diagonal)
- **CANNOT attack other Rhombus** (Rhombus vs Rhombus = no capture)
- **WIN CONDITION**: Must reach opponent's base hex to win
  - **Black wins at**: 3-8 (White's base)
  - **White wins at**: 3-0 (Black's base)
- Most valuable piece - protect it!

**Attack Pattern:**
```
    ●
  ● ♦️ ●
    ●
```
*Plus 4 diagonal movements (no attack on diagonal jumps)*

---

### 2. ▲ TRIANGLE (Directional Attacker)
**Movement:** **3 moves/attacks** in directional pattern  
**Special Abilities:**
- **Rotation**: May rotate left or right **after moving** (in one turn)
- **CANNOT rotate after attacking** - turn ends immediately
- **Directional Attack**: Can only capture in the direction it's facing
- Attacks in 3 directions (front center, front-left, front-right)

**Attack Pattern (Example facing up):**
```
  ● ● ●
    ▲
```

**Rotation:**
- Press **A** to rotate LEFT (counter-clockwise)
- Press **D** to rotate RIGHT (clockwise)
- Can rotate after moving (not after attacking)

---

### 3. ⬡ HEXAGON (Area Controller)
**Movement:** **6 moves/attacks** in all directions  
**Special Abilities:**
- **Rotation**: May rotate left or right **after moving** (in one turn)
- **CANNOT rotate after attacking** - turn ends immediately
- **Area Attack**: Attacks in all 6 adjacent directions
- Most versatile piece for area control

**Attack Pattern:**
```
  ● ● ●
  ● ⬡ ●
  ● ● ●
```

**Rotation:**
- Same as Triangle (A/D keys or rotation buttons)
- Can rotate after moving (not after attacking)
- Strategic rotation for next turn positioning

---

### 4. ■ SQUARE (Omnidirectional Attacker)
**Movement:** **4 moves/attacks** in cardinal directions  
**Special Abilities:**
- **No Rotation Needed**: Attacks in 4 cardinal directions
- Strong attacker but limited compared to Hexagon
- Direct movement pattern

**Attack Pattern:**
```
    ●
  ● ■ ●
    ●
```

---

### 5. ● CIRCLE (Zone Jumper)
**Movement:** Moves **perimetrically between zones only**  
**Special Abilities:**
- **Zone Movement**: Can move to another zone from any hex in current zone
- **CANNOT move to or attack Dead Zone**
- **Blocked by friendly pieces**: Friendly pieces block Circle's path on zones
- **Zone-based positioning**: Must follow zone perimeters
- Strategic for zone control and positioning

**Movement Pattern:**
- Can jump between zones following perimeter paths
- Blocked by friendly pieces in path
- Cannot enter Dead Zone (center)
- Useful for flanking along zone edges

---

## 🎮 GAMEPLAY RULES

### Turn Order
- **BLACK PLAYER MOVES FIRST** (always starts the game)
- Players alternate turns

### Turn Structure
1. **Select a piece** - Click or use keyboard (WASD + E)
2. **Move and/or rotate** - One piece may move and/or rotate per turn
3. **Rotation (Triangle/Hexagon only)** - May rotate after moving (not after attacking)
4. **Turn ends** - Automatically after move or rotation

### Movement Rules
- **One piece per turn** - May move and/or rotate
- **Cannot move to friendly hex** - Pieces cannot move to hexes occupied by friendly pieces
- **Only Rhombus can jump** - Only Rhombus can jump/escape over other pieces
- **Specific movement per piece**:
  - **Rhombus**: 6 standard + 4 diagonal moves
  - **Triangle**: 3 moves/attacks
  - **Square**: 4 moves/attacks  
  - **Hexagon**: 6 moves/attacks
  - **Circle**: Zone-to-zone perimetric movement

### Capture Rules
- **To capture**: Move to opponent's hex to capture
- **Captured pieces removed permanently** from game (elimination)
- **Rhombus CANNOT attack Rhombus** - Special rule
- **Triangle/Hexagon CANNOT rotate after attacking** - Turn ends immediately
- **Circle CANNOT attack Dead Zone** - Cannot move to or attack center

### Rotation Rules (Triangle & Hexagon ONLY)
- **May rotate after moving** (in same turn)
- **CANNOT rotate after attacking** - Turn ends immediately
- **Rotation directions**:
  - **Left (A key)**: Counter-clockwise 60°
  - **Right (D key)**: Clockwise 60°
- **Optional**: Can skip rotation

---

## 🏆 WIN CONDITIONS

**IMPORTANT: NO DRAWS IN ROMGON - Every game has a winner!**

### 1. Fortress Victory (Primary)
- Move your **Rhombus (♦️)** to the **opponent's base hex**
  - **Black wins by reaching**: 3-8 (White's base)
  - **White wins by reaching**: 3-0 (Black's base)
- Most common way to win

### 2. Base Defense
- **Rhombus at base blocks opponent's win**
- If your Rhombus is on your own base, opponent cannot win by entering that hex
- **Exception**: Escape Race (see below) disables Base Defense

### 3. Deadlock Victory
- **Win if opponent's Rhombus is under attack with no legal moves**
- Opponent is trapped and cannot escape
- Immediate victory for attacking player

### 4. Draglock Loss
- **Lose if you have no legal moves** on your turn
- Different from stalemate - you lose, opponent wins
- Plan ahead to avoid being trapped

### 5. Escape Race
- **When only Rhombuses remain** on the board
- **First Rhombus to reach opponent's base wins**
- **Base Defense is DISABLED** in Escape Race
- Pure race to opponent's goal

### 6. Three-fold Repetition Loss
- **Lose if same position occurs three times**
- No draws - repeated positions result in loss for the repeating player
- Forces players to find new moves

### 7. Five-fold Shuttle Loss
- **Lose if you repeat a shuttle pattern (A→B→A) five times**
- Example: Moving same piece back and forth repeatedly
- Prevents time-wasting and forces progressive play

---

## 🎯 GAME VARIANTS

### 1. 🌟 Standard Romgon (Shape Defence)
- All standard rules apply
- **Shape Defence**: Any attacking shape that threatens the base hex can prevent the opponent's Rhombus from entering until it is eliminated or moved
- Defensive pieces can block base entry
- Recommended for strategic play

### 2. ♦️ Rhombus Original
- **Only the defending Rhombus (on its own base) can prevent the opponent's Rhombus from entering the base**
- Other pieces CANNOT block base entry
- Fast-paced gameplay
- More aggressive endgames
- For experienced players

### 3. 🌫️ Fog of War (Advanced Variant)
- Limited vision of opponent's pieces
- Cannot see enemy pieces beyond certain range
- Adds mystery and reconnaissance element
- Advanced strategic variant

---

## ⌨️ KEYBOARD CONTROLS

### Piece Selection Mode
- **W/A/S/D** - Navigate between your pieces
- **E** - Select highlighted piece
- **Esc** - Deselect current piece

### Move Selection Mode  
- **W/A/S/D** - Navigate between valid move hexes
- **E** - Execute move to highlighted hex
- **Esc** - Cancel move, return to piece selection

### Rotation Mode (Triangle/Hexagon)
- **A** - Rotate piece LEFT (counter-clockwise)
- **D** - Rotate piece RIGHT (clockwise)
- **Space** - Skip rotation, end turn

### General Controls
- **?** or **F1** - Show keyboard help
- **Esc** - Cancel current action
- **Mouse Click** - Alternative to keyboard for all actions

---

## 📊 ZONE SYSTEM

### Zone Structure
The hexagonal board is divided into 4 zones from center outward:

1. **Dead Zone** (Center hex) - Single center hex
2. **Inner Zone** - Surrounding center
3. **Middle Zone** - Mid-range hexes
4. **Outer Perimeter** - Outermost ring

### Zone Effects
- **Movement**: Most pieces can move through all zones
- **Circle Movement**: Circles move perimetrically between zones only
- **Dead Zone Restrictions**: 
  - Circles CANNOT move to or attack Dead Zone
  - Rhombus can move diagonally Dead Zone ↔ Inner Zone (no attack)
- **Friendly Blocking**: Friendly pieces block Circle's zone-path movement
- **Strategic Value**: Center control provides tactical advantage

---

## 🎲 OPENING STRATEGIES

### Named Openings

#### **Triangle Coop**
- First two moves: Triangle pieces coordinate
- Moves: `t5-6>5-5` and `t1-6>2-6` (Black)
- Moves: `T1-0>1-1` and `T5-0>4-1` (White)
- Creates strong attacking formation

#### **Rhombus Straw**  
- Focus on Rhombus advancement
- Moves: `r3-8>3-6` then `r3-6>3-4` (Black)
- Moves: `R3-0>3-2` then `R3-2>3-4` (White)
- Aggressive king push

#### **2 Square Advance**
- Both Squares move forward
- Moves: `s6-5>5-5` and `s0-5>1-5` (Black)
- Moves: `S0-0>1-1` and `S6-0>5-1` (White)
- Solid defensive opening

#### **Hexagon Push**
- Square + Hexagon coordination
- Moves: `s6-5>5-5` then `h2-7>3-6` (Black)
- Moves: `S0-0>1-1` then `H4-0>3-2` (White)
- Balanced attack/defense

---

## 🛡️ STRATEGIC CONCEPTS

### Piece Value Hierarchy
1. **Rhombus** ♦️ - CRITICAL (win condition, cannot attack other Rhombus)
2. **Hexagons** ⬡ - HIGH (6 moves/attacks, area control, rotation)
3. **Triangles** ▲ - MEDIUM-HIGH (3 moves/attacks, directional, rotation)
4. **Squares** ■ - MEDIUM (4 moves/attacks, versatile)
5. **Circles** ● - SITUATIONAL (zone control, perimetric movement)

### Key Strategies
- **Protect your Rhombus** at all costs
- **Remember: Black moves first** - Use first-move advantage
- **Rhombus cannot attack Rhombus** - Plan around this rule
- **Control zones** for Circle and positioning advantage
- **Rotate Triangles/Hexagons** strategically (after moving, not attacking)
- **Use Hexagons for area denial** - 6 moves/attacks makes them powerful
- **Circles for zone control** - Perimetric movement along zones
- **Path clearing** - Remove obstacles for Rhombus advance
- **Tempo advantage** - Force opponent into defensive moves
- **Avoid Draglock** - Always maintain legal moves
- **Watch for Three-fold Repetition** - Don't repeat positions

### Defensive Tactics
- **Piece wall formation** - line of pieces blocking advances
- **Rotation defense** - Turn Triangles/Hexagons toward threats
- **Zone control** - Own multiple zones to limit movement
- **Sacrifice plays** - Trade piece to save Rhombus

### Offensive Tactics
- **Fork attacks** - Threaten multiple pieces simultaneously
- **Pin tactics** - Trap piece between attacker and Rhombus
- **Forced captures** - Make opponent choose bad options
- **Rhombus escort** - Move attackers with Rhombus for protection

---

## 🎮 GAME MODES

### 1. 🤖 vs AI
- Play against computer opponent
- Multiple difficulty levels
- Great for learning and practice

### 2. 👥 vs Human (Local)
- Hot-seat multiplayer on same device
- Pass device between turns
- Classic face-to-face gameplay

### 3. 🌐 Online Multiplayer
- Real-time matches with other players
- Matchmaking and private rooms
- Chat and spectator features

### 4. 🛠️ Sandbox/Practice Mode
- Free piece placement
- Test strategies and positions
- No win/loss tracking

---

## 📜 GAME NOTATION

### RPN (Romgon Position Notation)
Format: `[piece][start-row]-[start-col]>[end-row]-[end-col][flags]`

**Examples:**
- `R3-0>3-2` - Rhombus from row 3, col 0 to row 3, col 2
- `t5-6>5-5x` - Triangle moves and captures (x flag)
- `H3-2-rotR` - Hexagon rotates right
- `T2-1-rotL` - Triangle rotates left

**Piece Abbreviations:**
- `R/r` - Rhombus
- `T/t` - Triangle  
- `S/s` - Square
- `C/c` - Circle
- `H/h` - Hexagon

**Flags:**
- `x` - Capture made
- `rotR` - Rotate right
- `rotL` - Rotate left
- `@` - Special move

---

## 🏅 WINNING TIPS FOR BEGINNERS

1. **Remember: Black moves first** - Use first-move advantage wisely
2. **Protect your Rhombus** - It's your win condition!
3. **Rhombus cannot attack Rhombus** - Don't rely on Rhombus for captures
4. **Learn piece attack counts** - Hexagon (6), Square (4), Triangle (3)
5. **Rotate after moving, not attacking** - Plan your attacks carefully
6. **Control zones for Circle play** - Zone movement is key
7. **Think 2-3 moves ahead** - Anticipate opponent responses
8. **Avoid Draglock** - Always keep legal moves available
9. **Watch for position repetition** - Three-fold repetition = you lose
10. **Use Hexagons aggressively** - 6 moves/attacks makes them powerful
11. **Base Defense matters** - Rhombus on base blocks opponent entry
12. **Escape Race awareness** - When only Rhombuses remain, race to goal

---

## ⚠️ COMMON MISTAKES TO AVOID

1. **Exposing Rhombus** - Moving king without protection
2. **Rotating after attacking** - Turn ends immediately, cannot rotate!
3. **Forgetting Black moves first** - Opening strategy matters
4. **Piece imbalance** - Trading Hexagon (6 attacks) for Triangle (3 attacks)
5. **Draglock situations** - Painting yourself into a corner with no moves
6. **Three-fold repetition** - Repeating same position loses the game
7. **Five-fold shuttle** - Moving same piece back and forth repeatedly
8. **Missing Rhombus diagonal jumps** - Dead Zone ↔ Inner Zone diagonal moves
9. **Trying Rhombus vs Rhombus** - Rhombuses cannot attack each other
10. **Ignoring Base Defense** - Rhombus on own base blocks opponent win
11. **Circle Dead Zone attempts** - Circles cannot move to or attack Dead Zone
12. **Friendly piece blocking** - Forgetting friendlies block Circle zone paths
13. **Escape Race confusion** - Base Defense disabled when only Rhombuses remain

---

## 🎓 ADVANCED CONCEPTS

### Tempo
- **Definition**: Initiative in forcing opponent reactions
- **Gaining tempo**: Make threats that require defensive responses
- **Losing tempo**: Making moves that don't improve position

### Piece Coordination
- **Definition**: Pieces working together to create threats
- **Examples**: Triangle + Square combo, Hexagon + Circle

### Zugzwang
- **Definition**: Position where any move worsens your situation
- **Rare in Romgon** but can occur in endgames

### Opposition
- **Definition**: Facing position between Kings (Rhombuses)
- **Critical in endgames** for breakthrough or defense

---

## 📱 MOBILE PLAY

- **Touch controls**: Tap to select piece, tap hex to move
- **Rotation**: On-screen rotation buttons for Triangle/Hexagon
- **Zoom**: Pinch to zoom in/out
- **Optimized UI**: Touch-friendly button sizes

---

## 🔧 SETTINGS & CUSTOMIZATION

### Audio Settings
- Background music toggle
- Sound effects (move, capture, rotation)
- Volume controls

### Visual Settings
- Board themes and colors
- Piece style preferences
- Highlighting options
- Grid line visibility

### Gameplay Settings
- Auto-promotion for Rhombus
- Move confirmation
- Undo move (practice mode only)
- Time controls

---

## 📚 ADDITIONAL RESOURCES

- **FAQ**: Check FAQ_AND_TIPS.md for common questions
- **Opening Book**: Study named openings in-game
- **Game Analysis**: Review completed games with engine analysis
- **Community**: Join Discord/forums for strategy discussion

---

## � RULE CLARIFICATIONS

### No Draws
- **ROMGON HAS NO DRAWS** - Every game must have a winner
- Three-fold repetition = Loss (not draw)
- Five-fold shuttle = Loss (not draw)
- Draglock = Loss (not stalemate)

### Rhombus Special Rules
- **Cannot attack other Rhombus** - Rhombus vs Rhombus = no capture
- **Can jump over pieces** - Only piece with this ability
- **Diagonal Dead Zone movement** - Can move Dead Zone ↔ Inner Zone diagonally (no attack)
- **Base Defense** - Rhombus on own base blocks opponent entry (except Escape Race)

### Rotation Restrictions
- **Can rotate after moving** - Triangle & Hexagon only
- **CANNOT rotate after attacking** - Turn ends immediately
- **Rotation is optional** - Can skip rotation

### Circle Movement
- **Perimetric zone movement only** - Follows zone perimeters
- **Cannot enter Dead Zone** - Cannot move to or attack center hex
- **Blocked by friendly pieces** - Friendlies block zone paths

### Escape Race
- **Triggered when only Rhombuses remain**
- **Base Defense DISABLED** - Cannot block opponent's base entry
- **First to reach opponent's base wins**

---

## 🏆 COMPETITIVE PLAY

### Rating System
- **Elo-based ratings** for player strength
- Rating changes based on game results
- Separate ratings for different time controls

### Tournament Formats
- Swiss system
- Round robin
- Knockout brackets
- Arena (continuous matches)

---

## 📖 VERSION HISTORY

**v1.0 (November 2025)**
- Initial rulebook release
- Comprehensive rules documentation
- All piece abilities and movement patterns
- Opening strategies and tactics
- Competitive play guidelines

---

## 💡 TIPS FROM THE DEVELOPERS

> "Romgon rewards both strategic planning and tactical awareness. The hexagonal grid creates unique positional challenges not found in traditional chess. Master the rotation mechanic for Triangles and Hexagons - it's the key to advanced play!"

> "Don't underestimate Circles! Their jumping ability makes them perfect for surprise attacks and quick repositioning. Use them to control space and create threats."

> "The best players protect their Rhombus while simultaneously creating threats. Balance offense and defense!"

---

**© 2025 ROMGON - Hexagonal Strategy Gaming**  
**For support**: Visit romgon.net  
**Community**: Join our Discord for tournaments and discussion

---

*This rulebook is subject to updates. Check romgon.net for the latest version.*

# Guide: How a Chatbot Can Build the Romgon Board Structure for Position Analysis

This document explains, for a chatbot or AI agent, how to construct the correct board structure for Romgon position analysis, assuming the bot already has access to the rules and all hardcoded piece movement logic.

---

## 1. Board Representation
- The Romgon board is a 7-row hex grid, with each row containing a variable number of columns (hexes).
- Each hex can be empty or contain a piece (with type, color, and possibly orientation).
- Each piece is defined by:
  - Type: square, triangle, rhombus, circle, hexagon
  - Color: black or white
  - Orientation: for triangles and hexagons (0-5)

### Example Data Structure (in JS/Python pseudocode)
```js
// JS example
const board = [
  // Row 0
  [null, {type: 'square', color: 'white'}, ...],
  // Row 1
  [...],
  // ...
  // Row 6
  [...]
];
```

## 2. Initializing the Board
- Start with an empty 7x9 (or 7xN) array.
- Populate each hex with the correct piece, color, and orientation based on the input position (e.g., RPN string, FEN-like, or move history replay).
- If using a notation string, parse it to extract piece locations and properties.

## 3. Piece Properties
- **Squares, Circles, Rhombuses:** Only need type and color.
- **Triangles, Hexagons:** Need type, color, and orientation (0-5, representing 60° increments).

## 4. Applying the Rules
- Use the hardcoded movement functions to generate legal moves for each piece.
- For analysis, you may need to:
  - Check for threats, pins, forks, fortress patterns, etc.
  - Simulate moves and update the board state accordingly.

## 5. Board State for Analysis
- The board structure should allow:
  - Querying the piece at any hex (row, col)
  - Listing all pieces of a given type/color
  - Simulating moves (move piece, update orientation, capture, etc.)
  - Undoing moves (for search/analysis)

## 6. Example: Board Construction from Notation
```python
# Python-like pseudocode
board = [[None for _ in range(cols)] for _ in range(7)]
for piece in parse_position_string(position):
    row, col = piece['row'], piece['col']
    board[row][col] = piece
```

## 7. Integration with Chatbot
- The chatbot should:
  1. Parse the input position (string, move list, or board array)
  2. Build the board data structure as above
  3. Use the hardcoded move logic to analyze threats, legal moves, and patterns
  4. Output analysis, suggestions, or visualizations as needed

## 8. Special Considerations
- **Orientation:** Always track for triangles and hexagons
- **Zones:** For circles, track which zone (outer, middle, inner) each is in
- **Base/Goal:** Track rhombus positions for win/loss detection
- **Move History:** Optionally store move history for repetition or undo

---

## Summary Table
| Property         | Description                                 |
|------------------|---------------------------------------------|
| Board Array      | 7 rows, each with N columns (hexes)         |
| Piece Object     | type, color, (orientation if needed)        |
| Move Logic       | Use hardcoded functions for each piece type |
| State Updates    | Move, rotate, capture, promote, etc.        |
| Analysis Output  | Threats, legal moves, fortress, etc.        |

---

*This guide is for AI/chatbot developers implementing Romgon position analysis with full access to rules and movement logic.*

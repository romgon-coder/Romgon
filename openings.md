# ROMGON Opening Theory

_Last updated: October 12, 2025_

---

## Introduction
This document catalogs all possible first moves in Romgon, grouped by piece and intent, and introduces the concept of opening systems (two-move sequences). As theory develops, key systems and families will be named and described.

---

## 1. First Move Families & Example Moves

### A. Triangle Advances
- **Triangle A** (e.g., at 2-1):
  - 2-1 → 3-2 (Gateway Advance)
  - 2-1 → 2-2 (Central Push)
  - 2-1 → 1-2 (Flank Advance)
- **Triangle B** (e.g., at 4-1):
  - 4-1 → 3-2 (Central Push)
  - 4-1 → 4-2 (Gateway Advance)
  - 4-1 → 5-2 (Flank Advance)

### B. Square Advances
- **Square A** (e.g., at 1-0):
  - 1-0 → 2-0 (Side Push)
  - 1-0 → 1-1 (Central Advance)
- **Square B** (e.g., at 5-0):
  - 5-0 → 4-0 (Side Push)
  - 5-0 → 5-1 (Central Advance)

### C. Rhombus Moves
- **Rhombus** (e.g., at 3-0):
  - 3-0 → 3-1 (Central Advance)
  - 3-0 → 2-1 (Diagonal Entry)
  - 3-0 → 4-1 (Diagonal Entry)

### D. Circle Jumps
- **Circle** (e.g., at 0-2):
  - 0-2 → 2-1 (Knight Jump)
  - 0-2 → 1-3 (Zone Jump)
  - 0-2 → 2-3 (Central Jump)

### E. Hexagon Moves/Rotations
- **Hexagon** (e.g., at 3-2):
  - 3-2 → 3-3 (Central Push)
  - 3-2 → 2-3 (Diagonal Move)
  - 3-2 (Rotate Left)
  - 3-2 (Rotate Right)

---

## 2. Complete List of First Moves (Example)

- Triangle A: 2-1→3-2, 2-1→2-2, 2-1→1-2
- Triangle B: 4-1→3-2, 4-1→4-2, 4-1→5-2
- Square A: 1-0→2-0, 1-0→1-1
- Square B: 5-0→4-0, 5-0→5-1
- Rhombus: 3-0→3-1, 3-0→2-1, 3-0→4-1
- Circle: 0-2→2-1, 0-2→1-3, 0-2→2-3
- Hexagon: 3-2→3-3, 3-2→2-3, 3-2 (Rotate Left), 3-2 (Rotate Right)

---

## 3. Named Opening Systems (Two-Move Sequences)

### 3.1 Triangle Gateway Attack
1. Triangle A 2-1→3-2
2. Black: Square B 5-0→5-1
- **RPN:** `T2-1-3-2 s5-0-5-1`

### 3.2 Central Hexagon Push
1. Hexagon 3-2→3-3
2. Black: Triangle B 4-1→4-2
- **RPN:** `H3-2-3-3 t4-1-4-2`

### 3.3 Rhombus Diagonal Entry
1. Rhombus 3-0→2-1
2. Black: Square A 1-0→1-1
- **RPN:** `R3-0-2-1 s1-0-1-1`

### 3.4 Circle Central Jump
1. Circle 0-2→2-3
2. Black: Hexagon 3-2 (Rotate Right)
- **RPN:** `C0-2-2-3 h3-2-rotR`

### 3.5 Square Side Push
1. Square A 1-0→2-0
2. Black: Triangle B 4-1→3-2
- **RPN:** `S1-0-2-0 t4-1-3-2`

### 3.6 Triangle Flank Advance
1. Triangle B 4-1→5-2
2. Black: Square A 1-0→1-1
- **RPN:** `T4-1-5-2 s1-0-1-1`

### 3.7 Hexagon Diagonal Move
1. Hexagon 3-2→2-3
2. Black: Circle 0-2→2-1
- **RPN:** `H3-2-2-3 c0-2-2-1`

### 3.8 Rhombus Central Advance
1. Rhombus 3-0→3-1
2. Black: Hexagon 3-2→3-3
- **RPN:** `R3-0-3-1 h3-2-3-3`

### 3.9 Square Central Advance
1. Square B 5-0→5-1
2. Black: Triangle A 2-1→2-2
- **RPN:** `S5-0-5-1 t2-1-2-2`

### 3.10 Circle Zone Jump
1. Circle 0-2→1-3
2. Black: Rhombus 3-0→4-1
- **RPN:** `C0-2-1-3 r3-0-4-1`

### 3.11 Hexagon Rotate Left
1. Hexagon 3-2 (Rotate Left)
2. Black: Triangle A 2-1→3-2
- **RPN:** `H3-2-rotL t2-1-3-2`

### 3.12 Triangle Central Push
1. Triangle A 2-1→2-2
2. Black: Square B 5-0→4-0
- **RPN:** `T2-1-2-2 s5-0-4-0`

### 3.13 Square Flank Push
1. Square A 1-0→2-0
2. Black: Hexagon 3-2→2-3
- **RPN:** `S1-0-2-0 h3-2-2-3`

### 3.14 Rhombus Flank Entry
1. Rhombus 3-0→4-1
2. Black: Triangle B 4-1→4-2
- **RPN:** `R3-0-4-1 t4-1-4-2`

### 3.15 Hexagon Rotate Right
1. Hexagon 3-2 (Rotate Right)
2. Black: Square A 1-0→1-1
- **RPN:** `H3-2-rotR s1-0-1-1`

### 3.16 Black Square Side Push
1. Black: Square 6-5→5-5
- **RPN:** `(S4s/T05t0/C6h0/R7r/H06c/T04st0/S5 w 0 - - - s6-5>5-5 whiteblack - -)`

### 3.17 Hexagon Push
WHO: Square and Hexagon with no rotation
1. ■ 6-5 → 5-5
2. ⬡ 2-7 → 3-6
- **RPN:** `S4s/T05t0/C7/2R3h01r/H06c/T04st0/S5 b 1 - - hex-3-6:m s6-5>5-5;R3-0>3-2;h2-7>3-6 black`

### 3.18 Rhombus Roster
WHO: Rhombus and Circle
1. ◆ 3-8 → 3-6
2. ● 4-7 → 4-6
- **RPN:** `5s/T0S4t0/C6h0/R5r2/H05c1/T05t0/S4s w 1 - - - r3-8>3-6;S0-0>1-1;c4-7>4-6 white - -`

---

## 4. Ongoing Research
- As games are played and analyzed, this document will be updated with new systems, traps, and recommended lines.
- Community contributions and computer analysis are welcome!

---

Romgon opening theory is in its early stages. Explore, experiment, and help shape the meta!
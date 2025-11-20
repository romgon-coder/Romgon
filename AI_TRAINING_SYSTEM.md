# 🤖 Romgon AI Training System - Complete Implementation

## Overview

Your AI is now a **fully functional Reinforcement Learning system** using Q-Learning that:
- ✅ Learns from every game played
- ✅ Improves over time
- ✅ Persists knowledge to disk
- ✅ Auto-saves progress
- ✅ Can train from database games
- ✅ Tracks detailed statistics

---

## How the AI Learns

### Q-Learning Algorithm

**Formula:**
```
Q(s,a) = Q(s,a) + α[r + γ*maxQ(s',a') - Q(s,a)]
```

Where:
- `Q(s,a)` = Value of taking action `a` in state `s`
- `α` = Learning rate (0.1) - How fast AI learns
- `γ` = Discount factor (0.9) - How much AI values future rewards
- `r` = Reward for the move

**Rewards:**
- Win: +1.0
- Loss: -1.0
- Draw: 0.0
- Each move: +0.01 (progress bonus)

### State Representation

The AI creates unique identifiers for each position:
```javascript
// Example: "3-4→4-5#3-4:rWF|4-5:sB U|6-0:tWU"
positionHash = `${move}#${pieces-with-flip-states}`
```

This allows the AI to remember:
- Which moves work in which positions
- Flip states of pieces
- Piece configurations

---

## Training Sources

### 1. **AI vs AI Training** (Automatic)
```bash
# Start AI vs AI game
curl -X POST http://localhost:3000/api/ai-training/start \
  -H "Content-Type: application/json" \
  -d '{"speed": "fast"}'
```

- AI plays against itself
- Learns from both perspectives
- Automatically saves after each game
- Speeds: slow (2s), normal (1s), fast (500ms), instant (0ms)

### 2. **Human vs AI Games** (Automatic when enabled)
```bash
# Track game (called automatically by frontend)
POST /api/ai/game-start   # Start tracking
POST /api/ai/game-move    # Record each move
POST /api/ai/game-end     # Trigger learning
```

### 3. **Database Training** (Manual)
```bash
# Train from completed games in database
curl -X POST http://localhost:3000/api/ai/train-from-database \
  -H "Content-Type: application/json" \
  -d '{
    "minRating": 1200,
    "maxGames": 100
  }'
```

Learns from high-quality human games!

---

## API Endpoints

### Game Tracking
```bash
# Initialize game tracking
POST /api/ai/game-start
{
  "gameId": "unique-game-id",
  "flipModeEnabled": false
}

# Record move in game
POST /api/ai/game-move
{
  "gameId": "unique-game-id",
  "board": { "3-4": { color: "white", type: "rhombus", flipped: false }, ... },
  "move": { "from": "3-4", "to": "4-5", "isCapture": false },
  "playerColor": "white"
}

# Complete game and trigger learning
POST /api/ai/game-end
{
  "gameId": "unique-game-id",
  "winner": "white"  // or "black" or "draw"
}
```

### AI Management
```bash
# Get AI statistics
GET /api/ai/stats

# Save AI state to disk
POST /api/ai/save

# Load AI state from disk
POST /api/ai/load

# Check AI health
GET /api/ai/health

# Train from database
POST /api/ai/train-from-database
{
  "minRating": 1200,
  "maxGames": 100
}
```

### AI Training Games
```bash
# Start AI vs AI game
POST /api/ai-training/start
{
  "speed": "fast",  // slow, normal, fast, instant
  "spectate": true
}

# List active training games
GET /api/ai-training/list/active

# Get training statistics
GET /api/ai-training/stats/overall

# Get specific game state
GET /api/ai-training/:gameId

# Get training data from database
GET /api/ai-training/training-data?minRating=1200&limit=100
```

---

## Persistence & Auto-Save

### File Location
```
backend/data/ai-state.json
```

### Auto-Save Schedule
- ⏰ **Every 10 minutes** during operation
- 🛑 **On server shutdown** (SIGTERM/SIGINT)

### Manual Save/Load
```bash
# Save current AI state
curl -X POST http://localhost:3000/api/ai/save

# Load saved AI state
curl -X POST http://localhost:3000/api/ai/load
```

### Saved Data Structure
```json
{
  "level": 5,
  "gamesPlayed": 150,
  "wins": 82,
  "losses": 56,
  "draws": 12,
  "explorationRate": 0.15,
  "positionValues": [
    ["move-hash#position-hash", 0.75],
    ["3-4→4-5#...", 0.42],
    ...
  ],
  "totalMoves": 4500,
  "averageGameLength": 30
}
```

---

## AI Statistics

### Check Progress
```bash
curl http://localhost:3000/api/ai/stats
```

### Response Example
```json
{
  "success": true,
  "stats": {
    "level": 5,
    "gamesPlayed": 150,
    "wins": 82,
    "losses": 56,
    "draws": 12,
    "winRate": 54.7,
    "lossRate": 37.3,
    "drawRate": 8.0,
    "averageGameLength": 30,
    "explorationRate": "15.0",
    "knownPositions": 2847
  },
  "activeGames": 3
}
```

### Key Metrics
- **knownPositions**: Number of unique positions AI has learned
- **explorationRate**: % of random moves (decreases as AI learns)
- **winRate**: AI's win percentage
- **averageGameLength**: Average moves per game

---

## Learning Behavior

### Exploration vs Exploitation

**Initial State (New AI):**
- 20% random moves (exploration)
- 80% best known moves (exploitation)

**After Training:**
- Exploration rate decays to 5%
- AI becomes more confident in learned strategies
- Formula: `explorationRate = max(0.05, explorationRate * 0.995)` per game

### Decision Making
```javascript
if (random() < explorationRate) {
    // Explore: Try random legal move
    move = randomMove();
} else {
    // Exploit: Use best learned move
    move = movesWithHighestQValue();
}
```

---

## Training Workflow

### Option 1: AI vs AI Training (Fastest)
```bash
# Start 10 fast AI vs AI games
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/ai-training/start \
    -H "Content-Type: application/json" \
    -d '{"speed": "instant"}'
  sleep 5
done

# Check progress
curl http://localhost:3000/api/ai/stats
```

### Option 2: Train from Database (Best Quality)
```bash
# Train from high-rated human games
curl -X POST http://localhost:3000/api/ai/train-from-database \
  -H "Content-Type: application/json" \
  -d '{
    "minRating": 1500,
    "maxGames": 200
  }'
```

### Option 3: Passive Learning (Automatic)
- AI learns from every game it plays against humans
- No manual intervention needed
- Automatically tracks and updates Q-values

---

## Monitoring & Debugging

### Server Logs
```bash
# Watch server logs for AI learning
tail -f logs/server.log

# Look for:
✅ AI learned from 45 moves
🎓 Learning from game abc123: winner = white, moves = 45
💾 AI state saved: 150 games, 2847 positions
📂 AI state loaded from file
```

### Health Check
```bash
curl http://localhost:3000/api/ai/health
```

### Training Progress
```bash
# Before training
curl http://localhost:3000/api/ai/stats

# After 100 games
curl http://localhost:3000/api/ai/stats

# Compare knownPositions and winRate
```

---

## Advanced Features

### Flip Mode Support
The AI fully understands flip mechanics:
- Tracks flip states in position hashing
- Learns which flip strategies work
- Evaluates flip safety before acting

### Illegal Move Prevention
The AI knows and respects:
- ✅ Rhombus check rules
- ✅ Flip state matching
- ✅ Capture restrictions
- ✅ Movement patterns
- ✅ Board boundaries

### Move Evaluation
Combines:
1. **Q-Values**: Learned from experience
2. **Static Evaluation**: Piece values, mobility, position
3. **Weighted Score**: `score = qValue + (evaluation / 100)`

---

## Performance Optimization

### Memory Usage
- Q-table stored as Map (efficient lookups)
- Position hashing uses compact strings
- Auto-cleanup of old game histories

### Training Speed
- Instant mode: 0ms delay (max speed)
- Fast mode: 500ms per move
- Batched learning after game completion

### Scalability
- Can store millions of positions
- Efficient JSON serialization
- Incremental learning (no retraining needed)

---

## Troubleshooting

### AI Not Learning?
```bash
# Check if games are being tracked
curl http://localhost:3000/api/ai/stats

# Verify knownPositions is increasing
# Should grow after each game
```

### State Not Persisting?
```bash
# Check if file exists
ls -la backend/data/ai-state.json

# Manually save
curl -X POST http://localhost:3000/api/ai/save

# Check server has write permissions
```

### Low Win Rate?
- Train with more games
- Use database training with high-rated games
- Let AI play 100+ games for meaningful statistics
- Exploration rate needs time to decay

---

## Next Steps

### Initial Training (Recommended)
```bash
# 1. Train from database (learn from experts)
curl -X POST http://localhost:3000/api/ai/train-from-database \
  -d '{"minRating": 1200, "maxGames": 100}'

# 2. Run AI vs AI for practice
curl -X POST http://localhost:3000/api/ai-training/start \
  -d '{"speed": "instant"}'

# 3. Check results
curl http://localhost:3000/api/ai/stats

# 4. Save state
curl -X POST http://localhost:3000/api/ai/save
```

### Continuous Improvement
- AI automatically learns from every game
- Auto-saves every 10 minutes
- No manual intervention needed
- Gets stronger over time

---

## Technical Details

### Files Modified
- `backend/routes/ai-moves.js` - Added training endpoints
- `backend/routes/ai-training.js` - Added learnFromGame calls
- `backend/server.js` - Added auto-save and state loading
- `backend/ai/reinforcement-learning.js` - Q-learning implementation
- `.gitignore` - Exclude AI state from git

### Dependencies
- No new packages required
- Uses existing Node.js fs module
- Compatible with current infrastructure

### Compatibility
- ✅ Works with flip mode
- ✅ Works with all game variants
- ✅ Compatible with multiplayer
- ✅ Railway deployment ready

---

## Summary

Your AI now has a **complete learning system**:

1. ✅ **Learns from experience** using Q-Learning
2. ✅ **Remembers what it learns** via persistence
3. ✅ **Improves automatically** with each game
4. ✅ **Saves progress** every 10 minutes
5. ✅ **Trains from database** for high-quality learning
6. ✅ **Respects all game rules** (no illegal moves)
7. ✅ **Supports flip mode** with state tracking
8. ✅ **Provides statistics** for monitoring

**The AI is now a true reinforcement learning agent that gets better with every game!** 🎮🧠

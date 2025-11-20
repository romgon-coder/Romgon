# AI Training Data Directory

This directory stores the AI's learned knowledge (Q-table) for persistent learning.

## Files

- `ai-state.json` - Saved AI state including:
  - Q-values (position evaluations)
  - Games played
  - Win/loss statistics
  - Exploration rate
  - Known positions count

## Auto-Save

The AI state is automatically saved:
- Every 10 minutes during operation
- On server shutdown (SIGTERM/SIGINT)

## Manual Operations

### Save AI State
```bash
curl -X POST http://localhost:3000/api/ai/save
```

### Load AI State
```bash
curl -X POST http://localhost:3000/api/ai/load
```

### Get AI Stats
```bash
curl http://localhost:3000/api/ai/stats
```

### Train from Database
```bash
curl -X POST http://localhost:3000/api/ai/train-from-database \
  -H "Content-Type: application/json" \
  -d '{"minRating": 1200, "maxGames": 100}'
```

## AI Learning Process

1. **Game Tracking**: Each AI game records board states and moves
2. **Q-Learning**: After game ends, AI updates Q-values based on outcome
3. **Persistence**: State saved to disk for continuous improvement
4. **Exploration**: 20% random moves to discover new strategies (decays over time)
5. **Exploitation**: 80% best known moves based on learned Q-values

## Training Sources

- AI vs AI games (automatic)
- Human vs AI games (when integrated)
- Database games (manual trigger)

## Q-Learning Parameters

- **Learning Rate (α)**: 0.1 - How fast AI learns from new experiences
- **Discount Factor (γ)**: 0.9 - How much AI values future rewards
- **Exploration Rate (ε)**: 0.2 → 0.05 - Decays as AI learns

## Monitoring

Check AI progress:
```bash
curl http://localhost:3000/api/ai/health
```

Response includes:
- Games played
- Win rate
- Known positions
- Exploration rate

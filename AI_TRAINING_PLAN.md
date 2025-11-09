# Zero-Cost AI Training Implementation Plan

## Overview
Implement supervised learning AI using existing infrastructure with ZERO additional costs.

## Phase 1: Data Collection (Already Working!)

### Current State ✅
- Backend already stores games in MySQL
- Game history includes moves, outcomes, player ratings
- RPN format provides perfect training data

### Enhancements Needed
```sql
-- Add training data tracking
ALTER TABLE games ADD COLUMN training_data JSON;
ALTER TABLE games ADD COLUMN ai_training_eligible BOOLEAN DEFAULT true;

-- Store each move with context
-- JSON format:
{
  "moves": [
    {
      "position": "RPN board state",
      "move": {"from": "hex-3-2", "to": "hex-4-2", "piece": "rhombus"},
      "player_rating": 1500,
      "move_quality": "good|neutral|blunder"
    }
  ],
  "outcome": "black_win",
  "game_length": 45
}
```

## Phase 2: Browser-Based Training

### Technology: TensorFlow.js (Runs in Browser - FREE!)

**Benefits:**
- ✅ No server costs
- ✅ Uses player's GPU (if available)
- ✅ Model stored in browser (localStorage/IndexedDB)
- ✅ Privacy-friendly (data stays local)
- ✅ Can export/share trained models

### Implementation Files:

#### File 1: `ai-training.js` (New)
```javascript
import * as tf from '@tensorflow/tfjs';

class RomgonAITrainer {
  constructor() {
    this.model = null;
    this.trainingData = [];
  }

  // Load training data from backend
  async loadTrainingData(limit = 1000) {
    const response = await fetch(`${BACKEND_API_URL}/api/games/training-data?limit=${limit}`);
    const games = await response.json();
    
    this.trainingData = this.processGames(games);
    console.log(`Loaded ${this.trainingData.length} training examples`);
  }

  // Convert games to training format
  processGames(games) {
    const examples = [];
    
    games.forEach(game => {
      if (!game.training_data) return;
      
      game.training_data.moves.forEach(move => {
        // Only use good moves from high-rated players
        if (move.player_rating > 1200 && move.move_quality !== 'blunder') {
          examples.push({
            position: this.rpnToTensor(move.position),
            move: this.moveToTensor(move.move),
            rating: move.player_rating / 3000 // Normalize
          });
        }
      });
    });
    
    return examples;
  }

  // Create neural network
  buildModel() {
    this.model = tf.sequential({
      layers: [
        // Input: 169 board positions (7x7 hexagonal + piece info)
        tf.layers.dense({inputShape: [169], units: 512, activation: 'relu'}),
        tf.layers.dropout({rate: 0.3}),
        
        tf.layers.dense({units: 256, activation: 'relu'}),
        tf.layers.dropout({rate: 0.3}),
        
        tf.layers.dense({units: 128, activation: 'relu'}),
        
        // Output: Move probabilities (169 possible moves)
        tf.layers.dense({units: 169, activation: 'softmax'})
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    console.log('✅ Model built');
    this.model.summary();
  }

  // Train the model
  async train(epochs = 50) {
    if (!this.trainingData.length) {
      throw new Error('No training data loaded');
    }

    console.log(`🎯 Training on ${this.trainingData.length} examples...`);

    // Prepare data
    const xs = tf.stack(this.trainingData.map(d => d.position));
    const ys = tf.stack(this.trainingData.map(d => d.move));

    // Train with progress display
    await this.model.fit(xs, ys, {
      epochs: epochs,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}/${epochs}`);
          console.log(`  Loss: ${logs.loss.toFixed(4)}`);
          console.log(`  Accuracy: ${(logs.acc * 100).toFixed(2)}%`);
          console.log(`  Val Loss: ${logs.val_loss.toFixed(4)}`);
          console.log(`  Val Accuracy: ${(logs.val_acc * 100).toFixed(2)}%`);
          
          // Update UI progress
          updateTrainingProgress(epoch + 1, epochs, logs);
        }
      }
    });

    console.log('✅ Training complete!');
    
    // Cleanup
    xs.dispose();
    ys.dispose();
  }

  // Save model to browser storage
  async saveModel(name = 'romgon-ai-v1') {
    await this.model.save(`localstorage://${name}`);
    console.log(`✅ Model saved as ${name}`);
  }

  // Load model from browser storage
  async loadModel(name = 'romgon-ai-v1') {
    this.model = await tf.loadLayersModel(`localstorage://${name}`);
    console.log(`✅ Model loaded: ${name}`);
  }

  // Export model for sharing
  async exportModel() {
    const saveResult = await this.model.save('downloads://romgon-ai-model');
    console.log('✅ Model exported to downloads');
    return saveResult;
  }

  // Get AI move
  async predictMove(boardPosition) {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    const input = this.rpnToTensor(boardPosition);
    const prediction = this.model.predict(tf.tensor([input]));
    
    // Get top 5 moves
    const topMoves = await this.getTopMoves(prediction, 5);
    
    prediction.dispose();
    
    return topMoves[0]; // Return best move
  }

  // Convert RPN board to tensor
  rpnToTensor(rpnBoard) {
    // TODO: Implement RPN parsing
    // For now, placeholder
    return tf.zeros([169]);
  }

  // Convert move to tensor (one-hot encoding)
  moveToTensor(move) {
    // TODO: Implement move encoding
    // For now, placeholder
    return tf.zeros([169]);
  }

  async getTopMoves(prediction, k = 5) {
    const values = await prediction.data();
    const moves = [];
    
    for (let i = 0; i < values.length; i++) {
      moves.push({index: i, probability: values[i]});
    }
    
    moves.sort((a, b) => b.probability - a.probability);
    return moves.slice(0, k).map(m => this.indexToMove(m.index));
  }

  indexToMove(index) {
    // TODO: Convert index back to move notation
    return {from: 'hex-0-0', to: 'hex-1-0'};
  }
}

// Global instance
window.romgonAITrainer = new RomgonAITrainer();
```

#### File 2: `ai-training-ui.html` (New Training Interface)
Add to index.html or separate page:

```html
<!-- AI Training Panel -->
<div id="ai-training-panel" style="display: none;">
  <div class="panel-header">
    <h2>🤖 Train AI Model</h2>
    <button onclick="closeAITrainingPanel()">✖</button>
  </div>
  
  <div class="training-steps">
    <div class="step">
      <h3>Step 1: Load Training Data</h3>
      <button onclick="loadTrainingData()">
        📥 Load 1000 Games
      </button>
      <p id="data-status">Not loaded</p>
    </div>
    
    <div class="step">
      <h3>Step 2: Build Model</h3>
      <button onclick="buildAIModel()">
        🏗️ Create Neural Network
      </button>
      <p id="model-status">Not built</p>
    </div>
    
    <div class="step">
      <h3>Step 3: Train Model</h3>
      <label>Epochs: <input type="number" id="training-epochs" value="50"></label>
      <button onclick="trainAIModel()">
        🎯 Start Training
      </button>
      <div id="training-progress">
        <div class="progress-bar">
          <div id="progress-fill"></div>
        </div>
        <p id="training-stats">Waiting to start...</p>
      </div>
    </div>
    
    <div class="step">
      <h3>Step 4: Save & Use</h3>
      <button onclick="saveAIModel()">
        💾 Save to Browser
      </button>
      <button onclick="exportAIModel()">
        📤 Export Model
      </button>
      <button onclick="testAIModel()">
        🎮 Test AI
      </button>
    </div>
  </div>
  
  <div class="trained-models">
    <h3>Available Models</h3>
    <div id="models-list">
      <!-- Will be populated with saved models -->
    </div>
  </div>
</div>
```

#### File 3: Backend API Endpoint (Add to existing backend)
```javascript
// Add to existing backend API routes

// GET /api/games/training-data
app.get('/api/games/training-data', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 1000;
    const minRating = parseInt(req.query.minRating) || 1200;
    
    // Get games suitable for training
    const games = await db.query(`
      SELECT 
        id,
        training_data,
        white_player_rating,
        black_player_rating,
        result,
        move_count
      FROM games
      WHERE 
        ai_training_eligible = true
        AND (white_player_rating >= ? OR black_player_rating >= ?)
        AND result IS NOT NULL
        AND training_data IS NOT NULL
      ORDER BY 
        GREATEST(white_player_rating, black_player_rating) DESC
      LIMIT ?
    `, [minRating, minRating, limit]);
    
    res.json(games);
  } catch (error) {
    console.error('Failed to fetch training data:', error);
    res.status(500).json({ error: 'Failed to fetch training data' });
  }
});

// POST /api/games/save-training-data
// Called after each game to save training-ready data
app.post('/api/games/:gameId/training-data', authenticateToken, async (req, res) => {
  try {
    const { gameId } = req.params;
    const { moves, outcome } = req.body;
    
    // Format and save training data
    const trainingData = {
      moves: moves.map(m => ({
        position: m.boardState,
        move: m.move,
        player_rating: m.playerRating,
        move_quality: evaluateMoveQuality(m) // Simple heuristic
      })),
      outcome,
      game_length: moves.length
    };
    
    await db.query(`
      UPDATE games 
      SET training_data = ? 
      WHERE id = ?
    `, [JSON.stringify(trainingData), gameId]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save training data:', error);
    res.status(500).json({ error: 'Failed to save training data' });
  }
});
```

## Phase 3: Integration

### Add to Existing AI System

```javascript
// Modify existing AI mode to use trained model

async function makeAIMove() {
  // Check if trained model exists
  const hasTrainedModel = await checkForTrainedModel();
  
  if (hasTrainedModel) {
    // Use neural network
    console.log('🧠 Using trained neural network');
    return await window.romgonAITrainer.predictMove(getCurrentBoardRPN());
  } else {
    // Fall back to existing AI logic
    console.log('🎲 Using rule-based AI');
    return makeAIMoveOriginal();
  }
}
```

## Cost Analysis

### Current System Costs: $0
- ✅ TensorFlow.js: FREE (runs in browser)
- ✅ Training: FREE (uses player's device)
- ✅ Storage: FREE (browser localStorage/IndexedDB)
- ✅ Backend: Already exists
- ✅ Hosting: Already on Vercel/Railway

### Benefits:
- No server costs
- No GPU costs (uses player's GPU if available)
- Privacy-friendly (training data stays local if desired)
- Easy to update (just retrain with new games)
- Can export/import models (share with community)

## Timeline

**Week 1:**
- ✅ Add training data collection to backend
- ✅ Create TensorFlow.js training interface
- ✅ Build neural network architecture

**Week 2:**
- ✅ Collect 1000+ games from existing players
- ✅ Train first model
- ✅ Test against existing AI

**Week 3:**
- ✅ Integrate trained model into game
- ✅ Add model selection UI
- ✅ Performance optimization

## Next Steps

1. Should I implement this now?
2. Want me to start with data collection enhancement?
3. Or jump straight to training interface?

This approach gives you ML-powered AI with ZERO additional costs! 🎉

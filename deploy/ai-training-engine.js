/**
 * Romgon AI Training Engine
 * Uses TensorFlow.js for browser-based neural network training
 */

class RomgonAITrainer {
    constructor() {
        this.model = null;
        this.trainingData = [];
        this.isTraining = false;
        this.shouldStop = false;
    }

    /**
     * Load training data from backend
     */
    async loadTrainingData(limit = 1000, minRating = 1200) {
        try {
            const response = await fetch(`https://api.romgon.net/api/games/training-data?limit=${limit}&minRating=${minRating}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const games = await response.json();
            this.trainingData = this.processGames(games);
            
            console.log(`✅ Loaded ${this.trainingData.length} training examples from ${games.length} games`);
            return this.trainingData.length;
        } catch (error) {
            console.error('Failed to load training data:', error);
            throw error;
        }
    }

    /**
     * Process games into training examples
     */
    processGames(games) {
        const examples = [];
        
        games.forEach(game => {
            if (!game.training_data || !game.training_data.moves) return;
            
            game.training_data.moves.forEach(move => {
                // Only use moves from decent players and avoid blunders
                if (move.player_rating > 1000 && move.move_quality !== 'blunder') {
                    try {
                        examples.push({
                            position: move.position,
                            move: move.move,
                            rating: move.player_rating,
                            quality: move.move_quality
                        });
                    } catch (e) {
                        // Skip invalid moves
                    }
                }
            });
        });
        
        console.log(`Processed ${examples.length} valid training examples`);
        return examples;
    }

    /**
     * Build neural network model
     */
    buildModel(architecture = 'medium') {
        const architectures = {
            small: { units: [128, 64], dropout: 0.2 },
            medium: { units: [256, 128], dropout: 0.3 },
            large: { units: [512, 256, 128], dropout: 0.3 }
        };

        const arch = architectures[architecture] || architectures.medium;

        this.model = tf.sequential();

        // Input layer
        this.model.add(tf.layers.dense({
            inputShape: [169], // 7x7 hexagonal board positions + piece info
            units: arch.units[0],
            activation: 'relu',
            kernelInitializer: 'heNormal'
        }));
        this.model.add(tf.layers.dropout({ rate: arch.dropout }));

        // Hidden layers
        for (let i = 1; i < arch.units.length; i++) {
            this.model.add(tf.layers.dense({
                units: arch.units[i],
                activation: 'relu',
                kernelInitializer: 'heNormal'
            }));
            this.model.add(tf.layers.dropout({ rate: arch.dropout }));
        }

        // Output layer - move probabilities
        this.model.add(tf.layers.dense({
            units: 169, // All possible moves
            activation: 'softmax'
        }));

        // Compile model
        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        console.log('✅ Model built with', architecture, 'architecture');
        this.model.summary();
        
        return this.model;
    }

    /**
     * Train the model
     */
    async train(epochs = 50, batchSize = 32, callbacks = {}) {
        if (!this.model) {
            throw new Error('Model not built. Call buildModel() first.');
        }

        if (!this.trainingData.length) {
            throw new Error('No training data loaded. Call loadTrainingData() first.');
        }

        this.isTraining = true;
        this.shouldStop = false;

        console.log(`🎯 Starting training: ${epochs} epochs, batch size ${batchSize}`);
        console.log(`📊 Training on ${this.trainingData.length} examples`);

        try {
            // Prepare data tensors
            const { xs, ys } = this.prepareTrainingData();

            // Train with callbacks
            const history = await this.model.fit(xs, ys, {
                epochs: epochs,
                batchSize: batchSize,
                validationSplit: 0.2,
                shuffle: true,
                callbacks: {
                    onEpochBegin: (epoch) => {
                        if (this.shouldStop) {
                            this.model.stopTraining = true;
                        }
                        if (callbacks.onEpochBegin) {
                            callbacks.onEpochBegin(epoch);
                        }
                    },
                    onEpochEnd: async (epoch, logs) => {
                        console.log(`Epoch ${epoch + 1}/${epochs}:`);
                        console.log(`  Loss: ${logs.loss.toFixed(4)}`);
                        console.log(`  Accuracy: ${(logs.acc * 100).toFixed(2)}%`);
                        console.log(`  Val Loss: ${logs.val_loss.toFixed(4)}`);
                        console.log(`  Val Accuracy: ${(logs.val_acc * 100).toFixed(2)}%`);
                        
                        if (callbacks.onEpochEnd) {
                            await callbacks.onEpochEnd(epoch, logs);
                        }

                        if (this.shouldStop) {
                            console.log('⏹️ Training stopped by user');
                            this.model.stopTraining = true;
                        }
                    },
                    onBatchEnd: async (batch, logs) => {
                        if (callbacks.onBatchEnd) {
                            await callbacks.onBatchEnd(batch, logs);
                        }
                    }
                }
            });

            // Cleanup
            xs.dispose();
            ys.dispose();

            this.isTraining = false;
            console.log('✅ Training complete!');
            
            return history;
        } catch (error) {
            this.isTraining = false;
            console.error('❌ Training failed:', error);
            throw error;
        }
    }

    /**
     * Prepare training data as tensors
     */
    prepareTrainingData() {
        const positions = [];
        const moves = [];

        this.trainingData.forEach(example => {
            const positionTensor = this.positionToTensor(example.position);
            const moveTensor = this.moveToTensor(example.move);
            
            positions.push(positionTensor);
            moves.push(moveTensor);
        });

        const xs = tf.stack(positions);
        const ys = tf.stack(moves);

        // Cleanup individual tensors
        positions.forEach(t => t.dispose());
        moves.forEach(t => t.dispose());

        return { xs, ys };
    }

    /**
     * Convert board position (RPN) to tensor
     */
    positionToTensor(rpnPosition) {
        // Create 169-element tensor (7x7 grid + piece info)
        const tensor = new Float32Array(169);
        
        // TODO: Implement RPN parsing
        // For now, use placeholder logic
        // Parse RPN string and populate tensor with piece positions
        
        // Format: each cell can have:
        // 0 = empty
        // 1-6 = white pieces (square, triangle, rhombus, circle, hexagon, gateway)
        // -1 to -6 = black pieces
        
        try {
            // Simple parsing - this should be enhanced with your actual RPN format
            const parts = rpnPosition.split(' ');
            const boardPart = parts[0] || '';
            
            // Fill tensor based on board state
            for (let i = 0; i < Math.min(boardPart.length, 169); i++) {
                const char = boardPart[i];
                // Map characters to piece values
                // This is a placeholder - adjust based on your RPN format
                if (char === 's') tensor[i] = 1;      // white square
                else if (char === 't') tensor[i] = 2; // white triangle
                else if (char === 'r') tensor[i] = 3; // white rhombus
                else if (char === 'c') tensor[i] = 4; // white circle
                else if (char === 'h') tensor[i] = 5; // white hexagon
                else if (char === 'S') tensor[i] = -1; // black square
                else if (char === 'T') tensor[i] = -2; // black triangle
                else if (char === 'R') tensor[i] = -3; // black rhombus
                else if (char === 'C') tensor[i] = -4; // black circle
                else if (char === 'H') tensor[i] = -5; // black hexagon
                else tensor[i] = 0; // empty
            }
        } catch (e) {
            console.warn('Failed to parse position:', e);
        }

        return tf.tensor1d(tensor);
    }

    /**
     * Convert move to one-hot tensor
     */
    moveToTensor(move) {
        // Create 169-element one-hot tensor (one for each possible destination)
        const tensor = new Float32Array(169);
        
        try {
            // Parse move notation (e.g., {from: "hex-3-2", to: "hex-4-2"})
            if (move.to) {
                const match = move.to.match(/hex-(\d+)-(\d+)/);
                if (match) {
                    const row = parseInt(match[1]);
                    const col = parseInt(match[2]);
                    const index = row * 7 + col; // Convert to linear index
                    
                    if (index >= 0 && index < 169) {
                        tensor[index] = 1.0; // One-hot encoding
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to parse move:', e);
        }

        return tf.tensor1d(tensor);
    }

    /**
     * Stop training
     */
    stopTraining() {
        this.shouldStop = true;
        console.log('🛑 Stopping training...');
    }

    /**
     * Save model to browser storage
     */
    async saveModel(name = 'romgon-ai-v1') {
        if (!this.model) {
            throw new Error('No model to save');
        }

        try {
            await this.model.save(`localstorage://${name}`);
            console.log(`✅ Model saved: ${name}`);
            
            // Save metadata
            const metadata = {
                name: name,
                timestamp: new Date().toISOString(),
                trainingExamples: this.trainingData.length,
                architecture: this.getModelArchitecture()
            };
            localStorage.setItem(`${name}-metadata`, JSON.stringify(metadata));
            
            return name;
        } catch (error) {
            console.error('Failed to save model:', error);
            throw error;
        }
    }

    /**
     * Load model from browser storage
     */
    async loadModel(name = 'romgon-ai-v1') {
        try {
            this.model = await tf.loadLayersModel(`localstorage://${name}`);
            console.log(`✅ Model loaded: ${name}`);
            
            // Load metadata
            const metadataStr = localStorage.getItem(`${name}-metadata`);
            if (metadataStr) {
                const metadata = JSON.parse(metadataStr);
                console.log('Model metadata:', metadata);
            }
            
            return this.model;
        } catch (error) {
            console.error('Failed to load model:', error);
            throw error;
        }
    }

    /**
     * Export model for download
     */
    async exportModel(name = 'romgon-ai-model') {
        if (!this.model) {
            throw new Error('No model to export');
        }

        try {
            const saveResult = await this.model.save(`downloads://${name}`);
            console.log('✅ Model exported');
            return saveResult;
        } catch (error) {
            console.error('Failed to export model:', error);
            throw error;
        }
    }

    /**
     * Predict best move for given position
     */
    async predictMove(boardPosition) {
        if (!this.model) {
            throw new Error('No model loaded');
        }

        try {
            const input = this.positionToTensor(boardPosition);
            const prediction = this.model.predict(tf.expandDims(input, 0));
            
            // Get top moves
            const probabilities = await prediction.data();
            const topMoves = this.getTopKMoves(probabilities, 5);
            
            // Cleanup
            input.dispose();
            prediction.dispose();
            
            return topMoves;
        } catch (error) {
            console.error('Prediction failed:', error);
            throw error;
        }
    }

    /**
     * Get top K moves from prediction
     */
    getTopKMoves(probabilities, k = 5) {
        const moves = [];
        
        for (let i = 0; i < probabilities.length; i++) {
            moves.push({
                index: i,
                probability: probabilities[i],
                move: this.indexToMove(i)
            });
        }
        
        // Sort by probability
        moves.sort((a, b) => b.probability - a.probability);
        
        return moves.slice(0, k);
    }

    /**
     * Convert index to move notation
     */
    indexToMove(index) {
        const row = Math.floor(index / 7);
        const col = index % 7;
        return {
            to: `hex-${row}-${col}`,
            coordinates: { row, col }
        };
    }

    /**
     * Get model architecture info
     */
    getModelArchitecture() {
        if (!this.model) return null;
        
        return {
            layers: this.model.layers.length,
            parameters: this.model.countParams(),
            inputShape: this.model.inputs[0].shape,
            outputShape: this.model.outputs[0].shape
        };
    }

    /**
     * List saved models in browser storage
     */
    static async listSavedModels() {
        const models = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.endsWith('-metadata')) {
                const metadataStr = localStorage.getItem(key);
                try {
                    const metadata = JSON.parse(metadataStr);
                    models.push(metadata);
                } catch (e) {
                    // Skip invalid metadata
                }
            }
        }
        
        return models;
    }

    /**
     * Delete saved model
     */
    static async deleteModel(name) {
        try {
            // Remove model from IndexedDB
            await tf.io.removeModel(`localstorage://${name}`);
            // Remove metadata
            localStorage.removeItem(`${name}-metadata`);
            console.log(`✅ Model deleted: ${name}`);
        } catch (error) {
            console.error('Failed to delete model:', error);
            throw error;
        }
    }
}

// Export for use in dashboard
if (typeof window !== 'undefined') {
    window.RomgonAITrainer = RomgonAITrainer;
}

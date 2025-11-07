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
            const response = await fetch(`https://api.romgon.net/api/ai-training/training-data?limit=${limit}&minRating=${minRating}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            
            if (!data.success || !data.games) {
                throw new Error('Invalid response format from server');
            }
            
            const games = data.games;
            this.trainingData = this.processGames(games);
            
            console.log(`✅ Loaded ${this.trainingData.length} training examples from ${games.length} games`);
            return {
                examples: this.trainingData.length,
                games: games.length
            };
        } catch (error) {
            console.error('Failed to load training data:', error);
            throw error;
        }
    }

    /**
     * Load training data from RMN files
     */
    async loadFromRMNFiles(files) {
        const rmnGames = [];
        let totalMoves = 0;

        for (const file of files) {
            try {
                const content = await this.readFileAsText(file);
                const game = this.parseRMNFile(content, file.name);
                
                if (game && game.moves.length > 0) {
                    rmnGames.push(game);
                    totalMoves += game.moves.length;
                    console.log(`✅ Parsed ${file.name}: ${game.moves.length} moves`);
                }
            } catch (error) {
                console.error(`Failed to parse ${file.name}:`, error);
            }
        }

        // Convert RMN games to training examples
        const newExamples = this.processRMNGames(rmnGames);
        
        // Add to existing training data or replace
        this.trainingData = this.trainingData.concat(newExamples);
        
        console.log(`✅ Loaded ${newExamples.length} training examples from ${rmnGames.length} RMN files (${totalMoves} moves)`);
        
        return {
            files: rmnGames.length,
            moves: totalMoves,
            examples: newExamples.length
        };
    }

    /**
     * Load training data from RPN files
     */
    async loadFromRPNFiles(files) {
        const rpnStrings = [];
        const positionsPerFile = {};
        
        for (const file of files) {
            try {
                const text = await this.readFileAsText(file);
                const lines = text.split('\n').filter(line => line.trim());
                positionsPerFile[file.name] = lines.length;
                rpnStrings.push(...lines);
            } catch (error) {
                console.error(`Error reading ${file.name}:`, error);
            }
        }

        const result = await this.loadFromRPNStrings(rpnStrings);
        result.positionsPerFile = positionsPerFile;
        return result;
    }

    /**
     * Load training data from RPN strings
     */
    async loadFromRPNStrings(rpnStrings) {
        let totalExamples = 0;
        
        for (const rpnString of rpnStrings) {
            try {
                const data = this.parseRPNString(rpnString);
                if (data) {
                    // Each RPN position is a training example
                    // Input: board position, Output: the move that was made
                    this.trainingData.push({
                        position: data.position,
                        move: data.move,
                        player: data.player
                    });
                    totalExamples++;
                }
            } catch (error) {
                console.error('Error parsing RPN string:', error, rpnString);
            }
        }

        return {
            positions: rpnStrings.length,
            examples: totalExamples,
            files: 1
        };
    }

    /**
     * Parse single RPN string
     */
    parseRPNString(rpnString) {
        // RPN format: "board_encoding player move_number ... last_moves current_player - -"
        // Example: "5s/T0S3h0t0/8/RC4r2/H06c/T05t0/S4s b 2 - - - r3-8>3-6;C2-0>3-1;h2-7>1-5;S0-0>1-1 white - -"
        
        const parts = rpnString.trim().split(/\s+/);
        if (parts.length < 7) return null;

        const boardEncoding = parts[0]; // "5s/T0S3h0t0/8/RC4r2/H06c/T05t0/S4s"
        const player = parts[1]; // "b" or "w"
        const moveNumber = parseInt(parts[2]); // 2
        
        // Find move history (semicolon-separated moves)
        const moveHistoryIndex = parts.findIndex(p => p.includes(';') || p.includes('>'));
        if (moveHistoryIndex === -1) return null;
        
        const moveHistory = parts[moveHistoryIndex]; // "r3-8>3-6;C2-0>3-1;h2-7>1-5;S0-0>1-1"
        const moves = moveHistory.split(';');
        
        // Get the last move (most recent)
        const lastMove = moves[moves.length - 1]; // "S0-0>1-1"
        
        // Parse move format: "piece_coordinate>destination_coordinate"
        const moveMatch = lastMove.match(/([A-Za-z])(\d+-\d+)>(\d+-\d+)/);
        if (!moveMatch) return null;
        
        const [_, piece, from, to] = moveMatch;
        
        // Convert board encoding to position array
        const position = this.boardEncodingToPosition(boardEncoding);
        
        // Convert move to training format
        const moveData = {
            from: from, // "0-0"
            to: to,     // "1-1"
            piece: piece // "S"
        };

        return {
            position: position,
            move: moveData,
            player: player === 'w' ? 'white' : 'black',
            moveNumber: moveNumber
        };
    }

    /**
     * Convert RPN board encoding to position array
     */
    boardEncodingToPosition(encoding) {
        // RPN encoding uses rows separated by "/"
        // Each row: number = empty cells, piece = occupied cell
        // Example: "5s/T0S3h0t0/8/RC4r2/H06c/T05t0/S4s"
        
        const position = Array(7).fill(null).map(() => Array(7).fill(null));
        const rows = encoding.split('/');
        
        for (let row = 0; row < rows.length && row < 7; row++) {
            const rowStr = rows[row];
            let col = 0;
            
            for (let i = 0; i < rowStr.length; i++) {
                const char = rowStr[i];
                
                if (/\d/.test(char)) {
                    // Number = skip empty cells
                    col += parseInt(char);
                } else {
                    // Letter = piece
                    if (col < 7) {
                        // Uppercase = white, lowercase = black
                        const isWhite = char === char.toUpperCase();
                        const pieceType = char.toUpperCase();
                        
                        position[row][col] = {
                            type: pieceType,
                            player: isWhite ? 'white' : 'black',
                            row: row,
                            col: col
                        };
                        col++;
                    }
                }
            }
        }

        return position;
    }

    /**
     * Read file as text
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    /**
     * Parse RMN file format
     */
    parseRMNFile(content, filename) {
        const lines = content.split('\n');
        const game = {
            filename: filename,
            metadata: {},
            moves: [],
            result: null
        };

        let movesSection = false;

        for (let line of lines) {
            line = line.trim();
            
            // Skip empty lines
            if (!line) continue;

            // Parse metadata (lines starting with [)
            if (line.startsWith('[') && line.endsWith(']')) {
                const match = line.match(/\[(\w+)\s+"(.+)"\]/);
                if (match) {
                    const [, key, value] = match;
                    game.metadata[key] = value;
                    
                    // Extract result
                    if (key === 'Result') {
                        game.result = value;
                    }
                }
                continue;
            }

            // Parse moves (numbered lines like "1. e4 e5")
            if (/^\d+\./.test(line)) {
                movesSection = true;
                
                // Extract move pairs
                const moveMatch = line.match(/^\d+\.\s+(\S+)(?:\s+(\S+))?/);
                if (moveMatch) {
                    const [, whiteMove, blackMove] = moveMatch;
                    
                    if (whiteMove && whiteMove !== '...') {
                        game.moves.push({
                            color: 'white',
                            notation: whiteMove,
                            moveNumber: game.moves.length + 1
                        });
                    }
                    
                    if (blackMove && blackMove !== '...') {
                        game.moves.push({
                            color: 'black',
                            notation: blackMove,
                            moveNumber: game.moves.length + 1
                        });
                    }
                }
            }
        }

        return game;
    }

    /**
     * Process RMN games into training examples
     */
    processRMNGames(games) {
        const examples = [];
        
        games.forEach(game => {
            // Determine quality based on result
            const quality = this.evaluateGameQuality(game);
            
            // Assign estimated rating based on metadata or use default
            const rating = parseInt(game.metadata.WhiteElo || game.metadata.BlackElo) || 1500;
            
            // Reconstruct board positions from moves
            let currentPosition = this.getStartingPosition();
            
            game.moves.forEach((move, index) => {
                // Create training example from this position and move
                examples.push({
                    position: currentPosition,
                    move: this.parseMoveNotation(move.notation),
                    rating: rating,
                    quality: quality,
                    color: move.color,
                    moveNumber: move.moveNumber,
                    gameResult: game.result
                });
                
                // Update position (simplified - assumes move is valid)
                currentPosition = this.applyMove(currentPosition, move.notation);
            });
        });
        
        console.log(`Processed ${examples.length} training examples from ${games.length} games`);
        return examples;
    }

    /**
     * Evaluate game quality based on result and moves
     */
    evaluateGameQuality(game) {
        // If game has a decisive result, it's likely better quality
        if (game.result === '1-0' || game.result === '0-1') {
            return 'good';
        }
        
        // Longer games might be more instructive
        if (game.moves.length > 40) {
            return 'good';
        }
        
        return 'neutral';
    }

    /**
     * Get starting board position in RPN format
     */
    getStartingPosition() {
        // Standard Romgon starting position
        // This is a placeholder - should match your actual RPN format
        return 'starting_position_rpn';
    }

    /**
     * Parse move notation (like "Rh3-h4" or "Te3@60")
     */
    parseMoveNotation(notation) {
        // Parse notation into move object
        // Examples: "Rh3-h4" (rhombus from h3 to h4)
        //          "Te3@60" (triangle at e3 rotates 60 degrees)
        
        const moveMatch = notation.match(/([STRHCG])([a-g][0-6])-([a-g][0-6])/);
        const rotateMatch = notation.match(/([TH])([a-g][0-6])@(\d+)/);
        
        if (moveMatch) {
            const [, piece, from, to] = moveMatch;
            return {
                type: 'move',
                piece: this.pieceCodeToPiece(piece),
                from: this.notationToHex(from),
                to: this.notationToHex(to)
            };
        }
        
        if (rotateMatch) {
            const [, piece, pos, angle] = rotateMatch;
            return {
                type: 'rotate',
                piece: this.pieceCodeToPiece(piece),
                position: this.notationToHex(pos),
                angle: parseInt(angle)
            };
        }
        
        // Fallback
        return {
            type: 'move',
            from: 'hex-0-0',
            to: 'hex-1-0'
        };
    }

    /**
     * Convert piece code to piece name
     */
    pieceCodeToPiece(code) {
        const pieces = {
            'S': 'square',
            'T': 'triangle',
            'R': 'rhombus',
            'H': 'hexagon',
            'C': 'circle',
            'G': 'gateway'
        };
        return pieces[code] || 'unknown';
    }

    /**
     * Convert algebraic notation to hex ID (e.g., "e3" -> "hex-3-4")
     */
    notationToHex(notation) {
        // Convert chess-like notation to hex coordinates
        const col = notation.charCodeAt(0) - 'a'.charCodeAt(0);
        const row = parseInt(notation[1]);
        return `hex-${row}-${col}`;
    }

    /**
     * Apply move to position (simplified)
     */
    applyMove(position, moveNotation) {
        // This is a placeholder - actual implementation would update the board
        // For training, we can use the move sequence as-is
        return position + '_' + moveNotation;
    }

    /**
     * Process games into training examples
     */
    processGames(games) {
        const examples = [];
        
        games.forEach(game => {
            // Skip games without moves or result
            if (!game.moves || !Array.isArray(game.moves) || game.moves.length === 0) {
                console.log(`Skipping game ${game.id}: no moves`);
                return;
            }
            
            if (!game.result) {
                console.log(`Skipping game ${game.id}: no result`);
                return;
            }
            
            // Reconstruct board state and learn from each move
            let position = this.getStartingPosition();
            const playerRating = game.whiteRating || game.blackRating || 1500;
            
            game.moves.forEach((move, index) => {
                try {
                    // Each move should have: from, to, piece info
                    if (move && move.from && move.to) {
                        examples.push({
                            position: JSON.parse(JSON.stringify(position)), // Deep copy
                            move: {
                                from: move.from,
                                to: move.to,
                                piece: move.piece || move.pieceType
                            },
                            rating: playerRating,
                            quality: 'good', // We assume completed games have decent moves
                            gameResult: game.result,
                            moveNumber: index + 1
                        });
                        
                        // Update position for next move (simplified - just track we made a move)
                        position = this.applyMoveToPosition(position, move);
                    }
                } catch (e) {
                    console.warn(`Failed to process move ${index} in game ${game.id}:`, e);
                }
            });
        });
        
        console.log(`Processed ${examples.length} valid training examples from ${games.length} games`);
        return examples;
    }

    /**
     * Get starting board position
     */
    getStartingPosition() {
        // Return a 7x7 board with starting pieces
        // This is a simplified representation - you may need to adjust based on your actual board
        const position = Array(7).fill(null).map(() => Array(7).fill(null));
        
        // Set up initial pieces (example - adjust to your actual starting position)
        // This is a placeholder - you'll need your actual starting setup
        return position;
    }

    /**
     * Apply move to position (simplified)
     */
    applyMoveToPosition(position, move) {
        // Create a copy
        const newPosition = JSON.parse(JSON.stringify(position));
        
        try {
            // Parse coordinates like "0-0" to row=0, col=0
            const [fromRow, fromCol] = move.from.split('-').map(Number);
            const [toRow, toCol] = move.to.split('-').map(Number);
            
            // Move the piece
            if (newPosition[fromRow] && newPosition[fromRow][fromCol]) {
                newPosition[toRow][toCol] = newPosition[fromRow][fromCol];
                newPosition[fromRow][fromCol] = null;
            }
        } catch (e) {
            console.warn('Failed to apply move:', e);
        }
        
        return newPosition;
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
                        
                        // Safely access log properties (they may be undefined)
                        if (logs.loss !== undefined) {
                            console.log(`  Loss: ${logs.loss.toFixed(4)}`);
                        }
                        if (logs.acc !== undefined) {
                            console.log(`  Accuracy: ${(logs.acc * 100).toFixed(2)}%`);
                        }
                        if (logs.val_loss !== undefined) {
                            console.log(`  Val Loss: ${logs.val_loss.toFixed(4)}`);
                        }
                        if (logs.val_acc !== undefined) {
                            console.log(`  Val Accuracy: ${(logs.val_acc * 100).toFixed(2)}%`);
                        }
                        
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
     * Convert board position to tensor
     */
    positionToTensor(position) {
        // Create 169-element tensor (7x7 grid + piece info)
        const tensor = new Float32Array(169);
        
        try {
            // Check if position is a string (RPN format) or array (board state)
            if (typeof position === 'string') {
                // RPN string format
                const parts = position.split(' ');
                const boardPart = parts[0] || '';
                
                // Fill tensor based on board state
                for (let i = 0; i < Math.min(boardPart.length, 169); i++) {
                    const char = boardPart[i];
                    // Map characters to piece values
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
            } else if (Array.isArray(position)) {
                // 2D array format (7x7 board)
                for (let row = 0; row < 7; row++) {
                    for (let col = 0; col < 7; col++) {
                        const cell = position[row] && position[row][col];
                        const index = row * 7 + col;
                        
                        if (cell && cell.type) {
                            // Map piece types to values
                            const pieceValue = this.getPieceValue(cell.type);
                            const multiplier = cell.player === 'white' ? 1 : -1;
                            tensor[index] = pieceValue * multiplier;
                        } else {
                            tensor[index] = 0; // empty
                        }
                    }
                }
            } else {
                console.warn('Unknown position format:', typeof position);
            }
        } catch (e) {
            console.error('Failed to parse position:', e);
            // Return zero tensor on error
        }

        return tf.tensor1d(tensor);
    }

    /**
     * Get numeric value for piece type
     */
    getPieceValue(pieceType) {
        const types = {
            'S': 1,  // Square
            'T': 2,  // Triangle  
            'R': 3,  // Rhombus
            'C': 4,  // Circle
            'H': 5,  // Hexagon
            'G': 6   // Gateway
        };
        return types[pieceType.toUpperCase()] || 0;
    }

    /**
     * Convert move to one-hot tensor
     */
    moveToTensor(move) {
        // Create 169-element one-hot tensor (one for each possible destination)
        const tensor = new Float32Array(169);
        
        try {
            // Parse move notation - handle different formats
            let row, col;
            
            if (move.to) {
                // Format 1: "hex-3-2" or similar
                const hexMatch = move.to.match(/hex-(\d+)-(\d+)/);
                if (hexMatch) {
                    row = parseInt(hexMatch[1]);
                    col = parseInt(hexMatch[2]);
                }
                // Format 2: "3-2" (just coordinates)
                else {
                    const coordMatch = move.to.match(/(\d+)-(\d+)/);
                    if (coordMatch) {
                        row = parseInt(coordMatch[1]);
                        col = parseInt(coordMatch[2]);
                    }
                }
                
                // Convert to linear index
                if (row !== undefined && col !== undefined) {
                    const index = row * 7 + col;
                    
                    if (index >= 0 && index < 169) {
                        tensor[index] = 1.0; // One-hot encoding
                    }
                }
            }
        } catch (e) {
            console.error('Failed to parse move:', e, move);
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

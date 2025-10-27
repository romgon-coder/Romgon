// ============================================
// ROMGON AI - REINFORCEMENT LEARNING ENGINE
// ============================================

const { evaluatePosition, findBestMove } = require('../engine/romgon-engine');

class RomgonAI {
    constructor(level = 1) {
        this.level = level; // 1-10 difficulty
        this.gamesPlayed = 0;
        this.wins = 0;
        this.losses = 0;
        this.draws = 0;
        
        // Q-Learning parameters
        this.learningRate = 0.1;
        this.discountFactor = 0.9;
        this.explorationRate = 0.2; // Epsilon for exploration vs exploitation
        
        // Position evaluation memory (simple Q-table)
        this.positionValues = new Map();
        
        // Performance metrics
        this.averageGameLength = 0;
        this.totalMoves = 0;
    }

    /**
     * Get AI move with learning
     */
    async getMove(gameState, playerColor) {
        const moveStartTime = Date.now();
        
        // Use engine to find candidate moves
        const candidateMoves = await this.findCandidateMoves(gameState, playerColor);
        
        if (candidateMoves.length === 0) {
            return null; // No legal moves
        }

        // Exploration vs Exploitation
        let selectedMove;
        if (Math.random() < this.explorationRate) {
            // Explore: Random move
            selectedMove = candidateMoves[Math.floor(Math.random() * candidateMoves.length)];
            selectedMove.isExploration = true;
        } else {
            // Exploit: Best known move
            selectedMove = this.selectBestMove(candidateMoves, gameState);
            selectedMove.isExploration = false;
        }

        const thinkingTime = Date.now() - moveStartTime;
        selectedMove.thinkingTime = thinkingTime;
        
        return selectedMove;
    }

    /**
     * Find candidate moves using the engine
     */
    async findCandidateMoves(gameState, playerColor) {
        // Use existing engine to generate legal moves
        const result = await findBestMove(gameState, playerColor, this.level);
        
        if (result && result.candidateMoves) {
            return result.candidateMoves.map(move => ({
                ...move,
                qValue: this.getQValue(gameState, move)
            }));
        }
        
        return [];
    }

    /**
     * Select best move based on Q-values
     */
    selectBestMove(candidateMoves, gameState) {
        // Sort by Q-value and evaluation
        candidateMoves.sort((a, b) => {
            const scoreA = (a.qValue || 0) + (a.evaluation || 0) / 100;
            const scoreB = (b.qValue || 0) + (b.evaluation || 0) / 100;
            return scoreB - scoreA;
        });
        
        return candidateMoves[0];
    }

    /**
     * Get Q-value for a position after a move
     */
    getQValue(gameState, move) {
        const positionHash = this.hashPosition(gameState, move);
        return this.positionValues.get(positionHash) || 0;
    }

    /**
     * Update Q-value after game result
     */
    updateQValue(gameState, move, reward, nextGameState) {
        const positionHash = this.hashPosition(gameState, move);
        const currentQ = this.getQValue(gameState, move);
        
        // Q-Learning update rule: Q(s,a) = Q(s,a) + α[r + γ*maxQ(s',a') - Q(s,a)]
        const maxNextQ = this.getMaxQValue(nextGameState);
        const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
        
        this.positionValues.set(positionHash, newQ);
    }

    /**
     * Get maximum Q-value for next state
     */
    getMaxQValue(gameState) {
        // Simplified: return 0 for terminal states
        if (!gameState || gameState.gameOver) {
            return 0;
        }
        
        // Could be improved by evaluating all possible moves
        return 0;
    }

    /**
     * Hash a position for Q-table lookup
     */
    hashPosition(gameState, move) {
        // Simple hash: concatenate move notation and piece count
        const moveStr = move ? `${move.from}-${move.to}` : 'start';
        const pieces = gameState.board ? JSON.stringify(gameState.board).length : 0;
        return `${moveStr}_${pieces}`;
    }

    /**
     * Learn from game result
     */
    learnFromGame(gameHistory, result) {
        this.gamesPlayed++;
        
        // Update stats
        if (result === 'win') {
            this.wins++;
        } else if (result === 'loss') {
            this.losses++;
        } else {
            this.draws++;
        }

        // Update Q-values for all moves in the game
        for (let i = 0; i < gameHistory.length - 1; i++) {
            const { gameState, move, playerColor } = gameHistory[i];
            const nextState = gameHistory[i + 1].gameState;
            
            // Calculate reward
            let reward = 0;
            if (i === gameHistory.length - 2) {
                // Final move
                if (result === 'win') {
                    reward = 1;
                } else if (result === 'loss') {
                    reward = -1;
                } else {
                    reward = 0;
                }
            } else {
                // Intermediate move: small positive for progress
                reward = 0.01;
            }
            
            this.updateQValue(gameState, move, reward, nextState);
        }

        // Update exploration rate (decay over time)
        this.explorationRate = Math.max(0.05, this.explorationRate * 0.995);
        
        // Update average game length
        this.totalMoves += gameHistory.length;
        this.averageGameLength = this.totalMoves / this.gamesPlayed;
    }

    /**
     * Get AI statistics
     */
    getStats() {
        const winRate = this.gamesPlayed > 0 ? (this.wins / this.gamesPlayed * 100).toFixed(1) : 0;
        const lossRate = this.gamesPlayed > 0 ? (this.losses / this.gamesPlayed * 100).toFixed(1) : 0;
        const drawRate = this.gamesPlayed > 0 ? (this.draws / this.gamesPlayed * 100).toFixed(1) : 0;
        
        return {
            level: this.level,
            gamesPlayed: this.gamesPlayed,
            wins: this.wins,
            losses: this.losses,
            draws: this.draws,
            winRate: parseFloat(winRate),
            lossRate: parseFloat(lossRate),
            drawRate: parseFloat(drawRate),
            averageGameLength: Math.round(this.averageGameLength),
            explorationRate: (this.explorationRate * 100).toFixed(1),
            knownPositions: this.positionValues.size
        };
    }

    /**
     * Save AI state
     */
    serialize() {
        return {
            level: this.level,
            gamesPlayed: this.gamesPlayed,
            wins: this.wins,
            losses: this.losses,
            draws: this.draws,
            explorationRate: this.explorationRate,
            positionValues: Array.from(this.positionValues.entries()),
            totalMoves: this.totalMoves,
            averageGameLength: this.averageGameLength
        };
    }

    /**
     * Load AI state
     */
    static deserialize(data) {
        const ai = new RomgonAI(data.level);
        ai.gamesPlayed = data.gamesPlayed || 0;
        ai.wins = data.wins || 0;
        ai.losses = data.losses || 0;
        ai.draws = data.draws || 0;
        ai.explorationRate = data.explorationRate || 0.2;
        ai.totalMoves = data.totalMoves || 0;
        ai.averageGameLength = data.averageGameLength || 0;
        
        if (data.positionValues) {
            ai.positionValues = new Map(data.positionValues);
        }
        
        return ai;
    }
}

module.exports = { RomgonAI };

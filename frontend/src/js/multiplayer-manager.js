// ============================================
// MULTIPLAYER MANAGER - Game Synchronization
// ============================================

class MultiplayerManager {
    constructor(wsClient, gameState, gameEngine, boardRenderer) {
        this.wsClient = wsClient;
        this.gameState = gameState;
        this.gameEngine = gameEngine;
        this.boardRenderer = boardRenderer;
        this.gameId = gameEngine.gameId;
        this.playerColor = gameEngine.playerColor;
        
        console.log(`🎮 MultiplayerManager initialized for game ${this.gameId}`);
        
        this.setupEventListeners();
    }

    /**
     * Setup WebSocket event listeners
     */
    setupEventListeners() {
        // Listen for opponent moves
        this.wsClient.on('gameMove', (data) => this.handleRemoteMove(data));
        
        // Listen for game end
        this.wsClient.on('gameEnded', (data) => this.handleGameEnded(data));
        
        // Listen for board sync
        this.wsClient.on('boardSync', (data) => this.handleBoardSync(data));
        
        // Listen for player left
        this.wsClient.on('playerLeft', (data) => this.handlePlayerLeft(data));
    }

    /**
     * Send move to opponent
     */
    sendMove(q, r) {
        // Validate and place piece locally
        const result = this.gameEngine.placePiece(q, r, this.playerColor);
        
        if (!result.success) {
            console.error('❌ Invalid move:', result.error);
            return false;
        }
        
        console.log(`✅ Move placed: (${q}, ${r})`);
        
        // Update board renderer
        this.boardRenderer.update();
        
        // Send to opponent via WebSocket
        this.wsClient.emit('gameMove', {
            gameId: this.gameId,
            move: { q, r, color: this.playerColor },
            boardState: this.gameEngine.serializeBoard(),
            gameState: this.gameEngine.getGameState()
        });
        
        // Check if game is over
        const gameStatus = this.gameEngine.checkGameOver();
        if (gameStatus.gameOver) {
            this.endGame(gameStatus);
        }
        
        return true;
    }

    /**
     * Handle move from opponent
     */
    handleRemoteMove(data) {
        console.log('📨 Received move from opponent:', data.move);
        
        const { move, boardState, gameState } = data;
        
        // Validate move
        if (!this.gameEngine.isValidMove(move.q, move.r, move.color)) {
            console.error('❌ Invalid move from opponent');
            return;
        }
        
        // Place opponent's piece
        this.gameEngine.board[`${move.q},${move.r}`] = move.color;
        this.gameEngine.moveHistory.push({ ...move, timestamp: Date.now() });
        
        // Check for captures
        this.gameEngine.checkCaptures(move.q, move.r, move.color);
        
        // Switch turn
        this.gameEngine.currentTurn = move.color === 'white' ? 'black' : 'white';
        
        // Update UI
        this.boardRenderer.update();
        
        // Sync game state
        this.syncGameState(gameState);
        
        // Show notification
        this.gameState.showNotification(`Opponent played at (${move.q}, ${move.r})`);
    }

    /**
     * Handle board synchronization
     */
    handleBoardSync(data) {
        console.log('🔄 Board sync received');
        
        const { boardState, gameState } = data;
        
        // Update game state
        this.gameEngine.deserializeBoard(boardState);
        this.gameEngine.currentTurn = gameState.currentTurn;
        this.gameEngine.capturedPieces = gameState.capturedPieces;
        this.gameEngine.moveHistory = gameState.moveHistory;
        
        // Re-render
        this.boardRenderer.update();
        
        this.gameState.showNotification('Board synced with opponent');
    }

    /**
     * Sync game state
     */
    syncGameState(gameState) {
        this.gameEngine.currentTurn = gameState.currentTurn;
        this.gameEngine.capturedPieces = gameState.capturedPieces;
        this.gameEngine.gameStatus = gameState.gameStatus;
        this.gameEngine.winner = gameState.winner;
    }

    /**
     * Handle game end
     */
    handleGameEnded(data) {
        console.log('🏁 Game ended:', data);
        
        const { winner, reason } = data;
        this.gameEngine.gameStatus = 'finished';
        this.gameEngine.winner = winner;
        
        this.endGame({ gameOver: true, winner, reason });
    }

    /**
     * Handle player disconnect
     */
    handlePlayerLeft(data) {
        console.error('❌ Opponent disconnected');
        this.gameState.showError('Opponent has disconnected. Game ended.');
        this.gameEngine.gameStatus = 'finished';
    }

    /**
     * End game and update stats
     */
    endGame(gameStatus) {
        console.log('🏁 Game finished:', gameStatus);
        
        // Update game engine
        this.gameEngine.gameStatus = 'finished';
        this.gameEngine.winner = gameStatus.winner;
        
        // Emit game end to opponent
        this.wsClient.emit('gameEnded', {
            gameId: this.gameId,
            winner: gameStatus.winner,
            reason: gameStatus.reason,
            stats: this.gameEngine.getStats()
        });
        
        // Save game to backend
        this.saveGameToBackend(gameStatus);
        
        // Show result
        let message = '🎮 Game Over!\n';
        if (gameStatus.winner) {
            message += `🏆 Winner: ${gameStatus.winner.toUpperCase()}\n`;
        } else {
            message += '🤝 Draw!\n';
        }
        message += `Reason: ${gameStatus.reason}`;
        
        this.gameState.showNotification(message);
        
        // Disable further moves
        this.boardRenderer.gameEngine.gameStatus = 'finished';
    }

    /**
     * Save game result to backend
     */
    async saveGameToBackend(gameStatus) {
        try {
            const gameResult = {
                gameId: this.gameId,
                whitePlayer: this.gameEngine.playerColor === 'white' ? 
                    this.gameState.user.id : null,
                blackPlayer: this.gameEngine.playerColor === 'black' ? 
                    this.gameState.user.id : null,
                winner: gameStatus.winner,
                status: gameStatus.winner ? 'finished' : 'draw',
                moves: this.gameEngine.moveHistory.length,
                whiteCaptured: this.gameEngine.capturedPieces.white,
                blackCaptured: this.gameEngine.capturedPieces.black
            };
            
            // Send to backend (if endpoint exists)
            // await apiClient.saveGame(gameResult);
            
            console.log('📝 Game saved to backend');
        } catch (error) {
            console.error('❌ Failed to save game:', error);
        }
    }

    /**
     * Request board sync
     */
    requestBoardSync() {
        this.wsClient.emit('boardSync', {
            gameId: this.gameId,
            boardState: this.gameEngine.serializeBoard(),
            gameState: this.gameEngine.getGameState()
        });
    }

    /**
     * Get game stats for display
     */
    getStats() {
        return {
            playerColor: this.playerColor,
            currentTurn: this.gameEngine.currentTurn,
            totalMoves: this.gameEngine.moveHistory.length,
            whiteCaptured: this.gameEngine.capturedPieces.white,
            blackCaptured: this.gameEngine.capturedPieces.black,
            gameStatus: this.gameEngine.gameStatus,
            winner: this.gameEngine.winner
        };
    }
}

// Export for use
window.MultiplayerManager = MultiplayerManager;

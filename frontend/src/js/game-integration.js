// ============================================
// GAME INTEGRATION - UI to Engine Bridge
// ============================================

class GameIntegration {
    constructor() {
        this.gameEngine = null;
        this.boardRenderer = null;
        this.multiplayerManager = null;
    }

    /**
     * Initialize a new game
     */
    async initializeGame(gameData) {
        console.log('🎮 Initializing game:', gameData);
        
        try {
            // Create game engine
            this.gameEngine = new GameEngine(
                gameData.gameId,
                gameData.playerColor,
                8 // board size
            );
            
            // Wait for DOM to be ready
            const boardContainer = document.getElementById('game-board');
            if (!boardContainer) {
                throw new Error('Game board container not found');
            }
            
            // Create board renderer
            this.boardRenderer = new BoardRenderer(
                'game-board',
                this.gameEngine,
                (q, r) => this.handlePlayerMove(q, r)
            );
            
            // Create multiplayer manager
            this.multiplayerManager = new MultiplayerManager(
                wsClient,
                gameState,
                this.gameEngine,
                this.boardRenderer
            );
            
            // Update UI
            this.updateGameUI();
            
            console.log('✅ Game initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            gameState.showError('Failed to initialize game');
            return false;
        }
    }

    /**
     * Handle player move
     */
    handlePlayerMove(q, r) {
        if (!this.gameEngine || this.gameEngine.gameStatus !== 'active') {
            return;
        }
        
        if (this.gameEngine.currentTurn !== this.gameEngine.playerColor) {
            gameState.showNotification('⏳ Waiting for opponent...');
            return;
        }
        
        console.log(`🎮 Player moving to (${q}, ${r})`);
        const success = this.multiplayerManager.sendMove(q, r);
        
        if (success) {
            this.updateGameUI();
        }
    }

    /**
     * Update game UI elements
     */
    updateGameUI() {
        if (!this.gameEngine) return;
        
        const stats = this.multiplayerManager.getStats();
        
        // Update status
        const statusEl = document.getElementById('game-status');
        if (statusEl) {
            if (this.gameEngine.gameStatus === 'finished') {
                if (this.gameEngine.winner === 'white') {
                    statusEl.textContent = '🏆 White wins!';
                } else if (this.gameEngine.winner === 'black') {
                    statusEl.textContent = '🏆 Black wins!';
                } else {
                    statusEl.textContent = '🤝 Draw';
                }
            } else {
                const turn = stats.currentTurn === stats.playerColor ? '👉 Your turn' : '⏳ Opponent\'s turn';
                statusEl.textContent = `${turn} - Moves: ${stats.totalMoves}`;
            }
        }
        
        // Update player info
        const whiteInfo = document.getElementById('white-player-info');
        if (whiteInfo) {
            whiteInfo.innerHTML = `
                <p><strong>Pieces Captured:</strong> ${stats.whiteCaptured}</p>
                <p><strong>Status:</strong> ${stats.currentTurn === 'white' ? '🔴 Active' : '⚫ Waiting'}</p>
            `;
        }
        
        const blackInfo = document.getElementById('black-player-info');
        if (blackInfo) {
            blackInfo.innerHTML = `
                <p><strong>Pieces Captured:</strong> ${stats.blackCaptured}</p>
                <p><strong>Status:</strong> ${stats.currentTurn === 'black' ? '🔴 Active' : '⚫ Waiting'}</p>
            `;
        }
        
        // Update move info
        const moveInfo = document.getElementById('move-info');
        if (moveInfo) {
            const validMoves = this.gameEngine.getValidMoves(this.gameEngine.playerColor);
            moveInfo.innerHTML = `
                <p><strong>Total Moves:</strong> ${stats.totalMoves}</p>
                <p><strong>Valid Moves:</strong> ${validMoves.length}</p>
            `;
        }
    }

    /**
     * Handle resign
     */
    handleResign() {
        if (!this.gameEngine || this.gameEngine.gameStatus !== 'active') return;
        
        const opponent = this.gameEngine.playerColor === 'white' ? 'black' : 'white';
        
        this.multiplayerManager.endGame({
            gameOver: true,
            winner: opponent,
            reason: 'Opponent resigned'
        });
    }

    /**
     * Handle draw offer
     */
    handleDrawOffer() {
        gameState.showNotification('📨 Draw offer sent to opponent...');
        this.wsClient.emit('drawOffer', { gameId: this.gameEngine.gameId });
    }

    /**
     * Handle draw acceptance
     */
    handleDrawAcceptance() {
        this.multiplayerManager.endGame({
            gameOver: true,
            winner: null,
            reason: 'Draw accepted'
        });
    }

    /**
     * Get game stats
     */
    getStats() {
        if (!this.multiplayerManager) return null;
        return this.multiplayerManager.getStats();
    }

    /**
     * Cleanup on game end
     */
    cleanup() {
        if (this.boardRenderer) {
            this.boardRenderer.canvas.removeEventListener('click', null);
        }
        this.gameEngine = null;
        this.boardRenderer = null;
        this.multiplayerManager = null;
    }
}

// Create global instance
window.gameIntegration = new GameIntegration();

// Setup button handlers
document.addEventListener('DOMContentLoaded', () => {
    const resignBtn = document.getElementById('resign-btn');
    const drawBtn = document.getElementById('draw-btn');
    
    if (resignBtn) {
        resignBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to resign?')) {
                gameIntegration.handleResign();
            }
        });
    }
    
    if (drawBtn) {
        drawBtn.addEventListener('click', () => {
            gameIntegration.handleDrawOffer();
        });
    }
});

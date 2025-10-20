// ============================================
// MAIN APPLICATION INITIALIZATION
// ============================================

class ROMGONApp {
    constructor() {
        this.uiManager = uiManager;
        this.gameState = gameState;
        this.apiClient = apiClient;
        this.wsClient = wsClient;
    }

    /**
     * Initialize application
     */
    async init() {
        console.log('🎮 Initializing ROMGON Application...');

        try {
            // Wait for DOM to be fully ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve, { once: true });
                });
            }

            // Setup UI Manager with pages
            this.setupPages();

            // Setup event listeners
            this.setupEventListeners();

            // Check if user is already logged in
            if (this.gameState.isAuthenticated) {
                console.log('✅ User already authenticated');
                await this.initializeGame();
            } else {
                console.log('📝 Showing login page');
                await this.uiManager.showPage('auth');
            }

            // Setup state change listeners
            this.gameState.subscribe((event) => this.handleStateChange(event));

            console.log('✅ Application initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.uiManager.showError('Failed to initialize application');
        }
    }

    /**
     * Setup page components
     */
    setupPages() {
        this.uiManager.registerPage('auth', new AuthPage());
        this.uiManager.registerPage('lobby', new LobbyPage());
        this.uiManager.registerPage('game', new GamePage());
        this.uiManager.registerPage('waiting', new WaitingPage());
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle back button navigation
        window.addEventListener('popstate', () => {
            const page = this.gameState.uiState.currentPage;
            this.uiManager.showPage(page);
        });

        // Handle page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('📱 App hidden');
                if (this.wsClient.isConnected()) {
                    this.wsClient.leaveGame();
                }
            } else {
                console.log('📱 App visible');
                this.loadUserProfile();
            }
        });

        // Game start event
        this.wsClient.on('gameStart', (data) => this.handleGameStart(data));
        
        // Game join event
        this.wsClient.on('playerJoined', (data) => this.handlePlayerJoined(data));

        // Prevent accidental page unload during game
        window.addEventListener('beforeunload', (e) => {
            if (this.gameState.currentGame) {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave?';
            }
        });
    }

    /**
     * Initialize game after login
     */
    async initializeGame() {
        try {
            // Load user profile
            await this.loadUserProfile();

            // Connect to WebSocket
            if (this.gameState.user) {
                await this.wsClient.connect(this.gameState.user.id);
                console.log('✅ WebSocket connected');
            }

            // Navigate to lobby
            this.gameState.navigateTo('lobby');
            await this.uiManager.showPage('lobby');
        } catch (error) {
            console.error('❌ Failed to initialize game:', error);
            this.uiManager.showError('Failed to load game');
        }
    }

    /**
     * Load user profile
     */
    async loadUserProfile() {
        try {
            const profile = await this.apiClient.getCurrentUserProfile();
            this.gameState.setUser(profile);
            this.updatePlayerStats();
        } catch (error) {
            console.error('❌ Failed to load profile:', error);
        }
    }

    /**
     * Update player stats display
     */
    updatePlayerStats() {
        const user = this.gameState.user;
        if (!user) return;

        // Ensure stats object exists (may not be present on new registration)
        const stats = user.stats || { totalGames: 0, wins: 0, losses: 0, winRate: 0 };
        const tier = user.tier || { name: 'Unranked', emoji: '🎯' };

        // Update user info
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.textContent = `Rating: ${user.rating || 1600} • Games: ${stats.totalGames}`;
        }

        // Update stats cards
        const playerRating = document.getElementById('player-rating');
        if (playerRating) playerRating.textContent = user.rating || 1600;

        const playerTier = document.getElementById('player-tier');
        if (playerTier) playerTier.textContent = tier.name;

        const playerTierEmoji = document.getElementById('player-tier-emoji');
        if (playerTierEmoji) playerTierEmoji.textContent = tier.emoji;

        const playerGames = document.getElementById('player-games');
        if (playerGames) playerGames.textContent = stats.totalGames;

        const playerWins = document.getElementById('player-wins');
        if (playerWins) playerWins.textContent = stats.wins;

        const playerLosses = document.getElementById('player-losses');
        if (playerLosses) playerLosses.textContent = stats.losses;

        const winRate = stats.totalGames > 0 ? 
            (stats.wins / stats.totalGames * 100).toFixed(1) : 
            '0';
        const playerWinrate = document.getElementById('player-winrate');
        if (playerWinrate) playerWinrate.textContent = winRate + '%';
    }

    /**
     * Handle state changes
     */
    handleStateChange(event) {
        console.log('📊 State changed:', event);

        switch (event) {
            case 'user-changed':
                this.updatePlayerStats();
                break;

            case 'game-changed':
                this.handleGameStateChange();
                break;

            case 'navigation':
                const page = this.gameState.uiState.currentPage;
                this.uiManager.showPage(page);
                break;

            case 'ui-changed':
                this.updateUI();
                break;
        }
    }

    /**
     * Handle game state change
     */
    handleGameStateChange() {
        const game = this.gameState.currentGame;
        if (!game) return;

        console.log('🎮 Game state changed:', game);

        // Update game display
        const statusElement = document.getElementById('game-status');
        if (statusElement) {
            if (game.status === 'active') {
                statusElement.textContent = 'Game in progress...';
            } else {
                statusElement.textContent = `Game finished - Winner: ${game.winner}`;
            }
        }
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Show/hide loading spinner
        const uiState = this.gameState.uiState;
        if (uiState.loading) {
            this.uiManager.showLoading();
        } else {
            this.uiManager.hideLoading();
        }

        // Show error if any
        if (uiState.error) {
            this.uiManager.showError(uiState.error);
        }

        // Show notification if any
        if (uiState.notification) {
            this.uiManager.showNotification(uiState.notification);
        }
    }

    /**
     * Handle game start
     */
    async handleGameStart(data) {
        console.log('🎮 Game starting:', data);
        
        const { gameId, whitePlayerId, blackPlayerId, playerColor } = data;
        
        // Store game data
        this.gameState.setCurrentGame({
            gameId,
            whitePlayerId,
            blackPlayerId,
            playerColor,
            status: 'active'
        });
        
        // Initialize game engine and board
        const success = await gameIntegration.initializeGame({
            gameId,
            playerColor
        });
        
        if (success) {
            // Show game page
            this.gameState.navigateTo('game');
            this.uiManager.showPage('game');
            this.uiManager.showNotification('🎮 Game started! Make your first move.');
        }
    }

    /**
     * Handle player joined waiting room
     */
    handlePlayerJoined(data) {
        console.log('👤 Player joined:', data);
        
        const { gameId, playerName } = data;
        this.uiManager.showNotification(`👤 ${playerName} joined the game!`);
    }
}

// ============================================
// APPLICATION BOOTSTRAP
// ============================================

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new ROMGONApp();
        app.init();
    });
} else {
    const app = new ROMGONApp();
    app.init();
}

// Export for debugging
window.ROMGON = {
    apiClient,
    wsClient,
    gameState,
    uiManager
};

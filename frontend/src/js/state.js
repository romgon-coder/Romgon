// ============================================
// APPLICATION STATE MANAGER
// ============================================

class GameState {
    constructor() {
        // User state
        this.user = null;
        this.isAuthenticated = false;

        // Game state
        this.currentGame = null;
        this.currentGameBoard = null;
        this.gameHistory = [];

        // UI state
        this.uiState = {
            currentPage: 'login',
            loading: false,
            error: null,
            notification: null
        };

        // Listeners for state changes
        this.listeners = [];

        // Load initial state
        this.loadFromStorage();
    }

    /**
     * Load state from localStorage
     */
    loadFromStorage() {
        const storedUser = localStorage.getItem('romgon_user');
        if (storedUser) {
            try {
                this.user = JSON.parse(storedUser);
                this.isAuthenticated = !!apiClient.getStoredToken();
            } catch (error) {
                console.error('Error loading user from storage:', error);
            }
        }
    }

    /**
     * Save state to localStorage
     */
    saveToStorage() {
        if (this.user) {
            localStorage.setItem('romgon_user', JSON.stringify(this.user));
        }
    }

    /**
     * Set authenticated user
     */
    setUser(user) {
        this.user = user;
        this.isAuthenticated = true;
        this.saveToStorage();
        this.notifyListeners('user-changed');
    }

    /**
     * Clear user (logout)
     */
    clearUser() {
        this.user = null;
        this.isAuthenticated = false;
        this.currentGame = null;
        localStorage.removeItem('romgon_user');
        apiClient.clearToken();
        this.notifyListeners('user-changed');
    }

    /**
     * Set current game
     */
    setCurrentGame(game) {
        this.currentGame = game;
        this.notifyListeners('game-changed');
    }

    /**
     * Update game board
     */
    updateGameBoard(board) {
        this.currentGameBoard = board;
        this.notifyListeners('board-changed');
    }

    /**
     * Set UI state
     */
    setUIState(state) {
        this.uiState = { ...this.uiState, ...state };
        this.notifyListeners('ui-changed');
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.uiState.loading = loading;
        this.notifyListeners('ui-changed');
    }

    /**
     * Set error
     */
    setError(error) {
        this.uiState.error = error;
        this.notifyListeners('ui-changed');

        // Auto-clear error after 5 seconds
        if (error) {
            setTimeout(() => {
                if (this.uiState.error === error) {
                    this.uiState.error = null;
                    this.notifyListeners('ui-changed');
                }
            }, 5000);
        }
    }

    /**
     * Set notification
     */
    setNotification(notification) {
        this.uiState.notification = notification;
        this.notifyListeners('ui-changed');

        // Auto-clear notification after 3 seconds
        if (notification) {
            setTimeout(() => {
                if (this.uiState.notification === notification) {
                    this.uiState.notification = null;
                    this.notifyListeners('ui-changed');
                }
            }, 3000);
        }
    }

    /**
     * Navigate to page
     */
    navigateTo(page) {
        this.uiState.currentPage = page;
        this.notifyListeners('navigation');
    }

    /**
     * Register listener for state changes
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * Notify all listeners
     */
    notifyListeners(event) {
        this.listeners.forEach(callback => {
            try {
                callback(event, this);
            } catch (error) {
                console.error('Error in state listener:', error);
            }
        });
    }

    /**
     * Get current state
     */
    getState() {
        return {
            user: this.user,
            isAuthenticated: this.isAuthenticated,
            currentGame: this.currentGame,
            currentGameBoard: this.currentGameBoard,
            gameHistory: this.gameHistory,
            uiState: this.uiState
        };
    }
}

// Export singleton instance
const gameState = new GameState();

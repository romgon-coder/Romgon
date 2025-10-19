/**
 * ROMGON Keyboard System Router
 * Manages which keyboard system is active based on game state
 * 
 * - PVP Mode: Activates KeyboardNavigationSystemV2 (multi-phase piece selection)
 * - General Mode: Activates GeneralNavigationSystem (WASD + E/ESC for menus)
 */

class KeyboardSystemRouter {
  constructor() {
    this.debugMode = true;
    this.isPVPMode = false;
    this.systemActive = null;
    
    this.setupListeners();
    this.logDebug('Keyboard System Router Initialized');
  }

  setupListeners() {
    // Monitor game state to detect PVP mode
    setInterval(() => this.detectGameMode(), 500);
  }

  /**
   * Detect if we're in PVP mode
   */
  detectGameMode() {
    // Check if game board is visible and game is active
    const gameBoard = document.getElementById('game-board') || document.querySelector('[id*="board"]');
    const currentPlayerIndicator = document.querySelector('[id*="current-player"], [data-player]');
    const gameMoveIndicator = document.querySelector('.game-ui, .player-turn, [data-game-state]');
    
    // Additional checks for game screen visibility
    const gameContainer = document.querySelector('.game-container, #game-container, [data-game-active]');
    const mainMenuVisible = document.querySelector('#menu, .main-menu, [id*="menu"]');
    
    // Check if it looks like we're in a PVP game screen
    const inPVPMode = gameBoard && 
                      currentPlayerIndicator && 
                      gameMoveIndicator &&
                      gameBoard.style.display !== 'none' &&
                      !mainMenuVisible?.offsetParent && // Menu is hidden
                      window.currentPlayer && // Global game variable
                      window.gameOver !== undefined; // Game state exists
    
    // Switch systems if mode changed
    if (inPVPMode !== this.isPVPMode) {
      this.isPVPMode = inPVPMode;
      this.switchSystem();
    }
  }

  /**
   * Switch between keyboard systems
   */
  switchSystem() {
    if (this.isPVPMode) {
      this.activatePVPSystem();
    } else {
      this.activateGeneralSystem();
    }
  }

  /**
   * Activate PVP multi-phase system
   */
  activatePVPSystem() {
    if (this.systemActive === 'pvp') return;
    
    this.logDebug('🎮 Switching to PVP Keyboard System (Multi-Phase)');
    
    // Disable general navigation
    if (window.generalNav) {
      window.generalNav.setEnabled(false);
      window.generalNav.clearFocus();
    }
    
    // Enable PVP system
    if (!window.keyboardNav && typeof KeyboardNavigationSystemV2 !== 'undefined') {
      window.keyboardNav = new KeyboardNavigationSystemV2({ debug: true });
      this.logDebug('✅ PVP Keyboard System activated');
    } else if (window.keyboardNav) {
      window.keyboardNav.setEnabled(true);
      this.logDebug('✅ PVP Keyboard System re-enabled');
    }
    
    this.systemActive = 'pvp';
  }

  /**
   * Activate general navigation system
   */
  activateGeneralSystem() {
    if (this.systemActive === 'general') return;
    
    this.logDebug('📱 Switching to General Navigation System (Menus)');
    
    // Disable PVP system
    if (window.keyboardNav) {
      window.keyboardNav.resetPhase();
      // Don't disable, just let it sit idle
    }
    
    // Enable general navigation
    if (!window.generalNav && typeof GeneralNavigationSystem !== 'undefined') {
      window.generalNav = new GeneralNavigationSystem({ debug: true });
      this.logDebug('✅ General Navigation System activated');
    } else if (window.generalNav) {
      window.generalNav.setEnabled(true);
      this.logDebug('✅ General Navigation System re-enabled');
    }
    
    this.systemActive = 'general';
  }

  /**
   * Get current mode
   */
  getMode() {
    return this.isPVPMode ? 'pvp' : 'general';
  }

  /**
   * Debug logging
   */
  logDebug(message) {
    if (this.debugMode) {
      console.log(`[KeyboardRouter] ${message}`);
    }
  }

  /**
   * Get state
   */
  getState() {
    return {
      isPVPMode: this.isPVPMode,
      systemActive: this.systemActive,
      pvpSystem: window.keyboardNav ? window.keyboardNav.getState() : null,
      generalSystem: window.generalNav ? window.generalNav.getState() : null,
    };
  }
}

// Auto-initialize
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!window.keyboardRouter && typeof KeyboardSystemRouter !== 'undefined') {
      console.log('🔄 Initializing Keyboard System Router...');
      window.keyboardRouter = new KeyboardSystemRouter();
      console.log('✅ Keyboard System Router ready');
    }
  }, 1000);
});

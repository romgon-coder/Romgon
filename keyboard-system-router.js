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
    
    // Listen for direct game start event
    const gameStartListener = (e) => {
      console.log('🎯🎯🎯 EVENT LISTENER FIRED:', e.detail);
      this.logDebug(`🎯 Game Start Event Received: isPVP=${e.detail.isPVP}`);
      if (e.detail.isPVP) {
        this.activatePVPSystem();
      } else {
        this.activateGeneralSystem();
      }
    };
    document.addEventListener('gameStarted', gameStartListener);
    console.log('✅ Registered gameStarted listener');
    
    // Listen for game end
    document.addEventListener('gameEnded', (e) => {
      this.logDebug(`🎯 Game End Event Received`);
      this.activateGeneralSystem();
    });
  }

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
    
    // Debug logging for first detection
    if (inPVPMode && !this.isPVPMode) {
      this.logDebug(`🔍 PVP Mode Detected via polling:`);
      this.logDebug(`  - gameBoard: ${!!gameBoard}`);
      this.logDebug(`  - currentPlayerIndicator: ${!!currentPlayerIndicator}`);
      this.logDebug(`  - gameMoveIndicator: ${!!gameMoveIndicator}`);
      this.logDebug(`  - gameBoard.style.display !== 'none': ${gameBoard?.style.display !== 'none'}`);
      this.logDebug(`  - menu hidden: ${!mainMenuVisible?.offsetParent}`);
      this.logDebug(`  - window.currentPlayer: ${window.currentPlayer}`);
      this.logDebug(`  - window.gameOver defined: ${window.gameOver !== undefined}`);
    }
    
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
    
    // COMPLETELY DISABLE general navigation
    if (window.generalNav) {
      window.generalNav.enabled = false;
      window.generalNav.setEnabled(false);
      window.generalNav.clearFocus();
      document.querySelectorAll('.kb-nav-focused').forEach(el => {
        el.classList.remove('kb-nav-focused');
      });
      this.logDebug('✅ General Navigation System COMPLETELY DISABLED');
    }
    
    // Enable PVP system
    if (!window.keyboardNav && typeof KeyboardNavigationSystemV2 !== 'undefined') {
      window.keyboardNav = new KeyboardNavigationSystemV2({ debug: true });
      window.keyboardNav.enabled = true;
      this.logDebug('✅ PVP Keyboard System activated');
    } else if (window.keyboardNav) {
      window.keyboardNav.enabled = true;
      this.logDebug('✅ PVP Keyboard System re-enabled');
    }
    
    this.systemActive = 'pvp';
  }

  /**
   * Activate general navigation system
   */
  activateGeneralSystem() {
    this.logDebug('📱 Switching to General Navigation System (Menus)');
    
    // COMPLETELY DISABLE PVP system
    if (window.keyboardNav) {
      window.keyboardNav.resetPhase();
      window.keyboardNav.enabled = false;
      window.keyboardNav.phase = 'idle';
      this.logDebug('✅ PVP Keyboard System COMPLETELY DISABLED');
    }
    
    // Enable general navigation
    if (!window.generalNav && typeof GeneralNavigationSystem !== 'undefined') {
      window.generalNav = new GeneralNavigationSystem({ debug: true });
      window.generalNav.enabled = true;
      this.logDebug('✅ General Navigation System activated');
    } else if (window.generalNav) {
      window.generalNav.enabled = true;
      // Reset focus when re-enabling so it finds elements on new screen
      window.generalNav.currentFocusIndex = -1;
      window.generalNav.focusedElement = null;
      window.generalNav.updateNavigationElements();
      this.logDebug('✅ General Navigation System re-enabled (focus reset)');
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
  if (!window.keyboardRouter && typeof KeyboardSystemRouter !== 'undefined') {
    console.log('🔄 Initializing Keyboard System Router...');
    window.keyboardRouter = new KeyboardSystemRouter();
    console.log('✅ Keyboard System Router ready');
  }
});

// Also try to initialize immediately in case 'load' already fired
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.keyboardRouter && typeof KeyboardSystemRouter !== 'undefined') {
      console.log('🔄 Initializing Keyboard System Router (DOMContentLoaded)...');
      window.keyboardRouter = new KeyboardSystemRouter();
      console.log('✅ Keyboard System Router ready');
    }
  });
} else if (!window.keyboardRouter && typeof KeyboardSystemRouter !== 'undefined') {
  // Document already loaded, initialize immediately
  console.log('🔄 Initializing Keyboard System Router (immediate)...');
  window.keyboardRouter = new KeyboardSystemRouter();
  console.log('✅ Keyboard System Router ready');
}

/**
 * ROMGON Keyboard Navigation System
 * Handles keyboard controls for Player 1 and Player 2 with proper 180° rotation
 * 
 * Features:
 * - Arrow key navigation for hex movement
 * - WASD alternative controls
 * - Automatic Player 2 180° rotation handling
 * - Piece selection and highlighting
 * - Visual feedback for current player
 */

class KeyboardNavigationSystem {
  constructor(gameConfig = {}) {
    this.activePlayer = 1; // 1 = Black, 2 = White
    this.selectedPiecePos = null; // { row, col }
    this.enabled = true;
    this.debugMode = gameConfig.debug || false;
    
    // Keyboard key-to-direction mapping for Player 1 (normal view)
    this.normalMoves = {
      'ArrowUp': { dr: -1, dc: 0, label: 'Up' },
      'ArrowDown': { dr: 1, dc: 0, label: 'Down' },
      'ArrowLeft': { dr: 0, dc: -1, label: 'Left' },
      'ArrowRight': { dr: 0, dc: 1, label: 'Right' },
      'w': { dr: -1, dc: 0, label: 'Up' },
      'W': { dr: -1, dc: 0, label: 'Up' },
      's': { dr: 1, dc: 0, label: 'Down' },
      'S': { dr: 1, dc: 0, label: 'Down' },
      'a': { dr: 0, dc: -1, label: 'Left' },
      'A': { dr: 0, dc: -1, label: 'Left' },
      'd': { dr: 0, dc: 1, label: 'Right' },
      'D': { dr: 0, dc: 1, label: 'Right' },
      ' ': { action: 'confirmMove', label: 'Confirm' },
      'Escape': { action: 'deselectPiece', label: 'Deselect' },
      'Enter': { action: 'confirmMove', label: 'Confirm' },
    };
    
    this.setupEventListeners();
    this.logDebug('Keyboard Navigation System Initialized');
  }
  
  /**
   * Setup keyboard event listeners
   */
  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }
  
  /**
   * Handle keyboard press
   */
  handleKeyPress(event) {
    if (!this.enabled) return;
    
    const key = event.key;
    const moveData = this.normalMoves[key];
    
    if (!moveData) return; // Unknown key
    
    event.preventDefault();
    
    // Handle special actions
    if (moveData.action === 'confirmMove') {
      this.confirmMove();
      return;
    }
    
    if (moveData.action === 'deselectPiece') {
      this.deselectPiece();
      return;
    }
    
    // Handle movement
    if (moveData.dr !== undefined && moveData.dc !== undefined) {
      this.handleMovement(moveData.dr, moveData.dc, moveData.label);
    }
  }
  
  /**
   * Handle piece movement with Player 2 rotation
   */
  handleMovement(dr, dc, direction) {
    this.logDebug(`Player ${this.activePlayer} pressed: ${direction}`);
    
    // For Player 2, rotate 180° by negating both directions
    if (this.activePlayer === 2) {
      dr = -dr;
      dc = -dc;
      this.logDebug(`  Rotated for Player 2: dr=${dr}, dc=${dc}`);
    }
    
    // If no piece selected, try to select the current player's first piece
    if (!this.selectedPiecePos) {
      this.selectFirstPlayerPiece();
      return;
    }
    
    // Move selected piece
    const newPos = {
      row: this.selectedPiecePos.row + dr,
      col: this.selectedPiecePos.col + dc,
    };
    
    // Validate move is within bounds
    if (this.isValidBoardPosition(newPos)) {
      this.selectedPiecePos = newPos;
      this.updateSelectedPieceUI();
      this.logDebug(`  Piece moved to: [${newPos.row}, ${newPos.col}]`);
    } else {
      this.logDebug(`  Move out of bounds: [${newPos.row}, ${newPos.col}]`);
    }
  }
  
  /**
   * Select piece at current position (for highlighting UI)
   */
  selectPieceAt(row, col) {
    this.selectedPiecePos = { row, col };
    this.updateSelectedPieceUI();
    this.logDebug(`Selected piece at [${row}, ${col}]`);
  }
  
  /**
   * Select first piece belonging to current player
   */
  selectFirstPlayerPiece() {
    const isWhite = this.activePlayer === 2;
    const selector = isWhite ? 
      '.square-piece.white-piece, .triangle-piece.white-triangle, .rhombus-piece.white-rhombus, .circle-piece.white-circle, .hexgon-piece.white-hexgon' :
      '.square-piece:not(.white-piece), .triangle-piece:not(.white-triangle), .rhombus-piece:not(.white-rhombus), .circle-piece:not(.white-circle), .hexgon-piece:not(.white-hexgon)';
    
    const piece = document.querySelector(selector);
    if (piece) {
      const hexParent = piece.closest('[id^="hex-"]');
      if (hexParent) {
        const [, row, col] = hexParent.id.match(/hex-(\d+)-(\d+)/);
        this.selectPieceAt(parseInt(row), parseInt(col));
        this.logDebug(`Selected first ${isWhite ? 'white' : 'black'} piece at [${row}, ${col}]`);
      }
    } else {
      this.logDebug(`No ${isWhite ? 'white' : 'black'} pieces found`);
    }
  }
  
  /**
   * Deselect current piece
   */
  deselectPiece() {
    this.selectedPiecePos = null;
    this.updateSelectedPieceUI();
    this.logDebug('Piece deselected');
  }
  
  /**
   * Move selected piece to target position
   */
  movePieceTo(toRow, toCol) {
    if (!this.selectedPiecePos) {
      this.logDebug('No piece selected');
      return false;
    }
    
    // Call the actual game move function (must be implemented in game)
    if (window.gameMovePiece) {
      const result = window.gameMovePiece(
        this.selectedPiecePos.row,
        this.selectedPiecePos.col,
        toRow,
        toCol
      );
      
      if (result) {
        this.deselectPiece();
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Confirm current move
   */
  confirmMove() {
    if (!this.selectedPiecePos) {
      this.logDebug('No piece to confirm');
      return;
    }
    
    // Call game's move confirmation (must be implemented)
    if (window.gameConfirmMove) {
      window.gameConfirmMove(this.selectedPiecePos.row, this.selectedPiecePos.col);
    }
  }
  
  /**
   * Try to select next piece in direction
   */
  selectNextPiece(dr, dc) {
    // Placeholder - would scan for nearest piece in direction
    this.logDebug(`Scanning for piece in direction: dr=${dr}, dc=${dc}`);
  }
  
  /**
   * Update UI to show selected piece
   */
  updateSelectedPieceUI() {
    // Clear previous highlights
    document.querySelectorAll('.kb-selected').forEach(el => {
      el.classList.remove('kb-selected');
    });
    
    if (!this.selectedPiecePos) return;
    
    // Highlight selected piece (requires game to have piece elements with data attributes)
    const selector = `[data-row="${this.selectedPiecePos.row}"][data-col="${this.selectedPiecePos.col}"]`;
    const element = document.querySelector(selector);
    
    if (element) {
      element.classList.add('kb-selected');
      element.style.outline = '3px solid #4ecdc4';
      element.style.boxShadow = '0 0 10px rgba(78, 205, 196, 0.8)';
    }
  }
  
  /**
   * Check if position is valid board location
   * Adjust these values based on actual ROMGON board dimensions
   */
  isValidBoardPosition(pos) {
    const { row, col } = pos;
    // Standard board bounds - adjust for your actual board
    return row >= 0 && row < 10 && col >= 0 && col < 10;
  }
  
  /**
   * Switch active player
   */
  switchPlayer(newPlayer) {
    this.activePlayer = newPlayer || (this.activePlayer === 1 ? 2 : 1);
    this.deselectPiece();
    this.updatePlayerIndicator();
    this.logDebug(`Switched to Player ${this.activePlayer}`);
  }
  
  /**
   * Update UI to show current active player
   */
  updatePlayerIndicator() {
    const indicator = document.getElementById('kb-player-indicator');
    if (indicator) {
      const playerName = this.activePlayer === 1 ? '♟ BLACK (P1)' : '♚ WHITE (P2)';
      const color = this.activePlayer === 1 ? '#333' : '#fff';
      const bgColor = this.activePlayer === 1 ? '#555' : '#ccc';
      
      indicator.textContent = playerName;
      indicator.style.color = color;
      indicator.style.backgroundColor = bgColor;
    }
  }
  
  /**
   * Enable/disable keyboard controls
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    this.logDebug(`Keyboard controls ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }
  
  /**
   * Debug logging
   */
  logDebug(message) {
    if (this.debugMode) {
      console.log(`[KeyboardNav] ${message}`);
    }
  }
  
  /**
   * Get current state for debugging
   */
  getState() {
    return {
      activePlayer: this.activePlayer,
      selectedPiece: this.selectedPiecePos,
      enabled: this.enabled,
    };
  }
}

// Export for use in game
window.KeyboardNavigationSystem = KeyboardNavigationSystem;

// Auto-initialize if debug flag is set
if (window.KEYBOARD_NAV_DEBUG) {
  window.keyboardNav = new KeyboardNavigationSystem({ debug: true });
  console.log('✅ Keyboard Navigation System loaded with debug mode');
}

// Auto-initialize after a delay to ensure all game functions are loaded
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!window.keyboardNav && typeof KeyboardNavigationSystem !== 'undefined') {
      console.log('🔄 Auto-initializing keyboard navigation system...');
      window.keyboardNav = new KeyboardNavigationSystem({ debug: true });
      const indicator = document.getElementById('kb-player-indicator');
      if (indicator) {
        indicator.style.display = 'block';
        indicator.textContent = '⌨️ KB: Player 1 (Black)';
        indicator.style.backgroundColor = '#333';
        indicator.style.color = '#fff';
      }
      const help = document.getElementById('kb-help-overlay');
      if (help) {
        help.style.display = 'block';
      }
      console.log('✅ Keyboard Navigation initialized');
    }
  }, 500);
});

// Also ensure initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (!window.keyboardNav && typeof KeyboardNavigationSystem !== 'undefined') {
      console.log('🔄 DOMContentLoaded: Auto-initializing keyboard navigation system...');
      window.keyboardNav = new KeyboardNavigationSystem({ debug: true });
      const indicator = document.getElementById('kb-player-indicator');
      if (indicator) {
        indicator.style.display = 'block';
        indicator.textContent = '⌨️ KB: Player 1 (Black)';
        indicator.style.backgroundColor = '#333';
        indicator.style.color = '#fff';
      }
    }
  }, 300);
});

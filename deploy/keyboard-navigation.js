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
    
    // Calculate target position
    const targetPos = {
      row: this.selectedPiecePos.row + dr,
      col: this.selectedPiecePos.col + dc,
    };
    
    // Check if target is valid and highlighted (i.e., is a legal move)
    const targetHexId = `hex-${targetPos.row}-${targetPos.col}`;
    const targetHex = document.getElementById(targetHexId);
    
    if (!targetHex) {
      this.logDebug(`Target hex out of bounds: ${targetHexId}`);
      return;
    }
    
    // Check if this is a valid highlighted move
    const isValidMove = targetHex.classList.contains('highlight-green') || 
                        targetHex.classList.contains('highlight-red') ||
                        targetHex.classList.contains('highlight-diagonal') ||
                        targetHex.classList.contains('highlight-danger');
    
    if (!isValidMove) {
      this.logDebug(`Target ${targetHexId} is not a highlighted valid move`);
      return;
    }
    
    // Move is valid! Update selected position to show preview
    this.selectedPiecePos = targetPos;
    this.logDebug(`Navigating to valid move: [${targetPos.row}, ${targetPos.col}]`);
    
    // Update UI to show we're at this new position
    // But don't actually execute the move - wait for Space/Enter
    this.updateSelectedPieceUI();
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
    // Clear visual highlights
    document.querySelectorAll('.kb-selected').forEach(el => {
      el.classList.remove('kb-selected');
      el.style.outline = '';
      el.style.boxShadow = '';
    });
    
    // Clear game's drag state
    window.draggedPiece = null;
    window.draggedFromHex = null;
    
    // Clear highlighted moves from the game
    document.querySelectorAll('.highlight-green, .highlight-red, .highlight-diagonal, .highlight-danger, .highlight-threat').forEach(hex => {
      hex.classList.remove('highlight-green', 'highlight-red', 'highlight-diagonal', 'highlight-danger', 'highlight-threat');
    });
    
    this.selectedPiecePos = null;
    this.logDebug('Piece deselected and highlights cleared');
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
      this.logDebug('No position to confirm');
      return;
    }
    
    const targetHexId = `hex-${this.selectedPiecePos.row}-${this.selectedPiecePos.col}`;
    const targetHex = document.getElementById(targetHexId);
    
    if (!targetHex) {
      this.logDebug('Target hex not found');
      return;
    }
    
    // Check if target is a valid move (highlighted)
    const isValidMove = targetHex.classList.contains('highlight-green') || 
                        targetHex.classList.contains('highlight-red') ||
                        targetHex.classList.contains('highlight-diagonal') ||
                        targetHex.classList.contains('highlight-danger');
    
    if (!isValidMove) {
      this.logDebug(`Target ${targetHexId} is not a valid highlighted move`);
      return;
    }
    
    this.logDebug(`Confirming move to: ${targetHexId}`);
    
    // Simulate drop on the target hex
    // This triggers the game's drop handler which executes the move
    if (window.draggedPiece && window.draggedFromHex) {
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
      });
      
      // Manually trigger drop logic by calling the drop handler
      // The game's drop handler checks for draggedPiece and draggedFromHex
      targetHex.dispatchEvent(dropEvent);
      
      this.logDebug('Drop event dispatched to target hex');
    } else {
      this.logDebug('draggedPiece or draggedFromHex is null');
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
    
    const hexId = `hex-${this.selectedPiecePos.row}-${this.selectedPiecePos.col}`;
    const hexElement = document.getElementById(hexId);
    
    if (!hexElement) {
      this.logDebug(`Hex element not found: ${hexId}`);
      return;
    }
    
    const piece = hexElement.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
    
    if (!piece) {
      this.logDebug(`No piece found at ${hexId}`);
      return;
    }
    
    // Add visual highlight
    hexElement.classList.add('kb-selected');
    hexElement.style.outline = '3px solid #4ecdc4';
    hexElement.style.boxShadow = '0 0 10px rgba(78, 205, 196, 0.8)';
    
    // CRITICAL: Trigger the game's piece selection system
    // This makes the game show movement patterns and highlights
    window.draggedPiece = piece;
    window.draggedFromHex = hexElement;
    
    this.logDebug(`Selected piece at ${hexId}, triggering game selection...`);
    
    // Call the game's movement pattern function if it exists
    if (typeof showMovementPattern === 'function') {
      showMovementPattern(this.selectedPiecePos.row, this.selectedPiecePos.col);
      this.logDebug(`Called showMovementPattern for [${this.selectedPiecePos.row}, ${this.selectedPiecePos.col}]`);
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

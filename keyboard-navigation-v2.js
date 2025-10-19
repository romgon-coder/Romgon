/**
 * ROMGON Keyboard Navigation System v2
 * Multi-phase control scheme with distinct gameplay phases
 * 
 * PHASE 1: Piece Selection
 *   - WASD: Navigate pieces
 *   - E: Confirm piece selection
 * 
 * PHASE 2: Move Selection  
 *   - WASD: Navigate highlighted moves
 *   - Space: Confirm move
 *   - Escape: Back to piece selection
 * 
 * PHASE 3: Rotation (for rotatable pieces)
 *   - R: Enter rotation mode
 *   - WASD: Select rotation (Left/Keep/Right)
 *   - E: Confirm rotation
 *   - Space: Execute move
 *   - Escape: Cancel rotation, back to move selection
 */

class KeyboardNavigationSystemV2 {
  constructor(gameConfig = {}) {
    this.activePlayer = 1; // 1 = Black, 2 = White
    this.debugMode = gameConfig.debug || false;
    this.enabled = true; // System is enabled by default when created
    
    // Current game phase
    this.phase = 'idle'; // 'idle' | 'pieceSelection' | 'moveSelection' | 'rotationSelection'
    
    // Selection state
    this.selectedPiecePos = null; // { row, col }
    this.selectedMovementPos = null; // { row, col }
    this.rotationChoice = null; // 'left' | 'keep' | 'right'
    this.selectedPieceElement = null;
    
    // Visual tracking
    this.highlightedPieces = []; // For piece navigation preview
    this.highlightedMoves = []; // For move navigation preview
    
    this.setupEventListeners();
    this.logDebug('Keyboard Navigation System v2 Initialized (Multi-Phase)');
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  handleKeyPress(event) {
    const key = event.key.toLowerCase();
    
    this.logDebug(`[${this.phase}] Key pressed: ${key} | enabled=${this.enabled}`);
    
    // If PVP system not enabled, don't process input
    if (!this.enabled) {
      this.logDebug(`PVP system not enabled (enabled=${this.enabled}), skipping`);
      return;
    }

    // Global escape: Always can go back
    if (key === 'escape') {
      this.handleEscape();
      return;
    }

    // Route to appropriate phase handler
    switch (this.phase) {
      case 'idle':
      case 'pieceSelection':
        this.handlePieceSelectionPhase(key, event);
        break;
      case 'moveSelection':
        this.handleMoveSelectionPhase(key, event);
        break;
      case 'rotationSelection':
        this.handleRotationSelectionPhase(key, event);
        break;
    }
  }

  /**
   * PHASE 1: Piece Selection
   * Navigate and select a piece to move
   */
  handlePieceSelectionPhase(key, event) {
    if (['w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault();
      this.navigatePieces(key);
    } else if (key === 'e') {
      event.preventDefault();
      this.confirmPieceSelection();
    }
  }

  /**
   * Navigate through pieces of current player
   */
  navigatePieces(direction) {
    const isWhite = this.activePlayer === 2;
    const piecesSelector = isWhite ?
      '.square-piece.white-piece, .triangle-piece.white-triangle, .rhombus-piece.white-rhombus, .circle-piece.white-circle, .hexgon-piece.white-hexgon' :
      '.square-piece:not(.white-piece), .triangle-piece:not(.white-triangle), .rhombus-piece:not(.white-rhombus), .circle-piece:not(.white-circle), .hexgon-piece:not(.white-hexgon)';
    
    const pieces = Array.from(document.querySelectorAll(piecesSelector));
    
    if (pieces.length === 0) {
      this.logDebug('No pieces found for current player');
      return;
    }

    // If no piece selected yet, select first
    if (!this.selectedPieceElement) {
      this.selectedPieceElement = pieces[0];
      this.selectedPiecePos = this.getPiecePosition(pieces[0]);
      this.phase = 'pieceSelection';
      this.updatePieceSelectionUI();
      this.logDebug(`Selected first piece at [${this.selectedPiecePos.row}, ${this.selectedPiecePos.col}]`);
      return;
    }

    // Find current piece in list
    const currentIndex = pieces.findIndex(p => p === this.selectedPieceElement);
    let nextIndex = currentIndex;

    // Navigate based on direction
    // For now, simple linear navigation through piece list
    if (direction === 'w') {
      nextIndex = (currentIndex - 1 + pieces.length) % pieces.length;
    } else if (direction === 's') {
      nextIndex = (currentIndex + 1) % pieces.length;
    } else if (direction === 'a') {
      nextIndex = (currentIndex - 1 + pieces.length) % pieces.length;
    } else if (direction === 'd') {
      nextIndex = (currentIndex + 1) % pieces.length;
    }

    this.selectedPieceElement = pieces[nextIndex];
    this.selectedPiecePos = this.getPiecePosition(pieces[nextIndex]);
    this.updatePieceSelectionUI();
    this.logDebug(`Navigated to piece at [${this.selectedPiecePos.row}, ${this.selectedPiecePos.col}]`);
  }

  /**
   * Get piece's hex position from DOM
   */
  getPiecePosition(pieceElement) {
    const hexParent = pieceElement.closest('[id^="hex-"]');
    if (!hexParent) return null;
    
    const match = hexParent.id.match(/hex-(\d+)-(\d+)/);
    if (!match) return null;
    
    return { row: parseInt(match[1]), col: parseInt(match[2]) };
  }

  /**
   * Update UI for piece selection phase
   */
  updatePieceSelectionUI() {
    // Remove old highlight from all pieces
    document.querySelectorAll('.kb-piece-selected').forEach(el => {
      el.classList.remove('kb-piece-selected');
    });

    // Add highlight to current piece element AND its parent hex
    if (this.selectedPieceElement) {
      this.selectedPieceElement.classList.add('kb-piece-selected');
      
      // Also highlight the hex it's in
      const hexParent = this.selectedPieceElement.closest('[id^="hex-"]');
      if (hexParent) {
        hexParent.classList.add('kb-piece-selected');
      }
    }

    this.updatePhaseIndicator('pieceSelection');
    this.logDebug(`Piece UI updated: [${this.selectedPiecePos.row}, ${this.selectedPiecePos.col}]`);
  }

  /**
   * Confirm piece selection and move to move selection phase
   */
  confirmPieceSelection() {
    if (!this.selectedPiecePos) {
      this.logDebug('No piece selected');
      return;
    }

    this.logDebug(`Piece confirmed at [${this.selectedPiecePos.row}, ${this.selectedPiecePos.col}]`);
    
    // Set up game state
    const hexElement = document.getElementById(`hex-${this.selectedPiecePos.row}-${this.selectedPiecePos.col}`);
    window.draggedPiece = this.selectedPieceElement;
    window.draggedFromHex = hexElement;

    // Show valid moves based on piece type
    this.showMovesForPiece(this.selectedPiecePos.row, this.selectedPiecePos.col);

    this.phase = 'moveSelection';
    this.selectedMovementPos = null;
    
    // Small delay to allow game to render highlights
    setTimeout(() => {
      this.highlightedMoves = this.getHighlightedMoveHexes();
      this.logDebug(`Move selection phase started, ${this.highlightedMoves.length} valid moves available`);
      if (this.highlightedMoves.length === 0) {
        this.logDebug('⚠️ WARNING: No highlighted moves found. Movement pattern may not have rendered.');
      }
    }, 50);
    
    this.updatePhaseIndicator('moveSelection');
  }

  /**
   * Show movement pattern based on piece type
   */
  showMovesForPiece(row, col) {
    if (!this.selectedPieceElement) return;

    // Determine piece type and call appropriate function
    if (this.selectedPieceElement.classList.contains('circle-piece')) {
      this.logDebug('Circle piece - calling showCircleMovementPattern');
      if (typeof showCircleMovementPattern === 'function') {
        showCircleMovementPattern(row, col);
      }
    } else if (this.selectedPieceElement.classList.contains('triangle-piece')) {
      this.logDebug('Triangle piece - calling showTriangleMovementPattern');
      if (typeof showTriangleMovementPattern === 'function') {
        showTriangleMovementPattern(row, col);
      }
    } else if (this.selectedPieceElement.classList.contains('hexgon-piece')) {
      this.logDebug('Hexagon piece - calling showHexgonMovementPattern');
      if (typeof showHexgonMovementPattern === 'function') {
        showHexgonMovementPattern(row, col);
      }
    } else if (this.selectedPieceElement.classList.contains('rhombus-piece')) {
      this.logDebug('Rhombus piece - calling showRhombusMovementPattern');
      if (typeof showRhombusMovementPattern === 'function') {
        showRhombusMovementPattern(row, col);
      }
    } else if (this.selectedPieceElement.classList.contains('square-piece')) {
      this.logDebug('Square piece - calling showSquareMovementPattern');
      if (typeof showSquareMovementPattern === 'function') {
        showSquareMovementPattern(row, col);
      }
    }
  }

  /**
   * Get all highlighted move hexes
   */
  getHighlightedMoveHexes() {
    return Array.from(document.querySelectorAll(
      '.highlight-green, .highlight-red, .highlight-diagonal, .highlight-danger'
    ));
  }

  /**
   * PHASE 2: Move Selection
   * Navigate and select where to move
   */
  handleMoveSelectionPhase(key, event) {
    if (['w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault();
      this.navigateMoves(key);
    } else if (key === ' ') {
      event.preventDefault();
      this.confirmMoveSelection();
    }
  }

  /**
   * Navigate through highlighted moves
   */
  navigateMoves(direction) {
    if (this.highlightedMoves.length === 0) {
      this.logDebug('No highlighted moves available');
      return;
    }

    // If no move selected yet, select first
    if (!this.selectedMovementPos) {
      const firstHex = this.highlightedMoves[0];
      this.selectedMovementPos = this.getHexPosition(firstHex);
      this.updateMoveSelectionUI();
      this.logDebug(`Selected first move at [${this.selectedMovementPos.row}, ${this.selectedMovementPos.col}]`);
      return;
    }

    // Find current move in list
    const currentHexId = `hex-${this.selectedMovementPos.row}-${this.selectedMovementPos.col}`;
    const currentIndex = this.highlightedMoves.findIndex(h => h.id === currentHexId);
    let nextIndex = Math.max(0, currentIndex + 1);

    // Wrap around
    if (nextIndex >= this.highlightedMoves.length) {
      nextIndex = 0;
    }

    const nextHex = this.highlightedMoves[nextIndex];
    this.selectedMovementPos = this.getHexPosition(nextHex);
    this.updateMoveSelectionUI();
    this.logDebug(`Navigated to move at [${this.selectedMovementPos.row}, ${this.selectedMovementPos.col}]`);
  }

  /**
   * Get hex position from element
   */
  getHexPosition(hexElement) {
    const match = hexElement.id.match(/hex-(\d+)-(\d+)/);
    if (!match) return null;
    return { row: parseInt(match[1]), col: parseInt(match[2]) };
  }

  /**
   * Update UI for move selection phase
   */
  updateMoveSelectionUI() {
    // Remove old nav highlight
    document.querySelectorAll('.kb-move-navigating').forEach(el => {
      el.classList.remove('kb-move-navigating');
    });

    // Add highlight to current move
    if (this.selectedMovementPos) {
      const hexElement = document.getElementById(`hex-${this.selectedMovementPos.row}-${this.selectedMovementPos.col}`);
      if (hexElement) {
        hexElement.classList.add('kb-move-navigating');
      }
    }

    this.updatePhaseIndicator('moveSelection');
  }

  /**
   * Confirm move selection - check if piece needs rotation
   */
  confirmMoveSelection() {
    if (!this.selectedMovementPos) {
      this.logDebug('No move selected');
      return;
    }

    // Check if selected piece is rotatable
    const isRotatable = this.selectedPieceElement && 
      (this.selectedPieceElement.classList.contains('triangle-piece') ||
       this.selectedPieceElement.classList.contains('hexgon-piece'));

    if (isRotatable) {
      this.logDebug('Rotatable piece detected, entering rotation phase');
      this.phase = 'rotationSelection';
      this.rotationChoice = 'keep'; // Default choice
      this.updateRotationSelectionUI();
    } else {
      // Non-rotatable piece, execute move immediately
      this.executeMoveWithRotation('keep');
    }
  }

  /**
   * PHASE 3: Rotation Selection
   * Choose rotation for rotatable pieces
   */
  handleRotationSelectionPhase(key, event) {
    if (['w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault();
      this.navigateRotation(key);
    } else if (key === 'e') {
      event.preventDefault();
      this.confirmRotationSelection();
    } else if (key === ' ') {
      event.preventDefault();
      this.executeMoveWithRotation(this.rotationChoice);
    }
  }

  /**
   * Navigate rotation options: Left, Keep, Right
   */
  navigateRotation(direction) {
    const rotations = ['left', 'keep', 'right'];
    const currentIndex = rotations.indexOf(this.rotationChoice);
    
    let nextIndex = currentIndex;
    if (direction === 'a' || direction === 'w') {
      nextIndex = (currentIndex - 1 + rotations.length) % rotations.length;
    } else if (direction === 'd' || direction === 's') {
      nextIndex = (currentIndex + 1) % rotations.length;
    }

    this.rotationChoice = rotations[nextIndex];
    this.updateRotationSelectionUI();
    this.logDebug(`Rotation choice: ${this.rotationChoice}`);
  }

  /**
   * Update UI for rotation selection
   */
  updateRotationSelectionUI() {
    const indicator = document.getElementById('kb-phase-indicator');
    if (indicator) {
      const choices = `LEFT ← ${this.rotationChoice === 'left' ? '✓' : ' '} | KEEP ↕ ${this.rotationChoice === 'keep' ? '✓' : ' '} | RIGHT → ${this.rotationChoice === 'right' ? '✓' : ' '}`;
      indicator.textContent = `Rotation: ${choices} [SPACE to confirm]`;
      indicator.style.backgroundColor = '#ff6b00';
    }
  }

  /**
   * Confirm rotation selection
   */
  confirmRotationSelection() {
    this.logDebug(`Rotation confirmed: ${this.rotationChoice}`);
    // After E, they still need to press Space to execute
    this.updatePhaseIndicator('moveSelection');
    this.logDebug('Press SPACE to execute move');
  }

  /**
   * Execute the move with selected rotation
   */
  executeMoveWithRotation(rotationChoice) {
    if (!this.selectedMovementPos || !this.selectedPieceElement) {
      this.logDebug('No move or piece to execute');
      return;
    }

    this.logDebug(`Executing move to [${this.selectedMovementPos.row}, ${this.selectedMovementPos.col}] with rotation: ${rotationChoice}`);

    // Handle rotation if piece is rotatable
    if (this.selectedPieceElement && 
        (this.selectedPieceElement.classList.contains('triangle-piece') ||
         this.selectedPieceElement.classList.contains('hexgon-piece'))) {
      
      if (rotationChoice === 'left') {
        this.selectedPieceElement.style.transform = 'rotate(-60deg)';
      } else if (rotationChoice === 'right') {
        this.selectedPieceElement.style.transform = 'rotate(60deg)';
      }
      // 'keep' means no rotation
    }

    // Get the target hex and source hex
    const targetHexId = `hex-${this.selectedMovementPos.row}-${this.selectedMovementPos.col}`;
    const sourceHexId = `hex-${this.selectedPiecePos.row}-${this.selectedPiecePos.col}`;
    const targetHex = document.getElementById(targetHexId);
    const sourceHex = document.getElementById(sourceHexId);
    
    if (!targetHex) {
      this.logDebug(`❌ Target hex not found: ${targetHexId}`);
      return;
    }

    this.logDebug(`✅ Piece: ${this.selectedPieceElement?.className || 'unknown'}`);
    this.logDebug(`✅ Source: ${sourceHexId}, Target: ${targetHexId}`);
    this.logDebug(`✅ Target hex has highlights: ${targetHex.className}`);

    // Set up game's drag state for drop handler
    window.draggedPiece = this.selectedPieceElement;
    window.draggedFromHex = sourceHex;

    this.logDebug(`✅ Set window.draggedPiece and window.draggedFromHex`);

    // Dispatch drop event
    this.logDebug(`📤 Dispatching drop event to ${targetHexId}`);
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
    });
    targetHex.dispatchEvent(dropEvent);

    this.logDebug(`✅ Drop event dispatched`);

    // Clean up
    window.draggedPiece = null;
    window.draggedFromHex = null;

    // Reset to piece selection
    this.resetPhase();
  }

  /**
   * Handle escape key - go back to previous phase
   */
  handleEscape() {
    switch (this.phase) {
      case 'moveSelection':
        this.logDebug('Escape: Back to piece selection');
        this.deselectMove();
        this.phase = 'pieceSelection';
        this.updatePhaseIndicator('pieceSelection');
        break;
      case 'rotationSelection':
        this.logDebug('Escape: Back to move selection');
        this.phase = 'moveSelection';
        this.updatePhaseIndicator('moveSelection');
        break;
      case 'pieceSelection':
        this.logDebug('Escape: Deselecting all');
        this.resetPhase();
        break;
    }
  }

  /**
   * Deselect current move
   */
  deselectMove() {
    document.querySelectorAll('.kb-move-navigating').forEach(el => {
      el.classList.remove('kb-move-navigating');
    });
    this.selectedMovementPos = null;
  }

  /**
   * Sync with game's currentPlayer variable
   */
  syncWithGameTurn() {
    if (typeof currentPlayer === 'undefined') return;
    
    const gameCurrentPlayerIsWhite = currentPlayer === 'white';
    const keyboardCurrentIsWhite = this.activePlayer === 2;
    
    if (gameCurrentPlayerIsWhite !== keyboardCurrentIsWhite) {
      this.activePlayer = gameCurrentPlayerIsWhite ? 2 : 1;
      this.resetPhase();
      this.logDebug(`Auto-sync: Keyboard now Player ${this.activePlayer}`);
    }
  }

  /**
   * Reset to idle phase
   */
  resetPhase() {
    this.phase = 'pieceSelection';
    this.selectedPiecePos = null;
    this.selectedMovementPos = null;
    this.selectedPieceElement = null;
    this.rotationChoice = null;

    // Clear all UI
    document.querySelectorAll('.kb-piece-selected, .kb-move-navigating').forEach(el => {
      el.classList.remove('kb-piece-selected', 'kb-move-navigating');
    });

    // Clear highlighted moves from game
    document.querySelectorAll('.highlight-green, .highlight-red, .highlight-diagonal, .highlight-danger')
      .forEach(hex => hex.classList.remove('highlight-green', 'highlight-red', 'highlight-diagonal', 'highlight-danger'));

    window.draggedPiece = null;
    window.draggedFromHex = null;

    this.updatePhaseIndicator('idle');
    this.logDebug('Phase reset to idle');
  }

  /**
   * Update phase indicator UI
   */
  updatePhaseIndicator(phase) {
    const indicator = document.getElementById('kb-phase-indicator');
    if (!indicator) return;

    const phaseMessages = {
      'idle': '⌨️ Press any key to start - WASD to select piece, E to confirm',
      'pieceSelection': '🎯 Piece Selection: WASD to navigate, E to confirm',
      'moveSelection': '📍 Move Selection: WASD to navigate, SPACE to confirm',
      'rotationSelection': '🔄 Rotation: WASD to choose (Left/Keep/Right), SPACE to execute',
    };

    indicator.textContent = phaseMessages[phase] || 'Unknown phase';
    
    // Color code by phase
    const colors = {
      'idle': '#666',
      'pieceSelection': '#0066cc',
      'moveSelection': '#009933',
      'rotationSelection': '#ff6b00',
    };
    
    indicator.style.backgroundColor = colors[phase] || '#666';
    // Only show if not idle (idle means not in active game)
    indicator.style.display = phase === 'idle' ? 'none' : 'block';
  }

  /**
   * Debug logging
   */
  logDebug(message) {
    if (this.debugMode) {
      console.log(`[KeyboardNavV2] ${message}`);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      phase: this.phase,
      activePlayer: this.activePlayer,
      selectedPiece: this.selectedPiecePos,
      selectedMove: this.selectedMovementPos,
      rotationChoice: this.rotationChoice,
    };
  }
}

// Export
window.KeyboardNavigationSystemV2 = KeyboardNavigationSystemV2;

// Auto-initialize after game loads
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!window.keyboardNav && typeof KeyboardNavigationSystemV2 !== 'undefined') {
      console.log('🔄 Auto-initializing Keyboard Navigation v2 (Multi-Phase)...');
      window.keyboardNav = new KeyboardNavigationSystemV2({ debug: true });
      
      // Create or update phase indicator
      let indicator = document.getElementById('kb-phase-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'kb-phase-indicator';
        document.body.appendChild(indicator);
      }
      
      indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        padding: 12px 16px;
        background-color: #666;
        color: #fff;
        font-family: 'Arial', sans-serif;
        font-size: 12px;
        border-radius: 4px;
        z-index: 10000;
        max-width: 400px;
        word-wrap: break-word;
        border: 2px solid #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: none; /* Hidden by default, only shown during PVP */
      `;
      
      window.keyboardNav.updatePhaseIndicator('idle');
      
      // Start turn sync monitor
      const syncInterval = setInterval(() => {
        if (window.keyboardNav) {
          window.keyboardNav.syncWithGameTurn();
        } else {
          clearInterval(syncInterval);
        }
      }, 250);
      
      console.log('✅ Keyboard Navigation v2 initialized with multi-phase system');
    }
  }, 500);
});

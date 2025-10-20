/**
 * ROMGON Keyboard Navigation - Game Integration Layer
 * Bridges the KeyboardNavigationSystem with the game's drag-and-drop mechanics
 */

class KeyboardGameIntegration {
  constructor() {
    this.gameState = {
      selectedHexId: null,
      selectedPiece: null,
      lastPlayer: 1,
      isPlayerTurn: true,
    };
    
    this.setupGameHooks();
    this.logDebug('Game Integration Layer Initialized');
  }
  
  /**
   * Setup window hooks for keyboard system to call
   */
  setupGameHooks() {
    // Hook: Move piece from one hex to another
    window.gameMovePiece = (fromRow, fromCol, toRow, toCol) => {
      return this.executeDragDrop(fromRow, fromCol, toRow, toCol);
    };
    
    // Hook: Confirm current move (simulate drag-drop completion)
    window.gameConfirmMove = (row, col) => {
      return this.confirmMoveAtPosition(row, col);
    };
    
    // Hook: Called when game switches turns
    if (typeof switchTurn === 'function') {
      const originalSwitchTurn = window.switchTurn;
      window.switchTurn = () => {
        originalSwitchTurn();
        this.updateKeyboardPlayerIndicator();
      };
    }
    
    this.logDebug('Game hooks registered');
  }
  
  /**
   * Execute a move using the game's drag-drop system
   */
  executeDragDrop(fromRow, fromCol, toRow, toCol) {
    const fromHexId = `hex-${fromRow}-${fromCol}`;
    const toHexId = `hex-${toRow}-${toCol}`;
    
    this.logDebug(`Movement: ${fromHexId} → ${toHexId}`);
    
    // Get DOM elements
    const fromHex = document.getElementById(fromHexId);
    const toHex = document.getElementById(toHexId);
    
    if (!fromHex || !toHex) {
      this.logDebug(`Invalid hexes: from=${!!fromHex}, to=${!!toHex}`);
      return false;
    }
    
    // Find piece in source hex
    const piece = fromHex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
    if (!piece) {
      this.logDebug(`No piece found at ${fromHexId}`);
      return false;
    }
    
    // Check if it's the correct player's piece
    const isWhite = piece.classList.contains('white-piece') || 
                    piece.classList.contains('white-triangle') || 
                    piece.classList.contains('white-rhombus') ||
                    piece.classList.contains('white-circle') ||
                    piece.classList.contains('white-hexgon');
    
    // Check against current turn (determined by last move)
    // For now, allow all pieces to be moved via keyboard
    
    // Check if target is valid (highlight-green or highlight-red)
    const isValidTarget = toHex.classList.contains('highlight-green') || 
                          toHex.classList.contains('highlight-red') ||
                          toHex.classList.contains('highlight-diagonal') ||
                          toHex.classList.contains('highlight-danger');
    
    if (!isValidTarget) {
      this.logDebug(`Invalid target hex (no highlight): ${toHexId}`);
      return false;
    }
    
    // Simulate drag event
    const dragEvent = new DragEvent('drag', {
      dataTransfer: new DataTransfer(),
      bubbles: true,
      cancelable: true,
    });
    
    // Set global drag state (game uses global draggedPiece variable)
    window.draggedPiece = piece;
    window.draggedFromHex = fromHex;
    
    // Simulate drop on target hex
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
    });
    
    // Manually trigger the drop logic (same as in setupDragAndDrop)
    this.simulateDrop(fromHex, toHex, piece);
    
    return true;
  }
  
  /**
   * Simulate the drop event handler logic
   */
  simulateDrop(fromHex, toHex, piece) {
    const fromHexId = fromHex.id;
    const toHexId = toHex.id;
    const [, toRow, toCol] = toHexId.match(/hex-(\d+)-(\d+)/);
    
    this.logDebug(`Simulating drop: ${fromHexId} → ${toHexId}`);
    
    // Check for opponent piece to capture
    const existingPiece = toHex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
    const isDraggedWhite = piece.classList.contains('white-piece') || 
                           piece.classList.contains('white-triangle') || 
                           piece.classList.contains('white-rhombus') ||
                           piece.classList.contains('white-circle') ||
                           piece.classList.contains('white-hexgon');
    
    let didCapture = false;
    
    if (existingPiece) {
      const isExistingWhite = existingPiece.classList.contains('white-piece') || 
                              existingPiece.classList.contains('white-triangle') || 
                              existingPiece.classList.contains('white-rhombus') ||
                              existingPiece.classList.contains('white-circle') ||
                              existingPiece.classList.contains('white-hexgon');
      
      if (isDraggedWhite !== isExistingWhite) {
        this.logDebug(`Capture: ${isDraggedWhite ? 'white' : 'black'} captures opponent piece`);
        existingPiece.remove();
        didCapture = true;
      }
    }
    
    // Move the piece
    const pieceClasses = piece.className;
    
    // Preserve orientation for rotatable pieces
    let preservedOrientation = null;
    if (piece.classList.contains('triangle-piece') && typeof getTriangleOrientation === 'function') {
      preservedOrientation = getTriangleOrientation(fromHexId);
    } else if (piece.classList.contains('hexgon-piece') && typeof getHexgonOrientation === 'function') {
      preservedOrientation = getHexgonOrientation(fromHexId);
    }
    
    piece.remove();
    
    const newPiece = document.createElement('div');
    newPiece.className = pieceClasses;
    newPiece.draggable = true;
    toHex.appendChild(newPiece);
    
    // Restore orientation
    if (preservedOrientation !== null) {
      if (newPiece.classList.contains('triangle-piece') && typeof setTriangleOrientation === 'function') {
        setTriangleOrientation(toHexId, preservedOrientation);
        if (typeof updateTriangleVisual === 'function') {
          updateTriangleVisual(toHexId);
        }
        if (typeof triangleOrientations !== 'undefined') {
          triangleOrientations.delete(fromHexId);
        }
      } else if (newPiece.classList.contains('hexgon-piece') && typeof setHexgonOrientation === 'function') {
        setHexgonOrientation(toHexId, preservedOrientation);
        if (typeof updateHexgonVisual === 'function') {
          updateHexgonVisual(toHexId);
        }
        if (typeof hexgonOrientations !== 'undefined') {
          hexgonOrientations.delete(fromHexId);
        }
      }
    }
    
    // Call game functions if they exist
    if (typeof broadcastMove === 'function') {
      broadcastMove(fromHexId, toHexId, pieceClasses, didCapture);
    }
    
    if (typeof recordMove === 'function') {
      const [, fromRow, fromCol] = fromHex.id.match(/hex-(\d+)-(\d+)/);
      const isWhite = newPiece.classList.contains('white-piece') || 
                      newPiece.classList.contains('white-triangle') || 
                      newPiece.classList.contains('white-rhombus') ||
                      newPiece.classList.contains('white-circle') ||
                      newPiece.classList.contains('white-hexgon');
      const pieceType = newPiece.classList.contains('square-piece') ? 'square' :
                        newPiece.classList.contains('triangle-piece') ? 'triangle' :
                        newPiece.classList.contains('rhombus-piece') ? 'rhombus' :
                        newPiece.classList.contains('circle-piece') ? 'circle' : 'hexgon';
      recordMove(parseInt(fromRow), parseInt(fromCol), parseInt(toRow), parseInt(toCol), pieceType, isWhite, didCapture);
    }
    
    if (typeof recordMoveRPN === 'function') {
      recordMoveRPN(fromHex.id, toHex.id, newPiece, didCapture, false, '');
    }
    
    if (typeof highlightLastMove === 'function') {
      highlightLastMove(fromHexId, toHexId);
    }
    
    if (typeof playClickSound === 'function') {
      playClickSound();
    }
    
    if (typeof highlightAllPiecesUnderAttack === 'function') {
      highlightAllPiecesUnderAttack();
    }
    
    if (typeof checkWinConditions === 'function') {
      checkWinConditions(parseInt(toRow), parseInt(toCol), newPiece);
    }
    
    if (typeof checkRhombusDeadlock === 'function' && typeof gameOver !== 'undefined' && !gameOver) {
      checkRhombusDeadlock();
    }
    
    // End turn if not a rotatable piece
    if (typeof switchTurn === 'function' && typeof gameOver !== 'undefined' && !gameOver) {
      const isCapture = didCapture;
      if (isCapture) {
        switchTurn();
      } else if (!newPiece.classList.contains('triangle-piece') && !newPiece.classList.contains('hexgon-piece')) {
        switchTurn();
      }
    }
    
    this.logDebug(`Move completed: ${fromHexId} → ${toHexId} (capture: ${didCapture})`);
  }
  
  /**
   * Confirm move at current position
   */
  confirmMoveAtPosition(row, col) {
    const hexId = `hex-${row}-${col}`;
    this.logDebug(`Confirming move at: ${hexId}`);
    
    // For rotatable pieces, trigger rotation completion
    const hex = document.getElementById(hexId);
    if (!hex) return false;
    
    const piece = hex.querySelector('.triangle-piece, .hexgon-piece');
    if (!piece) return false;
    
    // End turn for rotatable pieces
    if (typeof switchTurn === 'function' && typeof gameOver !== 'undefined' && !gameOver) {
      switchTurn();
    }
    
    return true;
  }
  
  /**
   * Update player indicator based on game state
   */
  updateKeyboardPlayerIndicator() {
    const indicator = document.getElementById('kb-player-indicator');
    if (!indicator) return;
    
    // Determine current player (black=1, white=2)
    // This is a simplified check - you may need to adjust based on actual game state
    const allPieces = document.querySelectorAll('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
    
    // For now, toggle between players
    // In a real implementation, check against the current turn variable if available
    this.gameState.lastPlayer = this.gameState.lastPlayer === 1 ? 2 : 1;
    const currentPlayer = this.gameState.lastPlayer;
    
    const playerName = currentPlayer === 1 ? '♟ BLACK (P1)' : '♚ WHITE (P2)';
    const bgColor = currentPlayer === 1 ? '#333' : '#ccc';
    const textColor = currentPlayer === 1 ? '#fff' : '#333';
    
    indicator.textContent = playerName;
    indicator.style.backgroundColor = bgColor;
    indicator.style.color = textColor;
  }
  
  /**
   * Get valid moves for a piece at given position
   */
  getValidMovesForPiece(row, col) {
    const hexId = `hex-${row}-${col}`;
    const hex = document.getElementById(hexId);
    
    if (!hex) return [];
    
    const validHexes = [];
    document.querySelectorAll('.hexagon.highlight-green, .hexagon.highlight-red, .hexagon.highlight-diagonal, .hexagon.highlight-danger').forEach(highlightedHex => {
      const [, r, c] = highlightedHex.id.match(/hex-(\d+)-(\d+)/);
      validHexes.push({ row: parseInt(r), col: parseInt(c), hexId: highlightedHex.id });
    });
    
    return validHexes;
  }
  
  /**
   * Debug logging
   */
  logDebug(message) {
    console.log(`[KeyboardIntegration] ${message}`);
  }
}

// Initialize integration when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.keyboardIntegration = new KeyboardGameIntegration();
  });
} else {
  window.keyboardIntegration = new KeyboardGameIntegration();
}

console.log('✅ Keyboard-Game Integration loaded');

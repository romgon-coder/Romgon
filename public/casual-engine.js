/**
 * 🎮 CASUAL GAME ENGINE FOR ROMGON
 * ================================
 * 
 * This engine handles casual/puzzle game modes with:
 * - Move-only gameplay (no combat/capturing)
 * - Collectible tracking
 * - Goal/exit zones
 * - Timer and move limit challenges
 * - Teleport, trap, and puzzle mechanics
 * 
 * Best for: Puzzles, mazes, race games, collect-athons
 */

class CasualGameEngine {
    constructor(gameConfig, gameState) {
        this.config = gameConfig;
        this.state = gameState;
        this.moveCount = 0;
        this.collectedItems = [];
        this.startTime = Date.now();
        this.gameActive = true;
        
        // Initialize mechanics from config
        this.mechanics = gameConfig.rules?.mechanics || {};
        this.boardMechanics = gameConfig.board?.boardMechanics || {};
        
        console.log('🎮 Casual Engine initialized:', {
            mechanics: this.mechanics,
            boardMechanics: this.boardMechanics
        });
    }
    
    // ====================================
    // MOVEMENT VALIDATION (NO COMBAT)
    // ====================================
    
    canMove(piece, fromHex, toHex) {
        if (!this.gameActive) return false;
        
        // Check move limit if enabled
        if (this.mechanics.moveLimit?.enabled) {
            const maxMoves = this.mechanics.moveLimit.maxMoves || Infinity;
            if (this.moveCount >= maxMoves) {
                this.showMessage('❌ Move limit reached!');
                return false;
            }
        }
        
        // Check if piece is trapped
        if (this.isPieceTrapped(piece, fromHex)) {
            this.showMessage('🔒 This piece is trapped!');
            return false;
        }
        
        // Check if destination is blocked
        if (this.isHexOccupied(toHex)) {
            this.showMessage('❌ Destination occupied');
            return false;
        }
        
        // Check one-way restrictions
        if (this.boardMechanics.oneWay) {
            const specialZone = this.config.board.specialZones?.[fromHex];
            if (specialZone?.startsWith('oneway_')) {
                const direction = specialZone.split('_')[1];
                if (!this.isValidOneWayMove(fromHex, toHex, direction)) {
                    this.showMessage('⛔ One-way restriction!');
                    return false;
                }
            }
        }
        
        // Check movement pattern
        if (!this.isValidMovementPattern(piece, fromHex, toHex)) {
            this.showMessage('❌ Invalid movement pattern');
            return false;
        }
        
        return true;
    }
    
    // ====================================
    // MOVE EXECUTION
    // ====================================
    
    executeMove(piece, fromHex, toHex) {
        if (!this.canMove(piece, fromHex, toHex)) {
            return false;
        }
        
        // Move the piece
        this.movePiece(piece, fromHex, toHex);
        this.moveCount++;
        
        // Handle special zone effects
        this.handleZoneEffects(piece, toHex);
        
        // Check for collectibles
        this.checkCollectibles(toHex);
        
        // Check for goal/exit
        if (this.checkGoalReached(toHex)) {
            this.handleVictory();
            return true;
        }
        
        // Check for timer expiration
        if (this.mechanics.timed?.enabled) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            const timeLimit = this.mechanics.timed.duration || 300;
            if (elapsed >= timeLimit) {
                this.handleTimeOut();
                return false;
            }
        }
        
        // Update UI
        this.updateGameDisplay();
        
        return true;
    }
    
    // ====================================
    // ZONE MECHANICS
    // ====================================
    
    handleZoneEffects(piece, hexKey) {
        const specialZone = this.config.board.specialZones?.[hexKey];
        
        if (!specialZone) return;
        
        switch (specialZone) {
            case 'teleport':
                this.handleTeleport(piece, hexKey);
                break;
            case 'trap':
                this.handleTrap(piece, hexKey);
                break;
            case 'boost':
                this.handleBoost(piece, hexKey);
                break;
            case 'slow':
                this.handleSlow(piece, hexKey);
                break;
            case 'damage':
                this.handleDamage(piece, hexKey);
                break;
            case 'heal':
                this.handleHeal(piece, hexKey);
                break;
            case 'checkpoint':
                this.handleCheckpoint(piece, hexKey);
                break;
        }
    }
    
    handleTeleport(piece, fromHex) {
        if (!this.boardMechanics.teleport) return;
        
        // Find all teleport zones
        const teleportZones = Object.entries(this.config.board.specialZones || {})
            .filter(([key, zone]) => zone === 'teleport' && key !== fromHex)
            .map(([key]) => key);
        
        if (teleportZones.length > 0) {
            // Random teleport destination
            const destination = teleportZones[Math.floor(Math.random() * teleportZones.length)];
            
            // Check if destination is empty
            if (!this.isHexOccupied(destination)) {
                this.movePiece(piece, fromHex, destination);
                this.showMessage('🌀 Teleported!');
            }
        }
    }
    
    handleTrap(piece, hexKey) {
        if (!this.boardMechanics.trap) return;
        
        // Mark piece as trapped (immobilized for turns)
        piece.trapped = true;
        piece.trappedTurns = 2; // Default 2 turns
        this.showMessage('🔒 Piece trapped!');
    }
    
    handleBoost(piece, hexKey) {
        if (!this.boardMechanics.boost) return;
        
        // Give extra move
        this.moveCount--;
        this.showMessage('⚡ Speed boost! Free move!');
    }
    
    handleSlow(piece, hexKey) {
        if (!this.boardMechanics.slow) return;
        
        // Penalty move
        this.moveCount++;
        this.showMessage('🐌 Slowed down!');
    }
    
    handleDamage(piece, hexKey) {
        // In casual mode, damage might reduce "lives" or send back to checkpoint
        if (piece.lives !== undefined) {
            piece.lives--;
            if (piece.lives <= 0) {
                this.handlePieceEliminated(piece);
            }
        } else {
            // Send to last checkpoint
            if (piece.lastCheckpoint) {
                this.movePiece(piece, hexKey, piece.lastCheckpoint);
            }
        }
        this.showMessage('💥 Ouch!');
    }
    
    handleHeal(piece, hexKey) {
        if (piece.lives !== undefined) {
            piece.lives = Math.min((piece.lives || 3) + 1, 3);
            this.showMessage('💚 Healed!');
        }
    }
    
    handleCheckpoint(piece, hexKey) {
        piece.lastCheckpoint = hexKey;
        this.showMessage('🚩 Checkpoint saved!');
    }
    
    // ====================================
    // COLLECTIBLES
    // ====================================
    
    checkCollectibles(hexKey) {
        if (!this.mechanics.collectibles?.enabled) return;
        
        const specialZone = this.config.board.specialZones?.[hexKey];
        
        if (specialZone === 'collectable') {
            this.collectedItems.push(hexKey);
            
            // Remove from board
            delete this.config.board.specialZones[hexKey];
            
            const targetCount = this.mechanics.collectibles.count || 5;
            const collected = this.collectedItems.length;
            
            this.showMessage(`⭐ Collected! (${collected}/${targetCount})`);
            
            // Check if all collected
            if (collected >= targetCount) {
                this.handleVictory();
            }
        }
    }
    
    // ====================================
    // WIN CONDITIONS
    // ====================================
    
    checkGoalReached(hexKey) {
        if (!this.boardMechanics.goal) return false;
        
        const specialZone = this.config.board.specialZones?.[hexKey];
        return specialZone === 'goal';
    }
    
    handleVictory() {
        this.gameActive = false;
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
        
        this.showMessage(`🎉 Victory! Time: ${elapsed}s, Moves: ${this.moveCount}`);
        
        // Trigger victory event
        if (window.handleGameEnd) {
            window.handleGameEnd('victory', {
                time: elapsed,
                moves: this.moveCount,
                collectibles: this.collectedItems.length
            });
        }
    }
    
    handleTimeOut() {
        this.gameActive = false;
        this.showMessage('⏱️ Time\'s up! Game Over');
        
        if (window.handleGameEnd) {
            window.handleGameEnd('timeout', {
                moves: this.moveCount,
                collectibles: this.collectedItems.length
            });
        }
    }
    
    // ====================================
    // HELPER FUNCTIONS
    // ====================================
    
    isPieceTrapped(piece, hexKey) {
        if (!this.mechanics.trapped?.enabled) return false;
        
        const specialZone = this.config.board.specialZones?.[hexKey];
        
        if (specialZone === 'trap') return true;
        if (piece.trapped && piece.trappedTurns > 0) return true;
        
        return false;
    }
    
    isHexOccupied(hexKey) {
        // Check if any piece occupies this hex
        return this.state.placements?.some(p => p.position === hexKey) || false;
    }
    
    isValidMovementPattern(piece, fromHex, toHex) {
        // Parse hex coordinates
        const [fromRow, fromCol] = fromHex.split(',').map(Number);
        const [toRow, toCol] = toHex.split(',').map(Number);
        
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        
        // Check movement pattern
        const pattern = piece.movementPattern || 'any';
        
        switch (pattern) {
            case 'orthogonal':
                // Only horizontal or vertical moves
                return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
            
            case 'diagonal':
                // Only diagonal moves
                return rowDiff === colDiff && rowDiff === 1;
            
            case 'knight':
                // L-shaped moves
                return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
            
            case 'any':
            default:
                // Adjacent hex only (1 step)
                return rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff) > 0;
        }
    }
    
    isValidOneWayMove(fromHex, toHex, direction) {
        const [fromRow, fromCol] = fromHex.split(',').map(Number);
        const [toRow, toCol] = toHex.split(',').map(Number);
        
        switch (direction) {
            case 'up': return toRow < fromRow;
            case 'down': return toRow > fromRow;
            case 'left': return toCol < fromCol;
            case 'right': return toCol > fromCol;
            default: return true;
        }
    }
    
    movePiece(piece, fromHex, toHex) {
        // Update piece position in state
        const placement = this.state.placements?.find(p => p.position === fromHex);
        if (placement) {
            placement.position = toHex;
        }
    }
    
    handlePieceEliminated(piece) {
        // Remove piece from board
        const index = this.state.placements?.findIndex(p => p.id === piece.id);
        if (index !== -1) {
            this.state.placements.splice(index, 1);
        }
        this.showMessage('💀 Piece eliminated!');
    }
    
    updateGameDisplay() {
        // Update move counter
        if (document.getElementById('moveCounter')) {
            document.getElementById('moveCounter').textContent = `Moves: ${this.moveCount}`;
        }
        
        // Update collectibles counter
        if (document.getElementById('collectiblesCounter')) {
            const target = this.mechanics.collectibles?.count || 5;
            document.getElementById('collectiblesCounter').textContent = 
                `Collectibles: ${this.collectedItems.length}/${target}`;
        }
        
        // Update timer
        if (this.mechanics.timed?.enabled && document.getElementById('timerDisplay')) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const timeLimit = this.mechanics.timed.duration || 300;
            const remaining = Math.max(0, timeLimit - elapsed);
            
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            document.getElementById('timerDisplay').textContent = 
                `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Trigger redraw
        if (window.redrawBoard) {
            window.redrawBoard();
        }
    }
    
    showMessage(text) {
        console.log('🎮', text);
        
        // Show in-game notification
        if (window.showNotification) {
            window.showNotification(text);
        }
    }
    
    // ====================================
    // GAME STATE
    // ====================================
    
    getGameState() {
        return {
            moveCount: this.moveCount,
            collectedItems: this.collectedItems,
            elapsedTime: (Date.now() - this.startTime) / 1000,
            gameActive: this.gameActive
        };
    }
    
    resetGame() {
        this.moveCount = 0;
        this.collectedItems = [];
        this.startTime = Date.now();
        this.gameActive = true;
        this.updateGameDisplay();
    }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CasualGameEngine;
}

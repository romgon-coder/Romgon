// ============================================
// ROMGON GAME ENGINE
// ============================================

class GameEngine {
    constructor(gameId, playerColor, boardSize = 8) {
        this.gameId = gameId;
        this.playerColor = playerColor; // 'white' or 'black'
        this.boardSize = boardSize;
        this.currentTurn = 'white'; // White always goes first
        this.gameStatus = 'active'; // active, finished, draw
        this.winner = null;
        
        // Initialize empty board
        this.board = this.initializeBoard();
        this.moveHistory = [];
        this.capturedPieces = { white: 0, black: 0 };
        
        console.log(`🎮 Game ${gameId} initialized for ${playerColor}`);
    }

    /**
     * Initialize empty hexagon board
     */
    initializeBoard() {
        const board = {};
        
        // Create axial coordinate system for hexagons
        for (let q = -this.boardSize; q <= this.boardSize; q++) {
            for (let r = -this.boardSize; r <= this.boardSize; r++) {
                const s = -q - r;
                // Only keep hexagons within the board radius
                if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= this.boardSize) {
                    const key = `${q},${r}`;
                    board[key] = null; // null = empty, 'white', 'black'
                }
            }
        }
        
        return board;
    }

    /**
     * Place a piece on the board
     */
    placePiece(q, r, color) {
        const key = `${q},${r}`;
        
        // Validate move
        if (!this.isValidMove(q, r, color)) {
            return { success: false, error: 'Invalid move' };
        }
        
        this.board[key] = color;
        this.moveHistory.push({ q, r, color, timestamp: Date.now() });
        
        // Check for captures after placing piece
        this.checkCaptures(q, r, color);
        
        // Switch turn
        this.currentTurn = color === 'white' ? 'black' : 'white';
        
        return { success: true, move: { q, r, color } };
    }

    /**
     * Check if a move is valid
     */
    isValidMove(q, r, color) {
        const key = `${q},${r}`;
        
        // Must be within board
        if (!this.board.hasOwnProperty(key)) {
            return false;
        }
        
        // Must be empty
        if (this.board[key] !== null) {
            return false;
        }
        
        // Must be player's turn (for local validation)
        if (color !== this.currentTurn) {
            return false;
        }
        
        // Must be adjacent to existing piece or center (for first move)
        if (this.moveHistory.length === 0 && (q !== 0 || r !== 0)) {
            return false; // First move must be at center
        }
        
        // If not first move, must be adjacent to existing piece
        if (this.moveHistory.length > 0) {
            if (!this.isAdjacentToAnyPiece(q, r)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if hexagon is adjacent to any piece
     */
    isAdjacentToAnyPiece(q, r) {
        const neighbors = this.getNeighbors(q, r);
        return neighbors.some(([nq, nr]) => {
            const key = `${nq},${nr}`;
            return this.board[key] !== null;
        });
    }

    /**
     * Get all neighbor hexagon coordinates
     */
    getNeighbors(q, r) {
        // Hexagon neighbors in axial coordinates
        const directions = [
            [1, 0], [1, -1], [0, -1],
            [-1, 0], [-1, 1], [0, 1]
        ];
        
        return directions.map(([dq, dr]) => [q + dq, r + dr]);
    }

    /**
     * Check and handle piece captures
     */
    checkCaptures(q, r, color) {
        const opponent = color === 'white' ? 'black' : 'white';
        let captureCount = 0;
        
        // Check all neighbors
        const neighbors = this.getNeighbors(q, r);
        
        for (const [nq, nr] of neighbors) {
            const key = `${nq},${nr}`;
            
            // Skip if not on board or not opponent piece
            if (!this.board.hasOwnProperty(key) || this.board[key] !== opponent) {
                continue;
            }
            
            // Check if opponent piece is surrounded by 3 or more of our pieces
            const neighborNeighbors = this.getNeighbors(nq, nr);
            let surroundingCount = 0;
            
            for (const [nnq, nnr] of neighborNeighbors) {
                const nnKey = `${nnq},${nnr}`;
                if (this.board[nnKey] === color) {
                    surroundingCount++;
                }
            }
            
            // If surrounded by 3+, capture it
            if (surroundingCount >= 3) {
                this.board[key] = null;
                this.capturedPieces[color]++;
                captureCount++;
            }
        }
        
        return captureCount;
    }

    /**
     * Check if game is over
     */
    checkGameOver() {
        // Win condition: capture 3+ opponent pieces
        if (this.capturedPieces.white >= 3) {
            this.gameStatus = 'finished';
            this.winner = 'white';
            return { gameOver: true, winner: 'white', reason: 'Captured 3+ pieces' };
        }
        
        if (this.capturedPieces.black >= 3) {
            this.gameStatus = 'finished';
            this.winner = 'black';
            return { gameOver: true, winner: 'black', reason: 'Captured 3+ pieces' };
        }
        
        // Draw condition: 50 moves with no captures
        if (this.moveHistory.length >= 100 && 
            this.capturedPieces.white === 0 && 
            this.capturedPieces.black === 0) {
            this.gameStatus = 'draw';
            this.winner = null;
            return { gameOver: true, winner: null, reason: 'Draw - No captures in 100 moves' };
        }
        
        return { gameOver: false };
    }

    /**
     * Get current game state
     */
    getGameState() {
        return {
            gameId: this.gameId,
            board: this.board,
            currentTurn: this.currentTurn,
            gameStatus: this.gameStatus,
            winner: this.winner,
            capturedPieces: this.capturedPieces,
            moveHistory: this.moveHistory,
            totalMoves: this.moveHistory.length,
            ...this.checkGameOver()
        };
    }

    /**
     * Get valid moves for a color
     */
    getValidMoves(color) {
        const validMoves = [];
        
        if (this.moveHistory.length === 0) {
            // First move must be at center
            return [[0, 0]];
        }
        
        // Check all board positions
        for (const key in this.board) {
            if (this.board[key] === null) {
                const [q, r] = key.split(',').map(Number);
                if (this.isAdjacentToAnyPiece(q, r)) {
                    validMoves.push([q, r]);
                }
            }
        }
        
        return validMoves;
    }

    /**
     * Serialize board for transmission
     */
    serializeBoard() {
        const pieces = [];
        for (const key in this.board) {
            if (this.board[key] !== null) {
                const [q, r] = key.split(',').map(Number);
                pieces.push({ q, r, color: this.board[key] });
            }
        }
        return pieces;
    }

    /**
     * Deserialize board from transmission
     */
    deserializeBoard(pieces) {
        this.board = this.initializeBoard();
        for (const { q, r, color } of pieces) {
            this.board[`${q},${r}`] = color;
        }
    }

    /**
     * Get game stats
     */
    getStats() {
        return {
            totalMoves: this.moveHistory.length,
            whiteCaptured: this.capturedPieces.white,
            blackCaptured: this.capturedPieces.black,
            gameStatus: this.gameStatus,
            winner: this.winner
        };
    }
}

// Export for use in other files
window.GameEngine = GameEngine;

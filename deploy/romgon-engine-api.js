/**
 * Romgon Game Engine API
 * Universal interface for AI systems, LLMs, and external applications
 * Version: 1.0.0
 */

(function() {
    'use strict';
    
    window.RomgonEngine = {
        version: '1.0.0',
        
        /**
         * Get complete game state
         * @returns {Object} Current game state
         */
        getGameState: function() {
            const state = {
                version: this.version,
                turn: window.currentPlayer || 'black',
                moveNumber: window.moveCount || 0,
                pieces: {},
                gameOver: window.gameOver || false,
                winner: null,
                baseDefense: {
                    black: this._isBaseDefended('black'),
                    white: this._isBaseDefended('white')
                },
                zones: this._getZoneInfo(),
                repetitionCounts: this._getRepetitionInfo(),
                lastMove: window.lastMove || null
            };
            
            // Collect all pieces on board
            document.querySelectorAll('.hexagon').forEach(hex => {
                const piece = hex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
                if (piece) {
                    const [, row, col] = hex.id.match(/hex-(\d+)-(\d+)/);
                    const position = `${row}-${col}`;
                    
                    state.pieces[position] = {
                        type: this._getPieceType(piece),
                        color: this._getPieceColor(piece),
                        orientation: this._getPieceOrientation(piece),
                        canMove: !window.gameOver && this._canPieceMove(position, this._getPieceColor(piece))
                    };
                }
            });
            
            return state;
        },
        
        /**
         * Get all legal moves for current player or specific position
         * @param {string} position - Optional: specific position like "3-0"
         * @returns {Array} Array of legal moves in RPN format
         */
        getLegalMoves: function(position = null) {
            if (window.gameOver) return [];
            
            const moves = [];
            const currentTurn = window.currentPlayer || 'black';
            
            if (position) {
                // Get moves for specific piece
                const [row, col] = position.split('-').map(Number);
                const hex = document.getElementById(`hex-${row}-${col}`);
                if (!hex) return [];
                
                const piece = hex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
                if (!piece) return [];
                
                const pieceColor = this._getPieceColor(piece);
                if (pieceColor !== currentTurn) return [];
                
                const pieceType = this._getPieceType(piece);
                const pieceMoves = this._getPossibleMovesForPiece(row, col, pieceType, pieceColor === 'white');
                
                pieceMoves.forEach(move => {
                    const moveNotation = this._formatMoveRPN(row, col, move.row, move.col, move.isCapture);
                    moves.push(moveNotation);
                });
                
            } else {
                // Get all moves for current player
                const pieces = document.querySelectorAll(
                    currentTurn === 'white' 
                        ? '.white-piece, .white-triangle, .white-rhombus, .white-circle, .white-hexgon'
                        : '.square-piece:not(.white-piece), .triangle-piece:not(.white-triangle), .rhombus-piece:not(.white-rhombus), .circle-piece:not(.white-circle), .hexgon-piece:not(.white-hexgon)'
                );
                
                pieces.forEach(piece => {
                    const hex = piece.closest('.hexagon');
                    if (!hex) return;
                    
                    const [, row, col] = hex.id.match(/hex-(\d+)-(\d+)/);
                    const pieceType = this._getPieceType(piece);
                    const pieceMoves = this._getPossibleMovesForPiece(parseInt(row), parseInt(col), pieceType, currentTurn === 'white');
                    
                    pieceMoves.forEach(move => {
                        const moveNotation = this._formatMoveRPN(row, col, move.row, move.col, move.isCapture);
                        moves.push(moveNotation);
                    });
                });
            }
            
            return moves;
        },
        
        /**
         * Make a move in RPN format
         * @param {string} moveNotation - Move in format "3-0→3-1" or "3-0→3-1 C"
         * @returns {Object} Result of the move
         */
        makeMove: function(moveNotation) {
            if (window.gameOver) {
                return {
                    success: false,
                    error: 'Game is over',
                    move: moveNotation
                };
            }
            
            try {
                // Parse move notation
                const parsed = this._parseMoveNotation(moveNotation);
                if (!parsed) {
                    return {
                        success: false,
                        error: 'Invalid move notation',
                        move: moveNotation
                    };
                }
                
                const {fromRow, fromCol, toRow, toCol} = parsed;
                
                // Validate move
                const validation = this.validateMove(moveNotation);
                if (!validation.valid) {
                    return {
                        success: false,
                        error: validation.reason,
                        move: moveNotation
                    };
                }
                
                // Execute move programmatically
                const fromHex = document.getElementById(`hex-${fromRow}-${fromCol}`);
                const toHex = document.getElementById(`hex-${toRow}-${toCol}`);
                
                if (!fromHex || !toHex) {
                    return {
                        success: false,
                        error: 'Invalid hex coordinates',
                        move: moveNotation
                    };
                }
                
                const piece = fromHex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
                const captured = toHex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
                
                // Trigger the move through DOM manipulation
                this._executeMoveDOM(fromHex, toHex, piece, captured);
                
                return {
                    success: true,
                    move: moveNotation,
                    captured: captured ? this._getPieceType(captured) : null,
                    check: this._isInCheck(),
                    gameOver: window.gameOver || false,
                    winner: window.winner || null
                };
                
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    move: moveNotation
                };
            }
        },
        
        /**
         * Validate if a move is legal
         * @param {string} moveNotation - Move in RPN format
         * @returns {Object} {valid: boolean, reason: string}
         */
        validateMove: function(moveNotation) {
            const legalMoves = this.getLegalMoves();
            const moveBase = moveNotation.split(' ')[0]; // Remove modifiers
            
            if (legalMoves.some(m => m.startsWith(moveBase))) {
                return {valid: true, reason: null};
            }
            
            return {
                valid: false,
                reason: 'Move not in legal moves list'
            };
        },
        
        /**
         * Export entire game in RPN format
         * @returns {string} Complete game notation
         */
        exportGameRPN: function() {
            if (typeof exportMovesRPN === 'function') {
                return exportMovesRPN();
            }
            return '';
        },
        
        /**
         * Import game from RPN format
         * @param {string} rpnString - Game in RPN format
         * @returns {Object} Result of import
         */
        importGameRPN: function(rpnString) {
            if (typeof importMovesRPN === 'function') {
                try {
                    importMovesRPN(rpnString);
                    return {success: true, movesImported: rpnString.split('|').length};
                } catch (error) {
                    return {success: false, error: error.message};
                }
            }
            return {success: false, error: 'Import function not available'};
        },
        
        /**
         * Analyze current position
         * @returns {Object} Position analysis
         */
        analyzePosition: function() {
            const state = this.getGameState();
            const analysis = {
                materialCount: {
                    white: {square: 0, triangle: 0, rhombus: 0, circle: 0, hexagon: 0},
                    black: {square: 0, triangle: 0, rhombus: 0, circle: 0, hexagon: 0}
                },
                materialValue: {white: 0, black: 0},
                rhombusDistanceToGoal: {},
                threatenedPieces: {white: [], black: []},
                evaluation: 0
            };
            
            const pieceValues = {
                square: 150,
                triangle: 180,
                hexagon: 170,
                circle: 160,
                rhombus: 0 // Strategic, not material value
            };
            
            // Count material
            for (const [pos, piece] of Object.entries(state.pieces)) {
                const color = piece.color;
                const type = piece.type;
                
                analysis.materialCount[color][type]++;
                analysis.materialValue[color] += pieceValues[type] || 0;
                
                // Track rhombus distance to goal
                if (type === 'rhombus') {
                    const [row, col] = pos.split('-').map(Number);
                    const goalCol = color === 'white' ? 8 : 0;
                    analysis.rhombusDistanceToGoal[color] = Math.abs(row - 3) + Math.abs(col - goalCol);
                }
            }
            
            // Calculate evaluation (positive = white advantage)
            analysis.evaluation = analysis.materialValue.white - analysis.materialValue.black;
            
            // Add rhombus progress
            if (analysis.rhombusDistanceToGoal.white !== undefined) {
                analysis.evaluation += (20 - analysis.rhombusDistanceToGoal.white) * 5;
            }
            if (analysis.rhombusDistanceToGoal.black !== undefined) {
                analysis.evaluation -= (20 - analysis.rhombusDistanceToGoal.black) * 5;
            }
            
            return analysis;
        },
        
        /**
         * Get piece suggestions based on current position
         * @returns {Array} Suggested moves with scores
         */
        getSuggestedMoves: function(count = 5) {
            const moves = this.getLegalMoves();
            const scored = [];
            
            moves.forEach(move => {
                const score = this._evaluateMoveQuick(move);
                scored.push({move, score});
            });
            
            scored.sort((a, b) => b.score - a.score);
            return scored.slice(0, count);
        },
        
        // =======================
        // HELPER METHODS (Private)
        // =======================
        
        _getPieceType: function(piece) {
            if (piece.classList.contains('square-piece')) return 'square';
            if (piece.classList.contains('triangle-piece')) return 'triangle';
            if (piece.classList.contains('rhombus-piece')) return 'rhombus';
            if (piece.classList.contains('circle-piece')) return 'circle';
            if (piece.classList.contains('hexgon-piece')) return 'hexagon';
            return 'unknown';
        },
        
        _getPieceColor: function(piece) {
            if (piece.classList.contains('white-piece') || 
                piece.classList.contains('white-triangle') ||
                piece.classList.contains('white-rhombus') ||
                piece.classList.contains('white-circle') ||
                piece.classList.contains('white-hexgon')) {
                return 'white';
            }
            return 'black';
        },
        
        _getPieceOrientation: function(piece) {
            const orientation = piece.getAttribute('data-orientation');
            return orientation ? parseInt(orientation) : 0;
        },
        
        _canPieceMove: function(position, color) {
            return color === (window.currentPlayer || 'black');
        },
        
        _isBaseDefended: function(color) {
            const basePos = color === 'black' ? '3-0' : '3-8';
            const hex = document.getElementById(`hex-${basePos}`);
            if (!hex) return false;
            
            const piece = hex.querySelector('.rhombus-piece');
            if (!piece) return false;
            
            return this._getPieceColor(piece) === color;
        },
        
        _getZoneInfo: function() {
            return {
                deadZone: ['3-3', '3-4', '3-5'],
                innerPerimeter: ['2-2', '2-3', '2-4', '2-5', '3-2', '3-6', '4-2', '4-3', '4-4', '4-5'],
                outerZone: 'rows 0,1,5,6'
            };
        },
        
        _getRepetitionInfo: function() {
            if (window.moveRepetitions) {
                const info = {};
                window.moveRepetitions.forEach((count, key) => {
                    if (count >= 2) {
                        info[key] = count;
                    }
                });
                return info;
            }
            return {};
        },
        
        _getPossibleMovesForPiece: function(row, col, pieceType, isWhite) {
            // Use existing game functions
            if (typeof getPossibleMoves === 'function') {
                return getPossibleMoves(row, col, pieceType, isWhite);
            }
            return [];
        },
        
        _formatMoveRPN: function(fromRow, fromCol, toRow, toCol, isCapture) {
            let notation = `${fromRow}-${fromCol}→${toRow}-${toCol}`;
            if (isCapture) notation += ' C';
            return notation;
        },
        
        _parseMoveNotation: function(notation) {
            const match = notation.match(/(\d+)-(\d+)→(\d+)-(\d+)/);
            if (!match) return null;
            
            return {
                fromRow: parseInt(match[1]),
                fromCol: parseInt(match[2]),
                toRow: parseInt(match[3]),
                toCol: parseInt(match[4])
            };
        },
        
        _executeMoveDOM: function(fromHex, toHex, piece, captured) {
            // Simulate a drag-and-drop move
            // This triggers all the existing game logic
            const event = new DragEvent('drop', {
                dataTransfer: new DataTransfer()
            });
            
            // Set the dragged piece
            window.draggedPiece = piece;
            
            // Trigger drop event on target hex
            toHex.dispatchEvent(event);
            
            // Clean up
            window.draggedPiece = null;
        },
        
        _isInCheck: function() {
            // Check if current player's rhombus is under attack
            const currentColor = window.currentPlayer || 'black';
            const rhombus = document.querySelector(
                currentColor === 'white' ? '.rhombus-piece.white-rhombus' : '.rhombus-piece:not(.white-rhombus)'
            );
            
            if (!rhombus) return false;
            
            const hex = rhombus.closest('.hexagon');
            if (!hex) return false;
            
            const [, row, col] = hex.id.match(/hex-(\d+)-(\d+)/);
            
            if (typeof isPieceUnderThreat === 'function') {
                return isPieceUnderThreat(parseInt(row), parseInt(col), currentColor === 'white');
            }
            
            return false;
        },
        
        _evaluateMoveQuick: function(moveNotation) {
            // Quick heuristic evaluation
            let score = 0;
            
            // Captures are valuable
            if (moveNotation.includes(' C')) {
                score += 200;
            }
            
            // Center control
            const toPos = moveNotation.match(/→(\d+)-(\d+)/);
            if (toPos) {
                const toRow = parseInt(toPos[1]);
                const toCol = parseInt(toPos[2]);
                
                if (toRow === 3) score += 20;
                const centerDist = Math.abs(toRow - 3) + Math.abs(toCol - 4);
                score += (10 - centerDist) * 3;
            }
            
            return score;
        }
    };
    
    // Expose to window
    console.log('🎮 Romgon Game Engine API loaded - Version ' + window.RomgonEngine.version);
    console.log('📖 Documentation: See game-engine-api.html');
    console.log('🔧 Quick start: window.RomgonEngine.getGameState()');
    
})();

// ============================================
// BOARD RENDERER - Hexagon Visualization
// ============================================

class BoardRenderer {
    constructor(containerId, gameEngine, onHexClick) {
        this.container = document.getElementById(containerId);
        this.gameEngine = gameEngine;
        this.onHexClick = onHexClick;
        
        // Canvas settings
        this.hexSize = 40; // Pixels
        this.offsetX = 0;
        this.offsetY = 0;
        this.zoom = 1;
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.canvas.style.display = 'block';
        this.canvas.style.cursor = 'pointer';
        this.container.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        // Center the board
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2;
        
        // Event listeners
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        window.addEventListener('resize', () => this.resize());
        
        // Initial render
        this.render();
    }

    /**
     * Convert axial coordinates to pixel coordinates
     */
    hexToPixel(q, r) {
        const x = this.hexSize * (3/2 * q);
        const y = this.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
        return [x, y];
    }

    /**
     * Convert pixel coordinates to axial coordinates
     */
    pixelToHex(x, y) {
        // Reverse of hexToPixel
        x = (x - this.offsetX) / this.zoom;
        y = (y - this.offsetY) / this.zoom;
        
        const q = (2/3 * x) / this.hexSize;
        const r = (-1/3 * x + Math.sqrt(3)/3 * y) / this.hexSize;
        
        return this.roundHex(q, r);
    }

    /**
     * Round hex coordinates to nearest integer
     */
    roundHex(q, r) {
        let rq = Math.round(q);
        let rr = Math.round(r);
        let rs = Math.round(-q - r);
        
        let qDiff = Math.abs(rq - q);
        let rDiff = Math.abs(rr - r);
        let sDiff = Math.abs(rs - (-q - r));
        
        if (qDiff > rDiff && qDiff > sDiff) {
            rq = -rr - rs;
        } else if (rDiff > sDiff) {
            rr = -rq - rs;
        }
        
        return [rq, rr];
    }

    /**
     * Draw a single hexagon
     */
    drawHexagon(q, r, fillColor = '#2a3f5f', strokeColor = '#4ecdc4', lineWidth = 2) {
        const [px, py] = this.hexToPixel(q, r);
        const x = this.offsetX + px * this.zoom;
        const y = this.offsetY + py * this.zoom;
        const size = this.hexSize * this.zoom;
        
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i;
            const hx = x + size * Math.cos(angle);
            const hy = y + size * Math.sin(angle);
            if (i === 0) this.ctx.moveTo(hx, hy);
            else this.ctx.lineTo(hx, hy);
        }
        this.ctx.closePath();
        
        // Fill
        this.ctx.fillStyle = fillColor;
        this.ctx.fill();
        
        // Stroke
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
    }

    /**
     * Draw piece on hexagon
     */
    drawPiece(q, r, color) {
        const [px, py] = this.hexToPixel(q, r);
        const x = this.offsetX + px * this.zoom;
        const y = this.offsetY + py * this.zoom;
        const pieceRadius = this.hexSize * 0.5 * this.zoom;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, pieceRadius, 0, 2 * Math.PI);
        
        this.ctx.fillStyle = color === 'white' ? '#ffffff' : '#1a1a1a';
        this.ctx.fill();
        
        this.ctx.strokeStyle = color === 'white' ? '#666666' : '#cccccc';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    /**
     * Render entire board
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f1419';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all hexagons
        for (const key in this.gameEngine.board) {
            const [q, r] = key.split(',').map(Number);
            
            // Determine hex color based on state
            let hexColor = '#1a2332';
            let strokeColor = '#4ecdc4';
            
            // Highlight valid moves
            if (this.gameEngine.currentTurn === this.gameEngine.playerColor) {
                const validMoves = this.gameEngine.getValidMoves(this.gameEngine.playerColor);
                if (validMoves.some(([vq, vr]) => vq === q && vr === r)) {
                    hexColor = '#2a5f3f';
                    strokeColor = '#4eff8a';
                }
            }
            
            this.drawHexagon(q, r, hexColor, strokeColor, 1.5);
            
            // Draw piece if present
            if (this.gameEngine.board[key]) {
                this.drawPiece(q, r, this.gameEngine.board[key]);
            }
        }
        
        // Draw turn indicator
        this.drawTurnIndicator();
    }

    /**
     * Draw turn indicator and stats
     */
    drawTurnIndicator() {
        const fontSize = 16;
        this.ctx.font = `bold ${fontSize}px Arial`;
        this.ctx.fillStyle = '#4ecdc4';
        
        const text = `Turn: ${this.gameEngine.currentTurn.toUpperCase()}`;
        const metrics = this.ctx.measureText(text);
        const x = this.canvas.width - metrics.width - 20;
        const y = 30;
        
        this.ctx.fillText(text, x, y);
        
        // Draw capture count
        this.ctx.fillStyle = '#ff6b6b';
        const captureText = `Captured: White ${this.gameEngine.capturedPieces.white} | Black ${this.gameEngine.capturedPieces.black}`;
        this.ctx.fillText(captureText, 20, 30);
    }

    /**
     * Handle canvas click
     */
    handleClick(event) {
        if (this.gameEngine.gameStatus !== 'active') {
            return; // Game is over
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const [q, r] = this.pixelToHex(x, y);
        
        // Check if valid and call callback
        if (this.gameEngine.isValidMove(q, r, this.gameEngine.playerColor)) {
            this.onHexClick(q, r);
        } else {
            console.log('❌ Invalid move');
        }
    }

    /**
     * Handle window resize
     */
    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2;
        this.render();
    }

    /**
     * Update board and re-render
     */
    update() {
        this.render();
    }
}

// Export for use
window.BoardRenderer = BoardRenderer;

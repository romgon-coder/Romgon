// Romgon Game Creator - JavaScript Logic
// Handles all game design functionality

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

const gameData = {
    metadata: {
        name: '',
        description: '',
        version: '1.0.0',
        creator: 'Anonymous'
    },
    pieces: [],
    board: {
        width: 11,
        height: 11,
        zones: [],
        placements: [],
        deletedHexes: []
    },
    rules: {
        winConditions: [],
        features: {},
        turnLimit: 100
    }
};

// Canvas setup
let shapeCanvas, shapeCtx;
let moveCanvas, moveCtx;
let boardCanvas, boardCtx;

// NEW: Shape selection instead of pixel art
let selectedShape = null;

// Shape designer - 10x10 pixel grid
let pixelGrid = Array(10).fill(null).map(() => Array(10).fill(false));
let isDrawing = false;
let isErasing = false;

// Movement pattern
let currentPieceForMovement = null;
let currentMovement = { move: [], attack: [], special: [] };

// ============================================================================
// AUTO-FIX CORRUPTED SVG
// ============================================================================

function autoFixCorruptedSVG() {
    try {
        const saved = localStorage.getItem('romgon_game_creator_data');
        if (!saved) return;
        
        const data = JSON.parse(saved);
        if (!data.pieces || !Array.isArray(data.pieces)) return;
        
        let hadCorruption = false;
        data.pieces.forEach(piece => {
            // Check if SVG exists at all (it shouldn't be in localStorage!)
            if (piece.svg) {
                console.warn('⚠️ Found SVG in localStorage for:', piece.name, '- removing it');
                delete piece.svg; // Remove SVG from localStorage
                hadCorruption = true;
            }
        });
        
        // If we found any SVG data in localStorage, clean it up
        if (hadCorruption) {
            console.log('🔥 Cleaning up localStorage - removing all SVG data...');
            localStorage.setItem('romgon_game_creator_data', JSON.stringify(data));
            console.log('✅ localStorage cleaned! SVG will be generated fresh from pixelData.');
            alert('🔧 Cleaned up corrupted data! The page will reload.');
            window.location.reload();
        }
    } catch (e) {
        console.error('Failed to auto-fix SVG:', e);
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
    // AUTO-FIX: Clean up corrupted SVG data on page load
    autoFixCorruptedSVG();
    
    // Shape canvas (10x10 grid)
    shapeCanvas = document.getElementById('shapeCanvas');
    if (shapeCanvas) {
        shapeCtx = shapeCanvas.getContext('2d');
        // Setup shape designer
        initShapeDesigner();
    }
    
    // Movement canvas
    moveCanvas = document.getElementById('moveCanvas');
    if (moveCanvas) {
        moveCtx = moveCanvas.getContext('2d');
        moveCanvas.addEventListener('click', handleMoveClick);
    }
    
    // Board canvas
    boardCanvas = document.getElementById('boardCanvas');
    if (boardCanvas) {
        boardCtx = boardCanvas.getContext('2d');
        boardCanvas.addEventListener('click', handleBoardClick);
    }
    
    // Load saved data
    loadFromLocalStorage();
    
    // Initialize default tool for movement pattern editor
    if (!gameData.currentTool) {
        setMoveTool('move');
    }
    
    // Draw initial states
    if (shapeCanvas) {
        redrawShapeCanvas();
    }
    if (currentPieceForMovement && moveCanvas) {
        redrawMoveCanvas();
    }
    if (boardCanvas) {
        redrawBoard();
    }
});

// ============================================================================
// STEP 1: PIXEL GRID SHAPE DESIGNER (10x10)
// ============================================================================

function initShapeDesigner() {
    if (!shapeCanvas || !shapeCtx) {
        console.error('Shape canvas not initialized');
        return;
    }
    
    shapeCanvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDrawing = true;
        isErasing = e.button === 2; // Right click = erase
        handleShapeDraw(e);
    });
    
    shapeCanvas.addEventListener('mousemove', (e) => {
        e.preventDefault();
        if (isDrawing) {
            handleShapeDraw(e);
        }
    });
    
    shapeCanvas.addEventListener('mouseup', (e) => {
        e.preventDefault();
        isDrawing = false;
    });
    
    shapeCanvas.addEventListener('mouseleave', () => {
        isDrawing = false;
    });
    
    shapeCanvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });
    
    console.log('Shape designer initialized');
    redrawShapeCanvas();
}

function handleShapeDraw(e) {
    if (!shapeCanvas || !shapeCtx) return;
    
    const rect = shapeCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to grid coordinates (10x10)
    const cellSize = 40; // 400 / 10
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    
    if (gridX >= 0 && gridX < 10 && gridY >= 0 && gridY < 10) {
        pixelGrid[gridY][gridX] = !isErasing;
        redrawShapeCanvas();
    }
}

function redrawShapeCanvas() {
    if (!shapeCanvas || !shapeCtx) return;
    
    const cellSize = 40; // 400px / 10 cells
    
    // Clear canvas
    shapeCtx.clearRect(0, 0, 400, 400);
    
    // Draw grid lines
    shapeCtx.strokeStyle = '#ddd';
    shapeCtx.lineWidth = 1;
    
    for (let i = 0; i <= 10; i++) {
        shapeCtx.beginPath();
        shapeCtx.moveTo(i * cellSize, 0);
        shapeCtx.lineTo(i * cellSize, 400);
        shapeCtx.stroke();
        
        shapeCtx.beginPath();
        shapeCtx.moveTo(0, i * cellSize);
        shapeCtx.lineTo(400, i * cellSize);
        shapeCtx.stroke();
    }
    
    // Draw filled pixels
    const colorInput = document.getElementById('pieceColor');
    const color = colorInput ? colorInput.value : '#4a90e2';
    shapeCtx.fillStyle = color;
    
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (pixelGrid[y][x]) {
                shapeCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
}

function clearShape() {
    pixelGrid = Array(10).fill(null).map(() => Array(10).fill(false));
    redrawShapeCanvas();
}

function downloadSVG() {
    const svgData = generateSVGFromGrid();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'piece-shape.svg';
    a.click();
    URL.revokeObjectURL(url);
}

function generateSVGFromGrid() {
    const color = document.getElementById('pieceColor')?.value || '#4a90e2';
    
    // Build SVG using template literals to prevent escaping
    const svgParts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">'];
    
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (pixelGrid[y][x]) {
                svgParts.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`);
            }
        }
    }
    
    svgParts.push('</svg>');
    return svgParts.join('');
}

// ============================================================================
// STEP 1: GEOMETRIC SHAPE SELECTOR (replaces pixel art)
// ============================================================================

function selectShape(shapeName) {
    selectedShape = shapeName;
    
    // Update UI
    document.querySelectorAll('.shape-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    document.querySelector(`[data-shape="${shapeName}"]`).classList.add('selected');
    
    // Update preview
    const color = document.getElementById('pieceColor').value || 'black';
    const preview = document.getElementById('shapePreview');
    preview.innerHTML = `<img src="ASSETS/${shapeName} ${color} front.png" style="max-width: 150px; max-height: 150px;">`;
    
    console.log('Selected shape:', shapeName);
}

function savePieceShape() {
    const name = document.getElementById('pieceName').value.trim();
    
    if (!name) {
        alert('Please enter a piece name!');
        return;
    }
    
    if (!selectedShape) {
        alert('Please select a shape first!');
        return;
    }

    const color = document.getElementById('pieceColor').value;
    const piece = {
        id: Date.now(),
        name: name,
        shape: selectedShape, // Store shape name instead of pixelData
        color: color,
        imageUrl: `ASSETS/${selectedShape} ${color} front.png`, // Direct image reference
        description: document.getElementById('pieceDesc').value,
        abilities: {
            canRotate: document.getElementById('canRotate').checked,
            canFlip: document.getElementById('canFlip').checked,
            canMove: document.getElementById('canMove').checked,
            canAttack: document.getElementById('canAttack').checked,
            canDefend: document.getElementById('canDefend').checked,
            canEscape: document.getElementById('canEscape').checked,
            canCapture: document.getElementById('canCapture').checked
        },
        movement: {
            move: [],
            attack: [],
            special: [],
            type: 'adjacent',
            range: 1,
            rules: {}
        }
    };

    gameData.pieces.push(piece);
    updatePieceGallery();
    updateSelectors();
    saveToLocalStorage();
    
    // Clear form
    document.getElementById('pieceName').value = '';
    document.getElementById('pieceDesc').value = '';
    selectedShape = null;
    document.querySelectorAll('.shape-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById('shapePreview').innerHTML = '<div style="color: #999; font-style: italic;">Select a shape above</div>';
    
    showNotification('✓ Piece added to collection!', 'success');
}

// ============================================================================
// OLD PIXEL ART SYSTEM (deprecated but kept for compatibility)
// ============================================================================

function savePieceShapeOLD() {
    const name = document.getElementById('pieceName').value.trim();
    
    if (!name) {
        alert('Please enter a piece name!');
        return;
    }
    
    // Check if any pixels are drawn
    const hasShape = pixelGrid.some(row => row.some(cell => cell));
    if (!hasShape) {
        alert('Please draw a shape first!');
        return;
    }

    const piece = {
        id: Date.now(),
        name: name,
        color: document.getElementById('pieceColor').value,
        description: document.getElementById('pieceDesc').value,
        svg: generateSVGFromGrid(),
        pixelData: pixelGrid.map(row => [...row]), // Deep copy
        abilities: {
            canRotate: document.getElementById('canRotate').checked,
            canFlip: document.getElementById('canFlip').checked,
            canMove: document.getElementById('canMove').checked,
            canAttack: document.getElementById('canAttack').checked,
            canDefend: document.getElementById('canDefend').checked,
            canEscape: document.getElementById('canEscape').checked,
            canCapture: document.getElementById('canCapture').checked
        },
        movement: {
            move: [],
            attack: [],
            special: [],
            type: 'adjacent',
            range: 1,
            rules: {}
        }
    };

    gameData.pieces.push(piece);
    updatePieceGallery();
    updateSelectors();
    saveToLocalStorage();
    
    // Clear form
    document.getElementById('pieceName').value = '';
    document.getElementById('pieceDesc').value = '';
    clearShape();
    
    showNotification('✓ Piece added to collection!', 'success');
}

// ============================================================================
// HEXAGON HELPER FUNCTIONS (for movement & board editors)
// ============================================================================

const hexSize = 25;
const hexHeight = hexSize * 2;
const hexWidth = Math.sqrt(3) * hexSize;

function drawHexagon(ctx, x, y, size, fill, stroke, lineWidth) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        // POINTY-TOPPED hexagons (matching board.HTML clip-path before rotation)
        // After 90° CSS rotation, these will appear FLAT-TOPPED to the user
        const angle = Math.PI / 3 * i - Math.PI / 2;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

function drawHexGrid(ctx, width, height, gridW, gridH) {
    ctx.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Matching board.HTML EXACTLY:
    // - Pointy-topped hexagons (height = 2×size, width = √3×size)
    // - Rows stack vertically with -10% margin overlap
    // - Even ROWS shift RIGHT by hexWidth/2
    const rowSpacing = hexHeight * 0.9;  // -10% overlap
    const colSpacing = hexWidth;  // Full width between hexes in same row

    for (let row = 0; row < gridH; row++) {
        for (let col = 0; col < gridW; col++) {
            // Even ROWS (0, 2, 4...) shift RIGHT
            const xOffset = (row % 2 === 0) ? (hexWidth * 0.5) : 0;
            const x = centerX + (col - gridW/2) * colSpacing + xOffset;
            const y = centerY + (row - gridH/2) * rowSpacing;
            drawHexagon(ctx, x, y, hexSize, '#fff', '#666', 1.5);
        }
    }
}

function pixelToHex(x, y, canvasW, canvasH, gridW, gridH) {
    const centerX = canvasW / 2;
    const centerY = canvasH / 2;
    
    // Matching board.HTML grid
    const rowSpacing = hexHeight * 0.9;
    const colSpacing = hexWidth;

    for (let row = 0; row < gridH; row++) {
        for (let col = 0; col < gridW; col++) {
            const xOffset = (row % 2 === 0) ? (hexWidth * 0.5) : 0;
            const hx = centerX + (col - gridW/2) * colSpacing + xOffset;
            const hy = centerY + (row - gridH/2) * rowSpacing;
            const dist = Math.sqrt((x - hx) ** 2 + (y - hy) ** 2);
            if (dist < hexSize) {
                return {row, col};
            }
        }
    }
    return null;
}

// ============================================================================
// PIECE GALLERY
// ============================================================================

function updatePieceGallery() {
    const gallery = document.getElementById('pieceGallery');
    
    if (gameData.pieces.length === 0) {
        gallery.innerHTML = '<div class="alert alert-info">No pieces created yet. Design your first piece above!</div>';
        return;
    }

    gallery.innerHTML = gameData.pieces.map(p => {
        // Support both new geometric shapes and old pixel art (for backwards compatibility)
        const imageHtml = p.imageUrl 
            ? `<img src="${p.imageUrl}" style="max-width: 100px; max-height: 100px;">`
            : p.svg || '<div style="color: #999;">No preview</div>';
            
        return `
            <div class="piece-card" onclick="selectPieceCard(${p.id})" data-piece-id="${p.id}">
                <button class="delete-btn" onclick="event.stopPropagation(); deletePiece(${p.id})">×</button>
                <h3>${p.name}</h3>
                <p style="font-size: 0.9em; color: #666; margin-bottom: 10px;">${p.description || 'No description'}</p>
                <div class="piece-preview" style="width: 100px; height: 100px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    ${imageHtml}
                </div>
                <div style="font-size: 0.85em; color: #999; margin-top: 10px;">
                    ${p.shape ? `Shape: ${p.shape}` : 'Custom design'} • ${Object.values(p.abilities).filter(Boolean).length} abilities
                </div>
            </div>
        `;
    }).join('');
}

function deletePiece(id) {
    if (confirm('Delete this piece? This action cannot be undone.')) {
        gameData.pieces = gameData.pieces.filter(p => p.id !== id);
        updatePieceGallery();
        updateSelectors();
        saveToLocalStorage();
        showNotification('Piece deleted', 'warning');
    }
}

function selectPieceCard(id) {
    document.querySelectorAll('.piece-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`[data-piece-id="${id}"]`)?.classList.add('selected');
}

function updateSelectors() {
    const selectors = ['movePieceSelector', 'placePieceSelector'];
    selectors.forEach(selId => {
        const sel = document.getElementById(selId);
        if (sel) {
            sel.innerHTML = '<option value="">-- Select piece --</option>' +
                gameData.pieces.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        }
    });
}

// ============================================================================
// STEP 2: MOVEMENT PATTERN DESIGNER
// ============================================================================

function loadPieceForMovement() {
    const id = parseInt(document.getElementById('movePieceSelector').value);
    if (!id) return;
    
    gameData.currentPieceId = id;
    const piece = gameData.pieces.find(p => p.id === id);
    
    if (!piece) return;
    
    currentMovement = {
        move: [...(piece.movement.move || [])],
        attack: [...(piece.movement.attack || [])],
        special: [...(piece.movement.special || [])]
    };
    
    // Load movement settings
    document.getElementById('moveType').value = piece.movement.type || 'adjacent';
    document.getElementById('moveRange').value = piece.movement.range || 1;
    
    // Load checkboxes
    const rules = piece.movement.rules || {};
    document.getElementById('canJump').checked = rules.canJump || false;
    document.getElementById('pathBlocked').checked = rules.pathBlocked || false;
    document.getElementById('mustCapture').checked = rules.mustCapture || false;
    document.getElementById('mustAttack').checked = rules.mustAttack || false;
    document.getElementById('moveAndAttack').checked = rules.moveAndAttack || false;
    document.getElementById('moveAndRotate').checked = rules.moveAndRotate || false;
    document.getElementById('canUseZones').checked = rules.canUseZones || false;
    document.getElementById('noFriendlyAttack').checked = rules.noFriendlyAttack !== false;
    document.getElementById('noSameShapeAttack').checked = rules.noSameShapeAttack || false;
    document.getElementById('specialAbility').value = piece.movement.specialAbility || '';
    
    redrawMoveCanvas();
}

function handleMoveClick(e) {
    if (!gameData.currentPieceId) {
        alert('Please select a shape first!');
        return;
    }
    
    const board = gameData.board || {rows: 7, colsPerRow: [4, 5, 6, 7, 6, 5, 4]};
    const rows = board.rows || 7;
    const colsPerRow = board.colsPerRow || [4, 5, 6, 7, 6, 5, 4];
    const deletedHexes = board.deletedHexes || [];
    
    const rect = moveCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Canvas is 600x600, rotated 90° clockwise via CSS
    // getBoundingClientRect gives us coordinates in the rotated space
    // We need to transform back to canvas space
    // For 90° CW rotation: canvas_x = clickY, canvas_y = canvasSize - clickX
    const canvasSize = 600;
    const x = clickY;
    const y = canvasSize - clickX;
    
    console.log(`Click at screen (${Math.round(clickX)}, ${Math.round(clickY)}) -> canvas (${Math.round(x)}, ${Math.round(y)})`);
    
    // Use custom board dimensions
    const maxCols = Math.max(...colsPerRow);
    const hex = pixelToHex(x, y, 600, 600, rows, maxCols);
    
    if (hex && hex.row >= 0 && hex.row < rows) {
        const cols = colsPerRow[hex.row] || 0;
        if (hex.col >= 0 && hex.col < cols) {
            const hexId = `${hex.row}-${hex.col}`;
            
            // Skip deleted hexes
            if (deletedHexes.includes(hexId)) {
                console.log('Clicked on deleted hex, ignoring');
                return;
            }
            
            console.log(`Hex detected: ${hex.row}-${hex.col}`);
            const tool = gameData.currentTool || 'move'; // Default to 'move' if not set
            
            // Ensure currentMovement has all arrays initialized
            if (!currentMovement.move) currentMovement.move = [];
            if (!currentMovement.attack) currentMovement.attack = [];
            if (!currentMovement.special) currentMovement.special = [];
            
            const arr = currentMovement[tool];
            if (!arr) {
                console.error('Invalid tool:', tool);
                return;
            }
            
            const idx = arr.findIndex(h => h.row === hex.row && h.col === hex.col);
            
            if (idx >= 0) {
                arr.splice(idx, 1);
            } else {
                arr.push(hex);
            }
            
            redrawMoveCanvas();
        }
    }
}

function redrawMoveCanvas() {
    // Use actual custom board from gameData.board instead of static 10x10 grid
    const board = gameData.board || {rows: 7, colsPerRow: [4, 5, 6, 7, 6, 5, 4], zones: {}, deletedHexes: []};
    const rows = board.rows || 7;
    const colsPerRow = board.colsPerRow || [4, 5, 6, 7, 6, 5, 4];
    const zones = board.zones || {};
    const deletedHexes = board.deletedHexes || [];
    
    // Clear canvas
    moveCtx.clearRect(0, 0, 600, 600);
    
    const centerX = 600 / 2;
    const centerY = 600 / 2;
    
    // Matching board.HTML grid
    const rowSpacing = hexHeight * 0.9;
    const colSpacing = hexWidth;
    
    // Calculate offsets to center the board
    const maxCols = Math.max(...colsPerRow);
    
    // Draw coordinate labels on all hexes (rotated -90° for readability)
    moveCtx.fillStyle = '#666';
    moveCtx.font = '10px Arial';
    moveCtx.textAlign = 'center';
    moveCtx.textBaseline = 'middle';
    
    // Draw all hexes with zone colors
    for (let row = 0; row < rows; row++) {
        const cols = colsPerRow[row] || 0;
        for (let col = 0; col < cols; col++) {
            const hexId = `${row}-${col}`;
            
            // Skip deleted hexes
            if (deletedHexes.includes(hexId)) continue;
            
            const xOffset = (row % 2 === 0) ? (hexWidth * 0.5) : 0;
            const x = centerX + (col - maxCols/2) * colSpacing + xOffset;
            const y = centerY + (row - rows/2) * rowSpacing;
            
            // Get zone color for this hex
            let zoneColor = '#f57d2d'; // default middle zone
            if (zones.base && zones.base.includes(hexId)) zoneColor = '#6d3a13';
            else if (zones.inner && zones.inner.includes(hexId)) zoneColor = '#fcc49c';
            else if (zones.outer && zones.outer.includes(hexId)) zoneColor = '#f57d2d';
            else if (zones.dead && zones.dead.includes(hexId)) zoneColor = '#6d3a13';
            
            drawHexagon(moveCtx, x, y, hexSize, zoneColor, '#333', 1);
            
            // Rotate text -90° (counter-clockwise) so it's readable after canvas rotation
            moveCtx.save();
            moveCtx.translate(x, y);
            moveCtx.rotate(-Math.PI / 2);
            moveCtx.fillStyle = '#666';
            moveCtx.fillText(`${row}-${col}`, 0, 0);
            moveCtx.restore();
        }
    }
    
    // Find center hex for piece placement (use middle of board)
    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(colsPerRow[centerRow] / 2);

    // Draw piece in center hex (using proper grid coordinates)
    if (gameData.currentPieceId) {
        const piece = gameData.pieces.find(p => p.id === gameData.currentPieceId);
        if (piece) {
            const xOffset = (centerRow % 2 === 0) ? (hexWidth * 0.5) : 0;
            const x = centerX + (centerCol - maxCols/2) * colSpacing + xOffset;
            const y = centerY + (centerRow - rows/2) * rowSpacing;
            drawHexagon(moveCtx, x, y, hexSize, piece.color, '#333', 2);
            
            moveCtx.fillStyle = '#fff';
            moveCtx.save();
            moveCtx.translate(x, y);
            moveCtx.rotate(-Math.PI / 2);
            moveCtx.font = 'bold 12px Arial';
            moveCtx.fillText('🎯', 0, 0);
            moveCtx.restore();
        }
    }

    // Draw movement patterns with labels
    if (currentMovement.move) {
        currentMovement.move.forEach(hex => {
            const xOffset = (hex.row % 2 === 0) ? (hexWidth * 0.5) : 0;
            const x = centerX + (hex.col - maxCols/2) * colSpacing + xOffset;
            const y = centerY + (hex.row - rows/2) * rowSpacing;
            drawHexagon(moveCtx, x, y, hexSize, '#2ecc71', '#27ae60', 2);
            
            moveCtx.fillStyle = '#fff';
            moveCtx.save();
            moveCtx.translate(x, y);
            moveCtx.rotate(-Math.PI / 2);
            moveCtx.font = 'bold 10px Arial';
            moveCtx.fillText(`${hex.row}-${hex.col}`, 0, 0);
            moveCtx.restore();
        });
    }

    if (currentMovement.attack) {
        currentMovement.attack.forEach(hex => {
            const xOffset = (hex.row % 2 === 0) ? (hexWidth * 0.5) : 0;
            const x = centerX + (hex.col - maxCols/2) * colSpacing + xOffset;
            const y = centerY + (hex.row - rows/2) * rowSpacing;
            drawHexagon(moveCtx, x, y, hexSize, '#e74c3c', '#c0392b', 2);
            
            moveCtx.fillStyle = '#fff';
            moveCtx.save();
            moveCtx.translate(x, y);
            moveCtx.rotate(-Math.PI / 2);
            moveCtx.font = 'bold 10px Arial';
            moveCtx.fillText(`${hex.row}-${hex.col}`, 0, 0);
            moveCtx.restore();
        });
    }

    if (currentMovement.special) {
        currentMovement.special.forEach(hex => {
            const xOffset = (hex.row % 2 === 0) ? (hexWidth * 0.5) : 0;
            const x = centerX + (hex.col - maxCols/2) * colSpacing + xOffset;
            const y = centerY + (hex.row - rows/2) * rowSpacing;
            drawHexagon(moveCtx, x, y, hexSize, '#f39c12', '#e67e22', 2);
            
            moveCtx.fillStyle = '#fff';
            moveCtx.save();
            moveCtx.translate(x, y);
            moveCtx.rotate(-Math.PI / 2);
            moveCtx.font = 'bold 10px Arial';
            moveCtx.fillText(`${hex.row}-${hex.col}`, 0, 0);
            moveCtx.restore();
        });
    }
    
    // Update hardcoded pattern display
    updateHardcodedPatternDisplay();
}

function setMoveTool(tool) {
    gameData.currentTool = tool;
    document.querySelectorAll('[data-tool]').forEach(btn => {
        if (btn.dataset.tool === tool) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function updateHardcodedPatternDisplay() {
    const board = gameData.board || {rows: 7, colsPerRow: [4, 5, 6, 7, 6, 5, 4]};
    const centerRow = Math.floor(board.rows / 2);
    const centerCol = Math.floor(board.colsPerRow[centerRow] / 2);
    
    const moveDisplay = document.getElementById('hardcodedMoveDisplay');
    const attackDisplay = document.getElementById('hardcodedAttackDisplay');
    
    if (!moveDisplay || !attackDisplay) return; // Not on Movement Pattern step
    
    // Calculate relative offsets for movement
    if (currentMovement.move && currentMovement.move.length > 0) {
        const relativeMove = currentMovement.move.map(hex => ({
            rowOffset: hex.row - centerRow,
            colOffset: hex.col - centerCol
        }));
        
        moveDisplay.textContent = JSON.stringify(relativeMove, null, 2);
        moveDisplay.style.color = '#27ae60';
    } else {
        moveDisplay.textContent = '// No movement pattern set\n// Click green hexes on the board';
        moveDisplay.style.color = '#999';
    }
    
    // Calculate relative offsets for attack
    if (currentMovement.attack && currentMovement.attack.length > 0) {
        const relativeAttack = currentMovement.attack.map(hex => ({
            rowOffset: hex.row - centerRow,
            colOffset: hex.col - centerCol
        }));
        
        attackDisplay.textContent = JSON.stringify(relativeAttack, null, 2);
        attackDisplay.style.color = '#c0392b';
    } else {
        attackDisplay.textContent = '// No attack pattern set\n// Switch to Attack tool and click red hexes';
        attackDisplay.style.color = '#999';
    }
}

function clearAllMovement() {
    if (confirm('Clear all movement, attack, and special patterns?')) {
        currentMovement = { move: [], attack: [], special: [] };
        redrawMoveCanvas();
    }
}

function saveMovementPattern() {
    if (!gameData.currentPieceId) {
        alert('Please select a shape!');
        return;
    }
    
    const piece = gameData.pieces.find(p => p.id === gameData.currentPieceId);
    
    // Store both absolute coordinates AND relative offsets (like Romgon hardcoded moves)
    // Relative offsets make highlighting work regardless of piece position
    const board = gameData.board || {rows: 7, colsPerRow: [4, 5, 6, 7, 6, 5, 4]};
    const centerRow = Math.floor(board.rows / 2);
    const centerCol = Math.floor(board.colsPerRow[centerRow] / 2);
    
    // Convert to relative coordinates (offset from center)
    const relativeMove = currentMovement.move.map(hex => ({
        rowOffset: hex.row - centerRow,
        colOffset: hex.col - centerCol,
        row: hex.row,  // Keep absolute for reference
        col: hex.col
    }));
    
    const relativeAttack = currentMovement.attack.map(hex => ({
        rowOffset: hex.row - centerRow,
        colOffset: hex.col - centerCol,
        row: hex.row,
        col: hex.col
    }));
    
    const relativeSpecial = currentMovement.special.map(hex => ({
        rowOffset: hex.row - centerRow,
        colOffset: hex.col - centerCol,
        row: hex.row,
        col: hex.col
    }));
    
    piece.movement = {
        move: [...currentMovement.move],
        attack: [...currentMovement.attack],
        special: [...currentMovement.special],
        // NEW: Hardcoded relative patterns (like original Romgon)
        hardcodedMove: relativeMove,
        hardcodedAttack: relativeAttack,
        hardcodedSpecial: relativeSpecial,
        type: document.getElementById('moveType').value,
        range: parseInt(document.getElementById('moveRange').value),
        rules: {
            canJump: document.getElementById('canJump').checked,
            pathBlocked: document.getElementById('pathBlocked').checked,
            mustCapture: document.getElementById('mustCapture').checked,
            mustAttack: document.getElementById('mustAttack').checked,
            moveAndAttack: document.getElementById('moveAndAttack').checked,
            moveAndRotate: document.getElementById('moveAndRotate').checked,
            canUseZones: document.getElementById('canUseZones').checked,
            noFriendlyAttack: document.getElementById('noFriendlyAttack').checked,
            noSameShapeAttack: document.getElementById('noSameShapeAttack').checked
        },
        specialAbility: document.getElementById('specialAbility').value
    };
    
    saveToLocalStorage();
    console.log('💾 Movement pattern saved with hardcoded offsets:', {
        move: relativeMove,
        attack: relativeAttack
    });
    showNotification(`Movement pattern saved for ${piece.name}! (${relativeMove.length} moves, ${relativeAttack.length} attacks)`, 'success');
}

// ============================================================================
// STEP 3: BOARD DESIGNER
// ============================================================================

function redrawBoard() {
    const width = parseInt(document.getElementById('boardWidth').value) || 7;
    const height = parseInt(document.getElementById('boardHeight').value) || 7;
    
    gameData.board.width = width;
    gameData.board.height = height;
    
    boardCtx.clearRect(0, 0, 700, 600);
    const centerX = 350;
    const centerY = 300;
    
    // Dynamic hex size based on board dimensions
    // Smaller hexes for larger boards to fit everything
    const maxDimension = Math.max(width, height);
    let bHexSize;
    if (maxDimension <= 11) {
        bHexSize = 20;
    } else if (maxDimension <= 15) {
        bHexSize = 16;
    } else if (maxDimension <= 20) {
        bHexSize = 13;
    } else if (maxDimension <= 25) {
        bHexSize = 10;
    } else {
        bHexSize = 8;
    }
    
    // Matching board.HTML grid
    const bHexHeight = bHexSize * 2;
    const bHexWidth = bHexSize * Math.sqrt(3);
    const rowSpacing = bHexHeight * 0.9;
    const colSpacing = bHexWidth;

    // Ensure arrays exist
    if (!gameData.board.deletedHexes) {
        gameData.board.deletedHexes = [];
    }
    if (!gameData.board.zones) {
        gameData.board.zones = {};
    }
    if (!gameData.board.placements) {
        gameData.board.placements = [];
    }
    
    // CLEAN UP: Remove deleted hexes that are out of bounds
    gameData.board.deletedHexes = gameData.board.deletedHexes.filter(hexKey => {
        const [row, col] = hexKey.split('-').map(Number);
        return row >= 0 && row < height && col >= 0 && col < width;
    });
    
    // CLEAN UP: Remove placements that are out of bounds
    gameData.board.placements = gameData.board.placements.filter(placement => {
        const [row, col] = placement.hex.split('-').map(Number);
        return row >= 0 && row < height && col >= 0 && col < width;
    });
    
    // CLEAN UP: Remove zone assignments that are out of bounds
    const validZones = {};
    Object.keys(gameData.board.zones).forEach(hexKey => {
        const [row, col] = hexKey.split('-').map(Number);
        if (row >= 0 && row < height && col >= 0 && col < width) {
            validZones[hexKey] = gameData.board.zones[hexKey];
        }
    });
    gameData.board.zones = validZones;
    
    // Get zone colors
    const zoneColors = {
        base: document.getElementById('baseZoneColor')?.value || '#8b4513',
        inner: document.getElementById('innerZoneColor')?.value || '#6d3a13',
        middle: document.getElementById('middleZoneColor')?.value || '#f57d2d',
        outer: document.getElementById('outerZoneColor')?.value || '#fcc49c',
        dead: document.getElementById('deadZoneColor')?.value || '#333333'
    };

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const hexKey = `${row}-${col}`;
            const isDeleted = gameData.board.deletedHexes.includes(hexKey);
            
            // SKIP DELETED HEXES - don't draw them at all
            if (isDeleted) continue;
            
            const xOffset = (row % 2 === 0) ? (bHexWidth * 0.5) : 0;
            const x = centerX + (col - width/2) * colSpacing + xOffset;
            const y = centerY + (row - height/2) * rowSpacing;
            
            // Check if hex has a zone assigned
            const zone = gameData.board.zones[hexKey];
            const hexColor = zone ? zoneColors[zone] : '#fcc49c';
            
            drawHexagon(boardCtx, x, y, bHexSize, hexColor, '#666', 1);
            
            // Check if there's a piece placement on this hex
            const placement = gameData.board.placements.find(p => p.hex === hexKey);
            if (placement) {
                // Draw piece indicator (circle with player color)
                boardCtx.beginPath();
                boardCtx.arc(x, y, bHexSize * 0.4, 0, Math.PI * 2);
                boardCtx.fillStyle = placement.player === 'white' ? '#ffffff' : '#000000';
                boardCtx.fill();
                boardCtx.strokeStyle = placement.player === 'white' ? '#000000' : '#ffffff';
                boardCtx.lineWidth = 2;
                boardCtx.stroke();
            }
            
            // Draw coordinate labels (rotated -90° for readability, scaled with hex size)
            // Use same format as board.HTML: "row-col"
            boardCtx.fillStyle = '#666';
            const fontSize = Math.max(6, Math.floor(bHexSize * 0.4));
            boardCtx.font = `${fontSize}px Arial`;
            boardCtx.textAlign = 'center';
            boardCtx.textBaseline = 'middle';
            boardCtx.save();
            boardCtx.translate(x, y);
            boardCtx.rotate(-Math.PI / 2);
            // Display as "row-col" to match board.HTML hex IDs (hex-row-col)
            boardCtx.fillText(`${row}-${col}`, 0, 0);
            boardCtx.restore();
        }
    }
    
    saveToLocalStorage();
}

function handleBoardClick(e) {
    const rect = boardCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Canvas is 700x600, rotated 90° clockwise via CSS
    // After rotation it appears as 600x700 to the user
    // For 90° CW rotation: canvas_x = clickY, canvas_y = canvasHeight - clickX
    const x = clickY;
    const y = 600 - clickX;
    
    console.log(`Board click at screen (${Math.round(clickX)}, ${Math.round(clickY)}) -> canvas (${Math.round(x)}, ${Math.round(y)})`);
    
    const width = gameData.board.width;
    const height = gameData.board.height;
    const centerX = 350;
    const centerY = 300;
    
    // Dynamic hex size (same as redrawBoard)
    const maxDimension = Math.max(width, height);
    let bHexSize;
    if (maxDimension <= 11) {
        bHexSize = 20;
    } else if (maxDimension <= 15) {
        bHexSize = 16;
    } else if (maxDimension <= 20) {
        bHexSize = 13;
    } else if (maxDimension <= 25) {
        bHexSize = 10;
    } else {
        bHexSize = 8;
    }
    
    // Matching board.HTML grid
    const bHexHeight = bHexSize * 2;
    const bHexWidth = bHexSize * Math.sqrt(3);
    const rowSpacing = bHexHeight * 0.9;
    const colSpacing = bHexWidth;

    // Find clicked hex
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const xOffset = (row % 2 === 0) ? (bHexWidth * 0.5) : 0;
            const hx = centerX + (col - width/2) * colSpacing + xOffset;
            const hy = centerY + (row - height/2) * rowSpacing;
            const dist = Math.sqrt((x - hx) ** 2 + (y - hy) ** 2);
            
            if (dist < bHexSize) {
                console.log(`Board hex detected: ${row}-${col}`);
                const hexKey = `${row}-${col}`;
                
                if (gameData.currentBoardTool === 'add') {
                    // Add hex (restore deleted hex)
                    const idx = gameData.board.deletedHexes.indexOf(hexKey);
                    if (idx >= 0) {
                        gameData.board.deletedHexes.splice(idx, 1);
                        redrawBoard();
                        showNotification(`Hex ${hexKey} restored`, 'success');
                    } else {
                        showNotification(`Hex ${hexKey} already exists`, 'info');
                    }
                } else if (gameData.currentBoardTool === 'delete') {
                    const idx = gameData.board.deletedHexes.indexOf(hexKey);
                    if (idx >= 0) {
                        showNotification(`Hex ${hexKey} already deleted`, 'info');
                    } else {
                        // Delete the hex (it will disappear completely)
                        gameData.board.deletedHexes.push(hexKey);
                        redrawBoard();
                        showNotification(`Hex ${hexKey} deleted`, 'success');
                    }
                } else if (gameData.currentBoardTool === 'zone') {
                    // Paint zone
                    const selectedZone = document.getElementById('zoneSelector').value;
                    if (!gameData.board.zones) {
                        gameData.board.zones = {};
                    }
                    gameData.board.zones[hexKey] = selectedZone;
                    redrawBoard();
                    showNotification(`Hex ${hexKey} set to ${selectedZone} zone`, 'success');
                } else if (gameData.currentBoardTool === 'place') {
                    // Place shape logic
                    const pieceId = document.getElementById('placePieceSelector').value;
                    const player = document.getElementById('placePlayer').value;
                    
                    if (!pieceId) {
                        alert('Please select a shape to place!');
                        return;
                    }
                    
                    // Ensure placements array exists
                    if (!gameData.board.placements) {
                        gameData.board.placements = [];
                    }
                    
                    gameData.board.placements.push({
                        pieceId: parseInt(pieceId),
                        player: player,
                        hex: hexKey
                    });
                    
                    redrawBoard();
                    showNotification('Shape placed', 'success');
                }
                return;
            }
        }
    }
}

function applyBoardPreset() {
    const preset = document.getElementById('boardPreset').value;
    if (!preset) return;
    
    const presets = {
        '7x7': { width: 7, height: 7, name: 'Classic Romgon' },
        '9x11': { width: 9, height: 11, name: 'Extended Classic' },
        '11x13': { width: 11, height: 13, name: 'Medium' },
        '13x15': { width: 13, height: 15, name: 'Large' },
        '15x17': { width: 15, height: 17, name: 'Extra Large' },
        '17x19': { width: 17, height: 19, name: 'Huge' },
        '20x20': { width: 20, height: 20, name: 'Massive Square' },
        '25x25': { width: 25, height: 25, name: 'Epic' }
    };
    
    const config = presets[preset];
    if (config) {
        document.getElementById('boardWidth').value = config.width;
        document.getElementById('boardHeight').value = config.height;
        redrawBoard();
        showNotification(`Applied ${config.name} board (${config.width}×${config.height})`, 'success');
    }
}

function generateBoardShape() {
    const shape = document.getElementById('boardShape').value;
    const height = gameData.board.height;
    const width = gameData.board.width;
    
    if (!gameData.board.deletedHexes) {
        gameData.board.deletedHexes = [];
    }
    
    // Clear deleted hexes first
    gameData.board.deletedHexes = [];
    
    if (shape === 'rectangle') {
        // Keep all hexes (clear deletions)
        gameData.board.deletedHexes = [];
        showNotification('Rectangle shape - all hexes visible', 'success');
    }
    // 'custom' - do nothing, let user manually add/delete hexes
    
    redrawBoard();
}

function setBoardTool(tool) {
    gameData.currentBoardTool = tool;
    document.querySelectorAll('.tool-bar [data-tool]').forEach(btn => {
        if (btn.dataset.tool === tool) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Show/hide zone selector
    const zoneControls = document.getElementById('zoneControls');
    if (zoneControls) {
        zoneControls.style.display = (tool === 'zone') ? 'block' : 'none';
    }
    
    // Update cursor
    if (tool === 'delete') {
        boardCanvas.style.cursor = 'not-allowed';
    } else if (tool === 'add') {
        boardCanvas.style.cursor = 'crosshair';
    } else if (tool === 'zone') {
        boardCanvas.style.cursor = 'pointer';
    } else if (tool === 'place') {
        boardCanvas.style.cursor = 'copy';
    } else {
        boardCanvas.style.cursor = 'default';
    }
}

function clearBoardPlacements() {
    if (confirm('Clear all piece placements, zones, and deleted hexes? This will reset the board to empty rectangle.')) {
        gameData.board.placements = [];
        gameData.board.deletedHexes = [];
        gameData.board.zones = {};
        redrawBoard();
        showNotification('Board completely reset!', 'success');
    }
}

// ============================================================================
// STEP 4: GAME RULES (handled by form inputs)
// ============================================================================

// ============================================================================
// STEP 5: TEST & PUBLISH
// ============================================================================

function generateGameConfig() {
    // NEW SYSTEM: No SVG generation needed! Just use the shape names and colors
    // For backwards compatibility, still handle old pixel art pieces
    gameData.pieces.forEach(piece => {
        if (piece.shape && piece.color) {
            // New geometric shape system - use direct image reference
            piece.imageUrl = `ASSETS/${piece.shape} ${piece.color} front.png`;
            delete piece.svg; // Remove any old SVG data
            console.log('Using geometric shape:', piece.shape, piece.color);
        } else if (piece.pixelData && Array.isArray(piece.pixelData)) {
            // Old pixel art system - generate SVG for backwards compatibility
            const svgParts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">'];
            
            for (let y = 0; y < piece.pixelData.length && y < 10; y++) {
                for (let x = 0; x < piece.pixelData[y].length && x < 10; x++) {
                    if (piece.pixelData[y][x]) {
                        svgParts.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${piece.color || '#4a90e2'}"/>`);
                    }
                }
            }
            
            svgParts.push('</svg>');
            piece.svg = svgParts.join('');
            console.log('Generated SVG for legacy piece:', piece.name);
        }
    });
    
    const config = {
        metadata: {
            name: document.getElementById('gameName')?.value || 'Untitled Game',
            description: document.getElementById('gameDesc')?.value || '',
            tags: document.getElementById('gameTags')?.value.split(',').map(t => t.trim()).filter(Boolean) || [],
            created: new Date().toISOString(),
            version: '1.0.0',
            creator: 'Anonymous'
        },
        pieces: gameData.pieces,
        board: gameData.board,
        rules: {
            winCondition: document.getElementById('winCondition')?.value || 'eliminate_all',
            maxTurns: parseInt(document.getElementById('maxTurns')?.value) || 0,
            turnTimeLimit: parseInt(document.getElementById('turnTimeLimit')?.value) || 60,
            maxShapes: parseInt(document.getElementById('maxShapes')?.value) || 10,
            maxPerType: parseInt(document.getElementById('maxPerType')?.value) || 3,
            enableDraw: document.getElementById('enableDraw')?.checked || false,
            enableUndo: document.getElementById('enableUndo')?.checked || true,
            showHistory: document.getElementById('showHistory')?.checked || true,
            showPreview: document.getElementById('showPreview')?.checked || true,
            enableChat: document.getElementById('enableChat')?.checked || true,
            allowGuests: document.getElementById('allowGuests')?.checked || false,
            enableDragDrop: document.getElementById('enableDragDrop')?.checked || true,
            enableClickMove: document.getElementById('enableClickMove')?.checked || true,
            customRules: document.getElementById('customRules')?.value || ''
        }
    };

    // Validate
    if (!config.metadata.name) {
        alert('Please enter a game name!');
        return null;
    }

    if (config.pieces.length === 0) {
        alert('Please create at least one piece!');
        return null;
    }

    const preview = document.getElementById('configPreview');
    preview.innerHTML = `
        <div class="alert alert-success">✓ Configuration generated successfully!</div>
        <div class="json-viewer">${JSON.stringify(config, null, 2)}</div>
    `;

    return config;
}

function testGame() {
    const config = generateGameConfig();
    if (!config) return;
    
    // Save to localStorage for testing
    localStorage.setItem('romgon_test_game', JSON.stringify(config));
    
    // Open in new tab
    window.open('index.html?test=true', '_blank');
    showNotification('Opening test game...', 'success');
}

async function publishGame() {
    console.log('🚀 publishGame() called');
    
    let config;
    try {
        config = generateGameConfig();
        console.log('✅ Config generated:', config ? 'success' : 'null');
    } catch (configError) {
        console.error('❌ Error generating config:', configError);
        alert('Error generating game configuration: ' + configError.message);
        return;
    }
    
    if (!config) return;
    
    const visibility = document.getElementById('gameVisibility')?.value || 'public';
    const thumbnail = document.getElementById('gameThumbnail')?.value || '';
    
    if (!document.getElementById('agreeTerms')?.checked) {
        alert('Please agree to the terms to publish your game.');
        return;
    }

    try {
        showNotification('Publishing game...', 'info');
        
        // API Base URL - use Railway backend
        const API_BASE_URL = 'https://api.romgon.net';
        
        // Safely build payload
        const tags = Array.isArray(config.metadata.tags) 
            ? config.metadata.tags.join(',') 
            : (config.metadata.tags || '');
        
        const payload = {
            name: config.metadata.name,
            description: config.metadata.description,
            config: config,
            thumbnail: thumbnail,
            tags: tags,
            is_public: visibility === 'public'
        };
        
        console.log('📤 Sending game data to API:');
        console.log('  - Name:', payload.name);
        console.log('  - Tags:', payload.tags);
        console.log('  - Pieces count:', payload.config.pieces.length);
        console.log('  - Full payload size:', JSON.stringify(payload).length, 'bytes');
        console.log('📤 API endpoint:', `${API_BASE_URL}/api/custom-games/create`);
        
        let response;
        try {
            response = await fetch(`${API_BASE_URL}/api/custom-games/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            console.log('📥 Fetch completed successfully');
        } catch (fetchError) {
            console.error('❌ Fetch failed:', fetchError);
            throw new Error(`Network error: ${fetchError.message}`);
        }

        console.log('📥 API Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Get response text first to see what we got
        const responseText = await response.text();
        console.log('📥 Raw API Response length:', responseText.length);
        console.log('📥 Raw API Response:', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('📥 Parsed API Response:', result);
        } catch (parseError) {
            console.error('❌ Failed to parse response as JSON:', parseError);
            throw new Error(`API returned non-JSON response: ${responseText.substring(0, 200)}`);
        }

        if (result.success) {
            showPublishSuccess(result);
        } else {
            throw new Error(result.error || result.details || 'Failed to create game');
        }

    } catch (error) {
        console.error('❌ Error publishing game:', error);
        console.error('❌ Error stack:', error.stack);
        alert('Failed to publish game: ' + error.message + '\n\nCheck browser console (F12) for details.');
    }
}

function showPublishSuccess(result) {
    const modal = document.getElementById('publishModal');
    const resultDiv = document.getElementById('publishResult');
    
    const gameUrl = `${window.location.origin}/play?game=${result.game_id}`;
    
    resultDiv.innerHTML = `
        <p style="margin: 15px 0;">Your game has been published!</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <strong>Game ID:</strong> ${result.game_id}<br>
            <strong>URL:</strong> <a href="${gameUrl}" target="_blank">${gameUrl}</a>
        </div>
    `;
    
    document.getElementById('playGameBtn').onclick = () => {
        window.location.href = gameUrl;
    };
    
    document.getElementById('shareGameBtn').onclick = () => {
        navigator.clipboard.writeText(gameUrl);
        showNotification('Link copied to clipboard!', 'success');
    };
    
    modal.classList.add('active');
}

function downloadJSON() {
    const config = generateGameConfig();
    if (!config) return;
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.metadata.name.toLowerCase().replace(/\s+/g, '-')}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Configuration downloaded!', 'success');
}

function startNewGame() {
    if (confirm('Start a new game? Current progress will be lost if not saved.')) {
        gameData.pieces = [];
        gameData.board.placements = [];
        gameData.board.deletedHexes = [];
        currentShapeHexes = [];
        
        goToStep(0);
        updatePieceGallery();
        updateSelectors();
        
        // Clear all forms
        document.querySelectorAll('input[type="text"], textarea').forEach(input => input.value = '');
        
        showNotification('Started new game', 'info');
    }
}

// ============================================================================
// WORKFLOW NAVIGATION
// ============================================================================

function goToStep(step) {
    document.querySelectorAll('.step').forEach((s, i) => {
        s.classList.toggle('active', i === step);
        s.classList.toggle('completed', i < step);
    });
    
    document.querySelectorAll('.content').forEach((c, i) => {
        c.classList.toggle('active', i === step);
    });
    
    gameData.currentStep = step;
    document.getElementById('progressFill').style.width = ((step + 1) * 20) + '%';
    
    // Reinit canvases if needed
    if (step === 0 && shapeCanvas) redrawShapeCanvas();
    if (step === 1 && moveCanvas) redrawMoveCanvas();
    if (step === 2 && boardCanvas) redrawBoard();
    
    saveToLocalStorage();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showNotification(message, type = 'info') {
    // Simple notification (you can enhance this)
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // You could create a toast notification here
    const notif = document.createElement('div');
    notif.className = `alert alert-${type}`;
    notif.textContent = message;
    notif.style.position = 'fixed';
    notif.style.top = '20px';
    notif.style.right = '20px';
    notif.style.zIndex = '9999';
    notif.style.minWidth = '250px';
    notif.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

function saveProgress() {
    saveToLocalStorage();
    showNotification('Progress saved!', 'success');
}

function saveToLocalStorage() {
    try {
        // CRITICAL: Never save SVG to localStorage - it gets escaped!
        // Create a deep copy and strip out all SVG fields
        const dataToSave = JSON.parse(JSON.stringify(gameData));
        if (dataToSave.pieces) {
            dataToSave.pieces.forEach(piece => {
                delete piece.svg; // Remove SVG - we'll regenerate from pixelData
            });
        }
        
        localStorage.setItem('romgon_game_creator_data', JSON.stringify(dataToSave));
        console.log('Saved to localStorage (SVG stripped to prevent escaping)');
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('romgon_game_creator_data');
        if (saved) {
            const data = JSON.parse(saved);
            
            // ALWAYS regenerate SVG from pixelData to prevent escaping issues
            if (data.pieces && Array.isArray(data.pieces)) {
                data.pieces.forEach(piece => {
                    if (piece.pixelData && Array.isArray(piece.pixelData)) {
                        // Always regenerate for clean, unescaped SVG
                        piece.svg = regenerateSVGFromPixelData(piece.pixelData, piece.color || '#4a90e2');
                        console.log('Regenerated clean SVG for piece:', piece.name);
                    }
                });
            }
            
            Object.assign(gameData, data);
            updatePieceGallery();
            updateSelectors();
            if (gameData.currentStep) goToStep(gameData.currentStep);
        }
    } catch (e) {
        console.error('Failed to load from localStorage:', e);
    }
}

// Helper function to regenerate SVG from pixel data
function regenerateSVGFromPixelData(pixelData, color) {
    if (!pixelData || !Array.isArray(pixelData)) return '';
    
    const svgParts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">'];
    
    for (let y = 0; y < pixelData.length && y < 10; y++) {
        for (let x = 0; x < pixelData[y].length && x < 10; x++) {
            if (pixelData[y][x]) {
                svgParts.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>`);
            }
        }
    }
    
    svgParts.push('</svg>');
    return svgParts.join('');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// EMERGENCY FIX: Call this from console if SVG is corrupted
// Type: window.fixCorruptedSVG() in browser console
window.fixCorruptedSVG = function() {
    console.log('🔧 Fixing corrupted SVG data...');
    gameData.pieces.forEach(piece => {
        if (piece.pixelData && Array.isArray(piece.pixelData)) {
            const svgParts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">'];
            for (let y = 0; y < piece.pixelData.length && y < 10; y++) {
                for (let x = 0; x < piece.pixelData[y].length && x < 10; x++) {
                    if (piece.pixelData[y][x]) {
                        svgParts.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${piece.color || '#4a90e2'}"/>`);
                    }
                }
            }
            svgParts.push('</svg>');
            piece.svg = svgParts.join('');
            console.log('✅ Fixed SVG for:', piece.name);
        }
    });
    saveToLocalStorage();
    console.log('✅ All SVG data fixed and saved!');
    alert('SVG data fixed! Refresh the page to see changes.');
};

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

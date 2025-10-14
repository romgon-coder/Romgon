// ============================================
// ROMGON POSITION NOTATION (RPN) SYSTEM
// ============================================
// Add this code before the closing </script> tag in your HTML file

// Track move history for game export
let moveHistory = [];
let gameMetadata = {
    white: 'Player 1',
    black: 'Player 2 (AI)',
    date: new Date().toISOString().split('T')[0],
    result: '*'
};

// Helper: Convert piece element to notation character
function pieceToChar(pieceElement) {
    if (!pieceElement) return null;
    
    const isWhite = pieceElement.classList.contains('white-piece') ||
                  pieceElement.classList.contains('white-triangle') ||
                  pieceElement.classList.contains('white-rhombus') ||
                  pieceElement.classList.contains('white-circle') ||
                  pieceElement.classList.contains('white-hexgon');
    
    let char = '';
    
    if (pieceElement.classList.contains('square-piece')) {
        char = isWhite ? 'S' : 's';
    } else if (pieceElement.classList.contains('triangle-piece')) {
        char = isWhite ? 'T' : 't';
    } else if (pieceElement.classList.contains('rhombus-piece')) {
        char = isWhite ? 'R' : 'r';
    } else if (pieceElement.classList.contains('circle-piece')) {
        char = isWhite ? 'C' : 'c';
    } else if (pieceElement.classList.contains('hexgon-piece')) {
        char = isWhite ? 'H' : 'h';
    }
    
    return char;
}

// Helper: Get rotation state for triangle/hexagon
function getPieceRotation(hexId, pieceType) {
    if (pieceType === 'T' || pieceType === 't') {
        return triangleOrientations.get(hexId) || 0;
    } else if (pieceType === 'H' || pieceType === 'h') {
        return hexgonOrientations.get(hexId) || 0;
    }
    return null;
}

// Helper: Convert notation character to piece classes
function charToPiece(char, rotation = 0) {
    const isUpper = char === char.toUpperCase();
    const colorClass = isUpper ? 'white-' : '';
    
    const charUpper = char.toUpperCase();
    let baseClass = '';
    let specificClass = '';
    
    switch(charUpper) {
        case 'S':
            baseClass = 'square-piece';
            specificClass = isUpper ? 'white-piece' : '';
            break;
        case 'T':
            baseClass = 'triangle-piece';
            specificClass = isUpper ? 'white-triangle' : '';
            break;
        case 'R':
            baseClass = 'rhombus-piece';
            specificClass = isUpper ? 'white-rhombus' : '';
            break;
        case 'C':
            baseClass = 'circle-piece';
            specificClass = isUpper ? 'white-circle' : '';
            break;
        case 'H':
            baseClass = 'hexgon-piece';
            specificClass = isUpper ? 'white-hexgon' : '';
            break;
        default:
            return null;
    }
    
    return {
        baseClass,
        specificClass,
        rotation: rotation
    };
}

// Export current board position to RPN format
function exportPositionRPN() {
    const boardRows = [
        [0, 5],   // Row 0: 0-0 to 0-4 (5 hexes)
        [1, 6],   // Row 1: 1-0 to 1-5 (6 hexes)
        [2, 6],   // Row 2: 2-0 to 2-5 (6 hexes)
        [3, 8],   // Row 3: 3-0 to 3-7 (8 hexes)
        [4, 6],   // Row 4: 4-0 to 4-5 (6 hexes)
        [5, 6],   // Row 5: 5-0 to 5-5 (6 hexes)
        [6, 5]    // Row 6: 6-0 to 6-4 (5 hexes)
    ];
    
    let rpnParts = [];
    
    // Build board notation
    for (const [rowNum, hexCount] of boardRows) {
        let rowNotation = '';
        let emptyCount = 0;
        
        for (let col = 0; col < hexCount; col++) {
            const hexId = `hex-${rowNum}-${col}`;
            const hex = document.getElementById(hexId);
            
            if (!hex) {
                emptyCount++;
                continue;
            }
            
            const piece = hex.querySelector('.square-piece, .triangle-piece, .rhombus-piece, .circle-piece, .hexgon-piece');
            
            if (!piece) {
                emptyCount++;
            } else {
                // Add any accumulated empty spaces
                if (emptyCount > 0) {
                    rowNotation += emptyCount;
                    emptyCount = 0;
                }
                
                // Add piece notation
                const char = pieceToChar(piece);
                if (char) {
                    rowNotation += char;
                    
                    // Add rotation for triangles and hexagons
                    if (char === 'T' || char === 't' || char === 'H' || char === 'h') {
                        const rotation = getPieceRotation(hexId, char);
                        if (rotation !== null) {
                            rowNotation += rotation;
                        }
                    }
                }
            }
        }
        
        // Add final empty count if row ends with empty spaces
        if (emptyCount > 0) {
            rowNotation += emptyCount;
        }
        
        // If entire row is empty, use the hex count
        if (rowNotation === '') {
            rowNotation = hexCount.toString();
        }
        
        rpnParts.push(rowNotation);
    }
    
    // Add metadata
    const activePlayer = currentPlayer === 'white' ? 'w' : 'b';
    const moveCount = Math.floor(moveHistory.length / 2);
    
    // Build piece action state (simplified)
    const actionState = '----';
    
    // Combine into full RPN
    const rpn = rpnParts.join('/') + ` ${activePlayer} ${moveCount} ${actionState}`;
    
    return rpn;
}

// Import board position from RPN format
function importPositionRPN(rpnString) {
    try {
        // Parse RPN string
        const parts = rpnString.trim().split(' ');
        if (parts.length < 2) {
            throw new Error('Invalid RPN format: missing components');
        }
        
        const boardNotation = parts[0];
        const activePlayer = parts[1];
        const moveCount = parts[2] ? parseInt(parts[2]) : 0;
        
        // Clear current board
        clearBoard();
        
        // Reset orientations
        triangleOrientations.clear();
        hexgonOrientations.clear();
        
        // Parse rows
        const rows = boardNotation.split('/');
        if (rows.length !== 7) {
            throw new Error('Invalid RPN format: must have 7 rows');
        }
        
        const boardRows = [
            [0, 5],   // Row 0
            [1, 6],   // Row 1
            [2, 6],   // Row 2
            [3, 8],   // Row 3
            [4, 6],   // Row 4
            [5, 6],   // Row 5
            [6, 5]    // Row 6
        ];
        
        // Process each row
        for (let i = 0; i < rows.length; i++) {
            const rowNotation = rows[i];
            const [rowNum, hexCount] = boardRows[i];
            let col = 0;
            let j = 0;
            
            while (j < rowNotation.length && col < hexCount) {
                const char = rowNotation[j];
                
                // Check if it's a number (empty spaces)
                if (!isNaN(char)) {
                    col += parseInt(char);
                    j++;
                } else {
                    // It's a piece
                    const hexId = `hex-${rowNum}-${col}`;
                    const hex = document.getElementById(hexId);
                    
                    if (hex) {
                        // Check for rotation (next character might be a digit)
                        let rotation = 0;
                        if (j + 1 < rowNotation.length && !isNaN(rowNotation[j + 1])) {
                            rotation = parseInt(rowNotation[j + 1]);
                            j++; // Skip rotation digit
                        }
                        
                        // Create piece
                        const pieceData = charToPiece(char, rotation);
                        if (pieceData) {
                            const piece = document.createElement('div');
                            piece.className = pieceData.baseClass;
                            if (pieceData.specificClass) {
                                piece.classList.add(pieceData.specificClass);
                            }
                            piece.draggable = true;
                            
                            hex.appendChild(piece);
                            
                            // Set rotation if applicable
                            if ((char === 'T' || char === 't' || char === 'H' || char === 'h') && rotation > 0) {
                                if (char === 'T' || char === 't') {
                                    setTriangleOrientation(hexId, rotation);
                                    piece.style.transform = `rotate(${rotation * 60}deg)`;
                                } else if (char === 'H' || char === 'h') {
                                    setHexgonOrientation(hexId, rotation);
                                    piece.style.transform = `rotate(${rotation * 60}deg)`;
                                }
                            }
                        }
                    }
                    
                    col++;
                    j++;
                }
            }
        }
        
        // Set game state
        currentPlayer = activePlayer === 'w' ? 'white' : 'black';
        gameOver = false;
        
        // Re-setup drag and drop
        setupDragAndDrop();
        
        // Update display
        updateTurnDisplay();
        highlightThreatenedPieces();
        
        console.log('✅ Position imported successfully from RPN');
        return true;
        
    } catch (error) {
        console.error('❌ Error importing RPN:', error);
        alert('Error importing position: ' + error.message);
        return false;
    }
}

// Validate RPN format
function validateRPN(rpnString) {
    try {
        const parts = rpnString.trim().split(' ');
        if (parts.length < 2) return false;
        
        const boardNotation = parts[0];
        const rows = boardNotation.split('/');
        
        return rows.length === 7;
    } catch {
        return false;
    }
}

// Convert move to RMN (Romgon Move Notation)
function moveToNotation(fromHex, toHex, piece, captured = false, rotated = false, special = '') {
    const pieceChar = pieceToChar(piece);
    if (!pieceChar) return null;
    
    const fromCoord = fromHex.replace('hex-', '');
    const toCoord = toHex.replace('hex-', '');
    
    let notation = `${pieceChar}${fromCoord}>${toCoord}`;
    
    if (captured) notation += 'x';
    if (rotated) notation += '@';
    if (special === 'diagonal') notation += 'd';
    
    return notation;
}

// Record a move in history
function recordMove(fromHex, toHex, piece, captured = false, rotated = false, special = '') {
    const notation = moveToNotation(fromHex, toHex, piece, captured, rotated, special);
    if (notation) {
        moveHistory.push({
            notation: notation,
            player: currentPlayer,
            timestamp: new Date().toISOString()
        });
    }
}

// Export full game in RMN format
function exportGameRMN() {
    let output = '';
    
    // Add metadata
    output += `[White "${gameMetadata.white}"]\n`;
    output += `[Black "${gameMetadata.black}"]\n`;
    output += `[Date "${gameMetadata.date}"]\n`;
    output += `[Result "${gameMetadata.result}"]\n`;
    output += '\n';
    
    // Add moves
    let moveNumber = 1;
    for (let i = 0; i < moveHistory.length; i += 2) {
        const whiteMove = moveHistory[i] ? moveHistory[i].notation : '';
        const blackMove = moveHistory[i + 1] ? moveHistory[i + 1].notation : '';
        
        output += `${moveNumber}. ${whiteMove}`;
        if (blackMove) {
            output += ` ${blackMove}`;
        }
        output += '\n';
        moveNumber++;
    }
    
    // Add result
    output += '\n' + gameMetadata.result;
    
    return output;
}

// Copy position to clipboard
async function copyPositionToClipboard() {
    try {
        const rpn = exportPositionRPN();
        await navigator.clipboard.writeText(rpn);
        
        // Show feedback
        showNotification('✅ Position copied to clipboard!', 'success');
        console.log('📋 RPN copied:', rpn);
    } catch (error) {
        console.error('❌ Error copying to clipboard:', error);
        alert('Error copying position: ' + error.message);
    }
}

// Show notification message
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: ${type === 'success' ? '#4ecdc4' : type === 'error' ? '#ff6b6b' : '#555'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10001;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Open load position modal
function openLoadPositionModal() {
    let modal = document.getElementById('load-position-modal');
    if (!modal) {
        modal = createLoadPositionModal();
    }
    modal.style.display = 'flex';
}

// Create load position modal
function createLoadPositionModal() {
    const modal = document.createElement('div');
    modal.id = 'load-position-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        justify-content: center;
        align-items: center;
    `;
    
    modal.innerHTML = `
        <div style="background: #262421; border: 3px solid #4ecdc4; border-radius: 20px; padding: 40px; max-width: 600px; width: 90%;">
            <h2 style="color: #4ecdc4; text-align: center; margin-bottom: 20px;">📥 Load Position</h2>
            <p style="color: #ccc; margin-bottom: 15px; text-align: center;">Paste RPN (Romgon Position Notation) string:</p>
            
            <textarea id="rpn-input" style="
                width: 100%;
                height: 120px;
                background: #1a1a1a;
                color: #4ecdc4;
                border: 2px solid #4ecdc4;
                border-radius: 8px;
                padding: 10px;
                font-family: 'Courier New', monospace;
                font-size: 0.9em;
                resize: vertical;
                margin-bottom: 20px;
            " placeholder="Example: SSSSS/t0t0t0t0t0t0/6/r2R3/6/T0T0T0T0T0T0/sssss w 0 ----"></textarea>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="loadPositionFromInput()" style="
                    flex: 1;
                    background: #4ecdc4;
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1em;
                ">✅ Load Position</button>
                <button onclick="closeLoadPositionModal()" style="
                    flex: 1;
                    background: #555;
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1em;
                ">❌ Cancel</button>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: rgba(78, 205, 196, 0.1); border-radius: 8px; border-left: 4px solid #4ecdc4;">
                <p style="color: #4ecdc4; margin: 0; font-size: 0.9em; font-weight: 600;">💡 Current Position RPN:</p>
                <code id="current-rpn-display" style="
                    display: block;
                    margin-top: 8px;
                    color: #fff;
                    font-size: 0.85em;
                    word-break: break-all;
                    background: #1a1a1a;
                    padding: 8px;
                    border-radius: 4px;
                ">Loading...</code>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Update current RPN display
    setTimeout(() => {
        const display = document.getElementById('current-rpn-display');
        if (display) {
            display.textContent = exportPositionRPN();
        }
    }, 100);
    
    return modal;
}

// Close load position modal
function closeLoadPositionModal() {
    const modal = document.getElementById('load-position-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Load position from input
function loadPositionFromInput() {
    const input = document.getElementById('rpn-input');
    if (!input) return;
    
    const rpnString = input.value.trim();
    if (!rpnString) {
        alert('Please enter an RPN string');
        return;
    }
    
    if (!validateRPN(rpnString)) {
        alert('Invalid RPN format. Please check the notation.');
        return;
    }
    
    if (importPositionRPN(rpnString)) {
        closeLoadPositionModal();
        showNotification('✅ Position loaded successfully!', 'success');
    }
}

// Download game as .rmn file
function downloadGameRMN() {
    const rmn = exportGameRMN();
    const blob = new Blob([rmn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `romgon_game_${gameMetadata.date}.rmn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('✅ Game exported successfully!', 'success');
}

// Log current position RPN to console
function logPositionRPN() {
    const rpn = exportPositionRPN();
    console.log('📋 Current Position RPN:');
    console.log(rpn);
    console.log('\n🎮 Copy this notation to share or save this position');
}

// ============================================
// END OF RPN SYSTEM
// ============================================

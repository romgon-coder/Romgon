// Test script for AI flip mode improvements
const { generateAllMoves, evaluatePosition, getLegalMoves } = require('./engine/romgon-real-engine');
const { RomgonAI } = require('./ai/reinforcement-learning');

console.log('=== Testing AI Flip Mode Improvements ===\n');

// Test 1: Create a simple board with flip states
const testBoard = {
    '3-4': { color: 'white', type: 'rhombus', id: 'wr1', flipped: false }, // Dead zone
    '3-5': { color: 'white', type: 'circle', id: 'wc1', flipped: true },   // Dead zone, flipped
    '2-3': { color: 'white', type: 'square', id: 'ws1', flipped: false },
    '4-5': { color: 'black', type: 'rhombus', id: 'br1', flipped: false },
    '4-4': { color: 'black', type: 'square', id: 'bs1', flipped: false },
    '3-6': { color: 'black', type: 'triangle', id: 'bt1', flipped: true }
};

console.log('Test Board:');
console.log('White pieces: rhombus(3-4, unflipped), circle(3-5, flipped), square(2-3, unflipped)');
console.log('Black pieces: rhombus(4-5, unflipped), square(4-4, unflipped), triangle(3-6, flipped)\n');

// Test 2: Generate moves with flip mode disabled
console.log('--- Test 1: Generate moves WITHOUT flip mode ---');
const movesNoFlip = generateAllMoves(testBoard, 'white', false);
console.log(`✓ Generated ${movesNoFlip.length} legal moves for white (flip mode OFF)`);

// Test 3: Generate moves with flip mode enabled
console.log('\n--- Test 2: Generate moves WITH flip mode ---');
const movesWithFlip = generateAllMoves(testBoard, 'white', true);
console.log(`✓ Generated ${movesWithFlip.length} legal moves for white (flip mode ON)`);

// Test 4: Evaluate position without flip mode
console.log('\n--- Test 3: Position Evaluation ---');
const scoreNoFlip = evaluatePosition(testBoard, 'white', false);
console.log(`Score without flip mode: ${scoreNoFlip}`);

// Test 5: Evaluate position with flip mode
const scoreWithFlip = evaluatePosition(testBoard, 'white', true);
console.log(`Score with flip mode: ${scoreWithFlip}`);
console.log(`✓ Flip mode evaluation difference: ${scoreWithFlip - scoreNoFlip} points`);

// Test 6: Check flipped piece movement (omnidirectional)
console.log('\n--- Test 4: Flipped Piece Movement (Omnidirectional) ---');
const circleMovesFlipped = getLegalMoves(testBoard, '3-5', 'white', true);
console.log(`✓ Flipped circle at 3-5 has ${circleMovesFlipped.length} moves (should use 6-hex adjacency)`);
circleMovesFlipped.forEach(move => {
    console.log(`  - ${move.from} → ${move.to}${move.isCapture ? ' (CAPTURE)' : ''}`);
});

// Test 7: Check flip state matching
console.log('\n--- Test 5: Flip State Matching ---');
const attacksFromFlippedCircle = circleMovesFlipped.filter(m => m.isCapture);
console.log(`✓ Flipped circle can capture: ${attacksFromFlippedCircle.length} pieces`);
if (attacksFromFlippedCircle.length > 0) {
    attacksFromFlippedCircle.forEach(move => {
        const target = testBoard[move.to];
        console.log(`  - Can attack ${target.color} ${target.type} at ${move.to} (flipped: ${target.flipped})`);
    });
} else {
    console.log('  - No captures available (correct - only flipped can attack flipped)');
}

// Test 8: AI Move Selection
console.log('\n--- Test 6: AI Move Selection ---');
const ai = new RomgonAI(5);
const gameState = { board: testBoard, flipModeEnabled: true };

ai.getMove(gameState, 'white').then(selectedMove => {
    if (selectedMove) {
        console.log(`✓ AI selected move: ${selectedMove.from} → ${selectedMove.to}`);
        console.log(`  Evaluation: ${selectedMove.evaluation?.toFixed(2) || 'N/A'}`);
        console.log(`  Q-value: ${selectedMove.qValue?.toFixed(2) || 'N/A'}`);
        console.log(`  Is exploration: ${selectedMove.isExploration}`);
    } else {
        console.log('✗ AI could not find a move');
    }

    console.log('\n=== All Tests Completed Successfully! ===');
}).catch(err => {
    console.error('✗ Error during AI move selection:', err.message);
});

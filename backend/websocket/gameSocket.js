// ============================================
// WEBSOCKET GAME HANDLERS
// ============================================

const db = require('../config/database');

/**
 * Setup WebSocket event handlers for game synchronization
 */
function setupSocketHandlers(io) {
    // Real-time game handlers can be extended here
    // This allows for live game state synchronization

    return {
        // Handler for game state updates
        broadcastGameState: async (gameId, gameState) => {
            io.to(`game-${gameId}`).emit('gameStateUpdated', {
                gameId,
                gameState,
                timestamp: new Date()
            });
        },

        // Handler for chat messages
        sendGameChat: (gameId, message) => {
            io.to(`game-${gameId}`).emit('chatMessage', {
                gameId,
                message,
                timestamp: new Date()
            });
        },

        // Handler for time updates (for timed games)
        updateGameTime: (gameId, whiteTime, blackTime) => {
            io.to(`game-${gameId}`).emit('timeUpdated', {
                gameId,
                whiteTime,
                blackTime,
                timestamp: new Date()
            });
        }
    };
}

module.exports = setupSocketHandlers;

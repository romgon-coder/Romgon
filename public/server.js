// ROMGON Multiplayer Server
// Node.js + Socket.IO server for real-time multiplayer gameplay

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const path = require('path');

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Game rooms storage
const rooms = new Map();

// Generate unique room code
function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Room structure:
// {
//   code: string,
//   players: {black: socketId, white: socketId},
//   spectators: [socketId],
//   gameState: {...},
//   createdAt: timestamp,
//   lastActivity: timestamp
// }

io.on('connection', (socket) => {
    console.log(`✅ Player connected: ${socket.id}`);

    // Create new game room
    socket.on('create-room', (data) => {
        const roomCode = generateRoomCode();
        const room = {
            code: roomCode,
            players: {
                black: socket.id,
                white: null
            },
            spectators: [],
            gameState: {
                currentPlayer: 'black',
                gameOver: false,
                pieces: data.initialPieces || [],
                moveHistory: [],
                triangleOrientations: {},
                gameMode: data.gameMode || 'full'
            },
            createdAt: Date.now(),
            lastActivity: Date.now(),
            hostColor: 'black' // Host is always black
        };

        rooms.set(roomCode, room);
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.playerColor = 'black';

        console.log(`🎮 Room created: ${roomCode} by ${socket.id}`);
        
        socket.emit('room-created', {
            roomCode: roomCode,
            playerColor: 'black',
            isHost: true
        });
    });

    // Join existing room
    socket.on('join-room', (data) => {
        const roomCode = data.roomCode.toUpperCase();
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('room-error', { message: 'Room not found. Please check the code.' });
            return;
        }

        // Check if room is full
        if (room.players.white) {
            // Room is full, join as spectator
            room.spectators.push(socket.id);
            socket.join(roomCode);
            socket.roomCode = roomCode;
            socket.playerColor = 'spectator';
            
            socket.emit('joined-as-spectator', {
                roomCode: roomCode,
                gameState: room.gameState
            });
            
            io.to(roomCode).emit('spectator-joined', {
                spectatorId: socket.id,
                spectatorCount: room.spectators.length
            });
            
            console.log(`👁️ Spectator ${socket.id} joined room ${roomCode}`);
            return;
        }

        // Join as white player
        room.players.white = socket.id;
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.playerColor = 'white';
        room.lastActivity = Date.now();

        console.log(`🎮 Player ${socket.id} joined room ${roomCode} as WHITE`);

        // Notify both players that game is starting
        io.to(room.players.black).emit('opponent-joined', {
            playerColor: 'black',
            opponentId: socket.id
        });

        socket.emit('room-joined', {
            roomCode: roomCode,
            playerColor: 'white',
            opponentId: room.players.black,
            gameState: room.gameState
        });

        // Start the game
        io.to(roomCode).emit('game-start', {
            black: room.players.black,
            white: room.players.white,
            currentPlayer: 'black'
        });
    });

    // Player makes a move
    socket.on('make-move', (data) => {
        const roomCode = socket.roomCode;
        const room = rooms.get(roomCode);

        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        // Validate it's the player's turn
        const playerColor = socket.playerColor;
        if (room.gameState.currentPlayer !== playerColor) {
            socket.emit('error', { message: 'Not your turn!' });
            return;
        }

        // Update game state
        room.gameState = {
            ...room.gameState,
            ...data.gameState
        };
        room.lastActivity = Date.now();

        // Broadcast move to all players in room
        io.to(roomCode).emit('move-made', {
            move: data.move,
            gameState: room.gameState,
            playerColor: playerColor
        });

        console.log(`🎯 Move made in room ${roomCode} by ${playerColor}`);
    });

    // Player ends turn
    socket.on('end-turn', (data) => {
        const roomCode = socket.roomCode;
        const room = rooms.get(roomCode);

        if (!room) return;

        // Switch current player
        room.gameState.currentPlayer = room.gameState.currentPlayer === 'black' ? 'white' : 'black';
        room.gameState = {
            ...room.gameState,
            ...data.gameState
        };
        room.lastActivity = Date.now();

        // Notify all players
        io.to(roomCode).emit('turn-ended', {
            currentPlayer: room.gameState.currentPlayer,
            gameState: room.gameState
        });

        console.log(`🔄 Turn ended in room ${roomCode}, now: ${room.gameState.currentPlayer}`);
    });

    // Game over
    socket.on('game-over', (data) => {
        const roomCode = socket.roomCode;
        const room = rooms.get(roomCode);

        if (!room) return;

        room.gameState.gameOver = true;
        room.gameState.winner = data.winner;
        room.gameState.reason = data.reason;
        room.lastActivity = Date.now();

        io.to(roomCode).emit('game-ended', {
            winner: data.winner,
            reason: data.reason,
            gameState: room.gameState
        });

        console.log(`🏆 Game over in room ${roomCode}: ${data.winner} wins (${data.reason})`);
    });

    // Chat message
    socket.on('chat-message', (data) => {
        const roomCode = socket.roomCode;
        if (!roomCode) return;

        io.to(roomCode).emit('chat-message', {
            playerId: socket.id,
            playerColor: socket.playerColor,
            message: data.message,
            timestamp: Date.now()
        });
    });

    // Request rematch
    socket.on('request-rematch', () => {
        const roomCode = socket.roomCode;
        const room = rooms.get(roomCode);
        
        if (!room) return;

        io.to(roomCode).emit('rematch-requested', {
            playerId: socket.id,
            playerColor: socket.playerColor
        });
    });

    // Accept rematch
    socket.on('accept-rematch', (data) => {
        const roomCode = socket.roomCode;
        const room = rooms.get(roomCode);
        
        if (!room) return;

        // Reset game state
        room.gameState = {
            currentPlayer: 'black',
            gameOver: false,
            pieces: data.initialPieces || [],
            moveHistory: [],
            triangleOrientations: {},
            gameMode: room.gameState.gameMode
        };
        room.lastActivity = Date.now();

        io.to(roomCode).emit('game-reset', {
            gameState: room.gameState
        });

        console.log(`🔄 Rematch started in room ${roomCode}`);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
        console.log(`❌ Player disconnected: ${socket.id}`);

        const roomCode = socket.roomCode;
        if (!roomCode) return;

        const room = rooms.get(roomCode);
        if (!room) return;

        // Check if disconnected player was a player or spectator
        if (room.players.black === socket.id || room.players.white === socket.id) {
            const disconnectedColor = room.players.black === socket.id ? 'black' : 'white';
            
            // Notify opponent
            io.to(roomCode).emit('opponent-disconnected', {
                disconnectedColor: disconnectedColor,
                message: `${disconnectedColor.toUpperCase()} player disconnected`
            });

            console.log(`⚠️ ${disconnectedColor} player disconnected from room ${roomCode}`);

            // Optional: Keep room alive for 5 minutes for reconnection
            setTimeout(() => {
                const currentRoom = rooms.get(roomCode);
                if (currentRoom && (currentRoom.players.black === socket.id || currentRoom.players.white === socket.id)) {
                    // Player didn't reconnect, close room
                    rooms.delete(roomCode);
                    io.to(roomCode).emit('room-closed', {
                        reason: 'Player abandoned game'
                    });
                    console.log(`🗑️ Room ${roomCode} closed due to player disconnect`);
                }
            }, 5 * 60 * 1000); // 5 minutes
        } else if (room.spectators.includes(socket.id)) {
            // Remove spectator
            room.spectators = room.spectators.filter(id => id !== socket.id);
            io.to(roomCode).emit('spectator-left', {
                spectatorCount: room.spectators.length
            });
        }
    });

    // Heartbeat for connection monitoring
    socket.on('heartbeat', () => {
        socket.emit('heartbeat-ack');
    });
});

// Cleanup old rooms (older than 24 hours)
setInterval(() => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    rooms.forEach((room, code) => {
        if (now - room.lastActivity > maxAge) {
            rooms.delete(code);
            console.log(`🗑️ Cleaned up old room: ${code}`);
        }
    });
}, 60 * 60 * 1000); // Run every hour

// Start server
http.listen(PORT, () => {
    console.log(`
    🎮 ROMGON Multiplayer Server Running!
    
    Server: http://localhost:${PORT}
    Socket.IO: Ready for connections
    
    📊 Stats: ${rooms.size} active rooms
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    http.close(() => {
        console.log('HTTP server closed');
    });
});




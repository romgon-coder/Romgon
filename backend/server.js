// ============================================
// ROMGON BACKEND - Express.js Server
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database
const { db, dbPromise } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/games');
const ratingRoutes = require('./routes/ratings');
const statsRoutes = require('./routes/stats');
const { router: customGamesRoutes, initCustomGames } = require('./routes/custom-games');
const engineAnalysisRoutes = require('./routes/engine-analysis');

// Import WebSocket handlers
const setupSocketHandlers = require('./websocket/gameSocket');
const setupChatHandlers = require('./websocket/chatSocket');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// ============================================
// MIDDLEWARE
// ============================================

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// API ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Database diagnostic endpoint
app.get('/api/debug/database', async (req, res) => {
    try {
        // Test database connection
        const testQuery = await dbPromise.all('SELECT name FROM sqlite_master WHERE type="table"');
        
        res.json({
            status: 'OK',
            database: 'connected',
            tables: testQuery.map(t => t.name),
            customGamesInitialized: !!require('./routes/custom-games').customGameModel,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            error: error.message,
            stack: error.stack
        });
    }
});

// Authentication routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Game routes
app.use('/api/games', gameRoutes);

// Rating routes
app.use('/api/ratings', ratingRoutes);

// Statistics routes
app.use('/api/stats', statsRoutes);

// Custom Games routes (Game Creator Platform)
app.use('/api/custom-games', customGamesRoutes);

// Engine Analysis routes
app.use('/api/engine', engineAnalysisRoutes);

// Initialize custom games with database
initCustomGames(dbPromise);
console.log('✅ Custom games routes initialized with database');

// ============================================
// WEBSOCKET SETUP
// ============================================

// Setup WebSocket event handlers
setupSocketHandlers(io);
setupChatHandlers(io); // Chat namespace

// Store active connections
const activeUsers = new Map();
const activeGames = new Map();

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join user tracking
    socket.on('userConnected', (userId) => {
        activeUsers.set(userId, socket.id);
        console.log(`👤 User ${userId} connected (Socket: ${socket.id})`);
        
        // Broadcast online status
        io.emit('userStatusChanged', {
            userId,
            status: 'online',
            timestamp: new Date()
        });
    });

    // Game join
    socket.on('joinGame', (data) => {
        const { gameId, userId } = data;
        socket.join(`game-${gameId}`);
        
        if (!activeGames.has(gameId)) {
            activeGames.set(gameId, []);
        }
        activeGames.get(gameId).push(userId);
        
        console.log(`🎮 User ${userId} joined game ${gameId}`);
        
        io.to(`game-${gameId}`).emit('playerJoined', {
            gameId,
            userId,
            players: activeGames.get(gameId),
            timestamp: new Date()
        });
    });

    // Game move
    socket.on('gameMove', (data) => {
        const { gameId, userId, move } = data;
        
        console.log(`🎯 Move in game ${gameId} by ${userId}:`, move);
        
        // Broadcast move to all players in game
        io.to(`game-${gameId}`).emit('moveMade', {
            gameId,
            userId,
            move,
            timestamp: new Date()
        });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        
        // Find user and remove from activeUsers
        for (const [userId, socketId] of activeUsers.entries()) {
            if (socketId === socket.id) {
                activeUsers.delete(userId);
                
                io.emit('userStatusChanged', {
                    userId,
                    status: 'offline',
                    timestamp: new Date()
                });
                
                console.log(`👤 User ${userId} offline`);
                break;
            }
        }
        
        // Remove from active games
        for (const [gameId, players] of activeGames.entries()) {
            const index = players.findIndex(p => {
                const userSocketId = activeUsers.get(p);
                return userSocketId === socket.id;
            });
            
            if (index !== -1) {
                players.splice(index, 1);
                io.to(`game-${gameId}`).emit('playerLeft', {
                    gameId,
                    remainingPlayers: players,
                    timestamp: new Date()
                });
            }
        }
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    
    res.status(status).json({
        error: message,
        status,
        timestamp: new Date().toISOString()
    });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🎮 ROMGON Backend Server             ║
║   Version 1.0.0                        ║
╚════════════════════════════════════════╝

📡 Server running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📍 Health check: http://localhost:${PORT}/api/health

✅ Server ready to accept connections!
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = { app, io, server };

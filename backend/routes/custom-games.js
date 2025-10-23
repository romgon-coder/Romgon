// Custom Games API Routes
// Handles all endpoints for game creation, listing, loading, etc.

const express = require('express');
const router = express.Router();
const CustomGame = require('../models/CustomGame');

// Initialize custom game model with database
let customGameModel;

function initCustomGames(db) {
    customGameModel = new CustomGame(db);
    customGameModel.initTable().catch(console.error);
}

// Middleware to check authentication (optional)
function optionalAuth(req, res, next) {
    // Get user from session if available
    req.user_id = req.session?.user?.id || null;
    req.username = req.session?.user?.username || null;
    next();
}

// CREATE: Save new custom game
router.post('/create', optionalAuth, async (req, res) => {
    try {
        const { name, description, config, thumbnail, tags, is_public } = req.body;

        if (!name || !config) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'config']
            });
        }

        // Generate unique game ID
        const game_id = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const gameData = {
            game_id,
            name,
            description,
            creator_id: req.user_id,
            creator_name: req.username || 'Anonymous',
            config,
            thumbnail,
            tags,
            is_public
        };

        const result = await customGameModel.createGame(gameData);

        res.json({
            success: true,
            game_id: result.game_id,
            message: 'Game created successfully',
            url: `/play?game=${result.game_id}`
        });

    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({
            error: 'Failed to create game',
            details: error.message
        });
    }
});

// READ: Get single game by ID
router.get('/game/:game_id', async (req, res) => {
    try {
        const { game_id } = req.params;
        const game = await customGameModel.getGame(game_id);

        if (!game) {
            return res.status(404).json({
                error: 'Game not found'
            });
        }

        res.json({
            success: true,
            game
        });

    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({
            error: 'Failed to fetch game',
            details: error.message
        });
    }
});

// READ: List games with filters
router.get('/list', async (req, res) => {
    try {
        const options = {
            limit: parseInt(req.query.limit) || 20,
            offset: parseInt(req.query.offset) || 0,
            sort: req.query.sort || 'created_at',
            order: req.query.order || 'DESC',
            search: req.query.search || '',
            creator_id: req.query.creator_id || null,
            featured: req.query.featured === 'true',
            tags: req.query.tags || null
        };

        const result = await customGameModel.listGames(options);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Error listing games:', error);
        res.status(500).json({
            error: 'Failed to list games',
            details: error.message
        });
    }
});

// READ: Get featured games
router.get('/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const games = await customGameModel.getFeaturedGames(limit);

        res.json({
            success: true,
            games
        });

    } catch (error) {
        console.error('Error fetching featured games:', error);
        res.status(500).json({
            error: 'Failed to fetch featured games',
            details: error.message
        });
    }
});

// READ: Get popular games
router.get('/popular', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const games = await customGameModel.getPopularGames(limit);

        res.json({
            success: true,
            games
        });

    } catch (error) {
        console.error('Error fetching popular games:', error);
        res.status(500).json({
            error: 'Failed to fetch popular games',
            details: error.message
        });
    }
});

// READ: Get user's games
router.get('/my-games', optionalAuth, async (req, res) => {
    try {
        if (!req.user_id) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        const games = await customGameModel.getUserGames(req.user_id);

        res.json({
            success: true,
            games
        });

    } catch (error) {
        console.error('Error fetching user games:', error);
        res.status(500).json({
            error: 'Failed to fetch user games',
            details: error.message
        });
    }
});

// UPDATE: Modify existing game
router.put('/game/:game_id', optionalAuth, async (req, res) => {
    try {
        const { game_id } = req.params;
        const updates = req.body;

        // Only allow creator to update (unless admin)
        await customGameModel.updateGame(game_id, updates, req.user_id);

        res.json({
            success: true,
            message: 'Game updated successfully'
        });

    } catch (error) {
        console.error('Error updating game:', error);
        res.status(500).json({
            error: 'Failed to update game',
            details: error.message
        });
    }
});

// DELETE: Remove game
router.delete('/game/:game_id', optionalAuth, async (req, res) => {
    try {
        const { game_id } = req.params;

        if (!req.user_id) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        await customGameModel.deleteGame(game_id, req.user_id);

        res.json({
            success: true,
            message: 'Game deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).json({
            error: 'Failed to delete game',
            details: error.message
        });
    }
});

// POST: Increment play count
router.post('/game/:game_id/play', async (req, res) => {
    try {
        const { game_id } = req.params;
        await customGameModel.incrementPlays(game_id);

        res.json({
            success: true,
            message: 'Play count updated'
        });

    } catch (error) {
        console.error('Error updating play count:', error);
        res.status(500).json({
            error: 'Failed to update play count'
        });
    }
});

// POST: Rate game
router.post('/game/:game_id/rate', optionalAuth, async (req, res) => {
    try {
        const { game_id } = req.params;
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                error: 'Invalid rating',
                message: 'Rating must be between 1 and 5'
            });
        }

        if (!req.user_id) {
            return res.status(401).json({
                error: 'Authentication required'
            });
        }

        await customGameModel.rateGame(game_id, req.user_id, rating);

        res.json({
            success: true,
            message: 'Rating submitted'
        });

    } catch (error) {
        console.error('Error rating game:', error);
        res.status(500).json({
            error: 'Failed to submit rating'
        });
    }
});

// POST: Toggle favorite
router.post('/game/:game_id/favorite', optionalAuth, async (req, res) => {
    try {
        const { game_id } = req.params;
        const { action } = req.body; // 'add' or 'remove'

        await customGameModel.toggleFavorite(game_id, action === 'add');

        res.json({
            success: true,
            message: action === 'add' ? 'Added to favorites' : 'Removed from favorites'
        });

    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({
            error: 'Failed to toggle favorite'
        });
    }
});

// Export router and init function
module.exports = {
    router,
    initCustomGames
};

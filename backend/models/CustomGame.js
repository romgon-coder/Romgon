// Custom Game Model
// Handles database operations for user-created games

class CustomGame {
    constructor(db) {
        this.db = db;
    }

    // Create custom_games table if it doesn't exist
    async initTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS custom_games (
                id INT PRIMARY KEY AUTO_INCREMENT,
                game_id VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                creator_id INT,
                creator_name VARCHAR(100),
                config JSON NOT NULL,
                thumbnail TEXT,
                plays INT DEFAULT 0,
                rating DECIMAL(3,2) DEFAULT 0.00,
                ratings_count INT DEFAULT 0,
                favorites INT DEFAULT 0,
                is_public BOOLEAN DEFAULT TRUE,
                is_featured BOOLEAN DEFAULT FALSE,
                tags VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_game_id (game_id),
                INDEX idx_creator (creator_id),
                INDEX idx_public (is_public),
                INDEX idx_featured (is_featured),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        await this.db.query(query);
        console.log('✓ Custom games table initialized');
    }

    // Save a new custom game
    async createGame(gameData) {
        const {
            game_id,
            name,
            description,
            creator_id,
            creator_name,
            config,
            thumbnail,
            tags,
            is_public
        } = gameData;

        const query = `
            INSERT INTO custom_games 
            (game_id, name, description, creator_id, creator_name, config, thumbnail, tags, is_public)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await this.db.query(query, [
            game_id,
            name,
            description || '',
            creator_id || null,
            creator_name || 'Anonymous',
            JSON.stringify(config),
            thumbnail || '',
            tags || '',
            is_public !== false
        ]);

        return {
            id: result.insertId,
            game_id,
            message: 'Game created successfully'
        };
    }

    // Update existing game
    async updateGame(game_id, updates, creator_id = null) {
        const allowedFields = ['name', 'description', 'config', 'thumbnail', 'tags', 'is_public'];
        const setClauses = [];
        const values = [];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                setClauses.push(`${key} = ?`);
                values.push(key === 'config' ? JSON.stringify(updates[key]) : updates[key]);
            }
        });

        if (setClauses.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(game_id);
        
        let query = `UPDATE custom_games SET ${setClauses.join(', ')} WHERE game_id = ?`;
        
        // If creator_id provided, ensure only creator can update
        if (creator_id) {
            query += ` AND creator_id = ?`;
            values.push(creator_id);
        }

        const result = await this.db.query(query, values);
        
        if (result.affectedRows === 0) {
            throw new Error('Game not found or permission denied');
        }

        return { success: true, message: 'Game updated successfully' };
    }

    // Get game by ID
    async getGame(game_id) {
        const query = `
            SELECT 
                id, game_id, name, description, creator_id, creator_name,
                config, thumbnail, plays, rating, ratings_count, favorites,
                is_public, is_featured, tags, created_at, updated_at
            FROM custom_games 
            WHERE game_id = ? AND is_public = TRUE
        `;

        const results = await this.db.query(query, [game_id]);
        
        if (results.length === 0) {
            return null;
        }

        const game = results[0];
        
        // Parse JSON config
        if (typeof game.config === 'string') {
            game.config = JSON.parse(game.config);
        }

        return game;
    }

    // List public games with filters
    async listGames(options = {}) {
        const {
            limit = 20,
            offset = 0,
            sort = 'created_at',
            order = 'DESC',
            search = '',
            creator_id = null,
            featured = false,
            tags = null
        } = options;

        let query = `
            SELECT 
                id, game_id, name, description, creator_name,
                thumbnail, plays, rating, ratings_count, favorites,
                is_featured, tags, created_at
            FROM custom_games 
            WHERE is_public = TRUE
        `;

        const params = [];

        if (search) {
            query += ` AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        if (creator_id) {
            query += ` AND creator_id = ?`;
            params.push(creator_id);
        }

        if (featured) {
            query += ` AND is_featured = TRUE`;
        }

        if (tags) {
            query += ` AND tags LIKE ?`;
            params.push(`%${tags}%`);
        }

        // Validate sort column
        const validSorts = ['created_at', 'plays', 'rating', 'favorites', 'name'];
        const sortColumn = validSorts.includes(sort) ? sort : 'created_at';
        const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const games = await this.db.query(query, params);

        // Get total count
        let countQuery = `SELECT COUNT(*) as total FROM custom_games WHERE is_public = TRUE`;
        const countParams = [];

        if (search) {
            countQuery += ` AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)`;
            const searchPattern = `%${search}%`;
            countParams.push(searchPattern, searchPattern, searchPattern);
        }

        if (creator_id) {
            countQuery += ` AND creator_id = ?`;
            countParams.push(creator_id);
        }

        if (featured) {
            countQuery += ` AND is_featured = TRUE`;
        }

        if (tags) {
            countQuery += ` AND tags LIKE ?`;
            countParams.push(`%${tags}%`);
        }

        const countResult = await this.db.query(countQuery, countParams);
        const total = countResult[0].total;

        return {
            games,
            total,
            limit,
            offset,
            hasMore: offset + games.length < total
        };
    }

    // Increment play count
    async incrementPlays(game_id) {
        const query = `UPDATE custom_games SET plays = plays + 1 WHERE game_id = ?`;
        await this.db.query(query, [game_id]);
    }

    // Add/update rating
    async rateGame(game_id, user_id, rating) {
        // First, check if user already rated
        // (You'd need a separate ratings table for this, simplified here)
        
        // Recalculate average rating
        const query = `
            UPDATE custom_games 
            SET 
                rating = ((rating * ratings_count) + ?) / (ratings_count + 1),
                ratings_count = ratings_count + 1
            WHERE game_id = ?
        `;
        
        await this.db.query(query, [rating, game_id]);
    }

    // Toggle favorite
    async toggleFavorite(game_id, increment = true) {
        const query = `
            UPDATE custom_games 
            SET favorites = favorites ${increment ? '+' : '-'} 1
            WHERE game_id = ?
        `;
        
        await this.db.query(query, [game_id]);
    }

    // Delete game (only by creator or admin)
    async deleteGame(game_id, creator_id = null) {
        let query = `DELETE FROM custom_games WHERE game_id = ?`;
        const params = [game_id];

        if (creator_id) {
            query += ` AND creator_id = ?`;
            params.push(creator_id);
        }

        const result = await this.db.query(query, params);
        
        if (result.affectedRows === 0) {
            throw new Error('Game not found or permission denied');
        }

        return { success: true, message: 'Game deleted successfully' };
    }

    // Get user's games
    async getUserGames(creator_id) {
        const query = `
            SELECT 
                id, game_id, name, description, thumbnail,
                plays, rating, ratings_count, favorites,
                is_public, is_featured, created_at, updated_at
            FROM custom_games 
            WHERE creator_id = ?
            ORDER BY created_at DESC
        `;

        return await this.db.query(query, [creator_id]);
    }

    // Get featured games
    async getFeaturedGames(limit = 10) {
        const query = `
            SELECT 
                id, game_id, name, description, creator_name,
                thumbnail, plays, rating, ratings_count, favorites,
                tags, created_at
            FROM custom_games 
            WHERE is_public = TRUE AND is_featured = TRUE
            ORDER BY created_at DESC
            LIMIT ?
        `;

        return await this.db.query(query, [limit]);
    }

    // Get popular games
    async getPopularGames(limit = 10) {
        const query = `
            SELECT 
                id, game_id, name, description, creator_name,
                thumbnail, plays, rating, ratings_count, favorites,
                tags, created_at
            FROM custom_games 
            WHERE is_public = TRUE
            ORDER BY plays DESC, rating DESC
            LIMIT ?
        `;

        return await this.db.query(query, [limit]);
    }
}

module.exports = CustomGame;

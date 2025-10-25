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
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                creator_id INTEGER,
                creator_name TEXT,
                config TEXT NOT NULL,
                thumbnail TEXT,
                plays INTEGER DEFAULT 0,
                rating REAL DEFAULT 0.00,
                ratings_count INTEGER DEFAULT 0,
                favorites INTEGER DEFAULT 0,
                is_public INTEGER DEFAULT 1,
                is_featured INTEGER DEFAULT 0,
                tags TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await this.db.run(query);
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

        const result = await this.db.run(query, [
            game_id,
            name,
            description || '',
            creator_id || null,
            creator_name || 'Anonymous',
            JSON.stringify(config),
            thumbnail || '',
            tags || '',
            is_public !== false ? 1 : 0
        ]);

        return {
            id: result.id,
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

        const result = await this.db.run(query, values);
        
        if (result.affectedRows === 0) {
            throw new Error('Game not found or permission denied');
        }

        return { success: 1, message: 'Game updated successfully' };
    }

    // Get game by ID
    async getGame(game_id) {
        const query = `
            SELECT 
                id, game_id, name, description, creator_id, creator_name,
                config, thumbnail, plays, rating, ratings_count, favorites,
                is_public, is_featured, tags, created_at, updated_at
            FROM custom_games 
            WHERE game_id = ? AND is_public = 1
        `;

        const game = await this.db.get(query, [game_id]);
        
        if (!game) {
            return null;
        }

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
            WHERE is_public = 1
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
            query += ` AND is_featured = 1`;
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

        const games = await this.db.all(query, params);

        // Get total count
        let countQuery = `SELECT COUNT(*) as total FROM custom_games WHERE is_public = 1`;
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
            countQuery += ` AND is_featured = 1`;
        }

        if (tags) {
            countQuery += ` AND tags LIKE ?`;
            countParams.push(`%${tags}%`);
        }

        const countResult = await this.db.get(countQuery, countParams);
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
        await this.db.run(query, [game_id]);
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
        
        await this.db.run(query, [rating, game_id]);
    }

    // Toggle favorite
    async toggleFavorite(game_id, increment = 1) {
        const query = `
            UPDATE custom_games 
            SET favorites = favorites ${increment ? '+' : '-'} 1
            WHERE game_id = ?
        `;
        
        await this.db.run(query, [game_id]);
    }

    // Delete game (only by creator or admin)
    async deleteGame(game_id, creator_id = null) {
        let query = `DELETE FROM custom_games WHERE game_id = ?`;
        const params = [game_id];

        if (creator_id) {
            query += ` AND creator_id = ?`;
            params.push(creator_id);
        }

        const result = await this.db.run(query, params);
        
        if (result.affectedRows === 0) {
            throw new Error('Game not found or permission denied');
        }

        return { success: 1, message: 'Game deleted successfully' };
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

        return await this.db.all(query, [creator_id]);
    }

    // Get featured games
    async getFeaturedGames(limit = 10) {
        const query = `
            SELECT 
                id, game_id, name, description, creator_name,
                thumbnail, plays, rating, ratings_count, favorites,
                tags, created_at
            FROM custom_games 
            WHERE is_public = 1 AND is_featured = 1
            ORDER BY created_at DESC
            LIMIT ?
        `;

        return await this.db.all(query, [limit]);
    }

    // Get popular games
    async getPopularGames(limit = 10) {
        const query = `
            SELECT 
                id, game_id, name, description, creator_name,
                thumbnail, plays, rating, ratings_count, favorites,
                tags, created_at
            FROM custom_games 
            WHERE is_public = 1
            ORDER BY plays DESC, rating DESC
            LIMIT ?
        `;

        return await this.db.all(query, [limit]);
    }
}

module.exports = CustomGame;

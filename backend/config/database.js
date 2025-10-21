// ============================================
// DATABASE INITIALIZATION
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'romgon.db');

// Create or connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err);
    } else {
        console.log('✅ Connected to SQLite database:', dbPath);
        initializeTables();
    }
});

// Initialize all tables
function initializeTables() {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            rating INTEGER DEFAULT 1600,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            total_games INTEGER DEFAULT 0,
            total_moves INTEGER DEFAULT 0,
            total_captures INTEGER DEFAULT 0,
            member_level TEXT DEFAULT 'Bronze',
            is_guest INTEGER DEFAULT 0,
            google_id TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('❌ Error creating users table:', err);
        else console.log('✅ Users table ready');
        
        // Add columns if they don't exist (for existing databases)
        db.run('ALTER TABLE users ADD COLUMN is_guest INTEGER DEFAULT 0', () => {});
        db.run('ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE', () => {});
    });

    // Games table
    db.run(`
        CREATE TABLE IF NOT EXISTS games (
            id TEXT PRIMARY KEY,
            white_player_id INTEGER,
            black_player_id INTEGER,
            winner_id INTEGER,
            winner_color TEXT,
            reason TEXT,
            moves TEXT,
            status TEXT DEFAULT 'active',
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            end_time DATETIME,
            total_moves INTEGER DEFAULT 0,
            FOREIGN KEY (white_player_id) REFERENCES users(id),
            FOREIGN KEY (black_player_id) REFERENCES users(id),
            FOREIGN KEY (winner_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('❌ Error creating games table:', err);
        else console.log('✅ Games table ready');
    });

    // Rating history table
    db.run(`
        CREATE TABLE IF NOT EXISTS rating_changes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            old_rating INTEGER,
            new_rating INTEGER,
            change INTEGER,
            game_id TEXT,
            opponent_id INTEGER,
            opponent_rating INTEGER,
            result TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES users(id),
            FOREIGN KEY (opponent_id) REFERENCES users(id),
            FOREIGN KEY (game_id) REFERENCES games(id)
        )
    `, (err) => {
        if (err) console.error('❌ Error creating rating_changes table:', err);
        else console.log('✅ Rating changes table ready');
    });

    // Friends table
    db.run(`
        CREATE TABLE IF NOT EXISTS friends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            status TEXT DEFAULT 'accepted',
            requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            accepted_at DATETIME,
            UNIQUE(user_id, friend_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (friend_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('❌ Error creating friends table:', err);
        else console.log('✅ Friends table ready');
    });

    // Chat messages table (direct messages)
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            recipient_id INTEGER NOT NULL,
            game_id TEXT,
            content TEXT,
            message_type TEXT DEFAULT 'chat',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id),
            FOREIGN KEY (recipient_id) REFERENCES users(id),
            FOREIGN KEY (game_id) REFERENCES games(id)
        )
    `, (err) => {
        if (err) console.error('❌ Error creating messages table:', err);
        else console.log('✅ Messages table ready');
    });

    // Global chat messages table
    db.run(`
        CREATE TABLE IF NOT EXISTS global_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            display_name TEXT NOT NULL,
            avatar TEXT,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('❌ Error creating global_messages table:', err);
        else console.log('✅ Global messages table ready');
    });

    // Achievements table
    db.run(`
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            achievement_type TEXT,
            title TEXT,
            description TEXT,
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('❌ Error creating achievements table:', err);
        else console.log('✅ Achievements table ready');
    });
}

// Promise-based database wrapper
const dbPromise = {
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    },

    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }
};

module.exports = { db, dbPromise };

// ============================================
// DATABASE INITIALIZATION
// ============================================

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Check if PostgreSQL URL is provided (Railway)
const usePostgres = !!process.env.DATABASE_URL;

let db;
let dbPromise;

if (usePostgres) {
    console.log('🐘 Using PostgreSQL database');
    
    // PostgreSQL connection pool
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test connection
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('❌ PostgreSQL connection error:', err);
        } else {
            console.log('✅ Connected to PostgreSQL database');
            initializeTables();
        }
    });

    // PostgreSQL promise wrapper
    dbPromise = {
        run: async (sql, params = []) => {
            // Convert SQLite syntax to PostgreSQL
            sql = sql.replace(/\?/g, (match, offset) => {
                const index = sql.substring(0, offset).split('?').length;
                return `$${index}`;
            });
            
            const result = await pool.query(sql, params);
            return { 
                id: result.rows[0]?.id, 
                changes: result.rowCount 
            };
        },

        get: async (sql, params = []) => {
            // Convert SQLite syntax to PostgreSQL
            sql = sql.replace(/\?/g, (match, offset) => {
                const index = sql.substring(0, offset).split('?').length;
                return `$${index}`;
            });
            
            const result = await pool.query(sql, params);
            return result.rows[0];
        },

        all: async (sql, params = []) => {
            // Convert SQLite syntax to PostgreSQL
            sql = sql.replace(/\?/g, (match, offset) => {
                const index = sql.substring(0, offset).split('?').length;
                return `$${index}`;
            });
            
            const result = await pool.query(sql, params);
            return result.rows || [];
        }
    };

    db = pool; // For compatibility

} else {
    console.log('📁 Using SQLite database (local development)');
    
    const dbPath = path.join(__dirname, 'romgon.db');

    // Create or connect to database
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Database connection error:', err);
        } else {
            console.log('✅ Connected to SQLite database:', dbPath);
            initializeTables();
        }
    });

    // SQLite promise wrapper
    dbPromise = {
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
}

// Initialize all tables
async function initializeTables() {
    const isPostgres = usePostgres;
    
    // Users table - PostgreSQL compatible syntax
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id ${isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
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
            avatar TEXT DEFAULT '😀',
            avatar_type TEXT DEFAULT 'emoji',
            badge TEXT,
            created_at TIMESTAMP DEFAULT ${isPostgres ? 'CURRENT_TIMESTAMP' : "CURRENT_TIMESTAMP"},
            updated_at TIMESTAMP DEFAULT ${isPostgres ? 'CURRENT_TIMESTAMP' : "CURRENT_TIMESTAMP"}
        )
    `;
    
    try {
        if (isPostgres) {
            await dbPromise.run(createUsersTable.replace(/\?/g, (m, i) => `$${i+1}`));
        } else {
            await new Promise((resolve, reject) => {
                db.run(createUsersTable, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
        console.log('✅ Users table ready');
    } catch (err) {
        console.error('❌ Error creating users table:', err);
    }

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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (white_player_id) REFERENCES users(id),
            FOREIGN KEY (black_player_id) REFERENCES users(id),
            FOREIGN KEY (winner_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('❌ Error creating games table:', err);
        else console.log('✅ Games table ready');
        
        // Add columns if they don't exist (for existing databases)
        db.run('ALTER TABLE games ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP', (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('Warning: Could not add created_at column to games:', err.message);
            }
        });
        
        db.run('ALTER TABLE games ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP', (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('Warning: Could not add updated_at column to games:', err.message);
            }
        });
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

    // API Keys table
    db.run(`
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            api_key TEXT UNIQUE NOT NULL,
            secret_hash TEXT NOT NULL,
            permissions TEXT DEFAULT '["read:games"]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_used_at DATETIME,
            expires_at DATETIME,
            revoked_at DATETIME,
            is_active INTEGER DEFAULT 1,
            usage_count INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('❌ Error creating api_keys table:', err);
        else console.log('✅ API keys table ready');
    });
}

module.exports = { db, dbPromise };

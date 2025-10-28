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
    
    // Helper function to execute SQL that works with both databases
    const executeSql = async (sql) => {
        if (isPostgres) {
            await db.query(sql);
        } else {
            return new Promise((resolve, reject) => {
                db.run(sql, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        }
    };
    
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
        await executeSql(createUsersTable);
        console.log('✅ Users table ready');
    } catch (err) {
        console.error('❌ Error creating users table:', err);
    }

    // Games table
    const createGamesTable = `
        CREATE TABLE IF NOT EXISTS games (
            id TEXT PRIMARY KEY,
            white_player_id INTEGER,
            black_player_id INTEGER,
            winner_id INTEGER,
            winner_color TEXT,
            reason TEXT,
            moves TEXT,
            status TEXT DEFAULT 'active',
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP,
            total_moves INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    try {
        await executeSql(createGamesTable);
        console.log('✅ Games table ready');
    } catch (err) {
        console.error('❌ Error creating games table:', err);
    }

    // TODO: Add remaining tables (rating_changes, friends, messages, etc.)
    // For now, these will be created on-demand or can be added later
    console.log('✅ Core tables initialized');
}

module.exports = { db, dbPromise };

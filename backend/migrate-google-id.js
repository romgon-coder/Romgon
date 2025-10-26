#!/usr/bin/env node

/**
 * Migration: Add google_id column to users table
 * Run this on Railway or production database
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'config', 'romgon.db');

console.log('🔄 Starting migration: Add google_id column');
console.log('📁 Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err);
        process.exit(1);
    }
    console.log('✅ Connected to database');
});

// Add google_id column if it doesn't exist
db.run(`ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE`, (err) => {
    if (err) {
        // Check if column already exists
        if (err.message.includes('duplicate column name')) {
            console.log('✅ Column google_id already exists');
        } else {
            console.error('❌ Error adding google_id column:', err.message);
        }
    } else {
        console.log('✅ Added google_id column to users table');
    }
    
    // Close database
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err);
        } else {
            console.log('✅ Migration complete');
        }
        process.exit(err ? 1 : 0);
    });
});

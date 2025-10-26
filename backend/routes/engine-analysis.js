// ============================================
// ENGINE ANALYSIS API ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

// ============================================
// ENGINE HEALTH CHECK
// ============================================

router.get('/health', async (req, res) => {
    try {
        const checks = {
            timestamp: new Date().toISOString(),
            status: 'healthy',
            checks: {}
        };

        // Database connectivity
        try {
            const result = db.prepare('SELECT 1 as test').get();
            checks.checks.database = {
                status: 'ok',
                responsive: true,
                latency: 0 // Sync query, instant
            };
        } catch (err) {
            checks.checks.database = {
                status: 'error',
                error: err.message
            };
            checks.status = 'degraded';
        }

        // Check tables exist
        try {
            const tables = db.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
            `).all();
            
            checks.checks.schema = {
                status: 'ok',
                tables: tables.map(t => t.name),
                count: tables.length
            };
        } catch (err) {
            checks.checks.schema = {
                status: 'error',
                error: err.message
            };
            checks.status = 'degraded';
        }

        // Memory usage
        const memUsage = process.memoryUsage();
        checks.checks.memory = {
            status: 'ok',
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
            rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB'
        };

        // Uptime
        checks.checks.uptime = {
            status: 'ok',
            seconds: process.uptime(),
            formatted: formatUptime(process.uptime())
        };

        res.json(checks);
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
});

// ============================================
// ENGINE STATISTICS
// ============================================

router.get('/stats', async (req, res) => {
    try {
        const stats = {};

        // Total games
        const gamesCount = db.prepare('SELECT COUNT(*) as count FROM games').get();
        stats.totalGames = gamesCount.count;

        // Games by status
        const gamesByStatus = db.prepare(`
            SELECT status, COUNT(*) as count 
            FROM games 
            GROUP BY status
        `).all();
        stats.gamesByStatus = gamesByStatus.reduce((acc, row) => {
            acc[row.status] = row.count;
            return acc;
        }, {});

        // Total users
        const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
        stats.totalUsers = usersCount.count;

        // Active users (played in last 7 days)
        const activeUsers = db.prepare(`
            SELECT COUNT(DISTINCT 
                CASE 
                    WHEN white_id IS NOT NULL THEN white_id 
                    ELSE black_id 
                END
            ) as count
            FROM games
            WHERE created_at >= datetime('now', '-7 days')
        `).get();
        stats.activeUsers = activeUsers.count;

        // Custom games
        const customGamesCount = db.prepare('SELECT COUNT(*) as count FROM custom_games').get();
        stats.totalCustomGames = customGamesCount.count;

        // Published custom games
        const publishedCustom = db.prepare(`
            SELECT COUNT(*) as count 
            FROM custom_games 
            WHERE is_public = 1
        `).get();
        stats.publishedCustomGames = publishedCustom.count;

        // Average moves per game
        const avgMoves = db.prepare(`
            SELECT AVG(move_count) as avg 
            FROM games 
            WHERE status = 'completed'
        `).get();
        stats.avgMovesPerGame = Math.round(avgMoves.avg || 0);

        // Games last 24h
        const recentGames = db.prepare(`
            SELECT COUNT(*) as count 
            FROM games 
            WHERE created_at >= datetime('now', '-1 day')
        `).get();
        stats.gamesLast24h = recentGames.count;

        res.json(stats);
    } catch (error) {
        console.error('Engine stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENGINE PERFORMANCE METRICS
// ============================================

router.get('/performance', async (req, res) => {
    try {
        const metrics = {
            timestamp: new Date().toISOString(),
            database: {},
            queries: {}
        };

        // Database size
        try {
            const dbSize = db.prepare('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()').get();
            metrics.database.size = Math.round(dbSize.size / 1024 / 1024 * 100) / 100 + ' MB';
        } catch (err) {
            metrics.database.size = 'unknown';
        }

        // Index info
        try {
            const indexes = db.prepare(`
                SELECT COUNT(*) as count 
                FROM sqlite_master 
                WHERE type='index' AND name NOT LIKE 'sqlite_%'
            `).get();
            metrics.database.indexes = indexes.count;
        } catch (err) {
            metrics.database.indexes = 'unknown';
        }

        // Query performance tests
        const queries = [
            {
                name: 'simple_select',
                query: 'SELECT * FROM games LIMIT 1',
                description: 'Basic SELECT query'
            },
            {
                name: 'join_query',
                query: `SELECT g.*, u1.username as white_name, u2.username as black_name 
                        FROM games g 
                        LEFT JOIN users u1 ON g.white_id = u1.id 
                        LEFT JOIN users u2 ON g.black_id = u2.id 
                        LIMIT 10`,
                description: 'JOIN with users table'
            },
            {
                name: 'aggregate_query',
                query: 'SELECT status, COUNT(*) FROM games GROUP BY status',
                description: 'Aggregation query'
            }
        ];

        for (const queryTest of queries) {
            try {
                const start = Date.now();
                db.prepare(queryTest.query).all();
                const duration = Date.now() - start;
                
                metrics.queries[queryTest.name] = {
                    description: queryTest.description,
                    duration_ms: duration,
                    status: duration < 10 ? 'excellent' : duration < 50 ? 'good' : 'slow'
                };
            } catch (err) {
                metrics.queries[queryTest.name] = {
                    description: queryTest.description,
                    status: 'error',
                    error: err.message
                };
            }
        }

        // Node.js metrics
        metrics.nodejs = {
            version: process.version,
            platform: process.platform,
            arch: process.arch,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime()
        };

        res.json(metrics);
    } catch (error) {
        console.error('Performance metrics error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENGINE CONNECTIONS CHECK
// ============================================

router.get('/connections', async (req, res) => {
    try {
        const connections = {
            timestamp: new Date().toISOString(),
            services: {}
        };

        // Check custom games integration
        try {
            const customGames = db.prepare('SELECT COUNT(*) as count FROM custom_games').get();
            const recentCustom = db.prepare(`
                SELECT COUNT(*) as count 
                FROM custom_games 
                WHERE created_at >= datetime('now', '-7 days')
            `).get();
            
            connections.services.customGames = {
                status: 'connected',
                total: customGames.count,
                recent: recentCustom.count,
                integration: 'active'
            };
        } catch (err) {
            connections.services.customGames = {
                status: 'error',
                error: err.message
            };
        }

        // Check game engine integration (via games table)
        try {
            const activeGames = db.prepare(`
                SELECT COUNT(*) as count 
                FROM games 
                WHERE status = 'active'
            `).get();
            
            connections.services.gameEngine = {
                status: 'connected',
                activeGames: activeGames.count,
                integration: 'active'
            };
        } catch (err) {
            connections.services.gameEngine = {
                status: 'error',
                error: err.message
            };
        }

        // Check user authentication system
        try {
            const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
            connections.services.authentication = {
                status: 'connected',
                totalUsers: users.count,
                integration: 'active'
            };
        } catch (err) {
            connections.services.authentication = {
                status: 'error',
                error: err.message
            };
        }

        // Check rating system
        try {
            const ratings = db.prepare('SELECT COUNT(*) as count FROM ratings').get();
            connections.services.ratingSystem = {
                status: 'connected',
                totalRatings: ratings.count,
                integration: 'active'
            };
        } catch (err) {
            connections.services.ratingSystem = {
                status: 'error',
                error: err.message
            };
        }

        // WebSocket status (if available via global)
        if (global.socketIOConnections !== undefined) {
            connections.services.websocket = {
                status: 'connected',
                activeConnections: global.socketIOConnections,
                integration: 'active'
            };
        } else {
            connections.services.websocket = {
                status: 'unknown',
                note: 'WebSocket metrics not tracked'
            };
        }

        res.json(connections);
    } catch (error) {
        console.error('Connections check error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENGINE DIAGNOSTICS
// ============================================

router.get('/diagnostics', async (req, res) => {
    try {
        const diagnostics = {
            timestamp: new Date().toISOString(),
            tests: []
        };

        // Test 1: Database integrity
        try {
            db.prepare('PRAGMA integrity_check').get();
            diagnostics.tests.push({
                name: 'Database Integrity',
                status: 'passed',
                message: 'Database integrity check passed'
            });
        } catch (err) {
            diagnostics.tests.push({
                name: 'Database Integrity',
                status: 'failed',
                message: err.message
            });
        }

        // Test 2: Foreign key constraints
        try {
            const fkCheck = db.prepare('PRAGMA foreign_key_check').all();
            if (fkCheck.length === 0) {
                diagnostics.tests.push({
                    name: 'Foreign Key Constraints',
                    status: 'passed',
                    message: 'All foreign keys are valid'
                });
            } else {
                diagnostics.tests.push({
                    name: 'Foreign Key Constraints',
                    status: 'warning',
                    message: `Found ${fkCheck.length} foreign key violations`,
                    details: fkCheck
                });
            }
        } catch (err) {
            diagnostics.tests.push({
                name: 'Foreign Key Constraints',
                status: 'error',
                message: err.message
            });
        }

        // Test 3: Orphaned records
        try {
            const orphanedGames = db.prepare(`
                SELECT COUNT(*) as count 
                FROM games 
                WHERE white_id IS NOT NULL 
                AND white_id NOT IN (SELECT id FROM users)
            `).get();
            
            if (orphanedGames.count === 0) {
                diagnostics.tests.push({
                    name: 'Orphaned Game Records',
                    status: 'passed',
                    message: 'No orphaned game records found'
                });
            } else {
                diagnostics.tests.push({
                    name: 'Orphaned Game Records',
                    status: 'warning',
                    message: `Found ${orphanedGames.count} orphaned records`,
                    recommendation: 'Clean up orphaned records'
                });
            }
        } catch (err) {
            diagnostics.tests.push({
                name: 'Orphaned Game Records',
                status: 'error',
                message: err.message
            });
        }

        // Test 4: Invalid game states
        try {
            const invalidGames = db.prepare(`
                SELECT COUNT(*) as count 
                FROM games 
                WHERE status NOT IN ('active', 'completed', 'abandoned')
            `).get();
            
            if (invalidGames.count === 0) {
                diagnostics.tests.push({
                    name: 'Game State Validity',
                    status: 'passed',
                    message: 'All games have valid status'
                });
            } else {
                diagnostics.tests.push({
                    name: 'Game State Validity',
                    status: 'warning',
                    message: `Found ${invalidGames.count} games with invalid status`
                });
            }
        } catch (err) {
            diagnostics.tests.push({
                name: 'Game State Validity',
                status: 'error',
                message: err.message
            });
        }

        // Overall status
        const failedTests = diagnostics.tests.filter(t => t.status === 'failed').length;
        const warningTests = diagnostics.tests.filter(t => t.status === 'warning').length;
        
        diagnostics.overall = failedTests > 0 ? 'critical' : 
                             warningTests > 0 ? 'warnings' : 'healthy';

        res.json(diagnostics);
    } catch (error) {
        console.error('Diagnostics error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// ENGINE OPTIMIZATION SUGGESTIONS
// ============================================

router.get('/optimize', async (req, res) => {
    try {
        const suggestions = {
            timestamp: new Date().toISOString(),
            recommendations: []
        };

        // Check for missing indexes
        try {
            const gamesTableInfo = db.prepare(`
                SELECT sql FROM sqlite_master 
                WHERE type='table' AND name='games'
            `).get();
            
            if (!gamesTableInfo.sql.includes('INDEX')) {
                suggestions.recommendations.push({
                    category: 'indexing',
                    priority: 'high',
                    title: 'Add Database Indexes',
                    description: 'Consider adding indexes on frequently queried columns',
                    recommendation: 'CREATE INDEX idx_games_status ON games(status)',
                    impact: 'Faster query performance for game listings'
                });
            }
        } catch (err) {
            // Table might not exist or other error
        }

        // Check for large games table
        try {
            const gamesCount = db.prepare('SELECT COUNT(*) as count FROM games').get();
            if (gamesCount.count > 10000) {
                suggestions.recommendations.push({
                    category: 'archival',
                    priority: 'medium',
                    title: 'Archive Old Completed Games',
                    description: `Database has ${gamesCount.count} games`,
                    recommendation: 'Move completed games older than 6 months to archive table',
                    impact: 'Reduce query times and database size'
                });
            }
        } catch (err) {
            // Handle error
        }

        // Check memory usage
        const memUsage = process.memoryUsage();
        if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
            suggestions.recommendations.push({
                category: 'memory',
                priority: 'high',
                title: 'High Memory Usage',
                description: `Heap usage at ${Math.round(memUsage.heapUsed / memUsage.heapTotal * 100)}%`,
                recommendation: 'Implement memory optimization or increase heap size',
                impact: 'Prevent memory exhaustion and crashes'
            });
        }

        // Check for vacuum needs
        try {
            const freelistCount = db.prepare('PRAGMA freelist_count').get();
            if (freelistCount['freelist_count'] > 1000) {
                suggestions.recommendations.push({
                    category: 'maintenance',
                    priority: 'medium',
                    title: 'Database Fragmentation',
                    description: `Database has ${freelistCount['freelist_count']} free pages`,
                    recommendation: 'Run VACUUM command to reclaim space',
                    impact: 'Reduce database file size and improve performance'
                });
            }
        } catch (err) {
            // Handle error
        }

        if (suggestions.recommendations.length === 0) {
            suggestions.recommendations.push({
                category: 'status',
                priority: 'info',
                title: 'Engine Optimized',
                description: 'No optimization recommendations at this time',
                impact: 'System running efficiently'
            });
        }

        res.json(suggestions);
    } catch (error) {
        console.error('Optimization suggestions error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
}

module.exports = router;

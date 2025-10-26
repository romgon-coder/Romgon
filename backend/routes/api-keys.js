// ============================================
// API KEY MANAGEMENT ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { db, dbPromise } = require('../config/database');
const { authenticateToken } = require('../utils/auth');

// ============================================
// GENERATE API KEY
// ============================================

router.post('/generate', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, permissions, expiresIn } = req.body;

        // Validate input
        if (!name || name.length < 3) {
            return res.status(400).json({ 
                error: 'API key name must be at least 3 characters' 
            });
        }

        // Generate secure API key and secret
        const apiKey = 'rmg_' + crypto.randomBytes(24).toString('hex'); // rmg_...
        const apiSecret = crypto.randomBytes(32).toString('hex');
        
        // Hash the secret for storage (never store plain secrets)
        const secretHash = crypto
            .createHash('sha256')
            .update(apiSecret)
            .digest('hex');

        // Calculate expiration date
        let expiresAt = null;
        if (expiresIn && expiresIn !== 'never') {
            const days = parseInt(expiresIn);
            if (days > 0) {
                expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + days);
            }
        }

        // Parse permissions (default: read-only)
        const permissionsArray = permissions || ['read:games', 'read:moves'];
        const permissionsJson = JSON.stringify(permissionsArray);

        // Insert into database
        const result = await dbPromise.run(`
            INSERT INTO api_keys (
                user_id, 
                name, 
                api_key, 
                secret_hash, 
                permissions,
                expires_at,
                created_at,
                last_used_at,
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), NULL, 1)
        `, [
            userId,
            name,
            apiKey,
            secretHash,
            permissionsJson,
            expiresAt ? expiresAt.toISOString() : null
        ]);

        // Return API key and secret (ONLY TIME secret is shown!)
        res.status(201).json({
            success: true,
            message: 'API key generated successfully',
            apiKey: {
                id: result.id,
                name: name,
                key: apiKey,
                secret: apiSecret, // ⚠️ ONLY shown once!
                permissions: permissionsArray,
                expiresAt: expiresAt,
                createdAt: new Date().toISOString()
            },
            warning: '⚠️ Save your secret now! It will never be shown again.'
        });

    } catch (error) {
        console.error('API key generation error:', error);
        res.status(500).json({ 
            error: 'Failed to generate API key',
            details: error.message 
        });
    }
});

// ============================================
// LIST USER'S API KEYS
// ============================================

router.get('/list', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const keys = await dbPromise.all(`
            SELECT 
                id,
                name,
                api_key,
                permissions,
                created_at,
                last_used_at,
                expires_at,
                is_active,
                usage_count
            FROM api_keys 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [userId]);

        // Parse permissions JSON
        const formattedKeys = keys.map(key => ({
            ...key,
            permissions: JSON.parse(key.permissions || '[]'),
            apiKey: key.api_key,
            api_key: undefined, // Remove from response
            isExpired: key.expires_at ? new Date(key.expires_at) < new Date() : false,
            status: !key.is_active ? 'revoked' : 
                   (key.expires_at && new Date(key.expires_at) < new Date()) ? 'expired' : 
                   'active'
        }));

        res.json({
            success: true,
            keys: formattedKeys,
            total: formattedKeys.length
        });

    } catch (error) {
        console.error('API keys list error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve API keys',
            details: error.message 
        });
    }
});

// ============================================
// REVOKE API KEY
// ============================================

router.delete('/:keyId', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const keyId = req.params.keyId;

        // Verify ownership
        const key = await dbPromise.get(`
            SELECT id FROM api_keys 
            WHERE id = ? AND user_id = ?
        `, [keyId, userId]);

        if (!key) {
            return res.status(404).json({ 
                error: 'API key not found or access denied' 
            });
        }

        // Revoke (soft delete)
        await dbPromise.run(`
            UPDATE api_keys 
            SET is_active = 0, 
                revoked_at = datetime('now')
            WHERE id = ? AND user_id = ?
        `, [keyId, userId]);

        res.json({
            success: true,
            message: 'API key revoked successfully'
        });

    } catch (error) {
        console.error('API key revocation error:', error);
        res.status(500).json({ 
            error: 'Failed to revoke API key',
            details: error.message 
        });
    }
});

// ============================================
// VALIDATE API KEY (for API requests)
// ============================================

router.post('/validate', async (req, res) => {
    try {
        const { apiKey, secret } = req.body;

        if (!apiKey || !secret) {
            return res.status(400).json({ 
                valid: false,
                error: 'API key and secret are required' 
            });
        }

        // Hash the provided secret
        const secretHash = crypto
            .createHash('sha256')
            .update(secret)
            .digest('hex');

        // Look up key
        const keyRecord = await dbPromise.get(`
            SELECT 
                id,
                user_id,
                name,
                permissions,
                expires_at,
                is_active
            FROM api_keys 
            WHERE api_key = ? AND secret_hash = ?
        `, [apiKey, secretHash]);

        if (!keyRecord) {
            return res.status(401).json({ 
                valid: false,
                error: 'Invalid API key or secret' 
            });
        }

        // Check if active
        if (!keyRecord.is_active) {
            return res.status(401).json({ 
                valid: false,
                error: 'API key has been revoked' 
            });
        }

        // Check if expired
        if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
            return res.status(401).json({ 
                valid: false,
                error: 'API key has expired' 
            });
        }

        // Update last used timestamp and increment usage
        await dbPromise.run(`
            UPDATE api_keys 
            SET last_used_at = datetime('now'),
                usage_count = usage_count + 1
            WHERE id = ?
        `, [keyRecord.id]);

        // Return validation success with permissions
        res.json({
            valid: true,
            userId: keyRecord.user_id,
            keyName: keyRecord.name,
            permissions: JSON.parse(keyRecord.permissions || '[]')
        });

    } catch (error) {
        console.error('API key validation error:', error);
        res.status(500).json({ 
            valid: false,
            error: 'Validation failed',
            details: error.message 
        });
    }
});

// ============================================
// UPDATE API KEY PERMISSIONS
// ============================================

router.patch('/:keyId/permissions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const keyId = req.params.keyId;
        const { permissions } = req.body;

        if (!Array.isArray(permissions)) {
            return res.status(400).json({ 
                error: 'Permissions must be an array' 
            });
        }

        // Verify ownership
        const key = await dbPromise.get(`
            SELECT id FROM api_keys 
            WHERE id = ? AND user_id = ?
        `, [keyId, userId]);

        if (!key) {
            return res.status(404).json({ 
                error: 'API key not found or access denied' 
            });
        }

        // Update permissions
        await dbPromise.run(`
            UPDATE api_keys 
            SET permissions = ?
            WHERE id = ? AND user_id = ?
        `, [JSON.stringify(permissions), keyId, userId]);

        res.json({
            success: true,
            message: 'Permissions updated successfully',
            permissions: permissions
        });

    } catch (error) {
        console.error('API key permissions update error:', error);
        res.status(500).json({ 
            error: 'Failed to update permissions',
            details: error.message 
        });
    }
});

// ============================================
// GET API KEY USAGE STATS
// ============================================

router.get('/:keyId/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const keyId = req.params.keyId;

        // Get key with stats
        const key = await dbPromise.get(`
            SELECT 
                id,
                name,
                created_at,
                last_used_at,
                usage_count,
                is_active
            FROM api_keys 
            WHERE id = ? AND user_id = ?
        `, [keyId, userId]);

        if (!key) {
            return res.status(404).json({ 
                error: 'API key not found or access denied' 
            });
        }

        // Calculate days since creation
        const createdDate = new Date(key.created_at);
        const daysSinceCreation = Math.floor((Date.now() - createdDate) / (1000 * 60 * 60 * 24));

        // Calculate average daily usage
        const avgDailyUsage = daysSinceCreation > 0 ? 
            Math.round(key.usage_count / daysSinceCreation) : 
            key.usage_count;

        res.json({
            success: true,
            stats: {
                name: key.name,
                totalRequests: key.usage_count || 0,
                lastUsed: key.last_used_at,
                createdAt: key.created_at,
                daysSinceCreation: daysSinceCreation,
                avgDailyUsage: avgDailyUsage,
                isActive: key.is_active === 1
            }
        });

    } catch (error) {
        console.error('API key stats error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve stats',
            details: error.message 
        });
    }
});

module.exports = router;

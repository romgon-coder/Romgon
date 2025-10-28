// ============================================
// GLOBAL CHAT ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../config/database');
const { authenticateToken } = require('../utils/auth');

// Rate limiting map: userId -> { count, resetTime }
const rateLimitMap = new Map();
const RATE_LIMIT = 5; // messages per window
const RATE_WINDOW = 30000; // 30 seconds

// Basic profanity filter
const PROFANITY_WORDS = [
    'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell', 'cunt', 
    'dick', 'piss', 'cock', 'pussy', 'fag', 'nigger'
];

function containsProfanity(text) {
    const lowerText = text.toLowerCase();
    return PROFANITY_WORDS.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(lowerText);
    });
}

function checkRateLimit(userId) {
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        // Reset window
        rateLimitMap.set(userId, {
            count: 1,
            resetTime: now + RATE_WINDOW
        });
        return true;
    }

    if (userLimit.count >= RATE_LIMIT) {
        return false; // Rate limit exceeded
    }

    userLimit.count++;
    return true;
}

// ============================================
// POST /api/chat/send - Send a global chat message
// ============================================
router.post('/send', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;
        const username = req.user.username;

        // Validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        const trimmedMessage = message.trim();
        if (trimmedMessage.length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        if (trimmedMessage.length > 500) {
            return res.status(400).json({ error: 'Message too long (max 500 characters)' });
        }

        // Rate limiting
        if (!checkRateLimit(userId)) {
            return res.status(429).json({ 
                error: 'Rate limit exceeded. Please wait before sending more messages.',
                retryAfter: Math.ceil((rateLimitMap.get(userId).resetTime - Date.now()) / 1000)
            });
        }

        // Profanity filter
        if (containsProfanity(trimmedMessage)) {
            return res.status(400).json({ 
                error: 'Message contains inappropriate language',
                filtered: true
            });
        }

        // Get user avatar
        const user = await dbPromise.get(
            'SELECT avatar, avatar_type FROM users WHERE id = ?',
            [userId]
        );

        const isPostgres = !!process.env.DATABASE_URL;

        // Store message in database
        const result = await dbPromise.run(
            `INSERT INTO chat_messages (user_id, username, message, avatar, avatar_type, created_at) 
             VALUES (?, ?, ?, ?, ?, ${isPostgres ? 'CURRENT_TIMESTAMP' : "datetime('now')"})`,
            [userId, username, trimmedMessage, user?.avatar || '😀', user?.avatar_type || 'emoji']
        );

        // Get the created message
        const messageData = await dbPromise.get(
            'SELECT * FROM chat_messages WHERE id = ?',
            [result.id]
        );

        res.json({
            success: true,
            message: messageData
        });
    } catch (error) {
        console.error('❌ Error sending chat message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// ============================================
// GET /api/chat/history - Get recent chat history
// ============================================
router.get('/history', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 100, 200);
        
        const isPostgres = !!process.env.DATABASE_URL;
        const orderClause = isPostgres 
            ? 'ORDER BY id DESC LIMIT $1'
            : 'ORDER BY id DESC LIMIT ?';

        const messages = await dbPromise.all(
            `SELECT id, user_id, username, message, avatar, avatar_type, created_at 
             FROM chat_messages 
             ${orderClause}`,
            [limit]
        );

        // Reverse to get chronological order
        messages.reverse();

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('❌ Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// ============================================
// GET /api/chat/stats - Get chat statistics
// ============================================
router.get('/stats', async (req, res) => {
    try {
        const totalMessages = await dbPromise.get(
            'SELECT COUNT(*) as count FROM chat_messages'
        );

        const activeUsers = await dbPromise.get(
            `SELECT COUNT(DISTINCT user_id) as count 
             FROM chat_messages 
             WHERE created_at > datetime('now', '-24 hours')`
        );

        res.json({
            success: true,
            stats: {
                totalMessages: totalMessages?.count || 0,
                activeUsers24h: activeUsers?.count || 0
            }
        });
    } catch (error) {
        console.error('❌ Error fetching chat stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ============================================
// DELETE /api/chat/clear - Clear chat history (admin only)
// ============================================
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        // TODO: Add admin check
        // For now, only allow if user is authenticated
        
        await dbPromise.run('DELETE FROM chat_messages');

        res.json({
            success: true,
            message: 'Chat history cleared'
        });
    } catch (error) {
        console.error('❌ Error clearing chat:', error);
        res.status(500).json({ error: 'Failed to clear chat' });
    }
});

module.exports = router;

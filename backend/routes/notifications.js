// ============================================
// NOTIFICATIONS API ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { dbPromise } = require('../config/database');

// ============================================
// GET /api/notifications - Get user's notifications
// ============================================
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const notifications = await dbPromise.all(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [userId]
        );

        res.json({
            success: true,
            notifications: notifications.map(n => ({
                id: n.id,
                type: n.type,
                title: n.title,
                message: n.message,
                action: n.action_data ? JSON.parse(n.action_data) : null,
                read: Boolean(n.read),
                timestamp: new Date(n.created_at).getTime()
            }))
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// ============================================
// POST /api/notifications - Create notification
// ============================================
router.post('/', async (req, res) => {
    try {
        const { userId, type, title, message, action } = req.body;

        if (!userId || !type || !title || !message) {
            return res.status(400).json({ 
                error: 'userId, type, title, and message are required' 
            });
        }

        const actionData = action ? JSON.stringify(action) : null;

        const result = await dbPromise.run(
            'INSERT INTO notifications (user_id, type, title, message, action_data, read) VALUES (?, ?, ?, ?, ?, 0)',
            [userId, type, title, message, actionData]
        );

        // Emit socket event for real-time notification
        if (global.io) {
            global.io.emit('new-notification', {
                userId,
                notificationId: result.lastID,
                type,
                title,
                message
            });
        }

        res.json({
            success: true,
            notificationId: result.lastID,
            message: 'Notification created'
        });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

// ============================================
// PUT /api/notifications/:id/read - Mark as read
// ============================================
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        await dbPromise.run(
            'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// ============================================
// DELETE /api/notifications - Clear all notifications
// ============================================
router.delete('/', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        await dbPromise.run(
            'DELETE FROM notifications WHERE user_id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'All notifications cleared'
        });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

// ============================================
// GET /api/notifications/unread-count - Get unread count
// ============================================
router.get('/unread-count', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const result = await dbPromise.get(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
            [userId]
        );

        res.json({
            success: true,
            count: result.count || 0
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

module.exports = router;

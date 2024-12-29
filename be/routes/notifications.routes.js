const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all notifications
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = 'SELECT n.*, u.username FROM notifications n JOIN users u ON n.userId = u.id';
        const params = [];

        // Nếu không phải admin, chỉ xem được thông báo của mình
        if (req.user.role !== 'admin') {
            query += ' WHERE n.userId = ?';
            params.push(req.user.id);
        }

        query += ' ORDER BY n.createdAt DESC';

        const [notifications] = await db.execute(query, params);

        res.json({
            success: true,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create notification (Admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { userId, title, content, type = 'info' } = req.body;

        // Chỉ admin mới được tạo thông báo cho user khác
        if (userId && userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to create notifications for other users'
            });
        }

        const targetUserId = userId || req.user.id;

        const [result] = await db.execute(
            'INSERT INTO notifications (userId, title, content, type) VALUES (?, ?, ?, ?)',
            [targetUserId, title, content, type]
        );

        const [notification] = await db.execute(
            'SELECT * FROM notifications WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Mark notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        const notificationId = req.params.id;

        const [notification] = await db.execute(
            'SELECT * FROM notifications WHERE id = ?',
            [notificationId]
        );

        if (!notification.length) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Kiểm tra quyền
        if (req.user.role !== 'admin' && req.user.id !== notification[0].userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await db.execute(
            'UPDATE notifications SET isRead = true WHERE id = ?',
            [notificationId]
        );

        const [updatedNotification] = await db.execute(
            'SELECT * FROM notifications WHERE id = ?',
            [notificationId]
        );

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: updatedNotification[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Mark all notifications as read
router.put('/mark-all-read', verifyToken, async (req, res) => {
    try {
        const [result] = await db.execute(
            'UPDATE notifications SET isRead = true WHERE userId = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get unread count
router.get('/unread-count', verifyToken, async (req, res) => {
    try {
        const [result] = await db.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = false',
            [req.user.id]
        );

        res.json({
            success: true,
            data: {
                unreadCount: result[0].count
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router; 
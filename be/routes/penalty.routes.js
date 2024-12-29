const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all penalties
router.get('/', async (req, res) => {
    try {
        const [penalties] = await db.execute('SELECT * FROM penalties ORDER BY id DESC');
        res.json({
            success: true,
            data: penalties
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create new penalty (Admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin role required'
            });
        }

        const { userId, borrowId, amount, reason } = req.body;

        if (!userId || !amount || !reason) {
            return res.status(400).json({
                success: false,
                message: 'UserId, amount and reason are required'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO penalties (userId, borrowId, amount, reason, status) VALUES (?, ?, ?, ?, "pending")',
            [userId, borrowId || null, amount, reason]
        );

        const [penalty] = await db.execute(
            'SELECT * FROM penalties WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Penalty created successfully',
            data: penalty[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update penalty status
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const penaltyId = req.params.id;
        const { status } = req.body;

        // Kiểm tra penalty tồn tại
        const [penalty] = await db.execute(
            'SELECT * FROM penalties WHERE id = ?',
            [penaltyId]
        );

        if (!penalty.length) {
            return res.status(404).json({
                success: false,
                message: 'Penalty not found'
            });
        }

        // Chỉ admin hoặc user sở hữu penalty mới được cập nhật
        if (req.user.role !== 'admin' && req.user.id !== penalty[0].userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Kiểm tra status hợp lệ
        if (!status || !['pending', 'paid', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required (pending, paid, cancelled)'
            });
        }

        // Cập nhật status
        await db.execute(
            'UPDATE penalties SET status = ? WHERE id = ?',
            [status, penaltyId]
        );

        // Lấy penalty đã cập nhật
        const [updatedPenalty] = await db.execute(
            'SELECT * FROM penalties WHERE id = ?',
            [penaltyId]
        );

        res.json({
            success: true,
            message: 'Penalty updated successfully',
            data: updatedPenalty[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete penalty (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin role required'
            });
        }

        const penaltyId = req.params.id;

        // Kiểm tra penalty tồn tại
        const [penalty] = await db.execute(
            'SELECT * FROM penalties WHERE id = ?',
            [penaltyId]
        );

        if (!penalty.length) {
            return res.status(404).json({
                success: false,
                message: 'Penalty not found'
            });
        }

        // Xóa penalty
        await db.execute('DELETE FROM penalties WHERE id = ?', [penaltyId]);

        res.json({
            success: true,
            message: 'Penalty deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

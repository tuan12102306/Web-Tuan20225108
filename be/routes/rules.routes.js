const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all rules
router.get('/', async (req, res) => {
    try {
        const [rules] = await db.execute('SELECT * FROM rules ORDER BY id DESC');
        res.json({
            success: true,
            data: rules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create new rule (Admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        
        // Kiểm tra role admin trực tiếp thay vì dùng middleware isAdmin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin role required'
            });
        }

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO rules (title, content) VALUES (?, ?)',
            [title, content]
        );

        const [rule] = await db.execute(
            'SELECT * FROM rules WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Rule created successfully',
            data: rule[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// [ADMIN] Update rule
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        const { title, content } = req.body;
        const ruleId = req.params.id;

        await db.execute(
            'UPDATE rules SET title = ?, content = ? WHERE id = ?',
            [title, content, ruleId]
        );

        const [updatedRule] = await db.execute(
            'SELECT * FROM rules WHERE id = ?',
            [ruleId]
        );

        res.json({
            success: true,
            message: 'Rule updated successfully',
            data: updatedRule[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// [ADMIN] Delete rule
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        const ruleId = req.params.id;
        await db.execute('DELETE FROM rules WHERE id = ?', [ruleId]);

        res.json({
            success: true,
            message: 'Rule deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router; 
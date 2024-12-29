const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all returns (Admin: all, User: only their returns)
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `
            SELECT r.*, b.title as bookTitle, u.username,
                   br.borrowDate, br.dueDate
            FROM returns r
            JOIN borrows br ON r.borrowId = br.id
            JOIN books b ON br.bookId = b.id
            JOIN users u ON br.userId = u.id
        `;
        const params = [];

        if (req.user.role !== 'admin') {
            query += ' WHERE br.userId = ?';
            params.push(req.user.id);
        }

        query += ' ORDER BY r.returnDate DESC';
        const [returns] = await db.execute(query, params);

        res.json({
            success: true,
            data: returns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create return record (Admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { borrowId, condition, notes } = req.body;

        // Check if borrow exists and is not returned
        const [borrow] = await db.execute(
            'SELECT * FROM borrows WHERE id = ? AND status = "borrowed"',
            [borrowId]
        );

        if (!borrow.length) {
            return res.status(400).json({
                success: false,
                message: 'Invalid borrow record or already returned'
            });
        }

        // Create return record
        await db.execute(
            'INSERT INTO returns (borrowId, returnDate, condition, notes) VALUES (?, CURRENT_TIMESTAMP, ?, ?)',
            [borrowId, condition, notes]
        );

        // Update borrow status
        await db.execute(
            'UPDATE borrows SET status = "returned" WHERE id = ?',
            [borrowId]
        );

        // Update book quantity
        await db.execute(
            'UPDATE books SET quantity = quantity + 1 WHERE id = ?',
            [borrow[0].bookId]
        );

        res.status(201).json({
            success: true,
            message: 'Book returned successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

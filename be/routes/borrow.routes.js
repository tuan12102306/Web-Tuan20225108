const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all borrows (Admin: all, User: only their borrows)
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `
            SELECT b.*, bk.title as bookTitle, u.username
            FROM borrows b
            JOIN books bk ON b.bookId = bk.id
            JOIN users u ON b.userId = u.id
        `;
        const params = [];

        if (req.user.role !== 'admin') {
            query += ' WHERE b.userId = ?';
            params.push(req.user.id);
        }

        query += ' ORDER BY b.createdAt DESC';
        const [borrows] = await db.execute(query, params);

        res.json({
            success: true,
            data: borrows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create new borrow
router.post('/', verifyToken, async (req, res) => {
    try {
        const { bookId, dueDate } = req.body;
        const userId = req.user.id;

        // Check if book exists and is available
        const [book] = await db.execute(
            'SELECT * FROM books WHERE id = ? AND quantity > 0',
            [bookId]
        );

        if (!book.length) {
            return res.status(400).json({
                success: false,
                message: 'Book not available'
            });
        }

        // Create borrow record
        await db.execute(
            'INSERT INTO borrows (userId, bookId, dueDate, status) VALUES (?, ?, ?, "borrowed")',
            [userId, bookId, dueDate]
        );

        // Update book quantity
        await db.execute(
            'UPDATE books SET quantity = quantity - 1 WHERE id = ?',
            [bookId]
        );

        res.status(201).json({
            success: true,
            message: 'Book borrowed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get borrow by id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [borrow] = await db.execute(`
            SELECT b.*, bk.title as bookTitle, u.username
            FROM borrows b
            JOIN books bk ON b.bookId = bk.id
            JOIN users u ON b.userId = u.id
            WHERE b.id = ?
        `, [req.params.id]);

        if (!borrow.length) {
            return res.status(404).json({
                success: false,
                message: 'Borrow record not found'
            });
        }

        // Check permission
        if (req.user.role !== 'admin' && req.user.id !== borrow[0].userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        res.json({
            success: true,
            data: borrow[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
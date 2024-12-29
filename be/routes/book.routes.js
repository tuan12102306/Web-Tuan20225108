const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all books
router.get('/', async (req, res) => {
    try {
        const [books] = await db.execute('SELECT * FROM books ORDER BY createdAt DESC');
        res.json({
            success: true,
            data: books
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// [ADMIN] Add new book
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        const { title, author, description, quantity } = req.body;
        const [result] = await db.execute(
            'INSERT INTO books (title, author, description, quantity) VALUES (?, ?, ?, ?)',
            [title, author, description, quantity]
        );

        const [newBook] = await db.execute('SELECT * FROM books WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Book added successfully',
            data: newBook[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// [ADMIN] Update book
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        const { title, author, description, quantity } = req.body;
        const bookId = req.params.id;

        await db.execute(
            'UPDATE books SET title = ?, author = ?, description = ?, quantity = ? WHERE id = ?',
            [title, author, description, quantity, bookId]
        );

        const [updatedBook] = await db.execute('SELECT * FROM books WHERE id = ?', [bookId]);

        res.json({
            success: true,
            message: 'Book updated successfully',
            data: updatedBook[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// [ADMIN] Delete book
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        const bookId = req.params.id;
        await db.execute('DELETE FROM books WHERE id = ?', [bookId]);

        res.json({
            success: true,
            message: 'Book deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
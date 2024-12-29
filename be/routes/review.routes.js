const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all reviews
router.get('/', async (req, res) => {
    try {
        const [reviews] = await db.execute(`
            SELECT r.*, u.username, b.title as bookTitle 
            FROM reviews r 
            JOIN users u ON r.userId = u.id 
            JOIN books b ON r.bookId = b.id 
            ORDER BY r.createdAt DESC
        `);
        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get reviews by book ID
router.get('/book/:bookId', async (req, res) => {
    try {
        const [reviews] = await db.execute(`
            SELECT r.*, u.username 
            FROM reviews r 
            JOIN users u ON r.userId = u.id 
            WHERE r.bookId = ? 
            ORDER BY r.createdAt DESC`,
            [req.params.bookId]
        );
        res.json({
            success: true,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create review (Authenticated users only)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { bookId, rating, comment } = req.body;
        const userId = req.user.id;

        if (!bookId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'BookId and rating are required'
            });
        }

        // Check if user has already reviewed this book
        const [existingReview] = await db.execute(
            'SELECT * FROM reviews WHERE userId = ? AND bookId = ?',
            [userId, bookId]
        );

        if (existingReview.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this book'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO reviews (userId, bookId, rating, comment) VALUES (?, ?, ?, ?)',
            [userId, bookId, rating, comment || null]
        );

        const [review] = await db.execute(`
            SELECT r.*, u.username 
            FROM reviews r 
            JOIN users u ON r.userId = u.id 
            WHERE r.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update review (Owner or Admin only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const { rating, comment } = req.body;

        const [existingReview] = await db.execute(
            'SELECT * FROM reviews WHERE id = ?',
            [reviewId]
        );

        if (!existingReview.length) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user is owner or admin
        if (req.user.role !== 'admin' && req.user.id !== existingReview[0].userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await db.execute(
            'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
            [rating || existingReview[0].rating, comment || existingReview[0].comment, reviewId]
        );

        const [updatedReview] = await db.execute(`
            SELECT r.*, u.username 
            FROM reviews r 
            JOIN users u ON r.userId = u.id 
            WHERE r.id = ?`,
            [reviewId]
        );

        res.json({
            success: true,
            message: 'Review updated successfully',
            data: updatedReview[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete review (Owner or Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const reviewId = req.params.id;

        const [review] = await db.execute(
            'SELECT * FROM reviews WHERE id = ?',
            [reviewId]
        );

        if (!review.length) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user is owner or admin
        if (req.user.role !== 'admin' && req.user.id !== review[0].userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await db.execute('DELETE FROM reviews WHERE id = ?', [reviewId]);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

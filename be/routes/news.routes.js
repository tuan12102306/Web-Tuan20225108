const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all news
router.get('/', async (req, res) => {
    try {
        const [news] = await db.execute(
            'SELECT * FROM news ORDER BY createdAt DESC'
        );
        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get news by id
router.get('/:id', async (req, res) => {
    try {
        const [news] = await db.execute(
            'SELECT * FROM news WHERE id = ?',
            [req.params.id]
        );

        if (!news.length) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        res.json({
            success: true,
            data: news[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create news (Admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin role required'
            });
        }

        const { title, content, image } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO news (title, content, image) VALUES (?, ?, ?)',
            [title, content, image || null]
        );

        const [news] = await db.execute(
            'SELECT * FROM news WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'News created successfully',
            data: news[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update news (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin role required'
            });
        }

        const { title, content, image } = req.body;
        const newsId = req.params.id;

        // Check if news exists
        const [existingNews] = await db.execute(
            'SELECT * FROM news WHERE id = ?',
            [newsId]
        );

        if (!existingNews.length) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        // Update news
        await db.execute(
            'UPDATE news SET title = ?, content = ?, image = ? WHERE id = ?',
            [
                title || existingNews[0].title,
                content || existingNews[0].content,
                image || existingNews[0].image,
                newsId
            ]
        );

        const [updatedNews] = await db.execute(
            'SELECT * FROM news WHERE id = ?',
            [newsId]
        );

        res.json({
            success: true,
            message: 'News updated successfully',
            data: updatedNews[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete news (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin role required'
            });
        }

        const newsId = req.params.id;

        // Check if news exists
        const [news] = await db.execute(
            'SELECT * FROM news WHERE id = ?',
            [newsId]
        );

        if (!news.length) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        // Delete news
        await db.execute('DELETE FROM news WHERE id = ?', [newsId]);

        res.json({
            success: true,
            message: 'News deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
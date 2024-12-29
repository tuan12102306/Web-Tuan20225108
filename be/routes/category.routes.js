const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const [categories] = await db.execute(
            'SELECT * FROM librarycategories ORDER BY id DESC'
        );
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create category (Admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin role required'
            });
        }

        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO librarycategories (name, description) VALUES (?, ?)',
            [name, description || null]
        );

        const [category] = await db.execute(
            'SELECT * FROM librarycategories WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update category (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin role required'
            });
        }

        const { name, description } = req.body;
        const categoryId = req.params.id;

        const [existingCategory] = await db.execute(
            'SELECT * FROM librarycategories WHERE id = ?',
            [categoryId]
        );

        if (!existingCategory.length) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        await db.execute(
            'UPDATE librarycategories SET name = ?, description = ? WHERE id = ?',
            [
                name || existingCategory[0].name,
                description || existingCategory[0].description,
                categoryId
            ]
        );

        const [updatedCategory] = await db.execute(
            'SELECT * FROM librarycategories WHERE id = ?',
            [categoryId]
        );

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete category (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin role required'
            });
        }

        const categoryId = req.params.id;

        const [category] = await db.execute(
            'SELECT * FROM librarycategories WHERE id = ?',
            [categoryId]
        );

        if (!category.length) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        await db.execute('DELETE FROM librarycategories WHERE id = ?', [categoryId]);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

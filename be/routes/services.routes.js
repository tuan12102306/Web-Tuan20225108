const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Get all services
router.get('/', async (req, res) => {
    try {
        const [services] = await db.execute(
            'SELECT * FROM services WHERE status = "active" ORDER BY id DESC'
        );
        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create new service (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, description, price } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Service name is required'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO services (name, description, price) VALUES (?, ?, ?)',
            [name, description, price || 0]
        );

        const [service] = await db.execute(
            'SELECT * FROM services WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
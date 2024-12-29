const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Get all contacts
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `
            SELECT c.*, u.username 
            FROM contacts c
            JOIN users u ON c.userId = u.id
        `;
        
        // Nếu không phải admin, chỉ xem được contact của mình
        const params = [];
        if (req.user.role !== 'admin') {
            query += ' WHERE c.userId = ?';
            params.push(req.user.id);
        }
        
        query += ' ORDER BY c.createdAt DESC';

        const [contacts] = await db.execute(query, params);
        
        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create new contact
router.post('/', verifyToken, async (req, res) => {
    try {
        const { subject, message } = req.body;
        const userId = req.user.id;

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Subject and message are required'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO contacts (userId, subject, message) VALUES (?, ?, ?)',
            [userId, subject, message]
        );

        const [contact] = await db.execute(
            'SELECT c.*, u.username FROM contacts c JOIN users u ON c.userId = u.id WHERE c.id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Contact created successfully',
            data: contact[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Reply to contact (Admin only)
router.put('/:id/reply', verifyToken, isAdmin, async (req, res) => {
    try {
        const { reply } = req.body;
        
        if (!reply) {
            return res.status(400).json({
                success: false,
                message: 'Reply content is required'
            });
        }

        const [contact] = await db.execute(
            'SELECT * FROM contacts WHERE id = ?',
            [req.params.id]
        );

        if (!contact.length) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await db.execute(
            'UPDATE contacts SET reply = ?, status = "replied" WHERE id = ?',
            [reply, req.params.id]
        );

        const [updatedContact] = await db.execute(
            'SELECT c.*, u.username FROM contacts c JOIN users u ON c.userId = u.id WHERE c.id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Reply sent successfully',
            data: updatedContact[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get my contacts
router.get('/my-contacts', verifyToken, async (req, res) => {
    try {
        const [contacts] = await db.execute(`
            SELECT c.*, u.username 
            FROM contacts c
            JOIN users u ON c.userId = u.id
            WHERE c.userId = ?
            ORDER BY c.createdAt DESC
        `, [req.user.id]);
        
        res.json({
            success: true,
            data: contacts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get my contact by id
router.get('/my-contacts/:id', verifyToken, async (req, res) => {
    try {
        const [contact] = await db.execute(`
            SELECT c.*, u.username 
            FROM contacts c
            JOIN users u ON c.userId = u.id
            WHERE c.id = ? AND c.userId = ?
        `, [req.params.id, req.user.id]);

        if (!contact.length) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            data: contact[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

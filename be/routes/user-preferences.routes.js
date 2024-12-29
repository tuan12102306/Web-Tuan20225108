const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get user preferences
router.get('/', verifyToken, async (req, res) => {
    try {
        const [preferences] = await db.execute(
            'SELECT * FROM user_preferences WHERE userId = ?',
            [req.user.id]
        );

        if (preferences.length === 0) {
            // Return default preferences if not set
            return res.json({
                success: true,
                data: {
                    theme: 'light',
                    language: 'vi',
                    emailNotification: true,
                    pushNotification: true
                }
            });
        }

        res.json({
            success: true,
            data: preferences[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create or update preferences
router.post('/', verifyToken, async (req, res) => {
    try {
        const { theme, language, emailNotification, pushNotification } = req.body;
        const userId = req.user.id;

        // Check if preferences exist
        const [existing] = await db.execute(
            'SELECT * FROM user_preferences WHERE userId = ?',
            [userId]
        );

        if (existing.length === 0) {
            // Create new preferences
            await db.execute(
                'INSERT INTO user_preferences (userId, theme, language, emailNotification, pushNotification) VALUES (?, ?, ?, ?, ?)',
                [userId, theme, language, emailNotification, pushNotification]
            );
        } else {
            // Update existing preferences
            await db.execute(
                'UPDATE user_preferences SET theme = ?, language = ?, emailNotification = ?, pushNotification = ? WHERE userId = ?',
                [theme, language, emailNotification, pushNotification, userId]
            );
        }

        const [updated] = await db.execute(
            'SELECT * FROM user_preferences WHERE userId = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: updated[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Patch preferences (update partial)
router.patch('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Build dynamic update query
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        
        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const updateQuery = `UPDATE user_preferences SET ${fields.map(field => `${field} = ?`).join(', ')} WHERE userId = ?`;
        
        await db.execute(updateQuery, [...values, userId]);

        const [updated] = await db.execute(
            'SELECT * FROM user_preferences WHERE userId = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: updated[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete preferences (reset to default)
router.delete('/', verifyToken, async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM user_preferences WHERE userId = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'Preferences reset to default',
            data: {
                theme: 'light',
                language: 'vi',
                emailNotification: true,
                pushNotification: true
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Thêm route PUT
router.put('/', verifyToken, async (req, res) => {
    try {
        const { theme, language, emailNotification, pushNotification } = req.body;
        const userId = req.user.id;

        // Kiểm tra preferences tồn tại
        const [existing] = await db.execute(
            'SELECT * FROM user_preferences WHERE userId = ?',
            [userId]
        );

        if (!existing.length) {
            return res.status(404).json({
                success: false,
                message: 'Preferences not found'
            });
        }

        // Update preferences
        await db.execute(
            'UPDATE user_preferences SET theme = ?, language = ?, emailNotification = ?, pushNotification = ? WHERE userId = ?',
            [
                theme || existing[0].theme,
                language || existing[0].language,
                emailNotification !== undefined ? emailNotification : existing[0].emailNotification,
                pushNotification !== undefined ? pushNotification : existing[0].pushNotification,
                userId
            ]
        );

        const [updatedPreferences] = await db.execute(
            'SELECT * FROM user_preferences WHERE userId = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: updatedPreferences[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

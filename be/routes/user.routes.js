const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all users
router.get('/', verifyToken, async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, username, fullName, email, role FROM users');
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Change password
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;

        // Check old password
        const [users] = await db.execute(
            'SELECT * FROM users WHERE id = ? AND password = ?',
            [userId, oldPassword]
        );

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid old password"
            });
        }

        // Update password
        await db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [newPassword, userId]
        );

        res.json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const [users] = await db.execute(
            'SELECT id, username, fullName, email, role FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { fullName, phone, address } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!fullName && !phone && !address) {
            return res.status(400).json({
                success: false,
                message: 'At least one field is required for update'
            });
        }

        // Build update query dynamically
        let updateFields = [];
        let params = [];
        
        if (fullName) {
            updateFields.push('fullName = ?');
            params.push(fullName);
        }
        if (phone) {
            updateFields.push('phone = ?');
            params.push(phone);
        }
        if (address) {
            updateFields.push('address = ?');
            params.push(address);
        }

        // Add userId at the end of params
        params.push(userId);

        const query = `
            UPDATE users 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `;

        await db.execute(query, params);

        // Get updated user data
        const [updatedUser] = await db.execute(
            'SELECT id, username, fullName, email, phone, address, role FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser[0]
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// [ADMIN] Get all users
router.get('/admin/users', verifyToken, async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        const [users] = await db.execute('SELECT id, username, fullName, email, role FROM users');
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// [ADMIN] Update user role
router.put('/admin/users/:id/role', verifyToken, async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        const { role } = req.body;
        const userId = req.params.id;

        // Kiểm tra role hợp lệ
        if (!['admin', 'user'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        // Update role
        await db.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, userId]
        );

        const [updatedUser] = await db.execute(
            'SELECT id, username, fullName, email, role FROM users WHERE id = ?',
            [userId]
        );

        if (updatedUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: updatedUser[0]
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// [ADMIN] Delete user
router.delete('/admin/users/:id', verifyToken, async (req, res) => {
    try {
        // Kiểm tra quyền admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Permission denied'
            });
        }

        const userId = req.params.id;

        // Không cho phép xóa chính mình
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete yourself'
            });
        }

        const [result] = await db.execute('DELETE FROM users WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../config/db.config');

// Đảm bảo route này được định nghĩa đúng
router.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', req.body); // Debug log

        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email và mật khẩu là bắt buộc'
            });
        }

        // Query database
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        console.log('Found users:', users); // Debug log

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        const user = users[0];

        // Verify password
        if (password !== user.password) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        res.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
});

router.post('/register', async (req, res) => {
    try {
        // Log request body để debug
        console.log('Request body:', req.body);

        // Validate JSON format
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body'
            });
        }

        const { username, password, fullName, email } = req.body;

        // Validate required fields
        if (!username || !password || !email || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check existing user
        const [existingUser] = await db.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Create new user
        const [result] = await db.execute(
            'INSERT INTO users (username, password, fullName, email, role) VALUES (?, ?, ?, ?, ?)',
            [username, password, fullName, email, 'user']
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: result.insertId,
                username,
                email,
                fullName,
                role: 'user'
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
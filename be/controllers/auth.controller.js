const db = require('../config/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, password, fullName, email } = req.body;

        // Check if username exists
        const [existingUsers] = await db.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await db.execute(
            'INSERT INTO users (username, password, fullName, email, role) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, fullName, email, 'user']
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('Login attempt:', { username }); // Debug log

        // Get user
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (!users || users.length === 0) {
            console.log('User not found'); // Debug log
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const user = users[0];
        console.log('Found user:', { id: user.id, username: user.username }); // Debug log

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        console.log('Password verification:', validPassword); // Debug log

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email exists
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: users[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In thực tế, gửi email với link reset password
    // Ở đây chỉ trả về token để test
    res.json({
      success: true,
      message: 'Reset password instructions sent to email',
      resetToken // Trong thực tế không nên trả về token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
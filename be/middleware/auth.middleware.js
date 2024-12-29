const jwt = require('jsonwebtoken');
const db = require('../config/db.config');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'your_jwt_secret_key');
        
        const [users] = await db.execute(
            'SELECT id, username, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!users.length) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Thêm middleware isAdmin
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin role required'
        });
    }

    next();
};

// Export cả hai middleware
module.exports = {
    verifyToken,
    isAdmin
};
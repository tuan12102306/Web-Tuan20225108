const verifyAdmin = (req, res, next) => {
    try {
        // Kiểm tra user có role admin không
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }
        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

module.exports = verifyAdmin;

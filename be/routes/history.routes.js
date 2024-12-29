const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Lấy lịch sử mượn sách
router.get('/borrows', verifyToken, async (req, res) => {
    try {
        const [borrows] = await db.execute(`
            SELECT b.title, br.borrowDate, br.dueDate, br.returnDate, 
                   br.status, r.condition as returnCondition
            FROM borrows br
            JOIN books b ON br.bookId = b.id
            LEFT JOIN returns r ON br.id = r.borrowId
            WHERE br.userId = ?
            ORDER BY br.borrowDate DESC
        `, [req.user.id]);

        res.json({
            success: true,
            data: borrows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Lấy lịch sử sử dụng dịch vụ
router.get('/services', verifyToken, async (req, res) => {
    try {
        const [services] = await db.execute(`
            SELECT s.name, sb.bookingDate, sb.status
            FROM service_bookings sb
            JOIN services s ON sb.serviceId = s.id
            WHERE sb.userId = ?
            ORDER BY sb.bookingDate DESC
        `, [req.user.id]);

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

// Lấy thống kê cá nhân
router.get('/statistics', verifyToken, async (req, res) => {
    try {
        // Thống kê mượn sách
        const [borrowStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalBorrows,
                COUNT(CASE WHEN status = 'returned' THEN 1 END) as returned,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue
            FROM borrows
            WHERE userId = ?
        `, [req.user.id]);

        // Thống kê dịch vụ
        const [serviceStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalBookings,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
            FROM service_bookings
            WHERE userId = ?
        `, [req.user.id]);

        res.json({
            success: true,
            data: {
                borrows: borrowStats[0],
                services: serviceStats[0]
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

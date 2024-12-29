const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Chỉ admin mới được xem thống kê
router.use(verifyToken, isAdmin);

// Thống kê tổng quan
router.get('/overview', async (req, res) => {
    try {
        const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role != "admin"');
        const [totalBooks] = await db.execute('SELECT COUNT(*) as count FROM books');
        const [totalBookings] = await db.execute('SELECT COUNT(*) as count FROM service_bookings');
        const [totalPenalties] = await db.execute('SELECT COUNT(*) as count FROM penalties');

        res.json({
            success: true,
            data: {
                totalUsers: totalUsers[0].count,
                totalBooks: totalBooks[0].count,
                totalBookings: totalBookings[0].count,
                totalPenalties: totalPenalties[0].count
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Thống kê theo thời gian
router.get('/timeline', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = '';
        const params = [];

        if (startDate && endDate) {
            dateFilter = 'WHERE createdAt BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        const [bookings] = await db.execute(`
            SELECT DATE(createdAt) as date, COUNT(*) as count 
            FROM service_bookings ${dateFilter}
            GROUP BY DATE(createdAt)
            ORDER BY date DESC
        `, params);

        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Thống kê theo dịch vụ
router.get('/services', async (req, res) => {
    try {
        const [serviceStats] = await db.execute(`
            SELECT s.name, COUNT(sb.id) as bookingCount
            FROM services s
            LEFT JOIN service_bookings sb ON s.id = sb.serviceId
            GROUP BY s.id
            ORDER BY bookingCount DESC
        `);

        res.json({
            success: true,
            data: serviceStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Thống kê vi phạm
router.get('/penalties', async (req, res) => {
    try {
        const [penaltyStats] = await db.execute(`
            SELECT DATE(createdAt) as date, COUNT(*) as count,
                   SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingCount,
                   SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paidCount
            FROM penalties
            GROUP BY DATE(createdAt)
            ORDER BY date DESC
            LIMIT 30
        `);

        res.json({
            success: true,
            data: penaltyStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

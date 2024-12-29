const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Chỉ admin mới được truy cập dashboard
router.use(verifyToken, isAdmin);

// Thống kê tổng quan cho dashboard
router.get('/overview', async (req, res) => {
    try {
        // Thống kê người dùng
        const [userStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalUsers,
                SUM(CASE WHEN createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as newUsers
            FROM users 
            WHERE role != 'admin'
        `);

        // Thống kê sách
        const [bookStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalBooks,
                SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END) as outOfStock
            FROM books
        `);

        // Thống kê mượn sách
        const [borrowStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalBorrows,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdueCount
            FROM borrows
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        // Thống kê dịch vụ
        const [serviceStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalBookings,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingCount
            FROM service_bookings
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        res.json({
            success: true,
            data: {
                users: userStats[0],
                books: bookStats[0],
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

// Thống kê theo biểu đồ
router.get('/charts', async (req, res) => {
    try {
        // Thống kê mượn sách theo ngày
        const [borrowChart] = await db.execute(`
            SELECT 
                DATE(createdAt) as date,
                COUNT(*) as count
            FROM borrows
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(createdAt)
            ORDER BY date
        `);

        // Thống kê dịch vụ theo trạng thái
        const [serviceChart] = await db.execute(`
            SELECT 
                status,
                COUNT(*) as count
            FROM service_bookings
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY status
        `);

        // Top 5 sách mượn nhiều nhất
        const [topBooks] = await db.execute(`
            SELECT 
                b.title,
                COUNT(br.id) as borrowCount
            FROM books b
            LEFT JOIN borrows br ON b.id = br.bookId
            GROUP BY b.id
            ORDER BY borrowCount DESC
            LIMIT 5
        `);

        res.json({
            success: true,
            data: {
                borrowChart,
                serviceChart,
                topBooks
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Hoạt động gần đây
router.get('/recent-activities', async (req, res) => {
    try {
        // Mượn sách gần đây
        const [recentBorrows] = await db.execute(`
            SELECT 
                b.id,
                'borrow' as type,
                u.username,
                bk.title as bookTitle,
                b.status,
                b.createdAt
            FROM borrows b
            JOIN users u ON b.userId = u.id
            JOIN books bk ON b.bookId = bk.id
            ORDER BY b.createdAt DESC
            LIMIT 5
        `);

        // Đặt dịch vụ gần đây
        const [recentBookings] = await db.execute(`
            SELECT 
                sb.id,
                'service' as type,
                u.username,
                s.name as serviceName,
                sb.status,
                sb.createdAt
            FROM service_bookings sb
            JOIN users u ON sb.userId = u.id
            JOIN services s ON sb.serviceId = s.id
            ORDER BY sb.createdAt DESC
            LIMIT 5
        `);

        // Kết hợp và sắp xếp theo thời gian
        const activities = [...recentBorrows, ...recentBookings]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

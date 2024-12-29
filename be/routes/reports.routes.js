const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Báo cáo sách quá hạn
router.get('/overdue-books', verifyToken, isAdmin, async (req, res) => {
    try {
        const [overdueBooks] = await db.execute(`
            SELECT b.title, u.username, br.borrowDate, br.dueDate,
                   DATEDIFF(CURRENT_DATE, br.dueDate) as daysOverdue
            FROM borrows br
            JOIN books b ON br.bookId = b.id
            JOIN users u ON br.userId = u.id
            WHERE br.status = 'borrowed' 
            AND br.dueDate < CURRENT_DATE
            ORDER BY br.dueDate ASC
        `);

        res.json({
            success: true,
            data: overdueBooks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Báo cáo sách phổ biến theo thời gian
router.get('/popular-books', verifyToken, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = '';
        const params = [];

        if (startDate && endDate) {
            dateFilter = 'AND br.borrowDate BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        const [popularBooks] = await db.execute(`
            SELECT b.title, b.author,
                   COUNT(br.id) as borrowCount,
                   COUNT(DISTINCT br.userId) as uniqueReaders
            FROM books b
            LEFT JOIN borrows br ON b.id = br.bookId
            WHERE 1=1 ${dateFilter}
            GROUP BY b.id
            ORDER BY borrowCount DESC
            LIMIT 10
        `, params);

        res.json({
            success: true,
            data: popularBooks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Báo cáo hoạt động của users
router.get('/user-activities', verifyToken, isAdmin, async (req, res) => {
    try {
        const [activities] = await db.execute(`
            SELECT u.username,
                   COUNT(DISTINCT br.id) as borrowCount,
                   COUNT(DISTINCT sb.id) as serviceBookings,
                   COUNT(DISTINCT CASE WHEN br.status = 'overdue' THEN br.id END) as overdueCount
            FROM users u
            LEFT JOIN borrows br ON u.id = br.userId
            LEFT JOIN service_bookings sb ON u.id = sb.userId
            WHERE u.role != 'admin'
            GROUP BY u.id
            ORDER BY borrowCount DESC, serviceBookings DESC
        `);

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

// Báo cáo tổng quan theo thời gian
router.get('/summary', verifyToken, isAdmin, async (req, res) => {
    try {
        const { period } = req.query; // 'daily', 'weekly', 'monthly'
        let groupBy, dateFormat;

        switch(period) {
            case 'weekly':
                groupBy = 'YEARWEEK(createdDate)';
                dateFormat = 'DATE_FORMAT(createdDate, "%Y-Week %u")';
                break;
            case 'monthly':
                groupBy = 'DATE_FORMAT(createdDate, "%Y-%m")';
                dateFormat = 'DATE_FORMAT(createdDate, "%Y-%m")';
                break;
            default: // daily
                groupBy = 'DATE(createdDate)';
                dateFormat = 'DATE(createdDate)';
        }

        const [summary] = await db.execute(`
            SELECT 
                ${dateFormat} as period,
                COUNT(DISTINCT CASE WHEN type = 'borrow' THEN id END) as newBorrows,
                COUNT(DISTINCT CASE WHEN type = 'return' THEN id END) as returns,
                COUNT(DISTINCT CASE WHEN type = 'service' THEN id END) as serviceBookings
            FROM (
                SELECT id, borrowDate as createdDate, 'borrow' as type 
                FROM borrows
                UNION ALL
                SELECT id, returnDate, 'return' 
                FROM returns
                UNION ALL
                SELECT id, bookingDate, 'service' 
                FROM service_bookings
            ) combined
            GROUP BY ${groupBy}
            ORDER BY period DESC
            LIMIT 30
        `);

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

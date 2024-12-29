const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Lấy sách đề xuất
router.get('/books', verifyToken, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            // Nếu là admin, lấy tất cả sách và số lượt mượn
            const [allBooks] = await db.execute(`
                SELECT b.*, COUNT(br.id) as borrowCount
                FROM books b
                LEFT JOIN borrows br ON b.id = br.bookId
                GROUP BY b.id
                ORDER BY borrowCount DESC, b.createdAt DESC
                LIMIT 10
            `);

            return res.json({
                success: true,
                data: allBooks
            });
        }

        // Nếu là user thường
        const [books] = await db.execute(`
            SELECT b.*, 
                   (SELECT COUNT(*) FROM borrows WHERE bookId = b.id) as borrowCount,
                   (SELECT COUNT(*) FROM borrows WHERE bookId = b.id AND userId = ?) as userBorrowed
            FROM books b
            ORDER BY userBorrowed DESC, borrowCount DESC, b.createdAt DESC
            LIMIT 10
        `, [req.user.id]);

        res.json({
            success: true,
            data: books
        });

    } catch (error) {
        console.error('Error in book recommendations:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Lấy dịch vụ đề xuất
router.get('/services', verifyToken, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const [services] = await db.execute(`
                SELECT s.*, COUNT(sb.id) as bookingCount
                FROM services s
                LEFT JOIN service_bookings sb ON s.id = sb.serviceId
                GROUP BY s.id
                ORDER BY bookingCount DESC, s.createdAt DESC
                LIMIT 5
            `);

            return res.json({
                success: true,
                data: services
            });
        }

        // Nếu là user thường
        const [services] = await db.execute(`
            SELECT s.*,
                   (SELECT COUNT(*) FROM service_bookings WHERE serviceId = s.id) as bookingCount,
                   (SELECT COUNT(*) FROM service_bookings WHERE serviceId = s.id AND userId = ?) as userBooked
            FROM services s
            ORDER BY userBooked DESC, bookingCount DESC, s.createdAt DESC
            LIMIT 5
        `, [req.user.id]);

        res.json({
            success: true,
            data: services
        });

    } catch (error) {
        console.error('Error in service recommendations:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

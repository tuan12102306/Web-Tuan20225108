const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Tìm kiếm sách nâng cao
router.get('/books', verifyToken, async (req, res) => {
    try {
        const { query, category, author, minYear, maxYear } = req.query;
        let sqlQuery = `
            SELECT b.*, c.name as categoryName,
                   COUNT(DISTINCT br.id) as borrowCount
            FROM books b
            LEFT JOIN categories c ON b.categoryId = c.id
            LEFT JOIN borrows br ON b.id = br.bookId
            WHERE 1=1
        `;
        const params = [];

        // Thêm các điều kiện tìm kiếm
        if (query) {
            sqlQuery += ` AND (b.title LIKE ? OR b.description LIKE ?)`;
            params.push(`%${query}%`, `%${query}%`);
        }

        if (category) {
            sqlQuery += ` AND b.categoryId = ?`;
            params.push(category);
        }

        if (author) {
            sqlQuery += ` AND b.author LIKE ?`;
            params.push(`%${author}%`);
        }

        sqlQuery += `
            GROUP BY b.id, b.title, b.author, b.description, 
                     b.quantity, b.categoryId, b.createdAt, b.updatedAt
            ORDER BY borrowCount DESC, b.createdAt DESC
        `;

        const [books] = await db.execute(sqlQuery, params);

        res.json({
            success: true,
            data: books
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Tìm kiếm dịch vụ nâng cao
router.get('/services', verifyToken, async (req, res) => {
    try {
        const { query, type, minPrice, maxPrice } = req.query;
        let sqlQuery = `
            SELECT s.*, 
                   COUNT(DISTINCT sb.id) as bookingCount
            FROM services s
            LEFT JOIN service_bookings sb ON s.id = sb.serviceId
            WHERE 1=1
        `;
        const params = [];

        if (query) {
            sqlQuery += ` AND (s.name LIKE ? OR s.description LIKE ?)`;
            params.push(`%${query}%`, `%${query}%`);
        }

        if (type) {
            sqlQuery += ` AND s.type = ?`;
            params.push(type);
        }

        if (minPrice) {
            sqlQuery += ` AND s.price >= ?`;
            params.push(minPrice);
        }

        if (maxPrice) {
            sqlQuery += ` AND s.price <= ?`;
            params.push(maxPrice);
        }

        sqlQuery += `
            GROUP BY s.id
            ORDER BY bookingCount DESC, s.createdAt DESC
        `;

        const [services] = await db.execute(sqlQuery, params);

        res.json({
            success: true,
            data: services
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

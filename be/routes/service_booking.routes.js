const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');

// Get all service bookings
router.get('/', verifyToken, async (req, res) => {
    try {
        let query = `
            SELECT sb.*, s.name as serviceName, u.username 
            FROM service_bookings sb
            JOIN services s ON sb.serviceId = s.id
            JOIN users u ON sb.userId = u.id
        `;
        
        const params = [];
        
        // Nếu là user thường, chỉ xem được booking của mình
        if (req.user.role !== 'admin') {
            query += ' WHERE sb.userId = ?';
            params.push(req.user.id);
        }
        
        query += ' ORDER BY sb.createdAt DESC';

        const [bookings] = await db.execute(query, params);
        
        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        console.error('Error in GET /service-bookings:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get service booking by id
router.get('/:id', verifyToken, async (req, res) => {
    try {
        // Kiểm tra id có phải số không
        const bookingId = parseInt(req.params.id);
        if (isNaN(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }

        // Query với điều kiện phân quyền
        let query = `
            SELECT sb.*, s.name as serviceName, u.username 
            FROM service_bookings sb
            JOIN services s ON sb.serviceId = s.id
            JOIN users u ON sb.userId = u.id
            WHERE sb.id = ?
        `;
        
        // Nếu không phải admin, thêm điều kiện userId
        const params = [bookingId];
        if (req.user.role !== 'admin') {
            query += ' AND sb.userId = ?';
            params.push(req.user.id);
        }

        const [booking] = await db.execute(query, params);

        if (!booking.length) {
            return res.status(404).json({
                success: false,
                message: 'Service booking not found'
            });
        }

        res.json({
            success: true,
            data: booking[0]
        });
    } catch (error) {
        console.error('Error in GET /service-bookings/:id:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create new service booking
router.post('/', verifyToken, async (req, res) => {
    try {
        const { serviceId, bookingDate, note } = req.body;
        const userId = req.user.id;

        if (!serviceId || !bookingDate) {
            return res.status(400).json({
                success: false,
                message: 'ServiceId and bookingDate are required'
            });
        }

        // Kiểm tra service có tồn tại
        const [service] = await db.execute(
            'SELECT * FROM services WHERE id = ?',
            [serviceId]
        );

        if (!service.length) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const [result] = await db.execute(
            'INSERT INTO service_bookings (userId, serviceId, bookingDate, note, status) VALUES (?, ?, ?, ?, "pending")',
            [userId, serviceId, bookingDate, note || null]
        );

        const [booking] = await db.execute(`
            SELECT sb.*, s.name as serviceName, u.username 
            FROM service_bookings sb
            JOIN services s ON sb.serviceId = s.id
            JOIN users u ON sb.userId = u.id
            WHERE sb.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Service booking created successfully',
            data: booking[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Update service booking status (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin role required'
            });
        }

        const bookingId = req.params.id;
        const { status, adminNote } = req.body;

        // Kiểm tra booking tồn tại
        const [existingBooking] = await db.execute(
            'SELECT * FROM service_bookings WHERE id = ?',
            [bookingId]
        );

        if (!existingBooking.length) {
            return res.status(404).json({
                success: false,
                message: 'Service booking not found'
            });
        }

        // Tạo câu query update dựa trên dữ liệu được gửi lên
        let updateQuery = 'UPDATE service_bookings SET ';
        const updateValues = [];
        const updates = [];

        if (status) {
            if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid status is required (pending, confirmed, cancelled, completed)'
                });
            }
            updates.push('status = ?');
            updateValues.push(status);
        }

        if (adminNote !== undefined) {
            updates.push('adminNote = ?');
            updateValues.push(adminNote);
        }

        if (updates.length === 0) {
            return res.json({
                success: true,
                message: 'No changes to update',
                data: existingBooking[0]
            });
        }

        updateQuery += updates.join(', ') + ' WHERE id = ?';
        updateValues.push(bookingId);

        await db.execute(updateQuery, updateValues);

        // Lấy booking đã update
        const [updatedBooking] = await db.execute(`
            SELECT sb.*, s.name as serviceName, u.username 
            FROM service_bookings sb
            JOIN services s ON sb.serviceId = s.id
            JOIN users u ON sb.userId = u.id
            WHERE sb.id = ?`,
            [bookingId]
        );

        res.json({
            success: true,
            message: 'Service booking updated successfully',
            data: updatedBooking[0]
        });
    } catch (error) {
        console.error('Error in PUT /service-bookings/:id:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Delete service booking
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const [booking] = await db.execute(
            'SELECT * FROM service_bookings WHERE id = ?',
            [bookingId]
        );

        if (!booking.length) {
            return res.status(404).json({
                success: false,
                message: 'Service booking not found'
            });
        }

        // Chỉ admin hoặc chủ booking mới được xóa
        if (req.user.role !== 'admin' && req.user.id !== booking[0].userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await db.execute('DELETE FROM service_bookings WHERE id = ?', [bookingId]);

        res.json({
            success: true,
            message: 'Service booking deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

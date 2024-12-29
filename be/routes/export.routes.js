const express = require('express');
const router = express.Router();
const db = require('../config/db.config');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const ExcelJS = require('exceljs');

// Export danh sách sách
router.get('/books', verifyToken, isAdmin, async (req, res) => {
    try {
        const [books] = await db.execute(`
            SELECT b.*, c.name as categoryName,
                   COUNT(DISTINCT br.id) as borrowCount
            FROM books b
            LEFT JOIN categories c ON b.categoryId = c.id
            LEFT JOIN borrows br ON b.id = br.bookId
            GROUP BY b.id
            ORDER BY b.title
        `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Books');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Author', key: 'author', width: 20 },
            { header: 'Category', key: 'categoryName', width: 20 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            { header: 'Times Borrowed', key: 'borrowCount', width: 15 },
            { header: 'Created At', key: 'createdAt', width: 20 }
        ];

        worksheet.addRows(books);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=books.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Export lịch sử mượn sách
router.get('/borrows', verifyToken, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = '';
        const params = [];

        if (startDate && endDate) {
            dateFilter = 'WHERE br.borrowDate BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        const [borrows] = await db.execute(`
            SELECT br.id, u.username, b.title,
                   br.borrowDate, br.dueDate, br.returnDate,
                   br.status, r.condition as returnCondition,
                   r.notes as returnNotes
            FROM borrows br
            JOIN users u ON br.userId = u.id
            JOIN books b ON br.bookId = b.id
            LEFT JOIN returns r ON br.id = r.borrowId
            ${dateFilter}
            ORDER BY br.borrowDate DESC
        `, params);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Borrows');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'User', key: 'username', width: 20 },
            { header: 'Book', key: 'title', width: 30 },
            { header: 'Borrow Date', key: 'borrowDate', width: 20 },
            { header: 'Due Date', key: 'dueDate', width: 20 },
            { header: 'Return Date', key: 'returnDate', width: 20 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Return Condition', key: 'returnCondition', width: 15 },
            { header: 'Notes', key: 'returnNotes', width: 30 }
        ];

        worksheet.addRows(borrows);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=borrows.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Export thống kê
router.get('/statistics', verifyToken, isAdmin, async (req, res) => {
    try {
        const { year, month } = req.query;
        const period = month ? `${year}-${month}` : year;
        
        // Thống kê mượn sách
        const [borrowStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalBorrows,
                COUNT(CASE WHEN status = 'returned' THEN 1 END) as returned,
                COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue
            FROM borrows
            WHERE ${month ? 'DATE_FORMAT(borrowDate, "%Y-%m")' : 'YEAR(borrowDate)'} = ?
        `, [period]);

        // Thống kê dịch vụ - đã sửa bỏ price
        const [serviceStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalBookings,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
            FROM service_bookings
            WHERE ${month ? 'DATE_FORMAT(bookingDate, "%Y-%m")' : 'YEAR(bookingDate)'} = ?
        `, [period]);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Statistics');

        // Thêm thông tin thống kê
        worksheet.addRow(['Period', period]);
        worksheet.addRow(['']);
        worksheet.addRow(['Borrow Statistics']);
        worksheet.addRow(['Total Borrows', borrowStats[0].totalBorrows]);
        worksheet.addRow(['Returned', borrowStats[0].returned]);
        worksheet.addRow(['Overdue', borrowStats[0].overdue]);
        worksheet.addRow(['']);
        worksheet.addRow(['Service Statistics']);
        worksheet.addRow(['Total Bookings', serviceStats[0].totalBookings]);
        worksheet.addRow(['Completed', serviceStats[0].completed]);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=statistics.xlsx');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;

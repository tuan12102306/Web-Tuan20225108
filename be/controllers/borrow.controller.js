const db = require('../config/db.config');

exports.borrowBook = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const userId = req.user.id;
        const { bookId } = req.body;

        console.log('Processing borrow request:', { userId, bookId });

        // Validate input
        if (!bookId) {
            return res.status(400).json({
                success: false,
                message: 'Book ID is required'
            });
        }

        // Check if book exists and has available copies
        const [books] = await connection.execute(
            'SELECT * FROM books WHERE id = ? AND quantity > 0',
            [bookId]
        );

        if (!books || books.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Book not available'
            });
        }

        // Begin transaction
        await connection.beginTransaction();

        try {
            // Create borrow record
            const [result] = await connection.execute(
                'INSERT INTO borrows (userId, bookId, borrowDate, status) VALUES (?, ?, NOW(), ?)',
                [userId, bookId, 'borrowed']
            );

            // Update book quantity
            await connection.execute(
                'UPDATE books SET quantity = quantity - 1 WHERE id = ?',
                [bookId]
            );

            // Commit transaction
            await connection.commit();

            res.json({
                success: true,
                message: 'Book borrowed successfully',
                data: {
                    borrowId: result.insertId,
                    bookId,
                    borrowDate: new Date()
                }
            });

        } catch (error) {
            // Rollback on error
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Borrow book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    } finally {
        // Release connection
        if (connection) {
            connection.release();
        }
    }
};

exports.returnBook = async (req, res) => {
    try {
        const userId = req.user.id;
        const { borrowId } = req.body;

        console.log('Processing return request:', { userId, borrowId });

        // Validate input
        if (!borrowId) {
            return res.status(400).json({
                success: false,
                message: 'Borrow ID is required'
            });
        }

        // Check if borrow record exists and belongs to user
        const [borrows] = await db.execute(
            'SELECT * FROM borrows WHERE id = ? AND userId = ? AND status = ?',
            [borrowId, userId, 'borrowed']
        );

        if (!borrows || borrows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid borrow record or book already returned'
            });
        }

        // Update borrow status
        await db.execute(
            'UPDATE borrows SET returnDate = NOW(), status = ? WHERE id = ?',
            ['returned', borrowId]
        );

        // Increase book quantity
        await db.execute(
            'UPDATE books SET quantity = quantity + 1 WHERE id = ?',
            [borrows[0].bookId]
        );

        res.json({
            success: true,
            message: 'Book returned successfully',
            data: {
                borrowId,
                returnDate: new Date()
            }
        });

    } catch (error) {
        console.error('Return book error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

exports.getUserBorrows = async (req, res) => {
  try {
    const [borrows] = await db.execute(
      `SELECT b.*, books.title, books.author 
       FROM borrows b 
       JOIN books ON b.bookId = books.id 
       WHERE b.userId = ?
       ORDER BY b.borrowDate DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: borrows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Lấy lịch sử mượn sách của user
exports.getBorrowHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Getting borrow history for user:', userId);

        // Sửa lại câu query để đơn giản hơn và thêm log
        const [history] = await db.execute(
            'SELECT b.id, b.borrowDate, b.returnDate, b.status, bk.title, bk.author FROM borrows b INNER JOIN books bk ON b.bookId = bk.id WHERE b.userId = ?',
            [userId]
        );

        console.log('Found history:', history);

        // Kiểm tra nếu không có lịch sử
        if (!history || history.length === 0) {
            return res.json({
                success: true,
                message: 'No borrow history found',
                data: []
            });
        }

        // Format lại dữ liệu trước khi trả về
        const formattedHistory = history.map(record => ({
            id: record.id,
            bookTitle: record.title,
            author: record.author,
            borrowDate: record.borrowDate,
            returnDate: record.returnDate,
            status: record.status
        }));

        res.json({
            success: true,
            data: formattedHistory
        });

    } catch (error) {
        console.error('Get borrow history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// Lấy danh sách sách đang mượn
exports.getCurrentBorrows = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Getting current borrows for user:', userId);

        const [borrows] = await db.execute(
            'SELECT b.id, b.borrowDate, bk.title, bk.author FROM borrows b INNER JOIN books bk ON b.bookId = bk.id WHERE b.userId = ? AND b.status = "borrowed"',
            [userId]
        );

        res.json({
            success: true,
            data: borrows
        });

    } catch (error) {
        console.error('Get current borrows error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// Thêm phương thức kiểm tra admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

// Sửa lại phương thức getBorrowStats
exports.getBorrowStats = async (req, res) => {
    try {
        console.log('Getting borrow statistics...');

        // Lấy thống kê tổng quát
        const [overallStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalBorrows,
                SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as currentlyBorrowed,
                SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned
            FROM borrows
        `);

        // Lấy top 5 sách được mượn nhiều nhất
        const [topBooks] = await db.execute(`
            SELECT 
                b.bookId,
                bk.title,
                bk.author,
                COUNT(*) as borrowCount
            FROM borrows b
            JOIN books bk ON b.bookId = bk.id
            GROUP BY b.bookId
            ORDER BY borrowCount DESC
            LIMIT 5
        `);

        // Lấy thống kê theo tháng
        const [monthlyStats] = await db.execute(`
            SELECT 
                DATE_FORMAT(borrowDate, '%Y-%m') as month,
                COUNT(*) as totalBorrows
            FROM borrows
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6
        `);

        res.json({
            success: true,
            data: {
                overall: overallStats[0],
                topBorrowedBooks: topBooks,
                monthlyStats: monthlyStats
            }
        });

    } catch (error) {
        console.error('Get borrow stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    }
};

// Export phương thức isAdmin
exports.isAdmin = isAdmin;
const cron = require('node-cron');
const db = require('../config/db.config');
const emailService = require('../services/email.service');

// Chạy mỗi ngày lúc 0h
const dailyTasks = cron.schedule('0 0 * * *', async () => {
    try {
        // 1. Kiểm tra và gửi thông báo sách sắp đến hạn (trước 3 ngày)
        const [dueSoonBorrows] = await db.execute(`
            SELECT 
                b.id as borrowId,
                b.userId,
                b.dueDate,
                bk.title as bookTitle
            FROM borrows b
            JOIN books bk ON b.bookId = bk.id
            WHERE b.status = 'borrowed'
            AND b.dueDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 3 DAY)
        `);

        for (const borrow of dueSoonBorrows) {
            await db.execute(`
                INSERT INTO notifications (userId, title, message, type)
                VALUES (?, ?, ?, 'borrow_due')
            `, [
                borrow.userId,
                'Sách sắp đến hạn trả',
                `Sách "${borrow.bookTitle}" sẽ đến hạn trả vào ngày ${borrow.dueDate}`
            ]);

            // Gửi email
            const [user] = await db.execute('SELECT * FROM users WHERE id = ?', [borrow.userId]);
            await emailService.sendDueNotification(user[0], {
                title: borrow.bookTitle
            }, borrow.dueDate);
        }

        // 2. Tự động tạo phiếu phạt cho sách trả trễ
        const [overdueBorrows] = await db.execute(`
            SELECT 
                b.id as borrowId,
                b.userId,
                b.dueDate,
                DATEDIFF(NOW(), b.dueDate) as daysOverdue
            FROM borrows b
            WHERE b.status = 'borrowed'
            AND b.dueDate < NOW()
            AND b.id NOT IN (SELECT borrowId FROM penalties WHERE reason = 'late')
        `);

        for (const borrow of overdueBorrows) {
            // Tính tiền phạt (ví dụ: 5000đ/ngày)
            const amount = borrow.daysOverdue * 5000;

            // Tạo phiếu phạt
            await db.execute(`
                INSERT INTO penalties (borrowId, userId, amount, reason)
                VALUES (?, ?, ?, 'late')
            `, [borrow.borrowId, borrow.userId, amount]);

            // Gửi thông báo
            await db.execute(`
                INSERT INTO notifications (userId, title, message, type)
                VALUES (?, ?, ?, 'system')
            `, [
                borrow.userId,
                'Phiếu phạt mới',
                `Bạn có phiếu phạt mới với số tiền ${amount}đ do trả sách trễ ${borrow.daysOverdue} ngày`
            ]);

            // Gửi email
            const [user] = await db.execute('SELECT * FROM users WHERE id = ?', [borrow.userId]);
            await emailService.sendPenaltyNotification(user[0], {
                amount: amount,
                reason: 'late'
            });
        }

    } catch (error) {
        console.error('Scheduler error:', error);
    }
});

// Khởi động scheduler
const startScheduler = () => {
    dailyTasks.start();
    console.log('Scheduler started');
};

module.exports = { startScheduler };

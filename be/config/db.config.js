const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ntdptit2005',
    database: 'library_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Thêm error handling
pool.getConnection()
    .then(connection => {
        console.log('Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);
    });

module.exports = pool;
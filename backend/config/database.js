const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo connection pool để quản lý kết nối hiệu quả
const pool = mysql.createPool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test kết nối
pool.getConnection()
    .then(connection => {
        console.log('Kết nối MySQL thành công!');
        connection.release();
    })
    .catch(err => {
        console.error('Lỗi kết nối MySQL:', err.message);
    });

module.exports = pool;

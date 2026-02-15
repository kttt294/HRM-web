const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('-- Kết nối MySQL thành công');

        const dbName = process.env.DATABASE;
        await connection.query(`USE ${dbName}`);
        console.log(`-- Đang sử dụng database '${dbName}'`);

        // Đọc và thực thi schema.sql
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        await connection.query(schemaSql);
        console.log('-- Đã tạo các bảng từ schema.sql');

        // Đọc và thực thi seed.sql
        const seedPath = path.join(__dirname, 'seed.sql');
        if (fs.existsSync(seedPath)) {
            const seedSql = fs.readFileSync(seedPath, 'utf8');
            await connection.query(seedSql);
            console.log('-- Đã thêm dữ liệu mẫu từ seed.sql');
        }

        console.log('\n---- Khởi tạo database hoàn tất!\n');

    } catch (error) {
        console.error('----- Lỗi khởi tạo database:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

initDatabase();

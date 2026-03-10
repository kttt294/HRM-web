const pool = require('./config/database');

async function createTable() {
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS profile_updates (
                id INT PRIMARY KEY AUTO_INCREMENT,
                employee_id INT(5) ZEROFILL NOT NULL,
                data JSON NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processed_at TIMESTAMP NULL,
                processed_by INT(5) ZEROFILL NULL,
                notes TEXT,
                FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
                FOREIGN KEY (processed_by) REFERENCES employees(id) ON DELETE SET NULL
            );
        `;
        await pool.query(sql);
        console.log("----> Đã tạo bảng profile_updates thành công");
        process.exit(0);
    } catch (error) {
        console.error("----> Lỗi khi tạo bảng:", error.message);
        process.exit(1);
    }
}

createTable();

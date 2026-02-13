const mysql = require("mysql2/promise");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

// Cấu hình SSL
const sslConfig = {
  rejectUnauthorized: false, // Mặc định false nếu không tìm thấy cert
};

try {
  // Đường dẫn file CA
  const caPath = path.join(__dirname, "../certs/ca.pem");
  
  if (fs.existsSync(caPath)) {
    sslConfig.ca = fs.readFileSync(caPath);
    sslConfig.rejectUnauthorized = true;
    console.log("----> Đã tải CA Certificate thành công. Kết nối Database được bảo mật.");
  } else {
    console.warn("----> Không tìm thấy file 'backend/certs/ca.pem'. Kết nối sẽ bỏ qua xác thực SSL (Không khuyến nghị cho Production).");
  }
} catch (error) {
  console.error("----> Lỗi khi đọc CA Certificate:", error.message);
}

// Tạo connection pool để quản lý kết nối hiệu quả
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig,
});

// Test kết nối khi khởi động
pool
  .getConnection()
  .then((conn) => {
    console.log("----> Kết nối MySQL thành công");
    conn.release();
  })
  .catch((err) => {
    console.error("----> Lỗi kết nối MySQL:", err.message);
  });

module.exports = pool;

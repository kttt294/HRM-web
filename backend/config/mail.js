const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Cấu hình SMTP transporter cho Nodemailer
 * Sử dụng App Password (KHÔNG dùng mật khẩu mail chính)
 * 
 * Cách lấy App Password cho Gmail:
 * 1. Bật 2-Step Verification tại https://myaccount.google.com/security
 * 2. Vào https://myaccount.google.com/apppasswords
 * 3. Tạo App Password cho "Mail" -> "Other (Custom name)"
 * 4. Copy 16 ký tự và dán vào EMAIL_PASS trong .env
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true cho port 465, false cho port 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Kiểm tra kết nối SMTP khi khởi động (chỉ khi đã có cấu hình)
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify()
    .then(() => console.log("----> Email SMTP kết nối thành công"))
    .catch((err) => console.warn("----> Email SMTP chưa sẵn sàng:", err.message));
} else {
  console.warn("----> Email SMTP chưa được cấu hình (EMAIL_USER / EMAIL_PASS trống)");
}

module.exports = transporter;

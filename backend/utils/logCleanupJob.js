/**
 * logCleanupJob.js - Tác vụ định kỳ xóa audit log cũ (Cron Job)
 *
 * [Fix 1C] Ngăn bảng audit_logs phình to vô hạn bằng cách tự động
 * xóa các bản ghi cũ hơn LOG_RETENTION_DAYS ngày (mặc định: 180 ngày = 6 tháng).
 *
 * Cách hoạt động:
 * - Chạy 1 lần lúc khởi động server (kiểm tra ngay)
 * - Sau đó lặp lại mỗi CLEANUP_INTERVAL_MS (mặc định: 24 giờ)
 * - Xóa theo batch nhỏ để tránh lock bảng trong giờ cao điểm
 */
const db = require("../config/database");

// Số ngày giữ log (có thể cấu hình qua biến môi trường)
const LOG_RETENTION_DAYS = parseInt(process.env.AUDIT_LOG_RETENTION_DAYS) || 180;

// Khoảng thời gian chạy lại (ms) — mặc định 24 giờ
const CLEANUP_INTERVAL_MS = parseInt(process.env.AUDIT_LOG_CLEANUP_INTERVAL_MS) || 24 * 60 * 60 * 1000;

// Số bản ghi xóa tối đa mỗi lần chạy (tránh lock bảng lâu)
const BATCH_SIZE = 1000;

async function cleanupOldLogs() {
  try {
    const [result] = await db.query(
      `DELETE FROM audit_logs
       WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
       LIMIT ?`,
      [LOG_RETENTION_DAYS, BATCH_SIZE]
    );

    if (result.affectedRows > 0) {
      console.log(
        `[LogCleanup] Đã xóa ${result.affectedRows} bản ghi audit log cũ hơn ${LOG_RETENTION_DAYS} ngày.`
      );
    }
  } catch (error) {
    // Không throw — lỗi cleanup không được làm chết server
    console.error("[LogCleanup] Lỗi khi xóa audit log cũ:", error.message);
  }
}

/**
 * Khởi động cron job.
 * Gọi hàm này một lần trong index.js để kích hoạt.
 */
function startLogCleanupJob() {
  console.log(
    `----> LogCleanup: Tự động xóa audit log cũ hơn ${LOG_RETENTION_DAYS} ngày, kiểm tra mỗi ${CLEANUP_INTERVAL_MS / 3600000} giờ.`
  );

  // Chạy ngay khi khởi động
  cleanupOldLogs();

  // Lặp lại theo định kỳ
  setInterval(cleanupOldLogs, CLEANUP_INTERVAL_MS);
}

module.exports = { startLogCleanupJob };

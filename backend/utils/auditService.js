const db = require("../config/database");

/**
 * AuditService - Ghi lại lịch sử hoạt động của người dùng vào database
 *
 * Lưu trữ các thông tin:
 * - Danh tính người thực hiện (user_id, employee_id, username, full_name)
 * - Hành động (action) và đối tượng bị tác động (resource, resource_id)
 * - Chi tiết thay đổi (details - JSON, đã lọc trường nhạy cảm)
 * - Địa chỉ IP (lấy từ req.ip sau trust proxy) và User Agent
 */
const auditService = {

  /**
   * Ghi log request HTTP (dùng bởi auditMiddleware)
   * Lưu thêm thông tin kỹ thuật: method, endpoint, status_code, response_time
   */
  async logRequest({ req, action, resource, resourceId, details, method, endpoint, statusCode, responseTime, userId, employeeId, username, fullName }) {
    const user = req?.user || {};

    const logData = {
      user_id: userId ?? user.id ?? null,
      employee_id: employeeId ?? user.employeeId ?? null,
      username: username ?? user.username ?? null,
      full_name: fullName ?? user.name ?? null,
      action,
      resource: resource || null,
      resource_id: resourceId ? String(resourceId) : null,
      details: details ? JSON.stringify(auditService.sanitizeDetails(details)) : null,
      ip_address: auditService.getClientIp(req),
      user_agent: req?.headers?.['user-agent'] || null,
      method: method || null,
      endpoint: endpoint || null,
      status_code: statusCode || null,
      response_time: responseTime || null,
    };

    db.query(
      `INSERT INTO audit_logs (
        user_id, employee_id, username, full_name,
        action, resource, resource_id, details,
        ip_address, user_agent, method, endpoint, status_code, response_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        logData.user_id,
        logData.employee_id,
        logData.username,
        logData.full_name,
        logData.action,
        logData.resource,
        logData.resource_id,
        logData.details,
        logData.ip_address,
        logData.user_agent,
        logData.method,
        logData.endpoint,
        logData.status_code,
        logData.response_time,
      ]
    ).catch((error) => {
      console.error("[AuditService] Lỗi ghi audit log request:", error.message);
    });
  },

  /**
   * [Fix 1A] Lấy địa chỉ IP thực của client.
   * Dựa vào req.ip do Express tự resolve theo cấu hình trust proxy=1 trong index.js.
   * KHÔNG đọc x-forwarded-for thủ công để tránh IP Spoofing.
   */
  getClientIp(req) {
    if (!req) return null;
    // req.ip đã được Express chuẩn hóa đúng khi app.set('trust proxy', 1)
    return req.ip || null;
  },

  /**
   * [Fix 1D] Lọc các trường nhạy cảm khỏi object details trước khi lưu vào DB.
   * Bảo vệ khỏi việc vô tình log mật khẩu, token, secret key...
   * Áp dụng đệ quy cho các object lồng nhau.
   * @param {Object} obj
   * @returns {Object}
   */
  sanitizeDetails(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const SENSITIVE_KEYS = [
      'password', 'pass', 'passwd', 'secret',
      'token', 'accessToken', 'refreshToken',
      'authorization', 'apiKey', 'api_key',
      'creditCard', 'cardNumber',
    ];

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const isSensitive = SENSITIVE_KEYS.some(
        (s) => key.toLowerCase().includes(s.toLowerCase())
      );
      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Đệ quy cho object lồng nhau
        sanitized[key] = auditService.sanitizeDetails(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  },
};

module.exports = auditService;

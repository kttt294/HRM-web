const auditService = require("../utils/auditService");

/**
 * Audit Middleware — Tự động ghi log các request có xác thực
 *
 * Hoạt động:
 * - Ghi nhận thời gian bắt đầu request
 * - Lắng nghe sự kiện res.finish để bắt status_code
 * - Chỉ ghi log cho POST/PUT/PATCH/DELETE (bỏ qua GET để tránh spam)
 * - Chỉ ghi khi req.user tồn tại (đã qua authMiddleware)
 * - Bỏ qua các endpoint hệ thống (refresh token, audit-logs)
 */

// Các endpoint không cần ghi log
const EXCLUDED_ENDPOINTS = [
  "/api/auth/refresh",
  "/api/audit-logs",
];

// Các method cần ghi log (bỏ qua GET)
const LOGGED_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

/**
 * Trích xuất action name từ method + URL
 * VD: POST /api/employees → CREATE_EMPLOYEE
 */
function extractAction(method, url) {
  const methodMap = {
    POST: "CREATE",
    PUT: "UPDATE",
    PATCH: "UPDATE",
    DELETE: "DELETE",
  };

  const prefix = methodMap[method] || method;

  // Trích xuất resource từ URL
  const parts = url.split("?")[0].split("/").filter(Boolean);
  // parts: ['api', 'employees', '5'] hoặc ['api', 'auth', 'login']
  if (parts.length >= 2) {
    const resource = parts[1].toUpperCase().replace(/-/g, "_");
    const subResource = parts.length >= 3 && isNaN(parts[2])
      ? "_" + parts[2].toUpperCase().replace(/-/g, "_")
      : "";
    return `${prefix}_${resource}${subResource}`;
  }

  return `${prefix}_UNKNOWN`;
}

/**
 * Trích xuất resource name từ URL
 * VD: /api/employees/5 → employees
 */
function extractResource(url) {
  const parts = url.split("?")[0].split("/").filter(Boolean);
  if (parts.length >= 2) {
    return parts[1].replace(/-/g, "_");
  }
  return null;
}

/**
 * Trích xuất resource ID từ URL
 * VD: /api/employees/5 → 5
 */
function extractResourceId(url) {
  const parts = url.split("?")[0].split("/").filter(Boolean);
  for (let i = 2; i < parts.length; i++) {
    if (!isNaN(parts[i])) return parts[i];
  }
  return null;
}

function auditMiddleware(req, res, next) {
  // Ghi nhận thời điểm bắt đầu
  req._auditStartTime = Date.now();

  // Lắng nghe khi response kết thúc
  res.on("finish", () => {
    // Nếu action bị force skip
    if (req._skipAudit) return;

    // Chỉ ghi log nếu:
    // 1. Có user (từ authMiddleware hoặc do controller tự gán như ở LOGIN)
    // 2. Method nằm trong danh sách cần log (hoặc bị ép log qua req._auditAction)
    // 3. Endpoint không bị exclude
    if (!req.user) return;
    if (!LOGGED_METHODS.includes(req.method) && !req._auditAction) return;
    if (EXCLUDED_ENDPOINTS.some((ep) => req.originalUrl.startsWith(ep))) return;

    const responseTime = Date.now() - req._auditStartTime;
    const action = req._auditAction || extractAction(req.method, req.originalUrl);
    const resource = req._auditResource || extractResource(req.originalUrl);
    const resourceId = req._auditResourceId || extractResourceId(req.originalUrl);
    const details = req._auditDetails || null;

    // Nếu controller có truyền thông tin user chi tiết hơn (như lúc LOGIN), thì ưu tiên dùng
    const userId = req._auditUserId || req.user.id;
    const employeeId = req._auditEmployeeId || req.user.employeeId;
    const username = req._auditUsername || req.user.username;
    const fullName = req._auditFullName || req.user.name;

    auditService.logRequest({
      req,
      action,
      resource,
      resourceId,
      details,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      userId,
      employeeId,
      username,
      fullName,
    });
  });

  next();
}

module.exports = auditMiddleware;

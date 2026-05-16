const db = require("../config/database.js");

/**
 * ============================================
 * AUDIT LOG CONTROLLER
 * Quản lý lịch sử hoạt động hệ thống cho Admin
 * ============================================
 */
const auditLogController = {
  /**
   * GET /api/audit-logs
   * Lấy danh sách audit logs có phân trang và filter
   */
  async getAuditLogs(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        userId,
        search,
        action,
        statusCode,
        departmentId,
        roleId,
        startDate,
        endDate,
        method,
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const params = [];
      const conditions = [];

      // Filter theo userId
      if (userId) {
        conditions.push("al.user_id = ?");
        params.push(parseInt(userId));
      }

      // Search theo username hoặc full_name
      if (search) {
        conditions.push("(al.username LIKE ? OR al.full_name LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
      }

      // Filter theo action
      if (action) {
        conditions.push("al.action LIKE ?");
        params.push(`%${action}%`);
      }

      // Filter theo nhóm status code
      if (statusCode) {
        if (statusCode === "2xx") {
          conditions.push("al.status_code >= 200 AND al.status_code < 300");
        } else if (statusCode === "4xx") {
          conditions.push("al.status_code >= 400 AND al.status_code < 500");
        } else if (statusCode === "5xx") {
          conditions.push("al.status_code >= 500");
        } else {
          conditions.push("al.status_code = ?");
          params.push(parseInt(statusCode));
        }
      }

      // Filter theo HTTP method
      if (method) {
        conditions.push("al.method = ?");
        params.push(method.toUpperCase());
      }

      // Filter theo phòng ban
      if (departmentId) {
        conditions.push("e.department_id = ?");
        params.push(parseInt(departmentId));
      }

      // Filter theo vai trò
      if (roleId) {
        conditions.push("u.role_id = ?");
        params.push(parseInt(roleId));
      }

      // Filter theo thời gian
      if (startDate) {
        conditions.push("al.created_at >= ?");
        params.push(startDate);
      }
      if (endDate) {
        conditions.push("al.created_at <= ?");
        params.push(endDate + " 23:59:59");
      }

      const whereClause =
        conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

      // Query đếm tổng số bản ghi
      const countQuery = `
        SELECT COUNT(*) as total
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN employees e ON al.employee_id = e.id
        ${whereClause}
      `;
      const [countResult] = await db.query(countQuery, params);
      const total = countResult[0].total;

      // Query lấy dữ liệu có phân trang
      const dataQuery = `
        SELECT 
          al.*,
          d.name as department_name,
          jt.name as job_title_name,
          r.name as role_name
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN employees e ON al.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN job_titles jt ON e.job_title_id = jt.id
        LEFT JOIN roles r ON u.role_id = r.id
        ${whereClause}
        ORDER BY al.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const dataParams = [...params, parseInt(limit), offset];
      const [logs] = await db.query(dataQuery, dataParams);

      res.json({
        data: logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/audit-logs/stats
   * Thống kê tổng quan audit logs
   */
  async getAuditLogStats(req, res, next) {
    try {
      // Tổng số log
      const [totalResult] = await db.query(
        "SELECT COUNT(*) as total FROM audit_logs"
      );

      // Log hôm nay
      const [todayResult] = await db.query(
        "SELECT COUNT(*) as total FROM audit_logs WHERE DATE(created_at) = CURDATE()"
      );

      // Lỗi client (4xx)
      const [clientErrors] = await db.query(
        "SELECT COUNT(*) as total FROM audit_logs WHERE status_code >= 400 AND status_code < 500"
      );

      // Lỗi server (5xx)
      const [serverErrors] = await db.query(
        "SELECT COUNT(*) as total FROM audit_logs WHERE status_code >= 500"
      );

      // Top 5 actions
      const [topActions] = await db.query(
        `SELECT action, COUNT(*) as count 
         FROM audit_logs 
         GROUP BY action 
         ORDER BY count DESC 
         LIMIT 5`
      );

      res.json({
        total: totalResult[0].total,
        today: todayResult[0].total,
        clientErrors: clientErrors[0].total,
        serverErrors: serverErrors[0].total,
        topActions,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/audit-logs/:id
   * Chi tiết một bản ghi audit log
   */
  async getAuditLogById(req, res, next) {
    try {
      const { id } = req.params;

      const [logs] = await db.query(
        `SELECT 
          al.*,
          d.name as department_name,
          jt.name as job_title_name,
          r.name as role_name,
          e.avatar_url as user_avatar
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN employees e ON al.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN job_titles jt ON e.job_title_id = jt.id
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE al.id = ?`,
        [id]
      );

      if (logs.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy bản ghi log" });
      }

      res.json(logs[0]);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = auditLogController;

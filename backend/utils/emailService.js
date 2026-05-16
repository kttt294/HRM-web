const transporter = require("../config/mail");

/**
 * EmailService - Dịch vụ gửi email tự động cho hệ thống HRM
 * 
 * Hỗ trợ gửi thông báo cho:
 * - Ứng viên: Lịch phỏng vấn, kết quả tuyển dụng
 * - Nhân viên: Duyệt/từ chối nghỉ phép, bảng lương mới
 */

const COMPANY_NAME = "HRM System - Phenikaa";
const FROM_EMAIL = `"${COMPANY_NAME}" <${process.env.EMAIL_USER}>`;

const emailService = {
  // ==================== PHƯƠNG THỨC CỐT LÕI ====================

  /**
   * Gửi email dạng HTML
   * @param {string} to - Địa chỉ email người nhận
   * @param {string} subject - Tiêu đề email
   * @param {string} html - Nội dung HTML
   * @returns {Promise<Object>} - Kết quả gửi mail
   */
  async sendMail(to, subject, html) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("[EmailService] Chưa cấu hình SMTP, bỏ qua gửi email.");
        return null;
      }

      const result = await transporter.sendMail({
        from: FROM_EMAIL,
        to,
        subject,
        html: emailService.wrapTemplate(subject, html),
      });

      console.log(`[EmailService] Đã gửi email tới ${to}: ${subject}`);
      return result;
    } catch (error) {
      console.error(`[EmailService] Lỗi gửi email tới ${to}:`, error.message);
      return null; // Không throw để không ảnh hưởng logic chính
    }
  },

  // ==================== TEMPLATE WRAPPER ====================

  /**
   * Bọc nội dung email trong template HTML chuyên nghiệp
   */
  wrapTemplate(title, bodyContent) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f7fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:24px 32px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:600;">${COMPANY_NAME}</h1>
        </div>
        <!-- Body -->
        <div style="padding:32px;">
          <h2 style="color:#1a1a2e;margin:0 0 20px;font-size:18px;">${title}</h2>
          ${bodyContent}
        </div>
        <!-- Footer -->
        <div style="background:#f8f9fc;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">
            Email này được gửi tự động từ hệ thống HRM. Vui lòng không trả lời email này.
          </p>
        </div>
      </div>
    </body>
    </html>`;
  },

  // ==================== EMAIL CHO ỨNG VIÊN ====================

  /**
   * Gửi thông báo lịch phỏng vấn cho ứng viên
   */
  async sendInterviewSchedule({ candidateEmail, candidateName, interviewDate, location, vacancyTitle, notes }) {
    const formattedDate = new Date(interviewDate).toLocaleString("vi-VN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh"
    });

    const html = `
      <p style="color:#333;line-height:1.6;">Xin chào <strong>${candidateName}</strong>,</p>
      <p style="color:#333;line-height:1.6;">
        Chúng tôi xin thông báo bạn đã được mời phỏng vấn cho vị trí <strong>${vacancyTitle || "đang tuyển"}</strong>.
      </p>
      <div style="background:#f0f4ff;border-left:4px solid #667eea;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
        <p style="margin:4px 0;color:#333;">📅 <strong>Thời gian:</strong> ${formattedDate}</p>
        <p style="margin:4px 0;color:#333;">📍 <strong>Địa điểm:</strong> ${location || "Sẽ được thông báo sau"}</p>
        ${notes ? `<p style="margin:4px 0;color:#333;">📝 <strong>Ghi chú:</strong> ${notes}</p>` : ""}
      </div>
      <p style="color:#333;line-height:1.6;">Vui lòng xác nhận tham dự bằng cách phản hồi email này.</p>
      <p style="color:#333;line-height:1.6;">Trân trọng,<br/><strong>Phòng Nhân sự</strong></p>
    `;

    return this.sendMail(candidateEmail, `Thư mời phỏng vấn - ${vacancyTitle || COMPANY_NAME}`, html);
  },

  /**
   * Gửi thông báo kết quả tuyển dụng cho ứng viên
   */
  async sendCandidateStatusUpdate({ candidateEmail, candidateName, status, vacancyTitle, notes }) {
    const statusMessages = {
      screening: { label: "Đang xét duyệt hồ sơ", color: "#f59e0b" },
      interviewing: { label: "Được mời phỏng vấn", color: "#3b82f6" },
      offered: { label: "Đã được gửi đề nghị (Offer)", color: "#10b981" },
      hired: { label: "Đã được tuyển dụng 🎉", color: "#059669" },
      rejected: { label: "Không được chọn cho vị trí này", color: "#ef4444" },
    };

    const statusInfo = statusMessages[status] || { label: status, color: "#6b7280" };

    const html = `
      <p style="color:#333;line-height:1.6;">Xin chào <strong>${candidateName}</strong>,</p>
      <p style="color:#333;line-height:1.6;">
        Chúng tôi xin thông báo về tình trạng ứng tuyển của bạn cho vị trí <strong>${vacancyTitle || "đang tuyển"}</strong>:
      </p>
      <div style="background:#f8f9fc;padding:16px;border-radius:8px;margin:16px 0;text-align:center;">
        <span style="display:inline-block;background:${statusInfo.color};color:#fff;padding:8px 20px;border-radius:20px;font-weight:600;">
          ${statusInfo.label}
        </span>
      </div>
      ${notes ? `<p style="color:#333;line-height:1.6;"><strong>Ghi chú:</strong> ${notes}</p>` : ""}
      ${status === 'hired' ? `
        <p style="color:#333;line-height:1.6;">
          🎉 Xin chúc mừng! Bạn sẽ sớm nhận được thông tin chi tiết về ngày bắt đầu làm việc.
        </p>
      ` : ""}
      ${status === 'rejected' ? `
        <p style="color:#333;line-height:1.6;">
          Chúng tôi trân trọng sự quan tâm của bạn và mong sẽ có cơ hội hợp tác trong tương lai.
        </p>
      ` : ""}
      <p style="color:#333;line-height:1.6;">Trân trọng,<br/><strong>Phòng Nhân sự</strong></p>
    `;

    return this.sendMail(candidateEmail, `Cập nhật trạng thái ứng tuyển - ${vacancyTitle || COMPANY_NAME}`, html);
  },

  // ==================== EMAIL CHO NHÂN VIÊN ====================

  /**
   * Gửi thông báo kết quả duyệt nghỉ phép
   */
  async sendLeaveStatusUpdate({ employeeEmail, employeeName, leaveType, startDate, endDate, status, approverName }) {
    const leaveTypeLabels = {
      annual: "Nghỉ phép năm",
      sick: "Nghỉ ốm",
      unpaid: "Nghỉ không lương",
      maternity: "Nghỉ thai sản",
      other: "Nghỉ khác",
    };

    const statusLabels = {
      approved: { label: "ĐÃ DUYỆT ✅", color: "#059669" },
      rejected: { label: "TỪ CHỐI ❌", color: "#ef4444" },
    };

    const statusInfo = statusLabels[status] || { label: status, color: "#6b7280" };

    const html = `
      <p style="color:#333;line-height:1.6;">Xin chào <strong>${employeeName}</strong>,</p>
      <p style="color:#333;line-height:1.6;">Đơn nghỉ phép của bạn đã được xử lý:</p>
      <div style="background:#f8f9fc;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:4px 0;color:#333;">📋 <strong>Loại phép:</strong> ${leaveTypeLabels[leaveType] || leaveType}</p>
        <p style="margin:4px 0;color:#333;">📅 <strong>Từ ngày:</strong> ${new Date(startDate).toLocaleDateString("vi-VN")}</p>
        <p style="margin:4px 0;color:#333;">📅 <strong>Đến ngày:</strong> ${new Date(endDate).toLocaleDateString("vi-VN")}</p>
        <p style="margin:4px 0;color:#333;">👤 <strong>Người duyệt:</strong> ${approverName || "N/A"}</p>
        <div style="text-align:center;margin-top:12px;">
          <span style="display:inline-block;background:${statusInfo.color};color:#fff;padding:8px 20px;border-radius:20px;font-weight:600;">
            ${statusInfo.label}
          </span>
        </div>
      </div>
      <p style="color:#333;line-height:1.6;">Trân trọng,<br/><strong>Phòng Nhân sự</strong></p>
    `;

    return this.sendMail(employeeEmail, `Kết quả đơn nghỉ phép - ${statusInfo.label}`, html);
  },

  /**
   * Gửi thông báo bảng lương mới cho nhân viên
   */
  async sendSalaryNotification({ employeeEmail, employeeName, month, year, netSalary }) {
    const formattedSalary = new Intl.NumberFormat("vi-VN", {
      style: "currency", currency: "VND"
    }).format(netSalary);

    const html = `
      <p style="color:#333;line-height:1.6;">Xin chào <strong>${employeeName}</strong>,</p>
      <p style="color:#333;line-height:1.6;">Bảng lương tháng <strong>${month}/${year}</strong> của bạn đã sẵn sàng.</p>
      <div style="background:#f0fdf4;border-left:4px solid #059669;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;text-align:center;">
        <p style="color:#333;margin:0 0 8px;font-size:14px;">Lương thực nhận:</p>
        <p style="color:#059669;margin:0;font-size:24px;font-weight:700;">${formattedSalary}</p>
      </div>
      <p style="color:#333;line-height:1.6;">Vui lòng đăng nhập hệ thống để xem chi tiết bảng lương.</p>
      <p style="color:#333;line-height:1.6;">Trân trọng,<br/><strong>Phòng Nhân sự</strong></p>
    `;

    return this.sendMail(employeeEmail, `Bảng lương tháng ${month}/${year}`, html);
  },

  /**
   * Gửi thông báo tài khoản mới cho nhân viên (khi onboard từ ứng viên)
   */
  async sendWelcomeEmail({ employeeEmail, employeeName, username, tempPassword }) {
    const html = `
      <p style="color:#333;line-height:1.6;">Xin chào <strong>${employeeName}</strong>,</p>
      <p style="color:#333;line-height:1.6;">🎉 Chào mừng bạn gia nhập đội ngũ! Tài khoản hệ thống của bạn đã được tạo:</p>
      <div style="background:#f0f4ff;border-left:4px solid #667eea;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
        <p style="margin:4px 0;color:#333;">👤 <strong>Tên đăng nhập:</strong> ${username}</p>
        <p style="margin:4px 0;color:#333;">🔑 <strong>Mật khẩu tạm:</strong> ${tempPassword}</p>
      </div>
      <p style="color:#e11d48;line-height:1.6;font-weight:600;">
        ⚠️ Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu!
      </p>
      <p style="color:#333;line-height:1.6;">Trân trọng,<br/><strong>Phòng Nhân sự</strong></p>
    `;

    return this.sendMail(employeeEmail, `Chào mừng bạn đến với ${COMPANY_NAME}!`, html);
  },
};

module.exports = emailService;

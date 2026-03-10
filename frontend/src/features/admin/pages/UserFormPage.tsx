import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreateUserDto } from "../models/user.model";
import { userApi } from "../services/user.api";
import { Role } from "../../../shared/constants/rbac";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { ROUTES } from "../../../shared/constants/routes";
import { useSnackbarStore } from "../../../store/snackbar.store";
import anime from "animejs";

/**
 * ============================================
 * USER FORM PAGE - Tạo tài khoản mới
 * ============================================
 */
export function UserFormPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbarStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateUserDto>({
    username: "",
    name: "",
    password: "",
    role: Role.ADMIN,
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  // Entry animation
  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current.querySelectorAll(".form-section"),
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        delay: anime.stagger(80),
        easing: "easeOutQuart",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    if (formData.password !== confirmPassword) {
      const msg = "Mật khẩu xác nhận không khớp";
      setError(msg);
      showSnackbar(msg, "error");
      return;
    }

    if (formData.password.length < 6) {
      const msg = "Mật khẩu phải có ít nhất 6 ký tự";
      setError(msg);
      showSnackbar(msg, "error");
      return;
    }

    if (!formData.username.match(/^[a-z0-9_]+$/)) {
      const msg = "Tên đăng nhập chỉ được chứa chữ thường, số và dấu gạch dưới";
      setError(msg);
      showSnackbar(msg, "error");
      return;
    }

    setLoading(true);
    try {
      await userApi.createUser(formData);
      setSuccess(true);
      showSnackbar("Tạo tài khoản thành công", "success");

      // Success animation
      anime({
        targets: containerRef.current,
        scale: [1, 0.98, 1],
        duration: 300,
        easing: "easeInOutQuad",
      });

      // Redirect after 1.5s
      setTimeout(() => {
        navigate(ROUTES.ADMIN_USERS);
      }, 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Lỗi tạo tài khoản";
      setError(msg);
      showSnackbar(msg, "error");
    } finally {
      setLoading(false);
    }
  };



  if (success) {
    return (
      <div
        ref={containerRef}
        style={{ textAlign: "center", padding: "60px 20px" }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 24px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "40px", color: "white" }}>✓</span>
        </div>
        <h2>Tạo tài khoản thành công!</h2>
        <p style={{ color: "#757575", marginTop: "8px" }}>
          Đang chuyển về danh sách tài khoản...
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ maxWidth: "800px", margin: "0 auto" }}>




      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
            padding: "40px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative Top Line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "linear-gradient(90deg, #1565c0, #42a5f5)",
            }}
          />

          {error && (
            <div
              className="form-section"
              style={{
                padding: "16px 20px",
                background: "#ffebee",
                color: "#c62828",
                borderRadius: "12px",
                marginBottom: "32px",
                fontSize: "14px",
                opacity: 0,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: "1px solid #ffcdd2",
              }}
            >
              <span style={{ fontSize: "20px" }}>⚠️</span>
              {error}
            </div>
          )}

          {/* Account Info Section */}
          <div className="form-section" style={{ opacity: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                Thông tin cơ bản
              </h3>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <Input
                  label="Họ và tên"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  style={{ height: "48px", fontSize: "15px" }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <Input
                  label="Tên đăng nhập"
                  placeholder="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value.toLowerCase(),
                    })
                  }
                  required
                  style={{ height: "48px", fontSize: "15px" }}
                />
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9e9e9e",
                    marginTop: "6px",
                    paddingLeft: "4px",
                  }}
                >
                  a-z, 0-9 và gạch dưới
                </p>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#455a64' }}>
                  Vai trò hệ thống
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  style={{
                    width: '100%',
                    height: '48px',
                    padding: '0 16px',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1565c0'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                >
                  <option value={Role.ADMIN}>System Admin</option>
                  <option value={Role.HR}>HR Manager</option>
                  <option value={Role.MANAGER}>Trưởng phòng (Manager)</option>
                  <option value={Role.EMPLOYEE}>Nhân viên</option>
                </select>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div
            className="form-section"
            style={{ marginTop: "40px", opacity: 0 }}
          >            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                style={{ height: "48px", fontSize: "15px" }}
              />

              <Input
                label="Xác nhận mật khẩu"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ height: "48px", fontSize: "15px" }}
              />
            </div>
          </div>



          {/* Actions */}
          <div
            className="form-section"
            style={{
              marginTop: "40px",
              display: "flex",
              gap: "16px",
              justifyContent: "flex-end",
              opacity: 0,
              paddingTop: "24px",
              border: "none",
              boxShadow: "none",
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(ROUTES.ADMIN_USERS)}
              style={{
                padding: "8px 20px",
                height: "40px"
              }}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{
                padding: "8px 20px",
                height: "40px",
              }}
            >
              {loading ? "Đang xử lý..." : "Tạo tài khoản"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

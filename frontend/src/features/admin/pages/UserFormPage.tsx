import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreateUserDto } from "../models/user.model";
import { userApi } from "../services/user.api";
import { Role } from "../../../shared/constants/rbac";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { ROUTES } from "../../../shared/constants/routes";
import anime from "animejs";

/**
 * ============================================
 * USER FORM PAGE - Tạo tài khoản mới
 * ============================================
 */
export function UserFormPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

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
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!formData.username.match(/^[a-z0-9_]+$/)) {
      setError("Tên đăng nhập chỉ được chứa chữ thường, số và dấu gạch dưới");
      return;
    }

    setLoading(true);
    try {
      await userApi.createUser(formData);
      setSuccess(true);

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
      setError(err instanceof Error ? err.message : "Lỗi tạo tài khoản");
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


      {/* Header */}
      <div className="page-header form-section" style={{ opacity: 0 }}>
        <div className="page-title-section">
          <h1>Tạo tài khoản Admin</h1>
          <p className="page-subtitle">Thiết lập tài khoản quản trị mới cho hệ thống</p>
        </div>
      </div>

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

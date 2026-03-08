import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "../../../shared/constants/routes";
import { getDefaultRoute } from "../../../shared/constants/rbac";
import { useAuthStore } from "../../../store/auth.store";
import anime from "animejs";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    ROUTES.HOME;

  // Entry animation
  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 500,
        easing: "easeOutQuart",
      });

      anime({
        targets: containerRef.current.querySelectorAll(".animate-item"),
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        delay: anime.stagger(80, { start: 200 }),
        easing: "easeOutQuart",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(formData.username, formData.password);
    if (success) {
      // Lấy user sau khi login thành công
      const currentUser = useAuthStore.getState().user;
      
      // Redirect đến trang phù hợp với role, hoặc trang đã lưu trước đó
      const destination = from !== ROUTES.HOME ? from : (currentUser ? getDefaultRoute(currentUser.role) : ROUTES.HOME);
      
      console.log('[LoginPage] Login successful, redirecting to:', destination);
      
      // Exit animation trước khi navigate
      anime({
        targets: containerRef.current,
        opacity: [1, 0],
        scale: [1, 0.95],
        duration: 300,
        easing: "easeInQuart",
        complete: () => navigate(destination, { replace: true }),
      });
    } else {
      // Shake animation khi login thất bại
      anime({
        targets: formRef.current,
        translateX: [0, -10, 10, -10, 10, 0],
        duration: 400,
        easing: "easeInOutQuad",
      });
    }
  };

  return (
    <div className="login-page">
      <div
        ref={containerRef}
        className="login-container"
        style={{ opacity: 0 }}
      >
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img
            src="/favicon.png"
            alt="Logo"
            style={{ width: "66px", height: "66px", marginBottom:"16px" }}
          />
        </div>


        <h1 className="animate-item" style={{ opacity: 0, marginBottom: '60px', color: '#000000ff' }}>
          Hệ Thống Quản Lý Nhân Sự
        </h1>

        {error && (
          <div className="error-alert animate-item" style={{ opacity: 0 }}>
            {error}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="animate-item" style={{ opacity: 0 }}>
            <Input
              label="Tên đăng nhập"
              name="username"
              placeholder="Nhập tên đăng nhập"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>

          <div className="animate-item" style={{ opacity: 0 }}>
            <Input
              type="password"
              label="Mật khẩu"
              name="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <div
            className="animate-item"
            style={{ marginTop: "24px", opacity: 0 }}
          >
            <Button
              type="submit"
              disabled={isLoading}
              style={{ width: "100%" }}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </div>
        </form>

        {/* Hướng dẫn đăng nhập */}
        <div
          className="animate-item"
          style={{
            marginTop: "60px",
            paddingTop: "24px",
            borderTop: "1px solid #e0e0e0",
            opacity: 0,
          }}
        >
        </div>
      </div>
    </div>
  );
}

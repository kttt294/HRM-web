import { NavLink, useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { ROUTES } from "../../shared/constants/routes";
import { useUIStore } from "../../store/ui.store";
import { useAuthStore } from "../../store/auth.store";
import { usePermissions, ShowForRoles } from "../guards/PermissionGuard";
import { Role } from "../../shared/constants/rbac";
import anime from "animejs";

import { authFetch } from "../../utils/auth-fetch";

/**
 * ============================================
 * SIDEBAR WITH ROLE-BASED MENU + ANIMATIONS
 * ============================================
 */
export function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const { isAdmin, isHR, isManager, isEmployee } = usePermissions();
  const sidebarRef = useRef<HTMLElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasAssignedVacancies, setHasAssignedVacancies] = useState(false);

  // Kiểm tra xem nhân viên có phụ trách vacancy nào không
  useEffect(() => {
    if (isEmployee && !isHR && !isAdmin) {
      authFetch("/api/recruitment/vacancies")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.length > 0) setHasAssignedVacancies(true);
        })
        .catch(() => setHasAssignedVacancies(false));
    }
  }, [isEmployee, isHR, isAdmin]);

  // Entry animation
  useEffect(() => {
    if (sidebarRef.current) {
      anime({
        targets: sidebarRef.current.querySelectorAll(".menu-section"),
        opacity: [0, 1],
        translateX: [-20, 0],
        duration: 400,
        delay: anime.stagger(60),
        easing: "easeOutQuart",
      });
    }
  }, []);

  return (
    <>
      {/* Overlay backdrop cho mobile */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      <aside
        ref={sidebarRef}
        id="app-sidebar"
        className={isSidebarOpen ? "open" : "closed"}
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Sidebar Header: Nút đóng + Tiêu đề */}
        <div style={{ paddingBottom: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 16px 4px 16px",
              gap: "10px",
            }}
          >
            <button
              onClick={closeSidebar}
              className="sidebar-close-btn"
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.6)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "white";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <span
              className="menu-section-title"
              style={{ padding: 0, fontSize: "13.5px", marginTop: "2px" }}
            >
              BẢNG ĐIỀU KHIỂN
            </span>
          </div>
          {/* Đường kẻ ngang chỉ dưới phần chữ, không qua nút X */}
          <div
            style={{
              height: "1px",
              background: "rgba(255, 255, 255, 0.35)",
              marginLeft: "54px",
              marginRight: "30px",
            }}
          />
        </div>

        <nav
          className="main-menu"
          style={{ flex: 1, overflowY: "auto", paddingTop: "10px" }}
        >
          <ul>
            {/* ============================
                            ADMIN MENU - Quản lý hệ thống
                        ============================ */}
            <ShowForRoles roles={[Role.ADMIN]}>
              <li className="menu-section" style={{ opacity: 0 }}>
                <span className="menu-section-title">
                  <span
                    className="menu-indicator"
                    style={{ background: "#f44336" }}
                  />
                  <span className="menu-text">Quản lý hệ thống</span>
                </span>
                <ul className="submenu">
                  <li>
                    <NavLink to="/admin/users" end>
                      <span className="menu-text">Tài khoản người dùng</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={ROUTES.ADMIN_EMPLOYEES} end>
                      <span className="menu-text">Danh sách nhân viên</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/admin/users/new">
                      <span className="menu-text">Tạo tài khoản mới</span>
                    </NavLink>
                  </li>
                </ul>
              </li>
            </ShowForRoles>

            {/* ============================
                            HR MENU - Quản lý nhân sự
                        ============================ */}
            <ShowForRoles roles={[Role.HR]}>
              <li className="menu-section" style={{ opacity: 0 }}>
                <span className="menu-section-title">
                  <span
                    className="menu-indicator"
                    style={{ background: "#4caf50" }}
                  />
                  <span className="menu-text">Quản lý nhân sự</span>
                </span>
                <ul className="submenu">
                  <li>
                    <NavLink to={ROUTES.EMPLOYEES} end>
                      <span className="menu-text">Danh sách nhân viên</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={ROUTES.EMPLOYEE_NEW}>
                      <span className="menu-text">Thêm nhân viên</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={ROUTES.EMPLOYEE_VERIFICATION}>
                      <span className="menu-text">Duyệt hồ sơ nhân viên</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={ROUTES.DEPARTMENTS} end>
                      <span className="menu-text">Phòng ban</span>
                    </NavLink>
                  </li>
                </ul>
              </li>

              <li className="menu-section" style={{ opacity: 0 }}>
                <span className="menu-section-title">
                  <span
                    className="menu-indicator"
                    style={{ background: "#ff9800" }}
                  />
                  <span className="menu-text">Quản lý tuyển dụng</span>
                </span>
                <ul className="submenu">
                  <li>
                    <NavLink to={ROUTES.RECRUITMENT} end>
                      <span className="menu-text">Tổng quan</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={ROUTES.VACANCIES} end>
                      <span className="menu-text">Vị trí tuyển dụng</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={ROUTES.CANDIDATES} end>
                      <span className="menu-text">Ứng viên</span>
                    </NavLink>
                  </li>
                </ul>
              </li>

              <li className="menu-section" style={{ opacity: 0 }}>
                <span className="menu-section-title">
                  <span
                    className="menu-indicator"
                    style={{ background: "#00bcd4" }}
                  />
                  <span className="menu-text">Nghỉ phép & Lương</span>
                </span>
                <ul className="submenu">
                  <li>
                    <NavLink to={ROUTES.LEAVE_MANAGEMENT}>
                      <span className="menu-text">Quản lý nghỉ phép</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={ROUTES.PAYROLL_LIST}>
                      <span className="menu-text">Bảng lương</span>
                    </NavLink>
                  </li>
                </ul>
              </li>
            </ShowForRoles>

            {/* ============================
                            MANAGER MENU - Quản lý phòng ban
                        ============================ */}
            <ShowForRoles roles={[Role.MANAGER]}>
              <li className="menu-section" style={{ opacity: 0 }}>
                <span className="menu-section-title">
                  <span
                    className="menu-indicator"
                    style={{ background: "#2196f3" }}
                  />
                  <span className="menu-text">Quản lý phòng ban</span>
                </span>
                <ul className="submenu">
                  <li>
                    <NavLink to="/dept/employees">
                      <span className="menu-text">Nhân viên phòng ban</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/dept/verification">
                      <span className="menu-text">Duyệt hồ sơ nhân viên</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/dept/leaves">
                      <span className="menu-text">Duyệt nghỉ phép</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/dept/payroll">
                      <span className="menu-text">Bảng lương phòng ban</span>
                    </NavLink>
                  </li>
                </ul>
              </li>
            </ShowForRoles>

            {/* ============================
                            EMPLOYEE MENU - Cá nhân
                        ============================ */}
            <ShowForRoles
              roles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE]}
            >
              <li className="menu-section" style={{ opacity: 0 }}>
                <span className="menu-section-title">
                  <span
                    className="menu-indicator"
                    style={{ background: "#9c27b0" }}
                  />
                  <span className="menu-text">Cá nhân</span>
                </span>
                <ul className="submenu">
                  <li>
                    <NavLink to={ROUTES.MY_PROFILE}>
                      <span className="menu-text">Thông tin của tôi</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={ROUTES.MY_LEAVES}>
                      <span className="menu-text">Yêu cầu nghỉ phép</span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={ROUTES.MY_PAYROLL}>
                      <span className="menu-text">Bảng lương của tôi</span>
                    </NavLink>
                  </li>
                  {hasAssignedVacancies && (
                    <li>
                      <NavLink to={ROUTES.MY_VACANCIES}>
                        <span className="menu-text">
                          Tuyển dụng tôi phụ trách
                        </span>
                      </NavLink>
                    </li>
                  )}
                </ul>
              </li>
            </ShowForRoles>
          </ul>
        </nav>

        <div className="sidebar-footer" style={{ marginTop: "auto" }}>
          {/* Role indicator */}
          <div
            style={{
              padding: "8px 10px",
              margin: "0 12px 10px 12px",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1.5px solid rgba(255, 255, 255, 0.7)",
              borderRadius: "8px",
              fontSize: "9.7px",
              color: "#ffffff",
              textAlign: "center",
              fontWeight: "400",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            {isAdmin && "System Admin"}
            {isHR && "HR Manager"}
            {isManager && "Trưởng phòng"}
            {isEmployee && !isManager && "Nhân viên"}
          </div>

          {/* Logout Button */}
          <div
            style={{
              padding: "0 12px",
              marginBottom: "16px",
            }}
          >
            <button
              className="logout-btn"
              onClick={() => {
                setIsLoggingOut(true);
                anime({
                  targets: sidebarRef.current,
                  opacity: [1, 0],
                  translateX: [0, -50],
                  duration: 500,
                  easing: "easeInQuart",
                  complete: () => {
                    logout();
                    navigate(ROUTES.HOME);
                  },
                });
              }}
              disabled={isLoggingOut}
              style={{
                width: "100%",
                padding: "10px",
                background: "transparent",
                border: "1.5px solid rgba(255, 255, 255, 0.7)",
                borderRadius: "12px",
                color: "#ffffff",
                fontSize: "12.3px",
                fontWeight: 400,
                cursor: isLoggingOut ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.3s ease",
                opacity: isLoggingOut ? 0.7 : 1,
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                if (!isLoggingOut) {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)";
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 15px rgba(239, 68, 68, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoggingOut) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {isLoggingOut ? (
                <>
                  <div className="logout-spinner" />
                  <span>Đang đăng xuất...</span>
                </>
              ) : (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Đăng xuất</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

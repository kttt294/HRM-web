import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/auth.store";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { employeeApi } from "../services/employee.api";
import { departmentApi } from "../../hr/services/department.api";
import { Employee } from "../models/employee.model";
import { Department } from "../../hr/models/department.model";
import {
  GENDER_LABELS,
  GENDER_OPTIONS,
  Gender,
  EMPLOYEE_STATUS_LABELS,
  EmployeeStatus,
  EMPLOYEE_TYPE_LABELS,
  EmployeeType,
} from "../constants/employeeStatus";
import { Select } from "../../../components/ui/Select";
import { formatDate } from "../../../shared/utils/date.util";
import anime from "animejs";
import { useSnackbarStore } from "../../../store/snackbar.store";

/**
 * ============================================
 * MY PROFILE PAGE - Employee Self-Service
 * ============================================
 */

export function MyProfilePage() {
  const { user } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    nationalId: '',
    address: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbarStore();

  // Data from API
  const [profile, setProfile] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [supervisorName, setSupervisorName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const depts = await departmentApi.getAll();
        setDepartments(depts);

        // Fetch employee profile using /me endpoint
        const emp = await employeeApi.getMe();
        setProfile(emp);

        // Resolve supervisor name
        if (emp.supervisorId) {
          try {
            const sup = await employeeApi.getById(emp.supervisorId);
            setSupervisorName(sup.fullName);
          } catch {
            setSupervisorName(emp.supervisorId);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Page load animation
  useEffect(() => {
    if (pageRef.current && !isLoading) {
      anime({
        targets: pageRef.current.querySelectorAll(".animate-item"),
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: anime.stagger(100),
        easing: "easeOutQuart",
      });
    }
  }, [isLoading]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleButtonHover = (
    e: React.MouseEvent<HTMLButtonElement>,
    isEnter: boolean,
  ) => {
    anime({
      targets: e.currentTarget,
      scale: isEnter ? 1.02 : 1,
      duration: 200,
      easing: "easeOutQuad",
    });
  };

  // Helper: resolve department name
  const getDepartmentName = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept?.name || deptId;
  };

  // Helper: resolve gender label
  const getGenderLabel = (gender: string) => {
    return GENDER_LABELS[gender as Gender] || gender;
  };

  // Helper: resolve status label
  const getStatusLabel = (status: string) => {
    return EMPLOYEE_STATUS_LABELS[status as EmployeeStatus] || status;
  };

  // Helper: resolve employee type label
  const getEmployeeTypeLabel = (type: string) => {
    return EMPLOYEE_TYPE_LABELS[type as EmployeeType] || type;
  };

  // Helper: format salary
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleEditPersonal = () => {
    if (profile) {
      // Convert ISO date to YYYY-MM-DD for <input type="date">
      let dob = '';
      if (profile.dateOfBirth) {
        try {
          dob = new Date(profile.dateOfBirth).toISOString().split('T')[0];
        } catch {
          dob = '';
        }
      }
      setEditForm({
        fullName: profile.fullName || '',
        dateOfBirth: dob,
        gender: profile.gender || '',
        nationalId: profile.nationalId || '',
        address: profile.address || '',
        phone: profile.phone || '',
      });
    }
    setIsEditingPersonal(true);
  };

  const handleCancelEdit = () => {
    setIsEditingPersonal(false);
  };

  const handleSavePersonal = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      console.log('Saving personal info:', editForm);
      const updated = await employeeApi.updateMe(editForm);
      console.log('Update success:', updated);
      setProfile(updated);
      setIsEditingPersonal(false);
      showSnackbar("Cập nhật thông tin thành công!", "success");
    } catch (err) {
      console.error('Failed to update profile:', err);
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      showSnackbar(`Cập nhật thất bại: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile?.fullName || user?.name || "Nhân viên";
  const displayStatus = profile ? getStatusLabel(profile.status) : "";
  const displayId = profile?.id || "";

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <p style={{ color: "#757575" }}>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div ref={pageRef}>
      {/* Page Header */}
      <div className="page-header animate-item" style={{ opacity: 0 }}>
        <div className="page-title-section">
          <nav className="breadcrumb">
            <a href="/">Trang chủ</a>
            <span className="breadcrumb-separator">/</span>
            <span>Thông tin cá nhân</span>
          </nav>
          <h1>Thông tin cá nhân</h1>
          <p className="page-subtitle">
            Xem thông tin và cập nhật liên hệ của bạn
          </p>
        </div>
      </div>

      {/* ============================================
                PROFILE HEADER - Avatar + Basic Info
            ============================================ */}
      <div
        className="card animate-item"
        style={{ marginBottom: "24px", opacity: 0 }}
      >
        <div className="card-body">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            {/* Avatar */}
            <div
              className="profile-avatar"
              style={{
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "32px",
                fontWeight: "600",
                flexShrink: 0,
                boxShadow: "0 8px 24px rgba(25, 118, 210, 0.3)",
              }}
            >
              {getInitials(displayName)}
            </div>

            {/* Basic info */}
            <div style={{ flex: 1, minWidth: "200px" }}>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  marginBottom: "4px",
                  color: "#212121",
                }}
              >
                {displayName}
              </h2>
              <p
                style={{
                  color: "#757575",
                  marginBottom: "12px",
                  fontSize: "15px",
                }}
              >
                {profile?.jobTitle ? `${profile.jobTitle} — ` : ""}
                {profile ? getDepartmentName(profile.departmentId) : ""}
                {profile?.employeeType
                  ? ` • ${getEmployeeTypeLabel(profile.employeeType)}`
                  : ""}
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                {displayStatus && (
                  <span className="status-badge status-active">
                    {displayStatus}
                  </span>
                )}
                {displayId && (
                  <span
                    style={{
                      color: "#9e9e9e",
                      fontSize: "13px",
                      padding: "4px 12px",
                      background: "#f5f5f5",
                      borderRadius: "20px",
                    }}
                  >
                    {displayId}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexShrink: 0,
              }}
            >
              <Button
                variant="secondary"
                onClick={() => setShowPasswordModal(true)}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Đổi mật khẩu
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
                TWO COLUMN LAYOUT
            ============================================ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "24px",
        }}
      >
        {/* THÔNG TIN CÁ NHÂN */}
        <div className="card animate-item" style={{ opacity: 0 }}>
          <div
            className="card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>Thông tin cá nhân</h3>
            {!isEditingPersonal && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleEditPersonal}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Sửa thông tin
              </Button>
            )}
          </div>
          <div className="card-body">
            {isEditingPersonal ? (
              <div style={{ display: "grid", gap: "16px" }}>
                <Input
                  label="Họ và tên"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
                <Input
                  type="date"
                  label="Ngày sinh"
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                />
                <Select
                  label="Giới tính"
                  options={GENDER_OPTIONS}
                  placeholder="Chọn giới tính"
                  value={editForm.gender}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                />
                <Input
                  label="Số CCCD"
                  value={editForm.nationalId}
                  onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })}
                />
                <Input
                  label="Địa chỉ"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
                <Input
                  label="Số điện thoại"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <Button onClick={handleSavePersonal} disabled={isSaving}>
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                  <Button variant="secondary" onClick={handleCancelEdit} disabled={isSaving}>
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "20px" }}>
                <InfoRow
                  label="Họ và tên"
                  value={profile?.fullName || "—"}
                  color="#1976d2"
                />
                <InfoRow
                  label="Ngày sinh"
                  value={
                    profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : "—"
                  }
                  color="#7c4dff"
                />
                <InfoRow
                  label="Giới tính"
                  value={profile?.gender ? getGenderLabel(profile.gender) : "—"}
                  color="#00bcd4"
                />
                <InfoRow
                  label="CCCD"
                  value={profile?.nationalId || "—"}
                  color="#ff9800"
                />
                <InfoRow
                  label="Địa chỉ"
                  value={profile?.address || "—"}
                  color="#9c27b0"
                />
                <InfoRow
                  label="Số điện thoại"
                  value={profile?.phone || "—"}
                  color="#4caf50"
                />
              </div>
            )}
          </div>
        </div>

        {/* THÔNG TIN CÔNG VIỆC */}
        <div className="card animate-item" style={{ opacity: 0 }}>
          <div
            className="card-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3>Thông tin công việc</h3>
            <span
              style={{
                fontSize: "11px",
                color: "#757575",
                background: "#f5f5f5",
                padding: "4px 10px",
                borderRadius: "12px",
                fontWeight: "500",
              }}
            >
              Do HR quản lý
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gap: "20px" }}>
              <InfoRow
                label="Mã nhân viên"
                value={profile?.id || "—"}
                color="#1976d2"
              />
              <InfoRow
                label="Phòng ban"
                value={
                  profile?.departmentId
                    ? getDepartmentName(profile.departmentId)
                    : "—"
                }
                color="#7c4dff"
              />
              <InfoRow
                label="Chức danh"
                value={profile?.jobTitle || "—"}
                color="#e040fb"
              />
              <InfoRow
                label="Quản lý trực tiếp"
                value={supervisorName || "—"}
                color="#00bcd4"
              />
              <InfoRow
                label="Ngày vào làm"
                value={profile?.hireDate ? formatDate(profile.hireDate) : "—"}
                color="#4caf50"
              />
              <InfoRow
                label="Trạng thái"
                value={profile?.status ? getStatusLabel(profile.status) : "—"}
                color="#ff9800"
              />
              <InfoRow
                label="Lương cơ bản"
                value={
                  profile?.baseSalary ? formatCurrency(profile.baseSalary) : "—"
                }
                color="#e91e63"
              />
              <InfoRow
                label="Phụ cấp"
                value={
                  profile?.allowance ? formatCurrency(profile.allowance) : "—"
                }
                color="#607d8b"
              />
              <InfoRow
                label="Loại hình"
                value={
                  profile?.employeeType
                    ? getEmployeeTypeLabel(profile.employeeType)
                    : "—"
                }
                color="#795548"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
                QUICK LINKS
            ============================================ */}
      <div
        className="card animate-item"
        style={{ marginTop: "24px", opacity: 0 }}
      >
        <div className="card-header">
          <h3>Truy cập nhanh</h3>
        </div>
        <div className="card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            <QuickLink
              title="Yêu cầu nghỉ phép"
              description="Gửi đơn xin nghỉ"
              color="#4caf50"
              href="/my-leaves"
            />
            <QuickLink
              title="Bảng lương"
              description="Xem lịch sử lương"
              color="#1976d2"
              href="/my-payroll"
            />
          </div>
        </div>
      </div>

      {/* PASSWORD MODAL */}
      {showPasswordModal && (
        <AnimatedModal
          title="Đổi mật khẩu"
          onClose={() => setShowPasswordModal(false)}
        >
          <div style={{ display: "grid", gap: "16px" }}>
            <Input label="Mật khẩu hiện tại" type="password" />
            <Input label="Mật khẩu mới" type="password" />
            <Input label="Xác nhận mật khẩu mới" type="password" />
            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <Button onClick={() => setShowPasswordModal(false)}>
                Đổi mật khẩu
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Hủy
              </Button>
            </div>
          </div>
        </AnimatedModal>
      )}
    </div>
  );
}

/* ============================================
   HELPER COMPONENTS
   ============================================ */

function InfoRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleHover = (isEnter: boolean) => {
    if (rowRef.current) {
      anime({
        targets: rowRef.current,
        translateX: isEnter ? 4 : 0,
        duration: 200,
        easing: "easeOutQuad",
      });
    }
  };

  return (
    <div
      ref={rowRef}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        cursor: "default",
      }}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      <div
        style={{
          width: "4px",
          height: "100%",
          minHeight: "40px",
          background: color,
          borderRadius: "2px",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "12px",
            color: "#9e9e9e",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            fontWeight: "500",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "#212121",
            fontWeight: "500",
            lineHeight: "1.4",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  title,
  description,
  color,
  href,
}: {
  title: string;
  description: string;
  color: string;
  href?: string;
}) {
  const navigate = useNavigate();
  const linkRef = useRef<HTMLDivElement>(null);

  const handleHover = (isEnter: boolean) => {
    if (linkRef.current) {
      anime({
        targets: linkRef.current,
        translateY: isEnter ? -2 : 0,
        scale: isEnter ? 1.02 : 1,
        boxShadow: isEnter
          ? "0 6px 20px rgba(0,0,0,0.1)"
          : "0 0 0 rgba(0,0,0,0)",
        duration: 200,
        easing: "easeOutQuad",
      });
    }
  };

  const handleClick = () => {
    if (href) navigate(href);
  };

  return (
    <div
      ref={linkRef}
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        background: "#fafafa",
        borderRadius: "12px",
        cursor: "pointer",
        borderLeft: `4px solid ${color}`,
      }}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: color,
          }}
        />
      </div>
      <div>
        <div
          style={{
            fontWeight: "600",
            fontSize: "14px",
            color: "#212121",
            marginBottom: "2px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#757575",
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}

function AnimatedModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    anime({
      targets: overlayRef.current,
      opacity: [0, 1],
      duration: 200,
      easing: "easeOutQuad",
    });
    anime({
      targets: contentRef.current,
      opacity: [0, 1],
      scale: [0.9, 1],
      translateY: [-30, 0],
      duration: 400,
      easing: "easeOutBack",
    });
  }, []);

  const handleClose = () => {
    anime({
      targets: contentRef.current,
      opacity: [1, 0],
      scale: [1, 0.9],
      duration: 200,
      easing: "easeInQuad",
    });
    anime({
      targets: overlayRef.current,
      opacity: [1, 0],
      duration: 250,
      easing: "easeInQuad",
      complete: onClose,
    });
  };

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={(e) => e.target === overlayRef.current && handleClose()}
      style={{ opacity: 0 }}
    >
      <div ref={contentRef} className="modal-content" style={{ opacity: 0 }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            className="modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

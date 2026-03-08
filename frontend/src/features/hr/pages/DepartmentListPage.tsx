import { useState, useEffect, useRef } from "react";
import { departmentApi } from "../services/department.api";
import { Department } from "../models/department.model";
import { Button } from "../../../components/ui/Button";
import anime from "animejs";
import { useSnackbarStore } from "../../../store/snackbar.store";

/**
 * ============================================
 * DEPARTMENT LIST PAGE - HR
 * ============================================
 * Quản lý danh sách phòng ban
 */

export function DepartmentListPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string | null;
  }>({
    isOpen: false,
    id: null,
  });
  const { showSnackbar } = useSnackbarStore();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const result = await departmentApi.getAll();
      setDepartments(result);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await fetchDepartments();
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      anime({
        targets: containerRef.current.querySelectorAll(".department-row"),
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        delay: anime.stagger(50),
        easing: "easeOutQuart",
      });
    }
  }, [loading, departments]);

  const handleAdd = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.id) {
      try {
        await departmentApi.delete(deleteConfirm.id);
        fetchDepartments();
        showSnackbar("Xóa phòng ban thành công", "success");
      } catch (error) {
        showSnackbar(
          error instanceof Error ? error.message : "Xóa phòng ban thất bại", 
          "error"
        );
      }
    }
    setDeleteConfirm({ isOpen: false, id: null });
  };

  const handleSave = async (data: Omit<Department, "id" | "createdAt">) => {
    try {
      if (editingDepartment) {
        await departmentApi.update(editingDepartment.id, data);
        showSnackbar("Cập nhật phòng ban thành công", "success");
      } else {
        await departmentApi.create(data);
        showSnackbar("Thêm phòng ban thành công", "success");
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (error) {
       showSnackbar(
        error instanceof Error ? error.message : "Lỗi lưu phòng ban", 
        "error"
      );
    }
  };

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div className="page-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            width: "100%",
          }}
        >
          <div>
            <h1>Quản lý phòng ban</h1>
            <p className="page-subtitle">
              Danh sách các phòng ban trong công ty
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Button onClick={handleAdd}>Thêm phòng ban</Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <div
          style={{
            padding: "20px 28px",
            background: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)",
            borderRadius: "16px",
            color: "white",
            minWidth: "180px",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "4px" }}>
            Tổng phòng ban
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700" }}>
            {departments.length}
          </div>
        </div>
      </div>

      {/* Department Table */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#757575" }}
          >
            Đang tải...
          </div>
        ) : departments.length === 0 ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#757575" }}
          >
            Không có phòng ban nào
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Tên phòng ban
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Mô tả
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Địa chỉ
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "13px",
                    width: "150px",
                  }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr
                  key={dept.id}
                  className="department-row"
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    opacity: 0,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fafafa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: "500", color: "#1976d2" }}>
                      {dept.name}
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#616161" }}>
                    {dept.description}
                  </td>
                  <td style={{ padding: "14px 16px", color: "#616161" }}>
                    {dept.location}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(dept)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(dept.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <DepartmentModal
          department={editingDepartment}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Confirm Delete Modal */}
      {deleteConfirm.isOpen && (
        <ConfirmModal
          message="Bạn có chắc muốn xóa phòng ban này?"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
        />
      )}
    </div>
  );
}

function DepartmentModal({
  department,
  onClose,
  onSave,
}: {
  department: Department | null;
  onClose: () => void;
  onSave: (data: Omit<Department, "id" | "createdAt">) => void;
}) {
  const [name, setName] = useState(department?.name || "");
  const [description, setDescription] = useState(department?.description || "");
  const [location, setLocation] = useState(department?.location || "");
  const { showSnackbar } = useSnackbarStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showSnackbar("Vui lòng nhập tên phòng ban", "warning");
      return;
    }
    onSave({ name, description, location });
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "500px",
          width: "90%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>
            {department ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#757575",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Tên phòng ban *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên phòng ban"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả về phòng ban"
              rows={3}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "14px",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Địa chỉ
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Nhập địa chỉ"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <Button type="button" variant="secondary" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">
              {department ? "Lưu thay đổi" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "400px",
          width: "90%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "16px",
          }}
        >
          ⚠️
        </div>
        <h3
          style={{
            margin: "0 0 16px",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          Xác nhận
        </h3>
        <p
          style={{
            margin: "0 0 24px",
            color: "#616161",
            fontSize: "14px",
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Button variant="secondary" onClick={onCancel}>
            Hủy
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Xóa
          </Button>
        </div>
      </div>
    </div>
  );
}

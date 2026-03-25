import { useState, useEffect, useRef } from "react";
import { Button } from "../../../components/ui/Button";
import { authFetch } from "../../../utils/auth-fetch";
import { useSnackbarStore } from "../../../store/snackbar.store";
import anime from "animejs";

/**
 * ============================================
 * DEGREES MANAGE PAGE - HR
 * ============================================
 * Quản lý enum values: degree_classification & certificate_type
 */

const ENUM_COLUMNS = {
  degree_classification: { label: "Xếp loại bằng cấp", color: "#7c4dff" },
  certificate_type: { label: "Chứng chỉ ngoại ngữ", color: "#0097a7" },
};

async function getEnumValues(column: string): Promise<string[]> {
  const res = await authFetch(`/api/employee-degrees/enums/values?column=${column}`);
  if (!res.ok) throw new Error("Không thể lấy danh sách enum");
  const data = await res.json();
  return data.values || [];
}

async function addEnumValue(column: string, newValue: string): Promise<string[]> {
  const res = await authFetch("/api/employee-degrees/enums/add", {
    method: "POST",
    body: JSON.stringify({ column, newValue }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Thêm thất bại");
  }
  const data = await res.json();
  return data.new_values || [];
}

async function updateEnumValue(column: string, oldValue: string, newValue: string): Promise<string[]> {
  const res = await authFetch("/api/employee-degrees/enums/update", {
    method: "PUT",
    body: JSON.stringify({ column, oldValue, newValue }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Cập nhật thất bại");
  }
  const data = await res.json();
  return data.new_values || [];
}

async function deleteEnumValue(column: string, valueToDelete: string): Promise<string[]> {
  const res = await authFetch("/api/employee-degrees/enums/delete", {
    method: "DELETE",
    body: JSON.stringify({ column, valueToDelete }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Xóa thất bại");
  }
  const data = await res.json();
  return data.new_values || [];
}

export function DegreesManagePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [enumData, setEnumData] = useState<Record<string, string[]>>({
    degree_classification: [],
    certificate_type: [],
  });
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  // Modal state: { column, editValue (null = add new) }
  const [modal, setModal] = useState<{ column: string; editValue: string | null } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ column: string; value: string } | null>(null);

  const fetchAllEnums = async () => {
    setLoading(true);
    try {
      const [dc, ct] = await Promise.all([
        getEnumValues("degree_classification"),
        getEnumValues("certificate_type"),
      ]);
      setEnumData({ degree_classification: dc, certificate_type: ct });
    } catch (e) {
      showSnackbar("Không thể tải dữ liệu enum", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEnums();
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      // Tìm các dòng, kể cả dòng mới thêm
      const rows = containerRef.current.querySelectorAll(".enum-row");
      
      anime({
        targets: rows,
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 350,
        delay: anime.stagger(40),
        easing: "easeOutQuart",
      });
    }
  }, [loading, enumData]); // Chạy lại khi data thay đổi

  const handleSave = async (column: string, oldValue: string | null, newValue: string) => {
    try {
      let newValues: string[];
      if (oldValue === null) {
        newValues = await addEnumValue(column, newValue);
        showSnackbar("Thêm giá trị thành công", "success");
      } else {
        newValues = await updateEnumValue(column, oldValue, newValue);
        showSnackbar("Đổi tên thành công", "success");
      }
      setEnumData((prev) => ({ ...prev, [column]: newValues }));
      setModal(null);
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : "Lỗi thao tác", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const newValues = await deleteEnumValue(deleteConfirm.column, deleteConfirm.value);
      setEnumData((prev) => ({ ...prev, [deleteConfirm.column]: newValues }));
      showSnackbar("Xóa giá trị thành công", "success");
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : "Xóa thất bại", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div ref={containerRef}>
      <div className="page-header">
        <div className="page-title-section">
          <h1>Quản lý bằng cấp</h1>
          <p className="page-subtitle">Quản lý các danh mục Xếp loại bằng và Chứng chỉ ngoại ngữ</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#757575" }}>Đang tải...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {(Object.entries(ENUM_COLUMNS) as [string, { label: string; color: string }][]).map(([col, meta]) => (
            <div
              key={col}
              style={{
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "4px", height: "20px", background: meta.color, borderRadius: "2px" }} />
                  <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{meta.label}</h2>
                  <span
                    style={{
                      background: meta.color + "22",
                      color: meta.color,
                      padding: "2px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {enumData[col].length} giá trị
                  </span>
                </div>
                <Button size="sm" onClick={() => setModal({ column: col, editValue: null })}>
                  + Thêm
                </Button>
              </div>

              {/* Table */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fafafa" }}>
                    <th style={{ padding: "10px 16px", fontSize: "12px", color: "#9e9e9e", fontWeight: 600, textAlign: "left" }}>
                      GIÁ TRỊ (key)
                    </th>
                    <th style={{ padding: "10px 16px", fontSize: "12px", color: "#9e9e9e", fontWeight: 600, textAlign: "center", width: "130px" }}>
                      THAO TÁC
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {enumData[col].length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ padding: "20px", textAlign: "center", color: "#9e9e9e", fontSize: "14px" }}>
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    enumData[col].map((val) => (
                      <tr
                        key={val}
                        className="enum-row"
                        style={{ borderBottom: "1px solid #f5f5f5", opacity: 0, transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontSize: "13px",
                              background: "#f5f5f5",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              color: meta.color,
                              fontWeight: 600,
                            }}
                          >
                            {val}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setModal({ column: col, editValue: val })}
                            >
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setDeleteConfirm({ column: col, value: val })}
                            >
                              Xóa
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <EnumModal
          column={modal.column}
          columnLabel={ENUM_COLUMNS[modal.column as keyof typeof ENUM_COLUMNS]?.label}
          editValue={modal.editValue}
          onClose={() => setModal(null)}
          onSave={(newValue) => handleSave(modal.column, modal.editValue, newValue)}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <ConfirmModal
          message={`Bạn có chắc muốn xóa giá trị "${deleteConfirm.value}" khỏi danh mục ${ENUM_COLUMNS[deleteConfirm.column as keyof typeof ENUM_COLUMNS]?.label}?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

function EnumModal({
  column: _column,
  columnLabel,
  editValue,
  onClose,
  onSave,
}: {
  column: string;
  columnLabel: string;
  editValue: string | null;
  onClose: () => void;
  onSave: (newValue: string) => void;
}) {
  const [value, setValue] = useState(editValue || "");
  const isEdit = editValue !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSave(value.trim());
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
          maxWidth: "440px",
          width: "90%",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>
            {isEdit ? `Sửa giá trị: ${editValue}` : `Thêm vào "${columnLabel}"`}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#757575" }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
              Giá trị (key) *
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Nhập giá trị, ví dụ: ielts"
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "monospace",
                boxSizing: "border-box",
              }}
            />
            <p style={{ fontSize: "12px", color: "#9e9e9e", marginTop: "6px" }}>
              Lưu ý: Giá trị này sẽ được lưu trực tiếp vào cột ENUM trong database.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
            <Button type="submit">{isEdit ? "Lưu thay đổi" : "Thêm mới"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
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
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h3 style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: "600" }}>Xác nhận xóa</h3>
        <p style={{ margin: "0 0 24px", color: "#616161", fontSize: "14px", lineHeight: "1.5" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Button variant="secondary" onClick={onCancel}>Hủy</Button>
          <Button variant="danger" onClick={onConfirm}>Xóa</Button>
        </div>
      </div>
    </div>
  );
}

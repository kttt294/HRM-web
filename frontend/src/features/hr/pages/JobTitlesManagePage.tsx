import { useState, useEffect, useRef } from "react";
import { Button } from "../../../components/ui/Button";
import { authFetch } from "../../../utils/auth-fetch";
import { useSnackbarStore } from "../../../store/snackbar.store";
import anime from "animejs";

/**
 * ============================================
 * JOB TITLES MANAGE PAGE - HR
 * ============================================
 * Quản lý danh sách chức vụ: thêm, sửa, xóa
 */

interface JobTitle {
  id: number;
  name: string;
  description: string | null;
}

async function fetchJobTitles(): Promise<JobTitle[]> {
  const res = await authFetch("/api/job-titles");
  if (!res.ok) throw new Error("Không thể tải danh sách chức vụ");
  return res.json();
}

async function createJobTitle(data: { name: string; description: string }): Promise<JobTitle> {
  const res = await authFetch("/api/job-titles", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Thêm chức vụ thất bại");
  }
  return res.json();
}

async function updateJobTitle(id: number, data: { name: string; description: string }): Promise<JobTitle> {
  const res = await authFetch(`/api/job-titles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Cập nhật chức vụ thất bại");
  }
  return res.json();
}

async function deleteJobTitle(id: number): Promise<void> {
  const res = await authFetch(`/api/job-titles/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Xóa chức vụ thất bại");
  }
}

export function JobTitlesManagePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  const [modal, setModal] = useState<{ editing: JobTitle | null } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<JobTitle | null>(null);

  const loadJobTitles = async () => {
    setLoading(true);
    try {
      const data = await fetchJobTitles();
      setJobTitles(data);
    } catch {
      showSnackbar("Không thể tải danh sách chức vụ", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobTitles();
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      anime({
        targets: containerRef.current.querySelectorAll(".jt-row"),
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 350,
        delay: anime.stagger(40),
        easing: "easeOutQuart",
      });
    }
  }, [loading]);

  const handleSave = async (name: string, description: string) => {
    try {
      if (modal?.editing) {
        await updateJobTitle(modal.editing.id, { name, description });
        showSnackbar("Cập nhật chức vụ thành công", "success");
      } else {
        await createJobTitle({ name, description });
        showSnackbar("Thêm chức vụ thành công", "success");
      }
      setModal(null);
      loadJobTitles();
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : "Lỗi thao tác", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteJobTitle(deleteConfirm.id);
      showSnackbar("Xóa chức vụ thành công", "success");
      loadJobTitles();
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : "Xóa thất bại", "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div ref={containerRef}>
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
          <div className="page-title-section">
            <h1>Quản lý chức vụ</h1>
            <p className="page-subtitle">Danh sách các chức vụ trong công ty</p>
          </div>
          <Button onClick={() => setModal({ editing: null })}>+ Thêm chức vụ</Button>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#757575" }}>Đang tải...</div>
        ) : jobTitles.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#757575" }}>Chưa có chức vụ nào</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>
                  Tên chức vụ
                </th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>
                  Mô tả
                </th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: "600", fontSize: "13px", width: "150px" }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {jobTitles.map((jt) => (
                <tr
                  key={jt.id}
                  className="jt-row"
                  style={{
                    borderBottom: "1px solid #f0f0f0",
                    opacity: 0,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: "600", color: "#7c4dff" }}>{jt.name}</div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#616161", fontSize: "13px" }}>
                    {jt.description || <span style={{ color: "#bdbdbd", fontStyle: "italic" }}>Chưa có mô tả</span>}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <Button size="sm" variant="secondary" onClick={() => setModal({ editing: jt })}>
                        Sửa
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(jt)}>
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

      {/* Add/Edit Modal */}
      {modal !== null && (
        <JobTitleModal
          editing={modal.editing}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <ConfirmModal
          message={`Bạn có chắc muốn xóa chức vụ "${deleteConfirm.name}"? Không thể xóa nếu đang có nhân viên đảm nhiệm.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

function JobTitleModal({
  editing,
  onClose,
  onSave,
}: {
  editing: JobTitle | null;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}) {
  const [name, setName] = useState(editing?.name || "");
  const [description, setDescription] = useState(editing?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), description.trim());
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
          maxWidth: "480px",
          width: "90%",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>
            {editing ? "Chỉnh sửa chức vụ" : "Thêm chức vụ mới"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#757575" }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
              Tên chức vụ *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Kỹ sư phần mềm"
              autoFocus
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

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về chức vụ này..."
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

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
            <Button type="submit">{editing ? "Lưu thay đổi" : "Thêm mới"}</Button>
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

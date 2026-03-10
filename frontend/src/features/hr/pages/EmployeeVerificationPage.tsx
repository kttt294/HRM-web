import { useState, useEffect, useRef } from "react";
import { employeeApi } from "../../employee/services/employee.api";
import { Employee } from "../../employee/models/employee.model";
import { Button } from "../../../components/ui/Button";
import { Table } from "../../../components/ui/Table";
import { Modal } from "../../../components/ui/Modal";
import { useSnackbarStore } from "../../../store/snackbar.store";
import { formatEmployeeId } from "../../../shared/utils/format.util";
import { GENDER_LABELS, MARITAL_STATUS_LABELS } from "../../employee/constants/employeeStatus";

interface ProfileUpdateRequest {
  id: number;
  employeeId: string;
  employeeName: string;
  data: string; // JSON string
  requestedAt: string;
}

export function EmployeeVerificationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState<ProfileUpdateRequest[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<ProfileUpdateRequest | null>(null);
  const [originalEmployee, setOriginalEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showSnackbar } = useSnackbarStore();

  const fetchPendingUpdates = async () => {
    setLoading(true);
    try {
      const result = await employeeApi.getPendingUpdates();
      setUpdates(result);
    } catch (error) {
      console.error("Failed to fetch pending updates:", error);
      showSnackbar("Không thể tải danh sách chờ duyệt", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUpdates();
  }, []);

  const handleOpenComparison = async (update: ProfileUpdateRequest) => {
    setSelectedUpdate(update);
    try {
      const emp = await employeeApi.getById(update.employeeId);
      setOriginalEmployee(emp);
      setIsModalOpen(true);
    } catch (error) {
      showSnackbar("Không thể lấy thông tin gốc của nhân viên", "error");
    }
  };

  const handleApprove = async () => {
    if (!selectedUpdate) return;
    setIsProcessing(true);
    try {
      await employeeApi.approveUpdate(selectedUpdate.id);
      showSnackbar("Đã duyệt và cập nhật hồ sơ thành công", "success");
      setIsModalOpen(false);
      fetchPendingUpdates();
    } catch (error) {
      showSnackbar("Duyệt hồ sơ thất bại", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUpdate) return;
    if (!window.confirm("Bạn có chắc chắn muốn từ chối các thay đổi này?")) return;
    setIsProcessing(true);
    try {
      await employeeApi.rejectUpdate(selectedUpdate.id);
      showSnackbar("Đã từ chối yêu cầu cập nhật", "info");
      setIsModalOpen(false);
      fetchPendingUpdates();
    } catch (error) {
      showSnackbar("Thao tác thất bại", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const fieldLabels: Record<string, string> = {
    fullName: "Họ tên",
    personalEmail: "Email cá nhân",
    phone: "Số điện thoại",
    dateOfBirth: "Ngày sinh",
    gender: "Giới tính",
    maritalStatus: "Tình trạng hôn nhân",
    nationalId: "CCCD/CMND",
    taxId: "Mã số thuế",
    insuranceId: "Mã số BHXH",
    permanentAddress: "Hộ khẩu thường trú",
    address: "Chỗ ở hiện tại",
    currentAddress: "Chỗ ở hiện tại",
    emergencyContactName: "Người liên hệ khẩn cấp",
    emergencyContactRelationship: "Mối quan hệ",
    emergencyContactPhone: "SĐT khẩn cấp",
    education: "Học vấn",
    experience: "Kinh nghiệm",
    workProcess: "Quá trình làm việc",
    bankName: "Ngân hàng",
    bankAccount: "Số tài khoản"
  };

  const isEmpty = (val: any) => val === null || val === undefined || val === '';

  const formatValue = (key: string, value: any) => {
    if (isEmpty(value)) return <span style={{ color: '#999', fontStyle: 'italic' }}>(Trống)</span>;
    if (key === 'gender') return GENDER_LABELS[value as keyof typeof GENDER_LABELS] || value;
    if (key === 'maritalStatus') return MARITAL_STATUS_LABELS[value as keyof typeof MARITAL_STATUS_LABELS] || value;
    if (key === 'dateOfBirth') return new Date(value).toLocaleDateString('vi-VN');
    if (key === 'avatarUrl' && typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('http'))) {
      return (
        <img 
          src={value} 
          alt="Avatar Preview" 
          style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #ddd' }} 
        />
      );
    }
    return value;
  };

  const renderDiff = () => {
    if (!selectedUpdate || !originalEmployee) return null;
    const newData = typeof selectedUpdate.data === 'string' 
      ? JSON.parse(selectedUpdate.data) 
      : selectedUpdate.data;
    const changedFields = Object.keys(newData);

    return (
      <div className="diff-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <table className="diff-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Trường dữ liệu</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Thông tin hiện tại</th>
              <th style={{ padding: '12px', border: '1px solid #ddd' }}>Thông tin mới</th>
            </tr>
          </thead>
          <tbody>
            {changedFields.map(key => {
              const oldValue = (originalEmployee as any)[key];
              const newValue = newData[key];
              
              // Nếu cả cũ và mới đều trống thì không cần liệt kê
              if (isEmpty(oldValue) && isEmpty(newValue)) return null;

              // Hack for comparing React elements or complex values
              const isDifferent = key === 'avatarUrl' 
                ? oldValue !== newValue 
                : JSON.stringify(oldValue) !== JSON.stringify(newValue);

              if (!isDifferent) return null;

              return (
                <tr key={key}>
                  <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 500 }}>
                    {fieldLabels[key] || key}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', color: '#666', textDecoration: (isEmpty(oldValue) ? 'none' : 'line-through') }}>
                    {formatValue(key, oldValue)}
                  </td>
                  <td style={{ padding: '12px', border: '1px solid #ddd', color: '#2e7d32', fontWeight: 600, background: '#e8f5e9' }}>
                    {formatValue(key, newValue)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const columns = [
    {
      key: "id",
      header: "Mã NV",
      render: (upd: ProfileUpdateRequest) => (
        <span style={{ fontWeight: 600, color: '#1976d2' }}>{formatEmployeeId(upd.employeeId)}</span>
      ),
    },
    {
      key: "employeeName",
      header: "Họ tên",
      render: (upd: ProfileUpdateRequest) => (
        <span style={{ fontWeight: 500 }}>{upd.employeeName}</span>
      ),
    },
    {
      key: "requestedAt",
      header: "Ngày yêu cầu",
      render: (upd: ProfileUpdateRequest) => (
        <span>{new Date(upd.requestedAt).toLocaleString('vi-VN')}</span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (upd: ProfileUpdateRequest) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="sm" onClick={() => handleOpenComparison(upd)}>
            So sánh & Duyệt
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => window.open(`/hr/employees/${upd.employeeId}`, '_blank')}
          >
            Hồ sơ gốc
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div ref={containerRef}>
      <div className="page-header">
        <div className="page-title-section">
          <h1>Duyệt hồ sơ nhân viên</h1>
          <p className="page-subtitle">
            Danh sách nhân viên vừa cập nhật thông tin và đang chờ xác thực
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>
          ) : updates.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
              Không có yêu cầu cập nhật hồ sơ nào đang chờ duyệt
            </div>
          ) : (
            <Table columns={columns} data={updates} />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        title={`So sánh thay đổi hồ sơ: ${selectedUpdate?.employeeName}`}
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="secondary" onClick={handleReject} disabled={isProcessing}>
              Từ chối
            </Button>
            <Button onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? "Đang xử lý..." : "Chấp nhận & Cập nhật"}
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: '16px', padding: '12px', background: '#fff9c4', borderRadius: '4px', fontSize: '14px' }}>
          <strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ các thông tin thay đổi dưới đây trước khi chấp nhận. Thông tin sẽ được ghi đè trực tiếp vào hồ sơ nhân viên.
        </div>
        {renderDiff()}
      </Modal>
    </div>
  );
}

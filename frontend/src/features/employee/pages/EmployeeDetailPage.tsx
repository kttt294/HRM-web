import { useNavigate, useParams } from "react-router-dom";
import { useEmployeeDetail } from "../hooks/useEmployeeDetail";
import { formatDate } from "../../../shared/utils/date.util";
import { formatCurrency, formatEmployeeId } from "../../../shared/utils/format.util";
import { Button } from "../../../components/ui/Button";
import { ROUTES } from "../../../shared/constants/routes";
import { 
  GENDER_LABELS, 
  EMPLOYEE_STATUS_LABELS, 
  EMPLOYEE_TYPE_LABELS,
  MARITAL_STATUS_LABELS,
  EDUCATION_LEVEL_LABELS,
  DEGREE_CLASSIFICATION_LABELS,
  Gender,
  EmployeeStatus,
  EmployeeType,
  MaritalStatus,
} from "../constants/employeeStatus";

import { getAvatarUrl } from "../../../shared/utils/avatar.util";

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employee, isLoading } = useEmployeeDetail(id!);

  if (isLoading) {
    return <div className="loading">Đang tải chi tiết nhân viên...</div>;
  }

  if (!employee) {
    return (
      <div className="card">
        <div className="card-body">
          <p>Không tìm thấy nhân viên</p>
          <Button onClick={() => navigate(ROUTES.EMPLOYEES)}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <img 
              src={getAvatarUrl(employee.avatarUrl, employee.fullName)} 
              alt={employee.fullName}
              style={{ width: "64px", height: "64px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            />
            <div>
              <h1>Hồ sơ nhân viên</h1>
              <p className="page-subtitle">{employee.fullName} - {employee.jobTitle}</p>
            </div>
          </div>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.EMPLOYEES)}
          >
            Quay lại danh sách
          </Button>
          <Button onClick={() => navigate(ROUTES.EMPLOYEE_EDIT.replace(":id", employee.id))}>
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* THÔNG TIN CÁ NHÂN */}
        <div className="card">
          <div className="card-header">
            <h2>Thông tin cá nhân</h2>
          </div>
          <div className="card-body">
            <InfoGrid items={[
              { label: "Mã nhân viên", value: formatEmployeeId(employee.id) },
              { label: "Họ và tên", value: employee.fullName },
              { label: "Giới tính", value: GENDER_LABELS[employee.gender as Gender] || employee.gender },
              { label: "Ngày sinh", value: formatDate(employee.dateOfBirth) },
              { label: "Tình trạng hôn nhân", value: MARITAL_STATUS_LABELS[employee.maritalStatus as MaritalStatus] || employee.maritalStatus },
              { label: "Email cá nhân", value: employee.personalEmail },
              { label: "Số điện thoại", value: employee.phone },
              { label: "Địa chỉ hiện tại", value: employee.address, span: 2 },
              { label: "Địa chỉ thường trú", value: employee.permanentAddress, span: 2 },
            ]} />
          </div>
        </div>

        {/* THÔNG TIN PHÁP LÝ & LIÊN HỆ GẤP */}
        <div className="card">
          <div className="card-header">
            <h2>Pháp lý & Liên hệ khẩn cấp</h2>
          </div>
          <div className="card-body">
            <InfoGrid items={[
              { label: "Số CCCD", value: employee.nationalId },
              { label: "Mã số thuế", value: employee.taxId },
              { label: "Số sổ BHXH", value: employee.insuranceId },
              { label: "Liên hệ khẩn cấp", value: employee.emergencyContactName },
              { label: "Mối quan hệ", value: employee.emergencyContactRelationship },
              { label: "SĐT khẩn cấp", value: employee.emergencyContactPhone },
            ]} />
          </div>
        </div>

        {/* THÔNG TIN CÔNG VIỆC */}
        <div className="card">
          <div className="card-header">
            <h2>Thông tin công việc</h2>
          </div>
          <div className="card-body">
            <InfoGrid items={[
              { label: "Phòng ban", value: employee.departmentName },
              { label: "Chức danh", value: employee.jobTitle },
              { label: "Quản lý trực tiếp", value: employee.supervisorName },
              { label: "Ngày vào làm", value: formatDate(employee.hireDate) },
              { label: "Ngày tạo hồ sơ", value: employee.createdAt ? formatDate(employee.createdAt) : '—' },
              { label: "Ngày cập nhật", value: employee.updatedAt ? formatDate(employee.updatedAt) : '—' },
              { label: "Loại hình", value: EMPLOYEE_TYPE_LABELS[employee.employeeType as EmployeeType] || employee.employeeType },
              { label: "Trạng thái", value: EMPLOYEE_STATUS_LABELS[employee.status as EmployeeStatus] || employee.status },
              { label: "Phê duyệt hồ sơ", value: employee.profileStatus === 'verified' ? 'Đã xác thực' : 'Đang chờ' },
              { label: "Tổng ngày phép", value: employee.totalLeaveDays?.toString() },
              { label: "Phép còn lại", value: employee.remainingLeaveDays?.toString() },
            ]} />

            {/* Kinh nghiệm & Quá trình làm việc */}
            {(employee.experience || employee.workProcess) && (
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {employee.experience && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#9e9e9e', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Kinh nghiệm trước đây
                    </label>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#212121', whiteSpace: 'pre-line' }}>
                      {employee.experience}
                    </div>
                  </div>
                )}
                {employee.workProcess && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#9e9e9e', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Quá trình làm việc tại công ty
                    </label>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#212121', whiteSpace: 'pre-line' }}>
                      {employee.workProcess}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* THÔNG TIN TÀI CHÍNH */}
        <div className="card">
          <div className="card-header">
            <h2>Ngân hàng & Lương</h2>
          </div>
          <div className="card-body">
            <InfoGrid items={[
              { label: "Ngân hàng", value: employee.bankName },
              { label: "Số tài khoản", value: employee.bankAccount },
              { label: "Lương cơ bản", value: formatCurrency(employee.baseSalary) },
              { label: "Phụ cấp", value: formatCurrency(employee.allowance) },
              { label: "Số người phụ thuộc", value: employee.dependentsCount?.toString() },
            ]} />
          </div>
        </div>

        {/* BẰNG CẤP & CHỨNG CHỈ — full width */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h2>Bằng cấp & Chứng chỉ</h2>
          </div>
          <div className="card-body">
            {employee.degrees && employee.degrees.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {employee.degrees.map((deg: any, idx: number) => (
                  <div key={deg.id || idx} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    borderBottom: idx !== (employee.degrees?.length || 0) - 1 ? '1px solid #eee' : 'none',
                    paddingBottom: idx !== (employee.degrees?.length || 0) - 1 ? '16px' : '0'
                  }}>
                    <InfoGrid items={[
                      { label: "Loại bằng", value: EDUCATION_LEVEL_LABELS[deg.educationLevel] || deg.educationLevel?.toUpperCase() || '—' },
                      { label: "Chuyên ngành", value: deg.major },
                      { label: "Trường", value: deg.schoolName },
                      { label: "Năm tốt nghiệp", value: deg.graduationYear?.toString() },
                      { label: "Xếp loại", value: DEGREE_CLASSIFICATION_LABELS[deg.degreeClassification] || deg.degreeClassification || '—' },
                      { label: "Ngoại ngữ", value: deg.englishCertificate !== 'none' ? deg.englishCertificate?.toUpperCase() : '—' },
                      { label: "Điểm ngoại ngữ", value: deg.englishScore },
                      { label: "Ngày cấp chứng chỉ NN", value: deg.englishIssueDate ? formatDate(deg.englishIssueDate) : '—' },
                      { label: "Ngày hết hạn chứng chỉ NN", value: deg.englishExpiryDate ? formatDate(deg.englishExpiryDate) : '—' },
                    ]} />
                    {deg.certificateFileUrl && (
                      <a href={deg.certificateFileUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '13px', color: '#1976d2', textDecoration: 'underline', marginTop: '4px' }}>
                        📎 Xem file bằng cấp/chứng chỉ
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#9e9e9e', fontSize: '14px' }}>Chưa có dữ liệu bằng cấp.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function InfoGrid({ items }: { items: { label: string, value?: string, span?: number }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {items.map(item => (
        <div key={item.label} style={{ gridColumn: item.span ? `span ${item.span}` : 'auto' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#9e9e9e', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</label>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#212121' }}>{item.value || '—'}</div>
        </div>
      ))}
    </div>
  );
}

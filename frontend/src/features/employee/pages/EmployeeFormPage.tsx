import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { useEmployeeDetail } from "../hooks/useEmployeeDetail";
import {
  GENDER_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  EMPLOYEE_TYPE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  EDUCATION_LEVEL_LABELS,
  DEGREE_CLASSIFICATION_LABELS,
  ENGLISH_CERTIFICATE_LABELS,
} from "../constants/employeeStatus";

const SYSTEM_ROLE_OPTIONS = [
  { value: '2', label: 'HR' },
  { value: '3', label: 'Manager' },
  { value: '4', label: 'Employee' }
];
import { ROUTES } from "../../../shared/constants/routes";
import { departmentApi } from "../../hr/services/department.api";
import { employeeApi } from "../services/employee.api";
import { jobTitleApi } from "../../hr/services/jobTitle.api.ts";
import { getAvatarUrl, compressImage } from "../../../shared/utils/avatar.util";
import { Department } from "../../hr/models/department.model";
import { Employee } from "../models/employee.model";
import { useSnackbarStore } from "../../../store/snackbar.store";
import { formatEmployeeId } from "../../../shared/utils/format.util";

export function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { employee } = useEmployeeDetail(id || "");
  const { showSnackbar } = useSnackbarStore();

  // Dropdown data
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  // Supervisor search
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [showSupervisorDropdown, setShowSupervisorDropdown] = useState(false);
  const supervisorRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<any>({
    fullName: "",
    avatarUrl: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "single",
    personalEmail: "",
    phone: "",
    address: "",
    permanentAddress: "",
    nationalId: "",
    taxId: "",
    insuranceId: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    bankName: "",
    bankAccount: "",
    experience: "",

    
    id: "", // Employee ID Mã NV
    departmentId: "",
    jobTitleId: "",
    supervisorId: "",
    hireDate: "",
    status: "active",
    baseSalary: "0",
    allowance: "0",
    dependentsCount: "0",
    employeeType: "full_time",
    roleId: "4",
    degrees: []
  });

  // Fetch initial data
  useEffect(() => {
    departmentApi.getAll().then(setDepartments).catch(console.error);
    employeeApi.getAll().then(setAllEmployees).catch(console.error);
    jobTitleApi.getAll().then(setJobTitles).catch(console.error);
  }, []);

  // Populate form in edit mode
  useEffect(() => {
    if (employee && isEditMode) {
      setFormData({
        ...employee,
        id: formatEmployeeId(employee.id),
        baseSalary: String(employee.baseSalary || "0"),
        allowance: String(employee.allowance || "0"),
        dependentsCount: String(employee.dependentsCount || "0"),
        dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : "",
        hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : "",
        experience: employee.experience || "",
        roleId: String((employee as any).roleId || "4"),
        degrees: employee.degrees || []
      });
      
      const sup = allEmployees.find((e) => e.id === employee.supervisorId);
      if (sup) setSupervisorSearch(`${formatEmployeeId(sup.id)} - ${sup.fullName}`);
    }
  }, [employee, isEditMode, allEmployees]);

  // Close supervisor dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (supervisorRef.current && !supervisorRef.current.contains(e.target as Node)) {
        setShowSupervisorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSupervisors = useMemo(() => {
    const query = supervisorSearch.toLowerCase().trim();
    if (!query) return allEmployees;
    return allEmployees.filter(
      (emp) => formatEmployeeId(emp.id).toLowerCase().includes(query) || emp.fullName.toLowerCase().includes(query)
    );
  }, [allEmployees, supervisorSearch]);

  const departmentOptions = departments.map((d) => ({ value: d.id, label: d.name }));
  const jobTitleOptions = jobTitles.map((jt) => ({ value: jt.id, label: jt.name }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 400); // Nén về Max Width 400px
        setFormData({ ...formData, avatarUrl: compressedBase64 });
      } catch (err) {
        console.error("Compression failed:", err);
        showSnackbar("Lỗi khi xử lý ảnh", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        baseSalary: Number(formData.baseSalary),
        allowance: Number(formData.allowance),
        dependentsCount: Number(formData.dependentsCount),
        // Clean up degrees for backend
        degrees: (formData.degrees || []).map((d: any) => {
          const { _uiType, ...rest } = d;
          return {
            ...rest,
            graduationYear: d.graduationYear ? Number(d.graduationYear) : null,
            englishScore: d.englishScore || "0"
          };
        })
      };

      if (isEditMode && id) {
        await employeeApi.update(id, payload);
        
        // Cập nhật role nếu thay đổi (chỉ khi nhân viên đã có tài khoản hệ thống)
        if (employee?.userId && formData.roleId !== String((employee as any).roleId)) {
          await employeeApi.updateRole(id, Number(formData.roleId));
        }

        showSnackbar('Cập nhật nhân viên thành công', 'success');
      } else {
        await employeeApi.create(payload);
        showSnackbar('Thêm nhân viên thành công', 'success');
      }
      navigate(ROUTES.EMPLOYEES);
    } catch (error) {
      console.error("Error saving employee:", error);
      const msg = error instanceof Error ? error.message : "Lỗi khi lưu nhân viên!";
      showSnackbar(msg, 'error');
    }
  };

  const handleSelectSupervisor = (emp: Employee) => {
    setFormData({ ...formData, supervisorId: emp.id });
    setSupervisorSearch(`${formatEmployeeId(emp.id)} - ${emp.fullName}`);
    setShowSupervisorDropdown(false);
  };

  const handleAddEdu = () => {
    setFormData({
      ...formData,
      degrees: [
        ...(formData.degrees || []),
        {
           _uiType: 'education',
           educationLevel: 'university',
           major: '',
           schoolName: '',
           graduationYear: new Date().getFullYear(),
           degreeClassification: 'average',
           englishCertificate: 'none'
        }
      ]
    });
  };

  const handleAddCert = () => {
    setFormData({
      ...formData,
      degrees: [
        ...(formData.degrees || []),
        {
           _uiType: 'certificate',
           educationLevel: 'none',
           major: '',
           schoolName: '',
           graduationYear: 0,
           degreeClassification: 'none',
           englishCertificate: 'toeic',
           englishScore: '',
           englishIssueDate: '',
           englishExpiryDate: ''
        }
      ]
    });
  };

  const handleRemoveDegree = (index: number) => {
    const newDegs = [...(formData.degrees || [])];
    newDegs.splice(index, 1);
    setFormData({ ...formData, degrees: newDegs });
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title-section">
          <h1>{isEditMode ? "CẬP NHẬT NHÂN VIÊN" : "THÊM NHÂN VIÊN MỚI"}</h1>
          <p className="page-subtitle">Quản lý hồ sơ nhân sự chi tiết</p>
        </div>
      </div>
      
      <main style={{ marginTop: "24px" }}>
        <form id="employee-form" onSubmit={handleSubmit}>
          {/* SECTION 1: CÁ NHÂN */}
          <section className="form-section">
            <h2>1. Thông tin cá nhân</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '30px' }}>
              {/* Avatar Column */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 12px' }}>
                  <img 
                    src={getAvatarUrl(formData.avatarUrl, formData.fullName)} 
                    alt="Avatar Preview" 
                    style={{ width: '100%', height: '100%', borderRadius: '16px', objectFit: 'cover', border: '2px solid #eee' }}
                  />
                  <input
                    type="file"
                    id="avatar-upload"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="avatar-upload"
                    style={{
                      position: 'absolute',
                      bottom: '-10px',
                      right: '-10px',
                      background: '#2196f3',
                      color: 'white',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                    </svg>
                  </label>
                </div>
                <p style={{ fontSize: '12px', color: '#666' }}>Ảnh định dạng<br/> Tối đa 2MB (JPG/PNG)</p>
              </div>

              {/* Fields Column */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Input label="Họ và tên *" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                <Input label="Email cá nhân" type="email" value={formData.personalEmail} onChange={e => setFormData({...formData, personalEmail: e.target.value})} />
                <Input label="Ngày sinh" type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <Select label="Giới tính" options={GENDER_OPTIONS} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} />
                  <Select label="Hôn nhân" options={MARITAL_STATUS_OPTIONS} value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})} />
                </div>
                <Input label="Số điện thoại" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <Input label="Số CCCD" value={formData.nationalId} onChange={e => setFormData({...formData, nationalId: e.target.value})} />
                <Input label="Địa chỉ hiện tại" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ gridColumn: 'span 2' }} />
                <Input label="Địa chỉ thường trú" value={formData.permanentAddress} onChange={e => setFormData({...formData, permanentAddress: e.target.value})} style={{ gridColumn: 'span 2' }} />
              </div>
            </div>
          </section>

          {/* SECTION 2: PHÁP LÝ & TÀI CHÍNH */}
          <section className="form-section">
            <h2>2. Pháp lý & Tài chính</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Input label="Mã số thuế" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} />
              <Input label="Số sổ BHXH" value={formData.insuranceId} onChange={e => setFormData({...formData, insuranceId: e.target.value})} />
              <Input label="Tên ngân hàng" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} />
              <Input label="Số tài khoản" value={formData.bankAccount} onChange={e => setFormData({...formData, bankAccount: e.target.value})} />
              <Input label="Số người phụ thuộc" type="number" value={formData.dependentsCount} onChange={e => setFormData({...formData, dependentsCount: e.target.value})} />
            </div>
          </section>

          {/* SECTION 3: LIÊN HỆ KHẨN CẤP */}
          <section className="form-section">
            <h2>3. Liên hệ khẩn cấp</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <Input label="Họ tên người liên hệ" value={formData.emergencyContactName} onChange={e => setFormData({...formData, emergencyContactName: e.target.value})} />
              <Input label="Mối quan hệ" value={formData.emergencyContactRelationship} onChange={e => setFormData({...formData, emergencyContactRelationship: e.target.value})} />
              <Input label="Số điện thoại" value={formData.emergencyContactPhone} onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})} />
            </div>
          </section>

          {/* SECTION 4: CÔNG VIỆC */}
          <section className="form-section">
            <h2>4. Thông tin công việc</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {isEditMode && (
                <Input label="Mã nhân viên (ID)" value={formData.id} disabled />
              )}
              <Select label="Phòng ban" options={departmentOptions} value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} />
              <Select label="Chức danh" options={jobTitleOptions} value={formData.jobTitleId} onChange={e => setFormData({...formData, jobTitleId: e.target.value})} />
              
              <div ref={supervisorRef} style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#616161' }}>Quản lý trực tiếp</label>
                <input 
                  className="form-input" 
                  value={supervisorSearch} 
                  onChange={e => { setSupervisorSearch(e.target.value); setShowSupervisorDropdown(true); }}
                  onFocus={() => setShowSupervisorDropdown(true)}
                  placeholder="Tìm theo ID/Tên..."
                />
                {showSupervisorDropdown && (
                  <div className="dropdown-panel" style={{ position: 'absolute', width: '100%', zIndex: 10, background: '#fff', border: '1px solid #ddd', maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredSupervisors.map(emp => (
                      <div key={emp.id} onClick={() => handleSelectSupervisor(emp)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                        {formatEmployeeId(emp.id)} - {emp.fullName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Input label="Ngày vào làm" type="date" value={formData.hireDate} onChange={e => setFormData({...formData, hireDate: e.target.value})} />
              <Select label="Trạng thái" options={EMPLOYEE_STATUS_OPTIONS} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} />
              <Input label="Lương cơ bản" type="number" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: e.target.value})} />
              <Input label="Phụ cấp" type="number" value={formData.allowance} onChange={e => setFormData({...formData, allowance: e.target.value})} />
              <Select label="Loại hình" options={EMPLOYEE_TYPE_OPTIONS} value={formData.employeeType} onChange={e => setFormData({...formData, employeeType: e.target.value})} />
              
              {isEditMode && (
                <Select 
                  label="Vai trò hệ thống" 
                  options={SYSTEM_ROLE_OPTIONS} 
                  value={formData.roleId} 
                  onChange={e => setFormData({...formData, roleId: e.target.value})} 
                />
              )}

              <div style={{ gridColumn: 'span 2' }}>
                <p style={{ fontSize: '12px', color: '#9e9e9e', marginBottom: '8px', textTransform: 'uppercase' }}>Học vấn</p>
                {formData.degrees && formData.degrees.some((d: any) => d._uiType === 'education' || (!d._uiType && d.educationLevel && d.educationLevel !== 'none') || (!d._uiType && (!d.englishCertificate || d.englishCertificate === 'none'))) ? 
                  formData.degrees.map((deg: any, index: number) => {
                    const isEdu = deg._uiType === 'education' || (!deg._uiType && deg.educationLevel && deg.educationLevel !== 'none') || (!deg._uiType && (!deg.englishCertificate || deg.englishCertificate === 'none'));
                    if (!isEdu) return null;
                    return (
                      <div key={deg.id || index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', borderBottom: index < (formData.degrees?.length || 0) - 1 ? '1px solid #eee' : 'none', paddingBottom: index < (formData.degrees?.length || 0) - 1 ? '16px' : '0', marginBottom: '16px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '0', right: '0' }}>
                          <p style={{ fontSize: '13px', color: '#d32f2f', margin: 0, cursor: 'pointer', fontWeight: 500 }} onClick={() => handleRemoveDegree(index)}>Xóa</p>
                        </div>
                        <Select label="Loại bằng" options={Object.entries(EDUCATION_LEVEL_LABELS).map(([v, l]) => ({ value: v, label: l }))} value={deg.educationLevel || ''} onChange={e => {
                          const newDegs = [...(formData.degrees || [])];
                          newDegs[index].educationLevel = e.target.value;
                          setFormData({ ...formData, degrees: newDegs });
                        }} />
                        <Input label="Chuyên ngành" value={deg.major} onChange={e => {
                          const newDegs = [...(formData.degrees || [])];
                          newDegs[index].major = e.target.value;
                          setFormData({ ...formData, degrees: newDegs });
                        }} />
                        <Input label="Trường" value={deg.schoolName} onChange={e => {
                          const newDegs = [...(formData.degrees || [])];
                          newDegs[index].schoolName = e.target.value;
                          setFormData({ ...formData, degrees: newDegs });
                        }} />
                        <Input label="Năm tốt nghiệp" type="number" value={deg.graduationYear || ''} onChange={e => {
                          const newDegs = [...(formData.degrees || [])];
                          newDegs[index].graduationYear = Number(e.target.value);
                          setFormData({ ...formData, degrees: newDegs });
                        }} />
                        <Select label="Xếp loại" options={Object.entries(DEGREE_CLASSIFICATION_LABELS).map(([v, l]) => ({ value: v, label: l }))} value={deg.degreeClassification || ''} onChange={e => {
                          const newDegs = [...(formData.degrees || [])];
                          newDegs[index].degreeClassification = e.target.value;
                          setFormData({ ...formData, degrees: newDegs });
                        }} />
                      </div>
                    );
                  }) : (
                  <p style={{ fontSize: '13px', color: '#757575' }}>Chưa có dữ liệu học vấn.</p>
                )}
                <Button type="button" variant="secondary" onClick={handleAddEdu} style={{ marginTop: '10px' }}>
                  + Thêm học vấn
                </Button>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '16px' }}>
                <p style={{ fontSize: '12px', color: '#9e9e9e', marginBottom: '8px', textTransform: 'uppercase' }}>Chứng chỉ ngoại ngữ</p>
                {formData.degrees && formData.degrees.some((d: any) => d._uiType === 'certificate' || (!d._uiType && d.englishCertificate && d.englishCertificate !== 'none')) ? 
                  formData.degrees.map((deg: any, index: number) => {
                    const isCert = deg._uiType === 'certificate' || (!deg._uiType && deg.englishCertificate && deg.englishCertificate !== 'none');
                    if (!isCert) return null;
                    return (
                      <div key={deg.id || index} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', borderBottom: index < (formData.degrees?.length || 0) - 1 ? '1px solid #eee' : 'none', paddingBottom: index < (formData.degrees?.length || 0) - 1 ? '16px' : '0', marginBottom: '16px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '0', right: '0' }}>
                          <p style={{ fontSize: '13px', color: '#d32f2f', margin: 0, cursor: 'pointer', fontWeight: 500 }} onClick={() => handleRemoveDegree(index)}>Xóa</p>
                        </div>
                        <Select label="Loại ngoại ngữ" options={Object.entries(ENGLISH_CERTIFICATE_LABELS).map(([v, l]) => ({ value: v, label: l }))} value={deg.englishCertificate || 'none'} onChange={e => {
                          const newDegs = [...(formData.degrees || [])];
                          newDegs[index].englishCertificate = e.target.value;
                          setFormData({ ...formData, degrees: newDegs });
                        }} />
                        <Input label="Điểm NN" value={deg.englishScore || ''} onChange={e => {
                          const newDegs = [...(formData.degrees || [])];
                          newDegs[index].englishScore = e.target.value;
                          setFormData({ ...formData, degrees: newDegs });
                        }} />
                        <Input label="Ngày cấp NN" type="date" value={deg.englishIssueDate ? String(deg.englishIssueDate).split('T')[0] : ''} onChange={e => {
                          const newDegs = [...(formData.degrees || [])];
                          newDegs[index].englishIssueDate = e.target.value;
                          setFormData({ ...formData, degrees: newDegs });
                        }} />
                        <Input label="Hết hạn NN" type="date" value={deg.englishExpiryDate ? String(deg.englishExpiryDate).split('T')[0] : ''} onChange={e => {
                          const newDegs = [...(formData.degrees || [])];
                          newDegs[index].englishExpiryDate = e.target.value;
                          setFormData({ ...formData, degrees: newDegs });
                        }} />
                      </div>
                    );
                  }) : (
                  <p style={{ fontSize: '13px', color: '#757575' }}>Chưa có dữ liệu chứng chỉ ngoại ngữ.</p>
                )}
                <Button type="button" variant="secondary" onClick={handleAddCert} style={{ marginTop: '10px' }}>
                  + Thêm chứng chỉ ngoại ngữ
                </Button>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#616161' }}>Kinh nghiệm làm việc</label>
                <textarea 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
                  value={formData.experience} 
                  onChange={e => setFormData({...formData, experience: e.target.value})} 
                  placeholder="Mô tả kinh nghiệm làm việc trước đây..."
                />
              </div>
            </div>
          </section>

          <div className="form-actions" style={{ marginTop: '30px' }}>
            <Button type="submit">Lưu thông tin</Button>
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.EMPLOYEES)}>Hủy</Button>
          </div>
        </form>
      </main>
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../../store/auth.store";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { authFetch } from "../../../utils/auth-fetch";
import { employeeApi } from "../services/employee.api";
import { authApi } from "../../auth/services/auth.api";
import { Employee } from "../models/employee.model";
import {
  GENDER_OPTIONS,
  GENDER_LABELS,
  Gender,
  EMPLOYEE_STATUS_LABELS,
  EmployeeStatus,
  EMPLOYEE_TYPE_LABELS,
  EmployeeType,
  MARITAL_STATUS_OPTIONS,
  MARITAL_STATUS_LABELS,
  EDUCATION_LEVEL_LABELS,
  DEGREE_CLASSIFICATION_LABELS,
  ENGLISH_CERTIFICATE_LABELS,
  MaritalStatus,
} from "../constants/employeeStatus";
import { Select } from "../../../components/ui/Select";
import { formatEmployeeId } from "../../../shared/utils/format.util";
import anime from "animejs";
import { useSnackbarStore } from "../../../store/snackbar.store";
import { getAvatarUrl, compressImage } from "../../../shared/utils/avatar.util";
import { formatDate } from "../../../shared/utils/date.util";

/**
 * ============================================
 * MY PROFILE PAGE - Employee Self-Service
 * ============================================
 */

export function MyProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'personal' | 'legal' | 'bank' | 'career'>('personal');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState<any>({});
  
  // Dynamic Enum States
  const [certificateTypes, setCertificateTypes] = useState<string[]>([]);
  const [degreeClassifications, setDegreeClassifications] = useState<string[]>([]);

  // Fetch dynamic enum values
  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const [certRes, degRes] = await Promise.all([
          authFetch('/api/employee-degrees/enums/values?column=certificate_type'),
          authFetch('/api/employee-degrees/enums/values?column=degree_classification')
        ]);
        
        if (certRes.ok) {
          const data = await certRes.json();
          setCertificateTypes(data.values || []);
        }
        if (degRes.ok) {
          const data = await degRes.json();
          setDegreeClassifications(data.values || []);
        }
      } catch (err) {
        console.error("Failed to fetch enums:", err);
      }
    };
    fetchEnums();
  }, []);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbarStore();

  // Data from API
  const [profile, setProfile] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const emp = await employeeApi.getMe();
        setProfile(emp);
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

  const getStatusLabel = (status: string) => {
    return EMPLOYEE_STATUS_LABELS[status as EmployeeStatus] || status;
  };

  const getGenderLabel = (gender: string) => {
    return GENDER_LABELS[gender as Gender] || gender;
  };

  const getEmployeeTypeLabel = (type: string) => {
    return EMPLOYEE_TYPE_LABELS[type as EmployeeType] || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleEdit = () => {
    if (profile) {
      let dob = '';
      if (profile.dateOfBirth) {
        try {
          dob = new Date(profile.dateOfBirth).toISOString().split('T')[0];
        } catch {
          dob = '';
        }
      }
      setEditForm({
        ...profile,
        dateOfBirth: dob
      });
    }
    setIsEditing(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 400);
        setEditForm({ ...editForm, avatarUrl: compressedBase64 });
      } catch (err) {
        console.error("Compression failed:", err);
        showSnackbar("Lỗi khi xử lý ảnh", "error");
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const allowedFields: (keyof Employee)[] = [
        'fullName', 'avatarUrl', 'dateOfBirth', 'gender', 'maritalStatus', 'personalEmail', 'phone',
        'currentAddress', 'permanentAddress', 'nationalId', 'taxId', 'insuranceId',
        'emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone',
        'bankName', 'bankAccount', 'experience', 'degrees', 'certificates'
      ];

      const updateData: any = {};
      allowedFields.forEach(field => {
        if (editForm[field] !== undefined) {
          updateData[field] = editForm[field];
        }
      });

      await employeeApi.updateMe(updateData);

      const finalProfile = await employeeApi.getMe();
      setProfile(finalProfile);
      setIsEditing(false);
      showSnackbar("Thông tin đã được gửi. Vui lòng chờ được xác thực!", "success");
    } catch (err) {
      console.error('Failed to update profile:', err);
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      showSnackbar(`Cập nhật thất bại: ${msg}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 5) {
      setPasswordError("Mật khẩu mới phải có ít nhất 5 ký tự");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showSnackbar("Đổi mật khẩu thành công!", "success");
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đổi mật khẩu thất bại";
      showSnackbar(msg, "error");
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const displayName = profile?.fullName || user?.name || "Nhân viên";
  const displayStatus = profile ? getStatusLabel(profile.status) : "";
  const displayId = profile?.id ? formatEmployeeId(profile.id) : "";

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <p style={{ color: "#757575" }}>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div ref={pageRef}>
      {/* Page Header */}
      <div className="page-header animate-item" style={{ opacity: 0 }}>
        <div className="page-title-section">
          <h1>Hồ sơ của tôi</h1>
          <p className="page-subtitle">Quản lý thông tin cá nhân và hồ sơ nhân viên</p>
        </div>
        {profile?.profileStatus === 'pending' && (
          <div style={{
            background: '#fff9c4', color: '#f57f17', padding: '8px 16px', borderRadius: '8px',
            fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            Hồ sơ đang chờ xác thực bởi HR/Manager
          </div>
        )}
      </div>

      {/* Header Info Card */}
      <div className="card animate-item" style={{ marginBottom: "24px", opacity: 0 }}>
        <div className="card-body">
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            <div style={{ position: 'relative' }}>
              <img
                src={getAvatarUrl(isEditing ? editForm.avatarUrl : profile?.avatarUrl, displayName)}
                alt={displayName}
                style={{ width: "96px", height: "96px", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", objectFit: 'cover' }}
              />
              {isEditing && (
                <>
                  <input type="file" id="my-avatar-upload" hidden accept="image/*" onChange={handleFileChange} />
                  <label htmlFor="my-avatar-upload" style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: '#2196f3', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid white' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                  </label>
                </>
              )}
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "4px" }}>{displayName}</h2>
              <p style={{ color: "#757575", fontSize: "15px", marginBottom: "12px" }}>
                {profile?.jobTitle || 'Nhân viên'} — {profile?.departmentName || 'Phòng ban'}
              </p>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span className="status-badge status-active">{displayStatus}</span>
                <span style={{ fontSize: "13px", color: "#9e9e9e", background: "#f5f5f5", padding: "4px 12px", borderRadius: "20px" }}>Mã NV: {displayId}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>Đổi mật khẩu</Button>
              {!isEditing && <Button onClick={handleEdit}>Cập nhật hồ sơ</Button>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="animate-item" style={{ marginBottom: '24px', opacity: 0 }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #eee' }}>
          {[
            { id: 'personal', label: 'Cá nhân', color: '#1976d2' },
            { id: 'legal', label: 'Pháp lý & Liên hệ', color: '#4caf50' },
            { id: 'bank', label: 'Ngân hàng', color: '#ff9800' },
            { id: 'career', label: 'Công việc', color: '#7c4dff' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 24px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px',
                fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? tab.color : '#757575',
                borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent', transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="card animate-item" style={{ opacity: 0 }}>
        <div className="card-body">
          {isEditing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {activeTab === 'personal' && (
                <>
                  <Input label="Họ và tên" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} />
                  <Input label="Email cá nhân" type="email" value={editForm.personalEmail} onChange={e => setEditForm({ ...editForm, personalEmail: e.target.value })} />
                  <Input label="Số điện thoại" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                  <Input label="Ngày sinh" type="date" value={editForm.dateOfBirth} onChange={e => setEditForm({ ...editForm, dateOfBirth: e.target.value })} />
                  <Select label="Giới tính" options={GENDER_OPTIONS} value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })} />
                  <Select label="Tình trạng hôn nhân" options={MARITAL_STATUS_OPTIONS} value={editForm.maritalStatus} onChange={e => setEditForm({ ...editForm, maritalStatus: e.target.value })} />
                  <Input label="Địa chỉ hiện tại" value={editForm.currentAddress} onChange={e => setEditForm({ ...editForm, currentAddress: e.target.value })} style={{ gridColumn: 'span 2' }} />
                  <Input label="Địa chỉ thường trú" value={editForm.permanentAddress} onChange={e => setEditForm({ ...editForm, permanentAddress: e.target.value })} style={{ gridColumn: 'span 2' }} />
                </>
              )}
              {activeTab === 'legal' && (
                <>
                  <Input label="Số CCCD" value={editForm.nationalId} onChange={e => setEditForm({ ...editForm, nationalId: e.target.value })} />
                  <Input label="Mã số thuế" value={editForm.taxId} onChange={e => setEditForm({ ...editForm, taxId: e.target.value })} />
                  <Input label="Số sổ BHXH" value={editForm.insuranceId} onChange={e => setEditForm({ ...editForm, insuranceId: e.target.value })} />
                  <Input label="Người liên hệ khẩn cấp" value={editForm.emergencyContactName} onChange={e => setEditForm({ ...editForm, emergencyContactName: e.target.value })} />
                  <Input label="Mối quan hệ" value={editForm.emergencyContactRelationship} onChange={e => setEditForm({ ...editForm, emergencyContactRelationship: e.target.value })} />
                  <Input label="SĐT khẩn cấp" value={editForm.emergencyContactPhone} onChange={e => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })} />
                </>
              )}
              {activeTab === 'bank' && (
                <>
                  <Input label="Tên ngân hàng" value={editForm.bankName} onChange={e => setEditForm({ ...editForm, bankName: e.target.value })} />
                  <Input label="Số tài khoản" value={editForm.bankAccount} onChange={e => setEditForm({ ...editForm, bankAccount: e.target.value })} />
                  <Input label="Số người phụ thuộc" type="number" value={editForm.dependentsCount} onChange={e => setEditForm({ ...editForm, dependentsCount: parseInt(e.target.value) })} />
                </>
              )}
              {activeTab === 'career' && (
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Experience Section */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#616161', fontWeight: 600 }}>Kinh nghiệm làm việc</label>
                    <textarea
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px' }}
                      value={editForm.experience || ''}
                      onChange={e => setEditForm({ ...editForm, experience: e.target.value })}
                      placeholder="Mô tả kinh nghiệm làm việc trước đây..."
                    />
                  </div>

                  {/* Degrees Section */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <label style={{ fontSize: '14px', color: '#616161', fontWeight: 600 }}>Trình độ & Bằng cấp</label>
                      <Button size="sm" variant="secondary" onClick={() => {
                        const newDegrees = [...(editForm.degrees || []), { educationLevel: 'university', schoolName: '', major: '', graduationYear: new Date().getFullYear(), degreeClassification: 'good' }];
                        setEditForm({ ...editForm, degrees: newDegrees });
                      }}>+ Thêm bằng cấp</Button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {(editForm.degrees || []).map((deg: any, idx: number) => (
                        <div key={idx} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', background: '#fafafa', position: 'relative' }}>
                          <button 
                            onClick={() => {
                              const newDegrees = (editForm.degrees || []).filter((_: any, i: number) => i !== idx);
                              setEditForm({ ...editForm, degrees: newDegrees });
                            }}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '18px' }}
                          >
                            ×
                          </button>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Select label="Trình độ" value={deg.educationLevel} options={Object.entries(EDUCATION_LEVEL_LABELS).map(([v, l]) => ({ value: v, label: l }))} onChange={e => {
                              const newDegrees = [...(editForm.degrees || [])];
                              newDegrees[idx] = { ...newDegrees[idx], educationLevel: e.target.value };
                              setEditForm({ ...editForm, degrees: newDegrees });
                            }} />
                            <Input label="Trường" value={deg.schoolName} onChange={e => {
                              const newDegrees = [...(editForm.degrees || [])];
                              newDegrees[idx] = { ...newDegrees[idx], schoolName: e.target.value };
                              setEditForm({ ...editForm, degrees: newDegrees });
                            }} />
                            <Input label="Chuyên ngành" value={deg.major} onChange={e => {
                              const newDegrees = [...(editForm.degrees || [])];
                              newDegrees[idx] = { ...newDegrees[idx], major: e.target.value };
                              setEditForm({ ...editForm, degrees: newDegrees });
                            }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                              <Input label="Năm tốt nghiệp" type="number" value={deg.graduationYear} onChange={e => {
                                const newDegrees = [...(editForm.degrees || [])];
                                newDegrees[idx] = { ...newDegrees[idx], graduationYear: parseInt(e.target.value) };
                                setEditForm({ ...editForm, degrees: newDegrees });
                              }} />
                              <Select label="Xếp loại" value={deg.degreeClassification} options={degreeClassifications.map(v => ({ value: v, label: DEGREE_CLASSIFICATION_LABELS[v] || v.toUpperCase() }))} onChange={e => {
                                const newDegrees = [...(editForm.degrees || [])];
                                newDegrees[idx] = { ...newDegrees[idx], degreeClassification: e.target.value };
                                setEditForm({ ...editForm, degrees: newDegrees });
                              }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Certificates Section */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <label style={{ fontSize: '14px', color: '#616161', fontWeight: 600 }}>Chứng chỉ</label>
                      <Button size="sm" variant="secondary" onClick={() => {
                        const newCerts = [...(editForm.certificates || []), { certificateType: 'ielts', score: '', provider: '', expiryDate: '' }];
                        setEditForm({ ...editForm, certificates: newCerts });
                      }}>+ Thêm chứng chỉ</Button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {(editForm.certificates || []).map((cert: any, idx: number) => (
                        <div key={idx} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', background: '#fafafa', position: 'relative' }}>
                          <button 
                            onClick={() => {
                              const newCerts = (editForm.certificates || []).filter((_: any, i: number) => i !== idx);
                              setEditForm({ ...editForm, certificates: newCerts });
                            }}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '18px' }}
                          >
                            ×
                          </button>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                             <Select 
                              label="Loại chứng chỉ" 
                              value={cert.certificateType} 
                              options={certificateTypes.map(v => ({ value: v, label: ENGLISH_CERTIFICATE_LABELS[v] || v.toUpperCase() }))} 
                              onChange={e => {
                                const newCerts = [...(editForm.certificates || [])];
                                newCerts[idx] = { ...newCerts[idx], certificateType: e.target.value };
                                setEditForm({ ...editForm, certificates: newCerts });
                              }} 
                            />
                            <Input label="Điểm số / Cấp độ" value={cert.score} onChange={e => {
                              const newCerts = [...(editForm.certificates || [])];
                              newCerts[idx] = { ...newCerts[idx], score: e.target.value };
                              setEditForm({ ...editForm, certificates: newCerts });
                            }} />
                            <Input label="Nơi cấp" value={cert.provider} onChange={e => {
                              const newCerts = [...(editForm.certificates || [])];
                              newCerts[idx] = { ...newCerts[idx], provider: e.target.value };
                              setEditForm({ ...editForm, certificates: newCerts });
                            }} />
                            <Input label="Ngày hết hạn" type="date" value={cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : ''} onChange={e => {
                              const newCerts = [...(editForm.certificates || [])];
                              newCerts[idx] = { ...newCerts[idx], expiryDate: e.target.value };
                              setEditForm({ ...editForm, certificates: newCerts });
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div style={{ gridColumn: 'span 2', display: "flex", gap: "12px", marginTop: "20px" }}>
                <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Đang gửi...' : 'Gửi yêu cầu xác nhận'}</Button>
                <Button variant="secondary" onClick={handleCancelEdit} disabled={isSaving}>Hủy</Button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {activeTab === 'personal' && (
                <>
                  <InfoItem label="Họ và tên" value={profile?.fullName} color="#1976d2" />
                  <InfoItem label="Giới tính" value={getGenderLabel(profile?.gender || '')} color="#00bcd4" />
                  <InfoItem label="Ngày sinh" value={profile?.dateOfBirth ? formatDate(profile.dateOfBirth) : '—'} color="#7c4dff" />
                  <InfoItem label="Tình trạng hôn nhân" value={MARITAL_STATUS_LABELS[profile?.maritalStatus as MaritalStatus] || '—'} color="#e91e63" />
                  <InfoItem label="Email cá nhân" value={profile?.personalEmail} color="#f44336" />
                  <InfoItem label="Số điện thoại" value={profile?.phone} color="#4caf50" />
                  <InfoItem label="Địa chỉ hiện tại" value={profile?.currentAddress} color="#ff9800" span={2} />
                  <InfoItem label="Địa chỉ thường trú" value={profile?.permanentAddress} color="#795548" span={2} />
                </>
              )}
              {activeTab === 'legal' && (
                <>
                  <InfoItem label="Số CCCD" value={profile?.nationalId} color="#607d8b" />
                  <InfoItem label="Mã số thuế" value={profile?.taxId} color="#3f51b5" />
                  <InfoItem label="Số sổ BHXH" value={profile?.insuranceId} color="#009688" />
                  <InfoItem label="Người liên hệ khẩn cấp" value={profile?.emergencyContactName} color="#e53935" />
                  <InfoItem label="Mối quan hệ" value={profile?.emergencyContactRelationship} color="#7b1fa2" />
                  <InfoItem label="SĐT khẩn cấp" value={profile?.emergencyContactPhone} color="#2e7d32" />
                </>
              )}
              {activeTab === 'bank' && (
                <>
                  <InfoItem label="Ngân hàng" value={profile?.bankName} color="#1565c0" />
                  <InfoItem label="Số tài khoản" value={profile?.bankAccount} color="#2e7d32" />
                  <InfoItem label="Số người phụ thuộc" value={profile?.dependentsCount?.toString()} color="#ef6c00" />
                </>
              )}
              {activeTab === 'career' && (
                <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  {/* Job Section */}
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#757575', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px', display: 'inline-block' }}>Thông tin công việc</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                      <InfoItem label="Phòng ban" value={profile?.departmentName} color="#1976d2" />
                      <InfoItem label="Chức danh" value={profile?.jobTitle} color="#7c4dff" />
                      <InfoItem label="Loại hình" value={getEmployeeTypeLabel(profile?.employeeType || '')} color="#4caf50" />
                      <InfoItem label="Ngày vào làm" value={profile?.hireDate ? formatDate(profile.hireDate) : '—'} color="#00bcd4" />
                      <InfoItem label="Lương cơ bản" value={profile?.baseSalary ? formatCurrency(profile.baseSalary) : '—'} color="#f44336" />
                      <InfoItem label="Tổng ngày phép" value={profile?.totalLeaveDays?.toString()} color="#ff9800" />
                      <InfoItem label="Phép còn lại" value={profile?.remainingLeaveDays?.toString()} color="#e91e63" />
                    </div>
                  </div>

                  {/* Qualifications Section */}
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#757575', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '8px', display: 'inline-block' }}>Trình độ & Bằng cấp</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                      {profile?.degrees && profile.degrees.length > 0 ? (
                        profile.degrees.map((deg, idx) => (
                          <div key={deg.id || idx} style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid #eee', paddingBottom: '24px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: '#757575', textTransform: 'uppercase', margin: 0 }}>Bằng tốt nghiệp {idx + 1 > 1 ? `(${idx + 1})` : ''}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                              <InfoItem label="Loại bằng" value={deg.educationLevel ? (EDUCATION_LEVEL_LABELS[deg.educationLevel] || deg.educationLevel.toUpperCase()) : '—'} color="#3f51b5" />
                              <InfoItem label="Chuyên ngành" value={deg.major || '—'} color="#009688" />
                              <InfoItem label="Trường" value={deg.schoolName || '—'} color="#795548" />
                              <InfoItem label="Năm tốt nghiệp" value={deg.graduationYear?.toString() || '—'} color="#607d8b" />
                              <InfoItem label="Xếp loại" value={deg.degreeClassification ? (DEGREE_CLASSIFICATION_LABELS[deg.degreeClassification] || deg.degreeClassification) : '—'} color="#e53935" />
                            </div>
                            {deg.certificateFileUrl && (
                              <div style={{ marginTop: '8px' }}>
                                <a href={deg.certificateFileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px', fontWeight: '500', color: '#000', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '4px', textDecoration: 'none' }}>📎 Xem file bằng cấp</a>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '14px', color: '#757575' }}>Chưa có dữ liệu bằng cấp</p>
                      )}

                      {profile?.certificates && profile.certificates.length > 0 ? (
                        profile.certificates.map((cert, idx) => (
                          <div key={cert.id || idx} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: '#757575', textTransform: 'uppercase', margin: 0 }}>Chứng chỉ {idx + 1 > 1 ? `(${idx + 1})` : ''}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                              <InfoItem label="Loại chứng chỉ" value={cert.certificateType?.toUpperCase() || '—'} color="#673ab7" />
                              <InfoItem label="Nơi cấp" value={cert.provider || '—'} color="#0097a7" />
                              <InfoItem label="Ngày hết hạn" value={cert.expiryDate ? formatDate(cert.expiryDate) : '—'} color="#5d4037" />
                            </div>
                            {cert.certificateFileUrl && (
                              <div style={{ marginTop: '16px' }}>
                                <a 
                                  href={cert.certificateFileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ 
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 14px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#000',
                                    backgroundColor: '#fff',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#000';
                                    e.currentTarget.style.backgroundColor = '#f9f9f9';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e0e0e0';
                                    e.currentTarget.style.backgroundColor = '#fff';
                                  }}
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                                  </svg>
                                  Xem tài liệu đính kèm
                                </a>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p style={{ fontSize: '14px', color: '#757575' }}>Chưa có dữ liệu chứng chỉ</p>
                      )}
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#757575', textTransform: 'uppercase', marginBottom: '8px' }}>Kinh nghiệm làm việc</p>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ width: '3px', height: '16px', backgroundColor: '#4caf50', borderRadius: '2px', marginTop: '4px', flexShrink: 0 }}></div>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: '#212121', whiteSpace: 'pre-line' }}>{profile?.experience || 'Chưa cập nhật dữ liệu'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatedModal title="Đổi mật khẩu" onClose={() => setShowPasswordModal(false)} show={showPasswordModal}>
        <div style={{ display: "grid", gap: "16px" }}>
          <Input label="Mật khẩu hiện tại" type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
          <Input label="Mật khẩu mới" type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
          <Input label="Xác nhận mật khẩu" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
          {passwordError && <div style={{ color: "#d32f2f", fontSize: "14px" }}>{passwordError}</div>}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>{isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}</Button>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Hủy</Button>
          </div>
        </div>
      </AnimatedModal>
    </div>
  );
}

function InfoItem({ label, value, color = "#000", span = 1 }: { label: string, value?: string, color?: string, span?: number }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <label style={{ display: "block", fontSize: "12px", color: "#9e9e9e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "3px", height: "16px", background: color, borderRadius: "2px" }} />
        <span style={{ fontSize: "15px", fontWeight: "400", color: "#212121" }}>{value || "—"}</span>
      </div>
    </div>
  );
}

function AnimatedModal({ title, onClose, children, show }: { title: string, onClose: () => void, children: React.ReactNode, show: boolean }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      anime({ targets: overlayRef.current, opacity: [0, 1], duration: 200, easing: "easeOutQuad" });
      anime({ targets: contentRef.current, opacity: [0, 1], scale: [0.9, 1], translateY: [-30, 0], duration: 400, easing: "easeOutBack" });
    }
  }, [show]);

  if (!show) return null;

  return (
    <div ref={overlayRef} className="modal-overlay" onClick={e => e.target === overlayRef.current && onClose()}>
      <div ref={contentRef} className="modal-content" style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

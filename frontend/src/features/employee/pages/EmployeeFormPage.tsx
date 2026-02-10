import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { useEmployeeDetail } from '../hooks/useEmployeeDetail';
import { GENDER_OPTIONS, EMPLOYEE_STATUS_OPTIONS, EMPLOYEE_TYPE_OPTIONS } from '../constants/employeeStatus';
import { ROUTES } from '../../../shared/constants/routes';
import { departmentApi } from '../../hr/services/department.api';
import { employeeApi } from '../services/employee.api';
import { Department } from '../../hr/models/department.model';
import { Employee } from '../models/employee.model';

export function EmployeeFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const { employee } = useEmployeeDetail(id || '');

    // Dropdown data
    const [departments, setDepartments] = useState<Department[]>([]);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

    // Supervisor search
    const [supervisorSearch, setSupervisorSearch] = useState('');
    const [showSupervisorDropdown, setShowSupervisorDropdown] = useState(false);
    const supervisorRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        employeeId: '',
        fullName: '',
        dateOfBirth: '',
        gender: '',
        nationalId: '',
        address: '',
        phone: '',
        departmentId: '',
        jobTitle: '',
        supervisorId: '',
        hireDate: '',
        status: '',
        baseSalary: '',
        allowance: '',
        employeeType: '',
    });

    // Fetch departments & employees list for dropdowns
    useEffect(() => {
        departmentApi.getAll().then(setDepartments).catch(console.error);
        employeeApi.getAll().then(setAllEmployees).catch(console.error);
    }, []);

    // Populate form in edit mode
    useEffect(() => {
        if (employee && isEditMode) {
            setFormData({
                employeeId: employee.id || '',
                fullName: employee.fullName || '',
                dateOfBirth: employee.dateOfBirth || '',
                gender: employee.gender || '',
                nationalId: employee.nationalId || '',
                address: employee.address || '',
                phone: employee.phone || '',
                departmentId: employee.departmentId || '',
                jobTitle: employee.jobTitle || '',
                supervisorId: employee.supervisorId || '',
                hireDate: employee.hireDate || '',
                status: employee.status || '',
                baseSalary: String(employee.baseSalary || ''),
                allowance: String(employee.allowance || ''),
                employeeType: employee.employeeType || '',
            });
            // Set supervisor search text for display
            const sup = allEmployees.find(e => e.id === employee.supervisorId);
            if (sup) setSupervisorSearch(`${sup.id} - ${sup.fullName}`);
        }
    }, [employee, isEditMode, allEmployees]);

    // Close supervisor dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (supervisorRef.current && !supervisorRef.current.contains(e.target as Node)) {
                setShowSupervisorDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter employees for supervisor dropdown
    const filteredSupervisors = useMemo(() => {
        const query = supervisorSearch.toLowerCase().trim();
        if (!query) return allEmployees;
        return allEmployees.filter(
            (emp) =>
                emp.id.toLowerCase().includes(query) ||
                emp.fullName.toLowerCase().includes(query)
        );
    }, [allEmployees, supervisorSearch]);

    // Department options from API
    const departmentOptions = useMemo(
        () => departments.map((d) => ({ value: d.id, label: d.name })),
        [departments]
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Call API to save employee
        console.log('Submitting:', formData);
        navigate(ROUTES.EMPLOYEES);
    };

    const handleReset = () => {
        navigate(ROUTES.EMPLOYEES);
    };

    const handleSelectSupervisor = (emp: Employee) => {
        setFormData({ ...formData, supervisorId: emp.id });
        setSupervisorSearch(`${emp.id} - ${emp.fullName}`);
        setShowSupervisorDropdown(false);
    };

    return (
        <>
            <header>
                <h1 style={{ fontSize: '22px' }}>{isEditMode ? 'CẬP NHẬT NHÂN VIÊN' : 'Thêm nhân viên'}</h1>
            </header>
            <main style={{ marginTop: '24px' }}>
                <form id="employee-form" onSubmit={handleSubmit}>
                    {/* ====== THÔNG TIN CÁ NHÂN ====== */}
                    <section className="form-section" id="personal-details">
                        <h2>Thông tin cá nhân</h2>

                        <Input
                            label="Họ và tên"
                            name="full_name"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />

                        <Input
                            type="date"
                            label="Ngày sinh"
                            name="dob"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />

                        <Select
                            label="Giới tính"
                            name="gender"
                            options={GENDER_OPTIONS}
                            placeholder="Chọn"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        />

                        <Input
                            label="Số CCCD"
                            name="national_id"
                            value={formData.nationalId}
                            onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                        />

                        <Input
                            label="Địa chỉ"
                            name="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />

                        <Input
                            label="Số điện thoại"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </section>

                    {/* ====== THÔNG TIN CÔNG VIỆC ====== */}
                    <section className="form-section" id="job-details">
                        <h2>Thông tin công việc</h2>

                        <Input
                            label="Mã nhân viên (ID)"
                            name="employee_id"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        />

                        <Select
                            label="Phòng ban"
                            name="department_id"
                            options={departmentOptions}
                            placeholder="Chọn phòng ban"
                            value={formData.departmentId}
                            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                        />

                        <Input
                            label="Chức danh"
                            name="job_title"
                            placeholder="Nhập chức danh (VD: Trưởng phòng, Nhân viên...)"
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        />

                        {/* Supervisor - Searchable Dropdown */}
                        <div className="form-group" ref={supervisorRef}>
                            <label>Quản lý trực tiếp</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="form-input"
                                    placeholder="Tìm theo ID hoặc họ tên..."
                                    value={supervisorSearch}
                                    onChange={(e) => {
                                        setSupervisorSearch(e.target.value);
                                        setShowSupervisorDropdown(true);
                                        // Clear selection if user edits text
                                        if (formData.supervisorId) {
                                            setFormData({ ...formData, supervisorId: '' });
                                        }
                                    }}
                                    onFocus={() => setShowSupervisorDropdown(true)}
                                />
                                {showSupervisorDropdown && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            background: 'white',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            zIndex: 100,
                                            marginTop: '4px',
                                        }}
                                    >
                                        {filteredSupervisors.length === 0 ? (
                                            <div
                                                style={{
                                                    padding: '12px 16px',
                                                    color: '#9e9e9e',
                                                    fontSize: '13px',
                                                }}
                                            >
                                                Không tìm thấy nhân viên
                                            </div>
                                        ) : (
                                            filteredSupervisors.map((emp) => (
                                                <div
                                                    key={emp.id}
                                                    onClick={() => handleSelectSupervisor(emp)}
                                                    style={{
                                                        padding: '10px 16px',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid #f5f5f5',
                                                        fontSize: '14px',
                                                        transition: 'background 0.15s',
                                                    }}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.background = '#f0f7ff')
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.background = 'white')
                                                    }
                                                >
                                                    <span style={{ fontWeight: 600, color: '#1976d2' }}>
                                                        {emp.id}
                                                    </span>
                                                    <span style={{ margin: '0 8px', color: '#bdbdbd' }}>
                                                        —
                                                    </span>
                                                    <span>{emp.fullName}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Input
                            type="date"
                            label="Ngày vào làm"
                            name="hire_date"
                            value={formData.hireDate}
                            onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                        />

                        <Select
                            label="Trạng thái làm việc"
                            name="status"
                            options={EMPLOYEE_STATUS_OPTIONS}
                            placeholder="Chọn trạng thái"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        />

                        <Input
                            type="number"
                            label="Lương cơ bản"
                            name="base_salary"
                            value={formData.baseSalary}
                            onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                        />

                        <Input
                            type="number"
                            label="Phụ cấp"
                            name="allowance"
                            value={formData.allowance}
                            onChange={(e) => setFormData({ ...formData, allowance: e.target.value })}
                        />

                        <Select
                            label="Loại hình"
                            name="employee_type"
                            options={EMPLOYEE_TYPE_OPTIONS}
                            placeholder="Chọn loại hình"
                            value={formData.employeeType}
                            onChange={(e) => setFormData({ ...formData, employeeType: e.target.value })}
                        />
                    </section>

                    <div className="form-actions">
                        <Button type="submit">Lưu</Button>
                        <Button type="button" variant="secondary" onClick={handleReset}>
                            Hủy
                        </Button>
                    </div>
                </form>
            </main>
        </>
    );
}

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { useEmployeeDetail } from '../hooks/useEmployeeDetail';
import { GENDER_OPTIONS, EMPLOYEE_STATUS_OPTIONS } from '../constants/employeeStatus';
import { ROUTES } from '../../../shared/constants/routes';

export function EmployeeFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const { employee } = useEmployeeDetail(id || '');

    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        nationalId: '',
        department: '',
        jobTitle: '',
        supervisor: '',
        status: '',
        salary: '',
        allowance: '',
        bankAccount: '',
    });

    useEffect(() => {
        if (employee && isEditMode) {
            setFormData({
                fullName: employee.fullName || '',
                dateOfBirth: employee.dateOfBirth || '',
                gender: employee.gender || '',
                nationalId: employee.nationalId || '',
                department: employee.department || '',
                jobTitle: employee.jobTitle || '',
                supervisor: employee.supervisor || '',
                status: employee.status || '',
                salary: String(employee.salary || ''),
                allowance: String(employee.allowance || ''),
                bankAccount: employee.bankAccount || '',
            });
        }
    }, [employee, isEditMode]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Call API to save employee
        console.log('Submitting:', formData);
        navigate(ROUTES.EMPLOYEES);
    };

    const handleReset = () => {
        navigate(ROUTES.EMPLOYEES);
    };

    return (
        <>
            <header>
                <h1>{isEditMode ? 'CẬP NHẬT NHÂN VIÊN' : 'THÊM NHÂN VIÊN'}</h1>
            </header>

            <main>
                <form id="employee-form" onSubmit={handleSubmit}>
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
                    </section>

                    <section className="form-section" id="job-details">
                        <h2>Thông tin công việc</h2>

                        <Select
                            label="Phòng ban"
                            name="department"
                            options={[]}
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        />

                        <Select
                            label="Chức danh"
                            name="job_title"
                            options={[]}
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        />

                        <Input
                            label="Quản lý trực tiếp"
                            name="supervisor"
                            value={formData.supervisor}
                            onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                        />

                        <Select
                            label="Trạng thái làm việc"
                            name="status"
                            options={EMPLOYEE_STATUS_OPTIONS}
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        />
                    </section>

                    <section className="form-section" id="salary-details">
                        <h2>Lương và phụ cấp</h2>

                        <Input
                            type="number"
                            label="Lương cơ bản"
                            name="salary"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        />

                        <Input
                            type="number"
                            label="Phụ cấp"
                            name="allowance"
                            value={formData.allowance}
                            onChange={(e) => setFormData({ ...formData, allowance: e.target.value })}
                        />

                        <Input
                            label="Tài khoản ngân hàng"
                            name="bank_account"
                            value={formData.bankAccount}
                            onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
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

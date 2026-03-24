import { useState, useEffect } from 'react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { EmployeeSearchParams } from '../models/employee.model';
import { EMPLOYEE_STATUS_OPTIONS } from '../constants/employeeStatus';
import { departmentApi } from '../../hr/services/department.api';
import { Department } from '../../hr/models/department.model';

interface EmployeeSearchFormProps {
    onSearch: (params: EmployeeSearchParams) => void;
}

export function EmployeeSearchForm({ onSearch }: EmployeeSearchFormProps) {
    const [searchParams, setSearchParams] = useState<EmployeeSearchParams>({
        employeeName: '',
        employeeId: '',
        status: '',
        departmentId: '',
        educationLevel: '',
        englishCertificate: '',
        schoolName: '',
        tenure: '',
        totalLeaveDays: '',
        totalLeaveDaysOp: 'gte',
        remainingLeaveDays: '',
        remainingLeaveDaysOp: 'gte',
        baseSalary: '',
        baseSalaryOp: 'gte',
    });

    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const result = await departmentApi.getAll();
                setDepartments(result);
            } catch (error) {
                console.error('Failed to fetch departments:', error);
            }
        };
        fetchDepartments();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchParams);
    };

    const handleReset = () => {
        const emptyParams: EmployeeSearchParams = {
            employeeName: '',
            employeeId: '',
            status: '',
            departmentId: '',
            educationLevel: '',
            englishCertificate: '',
            schoolName: '',
            tenure: '',
            totalLeaveDays: '',
            totalLeaveDaysOp: 'gte',
            remainingLeaveDays: '',
            remainingLeaveDaysOp: 'gte',
            baseSalary: '',
            baseSalaryOp: 'gte',
        };
        setSearchParams(emptyParams);
        onSearch(emptyParams);
    };

    // Tạo options cho phòng ban từ API
    const departmentOptions = departments.map(dept => ({
        value: dept.id,
        label: dept.name,
    }));

    return (
        <form className="search-form" onSubmit={handleSubmit}>
            <div className="search-form-grid">
                <div className="form-group">
                    <Input
                        label="Tên nhân viên"
                        name="employee_name"
                        placeholder="Nhập tên nhân viên..."
                        value={searchParams.employeeName}
                        onChange={(e) =>
                            setSearchParams({ ...searchParams, employeeName: e.target.value })
                        }
                    />
                </div>

                <div className="form-group">
                    <Input
                        label="Mã nhân viên"
                        name="employee_id"
                        placeholder="VD: 00001"
                        value={searchParams.employeeId}
                        onChange={(e) =>
                            setSearchParams({ ...searchParams, employeeId: e.target.value })
                        }
                    />
                </div>

                <div className="form-group">
                    <Select
                        label="Phòng ban"
                        name="department_id"
                        options={departmentOptions}
                        placeholder="Tất cả phòng ban"
                        value={searchParams.departmentId}
                        onChange={(e) =>
                            setSearchParams({ ...searchParams, departmentId: e.target.value })
                        }
                    />
                </div>

                <div className="form-group">
                    <Select
                        label="Trạng thái"
                        name="status"
                        options={EMPLOYEE_STATUS_OPTIONS}
                        placeholder="Tất cả trạng thái"
                        value={searchParams.status}
                        onChange={(e) =>
                            setSearchParams({ ...searchParams, status: e.target.value })
                        }
                    />
                </div>

                <div className="form-group">
                    <Select
                        label="Trình độ học vấn"
                        name="educationLevel"
                        options={[
                            { value: 'under_high_school', label: 'Dưới cấp 3' },
                            { value: 'high_school', label: 'Cấp 3' },
                            { value: 'college', label: 'Cao đẳng' },
                            { value: 'university', label: 'Đại học' },
                            { value: 'master', label: 'Thạc sĩ' },
                            { value: 'phd', label: 'Tiến sĩ' }
                        ]}
                        placeholder="Tất cả trình độ"
                        value={searchParams.educationLevel}
                        onChange={(e) =>
                            setSearchParams({ ...searchParams, educationLevel: e.target.value })
                        }
                    />
                </div>

                <div className="form-group">
                    <Select
                        label="Ngoại ngữ"
                        name="englishCertificate"
                        options={[
                            { value: 'vstep', label: 'VSTEP' },
                            { value: 'ielts', label: 'IELTS' },
                            { value: 'toeic', label: 'TOEIC' },
                            { value: 'toefl', label: 'TOEFL' },
                            { value: 'none', label: 'Không có' },
                            { value: 'other', label: 'Khác' }
                        ]}
                        placeholder="Tất cả chứng chỉ"
                        value={searchParams.englishCertificate}
                        onChange={(e) =>
                            setSearchParams({ ...searchParams, englishCertificate: e.target.value })
                        }
                    />
                </div>

                <div className="form-group">
                    <Select
                        label="Thâm niên"
                        name="tenure"
                        options={[
                            { value: '<1', label: 'Dưới 1 năm' },
                            { value: '1-3', label: 'Từ 1 đến 3 năm' },
                            { value: '3-5', label: 'Từ 3 đến 5 năm' },
                            { value: '>5', label: 'Trên 5 năm' },
                        ]}
                        placeholder="Tất cả thời gian"
                        value={searchParams.tenure}
                        onChange={(e) =>
                            setSearchParams({ ...searchParams, tenure: e.target.value })
                        }
                    />
                </div>

                <div className="form-group">
                    <Input
                        label="Tên trường học"
                        name="schoolName"
                        placeholder="Ví dụ: Đại học FPT..."
                        value={searchParams.schoolName}
                        onChange={(e) =>
                            setSearchParams({ ...searchParams, schoolName: e.target.value })
                        }
                    />
                </div>

                <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <Select
                            label="Tổng ngày phép"
                            name="totalLeaveDaysOp"
                            options={[
                                { value: 'gte', label: 'Lớn hơn' },
                                { value: 'lte', label: 'Nhỏ hơn' }
                            ]}
                            value={searchParams.totalLeaveDaysOp || 'gte'}
                            onChange={(e) => setSearchParams({ ...searchParams, totalLeaveDaysOp: e.target.value as any })}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Input
                            label="&nbsp;"
                            name="totalLeaveDays"
                            type="number"
                            placeholder="Số ngày..."
                            value={searchParams.totalLeaveDays as string}
                            onChange={(e) => setSearchParams({ ...searchParams, totalLeaveDays: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <Select
                            label="Phép còn lại"
                            name="remainingLeaveDaysOp"
                            options={[
                                { value: 'gte', label: 'Lớn hơn' },
                                { value: 'lte', label: 'Nhỏ hơn' }
                            ]}
                            value={searchParams.remainingLeaveDaysOp || 'gte'}
                            onChange={(e) => setSearchParams({ ...searchParams, remainingLeaveDaysOp: e.target.value as any })}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Input
                            label="&nbsp;"
                            name="remainingLeaveDays"
                            type="number"
                            placeholder="Số ngày..."
                            value={searchParams.remainingLeaveDays as string}
                            onChange={(e) => setSearchParams({ ...searchParams, remainingLeaveDays: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <Select
                            label="Lương cơ bản"
                            name="baseSalaryOp"
                            options={[
                                { value: 'gte', label: 'Lớn hơn' },
                                { value: 'lte', label: 'Nhỏ hơn' }
                            ]}
                            value={searchParams.baseSalaryOp || 'gte'}
                            onChange={(e) => setSearchParams({ ...searchParams, baseSalaryOp: e.target.value as any })}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Input
                            label="&nbsp;"
                            name="baseSalary"
                            type="number"
                            placeholder="VND..."
                            value={searchParams.baseSalary as string}
                            onChange={(e) => setSearchParams({ ...searchParams, baseSalary: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', transform: 'translateY(6px)' }}>
                    <Button type="submit" style={{ width: '100%' }}>Tìm kiếm</Button>
                    <Button type="button" variant="secondary" onClick={handleReset} style={{ width: '100%' }}>
                        Đặt lại
                    </Button>
                </div>
            </div>
        </form>
    );
}

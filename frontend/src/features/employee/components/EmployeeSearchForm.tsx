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
        const emptyParams = {
            employeeName: '',
            employeeId: '',
            status: '',
            departmentId: '',
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
                        placeholder="VD: NV001"
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
            </div>

            <div className="form-actions">
                <Button type="submit">Tìm kiếm</Button>
                <Button type="button" variant="secondary" onClick={handleReset}>
                    Đặt lại
                </Button>
            </div>
        </form>
    );
}

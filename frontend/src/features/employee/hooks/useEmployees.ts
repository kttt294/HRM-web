import { useState, useCallback, useEffect } from 'react';
import { Employee, EmployeeSearchParams } from '../models/employee.model';
import { employeeApi } from '../services/employee.api';

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEmployees = useCallback(async (params?: EmployeeSearchParams) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await employeeApi.getAll(params);
            setEmployees(data);
        } catch (err) {
            setError('Không thể tải danh sách nhân viên');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const searchEmployees = useCallback((params: EmployeeSearchParams) => {
        fetchEmployees(params);
    }, [fetchEmployees]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    return {
        employees,
        isLoading,
        error,
        fetchEmployees,
        searchEmployees,
    };
}

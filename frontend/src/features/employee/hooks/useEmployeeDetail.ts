import { useState, useEffect } from 'react';
import { Employee } from '../models/employee.model';
import { employeeApi } from '../services/employee.api';

export function useEmployeeDetail(id: string) {
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchEmployee = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await employeeApi.getById(id);
                setEmployee(data);
            } catch (err) {
                setError('Không thể tải thông tin nhân viên');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEmployee();
    }, [id]);

    const updateEmployee = async (data: Partial<Employee>) => {
        if (!id) return;

        setIsLoading(true);
        try {
            const updated = await employeeApi.update(id, data);
            setEmployee(updated);
            return updated;
        } catch (err) {
            setError('Không thể cập nhật thông tin nhân viên');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        employee,
        isLoading,
        error,
        updateEmployee,
    };
}

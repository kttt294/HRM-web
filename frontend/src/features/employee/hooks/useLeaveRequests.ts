import { useState, useCallback, useEffect } from 'react';
import { LeaveRequest } from '../models/leave.model';
import { leaveApi } from '../services/leave.api';

export function useLeaveRequests(employeeId?: string) {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLeaveRequests = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await leaveApi.getAll(employeeId);
            setLeaveRequests(data);
        } catch (err) {
            setError('Không thể tải danh sách nghỉ phép');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [employeeId]);

    const createLeaveRequest = async (request: Partial<LeaveRequest>) => {
        setIsLoading(true);
        try {
            const created = await leaveApi.create(request);
            setLeaveRequests((prev) => [...prev, created]);
            return created;
        } catch (err) {
            setError('Không thể tạo yêu cầu nghỉ phép');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    return {
        leaveRequests,
        isLoading,
        error,
        fetchLeaveRequests,
        createLeaveRequest,
    };
}

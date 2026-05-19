/**
 * Unit Tests: hooks
 * 
 * Kiểm thử các custom hooks chính:
 * - useEmployees: fetching và searching
 * - useLeaveRequests: fetching theo role và create mới
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEmployees } from '../../features/employee/hooks/useEmployees';
import { useLeaveRequests } from '../../features/employee/hooks/useLeaveRequests';
import { employeeApi } from '../../features/employee/services/employee.api';
import { leaveApi } from '../../features/employee/services/leave.api';

// Mock các API services
vi.mock('../../features/employee/services/employee.api', () => ({
    employeeApi: {
        getAll: vi.fn(),
        getById: vi.fn(),
    },
}));

vi.mock('../../features/employee/services/leave.api', () => ({
    leaveApi: {
        getAll: vi.fn(),
        getByEmployee: vi.fn(),
        create: vi.fn(),
    },
}));

describe('Custom Hooks', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // =====================================================
    // useEmployees
    // =====================================================
    describe('useEmployees', () => {
        const mockEmployees = [
            { id: 1, fullName: 'John Doe', department: 'IT' },
            { id: 2, fullName: 'Jane Smith', department: 'HR' },
        ];

        it('nên fetch danh sách nhân viên khi mount', async () => {
            vi.mocked(employeeApi.getAll).mockResolvedValueOnce(mockEmployees as any);

            const { result } = renderHook(() => useEmployees());

            // Initial state
            expect(result.current.isLoading).toBe(true);
            expect(result.current.employees).toEqual([]);

            // Wait for fetch to complete
            await act(async () => {
                await Promise.resolve();
            });

            expect(employeeApi.getAll).toHaveBeenCalledWith(undefined);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.employees).toEqual(mockEmployees);
            expect(result.current.error).toBeNull();
        });

        it('nên bắt lỗi và set error nếu fetch thất bại', async () => {
            vi.mocked(employeeApi.getAll).mockRejectedValueOnce(new Error('Network Error'));

            const { result } = renderHook(() => useEmployees());

            await act(async () => {
                await Promise.resolve();
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBe('Không thể tải danh sách nhân viên');
            expect(result.current.employees).toEqual([]);
        });

        it('hàm searchEmployees nên gọi api với params truyền vào', async () => {
            vi.mocked(employeeApi.getAll).mockResolvedValueOnce([] as any); // mount fetch
            const { result } = renderHook(() => useEmployees());

            await act(async () => {
                await Promise.resolve();
            });

            // Mock lại cho lượt gọi search
            vi.mocked(employeeApi.getAll).mockResolvedValueOnce([mockEmployees[0]] as any);

            await act(async () => {
                result.current.searchEmployees({ employeeName: 'John' });
            });

            expect(employeeApi.getAll).toHaveBeenCalledWith({ employeeName: 'John' });
            expect(result.current.employees).toEqual([mockEmployees[0]]);
        });
    });

    // =====================================================
    // useLeaveRequests
    // =====================================================
    describe('useLeaveRequests', () => {
        const mockLeaves = [
            { id: 1, leaveType: 'annual', status: 'pending' },
            { id: 2, leaveType: 'sick', status: 'approved' },
        ];

        it('nên gọi getByEmployee nếu có employeeId', async () => {
            vi.mocked(leaveApi.getByEmployee).mockResolvedValueOnce(mockLeaves as any);

            const { result } = renderHook(() => useLeaveRequests('EMP001'));

            await act(async () => {
                await Promise.resolve();
            });

            expect(leaveApi.getByEmployee).toHaveBeenCalledWith('EMP001');
            expect(leaveApi.getAll).not.toHaveBeenCalled();
            expect(result.current.leaveRequests).toEqual(mockLeaves);
        });

        it('nên gọi getAll nếu không có employeeId', async () => {
            vi.mocked(leaveApi.getAll).mockResolvedValueOnce({ requests: mockLeaves, pagination: {} } as any);

            const { result } = renderHook(() => useLeaveRequests());

            await act(async () => {
                await Promise.resolve();
            });

            expect(leaveApi.getAll).toHaveBeenCalled();
            expect(result.current.leaveRequests).toEqual(mockLeaves);
        });

        it('nên xử lý lỗi khi fetch thất bại', async () => {
            vi.mocked(leaveApi.getAll).mockRejectedValueOnce(new Error('Lỗi 500'));

            const { result } = renderHook(() => useLeaveRequests());

            await act(async () => {
                await Promise.resolve();
            });

            expect(result.current.error).toBe('Không thể tải danh sách nghỉ phép');
            expect(result.current.leaveRequests).toEqual([]);
        });

        it('createLeaveRequest nên thêm request mới vào danh sách', async () => {
            vi.mocked(leaveApi.getAll).mockResolvedValueOnce({ requests: [], pagination: {} } as any);
            const { result } = renderHook(() => useLeaveRequests());

            await act(async () => {
                await Promise.resolve();
            });

            const newLeave = { id: 99, leaveType: 'annual', status: 'pending' };
            vi.mocked(leaveApi.create).mockResolvedValueOnce(newLeave as any);

            let created;
            await act(async () => {
                created = await result.current.createLeaveRequest({ leaveType: 'annual' } as any);
            });

            expect(leaveApi.create).toHaveBeenCalledWith({ leaveType: 'annual' });
            expect(created).toEqual(newLeave);
            // Danh sách cập nhật thêm phần tử mới
            expect(result.current.leaveRequests).toEqual([newLeave]);
        });
    });
});

import { useState, useCallback } from 'react';
import { CandidateStatus } from '../models/candidate.model';
import { candidateApi, ApiError } from '../services/candidate.api';
import { useSnackbarStore } from '../../../store/snackbar.store';
import { useAuthStore } from '../../../store/auth.store';

export function useUpdateCandidateStatus() {
    const [isUpdating, setIsUpdating] = useState(false);
    const showSnackbar = useSnackbarStore((s) => s.showSnackbar);

    const updateStatus = useCallback(
        async (id: string, status: CandidateStatus): Promise<boolean> => {
            setIsUpdating(true);
            try {
                await candidateApi.updateStatus(id, status);
                showSnackbar('Cập nhật trạng thái thành công', 'success');
                return true;
            } catch (err) {
                if (err instanceof ApiError) {
                    switch (err.status) {
                        case 401:
                            useAuthStore.getState().logout();
                            break;
                        case 403:
                            showSnackbar('Bạn không có quyền thực hiện thao tác này', 'error');
                            break;
                        case 404:
                            showSnackbar('Không tìm thấy ứng viên', 'error');
                            break;
                        default:
                            showSnackbar('Lỗi hệ thống', 'error');
                            break;
                    }
                } else {
                    showSnackbar('Lỗi hệ thống', 'error');
                }
                return false;
            } finally {
                setIsUpdating(false);
            }
        },
        [showSnackbar]
    );

    return { updateStatus, isUpdating };
}

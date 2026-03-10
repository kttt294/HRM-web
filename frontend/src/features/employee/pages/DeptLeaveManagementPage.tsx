import { useState, useEffect, useRef } from 'react';
import { leaveApi } from '../../employee/services/leave.api';
import { LeaveRequest } from '../../employee/models/leave.model';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import anime from 'animejs';
import { useSnackbarStore } from '../../../store/snackbar.store';

/**
 * ============================================
 * DEPT LEAVE MANAGEMENT PAGE - MANAGER
 * ============================================
 * Duyệt / Từ chối đơn nghỉ phép của nhân viên trong phòng
 */

type LeaveWithName = LeaveRequest & { employeeName: string; employeeIdPadded?: string; approvedByName?: string; };

export function DeptLeaveManagementPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [requests, setRequests] = useState<LeaveWithName[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('pending');
    const [actionModal, setActionModal] = useState<{
        open: boolean;
        request: LeaveWithName | null;
        action: 'approve' | 'reject';
    }>({
        open: false,
        request: null,
        action: 'approve'
    });
    const { showSnackbar } = useSnackbarStore();

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const params: { status?: string } = {};
            if (statusFilter) params.status = statusFilter;
            
            const result = await leaveApi.getAll(params);
            setRequests(result.requests);
        } catch (err) {
            console.error('Failed to fetch department leave requests:', err);
            setError(err instanceof Error ? err.message : "Không thể tải danh sách đơn nghỉ phép");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    useEffect(() => {
        if (containerRef.current && !loading) {
            anime({
                targets: containerRef.current.querySelectorAll('.request-row'),
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                delay: anime.stagger(50),
                easing: 'easeOutQuart',
            });
        }
    }, [loading, requests]);

    const handleAction = async () => {
        if (!actionModal.request) return;
        const { id } = actionModal.request;
        const action = actionModal.action;
        
        try {
            if (action === 'approve') {
                await leaveApi.approve(id);
            } else {
                await leaveApi.reject(id);
            }
            fetchRequests();
            const actionText = action === 'approve' ? 'Duyệt' : 'Từ chối';
            showSnackbar(`${actionText} đơn thành công`, 'success');
        } catch (err) {
            showSnackbar(err instanceof Error ? err.message : 'Lỗi xử lý đơn', 'error');
        } finally {
            setActionModal({ open: false, request: null, action: 'approve' });
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getLeaveTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            annual: 'Nghỉ phép năm',
            sick: 'Nghỉ ốm',
            unpaid: 'Nghỉ không lương',
            maternity: 'Nghỉ thai sản',
            other: 'Khác',
        };
        return types[type] || type;
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Chờ duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối',
        };
        return labels[status] || status;
    };

    if (error) {
        return (
            <div className="p-4">
                <div className="card" style={{ borderLeft: '4px solid #f44336' }}>
                    <div className="card-body">
                        <p style={{ color: '#f44336', fontWeight: 600 }}>Lỗi: {error}</p>
                        <Button onClick={fetchRequests}>Thử lại</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef}>
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Duyệt nghỉ phép phòng ban</h1>
                    <p className="page-subtitle">Quản lý các yêu cầu nghỉ phép của nhân viên trong phòng</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        fontSize: '14px',
                        minWidth: '200px',
                    }}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Đang chờ duyệt</option>
                    <option value="approved">Đã duyệt (Chung)</option>
                    <option value="rejected">Đã từ chối (Chung)</option>
                </select>
            </div>

            <div className="card">
                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>
                    ) : requests.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                            Không có yêu cầu nào
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={{ padding: '14px 16px', textAlign: 'left' }}>Nhân viên</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left' }}>Loại nghỉ</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left' }}>Thời gian</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left' }}>Lý do</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request.id} className="request-row" style={{ borderBottom: '1px solid #eee', opacity: 0 }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 500 }}>{request.employeeName}</td>
                                        <td style={{ padding: '14px 16px' }}>{getLeaveTypeLabel(request.leaveType)}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>{request.reason}</td>
                                         <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                            {request.status === 'pending' ? (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <Button size="sm" onClick={() => setActionModal({ open: true, request, action: 'approve' })}>Duyệt</Button>
                                                    <Button size="sm" variant="danger" onClick={() => setActionModal({ open: true, request, action: 'reject' })}>Từ chối</Button>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                                    <span className={`status-badge status-${request.status}`}>
                                                        {getStatusLabel(request.status)}
                                                    </span>
                                                    {request.approvedByName && (
                                                        <span style={{ fontSize: '11px', color: '#757575' }}>Bởi {request.approvedByName}</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
             </div>
 
             {/* Action Modal */}
             <Modal
                 isOpen={actionModal.open}
                 onClose={() => setActionModal({ open: false, request: null, action: 'approve' })}
                 title={actionModal.action === 'approve' ? 'Duyệt đơn nghỉ phép' : 'Từ chối đơn nghỉ phép'}
             >
                 <div style={{ marginBottom: '24px' }}>
                     <p>
                         Bạn có chắc muốn <strong>{actionModal.action === 'approve' ? 'duyệt' : 'từ chối'}</strong> đơn
                         nghỉ phép của <strong>{actionModal.request?.employeeName}</strong>?
                     </p>
                     {actionModal.request && (
                         <div style={{ 
                             marginTop: '16px', 
                             padding: '12px', 
                             background: '#f5f5f5', 
                             borderRadius: '8px',
                             fontSize: '14px',
                         }}>
                             <div><strong>Loại:</strong> {getLeaveTypeLabel(actionModal.request.leaveType)}</div>
                             <div><strong>Thời gian:</strong> {formatDate(actionModal.request.startDate)} - {formatDate(actionModal.request.endDate)}</div>
                             <div><strong>Lý do:</strong> {actionModal.request.reason}</div>
                         </div>
                     )}
                 </div>
                 <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                     <Button 
                         variant="secondary" 
                         onClick={() => setActionModal({ open: false, request: null, action: 'approve' })}
                     >
                         Hủy
                     </Button>
                     <Button 
                         variant={actionModal.action === 'approve' ? 'primary' : 'danger'}
                         onClick={handleAction}
                     >
                         {actionModal.action === 'approve' ? 'Duyệt' : 'Từ chối'}
                     </Button>
                 </div>
             </Modal>
         </div>
     );
 }

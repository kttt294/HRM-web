import { useState, useEffect, useRef } from 'react';
import { leaveApi } from '../../employee/services/leave.api';
import { LeaveRequest } from '../../employee/models/leave.model';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import anime from 'animejs';
import { useSnackbarStore } from '../../../store/snackbar.store';

/**
 * ============================================
 * LEAVE MANAGEMENT PAGE - HR
 * ============================================
 * Duyệt / Từ chối đơn nghỉ phép từ nhân viên
 */

type LeaveWithName = LeaveRequest & { employeeName: string };

export function LeaveManagementPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [requests, setRequests] = useState<LeaveWithName[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [actionModal, setActionModal] = useState<{ open: boolean; request: LeaveWithName | null; action: 'approve' | 'reject' }>({
        open: false,
        request: null,
        action: 'approve',
    });
    const { showSnackbar } = useSnackbarStore();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const params: { status?: string; leaveType?: string } = {};
            if (statusFilter) params.status = statusFilter;
            if (typeFilter) params.leaveType = typeFilter;
            
            const result = await leaveApi.getAll(params);
            setRequests(result.requests);
        } catch (error) {
            console.error('Failed to fetch leave requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter, typeFilter]);

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
        
        try {
            if (actionModal.action === 'approve') {
                await leaveApi.approve(actionModal.request.id);
            } else {
                await leaveApi.reject(actionModal.request.id);
            }
            setActionModal({ open: false, request: null, action: 'approve' });
            fetchRequests();
            const actionText = actionModal.action === 'approve' ? 'Duyệt' : 'Từ chối';
            showSnackbar(`${actionText} đơn thành công`, 'success');
        } catch (error) {
            showSnackbar(error instanceof Error ? error.message : 'Lỗi xử lý đơn', 'error');
        }
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

    const getLeaveTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            annual: '#1976d2',
            sick: '#f44336',
            unpaid: '#ff9800',
            maternity: '#9c27b0',
            other: '#607d8b',
        };
        return colors[type] || '#757575';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Chờ duyệt',
            approved: 'Đã duyệt',
            rejected: 'Từ chối',
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: '#ff9800',
            approved: '#4caf50',
            rejected: '#f44336',
        };
        return colors[status] || '#757575';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getDaysCount = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    // Stats
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const approvedCount = requests.filter(r => r.status === 'approved').length;
    const rejectedCount = requests.filter(r => r.status === 'rejected').length;

    return (
        <div ref={containerRef}>
            {/* Header */}
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Quản lý nghỉ phép</h1>
                    <p className="page-subtitle">
                        Xem xét và phê duyệt các đơn xin nghỉ phép từ nhân viên
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <StatCard label="Chờ duyệt" value={pendingCount} color="#ff9800" />
                <StatCard label="Đã duyệt" value={approvedCount} color="#4caf50" />
                <StatCard label="Từ chối" value={rejectedCount} color="#f44336" />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#757575' }}>
                        Trạng thái
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            fontSize: '14px',
                            minWidth: '150px',
                        }}
                    >
                        <option value="">Tất cả</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="rejected">Từ chối</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#757575' }}>
                        Loại nghỉ
                    </label>
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            fontSize: '14px',
                            minWidth: '150px',
                        }}
                    >
                        <option value="">Tất cả</option>
                        <option value="annual">Nghỉ phép năm</option>
                        <option value="sick">Nghỉ ốm</option>
                        <option value="unpaid">Nghỉ không lương</option>
                        <option value="maternity">Nghỉ thai sản</option>
                    </select>
                </div>
            </div>

            {/* Request Table */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                overflow: 'hidden',
            }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                        Đang tải...
                    </div>
                ) : requests.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                        Không có đơn nghỉ phép nào
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5' }}>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
                                    Nhân viên
                                </th>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
                                    Mã NV
                                </th>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
                                    Loại nghỉ
                                </th>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
                                    Thời gian
                                </th>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
                                    Lý do
                                </th>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
                                    Trạng thái
                                </th>
                                <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', fontSize: '13px' }}>
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request) => (
                                <tr
                                    key={request.id}
                                    className="request-row"
                                    style={{ borderBottom: '1px solid #f0f0f0', opacity: 0 }}
                                >
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ fontWeight: '500' }}>{request.employeeName}</div>
                                        <div style={{ fontSize: '12px', color: '#757575' }}>
                                            {formatDate(request.createdAt)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#616161', fontFamily: 'monospace' }}>
                                        {request.employeeId}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            background: `${getLeaveTypeColor(request.leaveType)}15`,
                                            color: getLeaveTypeColor(request.leaveType),
                                        }}>
                                            {getLeaveTypeLabel(request.leaveType)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div>{formatDate(request.startDate)} - {formatDate(request.endDate)}</div>
                                        <div style={{ fontSize: '12px', color: '#757575' }}>
                                            {getDaysCount(request.startDate, request.endDate)} ngày
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#616161', maxWidth: '200px' }}>
                                        <div style={{ 
                                            overflow: 'hidden', 
                                            textOverflow: 'ellipsis', 
                                            whiteSpace: 'nowrap' 
                                        }}>
                                            {request.reason}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            background: `${getStatusColor(request.status)}15`,
                                            color: getStatusColor(request.status),
                                        }}>
                                            {getStatusLabel(request.status)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                        {request.status === 'pending' ? (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => setActionModal({ open: true, request, action: 'approve' })}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#e8f5e9',
                                                        color: '#4caf50',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                    }}
                                                >
                                                    Duyệt
                                                </button>
                                                <button
                                                    onClick={() => setActionModal({ open: true, request, action: 'reject' })}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#ffebee',
                                                        color: '#f44336',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                    }}
                                                >
                                                    Từ chối
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '12px', color: '#9e9e9e' }}>
                                                {request.approvedBy && `Bởi ${request.approvedBy}`}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{
            padding: '16px 24px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            minWidth: '120px',
            borderLeft: `4px solid ${color}`,
        }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
            <div style={{ fontSize: '13px', color: '#757575' }}>{label}</div>
        </div>
    );
}

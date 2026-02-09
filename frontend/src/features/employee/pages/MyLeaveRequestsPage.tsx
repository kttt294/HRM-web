import { useState, useEffect, useRef } from 'react';
import { leaveApi } from '../services/leave.api';
import { LeaveRequest, LeaveBalance } from '../models/leave.model';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import anime from 'animejs';

/**
 * ============================================
 * MY LEAVE REQUESTS PAGE - Employee Self-Service
 * ============================================
 * Xem và gửi đơn nghỉ phép của bản thân
 */

export function MyLeaveRequestsPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [balance, setBalance] = useState<LeaveBalance | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRequest, setNewRequest] = useState({
        leaveType: 'annual' as LeaveRequest['leaveType'],
        startDate: '',
        endDate: '',
        reason: '',
    });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [requestsData, balanceData] = await Promise.all([
                leaveApi.getMyRequests(),
                leaveApi.getBalance('1'),
            ]);
            setRequests(requestsData);
            setBalance(balanceData);
        } catch (error) {
            console.error('Failed to fetch leave data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (containerRef.current && !loading) {
            anime({
                targets: containerRef.current.querySelectorAll('.animate-item'),
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                delay: anime.stagger(80),
                easing: 'easeOutQuart',
            });
        }
    }, [loading]);

    const handleCreateRequest = async () => {
        setError(null);
        
        if (!newRequest.startDate || !newRequest.endDate) {
            setError('Vui lòng chọn ngày bắt đầu và kết thúc');
            return;
        }
        if (!newRequest.reason.trim()) {
            setError('Vui lòng nhập lý do nghỉ phép');
            return;
        }
        if (new Date(newRequest.startDate) > new Date(newRequest.endDate)) {
            setError('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }

        setCreating(true);
        try {
            await leaveApi.create({
                employeeId: '1',
                ...newRequest,
            });
            setShowCreateModal(false);
            setNewRequest({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
            fetchData();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Lỗi tạo đơn');
        } finally {
            setCreating(false);
        }
    };

    const handleCancelRequest = async (id: string) => {
        if (!confirm('Bạn có chắc muốn hủy đơn này?')) return;
        
        try {
            await leaveApi.cancel(id);
            fetchData();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Lỗi hủy đơn');
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
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    return (
        <div ref={containerRef}>
            {/* Header */}
            <div className="page-header animate-item" style={{ opacity: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                        <h1>Yêu cầu nghỉ phép</h1>
                        <p className="page-subtitle">
                            Xem và gửi đơn xin nghỉ phép của bạn
                        </p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <Button onClick={() => setShowCreateModal(true)}>
                            + Tạo đơn mới
                        </Button>
                    </div>
                </div>
            </div>

            {/* Leave Balance */}
            {balance && (
                <div className="animate-item" style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px', 
                    marginBottom: '24px',
                    opacity: 0,
                }}>
                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
                        borderRadius: '16px',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(21, 101, 192, 0.35)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Decorative blurred circles */}
                        <div style={{
                            position: 'absolute',
                            top: '-30px',
                            right: '-30px',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.15)',
                            filter: 'blur(2px)',
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-40px',
                            right: '40px',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            filter: 'blur(2px)',
                        }} />
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '80px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.12)',
                            filter: 'blur(1px)',
                        }} />
                        {/* Content */}
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Phép năm còn lại</div>
                            <div style={{ fontSize: '32px', fontWeight: '700' }}>
                                {balance.annualLeave - balance.usedAnnualLeave}
                                <span style={{ fontSize: '16px', opacity: 0.8 }}> / {balance.annualLeave} ngày</span>
                            </div>
                        </div>
                    </div>
                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)',
                        borderRadius: '16px',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(211, 47, 47, 0.35)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Decorative blurred circles */}
                        <div style={{
                            position: 'absolute',
                            top: '-30px',
                            right: '-30px',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.15)',
                            filter: 'blur(2px)',
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-40px',
                            right: '40px',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.1)',
                            filter: 'blur(2px)',
                        }} />
                        <div style={{
                            position: 'absolute',
                            top: '20px',
                            right: '80px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.12)',
                            filter: 'blur(1px)',
                        }} />
                        {/* Content */}
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Nghỉ ốm còn lại</div>
                            <div style={{ fontSize: '32px', fontWeight: '700' }}>
                                {balance.sickLeave - balance.usedSickLeave}
                                <span style={{ fontSize: '16px', opacity: 0.8 }}> / {balance.sickLeave} ngày</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Request List */}
            <div className="animate-item" style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                opacity: 0,
            }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Lịch sử đơn nghỉ phép</h3>
                </div>
                
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                        Đang tải...
                    </div>
                ) : requests.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                        Bạn chưa có đơn nghỉ phép nào
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {requests.map((request, index) => (
                            <div
                                key={request.id}
                                style={{
                                    padding: '16px 20px',
                                    borderBottom: index < requests.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div style={{
                                    width: '4px',
                                    height: '50px',
                                    borderRadius: '2px',
                                    background: getLeaveTypeColor(request.leaveType),
                                    flexShrink: 0,
                                }} />
                                
                                <div style={{ flex: '1', minWidth: '200px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            background: `${getLeaveTypeColor(request.leaveType)}15`,
                                            color: getLeaveTypeColor(request.leaveType),
                                        }}>
                                            {getLeaveTypeLabel(request.leaveType)}
                                        </span>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '8px',
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            background: `${getStatusColor(request.status)}15`,
                                            color: getStatusColor(request.status),
                                        }}>
                                            {getStatusLabel(request.status)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                        <span style={{ color: '#757575', fontWeight: '400', marginLeft: '8px' }}>
                                            ({getDaysCount(request.startDate, request.endDate)} ngày)
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#757575' }}>
                                        {request.reason}
                                    </div>
                                </div>
                                
                                <div style={{ flexShrink: 0 }}>
                                    {request.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancelRequest(request.id)}
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
                                            Hủy đơn
                                        </button>
                                    )}
                                    {request.status !== 'pending' && request.approvedAt && (
                                        <div style={{ fontSize: '12px', color: '#9e9e9e', textAlign: 'right' }}>
                                            {formatDate(request.approvedAt)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Tạo đơn nghỉ phép"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {error && (
                        <div style={{
                            padding: '12px',
                            background: '#ffebee',
                            color: '#c62828',
                            borderRadius: '8px',
                            fontSize: '14px',
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Loại nghỉ phép
                        </label>
                        <select
                            value={newRequest.leaveType}
                            onChange={(e) => setNewRequest({ ...newRequest, leaveType: e.target.value as LeaveRequest['leaveType'] })}
                            style={{
                                width: '100%',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0',
                                fontSize: '14px',
                            }}
                        >
                            <option value="annual">Nghỉ phép năm</option>
                            <option value="sick">Nghỉ ốm</option>
                            <option value="unpaid">Nghỉ không lương</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Input
                            label="Từ ngày"
                            type="date"
                            value={newRequest.startDate}
                            onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                        />
                        <Input
                            label="Đến ngày"
                            type="date"
                            value={newRequest.endDate}
                            onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                        />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Lý do
                        </label>
                        <textarea
                            value={newRequest.reason}
                            onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                            placeholder="Mô tả lý do xin nghỉ..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0',
                                fontSize: '14px',
                                minHeight: '80px',
                                resize: 'vertical',
                            }}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleCreateRequest} disabled={creating}>
                            {creating ? 'Đang gửi...' : 'Gửi đơn'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

import { Table } from '../../../components/ui/Table';

import { Candidate, CandidateStatus } from '../models/candidate.model';
import { useUpdateCandidateStatus } from '../hooks/useUpdateCandidateStatus';

interface CandidateTableProps {
    candidates: Candidate[];
    isLoading: boolean;
    onViewDetail: (id: string) => void;
    onStatusUpdated?: () => void;
}

const STATUS_OPTIONS: { value: CandidateStatus; label: string }[] = [
    { value: 'new', label: 'Mới ứng tuyển' },
    { value: 'screening', label: 'Đang sàng lọc' },
    { value: 'interviewing', label: 'Phỏng vấn' },
    { value: 'offered', label: 'Đề nghị lương' },
    { value: 'hired', label: 'Đã tuyển dụng' },
    { value: 'rejected', label: 'Đã từ chối' },
];

const STATUS_COLORS: Record<CandidateStatus, { bg: string; color: string }> = {
    new: { bg: '#9e9e9e', color: '#757575' },
    screening: { bg: '#1976d2', color: '#1976d2' },
    interviewing: { bg: '#ff9800', color: '#ff9800' },
    offered: { bg: '#9c27b0', color: '#9c27b0' },
    hired: { bg: '#4caf50', color: '#4caf50' },
    rejected: { bg: '#f44336', color: '#f44336' },
};

export function CandidateTable({ candidates, isLoading, onViewDetail, onStatusUpdated }: CandidateTableProps) {
    const { updateStatus, isUpdating } = useUpdateCandidateStatus();

    if (isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                Đang tải...
            </div>
        );
    }

    const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus) => {
        const success = await updateStatus(candidateId, newStatus);
        if (success && onStatusUpdated) {
            onStatusUpdated();
        }
    };

    const columns = [
        { key: 'fullName', header: 'Họ tên', width: '25%' },
        { key: 'vacancyTitle', header: 'Vị trí ứng tuyển', width: '25%' },
        {
            key: 'status',
            header: 'Trạng thái',
            width: '20%',
            align: 'center' as const,
            render: (candidate: Candidate) => {
                const colors = STATUS_COLORS[candidate.status] || STATUS_COLORS.new;
                return (
                    <div style={{ 
                        position: 'relative', 
                        display: 'inline-flex',
                        alignItems: 'center',
                    }}>
                        <select
                            value={candidate.status}
                            disabled={isUpdating}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(candidate.id, e.target.value as CandidateStatus);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = `${colors.color}25`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = `${colors.color}15`;
                            }}
                            style={{
                                padding: '4px 24px 4px 12px',
                                borderRadius: '20px',
                                fontSize: '11.25px',
                                fontWeight: 600,
                                backgroundColor: `${colors.color}15`,
                                color: colors.color,
                                border: `1px solid ${colors.color}20`,
                                cursor: isUpdating ? 'not-allowed' : 'pointer',
                                opacity: isUpdating ? 0.6 : 1,
                                outline: 'none',
                                appearance: 'none',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                                lineHeight: '1.2',
                                minWidth: '120px',
                            }}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value} style={{ background: 'white', color: '#333' }}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <span style={{
                            position: 'absolute',
                            right: '12px',
                            top: '52%',
                            transform: 'translateY(-50%)',
                            fontSize: '9px',
                            pointerEvents: 'none',
                            color: colors.color,
                            opacity: 0.7
                        }}>
                            ▼
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'actions',
            header: 'Thao tác',
            width: '30%',
            align: 'center' as const,
            render: (candidate: Candidate) => (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(candidate.id);
                        }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            border: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        Xem chi tiết
                    </button>
                    <button
                        disabled={isUpdating || candidate.status === 'hired'}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(candidate.id, 'hired');
                        }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: '#e8f5e9',
                            color: '#4caf50',
                            border: 'none',
                            cursor: isUpdating || candidate.status === 'hired' ? 'not-allowed' : 'pointer',
                            opacity: isUpdating || candidate.status === 'hired' ? 0.5 : 1,
                        }}
                    >
                        Duyệt
                    </button>
                    <button
                        disabled={isUpdating || candidate.status === 'rejected'}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(candidate.id, 'rejected');
                        }}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: '#ffebee',
                            color: '#f44336',
                            border: 'none',
                            cursor: isUpdating || candidate.status === 'rejected' ? 'not-allowed' : 'pointer',
                            opacity: isUpdating || candidate.status === 'rejected' ? 0.5 : 1,
                        }}
                    >
                        Từ chối
                    </button>
                </div>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            data={candidates}
            onRowClick={(candidate) => onViewDetail(candidate.id)}
            emptyMessage="Không có ứng viên nào"
        />
    );
}

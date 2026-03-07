import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
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
    new: { bg: '#f5f5f5', color: '#616161' },
    screening: { bg: '#e3f2fd', color: '#1976d2' },
    interviewing: { bg: '#fff3e0', color: '#f57c00' },
    offered: { bg: '#f3e5f5', color: '#7b1fa2' },
    hired: { bg: '#e8f5e9', color: '#388e3c' },
    rejected: { bg: '#ffebee', color: '#d32f2f' },
};

export function CandidateTable({ candidates, isLoading, onViewDetail, onStatusUpdated }: CandidateTableProps) {
    const { updateStatus, isUpdating } = useUpdateCandidateStatus();

    if (isLoading) {
        return <div>Đang tải...</div>;
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
            width: '25%',
            align: 'center' as const,
            render: (candidate: Candidate) => {
                const colors = STATUS_COLORS[candidate.status] || STATUS_COLORS.new;
                return (
                    <select
                        value={candidate.status}
                        disabled={isUpdating}
                        onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(candidate.id, e.target.value as CandidateStatus);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            padding: '4px 8px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor: colors.bg,
                            color: colors.color,
                            border: `1px solid ${colors.color}30`,
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            opacity: isUpdating ? 0.6 : 1,
                            outline: 'none',
                            appearance: 'auto',
                        }}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            },
        },
        {
            key: 'actions',
            header: 'Thao tác',
            width: '30%',
            align: 'center' as const,
            render: (candidate: Candidate) => (
                <div className="action-buttons" style={{ justifyContent: 'center', gap: '8px' }}>
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(candidate.id);
                        }}
                    >
                        Xem chi tiết
                    </Button>
                    <Button
                        size="sm"
                        disabled={isUpdating || candidate.status === 'hired'}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(candidate.id, 'hired');
                        }}
                        style={{ backgroundColor: '#30ac25ff', borderColor: '#388e3c', color: '#fff' }}
                    >
                        Đồng ý
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        disabled={isUpdating || candidate.status === 'rejected'}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(candidate.id, 'rejected');
                        }}
                    >
                        Từ chối
                    </Button>
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

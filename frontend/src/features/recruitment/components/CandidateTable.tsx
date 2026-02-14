import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Candidate } from '../models/candidate.model';

interface CandidateTableProps {
    candidates: Candidate[];
    isLoading: boolean;
    onViewDetail: (id: string) => void;
}


function StatusBadge({ status }: { status: string }) {
    const statusMap: Record<string, { label: string; bg: string; color: string }> = {
        new: { label: 'Mới ứng tuyển', bg: '#f5f5f5', color: '#616161' },
        screening: { label: 'Đang sàng lọc', bg: '#e3f2fd', color: '#1976d2' },
        interviewing: { label: 'Phỏng vấn', bg: '#fff3e0', color: '#f57c00' },
        offered: { label: 'Đề nghị lương', bg: '#f3e5f5', color: '#7b1fa2' },
        hired: { label: 'Đã tuyển dụng', bg: '#e8f5e9', color: '#388e3c' },
        rejected: { label: 'Đã từ chối', bg: '#ffebee', color: '#d32f2f' },
    };

    const info = statusMap[status] || { label: status, bg: '#f5f5f5', color: '#616161' };

    return (
        <span
            style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: info.bg,
                color: info.color,
                whiteSpace: 'nowrap'
            }}
        >
            {info.label}
        </span>
    );
}

export function CandidateTable({ candidates, isLoading, onViewDetail }: CandidateTableProps) {
    if (isLoading) {
        return <div>Đang tải...</div>;
    }

    const columns = [
        { key: 'fullName', header: 'Họ tên', width: '30%' },
        { key: 'vacancyTitle', header: 'Vị trí ứng tuyển', width: '30%' },
        { 
            key: 'status', 
            header: 'Trạng thái',
            width: '20%',
            align: 'center' as const,
            render: (candidate: Candidate) => <StatusBadge status={candidate.status} />
        },
        {
            key: 'actions',
            header: 'Thao tác',
            width: '20%',
            align: 'center' as const,
            render: (candidate: Candidate) => (
                <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetail(candidate.id);
                        }}
                    >
                        Xem chi tiết
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

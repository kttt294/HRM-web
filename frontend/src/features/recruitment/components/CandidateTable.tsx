import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Candidate } from '../models/candidate.model';

interface CandidateTableProps {
    candidates: Candidate[];
    isLoading: boolean;
    onViewDetail: (id: string) => void;
}

export function CandidateTable({ candidates, isLoading, onViewDetail }: CandidateTableProps) {
    if (isLoading) {
        return <div>Đang tải...</div>;
    }

    const columns = [
        { key: 'fullName', header: 'Họ tên' },
        { key: 'vacancyTitle', header: 'Vị trí ứng tuyển' },
        { key: 'status', header: 'Trạng thái' },
        {
            key: 'actions',
            header: 'Thao tác',
            render: (candidate: Candidate) => (
                <div className="action-buttons">
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

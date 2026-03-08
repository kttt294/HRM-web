import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { InterviewSchedule } from '../components/InterviewSchedule';
import { OfferForm } from '../components/OfferForm';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Candidate, CandidateStatus } from '../models/candidate.model';
import { candidateApi } from '../services/candidate.api';
import { useUpdateCandidateStatus } from '../hooks/useUpdateCandidateStatus';
import { ROUTES } from '../../../shared/constants/routes';
import { formatDate } from '../../../shared/utils/date.util';

const STATUS_OPTIONS: { value: CandidateStatus; label: string }[] = [
    { value: 'new', label: 'Mới ứng tuyển' },
    { value: 'screening', label: 'Đang sàng lọc' },
    { value: 'interviewing', label: 'Phỏng vấn' },
    { value: 'offered', label: 'Đề nghị lương' },
    { value: 'hired', label: 'Đã tuyển dụng' },
    { value: 'rejected', label: 'Đã từ chối' },
];

export function CandidateDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showOfferForm, setShowOfferForm] = useState(false);
    const { updateStatus, isUpdating } = useUpdateCandidateStatus();

    const fetchCandidate = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await candidateApi.getById(id);
            setCandidate(data);
        } catch (error) {
            console.error("Failed to fetch candidate:", error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCandidate();
    }, [fetchCandidate]);

    const handleStatusChange = async (newStatus: CandidateStatus) => {
        if (!id) return;
        const success = await updateStatus(id, newStatus);
        if (success) {
            fetchCandidate();
        }
    };

    const fields = useMemo(() => {
        if (!candidate) return [];

        return [
            { label: "Mã ứng viên", value: candidate.id || "—" },
            { label: "Họ và tên", value: candidate.fullName || "—" },
            { label: "Email", value: candidate.email || "—" },
            { label: "Số điện thoại", value: candidate.phone || "—" },
            { label: "Vị trí ứng tuyển", value: candidate.vacancyTitle || "—" },
            {
                label: "Trạng thái",
                value: (
                    <select
                        value={candidate.status}
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(e.target.value as CandidateStatus)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 500,
                            border: '1px solid #ccc',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            opacity: isUpdating ? 0.6 : 1,
                            outline: 'none',
                        }}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ),
            },
            {
                label: "Hồ sơ đính kèm",
                value: candidate.resumeUrl ? (
                    <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-600)', textDecoration: 'underline' }}>
                        Xem hồ sơ
                    </a>
                ) : "Chưa có hồ sơ"
            },
            { label: "Ghi chú", value: candidate.notes || "—" },
            { label: "Ngày ứng tuyển", value: formatDate(candidate.appliedAt) },
            { label: "Ngày tạo", value: formatDate(candidate.createdAt) },
            { label: "Cập nhật lần cuối", value: candidate.updatedAt ? formatDate(candidate.updatedAt) : "—" },
        ];
    }, [candidate, isUpdating]);

    if (isLoading) {
        return <div className="loading">Đang tải chi tiết ứng viên...</div>;
    }

    if (!candidate) {
        return (
            <div className="card">
                <div className="card-body">
                    <p>Không tìm thấy ứng viên</p>
                    <Button onClick={() => navigate(ROUTES.CANDIDATES)}>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Chi tiết ứng viên</h1>
                    <p className="page-subtitle">{candidate.fullName} - {candidate.vacancyTitle}</p>
                </div>
                <div className="page-actions">
                    <Button
                        variant="secondary"
                        onClick={() => navigate(ROUTES.CANDIDATES)}
                    >
                        Quay lại danh sách
                    </Button>
                    <Button onClick={() => setShowOfferForm(true)}>
                        Gửi đề nghị (Offer)
                    </Button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-body">
                    <table className="data-table">
                        <tbody>
                            {fields.map((field) => (
                                <tr key={field.label}>
                                    <td style={{ width: "260px", fontWeight: 600 }}>{field.label}</td>
                                    <td>{field.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <h2>Lịch phỏng vấn</h2>
                </div>
                <div className="card-body">
                    <InterviewSchedule candidateId={id!} />
                </div>
            </div>

            {showOfferForm && (
                <OfferForm
                    candidateId={id!}
                    onClose={() => setShowOfferForm(false)}
                    onSubmit={(data) => {
                        console.log('Offer submitted:', data);
                        setShowOfferForm(false);
                    }}
                />
            )}
        </>
    );
}

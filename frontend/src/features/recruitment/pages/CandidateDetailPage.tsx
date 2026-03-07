import { useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { InterviewSchedule } from '../components/InterviewSchedule';
import { OfferForm } from '../components/OfferForm';
import { useState, useEffect, useCallback } from 'react';
import { Candidate, CandidateStatus } from '../models/candidate.model';
import { candidateApi } from '../services/candidate.api';
import { useUpdateCandidateStatus } from '../hooks/useUpdateCandidateStatus';

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

    if (isLoading) {
        return <div>Đang tải...</div>;
    }

    if (!candidate) {
        return <div>Không tìm thấy ứng viên</div>;
    }

    return (
        <>
            <header>
                <h1>THÔNG TIN ỨNG VIÊN</h1>
            </header>

            <main>
                <section className="candidate-info">
                    <h2>Thông tin cá nhân</h2>
                    <ul>
                        <li><strong>Họ tên:</strong> {candidate.fullName}</li>
                        <li><strong>Email:</strong> {candidate.email}</li>
                        <li><strong>Điện thoại:</strong> {candidate.phone}</li>
                        <li><strong>Vị trí ứng tuyển:</strong> {candidate.vacancyTitle}</li>
                        <li>
                            <strong>Trạng thái:</strong>{' '}
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
                                    marginLeft: '8px',
                                }}
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </li>
                    </ul>
                </section>

                <InterviewSchedule candidateId={id!} />

                <section className="actions">
                    <h2>Thao tác</h2>
                    <div className="action-buttons">
                        <Button onClick={() => { /* TODO: implement email sending */ }}>
                            Gửi email
                        </Button>
                    </div>
                </section>

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
            </main>
        </>
    );
}

import { useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { InterviewSchedule } from '../components/InterviewSchedule';
import { OfferForm } from '../components/OfferForm';
import { useCandidates } from '../hooks/useCandidates';
import { useState } from 'react';

export function CandidateDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { candidates, isLoading } = useCandidates();
    const [showOfferForm, setShowOfferForm] = useState(false);

    const candidate = candidates.find((c) => c.id === id);

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
                        <li><strong>Trạng thái:</strong> {candidate.status}</li>
                    </ul>
                </section>

                <InterviewSchedule candidateId={id!} />

                <section className="actions">
                    <h2>Thao tác</h2>
                    <div className="action-buttons">
                        <Button onClick={() => setShowOfferForm(true)}>
                            Gửi đề nghị tuyển dụng
                        </Button>
                        <Button variant="secondary">Lên lịch phỏng vấn</Button>
                        <Button variant="danger">Từ chối</Button>
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

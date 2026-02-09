import { useState, useEffect } from 'react';
import { Interview } from '../models/interview.model';
import { interviewApi } from '../services/interview.api';
import { Button } from '../../../components/ui/Button';

interface InterviewScheduleProps {
    candidateId: string;
}

export function InterviewSchedule({ candidateId }: InterviewScheduleProps) {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchInterviews = async () => {
            setIsLoading(true);
            try {
                const data = await interviewApi.getByCandidateId(candidateId);
                setInterviews(data);
            } catch (error) {
                console.error('Failed to fetch interviews', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterviews();
    }, [candidateId]);

    if (isLoading) {
        return <div>Đang tải lịch phỏng vấn...</div>;
    }

    return (
        <section className="interview-schedule">
            <h2>Lịch phỏng vấn</h2>

            {interviews.length === 0 ? (
                <p>Chưa có lịch phỏng vấn</p>
            ) : (
                <ul className="interview-list">
                    {interviews.map((interview) => (
                        <li key={interview.id} className="interview-item">
                            <div className="interview-info">
                                <strong>{interview.title}</strong>
                                <span>{interview.date} - {interview.time}</span>
                                <span>Người phỏng vấn: {interview.interviewerName}</span>
                            </div>
                            <span className={`status status-${interview.status}`}>
                                {interview.status}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <Button size="sm">Thêm lịch phỏng vấn</Button>
        </section>
    );
}

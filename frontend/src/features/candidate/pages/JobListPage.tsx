import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../shared/constants/routes';

/**
 * Trang danh sách việc làm cho Candidate
 */
export function JobListPage() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setIsLoading(true);
        setError(null);
        
        fetch('/api/recruitment/vacancies?status=open')
            .then(async res => {
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Không thể tải danh sách việc làm');
                }
                return data;
            })
            .then(data => {
                // Đảm bảo data là mảng trước khi set để tránh crash jobs.map()
                if (Array.isArray(data)) {
                    setJobs(data);
                } else {
                    setJobs([]);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch jobs:', err);
                setError(err.message || 'Đã có lỗi xảy ra khi kết nối đến máy chủ.');
                setIsLoading(false);
            });
    }, []);

    const handleApply = (job: any) => {
        navigate(`${ROUTES.APPLY_JOB}?jobId=${job.id}&title=${encodeURIComponent(job.title)}`);
    };

    const formatSalary = (min: number, max: number) => {
        return `${(min / 1000000)} - ${(max / 1000000)} triệu`;
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    return (
        <>
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Cơ hội nghề nghiệp</h1>
                    <p className="page-subtitle">
                        Khám phá các vị trí đang tuyển dụng
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải danh sách việc làm...</div>
            ) : error ? (
                <div style={{
                    padding: '32px',
                    margin: '20px 0',
                    backgroundColor: '#fff1f0',
                    border: '1px solid #ffa39e',
                    borderRadius: '8px',
                    color: '#cf1322',
                    textAlign: 'center'
                }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>⚠️ Lỗi hệ thống</p>
                    <Button 
                        onClick={() => window.location.reload()} 
                        style={{ marginTop: '12px', backgroundColor: '#cf1322' }}
                    >
                        Thử lại
                    </Button>
                </div>
            ) : jobs.length === 0 ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '300px',
                    color: '#666',
                    fontSize: '16px'
                }}>
                    Hiện tại chưa có vị trí nào đang tuyển dụng
                </div>
            ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
                {jobs.map((job) => (
                    <div key={job.id} className="card">
                        <div className="card-body">
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                flexWrap: 'wrap',
                                gap: '16px'
                            }}>
                                <div>
                                    <h3 style={{ 
                                        fontSize: '18px', 
                                        marginBottom: '8px',
                                        color: '#1976d2'
                                    }}>
                                        {job.title}
                                    </h3>
                                    <div style={{ 
                                        display: 'flex', 
                                        gap: '16px', 
                                        flexWrap: 'wrap',
                                        color: '#666',
                                        fontSize: '14px',
                                    }}>
                                        <span>{job.department} |</span>
                                        <span>{job.location || 'Hà Nội'} |</span>
                                        <span>Full-time |</span>
                                        <span style={{ fontWeight: 500, color: '#2e7d32' }}>
                                            {formatSalary(job.minSalary, job.maxSalary)}
                                        </span>
                                    </div>
                                    <p style={{ 
                                        marginTop: '8px',
                                        fontSize: '13px',
                                        color: '#999' 
                                    }}>
                                        Hạn nộp: {formatDate(job.deadline)}
                                    </p>
                                </div>
                                <Button onClick={() => handleApply(job)}>Ứng tuyển</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            )}
        </>
    );
}


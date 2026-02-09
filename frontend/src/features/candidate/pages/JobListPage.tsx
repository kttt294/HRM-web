import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../shared/constants/routes';

/**
 * Trang danh sách việc làm cho Candidate
 */
export function JobListPage() {
    const navigate = useNavigate();
    
    // Mock data - trong production sẽ fetch từ API
    const jobs = [
        {
            id: '1',
            title: 'Lập trình viên Frontend',
            department: 'Phòng Công nghệ',
            location: 'Hà Nội',
            type: 'Full-time',
            salary: '15-25 triệu',
            deadline: '2026-03-01',
        },
        {
            id: '2', 
            title: 'Lập trình viên Backend',
            department: 'Phòng Công nghệ',
            location: 'Hà Nội',
            type: 'Full-time', 
            salary: '18-30 triệu',
            deadline: '2026-03-15',
        },
        {
            id: '3',
            title: 'Nhân viên Nhân sự',
            department: 'Phòng Nhân sự',
            location: 'Hà Nội',
            type: 'Full-time',
            salary: '12-18 triệu',
            deadline: '2026-02-28',
        },
    ];

    const handleApply = (job: typeof jobs[0]) => {
        navigate(`${ROUTES.APPLY_JOB}?jobId=${job.id}&title=${encodeURIComponent(job.title)}`);
    };

    return (
        <>
            <div className="page-header">
                <div className="page-title-section">
                    <nav className="breadcrumb">
                        <a href="/">Trang chủ</a>
                        <span className="breadcrumb-separator">/</span>
                        <span>Việc làm</span>
                    </nav>
                    <h1>Cơ hội nghề nghiệp</h1>
                    <p className="page-subtitle">
                        Khám phá các vị trí đang tuyển dụng
                    </p>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '300px',
                    color: '#666',
                    fontSize: '16px'
                }}>
                    Không có việc làm nào
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
                                        <span>{job.location} |</span>
                                        <span>{job.type} |</span>
                                        <span>{job.salary}</span>
                                    </div>
                                    <p style={{ 
                                        marginTop: '8px',
                                        fontSize: '13px',
                                        color: '#999' 
                                    }}>
                                        Hạn nộp: {job.deadline}
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


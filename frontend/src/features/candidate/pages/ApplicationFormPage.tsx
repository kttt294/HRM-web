import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../shared/constants/routes';

/**
 * Form ứng tuyển công việc
 * Public - không cần đăng nhập
 */
export function ApplicationFormPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('jobId');
    const jobTitle = searchParams.get('title') || 'Vị trí tuyển dụng';
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        cvLink: '',
        coverLetter: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/recruitment/candidates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vacancyId: jobId ? parseInt(jobId) : null,
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    resumeUrl: formData.cvLink,
                    notes: formData.coverLetter,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Có lỗi xảy ra khi nộp hồ sơ');
            }

            setIsSubmitted(true);
        } catch (error) {
            console.error('Submission error:', error);
            alert(error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <>
                <div className="page-header">
                    <div className="page-title-section">
                        <h1>Nộp hồ sơ thành công!</h1>
                    </div>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2 style={{ color: '#2e7d32', marginBottom: '16px' }}>
                        Cảm ơn bạn đã ứng tuyển!
                    </h2>
                    <p style={{ color: '#666', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                        Chúng tôi đã nhận được hồ sơ của bạn cho vị trí <strong>{jobTitle}</strong>. 
                        Bộ phận tuyển dụng sẽ liên hệ qua email <strong>{formData.email}</strong> trong thời gian sớm nhất.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Button onClick={() => navigate(ROUTES.JOBS)}>
                            Xem việc làm khác
                        </Button>

                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Ứng tuyển: {jobTitle}</h1>
                    <p className="page-subtitle">
                        Điền thông tin của bạn để nộp hồ sơ
                    </p>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gap: '24px' }}>
                            {/* Họ tên */}
                            <div className="form-group">
                                <label htmlFor="fullName" style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#333'
                                }}>
                                    Họ và tên <span style={{ color: '#f44336' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nguyễn Văn A"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label htmlFor="email" style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#333'
                                }}>
                                    Email <span style={{ color: '#f44336' }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="email@example.com"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            {/* Số điện thoại */}
                            <div className="form-group">
                                <label htmlFor="phone" style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#333'
                                }}>
                                    Số điện thoại <span style={{ color: '#f44336' }}>*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="0901234567"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            {/* Link CV */}
                            <div className="form-group">
                                <label htmlFor="cvLink" style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#333'
                                }}>
                                    Link CV/Hồ sơ <span style={{ color: '#f44336' }}>*</span>
                                </label>
                                <input
                                    type="url"
                                    id="cvLink"
                                    name="cvLink"
                                    value={formData.cvLink}
                                    onChange={handleChange}
                                    required
                                    placeholder="https://drive.google.com/... hoặc link CV của bạn"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        outline: 'none',
                                    }}
                                />
                                <p style={{ 
                                    marginTop: '6px', 
                                    fontSize: '13px', 
                                    color: '#888' 
                                }}>
                                    Hỗ trợ: Google Drive, Dropbox, LinkedIn, hoặc link trực tiếp tới file PDF
                                </p>
                            </div>

                            {/* Thư xin việc */}
                            <div className="form-group">
                                <label htmlFor="coverLetter" style={{ 
                                    display: 'block', 
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#333'
                                }}>
                                    Thư giới thiệu bản thân
                                </label>
                                <textarea
                                    id="coverLetter"
                                    name="coverLetter"
                                    value={formData.coverLetter}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Giới thiệu ngắn về bản thân và lý do bạn muốn ứng tuyển vị trí này..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        fontSize: '16px',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        resize: 'vertical',
                                    }}
                                />
                            </div>

                            {/* Buttons */}
                            <div style={{ 
                                display: 'flex', 
                                gap: '16px', 
                                justifyContent: 'flex-end',
                                marginTop: '16px'
                            }}>
                                <Button 
                                    type="button" 
                                    variant="secondary"
                                    onClick={() => navigate(ROUTES.JOBS)}
                                >
                                    Hủy
                                </Button>
                                <Button 
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang gửi...' : 'Nộp hồ sơ'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

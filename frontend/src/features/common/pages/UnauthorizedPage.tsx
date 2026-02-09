import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';

/**
 * Trang hiển thị khi user truy cập vào trang không có quyền
 */
export function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '24px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                maxWidth: '400px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
                <h1 style={{ 
                    fontSize: '24px', 
                    marginBottom: '8px',
                    color: '#333'
                }}>
                    Không có quyền truy cập
                </h1>
                <p style={{ 
                    color: '#666', 
                    marginBottom: '24px',
                    lineHeight: '1.6'
                }}>
                    Bạn không có quyền truy cập trang này. 
                    Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
                </p>
                <Button onClick={() => navigate(-1)}>
                    ← Quay lại
                </Button>
            </div>
        </div>
    );
}

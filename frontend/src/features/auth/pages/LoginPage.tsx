import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../../../shared/constants/routes';
import { TEST_ACCOUNTS } from '../services/auth.api';
import anime from 'animejs';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.HOME;

    // Entry animation
    useEffect(() => {
        if (containerRef.current) {
            anime({
                targets: containerRef.current,
                opacity: [0, 1],
                scale: [0.95, 1],
                duration: 500,
                easing: 'easeOutQuart',
            });

            anime({
                targets: containerRef.current.querySelectorAll('.animate-item'),
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                delay: anime.stagger(80, { start: 200 }),
                easing: 'easeOutQuart',
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const success = await login(formData.username, formData.password);
        if (success) {
            // Exit animation trước khi navigate
            anime({
                targets: containerRef.current,
                opacity: [1, 0],
                scale: [1, 0.95],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => navigate(from, { replace: true }),
            });
        } else {
            // Shake animation khi login thất bại
            anime({
                targets: formRef.current,
                translateX: [0, -10, 10, -10, 10, 0],
                duration: 400,
                easing: 'easeInOutQuad',
            });
        }
    };

    const handleQuickLogin = (accountKey: keyof typeof TEST_ACCOUNTS) => {
        const account = TEST_ACCOUNTS[accountKey];
        setFormData({
            username: account.username,
            password: account.password,
        });

        // Button animation
        anime({
            targets: `.quick-login-btn[data-account="${accountKey}"]`,
            scale: [1, 0.95, 1],
            duration: 200,
            easing: 'easeInOutQuad',
        });
    };

    return (
        <div className="login-page">
            <div 
                ref={containerRef}
                className="login-container"
                style={{ opacity: 0 }}
            >
                {/* Logo */}
                <div 
                    className="animate-item"
                    style={{ 
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 24px',
                        background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 30px rgba(25, 118, 210, 0.3)',
                        opacity: 0,
                    }}
                >
                    <span style={{ 
                        color: 'white', 
                        fontSize: '32px', 
                        fontWeight: '700' 
                    }}>
                        HR
                    </span>
                </div>

                <h1 className="animate-item" style={{ opacity: 0 }}>
                    Hệ thống Quản lý Nhân sự
                </h1>
                <h2 className="animate-item" style={{ opacity: 0 }}>
                    Đăng nhập vào tài khoản
                </h2>

                {error && (
                    <div 
                        className="error-alert animate-item" 
                        style={{ opacity: 0 }}
                    >
                        {error}
                    </div>
                )}

                <form ref={formRef} onSubmit={handleSubmit}>
                    <div className="animate-item" style={{ opacity: 0 }}>
                        <Input
                            label="Tên đăng nhập"
                            name="username"
                            placeholder="Nhập tên đăng nhập"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="animate-item" style={{ opacity: 0 }}>
                        <Input
                            type="password"
                            label="Mật khẩu"
                            name="password"
                            placeholder="Nhập mật khẩu"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="animate-item" style={{ marginTop: '24px', opacity: 0 }}>
                        <Button 
                            type="submit" 
                            disabled={isLoading} 
                            style={{ width: '100%' }}
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                    </div>
                </form>

                {/* Test Accounts Section */}
                <div 
                    className="animate-item"
                    style={{ 
                        marginTop: '32px', 
                        paddingTop: '24px', 
                        borderTop: '1px solid #e0e0e0',
                        opacity: 0,
                    }}
                >
                    <p style={{ 
                        fontSize: '12px', 
                        color: '#757575', 
                        textAlign: 'center',
                        marginBottom: '16px'
                    }}>
                        Tài khoản test (chỉ dùng cho development)
                    </p>
                    
                    <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <button
                            type="button"
                            className="quick-login-btn"
                            data-account="admin"
                            onClick={() => handleQuickLogin('admin')}
                            style={{
                                padding: '10px 20px',
                                fontSize: '12px',
                                background: 'linear-gradient(135deg, #f44336 0%, #c62828 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                            }}
                        >
                            System Admin
                        </button>
                        <button
                            type="button"
                            className="quick-login-btn"
                            data-account="hr"
                            onClick={() => handleQuickLogin('hr')}
                            style={{
                                padding: '10px 20px',
                                fontSize: '12px',
                                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                            }}
                        >
                            HR Manager
                        </button>
                        <button
                            type="button"
                            className="quick-login-btn"
                            data-account="employee"
                            onClick={() => handleQuickLogin('employee')}
                            style={{
                                padding: '10px 20px',
                                fontSize: '12px',
                                background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                            }}
                        >
                            Nhân viên
                        </button>
                        <button
                            type="button"
                            className="quick-login-btn"
                            data-account="candidate"
                            onClick={() => handleQuickLogin('candidate')}
                            style={{
                                padding: '10px 20px',
                                fontSize: '12px',
                                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                            }}
                        >
                            Ứng viên
                        </button>
                    </div>

                    <div style={{ 
                        marginTop: '16px', 
                        fontSize: '11px', 
                        color: '#9e9e9e',
                        textAlign: 'center',
                        lineHeight: '1.8'
                    }}>
                        <div><strong>Admin:</strong> admin / admin123</div>
                        <div><strong>HR:</strong> hr / hr123</div>
                        <div><strong>Nhân viên:</strong> nhanvien / nhanvien123</div>
                        <div><strong>Ứng viên:</strong> ungvien / ungvien123</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

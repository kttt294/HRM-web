import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { ROUTES } from '../../shared/constants/routes';
import anime from 'animejs';
import logo from '../../assets/images/logo.svg';

/**
 * Header component với animations
 * Không sử dụng emoji icons
 */
export function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const headerRef = useRef<HTMLElement>(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Entry animation
    useEffect(() => {
        if (headerRef.current) {
            anime({
                targets: headerRef.current,
                opacity: [0, 1],
                translateY: [-20, 0],
                duration: 400,
                easing: 'easeOutQuart',
            });
        }
    }, []);

    const handleLogout = () => {
        // Exit animation
        setIsLoggingOut(true);
        anime({
            targets: headerRef.current,
            opacity: [1, 0],
            duration: 600,
            easing: 'easeInQuart',
            complete: () => {
                logout();
                navigate(ROUTES.HOME);
            },
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean) => {
        anime({
            targets: e.currentTarget,
            scale: isEnter ? 1.05 : 1,
            duration: 150,
            easing: 'easeOutQuad',
        });
    };

    return (
        <header ref={headerRef} id="app-header" style={{ opacity: 0 }}>
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                    src={logo} 
                    alt="HRM Logo" 
                    className="app-logo" 
                    style={{ 
                        height: '40px', 
                        borderRadius: '8px'
                    }} 
                />
                <h1 className="app-title">Hệ thống Quản lý Nhân sự</h1>
            </div>

            <div className="header-right">
                <div className="user-menu">
                    <div 
                        className="user-avatar"
                        style={{
                            background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                        }}
                    >
                        {user?.name ? getInitials(user.name) : 'AD'}
                    </div>
                    <span className="user-name">{user?.name || 'Quản trị viên'}</span>
                </div>
                <button 
                    className="logout-btn" 
                    onClick={handleLogout}
                    onMouseEnter={(e) => !isLoggingOut && handleButtonHover(e, true)}
                    onMouseLeave={(e) => !isLoggingOut && handleButtonHover(e, false)}
                    disabled={isLoggingOut}
                    style={{ 
                        opacity: isLoggingOut ? 0.8 : 1,
                        cursor: isLoggingOut ? 'wait' : 'pointer',
                        paddingRight: isLoggingOut ? '20px' : '' 
                    }}
                >
                    {isLoggingOut ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTopColor: 'white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <span>Đang đăng xuất...</span>
                            <style>{`
                                @keyframes spin {
                                    to { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    ) : (
                        'Đăng xuất'
                    )}
                </button>
            </div>
        </header>
    );
}

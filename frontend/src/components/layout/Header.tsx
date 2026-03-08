import { useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';
import { ROUTES } from '../../shared/constants/routes';
import anime from 'animejs';


/**
 * Header component với animations
 * Không sử dụng emoji icons
 */
export function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { isSidebarOpen, toggleSidebar } = useUIStore();
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

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case 'admin': return 'Quản trị viên';
            case 'hr': return 'Quản lý nhân sự';
            case 'employee': return 'Nhân viên';
            default: return 'Người dùng';
        }
    };

    const getRoleStyle = (role?: string): React.CSSProperties => {
        switch (role) {
            case 'admin': return { background: '#fef3c7', color: '#92400e' };
            case 'hr': return { background: '#dbeafe', color: '#1e40af' };
            case 'employee': return { background: '#d1fae5', color: '#065f46' };
            default: return { background: '#f3f4f6', color: '#6b7280' };
        }
    };

    const getAvatarStyle = (role?: string): React.CSSProperties => {
        switch (role) {
            case 'admin': return { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)' };
            case 'hr': return { background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)' };
            case 'employee': return { background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)' };
            default: return { background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 8px rgba(148, 163, 184, 0.4)' };
        }
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
                <button
                    className="menu-toggle"
                    onClick={toggleSidebar}
                    aria-label={isSidebarOpen ? 'Đóng menu' : 'Mở menu'}
                    title={isSidebarOpen ? 'Đóng menu' : 'Mở menu'}
                >
                    <span className={`hamburger-icon ${isSidebarOpen ? 'open' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
                <img
                    src="/favicon.png"
                    alt="HRM Logo"
                    className="app-logo"
                    style={{
                        height: '40px',
                        borderRadius: '8px'
                    }}
                />
                <h1 className="app-title">CÔNG TY CỔ PHẦN ABC</h1>
            </div>

            <div className="header-right">
                <div className="user-menu">
                    <div
                        className="user-avatar"
                        style={getAvatarStyle(user?.role)}
                    >
                        {user?.role === 'admin' ? 'AD' : user?.role === 'hr' ? 'HR' : user?.role === 'employee' ? 'EM' : 'AD'}
                    </div>
                    <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        ...getRoleStyle(user?.role),
                    }}>
                        {getRoleLabel(user?.role)}
                    </span>
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

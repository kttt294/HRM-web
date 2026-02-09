import { Outlet, Link } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes';

/**
 * Layout riêng cho Candidate (Public - không cần đăng nhập)
 * 
 * Đơn giản hơn MainLayout:
 * - Header với logo + navigation
 * - Không có Sidebar (vì ít menu)
 * - Footer
 */
export function CandidateLayout() {
    return (
        <div id="app-layout" className="candidate-layout">
            {/* ============================================
                HEADER
            ============================================ */}
            <header style={{
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                background: 'white',
                borderBottom: '1px solid #e0e0e0',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                {/* Logo */}
                <Link to={ROUTES.HOME} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    textDecoration: 'none',
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                    }}>HR</div>
                    <span style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#1a237e' 
                    }}>HRM System</span>
                </Link>

                {/* Navigation */}
                <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <Link 
                        to={ROUTES.JOBS} 
                        style={{ 
                            color: '#455a64', 
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '14px',
                        }}
                    >
                        Việc làm
                    </Link>

                    <Link 
                        to={ROUTES.LOGIN}
                        style={{
                            padding: '8px 16px',
                            background: '#f5f5f5',
                            borderRadius: '8px',
                            color: '#455a64',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '14px',
                        }}
                    >
                        Đăng nhập (Nhân viên/Admin)
                    </Link>
                </nav>
            </header>

            {/* ============================================
                MAIN CONTENT
            ============================================ */}
            <main style={{
                padding: '24px',
                minHeight: 'calc(100vh - 64px - 60px)',
                background: '#f5f7fa',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Outlet />
                </div>
            </main>

            {/* ============================================
                FOOTER
            ============================================ */}
            <footer style={{
                padding: '20px',
                textAlign: 'center',
                background: 'white',
                borderTop: '1px solid #e0e0e0',
                color: '#78909c',
                fontSize: '14px',
            }}>
                <p>Hệ thống quản lý nhân sự © 2026</p>
            </footer>
        </div>
    );
}

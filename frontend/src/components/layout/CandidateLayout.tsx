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
                    <img src="/favicon.png" alt="Logo" style={{ width: '40px', height: '40px' }} />
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#1a237e' }}>Hệ Thống Quản Lý Nhân Sự</span>
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
                        Đăng nhập
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
                <p>[Nhóm 8] BTL Kỹ thuật phần mềm - kỳ 2 - năm 2026 - ĐH Phenikaa</p>
            </footer>
        </div>
    );
}

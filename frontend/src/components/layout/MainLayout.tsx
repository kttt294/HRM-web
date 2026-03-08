import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../store/ui.store';

export function MainLayout() {
    const { isSidebarOpen, toggleSidebar } = useUIStore();

    return (
        <div id="app-layout">
            {/* Sidebar Trigger Zone - Hidden until hover */}
            {!isSidebarOpen && (
                <div 
                    className="sidebar-trigger-zone"
                    style={{
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '40px',
                        zIndex: 99,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingLeft: '4px',
                        cursor: 'pointer'
                    }}
                    onClick={toggleSidebar}
                    onMouseEnter={(e) => {
                        const btn = e.currentTarget.querySelector('.floating-trigger-btn') as HTMLElement;
                        if (btn) {
                            btn.style.opacity = '1';
                            btn.style.transform = 'translateX(0)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        const btn = e.currentTarget.querySelector('.floating-trigger-btn') as HTMLElement;
                        if (btn) {
                            btn.style.opacity = '0';
                            btn.style.transform = 'translateX(-10px)';
                        }
                    }}
                >
                    <button
                        className="floating-trigger-btn"
                        style={{
                            width: '32px',
                            height: '60px',
                            background: '#4bb9e4',
                            border: 'none',
                            borderRadius: '0 8px 8px 0',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transform: 'translateX(-10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="layout-body" style={{ paddingTop: 0 }}>
                <Sidebar />
                <main id="app-content" style={{ 
                    marginLeft: isSidebarOpen ? 'var(--sidebar-width)' : '0',
                    minHeight: '100vh', 
                    marginTop: 0,
                    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    padding: '24px' 
                }}>
                    <Outlet />
                </main>
            </div>
            <footer id="app-footer">
                <p>[Nhóm 8] BTL Kỹ thuật phần mềm - kỳ 2 - năm 2026 - ĐH Phenikaa</p>
            </footer>
        </div>
    );
}

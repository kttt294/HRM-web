import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIStore } from '../../store/ui.store';
import anime from 'animejs';


/**
 * Header component với animations
 * Không sử dụng emoji icons
 */
export function Header() {
    const { isSidebarOpen, toggleSidebar } = useUIStore();
    const headerRef = useRef<HTMLElement>(null);
    const location = useLocation();
    const isHomePage = location.pathname === '/';

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


    return (
        <header ref={headerRef} id="app-header" style={{ opacity: 0, position: 'relative' }}>
            <div className="header-left" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: isHomePage ? 'auto' : '100%',
                justifyContent: isHomePage ? 'flex-start' : 'center',
                position: isHomePage ? 'static' : 'absolute',
                left: isHomePage ? 'auto' : 0,
                right: isHomePage ? 'auto' : 0,
                pointerEvents: 'none' // Để không chặn click vào menu toggle bên dưới nếu cần
            }}>
                {/* Logo and Title Container */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    pointerEvents: 'auto'
                }}>
                    <img
                        src="/favicon.png"
                        alt="HRM Logo"
                        className="app-logo"
                        style={{
                            height: '40px',
                            borderRadius: '8px'
                        }}
                    />
                </div>
            </div>

            {/* Menu toggle button kept at the left */}
            {!isSidebarOpen && (
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <button
                        className="menu-toggle"
                        onClick={toggleSidebar}
                        aria-label="Mở menu"
                        title="Mở menu"
                    >
                        <span className="hamburger-icon">
                            <span></span>
                            <span></span>
                            <span></span>
                        </span>
                    </button>
                </div>
            )}

            <div className="header-right" style={{ position: 'relative', zIndex: 10 }}>
                <div className="user-menu">
                    {/* Thông tin người dùng đã được ẩn */}
                </div>
            </div>
        </header>
    );
}

import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../../../shared/constants/routes';
import anime from 'animejs';

export function EntryPage() {
    const navigate = useNavigate();
    const heroRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        // Hero Animation
        anime({
            targets: '.hero-animate',
            translateY: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(50, { start: 100 }),
            easing: 'easeOutQuart',
            duration: 800,
            loop: true,
            endDelay: 10000,
        });

        // Scroll animation observer could be added here for 'features'
    }, []);

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background:'#ffffff',
            overflowX: 'hidden',
        }}>
            <header style={{
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 5%',
                position: 'fixed',
                top: 0,
                width: '100%',
                left: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                zIndex: 100,
                borderBottom: '1px solid #f0f0f0',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
<img src="/favicon.png" alt="Logo" style={{ width: '40px', height: '40px' }} />
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#1a237e' }}>CÔNG TY CỔ PHẦN ABC</span>
                </div>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <button
                        onClick={() => handleNavigation(ROUTES.JOBS)}
                        style={{
                            padding: '12px 28px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'white',
                            background: '#0a0101ff',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(7, 3, 1, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(7, 5, 3, 0.3)';
                        }}
                    >
                        Ứng viên - Đăng ký tuyển dụng
                    </button>
                    <button 
                        onClick={() => handleNavigation(ROUTES.LOGIN)}
                        style={{
                            padding: '12px 28px',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'white',
                            background: '#2563eb',
                            border: 'none',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(37, 99, 235, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                        }}
                    >
                        Đăng nhập
                    </button>
                </div>
            </header>

            <section ref={heroRef} style={{
                position: 'relative',
                padding: '100px 5% 35px',
                textAlign: 'center',
                background: 'linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%)',
                overflow: 'hidden',
            }}>
                {/* Decorative blobs */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-5%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(235, 245, 255, 0.8) 0%, rgba(255,255,255,0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
                    <div className="hero-animate" style={{ 
                        opacity: 0,
                        display: 'inline-block',
                        padding: '6px 16px',
                        background: '#e3f2fd',
                        color: '#1565c0',
                        borderRadius: '30px',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '24px'
                    }}>
                        Chào mừng đến với Hệ thống HRM
                    </div>

                    <h1 className="hero-animate" style={{
                        fontSize: '56px',
                        lineHeight: '1.1',
                        fontWeight: '800',
                        color: '#1a237e',
                        marginBottom: '24px',
                        opacity: 0,
                        letterSpacing: '-1px',
                    }}>
                        Quản lý Nhân sự <br/>
                        <span style={{ 
                            background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>Hiệu quả và Chuyên nghiệp</span>
                    </h1>

                    <p className="hero-animate" style={{
                        fontSize: '18px',
                        color: '#546e7a',
                        marginBottom: '32px',
                        lineHeight: '1.6',
                        maxWidth: '700px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        opacity: 0,
                    }}>
                        Hệ thống HRM hiện đại giúp doanh nghiệp tối ưu hóa quy trình tuyển dụng, quản lý hồ sơ và nâng cao trải nghiệm ứng viên.
                    </p>


                </div>
            </section>

            <section style={{
                padding: '20px 5% 80px',
                background: 'white',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#263238',
                        marginBottom: '32px',
                    }}>
                        Cổng thông tin dành cho mọi vai trò
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '30px',
                    }}>
                        <RoleCard 
                            title="Quản trị & HR"
                            description="Quản lý toàn bộ vòng đời nhân viên, quy trình tuyển dụng và báo cáo nhân sự."
                            icon="1"
                            color="#1976d2"
                            onClick={() => handleNavigation(ROUTES.LOGIN)}
                        />
                        <RoleCard 
                            title="Nhân viên"
                            description="Cập nhật hồ sơ cá nhân, xem thông tin công ty và quản lý ngày phép."
                            icon="2"
                            color="#4caf50"
                            onClick={() => handleNavigation(ROUTES.LOGIN)}
                        />
                        <RoleCard 
                            title="Ứng viên"
                            description="Tìm kiếm cơ hội việc làm, nộp hồ sơ và theo dõi trạng thái ứng tuyển."
                            icon="3"
                            color="#ff9800"
                            onClick={() => handleNavigation(ROUTES.JOBS)}
                        />
                    </div>
                </div>
            </section>

            <footer style={{
                padding: '20px',
                textAlign: 'center',
                background: 'white',
                borderTop: '1px solid #e0e0e0',
                color: '#78909c',
                fontSize: '14px',
                marginTop: 'auto'
            }}>
                <p>[Nhóm 8] BTL Kỹ thuật phần mềm - kỳ 2 - năm 2026 - ĐH Phenikaa</p>
            </footer>
        </div>
    );
}

function RoleCard({ title, description, icon, color, onClick }: any) {
    return (
        <div 
            onClick={onClick}
            style={{
                padding: '32px',
                background: 'white',
                borderRadius: '20px',
                border: '1px solid #eceff1',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = color;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#eceff1';
            }}
        >
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px',
                marginBottom: '24px',
                width: '100%'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: `${color}15`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    flexShrink: 0
                }}>
                    {icon}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#37474f', margin: 0 }}>
                    {title}
                </h3>
            </div>
            <p style={{ fontSize: '15px', color: '#78909c', lineHeight: '1.6', marginBottom: '24px', flex: 1 }}>
                {description}
            </p>
            <div style={{ 
                color: color, 
                fontWeight: '600', 
                fontSize: '18px', 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px' 
            }}>
                Truy cập <span style={{ fontSize: '18px' }}>→</span>
            </div>
        </div>
    );
}

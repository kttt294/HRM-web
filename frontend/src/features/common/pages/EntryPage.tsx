import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../shared/constants/routes';
import anime from 'animejs';

export function EntryPage() {
    const navigate = useNavigate();
    const heroRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Hero Animation
        anime({
            targets: '.hero-animate',
            translateY: [30, 0],
            opacity: [0, 1],
            delay: anime.stagger(100, { start: 200 }),
            easing: 'easeOutQuart',
            duration: 800,
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
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '18px',
                        boxShadow: '0 4px 10px rgba(25, 118, 210, 0.2)'
                    }}>HR</div>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#1a237e' }}>HRM System</span>
                </div>
                
                <Button 
                    onClick={() => handleNavigation(ROUTES.LOGIN)}
                    style={{
                        padding: '10px 24px',
                        fontSize: '14px',
                        borderRadius: '50px',
                    }}
                >
                    Đăng nhập
                </Button>
            </header>

            <section ref={heroRef} style={{
                position: 'relative',
                padding: '100px 5%',
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
                        Welcome to TTS HR System
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
                        fontSize: '20px',
                        color: '#546e7a',
                        marginBottom: '48px',
                        lineHeight: '1.6',
                        maxWidth: '700px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        opacity: 0,
                    }}>
                        Hệ thống HRM hiện đại giúp doanh nghiệp tối ưu hóa quy trình tuyển dụng, quản lý hồ sơ và nâng cao trải nghiệm ứng viên.
                    </p>

                    <div className="hero-animate" style={{ 
                        display: 'flex', 
                        gap: '20px', 
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        opacity: 0,
                    }}>
                        <button
                            onClick={() => handleNavigation(ROUTES.LOGIN)}
                            style={{
                                padding: '16px 40px',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: 'white',
                                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                boxShadow: '0 8px 20px rgba(21, 101, 192, 0.3)',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Truy cập Hệ thống
                        </button>
                        
                        <button
                            onClick={() => handleNavigation(ROUTES.JOBS)}
                            style={{
                                padding: '16px 40px',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#455a64',
                                background: 'white',
                                border: '1px solid #cfd8dc',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f5f7fa';
                                e.currentTarget.style.borderColor = '#b0bec5';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.borderColor = '#cfd8dc';
                            }}
                        >
                            Ứng viên - Đăng ký tuyển dụng
                        </button>
                    </div>
                </div>
            </section>

            <section style={{
                padding: '80px 5%',
                background: 'white',
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{
                        textAlign: 'center',
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#263238',
                        marginBottom: '60px',
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
                background: '#ffffff',
                padding: '40px 5%',
                borderTop: '1px solid #eceff1',
                textAlign: 'center',
            }}>
                <div style={{
                    color: '#90a4ae',
                    fontSize: '14px',
                }}>
                    <p style={{ marginBottom: '8px' }}>© {new Date().getFullYear()} Hệ thống quản lý nhân sự.</p>
                </div>
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
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: `${color}15`,
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                marginBottom: '24px',
            }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#37474f', marginBottom: '12px' }}>
                {title}
            </h3>
            <p style={{ fontSize: '15px', color: '#78909c', lineHeight: '1.6', marginBottom: '24px', flex: 1 }}>
                {description}
            </p>
            <div style={{ 
                color: color, 
                fontWeight: '600', 
                fontSize: '14px', 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px' 
            }}>
                Truy cập <span style={{ fontSize: '18px' }}>→</span>
            </div>
        </div>
    );
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div style={{ textAlign: 'left' }}>
            <div style={{ 
                width: '40px', 
                height: '4px', 
                background: '#cfd8dc', 
                marginBottom: '20px',
                borderRadius: '2px' 
            }} />
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#455a64', marginBottom: '10px' }}>
                {title}
            </h4>
            <p style={{ fontSize: '15px', color: '#78909c', lineHeight: '1.6' }}>
                {desc}
            </p>
        </div>
    );
}

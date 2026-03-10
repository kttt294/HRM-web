import { useRef, useEffect, useState } from 'react';
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
                    <span style={{ fontSize: '20px', fontWeight: '700', color: '#1a237e' }}>Hệ Thống Quản Lý Nhân Sự</span>
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

            {/* Public Chatbot Bubble */}
            <PublicChatBubble />
        </div>
    );
}

function PublicChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([
        {
            role: 'model',
            parts: [{ text: 'Xin chào! Tôi là trợ lý AI của hệ thống HRM. Tôi có thể giúp bạn tìm hiểu về hệ thống và các tính năng. Bạn cần hỗ trợ gì không?' }]
        }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isOpen]);

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;
        const text = message.trim();
        setMessage('');
        const userMsg = { role: 'user' as const, parts: [{ text }] };
        setChatHistory(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const validHistory = chatHistory
                .filter((msg, idx) => !(idx === 0 && msg.role === 'model'))
                .map(msg => ({ role: msg.role, parts: msg.parts }));

            const res = await fetch('/api/chatbot/ask-public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history: validHistory }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);
        } catch {
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại!' }] }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    title="Trợ lý AI"
                    style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1976d2, #64b5f6)',
                        color: 'white', border: 'none',
                        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.4)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'pulse-blue 2s infinite',
                        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            )}

            {isOpen && (
                <div style={{
                    width: '380px', height: '550px', background: 'white',
                    borderRadius: '24px', boxShadow: '0 12px 60px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    border: '1px solid #eee', animation: 'slideUp 0.3s ease'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '20px', background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                        color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '16px' }}>Trợ lý AI</div>
                                <div style={{ fontSize: '12px', opacity: 0.8 }}>Sẵn sàng hỗ trợ bạn</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '28px', cursor: 'pointer', opacity: 0.7 }}>×</button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8f9fa', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {chatHistory.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%', padding: '12px 16px',
                                borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                background: msg.role === 'user' ? '#1976d2' : 'white',
                                color: msg.role === 'user' ? 'white' : '#333',
                                fontSize: '14px', lineHeight: '1.5',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', whiteSpace: 'pre-line'
                            }}>
                                {msg.parts[0].text.split('**').map((part, idx) =>
                                    idx % 2 === 1 ? <strong key={idx}>{part}</strong> : part
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '18px 18px 18px 2px', background: 'white', display: 'flex', gap: '4px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ccc', display: 'inline-block', animation: 'typingJump 0.6s infinite alternate' }}></span>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ccc', display: 'inline-block', animation: 'typingJump 0.6s 0.2s infinite alternate' }}></span>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ccc', display: 'inline-block', animation: 'typingJump 0.6s 0.4s infinite alternate' }}></span>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div style={{ padding: '16px 20px', background: 'white', borderTop: '1px solid #eee', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            placeholder="Nhập câu hỏi..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            style={{ flex: 1, border: '1px solid #ddd', borderRadius: '20px', padding: '10px 16px', fontSize: '14px', outline: 'none', background: '#f5f5f5' }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !message.trim()}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%', background: '#1976d2',
                                color: 'white', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                opacity: (isLoading || !message.trim()) ? 0.5 : 1
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse-blue {
                    0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(25, 118, 210, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes typingJump {
                    from { transform: translateY(0); }
                    to { transform: translateY(-6px); }
                }
            `}</style>
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

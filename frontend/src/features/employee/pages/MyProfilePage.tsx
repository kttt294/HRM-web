import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/auth.store';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import anime from 'animejs';

/**
 * ============================================
 * MY PROFILE PAGE - Employee Self-Service
 * ============================================
 * 
 * Trang thông tin cá nhân với animations mượt mà
 * Không sử dụng emoji icons, thay bằng visual design
 */

// Mock data cho thông tin công việc
const MOCK_JOB_INFO = {
    employeeId: 'NV0042',
    department: 'Phòng Công nghệ',
    jobTitle: 'Lập trình viên Frontend',
    manager: 'Nguyễn Văn Quản Lý',
    joinDate: '15/03/2024',
    workLocation: 'Tòa nhà ABC, Cầu Giấy, Hà Nội',
    employmentType: 'Toàn thời gian',
    status: 'Đang làm việc',
};

export function MyProfilePage() {
    const { user } = useAuthStore();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);

    const [contactInfo, setContactInfo] = useState({
        phone: '0912 345 678',
        personalEmail: 'nguyenvana.personal@gmail.com',
        address: '123 Đường ABC, Quận Đống Đa, Hà Nội',
        emergencyContact: 'Nguyễn Văn B - 0987 654 321',
    });

    // Page load animation
    useEffect(() => {
        if (pageRef.current) {
            anime({
                targets: pageRef.current.querySelectorAll('.animate-item'),
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 600,
                delay: anime.stagger(100),
                easing: 'easeOutQuart',
            });
        }
    }, []);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Button animation
    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEnter: boolean) => {
        anime({
            targets: e.currentTarget,
            scale: isEnter ? 1.02 : 1,
            duration: 200,
            easing: 'easeOutQuad',
        });
    };

    return (
        <div ref={pageRef}>
            {/* Page Header */}
            <div className="page-header animate-item" style={{ opacity: 0 }}>
                <div className="page-title-section">
                    <nav className="breadcrumb">
                        <a href="/">Trang chủ</a>
                        <span className="breadcrumb-separator">/</span>
                        <span>Thông tin cá nhân</span>
                    </nav>
                    <h1>Thông tin cá nhân</h1>
                    <p className="page-subtitle">
                        Xem thông tin và cập nhật liên hệ của bạn
                    </p>
                </div>
            </div>

            {/* ============================================
                PROFILE HEADER - Avatar + Basic Info
            ============================================ */}
            <div className="card animate-item" style={{ marginBottom: '24px', opacity: 0 }}>
                <div className="card-body">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px',
                        flexWrap: 'wrap',
                    }}>
                        {/* Avatar với gradient animation */}
                        <div 
                            className="profile-avatar"
                            style={{
                                width: '96px',
                                height: '96px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #1976d2 0%, #7c4dff 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '32px',
                                fontWeight: '600',
                                flexShrink: 0,
                                boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)',
                            }}
                        >
                            {user?.name ? getInitials(user.name) : 'NV'}
                        </div>

                        {/* Thông tin chính */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <h2 style={{ 
                                fontSize: '24px', 
                                fontWeight: '600',
                                marginBottom: '4px',
                                color: '#212121',
                            }}>
                                {user?.name || 'Nguyễn Văn A'}
                            </h2>
                            <p style={{ 
                                color: '#757575', 
                                marginBottom: '12px',
                                fontSize: '15px',
                            }}>
                                {MOCK_JOB_INFO.jobTitle} • {MOCK_JOB_INFO.department}
                            </p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span className="status-badge status-active">
                                    {MOCK_JOB_INFO.status}
                                </span>
                                <span style={{ 
                                    color: '#9e9e9e', 
                                    fontSize: '13px',
                                    padding: '4px 12px',
                                    background: '#f5f5f5',
                                    borderRadius: '20px',
                                }}>
                                    {MOCK_JOB_INFO.employeeId}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ 
                            display: 'flex', 
                            gap: '12px',
                            flexShrink: 0,
                        }}>
                            <Button 
                                onClick={() => setShowEditModal(true)}
                                onMouseEnter={(e) => handleButtonHover(e, true)}
                                onMouseLeave={(e) => handleButtonHover(e, false)}
                            >
                                Cập nhật liên hệ
                            </Button>
                            <Button 
                                variant="secondary" 
                                onClick={() => setShowPasswordModal(true)}
                                onMouseEnter={(e) => handleButtonHover(e, true)}
                                onMouseLeave={(e) => handleButtonHover(e, false)}
                            >
                                Đổi mật khẩu
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================
                TWO COLUMN LAYOUT
            ============================================ */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '24px',
            }}>
                {/* CONTACT INFO */}
                <div className="card animate-item" style={{ opacity: 0 }}>
                    <div className="card-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <h3>Thông tin liên hệ</h3>
                        <span style={{
                            fontSize: '11px',
                            color: '#4caf50',
                            background: '#e8f5e9',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontWeight: '500',
                        }}>
                            Có thể chỉnh sửa
                        </span>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <InfoRow 
                                label="Email công ty" 
                                value={user?.email || 'nhanvien@hrm.vn'} 
                                color="#1976d2"
                            />
                            <InfoRow 
                                label="Số điện thoại" 
                                value={contactInfo.phone}
                                color="#4caf50" 
                            />
                            <InfoRow 
                                label="Email cá nhân" 
                                value={contactInfo.personalEmail}
                                color="#ff9800" 
                            />
                            <InfoRow 
                                label="Địa chỉ" 
                                value={contactInfo.address}
                                color="#9c27b0" 
                            />
                        </div>
                    </div>
                </div>

                {/* JOB INFO */}
                <div className="card animate-item" style={{ opacity: 0 }}>
                    <div className="card-header" style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <h3>Thông tin công việc</h3>
                        <span style={{
                            fontSize: '11px',
                            color: '#757575',
                            background: '#f5f5f5',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontWeight: '500',
                        }}>
                            Do HR quản lý
                        </span>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <InfoRow 
                                label="Phòng ban" 
                                value={MOCK_JOB_INFO.department}
                                color="#1976d2" 
                            />
                            <InfoRow 
                                label="Chức danh" 
                                value={MOCK_JOB_INFO.jobTitle}
                                color="#7c4dff" 
                            />
                            <InfoRow 
                                label="Quản lý trực tiếp" 
                                value={MOCK_JOB_INFO.manager}
                                color="#00bcd4" 
                            />
                            <InfoRow 
                                label="Ngày vào làm" 
                                value={MOCK_JOB_INFO.joinDate}
                                color="#4caf50" 
                            />
                            <InfoRow 
                                label="Trụ sở" 
                                value={MOCK_JOB_INFO.workLocation}
                                color="#ff9800" 
                            />
                            <InfoRow 
                                label="Loại hình" 
                                value={MOCK_JOB_INFO.employmentType}
                                color="#607d8b" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================
                QUICK LINKS
            ============================================ */}
            <div className="card animate-item" style={{ marginTop: '24px', opacity: 0 }}>
                <div className="card-header">
                    <h3>Truy cập nhanh</h3>
                </div>
                <div className="card-body">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                    }}>
                        <QuickLink 
                            title="Yêu cầu nghỉ phép" 
                            description="Gửi đơn xin nghỉ"
                            color="#4caf50"
                            href="/my-leaves"
                        />
                        <QuickLink 
                            title="Bảng lương" 
                            description="Xem lịch sử lương"
                            color="#1976d2"
                            href="/my-payroll"
                        />
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {showEditModal && (
                <AnimatedModal
                    title="Cập nhật thông tin liên hệ"
                    onClose={() => setShowEditModal(false)}
                >
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <Input
                            label="Số điện thoại"
                            value={contactInfo.phone}
                            onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                        />
                        <Input
                            label="Email cá nhân"
                            type="email"
                            value={contactInfo.personalEmail}
                            onChange={(e) => setContactInfo({...contactInfo, personalEmail: e.target.value})}
                        />
                        <Input
                            label="Địa chỉ"
                            value={contactInfo.address}
                            onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                        />
                        <Input
                            label="Liên hệ khẩn cấp (Tên - SĐT)"
                            value={contactInfo.emergencyContact}
                            onChange={(e) => setContactInfo({...contactInfo, emergencyContact: e.target.value})}
                        />
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <Button onClick={() => setShowEditModal(false)}>
                                Lưu thay đổi
                            </Button>
                            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                                Hủy
                            </Button>
                        </div>
                    </div>
                </AnimatedModal>
            )}

            {showPasswordModal && (
                <AnimatedModal
                    title="Đổi mật khẩu"
                    onClose={() => setShowPasswordModal(false)}
                >
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <Input label="Mật khẩu hiện tại" type="password" />
                        <Input label="Mật khẩu mới" type="password" />
                        <Input label="Xác nhận mật khẩu mới" type="password" />
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <Button onClick={() => setShowPasswordModal(false)}>
                                Đổi mật khẩu
                            </Button>
                            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                                Hủy
                            </Button>
                        </div>
                    </div>
                </AnimatedModal>
            )}
        </div>
    );
}

/* ============================================
   HELPER COMPONENTS - No emoji icons
   ============================================ */

function InfoRow({ label, value, color }: { label: string; value: string; color: string }) {
    const rowRef = useRef<HTMLDivElement>(null);

    const handleHover = (isEnter: boolean) => {
        if (rowRef.current) {
            anime({
                targets: rowRef.current,
                translateX: isEnter ? 4 : 0,
                duration: 200,
                easing: 'easeOutQuad',
            });
        }
    };

    return (
        <div 
            ref={rowRef}
            style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px',
                cursor: 'default',
            }}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
        >
            {/* Color indicator thay cho icon */}
            <div style={{
                width: '4px',
                height: '100%',
                minHeight: '40px',
                background: color,
                borderRadius: '2px',
                flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
                <div style={{ 
                    fontSize: '12px', 
                    color: '#9e9e9e',
                    marginBottom: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: '500',
                }}>
                    {label}
                </div>
                <div style={{ 
                    fontSize: '14px', 
                    color: '#212121',
                    fontWeight: '500',
                    lineHeight: '1.4',
                }}>
                    {value}
                </div>
            </div>
        </div>
    );
}

function QuickLink({ title, description, color, href }: { title: string; description: string; color: string; href?: string }) {
    const navigate = useNavigate();
    const linkRef = useRef<HTMLDivElement>(null);

    const handleHover = (isEnter: boolean) => {
        if (linkRef.current) {
            anime({
                targets: linkRef.current,
                translateY: isEnter ? -2 : 0,
                scale: isEnter ? 1.02 : 1,
                boxShadow: isEnter 
                    ? '0 6px 20px rgba(0,0,0,0.1)' 
                    : '0 0 0 rgba(0,0,0,0)',
                duration: 200,
                easing: 'easeOutQuad',
            });
        }
    };

    const handleClick = () => {
        if (href) navigate(href);
    };

    return (
        <div 
            ref={linkRef}
            onClick={handleClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: '#fafafa',
                borderRadius: '12px',
                cursor: 'pointer',
                borderLeft: `4px solid ${color}`,
            }}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
        >
            {/* Circle indicator thay cho icon */}
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: color,
                }} />
            </div>
            <div>
                <div style={{ 
                    fontWeight: '600', 
                    fontSize: '14px',
                    color: '#212121',
                    marginBottom: '2px',
                }}>
                    {title}
                </div>
                <div style={{ 
                    fontSize: '12px', 
                    color: '#757575' 
                }}>
                    {description}
                </div>
            </div>
        </div>
    );
}

function AnimatedModal({ 
    title, 
    onClose, 
    children 
}: { 
    title: string; 
    onClose: () => void; 
    children: React.ReactNode 
}) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Entry animation
        anime({
            targets: overlayRef.current,
            opacity: [0, 1],
            duration: 200,
            easing: 'easeOutQuad',
        });
        anime({
            targets: contentRef.current,
            opacity: [0, 1],
            scale: [0.9, 1],
            translateY: [-30, 0],
            duration: 400,
            easing: 'easeOutBack',
        });
    }, []);

    const handleClose = () => {
        anime({
            targets: contentRef.current,
            opacity: [1, 0],
            scale: [1, 0.9],
            duration: 200,
            easing: 'easeInQuad',
        });
        anime({
            targets: overlayRef.current,
            opacity: [1, 0],
            duration: 250,
            easing: 'easeInQuad',
            complete: onClose,
        });
    };

    return (
        <div 
            ref={overlayRef}
            className="modal-overlay"
            onClick={(e) => e.target === overlayRef.current && handleClose()}
            style={{ opacity: 0 }}
        >
            <div 
                ref={contentRef}
                className="modal-content"
                style={{ opacity: 0 }}
            >
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button 
                        className="modal-close"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

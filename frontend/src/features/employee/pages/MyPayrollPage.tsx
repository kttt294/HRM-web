import { useState, useEffect, useRef } from 'react';
import { payrollApi } from '../../hr/services/payroll.api';
import { Payroll } from '../../hr/models/payroll.model';
import anime from 'animejs';

/**
 * ============================================
 * MY PAYROLL PAGE - Employee Self-Service
 * ============================================
 * Xem bảng lương cá nhân
 */

export function MyPayrollPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

    useEffect(() => {
        const fetchPayrolls = async () => {
            try {
                const data = await payrollApi.getMyPayroll();
                setPayrolls(data);
            } catch (error) {
                console.error('Failed to fetch payrolls:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayrolls();
    }, []);

    useEffect(() => {
        if (containerRef.current && !loading) {
            anime({
                targets: containerRef.current.querySelectorAll('.animate-item'),
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                delay: anime.stagger(80),
                easing: 'easeOutQuart',
            });
        }
    }, [loading]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getMonthName = (month: number) => {
        return `Tháng ${month}`;
    };

    // Get latest payroll for summary
    const latestPayroll = payrolls[0];

    return (
        <div ref={containerRef}>
            {/* Header */}
            <div className="page-header animate-item" style={{ opacity: 0 }}>
                <h1>Bảng lương của tôi</h1>
                <p className="page-subtitle">
                    Xem chi tiết lương hàng tháng
                </p>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                    Đang tải...
                </div>
            ) : payrolls.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                    Chưa có dữ liệu bảng lương
                </div>
            ) : (
                <>
                    {/* Current Month Salary Card */}
                    {latestPayroll && (
                        <div 
                            className="animate-item"
                            onClick={() => setSelectedPayroll(latestPayroll)}
                            style={{
                                background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
                                borderRadius: '20px',
                                padding: '32px',
                                color: 'white',
                                marginBottom: '24px',
                                cursor: 'pointer',
                                opacity: 0,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Decorative circles */}
                            <div style={{
                                position: 'absolute',
                                top: '-50px',
                                right: '-50px',
                                width: '200px',
                                height: '200px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                            }} />
                            <div style={{
                                position: 'absolute',
                                bottom: '-30px',
                                left: '20%',
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.05)',
                            }} />
                            
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                                    Lương {getMonthName(latestPayroll.month)} {latestPayroll.year}
                                </div>
                                <div style={{ fontSize: '40px', fontWeight: '700', marginBottom: '16px' }}>
                                    {formatCurrency(latestPayroll.netSalary)}
                                </div>
                                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Lương cơ bản</div>
                                        <div style={{ fontSize: '16px', fontWeight: '500' }}>
                                            {formatCurrency(latestPayroll.baseSalary)}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Phụ cấp</div>
                                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#a5d6a7' }}>
                                            +{formatCurrency(Object.values(latestPayroll.allowances).reduce((a, b) => a + b, 0))}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', opacity: 0.7 }}>Khấu trừ</div>
                                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#ef9a9a' }}>
                                            -{formatCurrency(Object.values(latestPayroll.deductions).reduce((a, b) => a + b, 0))}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
                                    Nhấn để xem chi tiết →
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History List */}
                    <div className="animate-item" style={{
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        opacity: 0,
                    }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
                            <h3 style={{ margin: 0, fontSize: '16px' }}>Lịch sử lương</h3>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {payrolls.map((payroll, index) => (
                                <div
                                    key={payroll.id}
                                    onClick={() => setSelectedPayroll(payroll)}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: index < payrolls.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: index === 0 
                                                ? 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)'
                                                : '#f5f5f5',
                                            color: index === 0 ? 'white' : '#757575',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                        }}>
                                            <div style={{ fontSize: '16px' }}>{payroll.month}</div>
                                            <div style={{ fontSize: '10px', opacity: 0.8 }}>{payroll.year}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>
                                                {getMonthName(payroll.month)} {payroll.year}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#757575' }}>
                                                {payroll.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: '600', fontSize: '16px', fontFamily: 'monospace' }}>
                                            {formatCurrency(payroll.netSalary)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* Detail Modal */}
            {selectedPayroll && (
                <PayrollDetailModal 
                    payroll={selectedPayroll} 
                    onClose={() => setSelectedPayroll(null)} 
                    formatCurrency={formatCurrency}
                />
            )}
        </div>
    );
}

function PayrollDetailModal({ 
    payroll, 
    onClose,
    formatCurrency,
}: { 
    payroll: Payroll; 
    onClose: () => void;
    formatCurrency: (n: number) => string;
}) {
    return (
        <div 
            onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
        >
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '450px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px' }}>
                        Phiếu lương Tháng {payroll.month}/{payroll.year}
                    </h2>
                    <button 
                        onClick={onClose}
                        style={{ 
                            background: 'none', 
                            border: 'none', 
                            fontSize: '24px', 
                            cursor: 'pointer',
                            color: '#757575',
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 12px', color: '#1976d2', fontSize: '14px' }}>
                        Thu nhập
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <DetailRow label="Lương cơ bản" value={formatCurrency(payroll.baseSalary)} />
                        <DetailRow label="Phụ cấp nhà ở" value={`+${formatCurrency(payroll.allowances.housing)}`} color="#4caf50" />
                        <DetailRow label="Phụ cấp đi lại" value={`+${formatCurrency(payroll.allowances.transport)}`} color="#4caf50" />
                        <DetailRow label="Phụ cấp ăn uống" value={`+${formatCurrency(payroll.allowances.meal)}`} color="#4caf50" />
                        {payroll.allowances.other > 0 && (
                            <DetailRow label="Phụ cấp khác" value={`+${formatCurrency(payroll.allowances.other)}`} color="#4caf50" />
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 12px', color: '#f44336', fontSize: '14px' }}>
                        Khấu trừ
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <DetailRow label="Bảo hiểm (10.5%)" value={`-${formatCurrency(payroll.deductions.insurance)}`} color="#f44336" />
                        <DetailRow label="Thuế TNCN (10%)" value={`-${formatCurrency(payroll.deductions.tax)}`} color="#f44336" />
                    </div>
                </div>

                <div style={{ 
                    padding: '20px', 
                    background: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
                    borderRadius: '12px',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <span style={{ fontSize: '16px' }}>Thực nhận</span>
                    <span style={{ fontSize: '28px', fontWeight: '700' }}>{formatCurrency(payroll.netSalary)}</span>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
            <span style={{ color: '#616161' }}>{label}</span>
            <span style={{ fontWeight: '500', fontFamily: 'monospace', color: color || '#212121' }}>{value}</span>
        </div>
    );
}

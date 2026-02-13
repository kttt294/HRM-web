import { useState, useEffect, useRef } from 'react';
import { SystemUser } from '../models/user.model';
import { userApi } from '../services/user.api';
import { Role } from '../../../shared/constants/rbac';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import anime from 'animejs';
import { useSnackbarStore } from '../../../store/snackbar.store';

/**
 * ============================================
 * USER LIST PAGE - Quản lý tài khoản
 * ============================================
 */
export function UserListPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [users, setUsers] = useState<SystemUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<Role | ''>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    
    // Modal states
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: SystemUser | null }>({
        open: false,
        user: null,
    });
    const [editModal, setEditModal] = useState<{ open: boolean; user: SystemUser | null }>({
        open: false,
        user: null,
    });
    const [editForm, setEditForm] = useState<{ name: string; role: Role }>({
        name: '',
        role: Role.EMPLOYEE,
    });
    const { showSnackbar } = useSnackbarStore();

    // Fetch users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params: { search?: string; role?: Role; status?: string } = {};
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            if (statusFilter) params.status = statusFilter;
            
            const result = await userApi.getUsers(params);
            setUsers(result.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter, statusFilter]);

    // Entry animation
    useEffect(() => {
        if (containerRef.current && !loading) {
            anime({
                targets: containerRef.current.querySelectorAll('.user-row'),
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 400,
                delay: anime.stagger(50),
                easing: 'easeOutQuart',
            });
        }
    }, [loading, users]);

    // Role label helper
    const getRoleLabel = (role: Role) => {
        switch (role) {
            case Role.ADMIN: return 'System Admin';
            case Role.HR: return 'HR Manager';
            case Role.EMPLOYEE: return 'Nhân viên';
            default: return role;
        }
    };

    const getRoleColor = (role: Role) => {
        switch (role) {
            case Role.ADMIN: return '#f44336';
            case Role.HR: return '#1976d2';
            case Role.EMPLOYEE: return '#4caf50';
            default: return '#757575';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Hoạt động';
            case 'inactive': return 'Không hoạt động';
            case 'locked': return 'Đã khóa';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#4caf50';
            case 'inactive': return '#ff9800';
            case 'locked': return '#f44336';
            default: return '#757575';
        }
    };

    // Actions
    const handleDelete = async () => {
        if (!deleteModal.user) return;
        try {
            await userApi.deleteUser(deleteModal.user.id);
            setDeleteModal({ open: false, user: null });
            fetchUsers();
            showSnackbar('Xóa tài khoản thành công', 'success');
        } catch (error) {
            showSnackbar(error instanceof Error ? error.message : 'Lỗi xóa tài khoản', 'error');
        }
    };

    const handleToggleLock = async (user: SystemUser) => {
        try {
            await userApi.toggleLock(user.id);
            fetchUsers();
            showSnackbar('Cập nhật trạng thái tài khoản thành công', 'success');
        } catch (error) {
            showSnackbar(error instanceof Error ? error.message : 'Lỗi khóa/mở khóa tài khoản', 'error');
        }
    };

    const handleOpenEdit = (user: SystemUser) => {
        setEditForm({
            name: user.name,
            role: user.role,
        });
        setEditModal({ open: true, user });
    };

    const handleSaveEdit = async () => {
        if (!editModal.user) return;
        try {
            await userApi.updateUser(editModal.user.id, editForm);
            setEditModal({ open: false, user: null });
            fetchUsers();
            showSnackbar('Cập nhật tài khoản thành công', 'success');
        } catch (error) {
            showSnackbar(error instanceof Error ? error.message : 'Lỗi cập nhật tài khoản', 'error');
        }
    };

    const handleResetPassword = async (user: SystemUser) => {
        try {
            const result = await userApi.resetPassword(user.id);
            showSnackbar(`Mật khẩu mới của ${user.name}: ${result.tempPassword}`, 'success', 15000);
        } catch (error) {
            showSnackbar(error instanceof Error ? error.message : 'Lỗi reset mật khẩu', 'error');
        }
    };

    return (
        <div ref={containerRef}>
            {/* Header */}
            <div className="page-header">
                <div className="page-title-section">
                    <nav className="breadcrumb">
                        <a href="/">Trang chủ</a>
                        <span className="breadcrumb-separator">/</span>
                        <a href="/admin">Quản lý hệ thống</a>
                        <span className="breadcrumb-separator">/</span>
                        <span>Tài khoản người dùng</span>
                    </nav>
                    <h1>Quản lý tài khoản người dùng</h1>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '24px',
                flexWrap: 'wrap',
                alignItems: 'flex-end',
            }}>
                <div style={{ flex: '1', minWidth: '200px', transform: 'translateY(5%)' }}>
                    <Input
                        placeholder="Tìm kiếm theo tên, username..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#757575' }}>
                        Vai trò
                    </label>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as Role | '')}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            fontSize: '14px',
                            minWidth: '150px',
                        }}
                    >
                        <option value="">Tất cả</option>
                        <option value={Role.ADMIN}>System Admin</option>
                        <option value={Role.HR}>HR Manager</option>
                        <option value={Role.EMPLOYEE}>Nhân viên</option>

                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#757575' }}>
                        Trạng thái
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0',
                            fontSize: '14px',
                            minWidth: '150px',
                        }}
                    >
                        <option value="">Tất cả</option>
                    <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                        <option value="locked">Đã khóa</option>
                    </select>
                </div>
            </div>

            {/* User Table */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                overflow: 'hidden',
            }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                        Đang tải...
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
                        Không tìm thấy tài khoản nào
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5' }}>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
                                    Tài khoản
                                </th>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
                                    Vai trò
                                </th>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
                                    Trạng thái
                                </th>
                                <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600', fontSize: '13px' }}>
                                    Đăng nhập gần nhất
                                </th>
                                <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600', fontSize: '13px' }}>
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr 
                                    key={user.id} 
                                    className="user-row"
                                    style={{ 
                                        borderBottom: '1px solid #f0f0f0',
                                        opacity: 0,
                                    }}
                                >
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${getRoleColor(user.role)}22 0%, ${getRoleColor(user.role)}44 100%)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '600',
                                                color: getRoleColor(user.role),
                                            }}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{user.name}</div>
                                                <div style={{ fontSize: '12px', color: '#757575' }}>@{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            background: `${getRoleColor(user.role)}15`,
                                            color: getRoleColor(user.role),
                                        }}>
                                            {getRoleLabel(user.role)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            background: `${getStatusColor(user.status)}15`,
                                            color: getStatusColor(user.status),
                                        }}>
                                            {getStatusLabel(user.status)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '14px 16px', color: '#757575', fontSize: '13px' }}>
                                        {user.lastLoginAt 
                                            ? new Date(user.lastLoginAt).toLocaleDateString('vi-VN', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })
                                            : 'Chưa đăng nhập'
                                        }
                                    </td>
                                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => handleOpenEdit(user)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#e3f2fd',
                                                    color: '#1976d2',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                }}
                                            >
                                                Sửa
                                            </button>
                                            {user.role !== Role.ADMIN && (
                                                <>
                                                    <button
                                                        onClick={() => handleToggleLock(user)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: user.status === 'locked' ? '#e8f5e9' : '#fff3e0',
                                                            color: user.status === 'locked' ? '#4caf50' : '#ff9800',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                        }}
                                                    >
                                                        {user.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(user)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: '#f3e5f5',
                                                            color: '#9c27b0',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                        }}
                                                    >
                                                        Đổi mật khẩu
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ open: true, user })}
                                                        style={{
                                                            padding: '6px 12px',
                                                            background: '#ffebee',
                                                            color: '#f44336',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                        }}
                                                    >
                                                        Xóa
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Stats */}
            <div style={{
                marginTop: '24px',
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
            }}>
                <StatCard 
                    label="Tổng tài khoản" 
                    value={users.length} 
                    color="#1976d2" 
                />
                <StatCard 
                    label="Admin" 
                    value={users.filter(u => u.role === Role.ADMIN).length} 
                    color="#f44336" 
                />
                <StatCard 
                    label="HR" 
                    value={users.filter(u => u.role === Role.HR).length} 
                    color="#1976d2" 
                />
                <StatCard 
                    label="Nhân viên" 
                    value={users.filter(u => u.role === Role.EMPLOYEE).length} 
                    color="#4caf50" 
                />
                <StatCard 
                    label="Đã khóa" 
                    value={users.filter(u => u.status === 'locked').length} 
                    color="#ff9800" 
                />
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, user: null })}
                title="Xác nhận xóa"
            >
                <p style={{ marginBottom: '24px' }}>
                    Bạn có chắc muốn xóa tài khoản <strong>{deleteModal.user?.name}</strong>?
                    Hành động này không thể hoàn tác.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={() => setDeleteModal({ open: false, user: null })}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Xóa
                    </Button>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, user: null })}
                title="Chỉnh sửa tài khoản"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Input
                        label="Họ tên"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Vai trò
                        </label>
                        <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                            disabled={editModal.user?.role === Role.ADMIN}
                            style={{
                                width: '100%',
                                padding: '10px 16px',
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0',
                                fontSize: '14px',
                            }}
                        >
                            <option value={Role.ADMIN}>System Admin</option>
                            <option value={Role.HR}>HR Manager</option>
                            <option value={Role.EMPLOYEE}>Nhân viên</option>

                        </select>
                        {editModal.user?.role === Role.ADMIN && (
                            <p style={{ fontSize: '12px', color: '#9e9e9e', marginTop: '4px' }}>
                                Không thể thay đổi vai trò của Admin
                            </p>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <Button variant="secondary" onClick={() => setEditModal({ open: false, user: null })}>
                        Hủy
                    </Button>
                    <Button onClick={handleSaveEdit}>
                        Lưu thay đổi
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div style={{
            padding: '16px 24px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            minWidth: '120px',
        }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
            <div style={{ fontSize: '13px', color: '#757575' }}>{label}</div>
        </div>
    );
}

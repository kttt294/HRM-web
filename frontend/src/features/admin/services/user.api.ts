import { SystemUser, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { Role } from '../../../shared/constants/rbac';

// ============================================
// MOCK USER DATA
// Dữ liệu mẫu để test chức năng quản lý user
// ============================================
const MOCK_USERS: SystemUser[] = [
    {
        id: '1',
        username: 'admin',
        email: 'admin@hrm.vn',
        name: 'System Admin',
        role: Role.ADMIN,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        lastLoginAt: '2026-02-05T00:00:00Z',
    },
    {
        id: '2',
        username: 'hr_manager',
        email: 'hr@hrm.vn',
        name: 'Nguyễn Thị Lan',
        role: Role.HR,
        status: 'active',
        createdAt: '2024-02-15T00:00:00Z',
        lastLoginAt: '2026-02-04T14:30:00Z',
    },
    {
        id: '3',
        username: 'hr_staff',
        email: 'hr2@hrm.vn',
        name: 'Trần Văn Hùng',
        role: Role.HR,
        status: 'active',
        createdAt: '2024-03-20T00:00:00Z',
        lastLoginAt: '2026-02-04T09:15:00Z',
    },
    {
        id: '4',
        username: 'nguyenvana',
        email: 'nguyenvana@hrm.vn',
        name: 'Nguyễn Văn A',
        role: Role.EMPLOYEE,
        status: 'active',
        createdAt: '2024-04-10T00:00:00Z',
        lastLoginAt: '2026-02-03T16:45:00Z',
    },
    {
        id: '5',
        username: 'tranthib',
        email: 'tranthib@hrm.vn',
        name: 'Trần Thị B',
        role: Role.EMPLOYEE,
        status: 'active',
        createdAt: '2024-05-05T00:00:00Z',
        lastLoginAt: '2026-02-02T11:20:00Z',
    },
    {
        id: '6',
        username: 'levanc',
        email: 'levanc@hrm.vn',
        name: 'Lê Văn C',
        role: Role.EMPLOYEE,
        status: 'inactive',
        createdAt: '2024-06-15T00:00:00Z',
        lastLoginAt: '2025-12-20T08:00:00Z',
    },
    {
        id: '7',
        username: 'phamthid',
        email: 'phamthid@hrm.vn',
        name: 'Phạm Thị D',
        role: Role.EMPLOYEE,
        status: 'locked',
        createdAt: '2024-07-01T00:00:00Z',
        lastLoginAt: '2025-11-15T13:30:00Z',
    },
    {
        id: '8',
        username: 'hoangvane',
        email: 'hoangvane@hrm.vn',
        name: 'Hoàng Văn E',
        role: Role.EMPLOYEE,
        status: 'active',
        createdAt: '2024-08-20T00:00:00Z',
        lastLoginAt: '2026-02-04T17:00:00Z',
    },
];

// In-memory storage for mock operations
let users = [...MOCK_USERS];
let nextId = 11;

// ============================================
// MOCK API
// ============================================
export const userApi = {
    /**
     * Lấy danh sách users với filter
     */
    async getUsers(params?: {
        search?: string;
        role?: Role;
        status?: string;
    }): Promise<{ users: SystemUser[]; total: number }> {
        await new Promise(resolve => setTimeout(resolve, 300));

        let result = [...users];

        if (params?.search) {
            const search = params.search.toLowerCase();
            result = result.filter(u => 
                u.name.toLowerCase().includes(search) ||
                u.username.toLowerCase().includes(search) ||
                u.email.toLowerCase().includes(search)
            );
        }

        if (params?.role) {
            result = result.filter(u => u.role === params.role);
        }

        if (params?.status) {
            result = result.filter(u => u.status === params.status);
        }

        return {
            users: result,
            total: result.length,
        };
    },

    /**
     * Lấy user theo ID
     */
    async getUserById(id: string): Promise<SystemUser | null> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return users.find(u => u.id === id) || null;
    },

    /**
     * Tạo user mới
     */
    async createUser(data: CreateUserDto): Promise<SystemUser> {
        await new Promise(resolve => setTimeout(resolve, 400));

        // Check username exists
        if (users.find(u => u.username === data.username)) {
            throw new Error('Tên đăng nhập đã tồn tại');
        }

        // Check email exists
        if (users.find(u => u.email === data.email)) {
            throw new Error('Email đã tồn tại');
        }

        const newUser: SystemUser = {
            id: String(nextId++),
            username: data.username,
            email: data.email,
            name: data.name,
            role: data.role,
            status: 'active',
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        return newUser;
    },

    /**
     * Cập nhật user
     */
    async updateUser(id: string, data: UpdateUserDto): Promise<SystemUser> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const index = users.findIndex(u => u.id === id);
        if (index === -1) {
            throw new Error('Không tìm thấy tài khoản');
        }

        // Check email exists (if changing)
        if (data.email && users.find(u => u.email === data.email && u.id !== id)) {
            throw new Error('Email đã tồn tại');
        }

        users[index] = {
            ...users[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };

        return users[index];
    },

    /**
     * Xóa user
     */
    async deleteUser(id: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const index = users.findIndex(u => u.id === id);
        if (index === -1) {
            throw new Error('Không tìm thấy tài khoản');
        }

        // Không cho xóa admin
        if (users[index].role === Role.ADMIN) {
            throw new Error('Không thể xóa tài khoản Admin');
        }

        users.splice(index, 1);
    },

    /**
     * Khóa/Mở khóa tài khoản
     */
    async toggleLock(id: string): Promise<SystemUser> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const index = users.findIndex(u => u.id === id);
        if (index === -1) {
            throw new Error('Không tìm thấy tài khoản');
        }

        if (users[index].role === Role.ADMIN) {
            throw new Error('Không thể khóa tài khoản Admin');
        }

        users[index].status = users[index].status === 'locked' ? 'active' : 'locked';
        users[index].updatedAt = new Date().toISOString();

        return users[index];
    },

    /**
     * Reset mật khẩu (mô phỏng)
     */
    async resetPassword(id: string): Promise<{ tempPassword: string }> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const user = users.find(u => u.id === id);
        if (!user) {
            throw new Error('Không tìm thấy tài khoản');
        }

        // Generate temp password
        const tempPassword = `temp${Math.random().toString(36).slice(2, 10)}`;
        
        return { tempPassword };
    },
};

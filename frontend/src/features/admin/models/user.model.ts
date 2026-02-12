import { Role } from '../../../shared/constants/rbac';

/**
 * System User model - for admin user management
 */
export interface SystemUser {
    id: string;
    username: string;
    name: string;
    role: Role;
    status: 'active' | 'inactive' | 'locked';
    createdAt: string;
    updatedAt?: string;
    lastLoginAt?: string;
    avatar?: string;
}

export interface CreateUserDto {
    username: string;
    name: string;
    password: string;
    role: Role;
}

export interface UpdateUserDto {
    name?: string;
    role?: Role;
    status?: 'active' | 'inactive' | 'locked';
}

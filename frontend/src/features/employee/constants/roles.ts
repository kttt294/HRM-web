export enum Role {
    ADMIN = 'admin',
    HR_MANAGER = 'hr_manager',
    HR_STAFF = 'hr_staff',
    EMPLOYEE = 'employee',
    MANAGER = 'manager',
}

export const ROLE_LABELS: Record<Role, string> = {
    [Role.ADMIN]: 'Quản trị viên',
    [Role.HR_MANAGER]: 'Trưởng phòng nhân sự',
    [Role.HR_STAFF]: 'Nhân viên nhân sự',
    [Role.EMPLOYEE]: 'Nhân viên',
    [Role.MANAGER]: 'Quản lý',
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(
    ([value, label]) => ({ value, label })
);

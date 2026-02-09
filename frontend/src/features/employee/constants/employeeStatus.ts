export enum EmployeeStatus {
    ACTIVE = 'active',
    PROBATION = 'probation',
    RESIGNED = 'resigned',
    TERMINATED = 'terminated',
    ON_LEAVE = 'on_leave',
}

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
    [EmployeeStatus.ACTIVE]: 'Đang làm việc',
    [EmployeeStatus.PROBATION]: 'Thử việc',
    [EmployeeStatus.RESIGNED]: 'Đã nghỉ việc',
    [EmployeeStatus.TERMINATED]: 'Đã sa thải',
    [EmployeeStatus.ON_LEAVE]: 'Đang nghỉ phép',
};

export const EMPLOYEE_STATUS_OPTIONS = Object.entries(EMPLOYEE_STATUS_LABELS).map(
    ([value, label]) => ({ value, label })
);

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export const GENDER_LABELS: Record<Gender, string> = {
    [Gender.MALE]: 'Nam',
    [Gender.FEMALE]: 'Nữ',
    [Gender.OTHER]: 'Khác',
};

export const GENDER_OPTIONS = Object.entries(GENDER_LABELS).map(
    ([value, label]) => ({ value, label })
);

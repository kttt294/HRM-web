export interface Employee {
    id: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    nationalId: string;
    department: string;
    jobTitle: string;
    supervisor: string;
    status: string;
    salary: number;
    allowance: number;
    bankAccount: string;
    email?: string;
    phone?: string;
    address?: string;
    hireDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface EmployeeSearchParams {
    employeeName?: string;
    employeeId?: string;
    jobTitle?: string;
    status?: string;
    department?: string;
}

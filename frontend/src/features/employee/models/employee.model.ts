export interface Employee {
    id: string;
    fullName: string;
    dateOfBirth: string;
    gender: string;
    nationalId: string;
    address: string;
    phone: string;
    departmentId: string;
    supervisorId: string;
    hireDate: string;
    status: string;
    baseSalary: number;
    allowance: number;
    employeeType: string;
    email?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface EmployeeSearchParams {
    employeeName?: string;
    employeeId?: string;
    status?: string;
    departmentId?: string;
}

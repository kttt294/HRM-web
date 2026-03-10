export interface Employee {
  id: string; // INT(5) ZEROFILL
  fullName: string;
  avatarUrl?: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  personalEmail: string;
  phone: string;
  address: string;
  permanentAddress: string;
  nationalId: string;
  taxId: string;
  insuranceId: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  bankName: string;
  bankAccount: string;
  education: string;
  workProcess?: string;

  departmentId: string;
  departmentName?: string;
  jobTitleId: string;
  jobTitle?: string;
  hireDate: string;
  status: string;
  profileStatus: 'pending' | 'verified';
  totalLeaveDays: number;
  remainingLeaveDays: number;
  baseSalary: number;
  allowance: number;
  dependentsCount: number;
  employeeType: string;
  supervisorId?: string;
  supervisorName?: string;
  
  userId?: number;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeSearchParams {
  employeeName?: string;
  employeeId?: string;
  status?: string;
  departmentId?: string;
  profileStatus?: string;
}

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
  workProcess?: string;
  experience?: string;

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
  
  degrees?: any[];
  certificates?: any[];
}

export interface EmployeeSearchParams {
  employeeName?: string;
  employeeId?: string;
  status?: string;
  departmentId?: string;
  profileStatus?: string;
  educationLevel?: string;
  englishCertificate?: string;
  schoolName?: string;
  tenure?: string;
  totalLeaveDays?: number | string;
  totalLeaveDaysOp?: 'gte' | 'lte';
  remainingLeaveDays?: number | string;
  remainingLeaveDaysOp?: 'gte' | 'lte';
  baseSalary?: number | string;
  baseSalaryOp?: 'gte' | 'lte';
}

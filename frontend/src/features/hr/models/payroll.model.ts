/**
 * ============================================
 * PAYROLL MODEL
 * ============================================
 */

export type PayrollStatus = "draft" | "confirmed" | "paid";

export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: number;
  year: number;
  baseSalary: number;
  allowance: number;
  deduction: number;
  netSalary: number;
  status: PayrollStatus;
  paidAt?: string;
  createdAt?: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalNetSalary: number;
  totalPaid: number;
  totalPending: number;
}

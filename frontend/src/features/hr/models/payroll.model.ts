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
  allowances: {
    housing: number;
    transport: number;
    meal: number;
    other: number;
  };
  deductions: {
    insurance: number;
    tax: number;
    other: number;
  };
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

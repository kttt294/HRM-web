import { Payroll, PayrollStatus } from "../models/payroll.model";
import { authFetch } from "../../../utils/auth-fetch";

// Breakdown helpers removed as we now use direct values from DB

// Helper: Map DB status sang frontend status
function mapStatus(dbStatus: string): PayrollStatus {
  const statusMap: Record<string, PayrollStatus> = {
    draft: "draft",
    confirmed: "confirmed",
    paid: "paid",
  };
  return statusMap[dbStatus] || "draft";
}

// Helper: Generate paidAt nếu status là 'paid'
function generatePaidAt(
  status: string,
  month: number,
  year: number,
): string | undefined {
  if (status !== "paid") return undefined;
  // Giả sử thanh toán vào ngày 5 của tháng tiếp theo
  const payMonth = month === 12 ? 1 : month + 1;
  const payYear = month === 12 ? year + 1 : year;
  return `${payYear}-${String(payMonth).padStart(2, "0")}-05T00:00:00`;
}

// Map DB record sang Payroll model
function mapToPayroll(record: any): Payroll {
  return {
    id: record.id.toString(),
    employeeId: record.employeeId,
    employeeName: record.employeeName || "N/A",
    department: record.departmentName || "N/A",
    month: record.month,
    year: record.year,
    baseSalary: Number(record.baseSalary) || 0,
    allowance: Number(record.allowance) || 0,
    deduction: Number(record.deduction) || 0,
    netSalary: Number(record.netSalary) || 0,
    status: mapStatus(record.status),
    paidAt: generatePaidAt(record.status, record.month, record.year),
  };
}

// Get all payroll records
export async function getAllPayroll(params?: {
  month?: number;
  year?: number;
}): Promise<{ payrolls: Payroll[] }> {
  let url = "/api/salary";
  if (params?.month || params?.year) {
    const queryParams = new URLSearchParams();
    if (params.month) queryParams.append("month", params.month.toString());
    if (params.year) queryParams.append("year", params.year.toString());
    url += `?${queryParams.toString()}`;
  }
  const response = await authFetch(url);
  if (!response.ok) throw new Error("Failed to fetch payroll");
  const data = await response.json();
  return { payrolls: data.map(mapToPayroll) };
}

// Get payroll by employee ID
export async function getPayrollByEmployee(
  employeeId: string,
): Promise<Payroll[]> {
  const response = await authFetch(`/api/salary/employee/${employeeId}`);
  if (!response.ok) throw new Error("Failed to fetch payroll by employee");
  const data = await response.json();
  return data.map(mapToPayroll);
}

// Create new payroll record
export async function createPayroll(
  payroll: Omit<Payroll, "id">,
): Promise<Payroll> {
  // DB giờ dùng English status
  const payload = {
    employeeId: payroll.employeeId,
    month: payroll.month,
    year: payroll.year,
    baseSalary: payroll.baseSalary,
    allowance: payroll.allowance,
    deduction: payroll.deduction,
    netSalary: payroll.netSalary,
    status: payroll.status, // Gửi trực tiếp English value
  };

  const response = await authFetch("/api/salary", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to create payroll");
  const data = await response.json();

  return mapToPayroll(data);
}

// Update payroll record
export async function updatePayroll(
  id: string,
  updates: Partial<Payroll>,
): Promise<Payroll> {
  const payload: any = {};

  if (updates.employeeId) payload.employeeId = updates.employeeId;
  if (updates.month) payload.month = updates.month;
  if (updates.year) payload.year = updates.year;
  if (updates.baseSalary) payload.baseSalary = updates.baseSalary;
  if (updates.netSalary) payload.netSalary = updates.netSalary;
  if (updates.allowance) payload.allowance = updates.allowance;
  if (updates.deduction) payload.deduction = updates.deduction;

  if (updates.status) {
    payload.status = updates.status; // Gửi trực tiếp English value
  }

  const response = await authFetch(`/api/salary/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update payroll");
  const data = await response.json();

  return mapToPayroll(data);
}

// Delete payroll record
export async function deletePayroll(id: string): Promise<void> {
  const response = await authFetch(`/api/salary/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete payroll");
}

// Get current user's payroll (for employee self-service)
export async function getMyPayroll(): Promise<Payroll[]> {
  const response = await authFetch("/api/salary/my");
  if (!response.ok) throw new Error("Failed to fetch my payroll");
  const data = await response.json();
  return data.map(mapToPayroll);
}

// Export object API để tương thích với cách gọi payrollApi.method()
export const payrollApi = {
  getAll: getAllPayroll,
  getByEmployee: getPayrollByEmployee,
  getMyPayroll: getMyPayroll,
  create: createPayroll,
  update: updatePayroll,
  delete: deletePayroll,
};

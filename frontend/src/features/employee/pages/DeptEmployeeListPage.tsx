import { useState, useEffect } from "react";
import { employeeApi } from "../services/employee.api";
import { Employee } from "../models/employee.model";
import { EmployeeTable } from "../components/EmployeeTable";

export function DeptEmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const data = await employeeApi.getAll();
        setEmployees(data);
      } catch (err) {
        console.error("Failed to fetch department employees:", err);
        setError(err instanceof Error ? err.message : "Không thể tải danh sách nhân viên");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  if (error) {
    return <div className="p-4 text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div className="dept-employees-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Nhân viên phòng ban</h1>
          <p className="page-subtitle">Danh sách nhân viên thuộc sự quản lý của bạn</p>
        </div>
      </div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <EmployeeTable employees={employees} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

import { authFetch } from "../../../utils/auth-fetch";

export interface Employee {
  id: string;
  userId?: number | null;
  fullName: string;
  jobTitle?: string;
  departmentName?: string;
  phone?: string;
  status?: string;
}

export interface CreateUserAccountRequest {
  employeeId: string;
  username: string;
  password: string;
  roleId: number;
}

export const adminEmployeeApi = {
  /**
   * Lấy danh sách tất cả nhân viên
   */
  async getAll(): Promise<Employee[]> {
    const response = await authFetch("/api/employees");
    if (!response.ok) {
      throw new Error("Failed to fetch employees");
    }
    return response.json();
  },

  /**
   * Lấy thông tin nhân viên theo ID
   */
  async getById(id: string): Promise<Employee> {
    const response = await authFetch(`/api/employees/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch employee");
    }
    return response.json();
  },

  /**
   * Tạo tài khoản user cho nhân viên
   * Username tự động từ employee ID, password mặc định 123456
   */
  async createUserAccount(employeeId: string, employeeName: string, roleId: number = 3): Promise<any> {
    // Tạo username từ employee ID (loại bỏ ký tự đặc biệt)
    const username = employeeId.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const payload = {
      username: username,
      password: "123456",
      name: employeeName,
      roleId: roleId,
    };

    const response = await authFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || "Failed to create user account");
    }

    const newUser = await response.json();

    // Link user với employee
    await authFetch(`/api/employees/${employeeId}`, {
      method: "PATCH",
      body: JSON.stringify({ userId: newUser.id }),
    });

    return newUser;
  },

  /**
   * Xóa tài khoản user của nhân viên
   */
  async deleteUserAccount(employeeId: string, userId: number): Promise<void> {
    // Xóa user
    const response = await authFetch(`/api/users/${userId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.message || "Failed to delete user account");
    }

    // Cập nhật employee để remove user_id link
    await authFetch(`/api/employees/${employeeId}`, {
      method: "PATCH",
      body: JSON.stringify({ userId: null }),
    });
  },
};

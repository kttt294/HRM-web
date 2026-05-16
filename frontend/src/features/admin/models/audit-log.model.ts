export interface AuditLog {
  id: number;
  user_id: number | null;
  employee_id: number | null;
  username: string | null;
  full_name: string | null;
  action: string;
  resource: string | null;
  resource_id: string | null;
  method: string | null;
  endpoint: string | null;
  status_code: number | null;
  response_time: number | null;
  details: any | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  department_name?: string;
  job_title_name?: string;
  role_name?: string;
  user_avatar?: string;
}

export interface AuditLogStats {
  total: number;
  today: number;
  clientErrors: number;
  serverErrors: number;
  topActions: { action: string; count: number }[];
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  userId?: number;
  search?: string;
  action?: string;
  statusCode?: string; // e.g., '2xx', '4xx', '5xx', or specific status like '404'
  departmentId?: number;
  roleId?: number;
  startDate?: string;
  endDate?: string;
  method?: string;
}

export interface AuditLogPaginationResponse {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

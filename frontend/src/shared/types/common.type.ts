/**
 * Common pagination parameters
 */
export interface PaginationParams {
    page: number;
    limit: number;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Common API response structure
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

/**
 * Select option type for dropdowns
 */
export interface SelectOption {
    value: string;
    label: string;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort parameters
 */
export interface SortParams {
    field: string;
    direction: SortDirection;
}

/**
 * Common status union type
 */
export type Status = 'active' | 'inactive' | 'pending' | 'archived';

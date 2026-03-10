/**
 * ============================================
 * DEPARTMENT MODEL
 * ============================================
 */

export interface Department {
    id: string;
    name: string;
    description: string;
    location: string;
    managerId?: number;
    managerName?: string;
    createdAt: string;
}

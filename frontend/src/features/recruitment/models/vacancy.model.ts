export interface Vacancy {
    id: string;
    title: string;
    jobTitle: string;
    department: string;
    description: string;
    requirements: string[];
    status: 'open' | 'closed' | 'draft';
    numberOfPositions: number;
    minSalary?: number;
    maxSalary?: number;
    deadline?: string;
    recruiterId?: string;
    recruiterName?: string;
    jobTitleId?: string;
    departmentId?: string;
    createdAt: string;
    updatedAt?: string;
}

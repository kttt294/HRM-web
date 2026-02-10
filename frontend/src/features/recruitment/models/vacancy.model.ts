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
    createdAt: string;
    updatedAt?: string;
}

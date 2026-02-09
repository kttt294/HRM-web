export interface Job {
    id: string;
    title: string;
    description: string;
    department: string;
    requirements?: string[];
    responsibilities?: string[];
    minSalary?: number;
    maxSalary?: number;
}

export interface JobTitle {
    id: string;
    name: string;
    departmentId: string;
}

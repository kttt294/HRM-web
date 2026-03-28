export interface Interview {
    id: string;
    candidateId: string;
    title: string;
    date: string;
    time: string;
    location?: string;
    interviewerId: string;
    interviewerName: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    result?: 'passed' | 'failed' | 'pending';
    notes?: string;
    vacancyId?: string | number;
    interviewDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

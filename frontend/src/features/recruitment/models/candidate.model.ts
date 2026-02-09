export interface Candidate {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    vacancyId: string;
    vacancyTitle: string;
    status: 'pending' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
    resumeUrl?: string;
    notes?: string;
    appliedAt: string;
    createdAt: string;
    updatedAt?: string;
}

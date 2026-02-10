export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  vacancyId: string;
  vacancyTitle: string;
  status:
    | "new"
    | "screening"
    | "interviewing"
    | "offered"
    | "hired"
    | "rejected";
  resumeUrl?: string;
  notes?: string;
  appliedAt: string;
  createdAt: string;
  updatedAt?: string;
}

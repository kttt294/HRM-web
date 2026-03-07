export type CandidateStatus =
  | "new"
  | "screening"
  | "interviewing"
  | "offered"
  | "hired"
  | "rejected";

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  vacancyId: string;
  vacancyTitle: string;
  status: CandidateStatus;
  resumeUrl?: string;
  notes?: string;
  appliedAt: string;
  createdAt: string;
  updatedAt?: string;
}

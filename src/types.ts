export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface Project {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  githubLink?: string;
  content: string; // Could be text or base64 for files
  contentType: 'text' | 'pdf' | 'ppt';
  status: 'pending' | 'evaluated';
  createdAt: string;
}

export interface EvaluationScores {
  innovation: number;
  technicalDepth: number;
  clarity: number;
  impact: number;
  overall: number;
}

export interface Evaluation {
  id: string;
  projectId: string;
  studentId: string;
  scores: EvaluationScores;
  feedback: string;
  suggestions: string[];
  evaluatedBy: string; // 'AI' or admin UID
  createdAt: string;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
}

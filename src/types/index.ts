export type AnswerOption = 'A' | 'B' | 'C';

export interface ClientQuestion {
  id: number;
  section: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
  };
}

export interface VisitorLead {
  name: string;
  phone: string;
  country?: string;
  email?: string;
  submissionId?: string;
  company?: string;
  designation?: string;
  city?: string;
  visitorType?: string;
  consent?: boolean;
  registeredAt?: string;
}

export interface SubmissionResponse {
  success: boolean;
  attemptId: string;
  score?: number;
  maxScore?: number;
  message: string;
  boothMessage: string;
  isRetry?: boolean;
  confirmedAt?: string;
  alreadyCompleted?: boolean;
  error?: string;
}

export interface QuizSubmission {
  attemptId: string;
  visitor: VisitorLead;
  answers: Record<number, AnswerOption>;
  timeSpentSeconds: number;
}

export type AnswerOption = 'A' | 'B' | 'C';

export interface Question {
  id: number;
  section: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
  };
  correctAnswer: AnswerOption;
}

export type ClientQuestion = Omit<Question, 'correctAnswer'>;

export interface VisitorLead {
  submissionId: string;
  name: string;
  phone: string;
  country?: string;
  email?: string;
  company?: string;
  designation?: string;
  city?: string;
  visitorType?: string;
  consent?: boolean;
  registeredAt?: string;
}

export interface QuizAttemptInfo {
  attemptId: string;
  questions: ClientQuestion[];
  total: number;
}

export interface QuizSubmission {
  attemptId: string;
  visitor: VisitorLead;
  answers: Record<number, AnswerOption>;
  timeSpentSeconds: number;
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

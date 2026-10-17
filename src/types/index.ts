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
  submissionId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  designation?: string;
  city?: string;
  visitorType?: string;
  consent: boolean;
  registeredAt: string;
}

export interface SubmissionResponse {
  success: boolean;
  attemptId: string;
  message: string;
  boothMessage: string;
  sheetsSync: any;
}

export interface QuizSubmission {
  attemptId: string;
  visitor: VisitorLead;
  answers: Record<number, AnswerOption>;
  timeSpentSeconds: number;
}

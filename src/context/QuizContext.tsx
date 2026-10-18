import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientQuestion, VisitorLead, AnswerOption, QuizSubmission, SubmissionResponse } from '../types';
import { ApiService } from '../services/api';
import { generateSubmissionId } from '../utils/validation';

type PageType = 'register' | 'quiz' | 'result';

interface QuizContextValue {
  page: PageType;
  setPage: (p: PageType) => void;
  visitor: VisitorLead | null;
  setVisitor: (v: VisitorLead | null) => void;
  attemptId: string | null;
  questions: ClientQuestion[];
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (idx: number) => void;
  answers: Record<number, AnswerOption>;
  timeSpentSeconds: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  submissionResult: SubmissionResponse | null;
  startQuiz: (leadData: Omit<VisitorLead, 'submissionId' | 'registeredAt'>) => Promise<string>;
  selectAnswer: (questionId: number, option: AnswerOption) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitQuiz: () => Promise<void>;
  resetToStart: () => void;
}

const STORAGE_KEY_VISITOR = 'imtex_registered_visitor';
const STORAGE_KEY_CONFIRMED_ID = 'imtex_confirmed_attempt_id';

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPage] = useState<PageType>(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY_CONFIRMED_ID)) {
        return 'result';
      }
    } catch {}
    return 'register';
  });

  const [visitor, setVisitor] = useState<VisitorLead | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_VISITOR);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [attemptId, setAttemptId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_CONFIRMED_ID) || null;
    } catch {
      return null;
    }
  });

  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, AnswerOption>>({});
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);

  useEffect(() => {
    let timer: any;
    if (page === 'quiz' && !isSubmitting && !submissionResult) {
      timer = setInterval(() => {
        setTimeSpentSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [page, isSubmitting, submissionResult]);

  const startQuiz = async (leadData: Omit<VisitorLead, 'submissionId' | 'registeredAt'>): Promise<string> => {
    setIsLoading(true);
    setError(null);

    const submissionId = generateSubmissionId();
    const registeredVisitor: VisitorLead = {
      ...leadData,
      submissionId,
      registeredAt: new Date().toISOString()
    };

    try {
      const { attemptId: newAttemptId, questions: qList } = await ApiService.fetchQuestions(leadData.phone, leadData.name, leadData.country);
      if (qList.length !== 10) {
        throw new Error(`Expected exactly 10 questions, received ${qList.length}`);
      }

      setVisitor(registeredVisitor);
      setAttemptId(newAttemptId);
      setQuestions(qList);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeSpentSeconds(0);
      setSubmissionResult(null);

      try {
        sessionStorage.setItem(STORAGE_KEY_VISITOR, JSON.stringify(registeredVisitor));
        sessionStorage.removeItem(STORAGE_KEY_CONFIRMED_ID);
      } catch (e) {
        console.warn('SessionStorage unavailable:', e);
      }

      setPage('quiz');
      return newAttemptId;
    } catch (err: any) {
      setError(err.message || 'Unable to connect to quiz service. Please check connection and retry.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = (questionId: number, option: AnswerOption) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  /**
   * Submits quiz answers.
   * Only advances to 'result' page if server confirms successful save.
   * If save fails, remains on 'quiz' page and displays error with retry button.
   */
  const submitQuiz = async () => {
    if (isSubmitting) return;
    if (!visitor || !attemptId) {
      setError('Quiz session expired. Please register to begin.');
      setPage('register');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submission: QuizSubmission = {
        attemptId,
        visitor,
        answers,
        timeSpentSeconds,
      };

      const response = await ApiService.submitQuiz(submission);

      // ONLY advance to Thank You page after successful confirmation
      setSubmissionResult(response);
      setPage('result');

      // Save confirmed ID so refreshing the Thank You page does not resubmit
      try {
        sessionStorage.setItem(STORAGE_KEY_CONFIRMED_ID, attemptId);
      } catch {}
    } catch (err: any) {
      // Stay on Quiz page and show retry option!
      setError(err.message || 'Error submitting quiz results. Please check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToStart = () => {
    setVisitor(null);
    setAttemptId(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeSpentSeconds(0);
    setSubmissionResult(null);
    setError(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY_VISITOR);
      sessionStorage.removeItem(STORAGE_KEY_CONFIRMED_ID);
    } catch {}
    setPage('register');
  };

  return (
    <QuizContext.Provider
      value={{
        page,
        setPage,
        visitor,
        setVisitor,
        attemptId,
        questions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        answers,
        timeSpentSeconds,
        isLoading,
        isSubmitting,
        error,
        submissionResult,
        startQuiz,
        selectAnswer,
        nextQuestion,
        prevQuestion,
        submitQuiz,
        resetToStart,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextValue => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

import { ClientQuestion, QuizSubmission, SubmissionResponse } from '../types';

export class ApiService {
  private static baseUrl = '';

  static async fetchQuestions(): Promise<{ attemptId: string; questions: ClientQuestion[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/questions`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Failed to load questions (status: ${response.status})`);
      }

      const data = await response.json();
      if (!data.success || !Array.isArray(data.questions) || !data.attemptId) {
        throw new Error('Invalid response structure from questions API');
      }

      return {
        attemptId: data.attemptId,
        questions: data.questions
      };
    } catch (error: any) {
      console.error('ApiService.fetchQuestions error:', error);
      throw error;
    }
  }

  static async submitQuiz(submission: QuizSubmission): Promise<SubmissionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Submission failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error('Submission was not accepted by the server');
      }

      return data;
    } catch (error: any) {
      console.error('ApiService.submitQuiz error:', error);
      throw error;
    }
  }
}

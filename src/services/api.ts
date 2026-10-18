import { ClientQuestion, QuizSubmission, SubmissionResponse } from '../types';

export class ApiService {
  private static baseUrl = '';

  /**
   * Fetches 10 randomized quiz questions from the server.
   * Sends the visitor's mobile number so the server can perform an authoritative
   * pre-flight duplicate check before generating an attempt.
   */
  static async fetchQuestions(phone?: string, name?: string, country?: string): Promise<{ attemptId: string; questions: ClientQuestion[] }> {
    try {
      let url = `${this.baseUrl}/api/questions`;
      if (phone) {
        const params = new URLSearchParams({ phone: phone.trim() });
        if (name) params.set('name', name.trim());
        if (country) params.set('country', country.trim());
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Failed to load questions (status: ${response.status})`);
      }

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

  /**
   * Authoritatively submits the completed quiz answers to the server for grading
   * and Google Sheets persistence. Returns the submission response including the score.
   */
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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Submission failed with status ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Submission was not accepted by the server');
      }

      return data;
    } catch (error: any) {
      console.error('ApiService.submitQuiz error:', error);
      throw error;
    }
  }
}

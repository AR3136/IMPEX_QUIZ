import { gradeAndFinalizeAttempt, isAttemptAlreadyCompleted } from './_lib/questionBank.js';
import { appendQuizRecordToSheets } from './_lib/sheetsClient.js';
import { checkRateLimit } from './_lib/rateLimiter.js';
import { maskEmail, maskName } from './_lib/sanitizer.js';
import { QuizSubmission } from './_lib/types.js';

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  // 1. Rate Limiting (Basic protection against flooding)
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';
  const { allowed } = checkRateLimit(clientIp);
  if (!allowed) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Too many requests. Please wait a moment before trying again.' }));
    return;
  }

  try {
    // 2. Parse & Validate Payload
    let body: QuizSubmission = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Malformed JSON payload.' }));
        return;
      }
    } else if (!body && req.on) {
      body = await new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', (chunk: any) => raw += chunk);
        req.on('end', () => {
          try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
        });
      });
    }

    const attemptId = body?.attemptId || (body as any)?.submissionId;
    if (!body || !attemptId || !body.visitor || !body.answers) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid submission payload. Required: attemptId (or submissionId), visitor, answers.' }));
      return;
    }

    // Server-side field validation
    const { visitor, answers } = body;
    if (!visitor.name || visitor.name.trim().length < 2) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid name provided.' }));
      return;
    }

    if (!visitor.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitor.email.trim())) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid email address provided.' }));
      return;
    }

    if (!visitor.phone || visitor.phone.trim().length < 8) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid mobile number provided.' }));
      return;
    }

    if (!visitor.consent) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Consent must be granted to submit the quiz.' }));
      return;
    }

    // 3. Server-side Idempotency Check:
    // If this attemptId was already successfully completed, return the confirmation
    // immediately without appending a duplicate row to Google Sheets.
    if (isAttemptAlreadyCompleted(attemptId)) {
      console.log(`[Idempotency] Retry request detected for attempt ${attemptId}. Returning cached confirmation without appending duplicate row.`);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        attemptId,
        message: 'Your quiz has been submitted successfully!',
        boothMessage: 'Please show this confirmation screen at Booth A112 (Hall H1) to claim your exclusive IMTEX souvenir!',
        isRetry: true,
        confirmedAt: new Date().toISOString()
      }));
      return;
    }

    // 4. Authoritative server-side grading
    // Returns { score, maxScore: 10 }
    // Throws error with statusCode = 409 if duplicate attempt already finalized in memory
    const { score, maxScore } = gradeAndFinalizeAttempt(attemptId, answers);

    // 4. Save to Google Sheets using Service Account (or verify existing write on retry)
    // Awaits Google Sheets confirmation before returning success
    const sheetsResult = await appendQuizRecordToSheets({
      attemptId,
      visitor,
      score,
      maxScore,
      timeSpentSeconds: body.timeSpentSeconds || 0
    });

    if (!sheetsResult.success) {
      throw new Error(sheetsResult.message || 'Google Sheets failed to confirm record insertion.');
    }

    // 5. Return success response (CONFIDENTIAL: score and answers are NOT included)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      attemptId,
      message: 'Your quiz has been submitted successfully!',
      boothMessage: 'Please show this confirmation screen at Booth A112 (Hall H1) to claim your exclusive IMTEX souvenir!',
      confirmedAt: new Date().toISOString()
    }));

  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    console.error(`[Submit Endpoint Error] Status ${statusCode}:`, error.message);
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: error.message || 'An unexpected error occurred while saving your quiz submission.'
    }));
  }
}

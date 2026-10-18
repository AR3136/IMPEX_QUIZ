import { gradeAndFinalizeAttempt, isAttemptAlreadyCompleted, getCompletedAttemptData } from './_lib/questionBank.js';
import { appendQuizRecordToSheets } from './_lib/sheetsClient.js';
import { checkRateLimit } from './_lib/rateLimiter.js';
import { maskPhone, maskName } from './_lib/sanitizer.js';
import { normalizePhoneNumber } from './_lib/phone.js';
import {
  isPhoneAlreadyCompleted,
  acquirePhoneSubmissionLock,
  releasePhoneSubmissionLock
} from './_lib/phoneRegistry.js';
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

  // 1. Rate Limiting (Basic flood protection)
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';
  const { allowed } = checkRateLimit(clientIp);
  if (!allowed) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Too many requests. Please wait a moment before trying again.' }));
    return;
  }

  let lockedPhone: string | null = null;

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
      res.end(JSON.stringify({ error: 'Invalid submission payload. Required: attemptId, visitor, answers.' }));
      return;
    }

    // 3. Field validation
    const { visitor, answers } = body;
    if (!visitor.name || visitor.name.trim().length < 2) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Please enter your full name (minimum 2 characters).' }));
      return;
    }

    // Authoritative Phone Validation and Normalization
    const phoneNorm = normalizePhoneNumber(visitor.phone);
    if (!phoneNorm.isValid || !phoneNorm.normalized) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: phoneNorm.error || 'Please enter a valid 10-digit mobile number.' }));
      return;
    }
    const normalizedPhone = phoneNorm.normalized;

    // Optional email validation if provided
    if (visitor.email && visitor.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitor.email.trim())) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid email address provided.' }));
      return;
    }

    // 4. Server-side Idempotency Check for identical attemptId (page refresh / duplicate submission)
    if (isAttemptAlreadyCompleted(attemptId)) {
      console.log(`[Idempotency] Retry request detected for attempt ${attemptId}. Returning cached confirmation without appending duplicate row.`);
      const cached = getCompletedAttemptData(attemptId);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        attemptId,
        score: cached?.score ?? 0,
        maxScore: 10,
        message: 'Your quiz has been submitted successfully!',
        boothMessage: 'Please show this confirmation screen at Booth A161 (Hall 4) to claim your exclusive IMTEX souvenir!',
        isRetry: true,
        confirmedAt: cached?.completedAt || new Date().toISOString()
      }));
      return;
    }

    // 5. Unique phone verification (Requirement 3: Exactly one completed quiz per normalized mobile number)
    const phoneCheck = await isPhoneAlreadyCompleted(normalizedPhone);
    if (phoneCheck.completed) {
      console.log(`[Duplicate Check] Blocked duplicate attempt for mobile ${maskPhone(normalizedPhone)}`);
      res.statusCode = 409;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        alreadyCompleted: true,
        error: 'This mobile number has already completed the IMTEX Quiz Challenge. Only one attempt per participant is allowed.'
      }));
      return;
    }

    // 6. Atomic In-flight Submission Lock (Protects against simultaneous double-clicks & concurrent requests)
    const lockResult = acquirePhoneSubmissionLock(normalizedPhone);
    if (!lockResult.acquired) {
      res.statusCode = 409;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: lockResult.message || 'A quiz submission for this mobile number is currently being processed. Please wait a moment.'
      }));
      return;
    }
    lockedPhone = normalizedPhone;

    // 7. Authoritative Server-side Grading
    // Calculated strictly on the server using MASTER_QUESTION_BANK; browser score is never trusted.
    const { score, maxScore } = gradeAndFinalizeAttempt(attemptId, answers);

    // 8. Persist to Google Sheets using Service Account
    // Stores only required fields: submission ID, timestamp, name, normalized phone, score out of 10, completion status, goodies tracking.
    // Individual question answers and per-question correctness are never stored in Google Sheets.
    const sheetsResult = await appendQuizRecordToSheets({
      attemptId,
      visitor: {
        ...visitor,
        phone: normalizedPhone
      },
      score,
      maxScore,
      timeSpentSeconds: body.timeSpentSeconds || 0
    });

    if (!sheetsResult.success) {
      throw new Error(sheetsResult.message || 'Google Sheets failed to confirm record insertion.');
    }

    // 9. Mark phone permanently completed and release in-flight lock
    releasePhoneSubmissionLock(normalizedPhone, true);
    lockedPhone = null;

    console.log(`[Quiz Completed] Successfully recorded attempt ${attemptId} for ${maskName(visitor.name)} (${maskPhone(normalizedPhone)}). Score: ${score}/10`);

    // 10. Return success response
    // Individual question answers and answer keys are strictly omitted for confidentiality.
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      attemptId,
      score,
      maxScore: 10,
      message: 'Your quiz has been submitted successfully!',
      boothMessage: 'Please show this confirmation screen at Booth A161 (Hall 4) to claim your exclusive IMTEX souvenir!',
      confirmedAt: new Date().toISOString()
    }));

  } catch (error: any) {
    if (lockedPhone) {
      releasePhoneSubmissionLock(lockedPhone, false);
    }
    const statusCode = error.statusCode || 500;
    console.error(`[Submit Endpoint Error] Status ${statusCode}:`, error.message);
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: error.message || 'An unexpected error occurred while saving your quiz submission.'
    }));
  }
}

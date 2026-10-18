import { generateRandomQuizAttempt } from './_lib/questionBank.js';
import { isPhoneAlreadyCompleted } from './_lib/phoneRegistry.js';
import { normalizePhoneNumber } from './_lib/phone.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    // 1. Extract phone from query params (GET) or parsed JSON body (POST)
    let rawPhone = req.query?.phone;
    let rawName = req.query?.name;

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch {}
      } else if (!body && req.on) {
        body = await new Promise((resolve) => {
          let str = '';
          req.on('data', (chunk: any) => str += chunk);
          req.on('end', () => {
            try { resolve(JSON.parse(str)); } catch { resolve({}); }
          });
        });
      }
      if (body) {
        rawPhone = rawPhone || body.phone || body.mobile;
        rawName = rawName || body.name;
      }
    }

    // 2. Authoritative Phone Validation & Duplicate Check
    let normalizedPhone: string | undefined = undefined;
    if (rawPhone) {
      const phoneCheck = await isPhoneAlreadyCompleted(String(rawPhone));
      if (!phoneCheck.isValid) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          error: phoneCheck.error || 'Please enter a valid 10-digit mobile number.'
        }));
        return;
      }

      if (phoneCheck.completed) {
        // Requirement 3: Polite message explaining that only one attempt per mobile number is allowed
        res.statusCode = 409;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          alreadyCompleted: true,
          error: 'This mobile number has already completed the IMTEX Quiz Challenge. Only one attempt per participant is allowed.'
        }));
        return;
      }

      normalizedPhone = phoneCheck.normalized;
    }

    // 3. Generate 10 randomized quiz questions (2 from each of the 5 sections, answer key stripped)
    const attempt = generateRandomQuizAttempt(normalizedPhone);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.end(JSON.stringify({
      success: true,
      attemptId: attempt.attemptId,
      count: attempt.questions.length,
      questions: attempt.questions
    }));
  } catch (error: any) {
    console.error('Error generating quiz questions:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Failed to generate quiz questions' }));
  }
}

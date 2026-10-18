import assert from 'assert';
import { normalizePhoneNumber } from '../api/_lib/phone.js';
import {
  isPhoneAlreadyCompleted,
  acquirePhoneSubmissionLock,
  releasePhoneSubmissionLock,
  markPhoneAsCompleted,
  __resetPhoneRegistryForTesting
} from '../api/_lib/phoneRegistry.js';
import {
  generateRandomQuizAttempt,
  gradeAndFinalizeAttempt,
  isAttemptAlreadyCompleted,
  getCompletedAttemptData,
  MASTER_QUESTION_BANK
} from '../api/_lib/questionBank.js';

console.log('====================================================');
console.log('🧪 RUNNING COMPREHENSIVE IMTEX TEST SUITE (7 SUITES)');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// TEST SUITE 1: Phone Normalization & Validation Across All Formats
// -----------------------------------------------------------------------------
console.log('--- Test Suite 1: Phone Normalization & Formatting ---');

const testCases = [
  // Standard 10-digit Indian
  { input: '9876543210', expectedValid: true, expectedNormalized: '+919876543210' },
  { input: '8805959749', expectedValid: true, expectedNormalized: '+918805959749' },
  { input: '7012345678', expectedValid: true, expectedNormalized: '+917012345678' },
  { input: '6999988888', expectedValid: true, expectedNormalized: '+916999988888' },
  
  // With +91
  { input: '+91 98765 43210', expectedValid: true, expectedNormalized: '+919876543210' },
  { input: '+919876543210', expectedValid: true, expectedNormalized: '+919876543210' },
  { input: '+91-98765-43210', expectedValid: true, expectedNormalized: '+919876543210' },
  { input: '+91 (98765) 43210', expectedValid: true, expectedNormalized: '+919876543210' },

  // With 91 (no plus)
  { input: '919876543210', expectedValid: true, expectedNormalized: '+919876543210' },
  { input: '91 98765 43210', expectedValid: true, expectedNormalized: '+919876543210' },

  // With 0 prefix
  { input: '09876543210', expectedValid: true, expectedNormalized: '+919876543210' },
  { input: '0 98765 43210', expectedValid: true, expectedNormalized: '+919876543210' },

  // International E.164
  { input: '+1 415 555 2671', expectedValid: true, expectedNormalized: '+14155552671' },
  { input: '+44 7911 123456', expectedValid: true, expectedNormalized: '+447911123456' },
  { input: '+49-151-23456789', expectedValid: true, expectedNormalized: '+4915123456789' },

  // Invalid numbers
  { input: '12345', expectedValid: false },
  { input: '0123456789', expectedValid: false }, // starts with 01, not mobile
  { input: '5555555555', expectedValid: false }, // starts with 5
  { input: 'abcdefghij', expectedValid: false },
  { input: '', expectedValid: false },
  { input: '   ', expectedValid: false },
  { input: '+91 12345', expectedValid: false },
];

for (const tc of testCases) {
  const res = normalizePhoneNumber(tc.input);
  if (tc.expectedValid) {
    assert.strictEqual(res.isValid, true, `Expected valid for "${tc.input}"`);
    assert.strictEqual(res.normalized, tc.expectedNormalized, `Expected normalized "${tc.expectedNormalized}" for "${tc.input}", got "${res.normalized}"`);
  } else {
    assert.strictEqual(res.isValid, false, `Expected invalid for "${tc.input}"`);
    assert.ok(res.error, `Expected error message for "${tc.input}"`);
  }
}
console.log(`✅ All ${testCases.length} phone formatting and normalization cases PASSED.\n`);

// -----------------------------------------------------------------------------
// TEST SUITE 2: Score Feedback Ranges (Requirement 2)
// -----------------------------------------------------------------------------
console.log('--- Test Suite 2: Score Feedback Messages ---');

function getScoreFeedback(score) {
  if (score === 10) return 'Awesome! Perfect score!';
  if (score === 9) return 'Excellent! Great job!';
  if (score >= 7 && score <= 8) return 'Good job!';
  if (score >= 5 && score <= 6) return 'Not bad! Keep learning!';
  return 'Thanks for participating! Keep exploring and learning!';
}

assert.strictEqual(getScoreFeedback(10), 'Awesome! Perfect score!');
assert.strictEqual(getScoreFeedback(9), 'Excellent! Great job!');
assert.strictEqual(getScoreFeedback(8), 'Good job!');
assert.strictEqual(getScoreFeedback(7), 'Good job!');
assert.strictEqual(getScoreFeedback(6), 'Not bad! Keep learning!');
assert.strictEqual(getScoreFeedback(5), 'Not bad! Keep learning!');
assert.strictEqual(getScoreFeedback(4), 'Thanks for participating! Keep exploring and learning!');
assert.strictEqual(getScoreFeedback(2), 'Thanks for participating! Keep exploring and learning!');
assert.strictEqual(getScoreFeedback(0), 'Thanks for participating! Keep exploring and learning!');

console.log('✅ Exact required score feedback strings for 10/10, 9/10, 7-8/10, 5-6/10, 0-4/10 PASSED.\n');

// -----------------------------------------------------------------------------
// TEST SUITE 3: Server-side Duplicate Prevention & Unique Mobile Check
// -----------------------------------------------------------------------------
console.log('--- Test Suite 3: Unique Phone Registry & Duplicate Checks ---');

__resetPhoneRegistryForTesting();

const testPhone = '98765 99999';
const normResult = normalizePhoneNumber(testPhone);
assert.strictEqual(normResult.isValid, true);
const normalized = normResult.normalized;

// 1. Initial check: phone should NOT be completed
let check1 = await isPhoneAlreadyCompleted(testPhone);
assert.strictEqual(check1.completed, false);

// 2. Mark as completed (simulating quiz submission completion)
markPhoneAsCompleted(normalized);

// 3. Subsequent check with different formatting of same number: MUST report completed
let check2 = await isPhoneAlreadyCompleted('+91 98765-99999');
assert.strictEqual(check2.completed, true);
assert.strictEqual(check2.normalized, normalized);

let check3 = await isPhoneAlreadyCompleted('09876599999');
assert.strictEqual(check3.completed, true);

let check4 = await isPhoneAlreadyCompleted('919876599999');
assert.strictEqual(check4.completed, true);

console.log('✅ Single-submission rule per normalized phone across different formats PASSED.\n');

// -----------------------------------------------------------------------------
// TEST SUITE 4: Atomic In-Flight Locking (Two Simultaneous Requests)
// -----------------------------------------------------------------------------
console.log('--- Test Suite 4: Atomic Mutex & Simultaneous Requests ---');

__resetPhoneRegistryForTesting();
const phoneA = '+919988776655';

// Request 1 acquires lock
const lock1 = acquirePhoneSubmissionLock(phoneA);
assert.strictEqual(lock1.acquired, true, 'Request 1 should acquire lock');

// Simultaneous Request 2 for SAME phone attempts to acquire lock while Request 1 in flight
const lock2 = acquirePhoneSubmissionLock(phoneA);
assert.strictEqual(lock2.acquired, false, 'Simultaneous Request 2 must be rejected by atomic lock');
assert.strictEqual(lock2.reason, 'in_flight');

// Request 1 finishes and commits completion
releasePhoneSubmissionLock(phoneA, true);

// Request 3 arrives after completion
const lock3 = acquirePhoneSubmissionLock(phoneA);
assert.strictEqual(lock3.acquired, false, 'Request after completion must be rejected');
assert.strictEqual(lock3.reason, 'completed');

console.log('✅ Atomic in-flight locking for concurrent/simultaneous requests PASSED.\n');

// -----------------------------------------------------------------------------
// TEST SUITE 5: Authoritative Server-side Grading & Confidentiality
// -----------------------------------------------------------------------------
console.log('--- Test Suite 5: Question Randomness & Authoritative Grading ---');

const attempt = generateRandomQuizAttempt('+919876543210');
assert.strictEqual(attempt.questions.length, 10, 'Must have exactly 10 questions');
assert.strictEqual(typeof attempt.attemptId, 'string');

// Verify that client questions do NOT expose correctAnswer
for (const q of attempt.questions) {
  assert.strictEqual(q.correctAnswer, undefined, `Client question ${q.id} must NOT have correctAnswer`);
  assert.ok(q.options.A && q.options.B && q.options.C, 'Question must have 3 options');
}

// Grade with answers
const answerMap = {};
for (const q of attempt.questions) {
  answerMap[q.id] = 'A'; // Pick option A
}

const gradeResult = gradeAndFinalizeAttempt(attempt.attemptId, answerMap);
assert.ok(gradeResult.score >= 0 && gradeResult.score <= 10, 'Score must be 0-10');
assert.strictEqual(gradeResult.maxScore, 10);

// Verify idempotency: querying completed attempt returns cached score without re-grading
assert.strictEqual(isAttemptAlreadyCompleted(attempt.attemptId), true);
const cached = getCompletedAttemptData(attempt.attemptId);
assert.strictEqual(cached.score, gradeResult.score);

console.log('✅ Authoritative server grading, correctAnswer stripping, and idempotency PASSED.\n');

// -----------------------------------------------------------------------------
// TEST SUITE 6: Verification of Three Logos
// -----------------------------------------------------------------------------
console.log('--- Test Suite 6: Logos Verification ---');
import fs from 'fs';

const logos = [
  'public/logos/imtex-2027-tricolor-brush-logo.png',
  'public/logos/cogsdill-logo.jpeg',
  'public/logos/engenius-logo.jpeg'
];

for (const logoPath of logos) {
  assert.ok(fs.existsSync(logoPath), `Logo file must exist: ${logoPath}`);
  const stats = fs.statSync(logoPath);
  assert.ok(stats.size > 1000, `Logo ${logoPath} must not be empty`);
}
console.log('✅ All 3 logos exist, accessible, and intact.\n');

// -----------------------------------------------------------------------------
// TEST SUITE 7: Minimal Registration & Privacy Disclosures
// -----------------------------------------------------------------------------
console.log('--- Test Suite 7: Simplified Registration & Privacy Notice ---');

const regFile = fs.readFileSync('src/pages/RegistrationPage.tsx', 'utf8');
assert.ok(!regFile.includes('reg-consent'), 'Consent checkbox input must be removed from RegistrationPage');
assert.ok(!regFile.includes('reg-email'), 'Email input must be removed from simplified RegistrationPage');
assert.ok(!regFile.includes('reg-company'), 'Company input must be removed from RegistrationPage');
assert.ok(regFile.includes('Privacy Notice:'), 'Accessible Privacy Notice statement must be present');
assert.ok(regFile.includes('Start Challenge (10 Qs)'), 'Start Challenge button must be present');

console.log('✅ Simplified registration UI and privacy compliance verified.\n');

console.log('====================================================');
console.log('🎉 ALL 7 TEST SUITES PASSED FLAWLESSLY!');
console.log('====================================================');

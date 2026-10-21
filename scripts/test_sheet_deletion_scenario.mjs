import assert from 'assert';
import {
  isPhoneAlreadyCompleted,
  syncCompletedPhonesFromSheets,
  acquirePhoneSubmissionLock,
  releasePhoneSubmissionLock,
  markPhoneAsCompleted,
  __resetPhoneRegistryForTesting
} from '../api/_lib/phoneRegistry.js';
import { generateRandomQuizAttempt } from '../api/_lib/questionBank.js';

console.log('🧪 Testing Manual Sheet Deletion and Re-attempt Scenario...');

// 1. Reset registry and perform initial sync
__resetPhoneRegistryForTesting();
await syncCompletedPhonesFromSheets();

// 2. Simulate a participant completing a quiz
const testPhone = '+919999988888';
markPhoneAsCompleted(testPhone);

// 3. Immediately check: in memory, it should be completed
let check1 = await isPhoneAlreadyCompleted(testPhone);
assert.strictEqual(check1.completed, true, 'Phone should be marked completed');

// 4. Wait 3.2 seconds to simulate admin deleting the row from Google Sheet
console.log('Simulating waiting for admin to delete entry from Google Sheet...');
await new Promise(r => setTimeout(r, 3200));

// 5. Check again: since the live Google Sheet does NOT have this test phone,
// isPhoneAlreadyCompleted detects that >3s passed, re-verifies with Google Sheets,
// discovers the row is gone, removes it from memory, and unblocks the phone!
let check2 = await isPhoneAlreadyCompleted(testPhone);
assert.strictEqual(check2.completed, false, 'Phone should now be unblocked after verifying absence in Google Sheet');

// 6. User starts new quiz attempt: generate random quiz questions
const attempt = generateRandomQuizAttempt(testPhone);
assert.ok(attempt.attemptId, 'Must generate attemptId');
assert.strictEqual(attempt.questions.length, 10, 'Must generate 10 questions');

// 7. Acquire lock for submission
const lock = acquirePhoneSubmissionLock(testPhone);
assert.strictEqual(lock.acquired, true, 'Lock should be acquired successfully');

// 8. Release lock with completion
releasePhoneSubmissionLock(testPhone, true);

// 9. Now it is completed again
let check3 = await isPhoneAlreadyCompleted(testPhone);
assert.strictEqual(check3.completed, true, 'Phone should now be completed again');

console.log('🎉 Manual deletion re-verification and re-attempt test PASSED flawlessly!');

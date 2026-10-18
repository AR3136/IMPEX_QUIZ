import { normalizePhoneNumber, type CountryCode } from './phone.js';
import { fetchExistingCompletedPhonesFromSheet } from './sheetsClient.js';

/**
 * Server-side unique quiz-entry ID management and concurrency control.
 * 
 * Rules:
 * 1. Exactly ONE completed quiz submission per normalized mobile number.
 * 2. Pre-flight check before issuing questions to start a quiz.
 * 3. Atomic check-and-lock before grading and saving final submission.
 * 4. Google Sheets is synchronized on startup / cache miss.
 * 
 * Architecture Note on Concurrency:
 * - In-memory Mutex: The `inFlightPhoneLocks` map provides synchronous atomic
 *   locking against double-clicks and concurrent requests within the Node.js event loop.
 * - Persistent Store: Existing phone numbers from Google Sheets are cached in `completedPhonesSet`.
 * - Recommended Enterprise Extension: For multi-region serverless clusters with dozens
 *   of concurrent worker instances, an external atomic data store with atomic `SET NX`
 *   (e.g., Upstash Redis, Redis Cloud, or PostgreSQL unique constraint) should be configured.
 */

// In-memory set of normalized phone numbers that have completed the quiz
const completedPhonesSet = new Set<string>();

// Atomic in-flight lock to prevent simultaneous concurrent requests
const inFlightPhoneLocks = new Map<string, number>();

// Track whether initial sheet sync has executed
let hasSyncedWithSheets = false;
let syncPromise: Promise<void> | null = null;

/**
 * Synchronize completed phone numbers from Google Sheets into the in-memory cache.
 */
export async function syncCompletedPhonesFromSheets(): Promise<void> {
  if (hasSyncedWithSheets) return;
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      const rawPhones = await fetchExistingCompletedPhonesFromSheet();
      for (const raw of rawPhones) {
        const { isValid, normalized } = normalizePhoneNumber(raw);
        if (isValid && normalized) {
          completedPhonesSet.add(normalized);
        }
      }
      hasSyncedWithSheets = true;
      console.log(`[PhoneRegistry] Synchronized ${completedPhonesSet.size} unique completed phone numbers from Google Sheets.`);
    } catch (err: any) {
      console.warn('[PhoneRegistry] Warning: Could not complete initial sheet phone sync:', err.message);
    } finally {
      syncPromise = null;
    }
  })();

  return syncPromise;
}

/**
 * Checks whether a mobile number has already completed a quiz submission.
 * Validates and normalizes the number, checks in-memory cache, and verifies against Google Sheets.
 */
export async function isPhoneAlreadyCompleted(
  rawPhone: string,
  defaultCountry: CountryCode = 'IN'
): Promise<{
  completed: boolean;
  normalized: string;
  isValid: boolean;
  error?: string;
}> {
  const val = normalizePhoneNumber(rawPhone, defaultCountry);
  if (!val.isValid || !val.normalized) {
    return {
      completed: false,
      normalized: '',
      isValid: false,
      error: val.error || 'Invalid mobile number'
    };
  }

  // Fast-path: Check in-memory cache
  if (completedPhonesSet.has(val.normalized)) {
    return {
      completed: true,
      normalized: val.normalized,
      isValid: true
    };
  }

  // Sync with Google Sheets if not yet performed
  if (!hasSyncedWithSheets) {
    await syncCompletedPhonesFromSheets();
    if (completedPhonesSet.has(val.normalized)) {
      return {
        completed: true,
        normalized: val.normalized,
        isValid: true
      };
    }
  }

  return {
    completed: false,
    normalized: val.normalized,
    isValid: true
  };
}

/**
 * Atomic submission lock:
 * Atomically checks if the normalized phone number is already completed or if another
 * submission is currently in-flight. If free, acquires the lock immediately.
 */
export function acquirePhoneSubmissionLock(normalizedPhone: string): {
  acquired: boolean;
  reason?: 'completed' | 'in_flight';
  message?: string;
} {
  // 1. Guard against completed submissions
  if (completedPhonesSet.has(normalizedPhone)) {
    return {
      acquired: false,
      reason: 'completed',
      message: 'This mobile number has already been used to complete the quiz. Only one attempt is allowed per mobile number.'
    };
  }

  // 2. Guard against simultaneous in-flight submissions (lock expires after 30 seconds as safeguard)
  const existingLockTime = inFlightPhoneLocks.get(normalizedPhone);
  const now = Date.now();
  if (existingLockTime && now - existingLockTime < 30000) {
    return {
      acquired: false,
      reason: 'in_flight',
      message: 'A quiz submission for this mobile number is currently being processed. Please wait a moment.'
    };
  }

  // Acquire lock atomically in single-threaded JS event loop
  inFlightPhoneLocks.set(normalizedPhone, now);
  return { acquired: true };
}

/**
 * Releases the in-flight lock for a normalized phone number.
 * If markCompleted is true, permanently adds the phone number to completedPhonesSet.
 */
export function releasePhoneSubmissionLock(normalizedPhone: string, markCompleted: boolean): void {
  inFlightPhoneLocks.delete(normalizedPhone);
  if (markCompleted) {
    completedPhonesSet.add(normalizedPhone);
  }
}

/**
 * Manually register a phone number as completed (used for testing or idempotency).
 */
export function markPhoneAsCompleted(normalizedPhone: string): void {
  completedPhonesSet.add(normalizedPhone);
}

/**
 * Clear test data (strictly for testing).
 */
export function __resetPhoneRegistryForTesting(): void {
  completedPhonesSet.clear();
  inFlightPhoneLocks.clear();
  hasSyncedWithSheets = false;
}

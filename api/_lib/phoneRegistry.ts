import { normalizePhoneNumber, type CountryCode } from './phone.js';
import { fetchExistingCompletedPhonesFromSheet } from './sheetsClient.js';

/**
 * Server-side unique quiz-entry ID management and concurrency control.
 * 
 * Rules:
 * 1. Exactly ONE completed quiz submission per normalized mobile number.
 * 2. Pre-flight check before issuing questions to start a quiz.
 * 3. Atomic check-and-lock before grading and saving final submission.
 * 4. Google Sheets is the authoritative source of truth.
 * 5. Dynamic synchronization ensures that if booth staff manually delete an
 *    entry from Google Sheets, that mobile number is immediately unblocked
 *    and permitted to re-attempt the quiz.
 * 
 * Architecture Note on Concurrency:
 * - In-memory Mutex: The `inFlightPhoneLocks` map provides synchronous atomic
 *   locking against double-clicks and concurrent requests within the Node.js event loop.
 * - Live Google Sheets Sync: The active set of completed phones is synchronized
 *   with a smart TTL and re-verification logic to honor manual deletions without
 *   exceeding Google API quotas.
 */

// In-memory set of normalized phone numbers that have completed the quiz
const completedPhonesSet = new Set<string>();

// Atomic in-flight lock to prevent simultaneous concurrent requests
const inFlightPhoneLocks = new Map<string, number>();

// Cache timestamp and background sync lock
let lastSyncTimestamp = 0;
let syncPromise: Promise<void> | null = null;

// Cache TTL: Background cache is considered valid for up to 10 seconds.
// Force refresh cooldown: At least 3 seconds between forced live Google Sheets queries
// to protect Google API quotas while ensuring manual deletions are quickly honored.
const CACHE_TTL_MS = 10000;
const FORCE_REFRESH_COOLDOWN_MS = 3000;

/**
 * Synchronize completed phone numbers from Google Sheets into the in-memory cache.
 * If force is true, bypasses CACHE_TTL_MS (subject to FORCE_REFRESH_COOLDOWN_MS).
 * 
 * Replaces the cache with the live state of Google Sheets so any rows manually deleted
 * by booth staff are immediately unblocked.
 */
export async function syncCompletedPhonesFromSheets(force: boolean = false): Promise<void> {
  const now = Date.now();
  if (!force && lastSyncTimestamp > 0 && now - lastSyncTimestamp < CACHE_TTL_MS) {
    return;
  }
  if (force && lastSyncTimestamp > 0 && now - lastSyncTimestamp < FORCE_REFRESH_COOLDOWN_MS) {
    return;
  }
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      const rawPhones = await fetchExistingCompletedPhonesFromSheet();
      const freshPhones = new Set<string>();
      for (const raw of rawPhones) {
        const { isValid, normalized } = normalizePhoneNumber(raw);
        if (isValid && normalized) {
          freshPhones.add(normalized);
        }
      }

      // Atomically replace completedPhonesSet with the fresh sheet snapshot
      completedPhonesSet.clear();
      for (const phone of freshPhones) {
        completedPhonesSet.add(phone);
      }

      lastSyncTimestamp = Date.now();
      console.log(`[PhoneRegistry] Synchronized ${completedPhonesSet.size} unique completed phone numbers from Google Sheets.`);
    } catch (err: any) {
      console.warn('[PhoneRegistry] Warning: Could not complete sheet phone sync:', err.message);
    } finally {
      syncPromise = null;
    }
  })();

  return syncPromise;
}

/**
 * Checks whether a mobile number has already completed a quiz submission.
 * Validates and normalizes the number, checks in-memory cache, and verifies against Google Sheets.
 * If a number was previously completed but manually removed from Google Sheets, this will
 * re-verify against Google Sheets and allow the participant to re-attempt the quiz.
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

  // 1. Initial sync if never synced yet
  if (lastSyncTimestamp === 0) {
    await syncCompletedPhonesFromSheets(false);
  }

  // 2. If the number is currently in the cache, re-verify with Google Sheets if cooldown has passed.
  // This guarantees that if a row was manually deleted from Google Sheets, the deletion is honored!
  if (completedPhonesSet.has(val.normalized)) {
    if (Date.now() - lastSyncTimestamp > FORCE_REFRESH_COOLDOWN_MS) {
      await syncCompletedPhonesFromSheets(true);
    }

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
 * If markCompleted is true, adds the phone number to completedPhonesSet.
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
 * Manually remove a phone number from the completed set.
 */
export function removePhoneFromRegistry(normalizedPhone: string): void {
  completedPhonesSet.delete(normalizedPhone);
}

/**
 * Clear test data (strictly for testing).
 */
export function __resetPhoneRegistryForTesting(): void {
  completedPhonesSet.clear();
  inFlightPhoneLocks.clear();
  lastSyncTimestamp = 0;
  syncPromise = null;
}

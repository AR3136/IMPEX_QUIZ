import { google } from 'googleapis';
import { VisitorLead } from './types.js';
import { maskEmail, maskName } from './sanitizer.js';

export interface AppendQuizRecordParams {
  attemptId: string;
  visitor: VisitorLead;
  score: number;
  maxScore: 10;
  timeSpentSeconds: number;
}

export interface SheetsAppendResult {
  success: boolean;
  rowNumber?: number;
  isDuplicate?: boolean;
  message: string;
}

export interface ParticipantRecord {
  submissionId: string;
  timestamp: string;
  name: string;
  company?: string;
  visitorType?: string;
  score: number;
  maxScore: number;
  completionStatus: string;
  goodiesCollected: 'Yes' | 'No';
  collectionTimestamp?: string;
}

// In-memory dev storage & idempotency cache
const devParticipantStore = new Map<string, ParticipantRecord>();
const idempotencyCache = new Map<string, { result: SheetsAppendResult; timestamp: number }>();

function getSheetsConfig() {
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey = process.env.GOOGLE_PRIVATE_KEY?.trim();
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME?.trim() || 'Responses';

  const isConfigured = Boolean(serviceEmail && rawKey && sheetId);
  
  let privateKey = '';
  if (rawKey) {
    let cleanKey = rawKey;
    if ((cleanKey.startsWith('"') && cleanKey.endsWith('"')) || (cleanKey.startsWith("'") && cleanKey.endsWith("'"))) {
      cleanKey = cleanKey.slice(1, -1);
    }
    privateKey = cleanKey.replace(/\\n/g, '\n');
  }

  return { serviceEmail, privateKey, sheetId, tabName, isConfigured };
}

/**
 * Appends a confirmed quiz record to the official Google Sheet.
 * Initial state: Goodies Collected = 'No', Collection Timestamp = ''
 */
export async function appendQuizRecordToSheets(params: AppendQuizRecordParams): Promise<SheetsAppendResult> {
  const { attemptId, visitor, score, maxScore, timeSpentSeconds } = params;

  // 1. Check in-memory idempotency cache
  const cached = idempotencyCache.get(attemptId);
  if (cached) {
    return cached.result;
  }

  const { serviceEmail, privateKey, sheetId, tabName, isConfigured } = getSheetsConfig();

  // Save to dev store for fallback/local testing
  const devRecord: ParticipantRecord = {
    submissionId: attemptId,
    timestamp: visitor.registeredAt || new Date().toISOString(),
    name: visitor.name || 'Anonymous Attendee',
    company: visitor.company || 'Not Specified',
    visitorType: visitor.visitorType || 'Industry Professional',
    score,
    maxScore,
    completionStatus: 'Completed',
    goodiesCollected: 'No',
    collectionTimestamp: ''
  };
  devParticipantStore.set(attemptId, devRecord);

  if (!isConfigured) {
    console.log(`[Dev Log] Attempt ${attemptId} for ${maskName(visitor.name)} recorded in dev store (Goodies Collected = No).`);
    const devResult: SheetsAppendResult = {
      success: true,
      message: 'Recorded in dev mode (Configure Service Account for live Google Sheets storage)',
      isDuplicate: false
    };
    idempotencyCache.set(attemptId, { result: devResult, timestamp: Date.now() });
    return devResult;
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceEmail!,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    await ensureHeadersExist(sheets, sheetId!, tabName);

    // Idempotency: Check if already written
    const isExisting = await checkIfAttemptExistsInSheet(sheets, sheetId!, tabName, attemptId);
    if (isExisting) {
      console.log(`[Idempotency] Attempt ${attemptId} already exists in Sheet. Skipping duplicate row.`);
      const existingResult: SheetsAppendResult = {
        success: true,
        message: 'Record already confirmed in Google Sheet',
        isDuplicate: true
      };
      idempotencyCache.set(attemptId, { result: existingResult, timestamp: Date.now() });
      return existingResult;
    }

    // Row Schema:
    // [Submission ID, Timestamp, Full Name, Email, Mobile, Total Score, Max Score, Completion Status, Goodies Collected, Collection Timestamp]
    const timestamp = visitor.registeredAt || new Date().toISOString();
    const rowData = [
      attemptId,
      timestamp,
      visitor.name || '',
      visitor.email || '',
      visitor.phone || '',
      score,
      maxScore,
      'Completed',
      'No', // Requirement: initially Goodies Collected = No
      ''    // Empty collection timestamp
    ];

    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId!,
      range: `${tabName}!A:J`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [rowData] }
    });

    if (appendRes.status !== 200 || !appendRes.data.updates?.updatedRows) {
      throw new Error(`Google Sheets API write was not confirmed.`);
    }

    const result: SheetsAppendResult = {
      success: true,
      message: 'Successfully recorded in Google Sheet (Goodies Collected = No)',
      isDuplicate: false
    };
    idempotencyCache.set(attemptId, { result, timestamp: Date.now() });
    return result;

  } catch (error: any) {
    console.error(`[Google Sheets Error] Write failed for ${attemptId}:`, error.message);
    throw new Error(`Google Sheets Error: ${error.message}`);
  }
}

/**
 * Look up a single participant by submission ID.
 * Does NOT dump the entire database.
 */
export async function lookupParticipantBySubmissionId(submissionId: string): Promise<ParticipantRecord | null> {
  const { serviceEmail, privateKey, sheetId, tabName, isConfigured } = getSheetsConfig();

  // If live Sheets not configured, check dev store
  if (!isConfigured) {
    return devParticipantStore.get(submissionId) || null;
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceEmail!,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId!,
      range: `${tabName}!A:J`
    });

    const rows = res.data.values;
    if (!rows || rows.length <= 1) {
      return devParticipantStore.get(submissionId) || null;
    }

    // Search for row matching submissionId
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === submissionId) {
        return {
          submissionId: row[0],
          timestamp: row[1] || '',
          name: row[2] || 'Participant',
          company: 'Exhibition Visitor',
          visitorType: 'Industry Professional',
          score: parseInt(row[5], 10) || 0,
          maxScore: parseInt(row[6], 10) || 10,
          completionStatus: row[7] || 'Completed',
          goodiesCollected: (row[8] === 'Yes' || row[8] === 'YES') ? 'Yes' : 'No',
          collectionTimestamp: row[9] || ''
        };
      }
    }

    return devParticipantStore.get(submissionId) || null;
  } catch (err: any) {
    console.error('[Lookup Error]:', err.message);
    return devParticipantStore.get(submissionId) || null;
  }
}

/**
 * Mark goodies as collected for a participant.
 * Prevents repeated collection if already marked 'Yes'.
 */
export async function markGoodiesCollectedInSheets(submissionId: string): Promise<{ success: boolean; collectionTimestamp: string; message: string }> {
  const now = new Date().toISOString();

  // 1. Check current status in dev store / sheet
  const currentRecord = await lookupParticipantBySubmissionId(submissionId);
  if (!currentRecord) {
    const err = new Error(`Participant with Submission ID "${submissionId}" was not found.`);
    (err as any).statusCode = 404;
    throw err;
  }

  // 2. Prevent repeated collection
  if (currentRecord.goodiesCollected === 'Yes') {
    const err = new Error(`Goodies have ALREADY been collected for this participant on ${currentRecord.collectionTimestamp || 'earlier today'}. Duplicate collection is not permitted.`);
    (err as any).statusCode = 409;
    throw err;
  }

  // Update dev store
  currentRecord.goodiesCollected = 'Yes';
  currentRecord.collectionTimestamp = now;
  devParticipantStore.set(submissionId, currentRecord);

  const { serviceEmail, privateKey, sheetId, tabName, isConfigured } = getSheetsConfig();
  if (!isConfigured) {
    return {
      success: true,
      collectionTimestamp: now,
      message: 'Goodies marked as collected (dev store updated).'
    };
  }

  try {
    const auth = new google.auth.JWT({
      email: serviceEmail!,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId!,
      range: `${tabName}!A:A`
    });

    const rows = res.data.values;
    let rowIndex = -1;
    if (rows) {
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === submissionId) {
          rowIndex = i + 1; // 1-based row index in sheet
          break;
        }
      }
    }

    if (rowIndex === -1) {
      throw new Error(`Row for ${submissionId} not found in Google Sheets.`);
    }

    // Update Columns I (Goodies Collected) and J (Collection Timestamp)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId!,
      range: `${tabName}!I${rowIndex}:J${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['Yes', now]]
      }
    });

    console.log(`[Google Sheets] Updated Goodies Collected = Yes for ${submissionId} at row ${rowIndex}`);
    return {
      success: true,
      collectionTimestamp: now,
      message: 'Goodies successfully marked as collected in Google Sheets.'
    };
  } catch (error: any) {
    console.error('[Collect Update Error]:', error.message);
    throw error;
  }
}

async function ensureHeadersExist(sheets: any, spreadsheetId: string, tabName: string): Promise<void> {
  try {
    const checkRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!A1:J1`
    });

    const values = checkRes.data.values;
    if (!values || values.length === 0 || values[0].length === 0) {
      const headers = [
        'Submission ID',
        'Timestamp',
        'Full Name',
        'Email Address',
        'Mobile Number',
        'Total Score',
        'Maximum Score',
        'Completion Status',
        'Goodies Collected',
        'Collection Timestamp'
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tabName}!A1:J1`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [headers] }
      });
      console.log(`[Google Sheets] Created header row in "${tabName}" with Goodies tracking columns.`);
    }
  } catch (e: any) {
    if (e.message?.includes('Unable to parse range') || e.message?.includes('not found')) {
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [{ addSheet: { properties: { title: tabName } } }]
          }
        });
        await ensureHeadersExist(sheets, spreadsheetId, tabName);
      } catch {}
    }
  }
}

async function checkIfAttemptExistsInSheet(sheets: any, spreadsheetId: string, tabName: string, attemptId: string): Promise<boolean> {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!A:A`
    });
    const rows = res.data.values;
    if (!rows || rows.length <= 1) return false;
    return rows.some((row: string[]) => row[0] === attemptId);
  } catch {
    return false;
  }
}

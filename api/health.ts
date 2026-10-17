import { MASTER_QUESTION_BANK } from './_lib/questionBank.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const hasEmail = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim());
  const hasKey = Boolean(process.env.GOOGLE_PRIVATE_KEY?.trim());
  const hasSheetId = Boolean(process.env.GOOGLE_SHEET_ID?.trim());
  const isSheetsConfigured = hasEmail && hasKey && hasSheetId;
  const isStaffEnabled = Boolean(process.env.STAFF_ACCESS_KEY?.trim() && process.env.STAFF_ACCESS_KEY.trim().length >= 6);

  res.statusCode = 200;
  res.end(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel-production' : 'local-development',
    questionBankCount: MASTER_QUESTION_BANK.length,
    sheetsIntegration: {
      configured: isSheetsConfigured,
      hasServiceAccountEmail: hasEmail,
      hasPrivateKey: hasKey,
      hasSheetId: hasSheetId,
      tabName: process.env.GOOGLE_SHEET_TAB_NAME?.trim() || 'Responses',
      mode: isSheetsConfigured ? 'live_google_sheets_v4' : 'fallback_dev_store'
    },
    staffPortal: {
      enabled: isStaffEnabled
    }
  }));
}

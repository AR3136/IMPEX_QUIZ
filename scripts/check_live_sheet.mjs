import { google } from 'googleapis';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = (match[2] || '').trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val.replace(/\\n/g, '\n');
  }
});

const serviceEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const privateKey = env.GOOGLE_PRIVATE_KEY;
const spreadsheetId = env.GOOGLE_SHEET_ID;
const tabName = env.GOOGLE_SHEET_TAB_NAME || 'Responses';

console.log('Sheet ID:', spreadsheetId);
console.log('Tab Name:', tabName);

const auth = new google.auth.JWT({
  email: serviceEmail,
  key: privateKey,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

const meta = await sheets.spreadsheets.get({ spreadsheetId });
console.log('Tabs in spreadsheet:');
for (const s of meta.data.sheets || []) {
  console.log(`- '${s.properties.title}' (ID: ${s.properties.sheetId})`);
}

for (const s of meta.data.sheets || []) {
  const title = s.properties.title;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${title}!A1:J10`
  });
  console.log(`\nTab '${title}' first rows:`, res.data.values?.length || 0);
  (res.data.values || []).slice(0, 5).forEach((r, idx) => console.log(`  Row ${idx+1}:`, r));
}

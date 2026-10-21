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

const auth = new google.auth.JWT({
  email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: env.GOOGLE_PRIVATE_KEY,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheets = google.sheets({ version: 'v4', auth });

for (const tab of ['Responses', 'Sheet1']) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: env.GOOGLE_SHEET_ID,
    range: `${tab}!A:E`
  });
  console.log(`\n=== Tab: ${tab} (Total rows: ${res.data.values?.length || 0}) ===`);
  (res.data.values || []).forEach((row, i) => {
    console.log(`Row ${i+1}: ID=${row[0]}, Name=${row[2]}, Mobile=${row[4]}`);
  });
}

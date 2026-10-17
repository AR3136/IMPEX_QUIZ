import { verifyStaffToken } from '../_lib/staffAuth.js';
import { markGoodiesCollectedInSheets } from '../_lib/sheetsClient.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

  const auth = verifyStaffToken(req.headers['authorization']);
  if (!auth.valid) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: auth.error || 'Unauthorized staff access.' }));
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    else if (!body && req.on) {
      body = await new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', (c: any) => raw += c);
        req.on('end', () => {
          try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
        });
      });
    }

    const { submissionId } = body || {};
    if (!submissionId || typeof submissionId !== 'string') {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Submission ID is required.' }));
      return;
    }

    // Mark as collected & prevent repeated confirmation
    const updateResult = await markGoodiesCollectedInSheets(submissionId.trim());

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      submissionId,
      goodiesCollected: 'Yes',
      collectionTimestamp: updateResult.collectionTimestamp,
      message: 'Goodies marked as collected successfully.'
    }));
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message || 'Failed to update collection status.' }));
  }
}

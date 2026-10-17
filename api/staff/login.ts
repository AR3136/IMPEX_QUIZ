import { isStaffAuthEnabled, verifyPasscode, generateStaffToken } from '../_lib/staffAuth.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

  // Requirement 7 & 8: If staff authentication cannot be implemented properly, leave disabled
  if (!isStaffAuthEnabled()) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Staff portal is disabled because STAFF_ACCESS_KEY is not configured on the server.'
    }));
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

    const { passcode } = body || {};
    if (!passcode || !verifyPasscode(passcode)) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid staff passcode. Access denied.' }));
      return;
    }

    const session = generateStaffToken();

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      token: session.token,
      expiresAt: session.expiresAt,
      message: 'Staff authentication successful.'
    }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: err.message || 'Staff login failed.' }));
  }
}

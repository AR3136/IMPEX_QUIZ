import crypto from 'crypto';

const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000; // 8 hours booth shift

function getSecret(): string {
  return process.env.STAFF_ACCESS_KEY || process.env.STAFF_SECRET || '';
}

export function isStaffAuthEnabled(): boolean {
  const secret = getSecret().trim();
  return secret.length >= 6; // Requires at least 6 characters
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function verifyPasscode(inputPasscode: string): boolean {
  const secret = getSecret().trim();
  if (!isStaffAuthEnabled() || !inputPasscode) return false;

  const bufA = Buffer.from(inputPasscode.trim());
  const bufB = Buffer.from(secret);

  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Generate HMAC-SHA256 signed session token.
 */
export function generateStaffToken(): { token: string; expiresAt: number } {
  const secret = getSecret().trim();
  if (!secret) throw new Error('STAFF_ACCESS_KEY not configured.');

  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  const payload = JSON.stringify({ role: 'staff', expiresAt, nonce: crypto.randomBytes(8).toString('hex') });
  const b64Payload = Buffer.from(payload).toString('base64url');

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(b64Payload);
  const signature = hmac.digest('base64url');

  return {
    token: `${b64Payload}.${signature}`,
    expiresAt
  };
}

/**
 * Verify staff bearer token.
 */
export function verifyStaffToken(authHeader?: string): { valid: boolean; error?: string } {
  if (!isStaffAuthEnabled()) {
    return { valid: false, error: 'Staff authentication is disabled because STAFF_ACCESS_KEY is not configured.' };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or malformed Authorization header.' };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid token structure.' };
  }

  const [b64Payload, signature] = parts;
  const secret = getSecret().trim();

  // Verify HMAC signature
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(b64Payload);
  const expectedSig = hmac.digest('base64url');

  const bufSig = Buffer.from(signature);
  const bufExpected = Buffer.from(expectedSig);

  if (bufSig.length !== bufExpected.length || !crypto.timingSafeEqual(bufSig, bufExpected)) {
    return { valid: false, error: 'Invalid token signature.' };
  }

  try {
    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf-8'));
    if (payload.role !== 'staff') {
      return { valid: false, error: 'Unauthorized role.' };
    }
    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: 'Staff session has expired. Please log in again.' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Malformed token payload.' };
  }
}

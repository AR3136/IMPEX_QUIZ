/**
 * Safe logging utility to prevent personal data or credentials from leaking into server logs.
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***';
  const [user, domain] = email.split('@');
  const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : '***';
  return `${maskedUser}@${domain}`;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '***';
  const clean = phone.replace(/\s/g, '');
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
}

export function maskName(name: string): string {
  if (!name) return '***';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => p.length > 1 ? `${p[0]}***` : p).join(' ');
}

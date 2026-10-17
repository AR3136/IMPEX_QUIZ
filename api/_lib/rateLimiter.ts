// In-memory sliding window rate limiter
interface RateLimitRecord {
  count: number;
  firstRequestTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 15; // 15 requests per minute per IP

export function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record || now - record.firstRequestTime > WINDOW_MS) {
    rateLimitMap.set(clientIp, { count: 1, firstRequestTime: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - record.count };
}

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of rateLimitMap.entries()) {
    if (now - rec.firstRequestTime > WINDOW_MS * 2) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

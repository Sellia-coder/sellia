/**
 * Rate limiter en mémoire process (single-instance PM2).
 * Pour multi-instance, migrer vers Upstash Redis.
 */

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();

let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

function cleanupExpired(): void {
  if (Date.now() - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = Date.now();
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  limit: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanupExpired();

  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetIn: windowMs, limit };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: bucket.resetAt - now, limit };
  }

  bucket.count++;
  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetIn: bucket.resetAt - now,
    limit,
  };
}

export const RATE_LIMITS = {
  WEBHOOK_PER_IP: { limit: 100, windowMs: 60_000 },
  WEBHOOK_PER_TX: { limit: 10, windowMs: 60_000 },
  PAYOUT_PER_SHOP: { limit: 5, windowMs: 60_000 },
  PAYOUT_PER_DAY_PER_SHOP: { limit: 20, windowMs: 86_400_000 },
  CHECKOUT_PER_IP: { limit: 20, windowMs: 60_000 },
  AUTH_PER_IP: { limit: 10, windowMs: 60_000 },
};

export function getClientIp(headers: Headers): string {
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xRealIp = headers.get("x-real-ip");
  if (xRealIp) return xRealIp;
  return "unknown";
}

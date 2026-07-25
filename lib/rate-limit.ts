import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory, per-instance fallback — used when Upstash isn't configured
// (e.g. local dev without credentials). A serverless instance that gets
// recycled just resets that key's count, which only makes the limit
// slightly more permissive, never less safe.
const buckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimitInMemory(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

const hasUpstash = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

const redis = hasUpstash ? Redis.fromEnv() : null;

// One Ratelimit instance per distinct (limit, windowMs) pair — every current
// caller uses 10/15min, but this stays correct if a future one doesn't.
const ratelimiters = new Map<string, Ratelimit>();

function getRatelimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  const existing = ratelimiters.get(cacheKey);
  if (existing) return existing;

  const instance = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(limit, `${Math.round(windowMs / 1000)} s`),
    prefix: "a-gleam-ratelimit",
  });
  ratelimiters.set(cacheKey, instance);
  return instance;
}

/**
 * Returns true if the call is allowed, false if the caller is over the
 * limit. Backed by Upstash Redis (shared across every serverless instance)
 * when UPSTASH_REDIS_REST_URL/TOKEN are set; otherwise falls back to the
 * in-memory limiter above.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  if (!redis) {
    return checkRateLimitInMemory(key, limit, windowMs);
  }

  const { success } = await getRatelimiter(limit, windowMs).limit(key);
  return success;
}

export function getClientIp(request: Request): string {
  // Each proxy hop APPENDS its observed remote address to this header, so
  // the first entry is whatever the client claims (spoofable) and the last
  // entry is the one Vercel's edge network itself observed (trustworthy).
  const chain = request.headers.get("x-forwarded-for");
  const last = chain?.split(",").pop()?.trim();
  return last || "unknown";
}

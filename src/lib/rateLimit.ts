// src/lib/rateLimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";

/**
 * Rate limiter using Upstash Redis via Vercel KV.
 * Sliding window: 10 requests per minute per IP.
 *
 * Falls back gracefully if Vercel KV is not configured.
 */

let ratelimit: Ratelimit | null = null;

function getRateLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  // Check if Vercel KV is configured
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.warn("Vercel KV not configured. Rate limiting disabled.");
    return null;
  }

  ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
    prefix: "linkedin-post-gen",
  });

  return ratelimit;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Check rate limit for a given identifier (usually IP address).
 * Returns ok=true if request is allowed, ok=false if rate limited.
 *
 * If rate limiting is not configured, always returns ok=true.
 */
export async function checkRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  const limiter = getRateLimiter();

  // Graceful degradation: if not configured, allow all requests
  if (!limiter) {
    return { ok: true, remaining: Infinity, reset: 0, limit: Infinity };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      ok: result.success,
      remaining: result.remaining,
      reset: result.reset,
      limit: result.limit,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // On error, allow request but log the issue
    return { ok: true, remaining: -1, reset: 0, limit: -1 };
  }
}

/**
 * Extract client IP from request headers.
 * Handles common proxy headers and Vercel-specific headers.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }

  // Fallback for localhost/development
  return "127.0.0.1";
}

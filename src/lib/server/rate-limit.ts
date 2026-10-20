import "server-only";

/**
 * Minimal in-memory sliding-window limiter. The app has no authentication, so the email action
 * is a public endpoint; this caps how fast one server process can be used to send mail.
 * Per-process only — use a shared store (e.g. Redis) when running several instances.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  let hits: number[] = [];

  return {
    /** Records an attempt; returns false when the limit is exceeded. */
    take(now = Date.now()): boolean {
      hits = hits.filter((time) => now - time < windowMs);
      if (hits.length >= limit) return false;
      hits.push(now);
      return true;
    },
    reset() {
      hits = [];
    },
  };
}

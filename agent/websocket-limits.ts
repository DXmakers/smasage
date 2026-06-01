/**
 * WebSocket inbound message limits — Issue #135.
 *
 * Reject oversized frames before JSON.parse to limit memory use and parsing cost.
 * Also implements per-client rate limiting to prevent DoS attacks.
 */

/** Default max inbound WebSocket message size (64 KiB). */
export const DEFAULT_MAX_WS_MESSAGE_BYTES = 64 * 1024;

/** Default max messages per client per second. */
export const DEFAULT_MAX_MESSAGES_PER_SECOND = 10;

/** Default rate limit window in milliseconds. */
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 1000;

/**
 * Returns an error message when `byteLength` exceeds `maxBytes`, otherwise null.
 */
export function wsMessageSizeError(
  byteLength: number,
  maxBytes: number = DEFAULT_MAX_WS_MESSAGE_BYTES,
): string | null {
  if (!Number.isFinite(byteLength) || byteLength < 0) {
    return "message size is invalid";
  }
  if (byteLength > maxBytes) {
    return `message exceeds maximum size of ${maxBytes} bytes (got ${byteLength})`;
  }
  return null;
}

/**
 * Per-client rate limiter using a sliding window counter.
 * Tracks message timestamps and enforces a maximum message rate.
 */
export class RateLimiter {
  private messageTimestamps: number[] = [];
  private readonly maxMessages: number;
  private readonly windowMs: number;

  constructor(
    maxMessages: number = DEFAULT_MAX_MESSAGES_PER_SECOND,
    windowMs: number = DEFAULT_RATE_LIMIT_WINDOW_MS,
  ) {
    this.maxMessages = maxMessages;
    this.windowMs = windowMs;
  }

  /**
   * Check if a message should be allowed under the rate limit.
   * Returns null if allowed, otherwise returns an error message.
   */
  public checkLimit(): string | null {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Remove timestamps outside the current window
    this.messageTimestamps = this.messageTimestamps.filter(
      (ts) => ts > windowStart,
    );

    // Check if we've exceeded the limit
    if (this.messageTimestamps.length >= this.maxMessages) {
      return `rate limit exceeded: maximum ${this.maxMessages} messages per ${this.windowMs}ms`;
    }

    // Record this message
    this.messageTimestamps.push(now);
    return null;
  }

  /**
   * Get the current number of messages in the window.
   */
  public getMessageCount(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    return this.messageTimestamps.filter((ts) => ts > windowStart).length;
  }

  /**
   * Reset the rate limiter state.
   */
  public reset(): void {
    this.messageTimestamps = [];
  }
}

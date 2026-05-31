import {
  DEFAULT_MAX_WS_MESSAGE_BYTES,
  wsMessageSizeError,
  RateLimiter,
  DEFAULT_MAX_MESSAGES_PER_SECOND,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
} from "./websocket-limits";

describe("wsMessageSizeError", () => {
  it("allows messages within the limit", () => {
    expect(wsMessageSizeError(100, 1024)).toBeNull();
    expect(wsMessageSizeError(DEFAULT_MAX_WS_MESSAGE_BYTES)).toBeNull();
  });

  it("rejects messages over the limit", () => {
    const err = wsMessageSizeError(DEFAULT_MAX_WS_MESSAGE_BYTES + 1);
    expect(err).toMatch(/exceeds maximum size/);
    expect(err).toMatch(String(DEFAULT_MAX_WS_MESSAGE_BYTES));
  });

  it("rejects invalid byte lengths", () => {
    expect(wsMessageSizeError(Number.NaN)).toMatch(/invalid/);
    expect(wsMessageSizeError(-1)).toMatch(/invalid/);
  });
});

describe("RateLimiter", () => {
  it("allows messages within the rate limit", () => {
    const limiter = new RateLimiter(5, 1000);
    for (let i = 0; i < 5; i++) {
      expect(limiter.checkLimit()).toBeNull();
    }
  });

  it("rejects messages exceeding the rate limit", () => {
    const limiter = new RateLimiter(3, 1000);
    expect(limiter.checkLimit()).toBeNull();
    expect(limiter.checkLimit()).toBeNull();
    expect(limiter.checkLimit()).toBeNull();
    const err = limiter.checkLimit();
    expect(err).toMatch(/rate limit exceeded/);
    expect(err).toMatch(/3 messages/);
  });

  it("tracks message count correctly", () => {
    const limiter = new RateLimiter(5, 1000);
    expect(limiter.getMessageCount()).toBe(0);
    limiter.checkLimit();
    expect(limiter.getMessageCount()).toBe(1);
    limiter.checkLimit();
    expect(limiter.getMessageCount()).toBe(2);
  });

  it("resets the rate limiter", () => {
    const limiter = new RateLimiter(2, 1000);
    limiter.checkLimit();
    limiter.checkLimit();
    expect(limiter.checkLimit()).not.toBeNull();
    limiter.reset();
    expect(limiter.checkLimit()).toBeNull();
  });

  it("uses default values when not specified", () => {
    const limiter = new RateLimiter();
    // Should allow DEFAULT_MAX_MESSAGES_PER_SECOND messages
    for (let i = 0; i < DEFAULT_MAX_MESSAGES_PER_SECOND; i++) {
      expect(limiter.checkLimit()).toBeNull();
    }
    // Next message should be rejected
    expect(limiter.checkLimit()).not.toBeNull();
  });

  it("allows messages after the window expires", (done) => {
    const limiter = new RateLimiter(2, 100); // 100ms window
    expect(limiter.checkLimit()).toBeNull();
    expect(limiter.checkLimit()).toBeNull();
    expect(limiter.checkLimit()).not.toBeNull();

    // Wait for window to expire
    setTimeout(() => {
      expect(limiter.checkLimit()).toBeNull();
      done();
    }, 150);
  });
});

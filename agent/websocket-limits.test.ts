import {
  DEFAULT_MAX_WS_MESSAGE_BYTES,
  wsMessageSizeError,
} from './websocket-limits';

describe('wsMessageSizeError', () => {
  it('allows messages within the limit', () => {
    expect(wsMessageSizeError(100, 1024)).toBeNull();
    expect(wsMessageSizeError(DEFAULT_MAX_WS_MESSAGE_BYTES)).toBeNull();
  });

  it('rejects messages over the limit', () => {
    const err = wsMessageSizeError(DEFAULT_MAX_WS_MESSAGE_BYTES + 1);
    expect(err).toMatch(/exceeds maximum size/);
    expect(err).toMatch(String(DEFAULT_MAX_WS_MESSAGE_BYTES));
  });

  it('rejects invalid byte lengths', () => {
    expect(wsMessageSizeError(Number.NaN)).toMatch(/invalid/);
    expect(wsMessageSizeError(-1)).toMatch(/invalid/);
  });
});

// Mock dependencies that use ESM-only features (import.meta) incompatible with Jest's CJS transform
jest.mock('./notification-service', () => ({
  monitorUserGoals: jest.fn().mockReturnValue([]),
}));
jest.mock('./goal-projection', () => ({
  projectGoalStatus: jest.fn(),
}));
jest.mock('./websocket-limits', () => ({
  DEFAULT_MAX_WS_MESSAGE_BYTES: 65536,
  wsMessageSizeError: jest.fn().mockReturnValue(null),
}));

import { validateUserId, isOriginAllowed } from './websocket-server';

describe('validateUserId', () => {
  it('accepts a normal alphanumeric id', () => {
    expect(validateUserId('user-123')).toBe(true);
  });

  it('accepts a Stellar-style public key', () => {
    expect(validateUserId('GABC1234DEFG5678HIJK9012LMNO3456PQRS7890TUVW1234XYZ5678ABCD')).toBe(true);
  });

  it('accepts a UUID', () => {
    expect(validateUserId('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(validateUserId('')).toBe(false);
  });

  it('rejects a whitespace-only string', () => {
    expect(validateUserId('   ')).toBe(false);
  });

  it('rejects a string exceeding 128 characters', () => {
    expect(validateUserId('a'.repeat(129))).toBe(false);
  });

  it('accepts a string of exactly 128 characters', () => {
    expect(validateUserId('a'.repeat(128))).toBe(true);
  });

  it('rejects a string containing a tab (control char)', () => {
    expect(validateUserId('user\t123')).toBe(false);
  });

  it('rejects a string containing a newline', () => {
    expect(validateUserId('user\n123')).toBe(false);
  });

  it('rejects a string containing a carriage return', () => {
    expect(validateUserId('user\r123')).toBe(false);
  });

  it('rejects a string containing DEL (0x7F)', () => {
    expect(validateUserId('user\x7f123')).toBe(false);
  });

  it('rejects a string containing a NUL byte', () => {
    expect(validateUserId('user\x00123')).toBe(false);
  });
});

describe('isOriginAllowed', () => {
  it('allows any origin when allowedOrigins is empty (dev / allow-all mode)', () => {
    expect(isOriginAllowed('http://evil.example.com', [])).toBe(true);
  });

  it('allows undefined origin when allowedOrigins is empty', () => {
    expect(isOriginAllowed(undefined, [])).toBe(true);
  });

  it('allows undefined origin even when allowedOrigins is non-empty (non-browser client)', () => {
    expect(isOriginAllowed(undefined, ['http://localhost:3000'])).toBe(true);
  });

  it('allows an origin that appears in the allowlist', () => {
    expect(isOriginAllowed('http://localhost:3000', ['http://localhost:3000'])).toBe(true);
  });

  it('allows an origin that appears anywhere in a multi-entry allowlist', () => {
    expect(
      isOriginAllowed('https://prod.example.com', [
        'http://localhost:3000',
        'https://prod.example.com',
      ])
    ).toBe(true);
  });

  it('rejects an origin not in the allowlist', () => {
    expect(isOriginAllowed('http://evil.example.com', ['http://localhost:3000'])).toBe(false);
  });

  it('is case-sensitive (HTTP vs http)', () => {
    expect(isOriginAllowed('HTTP://localhost:3000', ['http://localhost:3000'])).toBe(false);
  });

  it('rejects a partial match (prefix only)', () => {
    expect(isOriginAllowed('http://localhost:3000.evil.com', ['http://localhost:3000'])).toBe(false);
  });
});

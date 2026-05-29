import { validateEnv, loadAgentEnv } from './env';

describe('validateEnv', () => {
  it('accepts the minimal required env and applies defaults', () => {
    expect(validateEnv({ GEMINI_API_KEY: 'secret' })).toEqual({
      ok: true,
      env: { GEMINI_API_KEY: 'secret', NOTIFICATION_PORT: 3001 },
    });
  });

  it('uses the provided NOTIFICATION_PORT when valid', () => {
    expect(validateEnv({ GEMINI_API_KEY: 'secret', NOTIFICATION_PORT: '4500' })).toEqual({
      ok: true,
      env: { GEMINI_API_KEY: 'secret', NOTIFICATION_PORT: 4500 },
    });
  });

  it('reports a missing required key', () => {
    expect(validateEnv({})).toEqual({
      ok: false,
      errors: ['GEMINI_API_KEY is required'],
    });
  });

  it('treats an empty / whitespace-only required key as missing', () => {
    expect(validateEnv({ GEMINI_API_KEY: '   ' })).toEqual({
      ok: false,
      errors: ['GEMINI_API_KEY is required'],
    });
  });

  it('rejects non-integer NOTIFICATION_PORT', () => {
    expect(validateEnv({ GEMINI_API_KEY: 'k', NOTIFICATION_PORT: 'abc' })).toEqual({
      ok: false,
      errors: [expect.stringMatching(/NOTIFICATION_PORT must be an integer/)],
    });
  });

  it('rejects an out-of-range NOTIFICATION_PORT', () => {
    expect(validateEnv({ GEMINI_API_KEY: 'k', NOTIFICATION_PORT: '0' }).ok).toBe(false);
    expect(validateEnv({ GEMINI_API_KEY: 'k', NOTIFICATION_PORT: '70000' }).ok).toBe(false);
  });

  it('reports every error at once (one-pass fix)', () => {
    expect(validateEnv({ NOTIFICATION_PORT: 'oops' })).toEqual({
      ok: false,
      errors: expect.arrayContaining([
        expect.stringMatching(/GEMINI_API_KEY is required/),
        expect.stringMatching(/NOTIFICATION_PORT must be an integer/),
      ]),
    });
  });
});

describe('loadAgentEnv', () => {
  it('returns the typed env on success', () => {
    const env = loadAgentEnv({ GEMINI_API_KEY: 'k', NOTIFICATION_PORT: '8080' });
    expect(env).toEqual({ GEMINI_API_KEY: 'k', NOTIFICATION_PORT: 8080 });
  });

  it('throws a multi-line error listing every problem', () => {
    expect(() => loadAgentEnv({ NOTIFICATION_PORT: 'oops' })).toThrow(/GEMINI_API_KEY is required/);
    expect(() => loadAgentEnv({ NOTIFICATION_PORT: 'oops' })).toThrow(/NOTIFICATION_PORT/);
  });
});

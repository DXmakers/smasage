import { validateEnv, loadAgentEnv, parseGeminiApiKey, parseAllowedOrigins } from './env';

describe('parseGeminiApiKey', () => {
  it('returns a trimmed definite string', () => {
    expect(parseGeminiApiKey('  secret-key  ')).toBe('secret-key');
  });

  it('returns undefined for missing or blank values', () => {
    expect(parseGeminiApiKey(undefined)).toBeUndefined();
    expect(parseGeminiApiKey('')).toBeUndefined();
    expect(parseGeminiApiKey('   ')).toBeUndefined();
  });
});

describe('validateEnv', () => {
  it('accepts the minimal required env and applies defaults', () => {
    expect(validateEnv({ GEMINI_API_KEY: 'secret' })).toEqual({
      ok: true,
      env: { GEMINI_API_KEY: 'secret', NOTIFICATION_PORT: 3001, ALLOWED_ORIGINS: ['http://localhost:3000'] },
    });
  });

  it('trims whitespace from GEMINI_API_KEY', () => {
    expect(validateEnv({ GEMINI_API_KEY: '  secret  ' })).toEqual({
      ok: true,
      env: { GEMINI_API_KEY: 'secret', NOTIFICATION_PORT: 3001, ALLOWED_ORIGINS: ['http://localhost:3000'] },
    });
  });

  it('uses the provided NOTIFICATION_PORT when valid', () => {
    expect(validateEnv({ GEMINI_API_KEY: 'secret', NOTIFICATION_PORT: '4500' })).toEqual({
      ok: true,
      env: { GEMINI_API_KEY: 'secret', NOTIFICATION_PORT: 4500, ALLOWED_ORIGINS: ['http://localhost:3000'] },
    });
  });

  it('parses ALLOWED_ORIGINS into a string array', () => {
    expect(
      validateEnv({ GEMINI_API_KEY: 'k', ALLOWED_ORIGINS: 'http://localhost:3000,https://prod.example.com' })
    ).toEqual({
      ok: true,
      env: {
        GEMINI_API_KEY: 'k',
        NOTIFICATION_PORT: 3001,
        ALLOWED_ORIGINS: ['http://localhost:3000', 'https://prod.example.com'],
      },
    });
  });

  it('defaults ALLOWED_ORIGINS to localhost:3000 when absent', () => {
    const result = validateEnv({ GEMINI_API_KEY: 'k' });
    expect(result.ok && result.env.ALLOWED_ORIGINS).toEqual(['http://localhost:3000']);
  });

  it('returns empty ALLOWED_ORIGINS when explicitly set to empty string', () => {
    const result = validateEnv({ GEMINI_API_KEY: 'k', ALLOWED_ORIGINS: '' });
    expect(result.ok && result.env.ALLOWED_ORIGINS).toEqual([]);
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
    expect(env).toEqual({ GEMINI_API_KEY: 'k', NOTIFICATION_PORT: 8080, ALLOWED_ORIGINS: ['http://localhost:3000'] });
  });

  it('throws a multi-line error listing every problem', () => {
    expect(() => loadAgentEnv({ NOTIFICATION_PORT: 'oops' })).toThrow(/GEMINI_API_KEY is required/);
    expect(() => loadAgentEnv({ NOTIFICATION_PORT: 'oops' })).toThrow(/NOTIFICATION_PORT/);
  });
});

describe('parseAllowedOrigins', () => {
  it('returns empty array for undefined input', () => {
    expect(parseAllowedOrigins(undefined)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseAllowedOrigins('')).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(parseAllowedOrigins('   ')).toEqual([]);
  });

  it('parses a single origin', () => {
    expect(parseAllowedOrigins('http://localhost:3000')).toEqual(['http://localhost:3000']);
  });

  it('parses multiple origins and trims whitespace', () => {
    expect(parseAllowedOrigins('http://localhost:3000, https://app.example.com')).toEqual([
      'http://localhost:3000',
      'https://app.example.com',
    ]);
  });

  it('filters out blank entries from trailing commas', () => {
    expect(parseAllowedOrigins('http://localhost:3000,')).toEqual(['http://localhost:3000']);
  });
});

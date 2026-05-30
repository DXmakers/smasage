/**
 * Agent environment validation — Issue #147.
 *
 * Centralises the agent's environment-variable contract so every entry point
 * fails the same way and with the same messages. `validateEnv` is pure and
 * unit-tested; `loadAgentEnv` is the thin wrapper that reads `process.env` and
 * throws on misconfiguration.
 */

/** The shape of a fully validated agent env. */
export interface AgentEnv {
  GEMINI_API_KEY: string;
  NOTIFICATION_PORT: number;
  /** Allowed WebSocket origins. Empty list means allow all (dev mode). */
  ALLOWED_ORIGINS: string[];
}

export interface ValidateEnvSuccess {
  ok: true;
  env: AgentEnv;
}

export interface ValidateEnvFailure {
  ok: false;
  errors: string[];
}

export type ValidateEnvResult = ValidateEnvSuccess | ValidateEnvFailure;

export const DEFAULT_NOTIFICATION_PORT = 3001;
const MIN_PORT = 1;
const MAX_PORT = 65535;
export const DEFAULT_ALLOWED_ORIGINS_RAW = 'http://localhost:3000';

/**
 * Parse a comma-separated `ALLOWED_ORIGINS` env string into a string array.
 * Returns an empty array when the value is absent or blank (allow-all / dev mode).
 */
export function parseAllowedOrigins(raw: string | undefined): string[] {
  if (raw === undefined || raw.trim() === '') {
    return [];
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Parse `GEMINI_API_KEY` from a raw env value.
 * Returns a definite non-empty string after trim, or `undefined` when missing.
 */
export function parseGeminiApiKey(raw: string | undefined): string | undefined {
  if (raw === undefined) {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Pure validator: takes a raw map of env vars and returns either the typed
 * `AgentEnv` or a list of human-readable error messages. Does not throw and
 * does not touch `process.env` itself.
 */
export function validateEnv(raw: Record<string, string | undefined>): ValidateEnvResult {
  const errors: string[] = [];

  // GEMINI_API_KEY — required, non-empty string (trimmed)
  const apiKey = parseGeminiApiKey(raw.GEMINI_API_KEY);
  if (apiKey === undefined) {
    errors.push('GEMINI_API_KEY is required');
  }

  // NOTIFICATION_PORT — optional integer in [1, 65535], defaults to 3001
  const portRaw = raw.NOTIFICATION_PORT;
  let port: number = DEFAULT_NOTIFICATION_PORT;
  if (portRaw !== undefined && portRaw !== '') {
    const parsed = Number(portRaw);
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      errors.push(`NOTIFICATION_PORT must be an integer (got ${JSON.stringify(portRaw)})`);
    } else if (parsed < MIN_PORT) {
      errors.push(`NOTIFICATION_PORT must be >= ${MIN_PORT}`);
    } else if (parsed > MAX_PORT) {
      errors.push(`NOTIFICATION_PORT must be <= ${MAX_PORT}`);
    } else {
      port = parsed;
    }
  }

  // ALLOWED_ORIGINS — optional comma-separated list; absent defaults to localhost:3000
  const allowedOrigins = parseAllowedOrigins(raw.ALLOWED_ORIGINS ?? DEFAULT_ALLOWED_ORIGINS_RAW);

  if (errors.length > 0 || apiKey === undefined) {
    return { ok: false, errors };
  }

  return { ok: true, env: { GEMINI_API_KEY: apiKey, NOTIFICATION_PORT: port, ALLOWED_ORIGINS: allowedOrigins } };
}

/**
 * Read & validate `process.env` for the agent. Throws a single error whose
 * message lists every misconfiguration so the operator can fix them in one
 * pass.
 */
export function loadAgentEnv(source: Record<string, string | undefined> = process.env): AgentEnv {
  const result = validateEnv(source);
  if (result.ok === false) {
    throw new Error(
      `Agent environment is misconfigured:\n  - ${result.errors.join('\n  - ')}`,
    );
  }
  return result.env;
}

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

/**
 * Pure validator: takes a raw map of env vars and returns either the typed
 * `AgentEnv` or a list of human-readable error messages. Does not throw and
 * does not touch `process.env` itself.
 */
export function validateEnv(raw: Record<string, string | undefined>): ValidateEnvResult {
  const errors: string[] = [];

  // GEMINI_API_KEY — required, non-empty string
  const apiKeyRaw = raw.GEMINI_API_KEY;
  let apiKey: string | undefined;
  if (apiKeyRaw === undefined || apiKeyRaw.trim() === '') {
    errors.push('GEMINI_API_KEY is required');
  } else {
    apiKey = apiKeyRaw;
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

  if (errors.length > 0 || apiKey === undefined) {
    return { ok: false, errors };
  }
  return { ok: true, env: { GEMINI_API_KEY: apiKey, NOTIFICATION_PORT: port } };
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

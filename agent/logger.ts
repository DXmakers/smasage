/**
 * Structured logging for the notification server — Issue #146.
 *
 * Emits one JSON object per log call (newline-terminated) so logs can be
 * ingested by any log aggregator without parsing free-form strings. Each line
 * carries an ISO timestamp, level, component, message, and arbitrary
 * structured metadata.
 *
 * `formatLogLine` is pure (no console / clock dependency) so it's trivial to
 * unit-test; `createLogger` returns the friendly per-component API.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogRecord {
  ts: string;
  level: LogLevel;
  component: string;
  msg: string;
  [key: string]: unknown;
}

export interface FormatLogLineArgs {
  level: LogLevel;
  component: string;
  msg: string;
  meta?: Record<string, unknown>;
  now?: Date;
}

/** Produce a single JSON-encoded log record (no trailing newline). */
export function formatLogLine(args: FormatLogLineArgs): string {
  const ts = (args.now ?? new Date()).toISOString();
  const record: LogRecord = {
    ts,
    level: args.level,
    component: args.component,
    msg: args.msg,
  };
  if (args.meta) {
    for (const [k, v] of Object.entries(args.meta)) {
      if (k in record) continue; // reserved keys win
      record[k] = serialiseValue(v);
    }
  }
  return JSON.stringify(record);
}

/** Convert non-JSON-safe values (Error, BigInt) into something stringifiable. */
function serialiseValue(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

export interface Logger {
  debug: (msg: string, meta?: Record<string, unknown>) => void;
  info: (msg: string, meta?: Record<string, unknown>) => void;
  warn: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, meta?: Record<string, unknown>) => void;
  child: (component: string) => Logger;
}

export interface CreateLoggerOptions {
  /** Output sink — defaults to stdout via console.log so tests can inject. */
  write?: (line: string) => void;
  /** Clock — injectable for deterministic tests. */
  now?: () => Date;
}

/**
 * Build a logger scoped to a component name. Levels are emitted unconditionally;
 * filtering is left to the log shipper.
 */
export function createLogger(component: string, options: CreateLoggerOptions = {}): Logger {
  const write = options.write ?? ((line: string) => process.stdout.write(line + '\n'));
  const now = options.now ?? (() => new Date());

  function emit(level: LogLevel, msg: string, meta?: Record<string, unknown>): void {
    write(formatLogLine({ level, component, msg, meta, now: now() }));
  }

  return {
    debug: (msg, meta) => emit('debug', msg, meta),
    info: (msg, meta) => emit('info', msg, meta),
    warn: (msg, meta) => emit('warn', msg, meta),
    error: (msg, meta) => emit('error', msg, meta),
    child: (childComponent) =>
      createLogger(`${component}.${childComponent}`, { write, now }),
  };
}

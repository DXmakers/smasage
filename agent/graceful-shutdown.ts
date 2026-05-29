/**
 * Graceful shutdown helper — Issue #145.
 *
 * Registers SIGTERM/SIGINT handlers that:
 *   1. Run an ordered list of cleanup handlers (e.g. close WebSocket clients,
 *      close the HTTP server).
 *   2. Are idempotent — a second signal during shutdown is logged but does not
 *      re-trigger the handlers.
 *   3. Honour a hard timeout so a hanging cleanup cannot wedge a container
 *      that the orchestrator is trying to recycle.
 *
 * The default `signal()` is `process.kill` style (subscribe via
 * `process.on(signal, fn)`) and the default `exit()` is `process.exit`, both
 * injectable so the helper can be unit-tested without touching the real
 * process.
 */

import type { Logger } from './logger';

export type ShutdownHandler = () => void | Promise<void>;

export interface SignalEmitter {
  on(signal: 'SIGTERM' | 'SIGINT', listener: () => void): void;
}

export interface RegisterGracefulShutdownOptions {
  logger: Logger;
  handlers: ShutdownHandler[];
  /** Hard cap on total shutdown time, in ms. Defaults to 10s. */
  timeoutMs?: number;
  /** Injectable signal emitter (defaults to `process`). */
  signals?: SignalEmitter;
  /** Injectable exit (defaults to `process.exit`). */
  exit?: (code: number) => void;
}

interface ShutdownState {
  inProgress: boolean;
  completed: boolean;
}

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * Wire SIGTERM and SIGINT to the same shutdown procedure. Returns a function
 * that triggers shutdown manually (useful for tests).
 */
export function registerGracefulShutdown(
  options: RegisterGracefulShutdownOptions,
): () => Promise<void> {
  const {
    logger,
    handlers,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signals = process,
    exit = (code: number) => process.exit(code),
  } = options;

  const state: ShutdownState = { inProgress: false, completed: false };

  async function shutdown(signal: 'SIGTERM' | 'SIGINT' | 'manual'): Promise<void> {
    if (state.completed) {
      logger.warn('shutdown already completed; ignoring signal', { signal });
      return;
    }
    if (state.inProgress) {
      logger.warn('shutdown already in progress; ignoring signal', { signal });
      return;
    }
    state.inProgress = true;
    logger.info('graceful shutdown started', { signal });

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      logger.error('graceful shutdown timed out; forcing exit', { timeoutMs });
      exit(1);
    }, timeoutMs);
    // Don't keep the event loop alive solely for the shutdown timer.
    if (typeof (timer as { unref?: () => void }).unref === 'function') {
      (timer as { unref: () => void }).unref();
    }

    try {
      for (let i = 0; i < handlers.length; i++) {
        try {
          await handlers[i]();
        } catch (err) {
          logger.error('shutdown handler failed', { index: i, err });
        }
      }
    } finally {
      clearTimeout(timer);
      state.completed = true;
      if (!timedOut) {
        logger.info('graceful shutdown complete');
        exit(0);
      }
    }
  }

  signals.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
  signals.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  return () => shutdown('manual');
}

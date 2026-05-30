import {
  registerGracefulShutdown,
  type SignalEmitter,
  type ShutdownHandler,
} from './graceful-shutdown';
import type { Logger } from './logger';

function fakeLogger(): Logger & { records: Array<{ level: string; msg: string; meta?: Record<string, unknown> }> } {
  const records: Array<{ level: string; msg: string; meta?: Record<string, unknown> }> = [];
  const log = (level: string) => (msg: string, meta?: Record<string, unknown>) => {
    records.push({ level, msg, meta });
  };
  const logger = {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
    child: () => logger,
    records,
  };
  return logger as Logger & typeof logger;
}

interface FakeSignalEmitter extends SignalEmitter {
  fire(signal: 'SIGTERM' | 'SIGINT'): void;
}

function fakeSignals(): FakeSignalEmitter {
  const listeners: Record<'SIGTERM' | 'SIGINT', Array<() => void>> = {
    SIGTERM: [],
    SIGINT: [],
  };
  return {
    on(signal, listener) {
      listeners[signal].push(listener);
    },
    fire(signal) {
      for (const l of listeners[signal]) l();
    },
  };
}

describe('registerGracefulShutdown', () => {
  it('runs every handler in order on SIGTERM and exits cleanly', async () => {
    const calls: string[] = [];
    const handlers: ShutdownHandler[] = [
      () => {
        calls.push('a');
      },
      async () => {
        calls.push('b');
      },
    ];
    const signals = fakeSignals();
    const exit = jest.fn<void, [number]>();
    const logger = fakeLogger();

    const trigger = registerGracefulShutdown({ logger, handlers, signals, exit });
    signals.fire('SIGTERM');
    await trigger(); // ensure pending promise completes
    // Allow scheduled microtasks to settle.
    await new Promise<void>((r) => setImmediate(r));

    expect(calls).toEqual(['a', 'b']);
    expect(exit).toHaveBeenCalledWith(0);
    expect(logger.records.find((r) => r.msg === 'graceful shutdown complete')).toBeTruthy();
  });

  it('SIGINT triggers the same procedure', async () => {
    const calls: string[] = [];
    const signals = fakeSignals();
    const exit = jest.fn<void, [number]>();
    registerGracefulShutdown({
      logger: fakeLogger(),
      handlers: [
        () => {
          calls.push('only');
        },
      ],
      signals,
      exit,
    });
    signals.fire('SIGINT');
    await new Promise<void>((r) => setImmediate(r));
    expect(calls).toEqual(['only']);
    expect(exit).toHaveBeenCalledWith(0);
  });

  it('ignores a duplicate signal during shutdown (idempotent)', async () => {
    const calls: number[] = [];
    let release: () => void = () => {};
    const signals = fakeSignals();
    const exit = jest.fn<void, [number]>();
    const logger = fakeLogger();
    registerGracefulShutdown({
      logger,
      handlers: [
        () =>
          new Promise<void>((r) => {
            calls.push(1);
            release = r;
          }),
      ],
      signals,
      exit,
    });

    signals.fire('SIGTERM');
    // Second signal while the first is in flight should be a warning, not a re-run.
    signals.fire('SIGTERM');
    release();
    await new Promise<void>((r) => setImmediate(r));

    expect(calls).toEqual([1]);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(
      logger.records.some(
        (r) => r.level === 'warn' && r.msg.includes('shutdown already in progress'),
      ),
    ).toBe(true);
  });

  it('continues past a failing handler and logs the error', async () => {
    const seen: string[] = [];
    const signals = fakeSignals();
    const exit = jest.fn<void, [number]>();
    const logger = fakeLogger();
    registerGracefulShutdown({
      logger,
      handlers: [
        () => {
          throw new Error('first failed');
        },
        () => {
          seen.push('second ran');
        },
      ],
      signals,
      exit,
    });
    signals.fire('SIGTERM');
    await new Promise<void>((r) => setImmediate(r));

    expect(seen).toEqual(['second ran']);
    expect(exit).toHaveBeenCalledWith(0);
    expect(logger.records.find((r) => r.msg === 'shutdown handler failed')).toBeTruthy();
  });

  it('hard-exits on shutdown timeout', async () => {
    jest.useFakeTimers();
    try {
      const signals = fakeSignals();
      const exit = jest.fn<void, [number]>();
      registerGracefulShutdown({
        logger: fakeLogger(),
        handlers: [() => new Promise<void>(() => {})], // never resolves
        signals,
        exit,
        timeoutMs: 50,
      });
      signals.fire('SIGTERM');
      jest.advanceTimersByTime(50);
      expect(exit).toHaveBeenCalledWith(1);
    } finally {
      jest.useRealTimers();
    }
  });
});

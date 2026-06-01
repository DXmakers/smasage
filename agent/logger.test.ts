import { formatLogLine, createLogger } from './logger';

const FROZEN = new Date('2026-05-29T10:00:00.000Z');

describe('formatLogLine', () => {
  it('emits a JSON record with the standard fields', () => {
    const line = formatLogLine({
      level: 'info',
      component: 'notification-monitor',
      msg: 'started',
      now: FROZEN,
    });
    expect(JSON.parse(line)).toEqual({
      ts: '2026-05-29T10:00:00.000Z',
      level: 'info',
      component: 'notification-monitor',
      msg: 'started',
    });
  });

  it('merges arbitrary meta fields onto the record', () => {
    const line = formatLogLine({
      level: 'warn',
      component: 'notification-monitor',
      msg: 'goal fell behind',
      meta: { userId: 'u-1', shortfall: 42.5 },
      now: FROZEN,
    });
    expect(JSON.parse(line)).toEqual({
      ts: '2026-05-29T10:00:00.000Z',
      level: 'warn',
      component: 'notification-monitor',
      msg: 'goal fell behind',
      userId: 'u-1',
      shortfall: 42.5,
    });
  });

  it("never lets meta overwrite a reserved field", () => {
    const line = formatLogLine({
      level: 'info',
      component: 'notification-monitor',
      msg: 'hi',
      meta: { level: 'pwned', msg: 'pwned', ts: 'pwned' },
      now: FROZEN,
    });
    const record = JSON.parse(line);
    expect(record.level).toBe('info');
    expect(record.msg).toBe('hi');
    expect(record.ts).toBe('2026-05-29T10:00:00.000Z');
  });

  it('serialises an Error in meta into a plain object', () => {
    const err = new Error('boom');
    const line = formatLogLine({
      level: 'error',
      component: 'notification-monitor',
      msg: 'failed',
      meta: { err },
      now: FROZEN,
    });
    const record = JSON.parse(line);
    expect(record.err).toEqual({
      name: 'Error',
      message: 'boom',
      stack: expect.any(String),
    });
  });
});

describe('createLogger', () => {
  it('writes one line per call with the right level', () => {
    const written: string[] = [];
    const logger = createLogger('notification-monitor', {
      write: (line) => written.push(line),
      now: () => FROZEN,
    });

    logger.info('listening', { port: 3001 });
    logger.warn('client missing', { userId: 'u-1' });
    logger.error('boom');

    expect(written).toHaveLength(3);
    expect(JSON.parse(written[0])).toMatchObject({ level: 'info', port: 3001 });
    expect(JSON.parse(written[1])).toMatchObject({ level: 'warn', userId: 'u-1' });
    expect(JSON.parse(written[2])).toMatchObject({ level: 'error', msg: 'boom' });
  });

  it('child() namespaces the component', () => {
    const written: string[] = [];
    const root = createLogger('agent', {
      write: (line) => written.push(line),
      now: () => FROZEN,
    });
    root.child('notifications').info('ready');
    expect(JSON.parse(written[0]).component).toBe('agent.notifications');
  });
});

import { Server } from 'http';
import { NotificationServer } from '../websocket-server';
import { WebSocket } from 'ws';

// Mock the ws module to control client behavior
jest.mock('ws', () => {
  return {
    WebSocketServer: jest.fn().mockImplementation(() => {
      return {
        on: jest.fn(),
        close: jest.fn(),
      };
    }),
    WebSocket: jest.fn().mockImplementation(() => {
      return {
        readyState: 1,
        send: jest.fn(),
        close: jest.fn(),
        on: jest.fn(),
      };
    }),
    OPEN: 1,
  };
});

describe('NotificationServer payload validation', () => {
  let server: NotificationServer;
  let httpServer: Server;
  const mockWs = new WebSocket();

  beforeEach(() => {
    httpServer = new Server();
    server = new NotificationServer(httpServer, { allowedOrigins: [] });
    // Spy on private sendMessage via any cast
    // @ts-ignore
    jest.spyOn(server as any, 'sendMessage');
    // Simulate a connected client
    // @ts-ignore
    server['clients'].set('testUser', {
      ws: mockWs,
      userId: 'testUser',
      connectedAt: new Date(),
      rateLimiter: { checkLimit: () => null },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('rejects non‑JSON payload', () => {
    const badData = Buffer.from('not a json');
    // @ts-ignore private method call
    server['handleMessage']('testUser', badData);
    // @ts-ignore
    expect((server as any).sendMessage).toHaveBeenCalledWith('testUser', expect.objectContaining({ type: 'error' }));
  });

  test('rejects JSON missing type field', () => {
    const missingType = Buffer.from(JSON.stringify({ payload: {} }));
    // @ts-ignore
    server['handleMessage']('testUser', missingType);
    // @ts-ignore
    expect((server as any).sendMessage).toHaveBeenCalledWith('testUser', expect.objectContaining({ type: 'error' }));
  });
});

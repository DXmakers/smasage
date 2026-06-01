import http from 'http';
import { NotificationServer } from '../websocket-server.js';
import WebSocket, { Server as WS } from 'ws';

// Helper to create a mock HTTP server
function createHttpServer(): http.Server {
  const server = http.createServer();
  server.listen(0);
  return server;
}

describe('NotificationServer WebSocket authentication', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-secret-key' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('rejects connection without Authorization header', (done) => {
    const httpServer = createHttpServer();
    const ns = new NotificationServer(httpServer, { allowedOrigins: [] });
    const wsPort = (httpServer.address() as any).port;
    const ws = new WebSocket(`ws://localhost:${wsPort}?userId=user123`);
    ws.on('error', (err) => {
      // Server should close with code 4000 (custom close) -> ws error
      expect(err).toBeDefined();
      httpServer.close();
      done();
    });
    ws.on('open', () => {
      // Should not open
    });
  });

  test('accepts connection with correct Bearer token', (done) => {
    const httpServer = createHttpServer();
    const ns = new NotificationServer(httpServer, { allowedOrigins: [] });
    const wsPort = (httpServer.address() as any).port;
    const ws = new WebSocket(`ws://localhost:${wsPort}?userId=user123`, {
      headers: { Authorization: 'Bearer test-secret-key' },
    });
    ws.on('open', () => {
      // Connection succeeded
      ws.close();
      httpServer.close();
      done();
    });
    ws.on('error', (err) => {
      // Should not error
      httpServer.close();
      done(err);
    });
  });
});

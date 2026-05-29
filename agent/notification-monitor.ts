/**
 * Notification Monitor Service
 * Runs the WebSocket server and monitors user goals for proactive notifications.
 *
 * Wiring (Issues #145, #146, #147):
 *   - `loadAgentEnv` validates configuration up-front with a single multi-line
 *     error instead of an ad-hoc `process.env.X` check.
 *   - `createLogger` emits structured JSON log lines so operators can ingest
 *     them without parsing free-form strings.
 *   - `registerGracefulShutdown` collapses the previously-duplicated SIGTERM
 *     and SIGINT blocks into a single, idempotent, timeout-capped handler.
 */

import { createServer } from 'http';
import { NotificationServer } from './websocket-server.js';
import { type GoalProjection } from './goal-projection.js';
import { type UserGoal } from './notification-service.js';
import { generateProactiveMessage } from './agent-service.js';
import { loadAgentEnv } from './env.js';
import { createLogger } from './logger.js';
import { registerGracefulShutdown } from './graceful-shutdown.js';

const env = loadAgentEnv();
const log = createLogger('notification-monitor');

// Create HTTP server for WebSocket
const httpServer = createServer();
const notificationServer = new NotificationServer(httpServer);

/**
 * Trigger a proactive message if goal status warrants it
 */
async function triggerProactiveMessage(
  goal: UserGoal,
  projection: GoalProjection
): Promise<void> {
  if (projection.status !== 'Falling Behind') {
    return;
  }

  // Generate AI-powered message
  const message = await generateProactiveMessage(
    {
      userId: goal.userId,
      goalName: 'Financial Goal',
      currentBalance: goal.currentBalance,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate.toLocaleDateString(),
      projectedValue: projection.projectedValue,
      shortfall: projection.shortfall,
      monthlyContribution: goal.monthlyContribution,
      requiredIncrease: Math.max(
        0,
        projection.requiredMonthlyContribution - goal.monthlyContribution
      ),
    },
    env.GEMINI_API_KEY
  );

  // Send notification through WebSocket
  const client = (notificationServer as unknown as { clients?: Map<string, unknown> }).clients?.get(goal.userId);
  if (client) {
    notificationServer.broadcastMessage({
      type: 'agent-message',
      userId: goal.userId,
      payload: {
        sender: 'agent',
        text: message,
        timestamp: new Date().toISOString(),
        proactive: true,
        projection: {
          status: projection.status,
          projectedValue: projection.projectedValue,
          shortfall: projection.shortfall,
          requiredMonthlyContribution: projection.requiredMonthlyContribution,
        },
      },
    });
    log.info('proactive message sent', { userId: goal.userId, shortfall: projection.shortfall });
  } else {
    log.warn('proactive message dropped: no active client', { userId: goal.userId });
  }
}

/**
 * Start monitoring service
 */
function startMonitoring(): void {
  httpServer.listen(env.NOTIFICATION_PORT, () => {
    log.info('notification server listening', { port: env.NOTIFICATION_PORT });
  });

  registerGracefulShutdown({
    logger: log,
    handlers: [
      async () => {
        log.info('shutting down websocket server');
        notificationServer.shutdown();
      },
      () =>
        new Promise<void>((resolve) => {
          httpServer.close(() => {
            log.info('http server closed');
            resolve();
          });
        }),
    ],
  });
}

// Start the service
startMonitoring();
log.info('notification monitor ready');

// Export for tests / smoke verification.
export { triggerProactiveMessage };

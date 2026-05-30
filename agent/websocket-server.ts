/**
 * WebSocket Server for Real-Time Notifications
 * Handles client connections and broadcasts proactive goal status notifications
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { ProactiveNotification, monitorUserGoals, UserGoal } from './notification-service.js';

interface ActiveClient {
  ws: WebSocket;
  userId: string;
  connectedAt: Date;
}

/** Raw goal payload received over WebSocket (before validation). */
interface GoalPayloadInput {
  currentBalance?: unknown;
  targetAmount?: unknown;
  targetDate?: unknown;
  expectedAPY?: unknown;
  monthlyContribution?: unknown;
}

export class NotificationServer {
  private wss: WebSocketServer;
  private clients: Map<string, ActiveClient> = new Map();
  private userGoals: Map<string, UserGoal> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor(httpServer: Server) {
    this.wss = new WebSocketServer({ server: httpServer });
    this.setupConnectionHandlers();
  }

  /**
   * Setup WebSocket connection handlers
   */
  private setupConnectionHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const userId = extractUserIdFromUrl(req.url || '');

      if (!userId) {
        ws.close(4000, 'Missing userId');
        return;
      }

      const client: ActiveClient = {
        ws,
        userId,
        connectedAt: new Date(),
      };

      this.clients.set(userId, client);
      console.log(`[WS] Client connected: ${userId}`);

      // Send confirmation message
      this.sendMessage(userId, {
        type: 'connected',
        payload: { userId, timestamp: new Date().toISOString() },
      });

      ws.on('message', (data: Buffer) => this.handleMessage(userId, data));
      ws.on('close', () => this.handleClientClose(userId));
      ws.on('error', (error) => this.handleClientError(userId, error));
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(userId: string, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'register-goal':
          this.registerUserGoal(userId, message.payload);
          break;
        case 'update-goal':
          this.updateUserGoal(userId, message.payload);
          break;
        case 'ping':
          this.sendMessage(userId, { type: 'pong', timestamp: new Date().toISOString() });
          break;
        default:
          console.log(`[WS] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`[WS] Error parsing message from ${userId}:`, error);
    }
  }

  /**
   * Validate a raw goal payload and return error messages.
   * Accepts unknown types from JSON.parse and validates them safely.
   */
  private validateGoalPayload(
    data: GoalPayloadInput,
    requireAll: boolean
  ): string[] {
    const errors: string[] = [];

    if (requireAll || data.currentBalance !== undefined) {
      const val = data.currentBalance;
      if (typeof val !== 'number' || !Number.isFinite(val) || val < 0) {
        errors.push('currentBalance must be a non-negative finite number');
      }
    }

    if (requireAll || data.targetAmount !== undefined) {
      const val = data.targetAmount;
      if (typeof val !== 'number' || !Number.isFinite(val) || val <= 0) {
        errors.push('targetAmount must be a positive finite number');
      }
    }

    if (requireAll || data.targetDate !== undefined) {
      const val = data.targetDate;
      if (typeof val !== 'string' || val.trim() === '') {
        errors.push('targetDate must be a non-empty date string');
      } else {
        const date = new Date(val);
        if (isNaN(date.getTime())) {
          errors.push('targetDate must be a valid date string');
        }
      }
    }

    if (requireAll || data.expectedAPY !== undefined) {
      const val = data.expectedAPY;
      if (typeof val !== 'number' || !Number.isFinite(val) || val < 0 || val > 100) {
        errors.push('expectedAPY must be a finite number between 0 and 100');
      }
    }

    if (requireAll || data.monthlyContribution !== undefined) {
      const val = data.monthlyContribution;
      if (typeof val !== 'number' || !Number.isFinite(val) || val < 0) {
        errors.push('monthlyContribution must be a non-negative finite number');
      }
    }

    return errors;
  }

  /**
   * Register a user's goal for monitoring
   */
  private registerUserGoal(userId: string, goalData: GoalPayloadInput): void {
    const errors = this.validateGoalPayload(goalData, true);
    if (errors.length > 0) {
      this.sendMessage(userId, {
        type: 'error',
        payload: { message: `Invalid goal payload: ${errors.join('; ')}` },
      });
      return;
    }

    const goal: UserGoal = {
      userId,
      currentBalance: goalData.currentBalance as number,
      targetAmount: goalData.targetAmount as number,
      targetDate: new Date(goalData.targetDate as string),
      expectedAPY: (goalData.expectedAPY as number) ?? 8.5,
      monthlyContribution: (goalData.monthlyContribution as number) ?? 0,
      hasNotified: false,
    };

    this.userGoals.set(userId, goal);
    console.log(`[Service] Goal registered for user: ${userId}`);

    // Start monitoring if not already started
    if (!this.monitoringInterval) {
      this.startMonitoring();
    }
  }

  /**
   * Update an existing user goal
   */
  private updateUserGoal(userId: string, goalData: GoalPayloadInput): void {
    const existingGoal = this.userGoals.get(userId);
    if (!existingGoal) {
      console.warn(`[Service] No existing goal for user: ${userId}`);
      this.sendMessage(userId, {
        type: 'error',
        payload: { message: 'No existing goal found for update' },
      });
      return;
    }

    const errors = this.validateGoalPayload(goalData, false);
    if (errors.length > 0) {
      this.sendMessage(userId, {
        type: 'error',
        payload: { message: `Invalid goal payload: ${errors.join('; ')}` },
      });
      return;
    }

    const updatedGoal: UserGoal = {
      ...existingGoal,
      currentBalance: (goalData.currentBalance as number) ?? existingGoal.currentBalance,
      targetAmount: (goalData.targetAmount as number) ?? existingGoal.targetAmount,
      targetDate: goalData.targetDate
        ? new Date(goalData.targetDate as string)
        : existingGoal.targetDate,
      expectedAPY: (goalData.expectedAPY as number) ?? existingGoal.expectedAPY,
      monthlyContribution: (goalData.monthlyContribution as number) ?? existingGoal.monthlyContribution,
      hasNotified: false,
    };

    this.userGoals.set(userId, updatedGoal);
    console.log(`[Service] Goal updated for user: ${userId}`);
  }

  /**
   * Start periodic monitoring of all user goals
   */
  private startMonitoring(): void {
    // Check every 5 minutes
    this.monitoringInterval = setInterval(() => {
      const goals = Array.from(this.userGoals.values());
      if (goals.length === 0) return;

      const notifications = monitorUserGoals(goals);

      for (const notification of notifications) {
        this.sendNotification(notification);
      }
    }, 5 * 60 * 1000); // 5 minutes

    console.log('[Service] Monitoring started for user goals');
  }

  /**
   * Send notification to user
   */
  private sendNotification(notification: ProactiveNotification): void {
    this.sendMessage(notification.userId, {
      type: 'notification',
      payload: notification,
    });

    console.log(
      `[Notification] Sent to user ${notification.userId}: ${notification.type}`
    );
  }

  /**
   * Send message to specific client
   */
  private sendMessage(
    userId: string,
    message: Record<string, unknown>
  ): void {
    const client = this.clients.get(userId);
    if (!client) {
      console.warn(`[WS] Client not connected: ${userId}`);
      return;
    }

    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all connected clients
   */
  public broadcastMessage(message: Record<string, unknown>): void {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Handle client disconnect
   */
  private handleClientClose(userId: string): void {
    const client = this.clients.get(userId);
    if (client) {
      this.clients.delete(userId);
      console.log(`[WS] Client disconnected: ${userId}`);
    }

    // Stop monitoring if no more clients
    if (this.clients.size === 0 && this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[Service] Monitoring stopped (no active clients)');
    }
  }

  /**
   * Handle client error
   */
  private handleClientError(userId: string, error: Error): void {
    console.error(`[WS] Error for user ${userId}:`, error);
  }

  /**
   * Shutdown the server gracefully
   */
  public shutdown(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.clients.forEach((client) => {
      client.ws.close(1000, 'Server shutting down');
    });

    this.wss.close(() => {
      console.log('[Server] WebSocket server shut down');
    });
  }

  /**
   * Get connected clients count
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get monitored goals count
   */
  public getMonitoredGoalsCount(): number {
    return this.userGoals.size;
  }
}

/**
 * Extract userId from WebSocket URL query param
 * Expected format: ws://localhost:3001?userId=user123
 */
function extractUserIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url, 'http://localhost');
    return urlObj.searchParams.get('userId');
  } catch {
    return null;
  }
}

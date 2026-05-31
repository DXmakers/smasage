/**
 * WebSocket Server for Real-Time Notifications
 * Handles client connections and broadcasts proactive goal status notifications
 */

import { WebSocketServer, WebSocket } from "ws";
import { Server, IncomingMessage } from "http";
import {
  ProactiveNotification,
  monitorUserGoals,
  UserGoal,
} from "./notification-service.js";
import {
  DEFAULT_MAX_WS_MESSAGE_BYTES,
  wsMessageSizeError,
  RateLimiter,
  DEFAULT_MAX_MESSAGES_PER_SECOND,
  DEFAULT_RATE_LIMIT_WINDOW_MS,
} from "./websocket-limits.js";
import { projectGoalStatus, type GoalProjection } from "./goal-projection.js";

interface ActiveClient {
  ws: WebSocket;
  userId: string;
  connectedAt: Date;
  rateLimiter: RateLimiter;
}

/**
 * Options for constructing a NotificationServer.
 * All fields are optional — omitting them applies safe defaults.
 */
export interface NotificationServerOptions {
  maxMessageBytes?: number;
  /**
   * HTTP Origins allowed to open a WebSocket connection.
   * An empty array (the default) accepts all origins — use only in dev/test.
   * Non-browser clients that send no Origin header are always accepted.
   */
  allowedOrigins?: string[];
  /**
   * Optional async callback invoked when a monitored goal status is
   * "Falling Behind". When provided, replaces the built-in template
   * notification with an AI-generated message for that goal.
   */
  aiTrigger?: (goal: UserGoal, projection: GoalProjection) => Promise<void>;
  /**
   * Maximum messages per client per second for rate limiting.
   * Defaults to DEFAULT_MAX_MESSAGES_PER_SECOND (10).
   */
  maxMessagesPerSecond?: number;
  /**
   * Rate limit window in milliseconds.
   * Defaults to DEFAULT_RATE_LIMIT_WINDOW_MS (1000).
   */
  rateLimitWindowMs?: number;
}

/** Raw goal payload received over WebSocket (before validation). */
interface GoalPayloadInput {
  currentBalance?: unknown;
  targetAmount?: unknown;
  targetDate?: unknown;
  expectedAPY?: unknown;
  monthlyContribution?: unknown;
}

/** Parsed and validated goal payload with proper types. */
interface ValidatedGoalData {
  currentBalance: number;
  targetAmount: number;
  targetDate: string;
  expectedAPY: number;
  monthlyContribution: number;
}

export class NotificationServer {
  private wss: WebSocketServer;
  private clients: Map<string, ActiveClient> = new Map();
  private userGoals: Map<string, UserGoal> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly maxMessageBytes: number;
  private readonly allowedOrigins: string[];
  private readonly aiTrigger:
    | ((goal: UserGoal, projection: GoalProjection) => Promise<void>)
    | undefined;
  private readonly maxMessagesPerSecond: number;
  private readonly rateLimitWindowMs: number;

  constructor(httpServer: Server, options: NotificationServerOptions = {}) {
    const {
      maxMessageBytes = DEFAULT_MAX_WS_MESSAGE_BYTES,
      allowedOrigins = [],
      aiTrigger,
      maxMessagesPerSecond = DEFAULT_MAX_MESSAGES_PER_SECOND,
      rateLimitWindowMs = DEFAULT_RATE_LIMIT_WINDOW_MS,
    } = options;
    this.maxMessageBytes = maxMessageBytes;
    this.allowedOrigins = allowedOrigins;
    this.aiTrigger = aiTrigger;
    this.maxMessagesPerSecond = maxMessagesPerSecond;
    this.rateLimitWindowMs = rateLimitWindowMs;
    this.wss = new WebSocketServer({
      server: httpServer,
      verifyClient: (info: {
        origin: string;
        secure: boolean;
        req: IncomingMessage;
      }) => {
        // info.origin is empty string '' for non-browser clients in ws@8
        const origin = info.origin === "" ? undefined : info.origin;
        return isOriginAllowed(origin, this.allowedOrigins);
      },
    });
    this.setupConnectionHandlers();
  }

  /**
   * Setup WebSocket connection handlers
   */
  private setupConnectionHandlers(): void {
    this.wss.on("connection", (ws: WebSocket, req) => {
      const rawUserId = extractUserIdFromUrl(req.url || "");

      if (!rawUserId || !validateUserId(rawUserId)) {
        ws.close(4000, "Missing or invalid userId");
        return;
      }

      if (this.clients.has(rawUserId)) {
        ws.close(4001, "User already connected");
        return;
      }

      const userId = rawUserId;
      const client: ActiveClient = {
        ws,
        userId,
        connectedAt: new Date(),
        rateLimiter: new RateLimiter(
          this.maxMessagesPerSecond,
          this.rateLimitWindowMs,
        ),
      };

      this.clients.set(userId, client);
      console.log(`[WS] Client connected: ${userId}`);

      // Send confirmation message
      this.sendMessage(userId, {
        type: "connected",
        payload: { userId, timestamp: new Date().toISOString() },
      });

      ws.on("message", (data: Buffer) => this.handleMessage(userId, data));
      ws.on("close", () => this.handleClientClose(userId));
      ws.on("error", (error) => this.handleClientError(userId, error));
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(userId: string, data: Buffer): void {
    const client = this.clients.get(userId);
    if (!client) {
      console.warn(`[WS] Client not found: ${userId}`);
      return;
    }

    // Check rate limit
    const rateLimitError = client.rateLimiter.checkLimit();
    if (rateLimitError !== null) {
      console.warn(`[WS] Rate limit exceeded for ${userId}: ${rateLimitError}`);
      this.sendMessage(userId, {
        type: "error",
        payload: { message: rateLimitError },
      });
      return;
    }

    const sizeError = wsMessageSizeError(data.byteLength, this.maxMessageBytes);
    if (sizeError !== null) {
      console.warn(
        `[WS] Rejected oversized message from ${userId}: ${sizeError}`,
      );
      this.sendMessage(userId, {
        type: "error",
        payload: { message: sizeError },
      });
      return;
    }

    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case "register-goal":
          this.registerUserGoal(userId, message.payload);
          break;
        case "update-goal":
          this.updateUserGoal(userId, message.payload);
          break;
        case "ping":
          this.sendMessage(userId, {
            type: "pong",
            timestamp: new Date().toISOString(),
          });
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
    requireAll: boolean,
  ): string[] {
    const errors: string[] = [];

    if (requireAll || data.currentBalance !== undefined) {
      const val = data.currentBalance;
      if (typeof val !== "number" || !Number.isFinite(val) || val < 0) {
        errors.push("currentBalance must be a non-negative finite number");
      }
    }

    if (requireAll || data.targetAmount !== undefined) {
      const val = data.targetAmount;
      if (typeof val !== "number" || !Number.isFinite(val) || val <= 0) {
        errors.push("targetAmount must be a positive finite number");
      }
    }

    if (requireAll || data.targetDate !== undefined) {
      const val = data.targetDate;
      if (typeof val !== "string" || val.trim() === "") {
        errors.push("targetDate must be a non-empty date string");
      } else {
        const date = new Date(val);
        if (isNaN(date.getTime())) {
          errors.push("targetDate must be a valid date string");
        }
      }
    }

    if (requireAll || data.expectedAPY !== undefined) {
      const val = data.expectedAPY;
      if (
        typeof val !== "number" ||
        !Number.isFinite(val) ||
        val < 0 ||
        val > 100
      ) {
        errors.push("expectedAPY must be a finite number between 0 and 100");
      }
    }

    if (requireAll || data.monthlyContribution !== undefined) {
      const val = data.monthlyContribution;
      if (typeof val !== "number" || !Number.isFinite(val) || val < 0) {
        errors.push("monthlyContribution must be a non-negative finite number");
      }
    }

    return errors;
  }

  /**
   * Parse a validated goal payload into a typed object without `as` casts.
   * Caller must ensure `validateGoalPayload` passed first.
   */
  private parseValidatedGoal(
    data: GoalPayloadInput,
    fallback: Partial<ValidatedGoalData>,
  ): ValidatedGoalData {
    return {
      currentBalance:
        typeof data.currentBalance === "number"
          ? data.currentBalance
          : fallback.currentBalance!,
      targetAmount:
        typeof data.targetAmount === "number"
          ? data.targetAmount
          : fallback.targetAmount!,
      targetDate:
        typeof data.targetDate === "string" && data.targetDate.trim() !== ""
          ? data.targetDate
          : fallback.targetDate!,
      expectedAPY:
        typeof data.expectedAPY === "number"
          ? data.expectedAPY
          : fallback.expectedAPY!,
      monthlyContribution:
        typeof data.monthlyContribution === "number"
          ? data.monthlyContribution
          : fallback.monthlyContribution!,
    };
  }

  /**
   * Register a user's goal for monitoring
   */
  private registerUserGoal(userId: string, goalData: GoalPayloadInput): void {
    const errors = this.validateGoalPayload(goalData, true);
    if (errors.length > 0) {
      this.sendMessage(userId, {
        type: "error",
        payload: { message: `Invalid goal payload: ${errors.join("; ")}` },
      });
      return;
    }

    const parsed = this.parseValidatedGoal(goalData, {
      currentBalance: 0,
      targetAmount: 0,
      targetDate: "",
      expectedAPY: 8.5,
      monthlyContribution: 0,
    });

    const goal: UserGoal = {
      userId,
      currentBalance: parsed.currentBalance,
      targetAmount: parsed.targetAmount,
      targetDate: new Date(parsed.targetDate),
      expectedAPY: parsed.expectedAPY,
      monthlyContribution: parsed.monthlyContribution,
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
        type: "error",
        payload: { message: "No existing goal found for update" },
      });
      return;
    }

    const errors = this.validateGoalPayload(goalData, false);
    if (errors.length > 0) {
      this.sendMessage(userId, {
        type: "error",
        payload: { message: `Invalid goal payload: ${errors.join("; ")}` },
      });
      return;
    }

    const parsed = this.parseValidatedGoal(goalData, {
      currentBalance: existingGoal.currentBalance,
      targetAmount: existingGoal.targetAmount,
      targetDate: existingGoal.targetDate.toISOString(),
      expectedAPY: existingGoal.expectedAPY,
      monthlyContribution: existingGoal.monthlyContribution,
    });

    const updatedGoal: UserGoal = {
      ...existingGoal,
      currentBalance: parsed.currentBalance,
      targetAmount: parsed.targetAmount,
      targetDate: new Date(parsed.targetDate),
      expectedAPY: parsed.expectedAPY,
      monthlyContribution: parsed.monthlyContribution,
      hasNotified: false,
    };

    this.userGoals.set(userId, updatedGoal);
    console.log(`[Service] Goal updated for user: ${userId}`);
  }

  /**
   * Start periodic monitoring of all user goals.
   * When an aiTrigger is configured, falling-behind goals receive an AI-generated
   * message. Otherwise the built-in template notification is used as a fallback.
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(
      () => {
        const goals = Array.from(this.userGoals.values());
        if (goals.length === 0) return;

        if (this.aiTrigger !== undefined) {
          // AI path — check each goal individually and fire the async trigger
          for (const goal of goals) {
            if (goal.hasNotified) continue;
            const projection = projectGoalStatus(
              goal.currentBalance,
              goal.targetAmount,
              goal.targetDate,
              goal.expectedAPY,
              goal.monthlyContribution,
            );
            if (projection.status === "Falling Behind") {
              // Set flag before the async call to prevent re-entry on next tick
              goal.hasNotified = true;
              void this.aiTrigger(goal, projection).catch((err) => {
                console.error(
                  "[Service] aiTrigger failed for user",
                  goal.userId,
                  err,
                );
              });
            }
          }
        } else {
          // Template fallback path
          const notifications = monitorUserGoals(goals);
          for (const notification of notifications) {
            this.sendNotification(notification);
          }
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes

    console.log("[Service] Monitoring started for user goals");
  }

  /**
   * Send notification to user
   */
  private sendNotification(notification: ProactiveNotification): void {
    this.sendMessage(notification.userId, {
      type: "notification",
      payload: notification,
    });

    console.log(
      `[Notification] Sent to user ${notification.userId}: ${notification.type}`,
    );
  }

  /**
   * Send message to a specific connected client.
   * Logs a warning when the client is not connected or the socket is not open.
   */
  public sendMessage(userId: string, message: Record<string, unknown>): void {
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
      console.log("[Service] Monitoring stopped (no active clients)");
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
      client.ws.close(1000, "Server shutting down");
    });

    this.wss.close(() => {
      console.log("[Server] WebSocket server shut down");
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
    const urlObj = new URL(url, "http://localhost");
    return urlObj.searchParams.get("userId");
  } catch {
    return null;
  }
}

/**
 * Validate a userId extracted from the WebSocket URL.
 * Rejects empty / whitespace-only strings, strings longer than 128 characters,
 * and strings containing ASCII control characters (codepoints < 0x20 or 0x7F).
 */
export function validateUserId(userId: string): boolean {
  if (userId.trim() === "" || userId.length > 128) return false;
  for (let i = 0; i < userId.length; i++) {
    const cp = userId.charCodeAt(i);
    if (cp < 0x20 || cp === 0x7f) return false;
  }
  return true;
}

/**
 * Return true when the request origin is acceptable.
 *
 * - `allowedOrigins` empty → accept all (dev mode / allow-all).
 * - `origin` undefined → accept (non-browser client; no CSRF risk).
 * - Otherwise → exact case-sensitive match required.
 */
export function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: string[],
): boolean {
  if (allowedOrigins.length === 0) return true;
  if (origin === undefined) return true;
  return allowedOrigins.includes(origin);
}

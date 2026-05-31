/**
 * WebSocket Payload Types – Issue #45
 *
 * Defines strict interfaces for every WebSocket message payload and provides
 * type guard helpers so callers can safely narrow `notification.payload`
 * without using `as any` or unsafe casts.
 */

// ---------------------------------------------------------------------------
// Outgoing message payloads (client → server)
// ---------------------------------------------------------------------------

/** Shape of a goal object sent to the server when registering or updating. */
export interface GoalPayload {
  currentBalance: number;
  targetAmount: number;
  targetDate: string;
  monthlyContribution: number;
  expectedAPY: number;
}

/** Wrapper for register-goal messages. */
export interface RegisterGoalMessage {
  type: 'register-goal';
  payload: GoalPayload;
}

/** Wrapper for update-goal messages. */
export interface UpdateGoalMessage {
  type: 'update-goal';
  payload: GoalPayload;
}

/** Wrapper for ping messages. */
export interface PingMessage {
  type: 'ping';
  timestamp: string;
}

/** Union of all outgoing message types. */
export type OutgoingWsMessage = RegisterGoalMessage | UpdateGoalMessage | PingMessage;

// ---------------------------------------------------------------------------
// Incoming payload shapes (server → client)
// ---------------------------------------------------------------------------

/** Payload for `connected` handshake. */
export interface ConnectedPayload {
  userId: string;
  timestamp: string;
}

/** Payload for `error` messages. */
export interface ErrorPayload {
  message: string;
}

/** Payload for `agent-message` notifications. */
export interface AgentMessagePayload {
  sender: 'agent';
  text: string;
  proactive?: boolean;
  timestamp?: string;
  projection?: {
    status: string;
    projectedValue: number;
    shortfall?: number;
    requiredMonthlyContribution?: number;
  };
}

/** Payload for `goal-update` notifications (server-pushed goal status). */
export interface GoalUpdatePayload {
  currentBalance: number;
  targetAmount: number;
  progressPercentage: number;
  status: 'on-track' | 'ahead' | 'falling-behind';
}

/** Payload for proactive notifications (server-pushed status alerts). */
export interface ProactiveNotificationPayload {
  type: 'falling-behind' | 'ahead' | 'on-track';
  userId: string;
  timestamp: string;
  message: string;
  suggestion?: string;
  projection: {
    status: string;
    projectedValue: number;
    shortfall?: number;
    surplus?: number;
    requiredMonthlyContribution?: number;
  };
}

// ---------------------------------------------------------------------------
// Discriminated union of all incoming notifications
// ---------------------------------------------------------------------------

export interface ConnectedNotification {
  type: 'connected';
  userId?: string;
  payload: ConnectedPayload;
  timestamp?: string;
}

export interface ErrorNotification {
  type: 'error';
  userId?: string;
  payload: ErrorPayload;
  timestamp?: string;
}

export interface AgentMessageNotification {
  type: 'agent-message';
  userId?: string;
  payload: AgentMessagePayload;
  timestamp?: string;
}

export interface GoalUpdateNotification {
  type: 'goal-update';
  userId?: string;
  payload: GoalUpdatePayload;
  timestamp?: string;
}

export interface ProactiveNotification {
  type: 'notification';
  userId?: string;
  payload: ProactiveNotificationPayload;
  timestamp?: string;
}

export interface PongNotification {
  type: 'pong';
  userId?: string;
  payload?: undefined;
  timestamp?: string;
}

/**
 * Discriminated union covering every notification type the server can send.
 * Add new variants here as the API evolves.
 */
export type IncomingNotification =
  | ConnectedNotification
  | ErrorNotification
  | AgentMessageNotification
  | GoalUpdateNotification
  | ProactiveNotification
  | PongNotification;

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

/** Narrows a notification to `ConnectedNotification`. */
export function isConnectedNotification(
  n: IncomingNotification
): n is ConnectedNotification {
  return n.type === 'connected';
}

/** Narrows a notification to `ErrorNotification`. */
export function isErrorNotification(
  n: IncomingNotification
): n is ErrorNotification {
  return n.type === 'error';
}

/** Narrows a notification to `AgentMessageNotification`. */
export function isAgentMessageNotification(
  n: IncomingNotification
): n is AgentMessageNotification {
  return n.type === 'agent-message';
}

/** Narrows a notification to `GoalUpdateNotification`. */
export function isGoalUpdateNotification(
  n: IncomingNotification
): n is GoalUpdateNotification {
  return n.type === 'goal-update';
}

/** Narrows a notification to `ProactiveNotification`. */
export function isProactiveNotification(
  n: IncomingNotification
): n is ProactiveNotification {
  return n.type === 'notification';
}

/** Narrows a notification to `PongNotification`. */
export function isPongNotification(
  n: IncomingNotification
): n is PongNotification {
  return n.type === 'pong';
}

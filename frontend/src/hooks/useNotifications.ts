/**
 * useNotifications Hook
 * Manages WebSocket connection to the notification server
 * Handles receiving and processing proactive messages
 */

import { useEffect, useCallback, useRef, useState } from "react";
import {
  WS_URL,
  WS_MAX_RECONNECT_ATTEMPTS,
  WS_MAX_RECONNECT_DELAY_MS,
} from "../config/constants";
import type { IncomingNotification, GoalPayload } from "../types/websocket";

// Re-export so existing imports from this module continue to work.
export type { IncomingNotification } from "../types/websocket";
export type WebSocketConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "offline";

interface UseNotificationsOptions {
  userId: string;
  onNotification?: (notification: IncomingNotification) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function useNotifications(options: UseNotificationsOptions) {
  const { userId, onNotification, onError, enabled = true } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = WS_MAX_RECONNECT_ATTEMPTS;
  // Holds the latest connect function so ws.onclose can schedule a reconnect
  // without closing over a stale reference or creating a circular declaration.
  const connectRef = useRef<() => void>(() => undefined);
  const shouldReconnectRef = useRef(true);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onNotificationRef = useRef(onNotification);
  const onErrorRef = useRef(onError);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<WebSocketConnectionStatus>(enabled ? "connecting" : "offline");

  useEffect(() => {
    onNotificationRef.current = onNotification;
    onErrorRef.current = onError;
  }, [onNotification, onError]);

  const connect = useCallback(() => {
    if (!enabled || !userId) {
      setConnectionStatus("offline");
      return;
    }

    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    shouldReconnectRef.current = true;
    setConnectionStatus(
      reconnectAttemptsRef.current > 0 ? "reconnecting" : "connecting",
    );

    try {
      const wsUrl = `${WS_URL}?userId=${encodeURIComponent(userId)}`;

      console.log("[WS] Connecting to:", wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WS] Connected");
        reconnectAttemptsRef.current = 0;
        setIsConnected(true);
        setConnectionStatus("connected");

        // Send initial registration
        ws.send(
          JSON.stringify({
            type: "ping",
            timestamp: new Date().toISOString(),
          }),
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as IncomingNotification;
          console.log("[WS] Received:", data.type, data);

          onNotificationRef.current?.(data);
        } catch (error) {
          console.error("[WS] Error parsing message:", error);
        }
      };

      ws.onerror = (event) => {
        const error = new Error("WebSocket error");
        console.error("[WS] Error:", error, event);
        onErrorRef.current?.(error);
      };

      ws.onclose = () => {
        console.log("[WS] Disconnected");
        wsRef.current = null;
        setIsConnected(false);

        if (!shouldReconnectRef.current) {
          setConnectionStatus("offline");
          return;
        }

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            WS_MAX_RECONNECT_DELAY_MS,
          );
          reconnectAttemptsRef.current++;
          setConnectionStatus("reconnecting");
          console.log(
            `[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`,
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            if (shouldReconnectRef.current) {
              connectRef.current();
            }
          }, delay);
        } else {
          setConnectionStatus("offline");
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[WS] Connection error:", error);
      setConnectionStatus("offline");
      onErrorRef.current?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [userId, enabled, maxReconnectAttempts]);

  // Keep the ref in sync so onclose always calls the latest version.
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus("offline");
  }, []);

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("[WS] WebSocket not open, message not sent:", message);
    }
  }, []);

  const registerGoal = useCallback(
    (goal: GoalPayload) => {
      sendMessage({
        type: "register-goal",
        payload: goal,
      });
    },
    [sendMessage],
  );

  const updateGoal = useCallback(
    (goal: GoalPayload) => {
      sendMessage({
        type: "update-goal",
        payload: goal,
      });
    },
    [sendMessage],
  );

  useEffect(() => {
    const connectTimer = setTimeout(() => connect(), 0);
    return () => {
      clearTimeout(connectTimer);
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    registerGoal,
    updateGoal,
    disconnect,
  };
}

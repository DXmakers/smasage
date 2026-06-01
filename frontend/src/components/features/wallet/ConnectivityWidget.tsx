"use client";

import { useId, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, Wallet, Wifi } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { WebSocketConnectionStatus } from "../../../hooks/useNotifications";

export type WalletConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "unavailable";

export interface ConnectivityWidgetProps {
  webSocketStatus: WebSocketConnectionStatus;
  walletStatus: WalletConnectionStatus;
  publicKey?: string | null;
}

const webSocketCopy: Record<WebSocketConnectionStatus, string> = {
  connected: "Live",
  connecting: "Connecting",
  reconnecting: "Reconnecting",
  offline: "Offline",
};

const walletCopy: Record<WalletConnectionStatus, string> = {
  connected: "Connected",
  connecting: "Connecting",
  disconnected: "Disconnected",
  unavailable: "Unavailable",
};

function truncatePublicKey(publicKey: string): string {
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`;
}

function getTone(status: WebSocketConnectionStatus | WalletConnectionStatus) {
  if (status === "connected") return "online";
  if (status === "connecting" || status === "reconnecting") return "pending";
  return "offline";
}

function StatusIcon({ tone }: { tone: ReturnType<typeof getTone> }) {
  if (tone === "online") {
    return <CheckCircle2 size={14} aria-hidden="true" />;
  }

  if (tone === "pending") {
    return <Loader2 className="connectivity-widget-spinner" size={14} aria-hidden="true" />;
  }

  return <AlertTriangle size={14} aria-hidden="true" />;
}

export function ConnectivityWidget({
  webSocketStatus,
  walletStatus,
  publicKey,
}: ConnectivityWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const prefersReduced = useReducedMotion();
  const webSocketTone = getTone(webSocketStatus);
  const walletTone = getTone(walletStatus);
  const summary =
    webSocketStatus === "connected" && walletStatus === "connected"
      ? "Systems ready"
      : "Connectivity needs attention";

  // Decorative hover/tap effects are skipped for reduced-motion users.
  // The panel still opens/closes — that's functional, not decorative — but
  // the entrance uses a simple opacity fade instead of y + scale movement.
  const panelInitial = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, y: -8, scale: 0.98 };
  const panelAnimate = prefersReduced
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1 };
  const panelExit = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, y: -8, scale: 0.98 };
  const panelTransition = prefersReduced
    ? { duration: 0.12 }
    : { duration: 0.18, ease: [0.4, 0, 0.2, 1] };

  return (
    <div className="connectivity-widget">
      <motion.button
        type="button"
        className="connectivity-widget-trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`Connectivity status: WebSocket ${webSocketCopy[webSocketStatus]}, wallet ${walletCopy[walletStatus]}`}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
        whileHover={prefersReduced ? undefined : { y: -1 }}
        whileTap={prefersReduced ? undefined : { scale: 0.98 }}
        transition={prefersReduced ? { duration: 0.01 } : { duration: 0.15 }}
      >
        <span className="connectivity-widget-icons" aria-hidden="true">
          <span className={`connectivity-dot connectivity-dot--${webSocketTone}`} />
          <span className={`connectivity-dot connectivity-dot--${walletTone}`} />
        </span>
        <span className="connectivity-widget-summary">{summary}</span>
        <ChevronDown
          className={`connectivity-widget-chevron${isOpen ? " connectivity-widget-chevron--open" : ""}`}
          size={14}
          aria-hidden="true"
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={panelId}
            className="connectivity-widget-panel"
            role="status"
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={panelTransition}
          >
            <div className={`connectivity-widget-row connectivity-widget-row--${webSocketTone}`}>
              <Wifi size={16} aria-hidden="true" />
              <span className="connectivity-widget-label">WebSocket</span>
              <span className="connectivity-widget-value">
                <StatusIcon tone={webSocketTone} />
                {webSocketCopy[webSocketStatus]}
              </span>
            </div>

            <div className={`connectivity-widget-row connectivity-widget-row--${walletTone}`}>
              <Wallet size={16} aria-hidden="true" />
              <span className="connectivity-widget-label">Wallet</span>
              <span className="connectivity-widget-value">
                <StatusIcon tone={walletTone} />
                {publicKey && walletStatus === "connected"
                  ? truncatePublicKey(publicKey)
                  : walletCopy[walletStatus]}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

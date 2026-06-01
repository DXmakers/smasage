"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Bot, CheckCircle2, Send } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface ChatMessage {
  id: number;
  sender: "agent" | "user";
  text: string;
  proactive?: boolean;
  timestamp?: string;
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  placeholder?: string;
  isConnected?: boolean;
}

const connectionCopy = {
  online: "Live",
  offline: "Offline",
} as const;

export function ChatInterface({
  messages,
  isTyping,
  onSendMessage,
  placeholder = "Ask Smasage to adjust goals...",
  isConnected = false,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const trimmedInput = inputValue.trim();
  const prefersReduced = useReducedMotion();

  // Reduced-motion: messages fade in without y/scale movement.
  // Full motion: slide up + scale entrance for each message.
  const messageVariants = useMemo(
    () =>
      prefersReduced
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          }
        : {
            initial: { opacity: 0, y: 12, scale: 0.98 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, scale: 0.98 },
          },
    [prefersReduced],
  );

  const groupedMessages = useMemo(
    () =>
      messages.map((message, index) => {
        const previous = messages[index - 1];
        const next = messages[index + 1];

        return {
          ...message,
          startsGroup: !previous || previous.sender !== message.sender,
          endsGroup: !next || next.sender !== message.sender,
        };
      }),
    [messages],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
  }, [messages, isTyping, prefersReduced]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = trimmedInput;
    if (!trimmed) return;

    onSendMessage(trimmed);
    setInputValue("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <motion.div
          className="agent-avatar"
          aria-hidden="true"
          // Avatar hover scale is decorative — skip for reduced motion.
          whileHover={prefersReduced ? undefined : { scale: 1.05 }}
          transition={prefersReduced ? { duration: 0.01 } : { duration: 0.2 }}
        >
          <Bot size={28} />
        </motion.div>
        <div>
          <h2 className="chat-title">OpenClaw Agent</h2>
          <motion.div
            className={`chat-status${isConnected ? "" : " chat-status--offline"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={prefersReduced ? { duration: 0.01 } : { delay: 0.2 }}
          >
            {isConnected ? (
              <CheckCircle2
                size={12}
                fill="var(--success)"
                color="var(--bg-card)"
                aria-hidden="true"
              />
            ) : (
              <AlertCircle size={12} aria-hidden="true" />
            )}{" "}
            {isConnected ? connectionCopy.online : connectionCopy.offline}
          </motion.div>
        </div>
      </div>

      {!isConnected && (
        <motion.div
          className="chat-connection-alert"
          role="status"
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReduced ? { duration: 0.12 } : { duration: 0.2 }}
        >
          <AlertCircle size={14} aria-hidden="true" />
          <span>Notification service is offline. You can still draft and send local chat messages.</span>
        </motion.div>
      )}

      <div
        className="chat-messages"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence mode="popLayout">
          {groupedMessages.map((msg, index) => (
            <motion.div
              key={msg.id}
              className={[
                "message",
                msg.sender,
                msg.startsGroup ? "message--group-start" : "message--grouped",
                msg.endsGroup ? "message--group-end" : "",
                msg.proactive ? "proactive" : "",
              ].filter(Boolean).join(" ")}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={
                prefersReduced
                  ? { duration: 0.12 }
                  : { duration: 0.3, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }
              }
            >
              {msg.proactive && msg.startsGroup && (
                <motion.div
                  className="proactive-label"
                  initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={prefersReduced ? { duration: 0.12 } : { delay: 0.2 }}
                >
                  <AlertCircle size={12} aria-hidden="true" /> Proactive Nudge
                </motion.div>
              )}
              <div className="message-bubble">
                {msg.text}
                {msg.timestamp && (
                  <time className="message-time" dateTime={msg.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            className="message agent"
            role="status"
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={prefersReduced ? { duration: 0.12 } : { duration: 0.2 }}
          >
            <span className="sr-only">Agent is typing...</span>
            <span className="typing-copy" aria-hidden="true">OpenClaw is typing</span>
            <div className="typing-indicator" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-container">
        <label className="sr-only" htmlFor="chat-input">
          Message OpenClaw Agent
        </label>
        <motion.input
          id="chat-input"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          aria-describedby={!isConnected ? "chat-offline-description" : undefined}
          // Input scale on focus is decorative — skip for reduced motion.
          whileFocus={prefersReduced ? undefined : { scale: 1.01 }}
          transition={prefersReduced ? { duration: 0.01 } : { duration: 0.2 }}
        />
        {!isConnected && (
          <span id="chat-offline-description" className="sr-only">
            The notification service is offline, but local send behavior remains available.
          </span>
        )}
        <motion.button
          type="submit"
          className="send-button"
          aria-label="Send message"
          disabled={!trimmedInput}
          whileHover={prefersReduced ? undefined : { scale: 1.1 }}
          whileTap={prefersReduced ? undefined : { scale: 0.95 }}
          transition={prefersReduced ? { duration: 0.01 } : { duration: 0.15 }}
        >
          <Send size={18} aria-hidden="true" />
        </motion.button>
      </form>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Bot, CheckCircle2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const messageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

export function ChatInterface({
  messages,
  isTyping,
  onSendMessage,
  placeholder = "Ask Smasage to adjust goals...",
  isConnected = false,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
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
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Bot size={28} />
        </motion.div>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.25rem" }}>OpenClaw Agent</h2>
          <motion.div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.85rem",
              color: isConnected ? "var(--success)" : "var(--text-muted)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
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
            {isConnected ? "Online" : "Offline"}
          </motion.div>
        </div>
      </div>

      <div
        className="chat-messages"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              className={`message ${msg.sender}`}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              {msg.proactive && (
                <motion.div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.75rem",
                    color: "var(--accent-primary)",
                    marginBottom: "4px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <AlertCircle size={12} aria-hidden="true" /> Proactive Nudge
                </motion.div>
              )}
              <div className="message-bubble">{msg.text}</div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            className="message agent"
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="sr-only">Agent is typing...</span>
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
        <motion.input
          id="chat-input"
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          aria-label="Message input"
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />
        <motion.button
          type="submit"
          className="send-button"
          aria-label="Send message"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <Send size={18} aria-hidden="true" />
        </motion.button>
      </form>
    </div>
  );
}

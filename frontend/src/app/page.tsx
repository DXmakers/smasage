"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Activity } from "lucide-react";
import { PortfolioStats } from "../components/features/portfolio/PortfolioStats";
import { evaluateGoalStatus } from "../utils/goalProjection";
import PortfolioChart from "../components/features/portfolio/PortfolioChart";
import {
  parseAllocationsFromMessage,
  getDefaultAllocations,
} from "../utils/allocationParser";
import type { AssetAllocation } from "../utils/chartUtils";
import { useNotifications } from "../hooks/useNotifications";
import {
  isAgentMessageNotification,
  isConnectedNotification,
  isErrorNotification,
  isGoalUpdateNotification,
  isProactiveNotification,
  isPongNotification,
} from "../types/websocket";
import { DashboardHeader } from "../components/layout/DashboardHeader";
import type { WalletConnectionStatus } from "../components/features/wallet/ConnectivityWidget";
import { ConnectWalletButton } from "../components/features/wallet/ConnectWalletButton";
import { useFreighter } from "../hooks/useFreighter";
import { ErrorBoundary } from "../components/feedback/ErrorBoundary";
import { EmptyState } from "../components/feedback/EmptyState";
import { ErrorState } from "../components/feedback/ErrorState";
import {
  PortfolioStatsSkeleton,
  GoalTrackerSkeleton,
  PortfolioChartSkeleton,
} from "../components/feedback/SkeletonLoader";
import { WalletModalTest } from "../components/features/wallet/WalletModalTest";
import { ChatInterface } from "../components/features/chat/ChatInterface";
import { goalData, initialMessages } from "../config/mockData";
import toast from 'react-hot-toast';
import { GoalTracker } from "../components/features/portfolio/GoalTracker";
import { GlassPanel } from "../components/layout/GlassPanel";
import { Card, MotionCard } from "../components/primitives";
import { Drawer } from "../components/features/wallet/Drawer";
import { Network, Cpu, ShieldCheck, Zap } from "lucide-react";

import { motion, useReducedMotion } from "framer-motion";
import { makeContainerVariants, makeEntranceVariants } from "../lib/motion";
import type { ChatMessage } from "../types/domain";

export default function Home() {
  const prefersReduced = useReducedMotion();

  const containerVariants = makeContainerVariants(!!prefersReduced);
  const itemVariants = makeEntranceVariants(!!prefersReduced);

  const {
    publicKey,
    connect,
    showInstallModal,
    setShowInstallModal,
    isConnecting,
    isInstalled,
    isCheckingInstallation,
  } = useFreighter();

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);

  const [allocations, setAllocations] = useState<AssetAllocation[]>(
    getDefaultAllocations(),
  );

  const [isLoading, setIsLoading] = useState(true);
  const [chartError, setChartError] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const walletStatus = useMemo<WalletConnectionStatus>(() => {
    if (publicKey) return "connected";
    if (isConnecting || isCheckingInstallation) return "connecting";
    if (!isInstalled) return "unavailable";
    return "disconnected";
  }, [isCheckingInstallation, isConnecting, isInstalled, publicKey]);

  // Calculate goal status and progress using useMemo to avoid cascading renders
  const { goalStatus, progress } = useMemo(() => {
    const result = evaluateGoalStatus(goalData);
    return {
      goalStatus: result.status,
      progress: result.progressPercentage,
    };
  }, []);

  // WebSocket notifications
  const {
    registerGoal,
    isConnected: wsConnected,
    connectionStatus: webSocketStatus,
  } = useNotifications({
    userId: "user-demo-001",
    onNotification: (notification) => {
      if (isConnectedNotification(notification)) {
        console.log("[App] Connected to notification server");
        setIsLoading(false);
      } else if (isAgentMessageNotification(notification)) {
        const { text, proactive, timestamp } = notification.payload;
        const agentMsg: ChatMessage = {
          id: Date.now(),
          sender: "agent",
          text,
          proactive,
          timestamp,
        };
        setMessages((prev: ChatMessage[]) => [...prev, agentMsg]);
        console.log("[App] Agent message received", text);

        // Show toast for proactive messages
        if (proactive) {
          toast('💡 New suggestion from OpenClaw', {
            duration: 5000,
          });
        }

        // Parse allocations if present
        const parsedAllocations = parseAllocationsFromMessage(text);
        if (parsedAllocations) {
          setAllocations(parsedAllocations);
        }
      } else if (isProactiveNotification(notification)) {
        const { message, suggestion } = notification.payload;
        const agentMsg: ChatMessage = {
          id: Date.now(),
          sender: "agent",
          text: suggestion ? `${message}\n\n💡 ${suggestion}` : message,
          proactive: true,
          timestamp: notification.timestamp,
        };
        setMessages((prev: ChatMessage[]) => [...prev, agentMsg]);
        toast('💡 New suggestion from OpenClaw', { duration: 5000 });
      } else if (isGoalUpdateNotification(notification)) {
        console.log("[App] Goal update received", notification.payload);
      } else if (isErrorNotification(notification)) {
        console.error("[App] Server error:", notification.payload.message);
        toast.error(notification.payload.message);
      } else if (isPongNotification(notification)) {
        console.log("[App] Pong received");
      }
    },
    onError: (error) => {
      console.error("[App] WebSocket error:", error);
    },
    enabled: true,
  });

  // Fallback: stop loading after 3s even if WS hasn't connected
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (webSocketStatus === "connected" || webSocketStatus === "offline") {
      const t = setTimeout(() => setIsLoading(false), 0);
      return () => clearTimeout(t);
    }
  }, [webSocketStatus]);

  // Register goal with notification server on mount
  useEffect(() => {
    if (wsConnected) {
      console.log("[App] Registering goal...");
      registerGoal({
        currentBalance: goalData.currentBalance,
        targetAmount: goalData.targetAmount,
        targetDate: goalData.targetDate,
        expectedAPY: goalData.expectedAPY,
        monthlyContribution: goalData.monthlyContribution,
      });
    }
  }, [wsConnected, registerGoal]);

  const handleSendMessage = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };
    setMessages((prev: ChatMessage[]) => [...prev, userMsg]);
    setIsTyping(true);
    console.log("[App] User sent message:", userMsg.text);

    // Mock agent response delay
    setTimeout(() => {
      setIsTyping(false);
      const agentMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: "agent",
        text: "That's a great goal. I'll allocate 60% to Stellar Blend for safe yield, and the rest to Soroswap XLM/USDC LP to accelerate returns. Does that sound good?",
      };
      setMessages((prev: ChatMessage[]) => [...prev, agentMsg]);

      // Parse allocations from agent message
      const parsedAllocations = parseAllocationsFromMessage(agentMsg.text);
      if (parsedAllocations) {
        setAllocations(parsedAllocations);
      }
    }, 1800);
  };

  return (
    <ErrorBoundary fallbackMessage="The dashboard failed to load. Please try again.">
      <>
        <DashboardHeader
          webSocketStatus={webSocketStatus}
          walletStatus={walletStatus}
          publicKey={publicKey}
          onOpenSettings={() => setIsDrawerOpen(true)}
        >
          <ConnectWalletButton
            onClick={connect}
            publicKey={publicKey || undefined}
            isConnecting={isConnecting}
          />
        </DashboardHeader>

        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Technical Details"
        >
          <div className="tech-section">
            <h3 className="tech-section-title">
              <Network size={14} /> Connectivity
            </h3>
            <div className="tech-grid">
              <div className="tech-item">
                <div className="tech-label">Notification Service</div>
                <div className="tech-status">
                  <span className={`status-dot ${wsConnected ? 'online' : ''}`} />
                  {wsConnected ? 'Connected (WebSocket)' : 'Connecting...'}
                </div>
              </div>
              <div className="tech-item">
                <div className="tech-label">Stellar RPC (Soroban)</div>
                <div className="tech-status">
                  <span className="status-dot online" />
                  Mainnet - 🚀 Horizon
                </div>
              </div>
            </div>
          </div>

          <div className="tech-section">
            <h3 className="tech-section-title">
              <ShieldCheck size={14} /> Wallet & Security
            </h3>
            <div className="tech-grid">
              <div className="tech-item">
                <div className="tech-label">Public Key</div>
                <div className="tech-value">{publicKey || 'Not connected'}</div>
              </div>
              <div className="tech-item">
                <div className="tech-label">Provider</div>
                <div className="tech-value">Freighter Wallet</div>
              </div>
            </div>
          </div>

          <div className="tech-section">
            <h3 className="tech-section-title">
              <Cpu size={14} /> AI Context
            </h3>
            <div className="tech-grid">
              <div className="tech-item">
                <div className="tech-label">Active Model</div>
                <div className="tech-value">OpenClaw (Gemini 1.5 Pro)</div>
              </div>
              <div className="tech-item">
                <div className="tech-label">Knowledge Cutoff</div>
                <div className="tech-value">May 2024</div>
              </div>
            </div>
          </div>

          <div className="tech-section">
            <h3 className="tech-section-title">
              <Zap size={14} /> Protocol Routing
            </h3>
            <div className="tech-grid">
              <div className="tech-item">
                <div className="tech-label">Primary Aggregator</div>
                <div className="tech-value">Smasage V1</div>
              </div>
              <div className="tech-item">
                <div className="tech-label">Supported Protocols</div>
                <div className="tech-value">Blend, Soroswap, Aquarius</div>
              </div>
            </div>
          </div>
        </Drawer>

        <WalletModalTest
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
        />
        <motion.main
          className="app-container"
          aria-label="Portfolio dashboard"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Panel - Dashboard */}
          <GlassPanel className="dashboard-portfolio" variants={itemVariants}>
            <motion.h1 variants={itemVariants}>Smasage Portfolio</motion.h1>
            <motion.p
              className="text-muted portfolio-subtitle"
              variants={itemVariants}
            >
              Real-time on-chain tracking • Stellar Mainnet 🚀
            </motion.p>

            {isLoading ? (
              <motion.div variants={itemVariants}>
                <PortfolioStatsSkeleton />
              </motion.div>
            ) : (
              <motion.div className="skeleton-fade-in" variants={itemVariants}>
                <PortfolioStats
                  totalValue={goalData.currentBalance}
                  apy={goalData.expectedAPY}
                  valueChange={12.4}
                />
              </motion.div>
            )}

            {isLoading ? (
              <motion.div variants={itemVariants}>
                <GoalTrackerSkeleton />
              </motion.div>
            ) : (
              <motion.div variants={itemVariants}>
                <GoalTracker
                  goalName="European Vacation"
                  targetAmount={goalData.targetAmount}
                  targetDate={goalData.targetDate}
                  status={goalStatus}
                  progressPercentage={progress}
                  remainingAmount={goalData.targetAmount - goalData.currentBalance}
                />
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <MotionCard className="allocation-list" aria-labelledby="allocation-title">
                <h3 id="allocation-title" className="allocation-title">
                <Activity size={18} aria-hidden="true" /> Active Strategy Routes
              </h3>

              {isLoading ? (
                <PortfolioChartSkeleton />
              ) : chartError ? (
                <ErrorState
                  title="Chart unavailable"
                  message="Strategy allocation data failed to load."
                  onRetry={() => setChartError(false)}
                />
              ) : allocations.length === 0 ? (
                <EmptyState
                  title="No allocations yet"
                  message="Connect your wallet or ask the agent to build a strategy."
                />
              ) : (
                <div className="skeleton-fade-in">
                  <PortfolioChart
                    allocations={allocations}
                    showLegend={true}
                    animated={true}
                  />
                </div>
              )}
              </MotionCard>
            </motion.div>
          </GlassPanel>

          {/* Right Panel - Chat Agent */}
          <GlassPanel className="dashboard-chat" variants={itemVariants}>
            {messages.length === 0 && !isTyping ? (
              <EmptyState
                title="No messages yet"
                message="Ask Smasage to help manage your portfolio or set a goal."
              />
            ) : (
              <ChatInterface
                messages={messages}
                isTyping={isTyping}
                onSendMessage={handleSendMessage}
                isConnected={wsConnected}
              />
            )}
          </GlassPanel>
        </motion.main>
      </>
    </ErrorBoundary>
  );
}

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
import { ConnectWalletButton } from "../components/features/wallet/ConnectWalletButton";
import { useFreighter } from "../hooks/useFreighter";
import { ErrorBoundary } from "../components/feedback/ErrorBoundary";
import {
  PortfolioStatsSkeleton,
  GoalTrackerSkeleton,
  PortfolioChartSkeleton,
} from "../components/feedback/SkeletonLoader";
import { WalletModalTest } from "../components/features/wallet/WalletModalTest";
import { ChatInterface, type ChatMessage } from "../components/features/chat/ChatInterface";
import { goalData, initialMessages } from "../config/mockData";
import toast from 'react-hot-toast';
import { GoalTracker } from "../components/features/portfolio/GoalTracker";
import { GlassPanel } from "../components/layout/GlassPanel";

import { motion, useReducedMotion } from "framer-motion";

export default function Home() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.05 : 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const {
    publicKey,
    connect,
    showInstallModal,
    setShowInstallModal,
    isConnecting
  } = useFreighter();

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);

  const [allocations, setAllocations] = useState<AssetAllocation[]>(
    getDefaultAllocations(),
  );

  const [wsConnected, setWsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate goal status and progress using useMemo to avoid cascading renders
  const { goalStatus, progress } = useMemo(() => {
    const result = evaluateGoalStatus(goalData);
    return {
      goalStatus: result.status,
      progress: result.progressPercentage,
    };
  }, []);

  // WebSocket notifications
  const { registerGoal } = useNotifications({
    userId: "user-demo-001",
    onNotification: (notification) => {
      if (isConnectedNotification(notification)) {
        console.log("[App] Connected to notification server");
        setWsConnected(true);
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
      toast.error('Failed to connect to notification service');
    },
    enabled: true,
  });

  // Fallback: stop loading after 3s even if WS hasn't connected
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

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
        <DashboardHeader wsConnected={wsConnected}>
          <ConnectWalletButton
            onClick={connect}
            publicKey={publicKey || undefined}
            isConnecting={isConnecting}
          />
        </DashboardHeader>

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

            <motion.div className="allocation-list" variants={itemVariants}>
              <h3 className="allocation-title">
                <Activity size={18} aria-hidden="true" /> Active Strategy Routes
              </h3>

              {isLoading ? (
                <PortfolioChartSkeleton />
              ) : (
                <div className="skeleton-fade-in">
                  <PortfolioChart
                    allocations={allocations}
                    width={320}
                    height={280}
                    showLegend={true}
                    animated={true}
                  />
                </div>
              )}
            </motion.div>
          </GlassPanel>

          {/* Right Panel - Chat Agent */}
          <GlassPanel className="dashboard-chat" variants={itemVariants}>
            <ChatInterface
              messages={messages}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
              isConnected={wsConnected}
            />
          </GlassPanel>
        </motion.main>
      </>
    </ErrorBoundary>
  );
}

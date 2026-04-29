"use client"
import React, { useState } from 'react';
import { Target, Activity } from 'lucide-react';
import { PortfolioStats } from './components/PortfolioStats';
import { evaluateGoalStatus, getStatusColor, type GoalData } from '../utils/goalProjection';
import PortfolioChart from './PortfolioChart';
import { DashboardHeader } from './components/DashboardHeader';
import { ConnectWalletButton } from './components/ConnectWalletButton';
import { useWallet } from './components/WalletContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useChat } from '../hooks/useChat';
import { ChatInterface } from './components/ChatInterface';

export default function Home() {
  const { publicKey, setPublicKey } = useWallet();
  const [showInstallModal, setShowInstallModal] = useState(false);
    // Connect Wallet logic
    const handleConnectWallet = async () => {
      if (!window.freighterApi) {
        setShowInstallModal(true);
        return;
      }
      try {
        const key = await window.freighterApi.getPublicKey();
        setPublicKey(key);
      } catch {
        // Optionally handle rejection
      }
    };
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Activity } from "lucide-react";
import { PortfolioStats } from "./components/PortfolioStats";
import {
  evaluateGoalStatus,
  type GoalData,
} from "../utils/goalProjection";
import PortfolioChart from "./PortfolioChart";
import {
  parseAllocationsFromMessage,
  getDefaultAllocations,
} from "../utils/allocationParser";
import type { AssetAllocation } from "../utils/chartUtils";
import { useNotifications } from "../hooks/useNotifications";
import {
  isAgentMessageNotification,
  isConnectedNotification,
} from "../types/websocket";
import { DashboardHeader } from "./components/DashboardHeader";
import { ConnectWalletButton } from "./components/ConnectWalletButton";
import { useFreighter } from "../hooks/useFreighter";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  PortfolioStatsSkeleton,
  GoalTrackerSkeleton,
  PortfolioChartSkeleton,
} from "./components/SkeletonLoader";
import { WalletModalTest } from "./components/WalletModalTest";
import { ChatInterface, type ChatMessage } from "./components/ChatInterface";
import { goalData, initialMessages } from "../config/mockData";
import toast from 'react-hot-toast';
import { GoalTracker } from "./components/GoalTracker";
import { GlassPanel } from "./components/GlassPanel";

export default function Home() {
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
  }, [goalData]);

  const { messages, inputState, setInputState, isTyping, handleSendMessage, allocations, wsConnected } = useChat({
    userId: 'user-demo-001',
    goalData,
  });
  const goalResult = evaluateGoalStatus(goalData);
  const progress = goalResult.progressPercentage;
  const goalStatus = goalResult.status;
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
  }, [wsConnected, registerGoal, goalData]);

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
        <main className="app-container" aria-label="Portfolio dashboard">
          {/* Left Panel - Dashboard */}
          <GlassPanel>
            <h1>Smasage Portfolio</h1>
            <p className="text-muted portfolio-subtitle">
              Real-time on-chain tracking • Stellar Mainnet 🚀
            </p>

            {isLoading ? (
              <PortfolioStatsSkeleton />
            ) : (
              <div className="skeleton-fade-in">
                <PortfolioStats
                  totalValue={goalData.currentBalance}
                  apy={goalData.expectedAPY}
                  valueChange={12.4}
                />
              </div>
            )}

            {isLoading ? (
              <GoalTrackerSkeleton />
            ) : (
              <GoalTracker
                goalName="European Vacation"
                targetAmount={goalData.targetAmount}
                targetDate={goalData.targetDate}
                status={goalStatus}
                progressPercentage={progress}
                remainingAmount={goalData.targetAmount - goalData.currentBalance}
              />
            )}

            <div className="allocation-list">
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
            </div>
          </GlassPanel>

        {/* Right Panel - Chat Agent */}
        <ChatInterface
          messages={messages}
          inputState={inputState}
          setInputState={setInputState}
          isTyping={isTyping}
          handleSendMessage={handleSendMessage}
        />
      </main>
          {/* Right Panel - Chat Agent */}
          <GlassPanel>
            <ChatInterface
              messages={messages}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
            />
          </GlassPanel>
        </main>
      </>
    </ErrorBoundary>
  );
}
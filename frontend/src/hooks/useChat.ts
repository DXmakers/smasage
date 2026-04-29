import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from './useNotifications';
import { parseAllocationsFromMessage, getDefaultAllocations } from '../utils/allocationParser';
import type { AssetAllocation } from '../utils/chartUtils';
import type { GoalData } from '../utils/goalProjection';
import type { Message } from '../types/chat';

interface UseChatOptions {
  userId: string;
  goalData: GoalData;
}

export function useChat({ userId, goalData }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'agent', text: "Welcome to Smasage! 👋 I'm OpenClaw, your personal AI savings assistant natively built on Stellar. What financial goal can we crush today?" }
  ]);
  const [inputState, setInputState] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [allocations, setAllocations] = useState<AssetAllocation[]>(getDefaultAllocations());

  const { registerGoal, isConnected } = useNotifications({
    userId,
    onNotification: (notification) => {
      if (notification.type === 'agent-message') {
        const payload = notification.payload as { text: string; proactive?: boolean; timestamp?: string; };
        const agentMsg: Message = {
          id: Date.now(),
          sender: 'agent',
          text: payload.text,
          proactive: payload.proactive,
          timestamp: payload.timestamp,
        };
        setMessages(prev => [...prev, agentMsg]);

        // Parse allocations if present
        const parsedAllocations = parseAllocationsFromMessage(payload.text);
        if (parsedAllocations) {
          setAllocations(parsedAllocations);
        }
      }
    },
    onError: (error) => {
      console.error('[Chat] WebSocket error:', error);
    },
    enabled: true,
  });

  // Register goal when connected
  useEffect(() => {
    if (isConnected) {
      registerGoal({
        currentBalance: goalData.currentBalance,
        targetAmount: goalData.targetAmount,
        targetDate: goalData.targetDate,
        expectedAPY: goalData.expectedAPY,
        monthlyContribution: goalData.monthlyContribution,
      });
    }
  }, [isConnected, registerGoal, goalData]);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!inputState.trim()) return;

    const userMsg: Message = { id: Date.now(), sender: 'user', text: inputState };
    setMessages(prev => [...prev, userMsg]);
    setInputState('');
    setIsTyping(true);

    // Mock agent response delay
    setTimeout(() => {
      setIsTyping(false);
      const agentMsg: Message = {
        id: Date.now() + 1,
        sender: 'agent',
        text: "That's a great goal. I'll allocate 60% to Stellar Blend for safe yield, and the rest to Soroswap XLM/USDC LP to accelerate returns. Does that sound good?"
      };
      setMessages(prev => [...prev, agentMsg]);

      // Parse allocations from agent message
      const parsedAllocations = parseAllocationsFromMessage(agentMsg.text);
      if (parsedAllocations) {
        setAllocations(parsedAllocations);
      }
    }, 1800);
  }, [inputState]);

  return {
    messages,
    inputState,
    setInputState,
    isTyping,
    handleSendMessage,
    allocations,
    wsConnected: isConnected,
  };
}
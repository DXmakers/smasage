import type { ChatMessage } from '../app/components/ChatInterface';
import type { AssetAllocation } from '../utils/chartUtils';
import type { GoalData } from '../utils/goalProjection';

export const goalData: GoalData = {
  currentBalance: 12450,
  targetAmount: 18000,
  targetDate: '2026-08-01',
  monthlyContribution: 500,
  expectedAPY: 8.5,
};

export const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: 'agent',
    text: 'Welcome to Smasage! 👋 I\'m OpenClaw, your personal AI savings assistant natively built on Stellar. What financial goal can we crush today?',
  },
];

export const defaultAllocations: AssetAllocation[] = [
  {
    name: 'Blend Protocol Yield (USDC)',
    percentage: 60,
    color: '#8b5cf6',
  },
  {
    name: 'Soroswap LP (XLM/USDC)',
    percentage: 30,
    color: '#06b6d4',
  },
  {
    name: 'Stellar Anchored Gold (XAUT)',
    percentage: 10,
    color: '#f59e0b',
  },
];

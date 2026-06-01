/**
 * Tests for shared frontend domain types (Issue #109)
 *
 * Verifies that type shapes are structurally correct and that consumers
 * importing from domain.ts get the same types as those re-exported from
 * the original utility modules.
 */

import type {
  GoalData,
  GoalStatus,
  ServerGoalStatus,
  ProjectionResult,
  AssetAllocation,
  ChatMessage,
  ProactiveSuggestion,
} from './domain';

// Re-exports from legacy paths must remain available (backward compat).
import type { GoalData as GoalDataFromUtil } from '../utils/goalProjection';
import type { AssetAllocation as AssetAllocationFromUtil } from '../utils/chartUtils';
import type { ProactiveSuggestion as ProactiveSuggestionFromUtil } from '../utils/suggestionHandler';

// ---------------------------------------------------------------------------
// Structural assignment checks (compile-time, caught at build by tsc)
// ---------------------------------------------------------------------------

// A valid GoalData value must satisfy the interface.
const validGoal: GoalData = {
  currentBalance: 12_450,
  targetAmount: 18_000,
  targetDate: '2026-08-01',
  monthlyContribution: 500,
  expectedAPY: 8.5,
};

// ProjectionResult must hold all required fields.
const validProjection: ProjectionResult = {
  status: 'On Track',
  projectedValue: 19_200,
  monthsRemaining: 14,
  shortfall: 0,
  surplus: 1_200,
  progressPercentage: 69.2,
};

// AssetAllocation must hold name, percentage, and color.
const validAllocation: AssetAllocation = {
  name: 'Blend Protocol Yield (USDC)',
  percentage: 60,
  color: '#8b5cf6',
};

// ChatMessage must support both sender values and optional fields.
const agentMsg: ChatMessage = {
  id: 1,
  sender: 'agent',
  text: 'Welcome!',
  proactive: true,
  timestamp: '2026-06-01T10:00:00Z',
};

const userMsg: ChatMessage = { id: 2, sender: 'user', text: 'Hi' };

// ProactiveSuggestion must support all three type variants.
const contributionSuggestion: ProactiveSuggestion = {
  type: 'contribution-increase',
  currentContribution: 500,
  suggestedContribution: 600,
};

const rebalanceSuggestion: ProactiveSuggestion = {
  type: 'allocation-rebalance',
  currentContribution: 500,
  currentAllocation: { blend: 60, soroswap: 40 },
  suggestedAllocation: { blend: 70, soroswap: 30 },
};

const bothSuggestion: ProactiveSuggestion = {
  type: 'both',
  currentContribution: 500,
  suggestedContribution: 650,
};

// ---------------------------------------------------------------------------
// Runtime shape tests
// ---------------------------------------------------------------------------

describe('domain types – GoalData', () => {
  it('has all required numeric fields', () => {
    expect(typeof validGoal.currentBalance).toBe('number');
    expect(typeof validGoal.targetAmount).toBe('number');
    expect(typeof validGoal.monthlyContribution).toBe('number');
    expect(typeof validGoal.expectedAPY).toBe('number');
  });

  it('has a string targetDate', () => {
    expect(typeof validGoal.targetDate).toBe('string');
  });
});

describe('domain types – ProjectionResult', () => {
  it('has valid GoalStatus values', () => {
    const validStatuses: GoalStatus[] = ['On Track', 'Ahead', 'Falling Behind'];
    expect(validStatuses).toContain(validProjection.status);
  });

  it('has non-negative shortfall and surplus', () => {
    expect(validProjection.shortfall).toBeGreaterThanOrEqual(0);
    expect(validProjection.surplus).toBeGreaterThanOrEqual(0);
  });

  it('progressPercentage is between 0 and 100', () => {
    expect(validProjection.progressPercentage).toBeGreaterThanOrEqual(0);
    expect(validProjection.progressPercentage).toBeLessThanOrEqual(100);
  });
});

describe('domain types – AssetAllocation', () => {
  it('percentage is a number between 0 and 100', () => {
    expect(validAllocation.percentage).toBeGreaterThanOrEqual(0);
    expect(validAllocation.percentage).toBeLessThanOrEqual(100);
  });

  it('color is a non-empty string', () => {
    expect(typeof validAllocation.color).toBe('string');
    expect(validAllocation.color.length).toBeGreaterThan(0);
  });
});

describe('domain types – ChatMessage', () => {
  it('sender is "agent" or "user"', () => {
    expect(['agent', 'user']).toContain(agentMsg.sender);
    expect(['agent', 'user']).toContain(userMsg.sender);
  });

  it('optional fields are undefined when not provided', () => {
    expect(userMsg.proactive).toBeUndefined();
    expect(userMsg.timestamp).toBeUndefined();
  });
});

describe('domain types – ProactiveSuggestion', () => {
  it('supports contribution-increase type', () => {
    expect(contributionSuggestion.type).toBe('contribution-increase');
    expect(contributionSuggestion.suggestedContribution).toBeGreaterThan(
      contributionSuggestion.currentContribution,
    );
  });

  it('supports allocation-rebalance type', () => {
    expect(rebalanceSuggestion.type).toBe('allocation-rebalance');
    expect(rebalanceSuggestion.currentAllocation).toBeDefined();
  });

  it('supports both type', () => {
    expect(bothSuggestion.type).toBe('both');
  });
});

describe('domain types – ServerGoalStatus', () => {
  it('accepts all valid server status strings', () => {
    const statuses: ServerGoalStatus[] = ['on-track', 'ahead', 'falling-behind'];
    expect(statuses).toHaveLength(3);
    statuses.forEach((s) => expect(typeof s).toBe('string'));
  });
});

describe('backward-compatibility re-exports', () => {
  it('GoalData from goalProjection matches shape from domain', () => {
    const fromUtil: GoalDataFromUtil = validGoal;
    const fromDomain: GoalData = fromUtil;
    expect(fromDomain).toStrictEqual(validGoal);
  });

  it('AssetAllocation from chartUtils matches shape from domain', () => {
    const fromUtil: AssetAllocationFromUtil = validAllocation;
    const fromDomain: AssetAllocation = fromUtil;
    expect(fromDomain).toStrictEqual(validAllocation);
  });

  it('ProactiveSuggestion from suggestionHandler matches shape from domain', () => {
    const fromUtil: ProactiveSuggestionFromUtil = contributionSuggestion;
    const fromDomain: ProactiveSuggestion = fromUtil;
    expect(fromDomain).toStrictEqual(contributionSuggestion);
  });
});

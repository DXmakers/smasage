/**
 * Shared Frontend Domain Types – Issue #109
 *
 * Single source of truth for core business domain types used across the
 * frontend. Utility modules and components import from here rather than
 * defining their own copies.
 */

// ---------------------------------------------------------------------------
// Goal domain
// ---------------------------------------------------------------------------

/** Goal-tracking status as evaluated client-side. */
export type GoalStatus = 'On Track' | 'Ahead' | 'Falling Behind';

/**
 * Goal-tracking status string as pushed by the server.
 * Distinct from the client-side GoalStatus to avoid accidental conflation.
 */
export type ServerGoalStatus = 'on-track' | 'ahead' | 'falling-behind';

/** Input data required to evaluate or register a savings goal. */
export interface GoalData {
  currentBalance: number;
  targetAmount: number;
  /** ISO-8601 date string (e.g. "2026-08-01"). */
  targetDate: string;
  monthlyContribution: number;
  expectedAPY: number;
}

/** Result of a client-side goal projection calculation. */
export interface ProjectionResult {
  status: GoalStatus;
  projectedValue: number;
  monthsRemaining: number;
  shortfall: number;
  surplus: number;
  progressPercentage: number;
}

// ---------------------------------------------------------------------------
// Portfolio / allocation domain
// ---------------------------------------------------------------------------

/** A single asset-allocation slice used by charts and allocation parsers. */
export interface AssetAllocation {
  name: string;
  /** Value between 0 and 100. */
  percentage: number;
  /** CSS-compatible color string (e.g. "#8b5cf6"). */
  color: string;
}

// ---------------------------------------------------------------------------
// Chat domain
// ---------------------------------------------------------------------------

/** A single message in the agent–user conversation. */
export interface ChatMessage {
  id: number;
  sender: 'agent' | 'user';
  text: string;
  /** True when the message was generated without user prompting. */
  proactive?: boolean;
  /** ISO-8601 timestamp string. */
  timestamp?: string;
}

// ---------------------------------------------------------------------------
// Suggestion domain
// ---------------------------------------------------------------------------

/** A proactive suggestion the agent offers to adjust the user's goal plan. */
export interface ProactiveSuggestion {
  type: 'contribution-increase' | 'allocation-rebalance' | 'both';
  currentContribution: number;
  suggestedContribution?: number;
  currentAllocation?: Record<string, number>;
  suggestedAllocation?: Record<string, number>;
}

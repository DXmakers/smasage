import { Target } from "lucide-react";
import { getStatusColor, type ProjectionResult } from "../../../utils/goalProjection";

export interface GoalTrackerProps {
  goalName: string;
  targetAmount: number;
  targetDate: string;
  status: ProjectionResult["status"];
  progressPercentage: number;
  remainingAmount: number;
}

function getStatusClass(status: ProjectionResult["status"]): string {
  switch (status) {
    case "Ahead":
      return "ahead";
    case "On Track":
      return "on-track";
    case "Falling Behind":
      return "falling-behind";
    default:
      return "on-track";
  }
}

function getStatusLabel(status: ProjectionResult["status"]): string {
  switch (status) {
    case "Ahead":
      return "Ahead of schedule";
    case "On Track":
      return "On track";
    case "Falling Behind":
      return "Falling behind";
    default:
      return "On track";
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTargetDate(targetDate: string): string {
  const parsed = new Date(targetDate);
  if (Number.isNaN(parsed.getTime())) {
    return targetDate;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function GoalTracker({
  goalName,
  targetAmount,
  targetDate,
  status,
  progressPercentage,
  remainingAmount,
}: GoalTrackerProps) {
  const statusColor = getStatusColor(status);
  const clampedProgress = Math.max(0, Math.min(100, progressPercentage));
  const statusLabel = getStatusLabel(status);

  return (
    <div className="goal-section skeleton-fade-in">
      <div className="goal-header">
        <div className="goal-header-content">
          <h3 className="goal-title">{goalName}</h3>
          <p className="text-muted goal-subtitle">
            Target: <span className="goal-metric">{formatCurrency(targetAmount)}</span> by <time>{formatTargetDate(targetDate)}</time>
          </p>
          <div className={`status-indicator ${getStatusClass(status)}`} role="status" aria-label={`Status: ${statusLabel}`}>
            <span className="status-indicator-dot"></span>
            {statusLabel}
          </div>
        </div>
        <Target size={32} color={statusColor} opacity={0.8} aria-hidden="true" />
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(clampedProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Savings goal progress: ${Math.round(clampedProgress)}% complete`}
        ></div>
      </div>

      <div className="progress-stats">
        <div>
          <span className="progress-stat-label">Completed</span>
          <span className="progress-stat-value">{Math.round(clampedProgress)}%</span>
        </div>
        <div>
          <span className="progress-stat-label">Remaining</span>
          <span className="progress-stat-value">{formatCurrency(remainingAmount)}</span>
        </div>
      </div>
    </div>
  );
}

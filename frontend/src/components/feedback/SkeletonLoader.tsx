'use client';

import React from 'react';

interface BoneProps {
  className?: string;
}

function Bone({ className }: BoneProps) {
  return (
    <div className={className ? `skeleton-bone ${className}` : 'skeleton-bone'}>
      <div className="skeleton-shimmer" />
    </div>
  );
}

export function PortfolioStatsSkeleton() {
  return (
    <div className="stats-grid skeleton-stats-grid">
      {[0, 1].map((i) => (
        <div key={i} className="stat-card skeleton-stat-card">
          <Bone className="skeleton-bone--stat-label" />
          <Bone className="skeleton-bone--stat-value" />
        </div>
      ))}
    </div>
  );
}

export function GoalTrackerSkeleton() {
  return (
    <div className="goal-section">
      <div className="goal-header">
        <div className="skeleton-goal-copy">
          <Bone className="skeleton-bone--goal-title" />
          <Bone className="skeleton-bone--goal-line" />
          <Bone className="skeleton-bone--goal-line-short" />
        </div>
        <Bone className="skeleton-bone--goal-icon" />
      </div>
      <Bone className="skeleton-bone--progress" />
      <div className="skeleton-progress-row">
        <Bone className="skeleton-bone--progress-stat" />
        <Bone className="skeleton-bone--progress-stat" />
      </div>
    </div>
  );
}

export function PortfolioChartSkeleton() {
  return (
    <div className="portfolio-chart-container">
      <Bone className="skeleton-bone--chart-donut" />
      <div className="chart-legend skeleton-chart-legend">
        {[0, 1, 2].map((i) => (
          <div key={i} className="legend-item skeleton-legend-item">
            <Bone className="skeleton-bone--legend-swatch" />
            <div className="skeleton-legend-text">
              <Bone className="skeleton-bone--legend-name" />
              <Bone className="skeleton-bone--legend-pct" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

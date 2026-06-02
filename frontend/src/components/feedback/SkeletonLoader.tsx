'use client';

import React from 'react';

// ── Bone ─────────────────────────────────────────────────────────────────────
// A single skeleton bone. className is appended to the base `skeleton-bone`
// class so per-bone dimension/shape overrides work without specificity fights.

interface BoneProps {
  className?: string;
}

function Bone({ className }: BoneProps) {
  return (
    <div className={['skeleton-bone', className].filter(Boolean).join(' ')}>
      <div className="skeleton-shimmer" aria-hidden="true" />
    </div>
  );
}

// ── PortfolioStatsSkeleton ────────────────────────────────────────────────────
// Mirrors the two-column .stats-grid → two .stat-card wrappers, each holding
// a MetricTile-shaped set of bones (label + value + optional trend).
// Dimensions are locked to MetricTile's rendered sizes to prevent layout shift.

export function PortfolioStatsSkeleton() {
  return (
    <div
      className="stats-grid skeleton-stats-grid"
      aria-busy="true"
      aria-label="Loading portfolio statistics"
    >
      {/* Card 1 — Total Value (has trend row) */}
      <div className="stat-card skeleton-stat-card">
        <Bone className="skeleton-bone--stat-label" />
        <Bone className="skeleton-bone--stat-value" />
        <Bone className="skeleton-bone--stat-trend" />
      </div>

      {/* Card 2 — APY (no trend, has status pill placeholder) */}
      <div className="stat-card secondary skeleton-stat-card">
        <Bone className="skeleton-bone--stat-label" />
        <Bone className="skeleton-bone--stat-value" />
      </div>
    </div>
  );
}

// ── GoalTrackerSkeleton ───────────────────────────────────────────────────────
// Mirrors .goal-section → .goal-header (copy + icon) → progress bar → stats row.
// .skeleton-goal-copy uses flex-column + gap so bones space themselves without
// margin hacks that would differ from the real component.

export function GoalTrackerSkeleton() {
  return (
    <div
      className="goal-section"
      aria-busy="true"
      aria-label="Loading goal tracker"
    >
      <div className="goal-header">
        <div className="skeleton-goal-copy">
          {/* goal-title: h3.goal-title */}
          <Bone className="skeleton-bone--goal-title" />
          {/* goal-subtitle: p.text-muted */}
          <Bone className="skeleton-bone--goal-line" />
          {/* status-indicator badge */}
          <Bone className="skeleton-bone--goal-line-short" />
        </div>
        {/* Target icon — size={32} */}
        <Bone className="skeleton-bone--goal-icon" />
      </div>

      {/* .progress-bar-container height=12px, border-radius=999px */}
      <Bone className="skeleton-bone--progress" />

      {/* .progress-stats row — two short text spans */}
      <div className="skeleton-progress-row">
        <Bone className="skeleton-bone--progress-stat" />
        <Bone className="skeleton-bone--progress-stat" />
      </div>
    </div>
  );
}

// ── PortfolioChartSkeleton ────────────────────────────────────────────────────
// Mirrors .portfolio-chart-container → donut SVG placeholder + legend list.
// Donut is 320×320 (matching PortfolioChart default props) to prevent the
// 40px height jump that occurred with the old 280px value.
// Legend items use .legend-item so they inherit the same min-height: 54px and
// padding as the real buttons — no height shift on swap.

export function PortfolioChartSkeleton() {
  return (
    <div
      className="portfolio-chart-container"
      aria-busy="true"
      aria-label="Loading portfolio chart"
    >
      {/* Donut placeholder — 320×320 matches PortfolioChart default */}
      <div className="chart-wrapper">
        <Bone className="skeleton-bone--chart-donut" />
      </div>

      {/* Legend — 3 rows matching the default 3-asset allocation */}
      <div className="chart-legend skeleton-chart-legend">
        {([0, 1, 2] as const).map((i) => (
          <div
            key={i}
            className="legend-item skeleton-legend-item"
            aria-hidden="true"
          >
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

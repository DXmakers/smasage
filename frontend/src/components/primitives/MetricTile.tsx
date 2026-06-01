"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export type TrendDirection = "up" | "down" | "flat";

export interface MetricTileProps {
  label: string;
  value: string | number;
  trend?: TrendDirection;
  trendLabel?: string;
  loading?: boolean;
  className?: string;
}

const trendIcons: Record<TrendDirection, React.ReactNode> = {
  up: <TrendingUp size={12} aria-hidden="true" />,
  down: <TrendingDown size={12} aria-hidden="true" />,
  flat: <Minus size={12} aria-hidden="true" />,
};

const trendClasses: Record<TrendDirection, string> = {
  up: "metric-tile__trend metric-tile__trend--up",
  down: "metric-tile__trend metric-tile__trend--down",
  flat: "metric-tile__trend metric-tile__trend--flat",
};

export function MetricTile({
  label,
  value,
  trend,
  trendLabel,
  loading = false,
  className,
}: MetricTileProps) {
  const classes = ["metric-tile", loading && "metric-tile--loading", className]
    .filter(Boolean)
    .join(" ");

  if (loading) {
    return (
      <div className={classes} aria-busy="true" aria-label={`Loading ${label}`}>
        <div className="metric-tile__label-skeleton" />
        <div className="metric-tile__value-skeleton" />
      </div>
    );
  }

  return (
    <div className={classes}>
      <span className="metric-tile__label">{label}</span>
      <span className="metric-tile__value" title={String(value)}>
        {value}
      </span>
      {trend && (
        <span
          className={trendClasses[trend]}
          aria-label={trendLabel ?? `Trend: ${trend}`}
        >
          {trendIcons[trend]}
          {trendLabel && (
            <span className="metric-tile__trend-label">{trendLabel}</span>
          )}
        </span>
      )}
    </div>
  );
}

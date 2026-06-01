'use client';

import React from 'react';
import { MetricTile, StatusPill } from '../../primitives';

export interface PortfolioStatsProps {
  totalValue: number;
  apy: number;
  valueChange: number;
  loading?: boolean;
}

export const PortfolioStats: React.FC<PortfolioStatsProps> = ({
  totalValue,
  apy,
  valueChange,
  loading = false,
}) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalValue);

  const changeLabel = `${valueChange >= 0 ? '+' : ''}${valueChange.toFixed(1)}%`;
  const trend = valueChange > 0 ? 'up' : valueChange < 0 ? 'down' : 'flat';

  return (
    <div className="stats-grid">
      <MetricTile
        label="Total Value"
        value={formattedValue}
        trend={trend}
        trendLabel={changeLabel}
        loading={loading}
        className="stat-card"
      />
      <div className="stat-card secondary">
        <MetricTile
          label="Est. Monthly APY"
          value={`${apy.toFixed(1)}%`}
          loading={loading}
        />
        <StatusPill variant="success" label="Active" className="mt-1" />
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { Wallet, TrendingUp } from 'lucide-react';

export interface PortfolioStatsProps {
  totalValue: number;
  apy: number;
  valueChange: number;
}

const formatMetric = (value: number, style: 'currency' | 'percent'): string => {
  if (style === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return value.toFixed(1) + '%';
};

export const PortfolioStats: React.FC<PortfolioStatsProps> = ({
  totalValue,
  apy,
  valueChange,
}) => {
  const formattedValue = formatMetric(totalValue, 'currency');
  const changeLabel = `${valueChange >= 0 ? '+' : ''}${valueChange.toFixed(1)}%`;
  const apyLabel = formatMetric(apy, 'percent');

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">
          <Wallet size={16} color="var(--accent-primary)" aria-hidden="true" />
          <span>Total Value</span>
        </div>
        <div className="stat-value">
          <span>{formattedValue}</span>
          <span className="stat-sub" aria-label={`Change: ${changeLabel}`}>{changeLabel}</span>
        </div>
      </div>

      <div className="stat-card secondary">
        <div className="stat-label">
          <TrendingUp size={16} color="var(--accent-secondary)" aria-hidden="true" />
          <span>Est. Monthly APY</span>
        </div>
        <div className="stat-value">
          <span>{apyLabel}</span>
          <span className="stat-sub" aria-label="Status: Active">Active</span>
        </div>
      </div>
    </div>
  );
};

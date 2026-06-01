"use client";

import React, { useMemo, useState } from "react";
import {
  type AssetAllocation,
  calculatePieSlices,
  generatePiePath,
  calculateLabelPosition,
  normalizeAllocations,
} from "../utils/chartUtils";

interface PortfolioChartProps {
  allocations: AssetAllocation[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  animated?: boolean;
}

interface HoveredSlice {
  index: number;
  name: string;
  percentage: number;
}

const MIN_VISIBLE_LABEL_PERCENTAGE = 8;

export default function PortfolioChart({
  allocations,
  width = 320,
  height = 320,
  showLegend = true,
  animated = true,
}: PortfolioChartProps) {
  const [hoveredSlice, setHoveredSlice] = useState<HoveredSlice | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const chartSize = Math.min(width, height);

  // Normalize allocations to ensure they sum to 100%
  const normalizedAllocations = useMemo(
    () => normalizeAllocations(allocations),
    [allocations],
  );

  // Calculate pie slices
  const cx = chartSize / 2;
  const cy = chartSize / 2;
  const outerRadius = chartSize / 2 - 18;
  const innerRadius = outerRadius * 0.45; // For donut effect

  const slices = useMemo(
    () => calculatePieSlices(normalizedAllocations, cx, cy, outerRadius),
    [normalizedAllocations, cx, cy, outerRadius],
  );

  const handleMouseEnter = (
    index: number,
    name: string,
    percentage: number,
    event: React.MouseEvent<SVGPathElement>,
  ) => {
    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (rect) {
      const x = ((event.clientX - rect.left) / rect.width) * chartSize;
      const y = ((event.clientY - rect.top) / rect.height) * chartSize;
      setTooltipPos({
        x: Math.min(Math.max(x, 66), chartSize - 66),
        y: Math.min(Math.max(y, 48), chartSize - 12),
      });
    }
    setHoveredSlice({ index, name, percentage });
  };

  const handleMouseLeave = () => {
    setHoveredSlice(null);
  };

  return (
    <div className="portfolio-chart-container">
      <div className="chart-wrapper">
        <svg
          viewBox={`0 0 ${chartSize} ${chartSize}`}
          className="portfolio-chart-svg"
          role="img"
          aria-label="Portfolio allocation donut chart"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="chart-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Render pie slices */}
          <g filter="url(#chart-shadow)">
            {slices.map((slice, index) => {
              const isHovered = hoveredSlice?.index === index;
              const path = generatePiePath(
                slice.cx,
                slice.cy,
                slice.radius,
                slice.startAngle,
                slice.endAngle,
              );

              return (
                <g key={slice.name}>
                  <path
                    d={path}
                    fill={slice.color}
                    opacity={isHovered ? 1 : 0.85}
                    className={`pie-slice${animated ? '' : ' pie-slice--static'}${isHovered ? ' pie-slice--hovered' : ''}`}
                    onMouseEnter={(e) =>
                      handleMouseEnter(index, slice.name, slice.percentage, e)
                    }
                    onMouseLeave={handleMouseLeave}
                  />
                </g>
              );
            })}
          </g>

          {/* Render percentage labels on donut */}
          {slices.map((slice, index) => {
            const labelPos = calculateLabelPosition(
              slice.cx,
              slice.cy,
              slice.startAngle,
              slice.endAngle,
              innerRadius,
              outerRadius,
            );

            // Small slices are still represented in the legend; hiding them here
            // keeps the chart labels readable on narrow cards.
            if (slice.percentage < MIN_VISIBLE_LABEL_PERCENTAGE) return null;

            return (
              <text
                key={`label-${slice.name}`}
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`chart-label${animated ? '' : ' chart-label--static'}${hoveredSlice?.index === index ? ' chart-label--active' : ''}`}
              >
                {slice.percentage.toFixed(0)}%
              </text>
            );
          })}

          {/* Tooltip */}
          {hoveredSlice && (
            <g>
              {/* Tooltip background */}
              <rect
                x={tooltipPos.x - 60}
                y={tooltipPos.y - 40}
                width="120"
                height="50"
                rx="6"
                fill="var(--bg-card)"
                stroke="var(--accent-primary)"
                strokeWidth="1"
                opacity="0.95"
              />
              {/* Tooltip text - Asset name */}
              <text
                x={tooltipPos.x}
                y={tooltipPos.y - 20}
                textAnchor="middle"
                dominantBaseline="middle"
                className="chart-tooltip-name"
              >
                {hoveredSlice.name.split('(')[0].trim()}
              </text>
              {/* Tooltip text - Percentage */}
              <text
                x={tooltipPos.x}
                y={tooltipPos.y - 5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="chart-tooltip-value"
              >
                {hoveredSlice.percentage.toFixed(1)}%
              </text>
            </g>
          )}
        </svg>

        {/* Center text for donut */}
        <div className="chart-center-text">
          <div className="chart-center-value">
            {allocations.length > 0 ? 'Portfolio' : 'No Data'}
          </div>
          <div className="chart-center-label">Allocation</div>
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="chart-legend">
          {normalizedAllocations.map((allocation, index) => (
            <button
              key={allocation.name}
              type="button"
              className="legend-item"
              onMouseEnter={() =>
                setHoveredSlice({
                  index,
                  name: allocation.name,
                  percentage: allocation.percentage,
                })
              }
              onFocus={() =>
                setHoveredSlice({
                  index,
                  name: allocation.name,
                  percentage: allocation.percentage,
                })
              }
              onMouseLeave={() => setHoveredSlice(null)}
              onBlur={() => setHoveredSlice(null)}
            >
              <div
                className="legend-color"
                style={{ '--legend-color': allocation.color } as React.CSSProperties}
              />
              <div className="legend-text">
                <div className="legend-name">{allocation.name}</div>
                <div className="legend-percentage">{allocation.percentage}%</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";

export type StatusVariant = "success" | "warning" | "error" | "neutral";

export interface StatusPillProps {
  variant: StatusVariant;
  label: string;
  className?: string;
}

const variantClasses: Record<StatusVariant, string> = {
  success: "status-pill status-pill--success",
  warning: "status-pill status-pill--warning",
  error: "status-pill status-pill--error",
  neutral: "status-pill status-pill--neutral",
};

const variantIcons: Record<StatusVariant, string> = {
  success: "●",
  warning: "▲",
  error: "✕",
  neutral: "○",
};

export function StatusPill({ variant, label, className }: StatusPillProps) {
  return (
    <span
      className={[variantClasses[variant], className].filter(Boolean).join(" ")}
      role="status"
      aria-label={`Status: ${label}`}
    >
      <span aria-hidden="true" className="status-pill__icon">
        {variantIcons[variant]}
      </span>
      <span className="status-pill__label">{label}</span>
    </span>
  );
}

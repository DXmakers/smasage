"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Circle } from "lucide-react";

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

export function StatusPill({ variant, label, className }: StatusPillProps) {
  const Icon = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: XCircle,
    neutral: Circle,
  }[variant];

  return (
    <span
      className={[variantClasses[variant], className].filter(Boolean).join(" ")}
      role="status"
      aria-label={`Status: ${label}`}
    >
      <Icon size={14} aria-hidden="true" className="status-pill__icon" />
      <span className="status-pill__label">{label}</span>
    </span>
  );
}

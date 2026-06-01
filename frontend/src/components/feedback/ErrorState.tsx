"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  const classes = ["error-state", className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="alert" aria-live="assertive">
      <div className="error-state__icon" aria-hidden="true">
        <AlertTriangle size={32} />
      </div>
      <p className="error-state__title">{title}</p>
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <button
          type="button"
          className="error-state__retry btn btn-primary"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { InboxIcon } from "lucide-react";

export interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Nothing here yet",
  message = "Data will appear once it's available.",
  action,
  icon,
  className,
}: EmptyStateProps) {
  const classes = ["empty-state", className].filter(Boolean).join(" ");

  return (
    <div className={classes} role="status" aria-live="polite">
      <div className="empty-state__icon" aria-hidden="true">
        {icon ?? <InboxIcon size={32} />}
      </div>
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__message">{message}</p>
      {action && (
        <button
          type="button"
          className="empty-state__action btn btn-secondary"
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

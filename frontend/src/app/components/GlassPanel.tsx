import React from "react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div className={`glass-panel${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}

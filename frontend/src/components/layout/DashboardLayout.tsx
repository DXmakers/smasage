import React from 'react';

interface DashboardLayoutProps {
  header: React.ReactNode;
  children: React.ReactNode;
  overlays?: React.ReactNode;
}

export function DashboardLayout({ header, children, overlays }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      {header}
      {overlays}
      <main className="dashboard-layout-main">
        {children}
      </main>
    </div>
  );
}

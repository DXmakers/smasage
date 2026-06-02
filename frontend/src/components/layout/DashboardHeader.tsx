import React from 'react';
import { Settings } from 'lucide-react';
import {
  ConnectivityWidget,
  type WalletConnectionStatus,
} from '../features/wallet/ConnectivityWidget';
import type { WebSocketConnectionStatus } from '../../hooks/useNotifications';

interface DashboardHeaderProps {
  children?: React.ReactNode;
  webSocketStatus?: WebSocketConnectionStatus;
  walletStatus?: WalletConnectionStatus;
  publicKey?: string | null;
  onOpenSettings?: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  children,
  webSocketStatus = 'connecting',
  walletStatus = 'disconnected',
  publicKey,
  onOpenSettings
}) => (
  <header className="dashboard-header" aria-label="Smasage application header">
    <div className="header-content">
      <div className="logo-section">
        <div className="brand">
          <span className="brand-name" aria-label="Smasage">Smasage</span>
          <ConnectivityWidget
            webSocketStatus={webSocketStatus}
            walletStatus={walletStatus}
            publicKey={publicKey}
          />
        </div>
      </div>
      <div className="header-actions">
        {children}
        {onOpenSettings && (
          <button
            className="btn btn-secondary btn-icon"
            onClick={onOpenSettings}
            aria-label="Open technical settings"
            title="Open technical settings"
            style={{ padding: '0.72rem', marginLeft: '0.75rem' }}
          >
            <Settings size={20} />
          </button>
        )}
      </div>
    </div>
  </header>
);

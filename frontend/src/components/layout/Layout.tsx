import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useWebSocket } from '../../hooks/useWebSocket';
import type { Alert } from '../../types';

export const Layout: React.FC = () => {
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  const handleAlertUpdate = useCallback((alert: Alert) => {
    setRecentAlerts((prev) => [alert, ...prev].slice(0, 20)); // keep last 20
  }, []);

  useWebSocket({
    onAlertUpdate: handleAlertUpdate,
    onConnect: () => setWsConnected(true),
    onDisconnect: () => setWsConnected(false),
  });

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar
          title="FleetOps"
          recentAlerts={recentAlerts}
          wsConnected={wsConnected}
          onRefresh={() => window.location.reload()}
        />
        <Box sx={{ flex: 1, overflow: 'auto', bgcolor: 'background.default' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
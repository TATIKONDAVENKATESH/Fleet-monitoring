import React from 'react';
import { Chip } from '@mui/material';

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

const statusConfig: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' | 'primary' | 'info' }> = {
  ACTIVE: { label: 'Active', color: 'success' },
  INACTIVE: { label: 'Inactive', color: 'warning' },
  OFFLINE: { label: 'Offline', color: 'error' },
  AVAILABLE: { label: 'Available', color: 'success' },
  ON_TRIP: { label: 'On Trip', color: 'primary' },
  OFF_DUTY: { label: 'Off Duty', color: 'default' },
  SUSPENDED: { label: 'Suspended', color: 'error' },
  OVERSPEED: { label: 'Overspeed', color: 'error' },
  GEOFENCE_ENTRY: { label: 'Geo Entry', color: 'primary' },
  GEOFENCE_EXIT: { label: 'Geo Exit', color: 'warning' },
};

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  const config = statusConfig[status] ?? { label: status, color: 'default' };
  return <Chip label={config.label} color={config.color} size={size} />;
};
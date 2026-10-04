import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Badge, IconButton, Box,
  Popover, List, ListItem, ListItemText, Chip, Tooltip,
} from '@mui/material';
import { NotificationsActive, Circle, Refresh } from '@mui/icons-material';
import type { Alert } from '../../types';

interface NavbarProps {
  title: string;
  recentAlerts?: Alert[];
  onRefresh?: () => void;
  wsConnected?: boolean;
}

const alertColor = (type: string) => {
  switch (type) {
    case 'OVERSPEED': return 'error';
    case 'OFFLINE': return 'default';
    case 'GEOFENCE_ENTRY': return 'primary';
    case 'GEOFENCE_EXIT': return 'warning';
    default: return 'default';
  }
};

export const Navbar: React.FC<NavbarProps> = ({ title, recentAlerts = [], onRefresh, wsConnected }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const unread = recentAlerts.filter((a) => !a.acknowledged).length;

  return (
    <AppBar position="static" elevation={0} sx={{ zIndex: 1 }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Syne', fontWeight: 700, flexGrow: 1 }}>
          {title}
        </Typography>

        {/* WS indicator */}
        <Tooltip title={wsConnected ? 'Live feed connected' : 'Connecting...'}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Circle sx={{ fontSize: 10, color: wsConnected ? 'success.main' : 'warning.main', animation: wsConnected ? 'pulse 2s infinite' : 'none' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'DM Mono' }}>
              {wsConnected ? 'LIVE' : 'CONNECTING'}
            </Typography>
          </Box>
        </Tooltip>

        {onRefresh && (
          <IconButton size="small" onClick={onRefresh} sx={{ color: 'text.secondary' }}>
            <Refresh fontSize="small" />
          </IconButton>
        )}

        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: unread > 0 ? 'warning.main' : 'text.secondary' }}>
          <Badge badgeContent={unread} color="error" max={99}>
            <NotificationsActive />
          </Badge>
        </IconButton>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { width: 360, maxHeight: 420, overflow: 'auto', border: '1px solid rgba(148,163,184,0.12)' } }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <Typography variant="subtitle2" sx={{ fontFamily: 'Syne', fontWeight: 700 }}>
              Recent Alerts {unread > 0 && `(${unread} new)`}
            </Typography>
          </Box>
          <List dense>
            {recentAlerts.length === 0 ? (
              <ListItem><ListItemText secondary="No recent alerts" /></ListItem>
            ) : (
              recentAlerts.slice(0, 10).map((alert) => (
                <ListItem key={alert.id} divider sx={{ alignItems: 'flex-start', gap: 1 }}>
                  <Chip label={alert.alertType} color={alertColor(alert.alertType) as any} size="small" sx={{ flexShrink: 0, mt: 0.5 }} />
                  <ListItemText
                    primary={alert.message}
                    secondary={alert.vehicleNumber}
                    primaryTypographyProps={{ variant: 'body2', fontSize: '0.8rem' }}
                    secondaryTypographyProps={{ fontFamily: 'DM Mono', fontSize: '0.7rem' }}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Popover>
      </Toolbar>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </AppBar>
  );
};
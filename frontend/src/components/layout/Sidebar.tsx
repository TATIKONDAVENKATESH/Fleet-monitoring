import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Tooltip, Typography, Divider, IconButton, Avatar,
} from '@mui/material';
import {
  Dashboard, DirectionsCar, People, LocationOn, FenceOutlined,
  NotificationsActive, Assessment, Settings, ChevronLeft,
  ChevronRight, Speed, Logout, Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_W = 240;
const MINI_W = 64;

const navItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/' },
  { label: 'Live Tracking', icon: <LocationOn />, path: '/tracking' },
  { label: 'Vehicles', icon: <DirectionsCar />, path: '/vehicles' },
  { label: 'Drivers', icon: <People />, path: '/drivers' },
  { label: 'Geofences', icon: <FenceOutlined />, path: '/geofences' },
  { label: 'Alerts', icon: <NotificationsActive />, path: '/alerts' },
  { label: 'Reports', icon: <Assessment />, path: '/reports' },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const w = collapsed ? MINI_W : DRAWER_W;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: w, flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: w, overflowX: 'hidden',
          transition: 'width 0.22s ease',
          display: 'flex', flexDirection: 'column',
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 64 }}>
        <Speed sx={{ color: 'primary.main', fontSize: 28, flexShrink: 0 }} />
        {!collapsed && (
          <Typography variant="h6" sx={{ fontFamily: 'Syne', fontWeight: 800, color: 'primary.main', whiteSpace: 'nowrap' }}>
            FleetOps
          </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ color: 'text.secondary' }}>
          {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(148,163,184,0.08)' }} />

      {/* Nav */}
      <List sx={{ px: 1, pt: 1, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
          return (
            <Tooltip key={item.path} title={collapsed ? item.label : ''} placement="right">
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 1.5 : 2,
                    bgcolor: active ? 'rgba(56,189,248,0.1)' : 'transparent',
                    borderLeft: active ? '3px solid' : '3px solid transparent',
                    borderColor: active ? 'primary.main' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(56,189,248,0.06)' },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: collapsed ? 0 : 36,
                    color: active ? 'primary.main' : 'text.secondary',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                        color: active ? 'primary.main' : 'text.primary',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(148,163,184,0.08)' }} />

      {/* User */}
      <Box sx={{ p: 1.5 }}>
        {!collapsed ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark', fontSize: 14 }}>
              {user?.name?.[0] ?? 'U'}
            </Avatar>
            <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'DM Mono' }}>
                {user?.role}
              </Typography>
            </Box>
            <IconButton size="small" onClick={logout} sx={{ color: 'text.secondary' }}>
              <Logout fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Tooltip title="Logout" placement="right">
            <IconButton onClick={logout} sx={{ color: 'text.secondary', width: '100%' }}>
              <Logout />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Drawer>
  );
};
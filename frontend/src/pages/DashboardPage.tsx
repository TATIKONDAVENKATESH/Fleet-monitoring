import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Grid, Typography, CircularProgress, Paper,
} from '@mui/material';
import {
  DirectionsCar, Warning, WifiOff, Person, NotificationsActive,
} from '@mui/icons-material';
import { StatCard } from '../components/common/StatCard';
import { LiveMap } from '../components/map/LiveMap';
import { dashboardApi, geofenceApi } from '../api/services';
import { useWebSocket } from '../hooks/useWebSocket';
import type { DashboardStats, LiveLocation, Geofence, Alert } from '../types';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [liveLocations, setLiveLocations] = useState<LiveLocation[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, geoRes] = await Promise.all([
        dashboardApi.getStats(),
        geofenceApi.getAll(),
      ]);
      const data = statsRes.data.data as any;
      setStats(data);
      setLiveLocations(data.liveLocations ?? []);
      setGeofences(geoRes.data.data as Geofence[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLocationUpdate = useCallback((loc: LiveLocation) => {
    setLiveLocations((prev) => {
      const idx = prev.findIndex((l) => l.vehicleId === loc.vehicleId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = loc;
        return next;
      }
      return [...prev, loc];
    });
  }, []);

  const handleAlertUpdate = useCallback((_alert: Alert) => {
    // Refresh stats to update unacknowledged count
    dashboardApi.getStats().then((r) => setStats(r.data.data as DashboardStats));
  }, []);

  useWebSocket({ onLocationUpdate: handleLocationUpdate, onAlertUpdate: handleAlertUpdate });

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Fleet Dashboard
      </Typography>

      {/* Stats row */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Vehicles"
            value={stats?.totalVehicles ?? 0}
            icon={<DirectionsCar />}
            color="#38bdf8"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Vehicles"
            value={stats?.activeVehicles ?? 0}
            icon={<DirectionsCar />}
            color="#4ade80"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Offline Vehicles"
            value={stats?.offlineVehicles ?? 0}
            icon={<WifiOff />}
            color="#f87171"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Unacknowledged Alerts"
            value={stats?.unacknowledgedAlerts ?? 0}
            icon={<NotificationsActive />}
            color="#fb923c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Drivers"
            value={stats?.totalDrivers ?? 0}
            icon={<Person />}
            color="#a78bfa"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Drivers"
            value={stats?.availableDrivers ?? 0}
            icon={<Person />}
            color="#34d399"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Alerts"
            value={stats?.totalAlerts ?? 0}
            icon={<Warning />}
            color="#facc15"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactive Vehicles"
            value={stats?.inactiveVehicles ?? 0}
            icon={<DirectionsCar />}
            color="#94a3b8"
          />
        </Grid>
      </Grid>

      {/* Live map */}
      <Paper sx={{ height: 520, p: 0, overflow: 'hidden' }}>
        <LiveMap locations={liveLocations} geofences={geofences} />
      </Paper>
    </Box>
  );
};

export default DashboardPage;
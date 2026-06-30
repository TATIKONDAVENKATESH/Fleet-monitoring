import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Grid, Paper, List, ListItemButton,
  ListItemText, ListItemAvatar, Avatar, TextField, CircularProgress,
} from '@mui/material';
import { DirectionsCar } from '@mui/icons-material';
import { LiveMap } from '../components/map/LiveMap';
import { RouteReplayMap } from '../components/map/RouteReplayMap';
import { trackingApi, vehicleApi, geofenceApi } from '../api/services';
import { useWebSocket } from '../hooks/useWebSocket';
import type { LiveLocation, Vehicle, Geofence, LocationHistory } from '../types';

const TrackingPage: React.FC = () => {
  const [liveLocations, setLiveLocations] = useState<LiveLocation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [replayData, setReplayData] = useState<LocationHistory[]>([]);
  const [replayStart, setReplayStart] = useState('');
  const [replayEnd, setReplayEnd] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [liveRes, vRes, gRes] = await Promise.all([
        trackingApi.getAllLiveLocations(),
        vehicleApi.getAll(0, 200),
        geofenceApi.getAll(),
      ]);
      setLiveLocations(liveRes.data.data as LiveLocation[]);
      setVehicles(vRes.data.data.content);
      setGeofences(gRes.data.data as Geofence[]);
      setLoading(false);
    };
    load();
  }, []);

  const handleLocationUpdate = useCallback((loc: LiveLocation) => {
    setLiveLocations((prev) => {
      const idx = prev.findIndex((l) => l.vehicleId === loc.vehicleId);
      if (idx >= 0) { const n = [...prev]; n[idx] = loc; return n; }
      return [...prev, loc];
    });
  }, []);
  useWebSocket({ onLocationUpdate: handleLocationUpdate });

  const loadReplay = async () => {
    if (!selectedId || !replayStart || !replayEnd) return;
    const res = await trackingApi.getRouteReplay(selectedId, replayStart, replayEnd);
    setReplayData(res.data.data as LocationHistory[]);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100%"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Live Tracking</Typography>

      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Vehicle List */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>Vehicles</Typography>
            <List dense>
              {vehicles.map((v) => (
                <ListItemButton
                  key={v.id}
                  selected={selectedId === v.id}
                  onClick={() => setSelectedId(v.id)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: v.status === 'ACTIVE' ? 'success.main' : 'error.main', width: 32, height: 32 }}>
                      <DirectionsCar sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={v.vehicleNumber} secondary={v.status} />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Map */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: '100%', overflow: 'hidden' }}>
            <LiveMap
              locations={liveLocations}
              geofences={geofences}
              selectedVehicleId={selectedId}
              onVehicleClick={setSelectedId}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Route Replay Section */}
      {selectedId && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Route Replay</Typography>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              label="Start"
              type="datetime-local"
              size="small"
              value={replayStart}
              onChange={(e) => setReplayStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End"
              type="datetime-local"
              size="small"
              value={replayEnd}
              onChange={(e) => setReplayEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <button onClick={loadReplay} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              Load Route
            </button>
          </Box>
          {replayData.length > 0 && (
            <Box sx={{ height: 300, mt: 2 }}>
              <RouteReplayMap waypoints={replayData} />
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default TrackingPage;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Chip, Divider,
  Button, CircularProgress, List, ListItem, ListItemText,
  Card, CardContent,
} from '@mui/material';
import {
  ArrowBack, DirectionsCar, Person, Speed,
  LocationOn, Schedule,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vehicleApi, trackingApi, alertApi } from '../api/services';
import { StatusChip } from '../components/common/StatusChip';
import type { Vehicle, LiveLocation, Alert, PageResponse } from '../types';

const VehicleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vehicleId = Number(id);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [liveLocation, setLiveLocation] = useState<LiveLocation | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId || isNaN(vehicleId)) {
      setError('Invalid vehicle ID');
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const [vehicleRes, alertRes] = await Promise.all([
          vehicleApi.getById(vehicleId),
          alertApi.getByVehicle(vehicleId, 0, 10),
        ]);

        setVehicle(vehicleRes.data.data as Vehicle);
        const alertData = alertRes.data.data as PageResponse<Alert>;
        setAlerts(alertData.content);

        // Try to get live location — may not exist if vehicle hasn't sent data yet
        try {
          const liveRes = await trackingApi.getLiveLocation(vehicleId);
          setLiveLocation(liveRes.data.data as LiveLocation);
        } catch {
          // Not an error — vehicle may simply have no live data yet
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [vehicleId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !vehicle) {
    return (
      <Box p={3}>
        <Typography color="error">{error ?? 'Vehicle not found'}</Typography>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/vehicles')} sx={{ mt: 2 }}>
          Back to Vehicles
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/vehicles')} variant="outlined">
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          {vehicle.vehicleNumber}
        </Typography>
        <StatusChip status={vehicle.status} />
      </Box>

      <Grid container spacing={3}>
        {/* Vehicle Info */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <DirectionsCar color="primary" />
                <Typography variant="h6" fontWeight={600}>Vehicle Info</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                {[
                  { label: 'Vehicle Number',      value: vehicle.vehicleNumber },
                  { label: 'Type',                value: vehicle.vehicleType },
                  { label: 'Registration',        value: vehicle.registrationNumber },
                  { label: 'Status',              value: <StatusChip status={vehicle.status} /> },
                  { label: 'Assigned Driver',     value: vehicle.driverName ?? '—' },
                  { label: 'Created',             value: format(new Date(vehicle.createdAt), 'PPpp') },
                ].map(({ label, value }) => (
                  <React.Fragment key={label}>
                    <Grid item xs={5}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </Grid>
                    <Grid item xs={7}>
                      <Typography variant="body2" fontWeight={500}>{value}</Typography>
                    </Grid>
                  </React.Fragment>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Live Location */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LocationOn color="success" />
                <Typography variant="h6" fontWeight={600}>Live Location</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {liveLocation ? (
                <Grid container spacing={1}>
                  {[
                    { label: 'Latitude',   value: liveLocation.latitude.toFixed(6) },
                    { label: 'Longitude',  value: liveLocation.longitude.toFixed(6) },
                    { label: 'Speed',      value: liveLocation.speed != null ? `${liveLocation.speed.toFixed(1)} km/h` : '—' },
                    { label: 'Heading',    value: liveLocation.heading != null ? `${liveLocation.heading.toFixed(0)}°` : '—' },
                    { label: 'Last Seen',  value: format(new Date(liveLocation.timestamp), 'PPpp') },
                  ].map(({ label, value }) => (
                    <React.Fragment key={label}>
                      <Grid item xs={5}>
                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                      </Grid>
                      <Grid item xs={7}>
                        <Typography variant="body2" fontWeight={500}>{value}</Typography>
                      </Grid>
                    </React.Fragment>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <LocationOn sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography color="text.secondary" mt={1}>
                    No live location data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Schedule color="warning" />
              <Typography variant="h6" fontWeight={600}>Recent Alerts</Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            {alerts.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={3}>
                No recent alerts for this vehicle
              </Typography>
            ) : (
              <List disablePadding>
                {alerts.map((alert) => (
                  <ListItem key={alert.id} divider sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={alert.alertType.replace('_', ' ')}
                            size="small"
                            color={
                              alert.alertType === 'OVERSPEED' ? 'error' :
                              alert.alertType === 'OFFLINE'   ? 'default' : 'warning'
                            }
                          />
                          <Typography variant="body2">{alert.message}</Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(alert.createdAt), 'PPpp')}
                          {alert.acknowledged && ' · Acknowledged'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleDetailsPage;

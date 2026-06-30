import React, { useState } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, Button,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, MenuItem,
} from '@mui/material';
import { Download, BarChart } from '@mui/icons-material';
import { vehicleApi, trackingApi } from '../api/services';
import type { Vehicle, LocationHistory } from '../types';

const ReportsPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [history, setHistory] = useState<LocationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  React.useEffect(() => {
    vehicleApi.getAll(0, 200).then((r) => setVehicles(r.data.data.content));
  }, []);

  const generateReport = async () => {
    if (!selectedVehicleId || !startDate || !endDate) return;
    setLoading(true);
    try {
      // Use replay endpoint for full ordered list
      const res = await trackingApi.getRouteReplay(
        Number(selectedVehicleId),
        new Date(startDate).toISOString(),
        new Date(endDate).toISOString()
      );
      setHistory(res.data.data as LocationHistory[]);
      setFetched(true);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (!history.length) return;
    const headers = ['id', 'vehicleNumber', 'latitude', 'longitude', 'speed', 'heading', 'recordedAt'];
    const rows = history.map((h) =>
      [h.id, h.vehicleNumber, h.latitude, h.longitude, h.speed ?? '', h.heading ?? '', h.recordedAt].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-report-${selectedVehicleId}-${startDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Derived stats
  const avgSpeed = history.length
    ? (history.reduce((s, h) => s + (h.speed ?? 0), 0) / history.length).toFixed(1)
    : '—';
  const maxSpeed = history.length
    ? Math.max(...history.map((h) => h.speed ?? 0)).toFixed(1)
    : '—';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Reports
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={3}>
            <TextField
              select fullWidth label="Vehicle"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              {vehicles.map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.vehicleNumber}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="Start Date & Time"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth label="End Date & Time"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1}>
              <Button
                variant="contained" startIcon={<BarChart />}
                onClick={generateReport}
                disabled={!selectedVehicleId || !startDate || !endDate || loading}
                fullWidth
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Generate'}
              </Button>
              {fetched && (
                <Button variant="outlined" startIcon={<Download />} onClick={exportCsv}>
                  CSV
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Stats */}
      {fetched && (
        <Grid container spacing={2} mb={3}>
          {[
            { label: 'Total Points', value: history.length },
            { label: 'Avg Speed (km/h)', value: avgSpeed },
            { label: 'Max Speed (km/h)', value: maxSpeed },
          ].map((s) => (
            <Grid item xs={12} md={4} key={s.label}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} color="primary.main">{s.value}</Typography>
                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Data Table */}
      {fetched && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Latitude</TableCell>
                <TableCell>Longitude</TableCell>
                <TableCell>Speed (km/h)</TableCell>
                <TableCell>Heading (°)</TableCell>
                <TableCell>Recorded At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.slice(0, 500).map((h, i) => (
                <TableRow key={h.id} hover>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{h.latitude.toFixed(6)}</TableCell>
                  <TableCell>{h.longitude.toFixed(6)}</TableCell>
                  <TableCell>{h.speed ?? '—'}</TableCell>
                  <TableCell>{h.heading ?? '—'}</TableCell>
                  <TableCell>{new Date(h.recordedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">No data found for selected range</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {history.length > 500 && (
            <Box p={1} textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Showing first 500 of {history.length} records. Export CSV for full data.
              </Typography>
            </Box>
          )}
        </TableContainer>
      )}
    </Box>
  );
};

export default ReportsPage;
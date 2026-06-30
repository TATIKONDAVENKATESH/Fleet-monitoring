import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  IconButton, Tooltip,
} from '@mui/material';
import { CheckCircle, DoneAll, Refresh } from '@mui/icons-material';
import { alertApi } from '../api/services';
import { useWebSocket } from '../hooks/useWebSocket';
import type { Alert, AlertType } from '../types';

const alertColor = (type: AlertType) => {
  switch (type) {
    case 'OVERSPEED': return 'error';
    case 'OFFLINE': return 'warning';
    case 'GEOFENCE_ENTRY': return 'info';
    case 'GEOFENCE_EXIT': return 'default';
  }
};

const AlertPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page] = useState(0);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertApi.getAll(page, 50);
      setAlerts(res.data.data.content);
      setTotal(res.data.data.totalElements);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [page]);

  // Real-time: prepend incoming alert
  const handleAlertUpdate = useCallback((incoming: Alert) => {
    setAlerts((prev) => [incoming, ...prev]);
    setTotal((t) => t + 1);
  }, []);
  useWebSocket({ onAlertUpdate: handleAlertUpdate });

  const acknowledge = async (id: number) => {
    await alertApi.acknowledge(id);
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const acknowledgeAll = async () => {
    await alertApi.acknowledgeAll();
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Alerts <Chip label={total} size="small" color="error" sx={{ ml: 1 }} />
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh"><IconButton onClick={fetchAlerts}><Refresh /></IconButton></Tooltip>
          <Button variant="outlined" startIcon={<DoneAll />} onClick={acknowledgeAll}>
            Acknowledge All
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((a) => (
                <TableRow key={a.id} hover sx={{ opacity: a.acknowledged ? 0.6 : 1 }}>
                  <TableCell>
                    <Chip label={a.alertType} size="small" color={alertColor(a.alertType) as any} />
                  </TableCell>
                  <TableCell>{a.vehicleNumber}</TableCell>
                  <TableCell>{a.message}</TableCell>
                  <TableCell>{new Date(a.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={a.acknowledged ? 'Acknowledged' : 'Pending'}
                      size="small"
                      color={a.acknowledged ? 'success' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {!a.acknowledged && (
                      <Tooltip title="Acknowledge">
                        <IconButton size="small" color="success" onClick={() => acknowledge(a.id)}>
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {alerts.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No alerts</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AlertPage;
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { StatusChip } from '../components/common/StatusChip';
import { vehicleApi, driverApi } from '../api/services';
import type { Vehicle, VehicleRequest, Driver } from '../types';

const VEHICLE_TYPES = ['CAR', 'TRUCK', 'VAN', 'MOTORCYCLE', 'BUS', 'OTHER'] as const;

const defaultForm: VehicleRequest = {
  vehicleNumber: '',
  vehicleType: 'CAR',
  registrationNumber: '',
  driverId: undefined,
};

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<VehicleRequest>(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [vRes, dRes] = await Promise.all([
        vehicleApi.getAll(0, 100),
        driverApi.getAll(0, 100),
      ]);
      setVehicles(vRes.data.data.content);
      setDrivers(dRes.data.data.content);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditId(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (v: Vehicle) => {
    setEditId(v.id);
    setForm({ vehicleNumber: v.vehicleNumber, vehicleType: v.vehicleType, registrationNumber: v.registrationNumber, driverId: v.driverId });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) await vehicleApi.update(editId, form);
      else await vehicleApi.create(form);
      setDialogOpen(false);
      fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this vehicle?')) return;
    await vehicleApi.delete(id);
    fetchAll();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Vehicles</Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh"><IconButton onClick={fetchAll}><Refresh /></IconButton></Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Vehicle</Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>{v.vehicleNumber}</TableCell>
                  <TableCell>{v.vehicleType}</TableCell>
                  <TableCell>{v.registrationNumber}</TableCell>
                  <TableCell>{v.driverName ?? '—'}</TableCell>
                  <TableCell><StatusChip status={v.status} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(v)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(v.id)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {vehicles.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No vehicles found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Vehicle Number" value={form.vehicleNumber}
            onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} fullWidth required />
          <TextField select label="Type" value={form.vehicleType}
            onChange={(e) => setForm({ ...form, vehicleType: e.target.value as any })} fullWidth>
            {VEHICLE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField label="Registration Number" value={form.registrationNumber}
            onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} fullWidth required />
          <TextField select label="Driver (optional)" value={form.driverId ?? ''}
            onChange={(e) => setForm({ ...form, driverId: e.target.value ? Number(e.target.value) : undefined })} fullWidth>
            <MenuItem value="">None</MenuItem>
            {drivers.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehiclesPage;
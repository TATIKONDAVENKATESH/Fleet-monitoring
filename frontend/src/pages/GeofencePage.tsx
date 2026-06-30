import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Switch,
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import { geofenceApi } from '../api/services';
import type { Geofence, GeofenceRequest } from '../types';

const defaultForm: GeofenceRequest = {
  name: '',
  centerLatitude: 0,
  centerLongitude: 0,
  radiusMeters: 500,
};

const GeofencePage: React.FC = () => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<GeofenceRequest>(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await geofenceApi.getAll();
      setGeofences(res.data.data as Geofence[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditId(null); setForm(defaultForm); setDialogOpen(true); };
  const openEdit = (g: Geofence) => {
    setEditId(g.id);
    setForm({
      name: g.name,
      centerLatitude: g.centerLatitude,
      centerLongitude: g.centerLongitude,
      radiusMeters: g.radiusMeters,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) await geofenceApi.update(editId, form);
      else await geofenceApi.create(form);
      setDialogOpen(false);
      fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this geofence?')) return;
    await geofenceApi.delete(id);
    fetchAll();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Geofences</Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh"><IconButton onClick={fetchAll}><Refresh /></IconButton></Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Geofence</Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Center Latitude</TableCell>
                <TableCell>Center Longitude</TableCell>
                <TableCell>Radius (m)</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {geofences.map((g) => (
                <TableRow key={g.id} hover>
                  <TableCell>{g.name}</TableCell>
                  <TableCell>{g.centerLatitude.toFixed(5)}</TableCell>
                  <TableCell>{g.centerLongitude.toFixed(5)}</TableCell>
                  <TableCell>{g.radiusMeters}m</TableCell>
                  <TableCell>
                    <Switch checked={g.active} size="small" disabled />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(g)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(g.id)}><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {geofences.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center">No geofences configured</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Geofence' : 'Create Geofence'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth required />
          <TextField label="Center Latitude" type="number" value={form.centerLatitude}
            onChange={(e) => setForm({ ...form, centerLatitude: parseFloat(e.target.value) })} fullWidth required />
          <TextField label="Center Longitude" type="number" value={form.centerLongitude}
            onChange={(e) => setForm({ ...form, centerLongitude: parseFloat(e.target.value) })} fullWidth required />
          <TextField label="Radius (metres)" type="number" value={form.radiusMeters}
            onChange={(e) => setForm({ ...form, radiusMeters: parseFloat(e.target.value) })} fullWidth required />
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

export default GeofencePage;
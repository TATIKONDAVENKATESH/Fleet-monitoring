import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button,
  Avatar, Divider, Alert, CircularProgress,
} from '@mui/material';
import { Person, Lock } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { profileApi } from '../api/services';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (newPw !== confirmPw) { setError('New passwords do not match'); return; }
    if (newPw.length < 6) { setError('Password must be at least 6 characters'); return; }

    setSaving(true);
    try {
      await profileApi.changePassword(currentPw, newPw);
      setSuccess('Password updated successfully');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} mb={3}>Profile</Typography>

      {/* User Info Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={3} mb={3}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.dark', fontSize: 28 }}>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>{user?.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'DM Mono',
                bgcolor: 'primary.dark',
                color: 'primary.light',
                px: 1, py: 0.25,
                borderRadius: 1,
                mt: 0.5,
                display: 'inline-block',
              }}
            >
              {user?.role}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth label="Full Name" value={user?.name ?? ''} disabled
              InputProps={{ startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} /> }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Email" value={user?.email ?? ''} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Role" value={user?.role ?? ''} disabled />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="User ID" value={user?.userId ?? ''} disabled />
          </Grid>
        </Grid>
      </Paper>

      {/* Change Password */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Lock color="primary" />
          <Typography variant="h6" fontWeight={600}>Change Password</Typography>
        </Box>

        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handlePasswordChange}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth label="Current Password" type="password"
                value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="New Password" type="password"
                value={newPw} onChange={(e) => setNewPw(e.target.value)} required
                helperText="Minimum 6 characters"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Confirm New Password" type="password"
                value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? <CircularProgress size={20} color="inherit" /> : 'Update Password'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
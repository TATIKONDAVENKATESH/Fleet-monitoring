import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Slider, Typography, IconButton, Stack } from '@mui/material';
import { PlayArrow, Pause, Replay } from '@mui/icons-material';
import type { LocationHistory } from '../../types';

const startIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#4ade80;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
});
const endIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#f87171;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7],
});
const vehicleIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#38bdf8;border:3px solid #0ea5e9;box-shadow:0 4px 12px rgba(56,189,248,0.5);display:flex;align-items:center;justify-content:center;font-size:10px">🚗</div>`,
  iconSize: [20, 20], iconAnchor: [10, 10],
});

interface RouteReplayMapProps {
  waypoints: LocationHistory[];
}

const FitBounds: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length]);
  return null;
};

export const RouteReplayMap: React.FC<RouteReplayMapProps> = ({ waypoints }) => {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const points: [number, number][] = waypoints.map((h) => [h.latitude, h.longitude]);
  const currentPoint = points[Math.min(progress, points.length - 1)];

  // Reset when new waypoints arrive
  useEffect(() => {
    setProgress(0);
    setPlaying(false);
  }, [waypoints]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= waypoints.length - 1) { setPlaying(false); return p; }
          return p + 1;
        });
      }, 200);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, waypoints.length]);

  const reset = () => { setPlaying(false); setProgress(0); };

  if (waypoints.length === 0) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%"
        sx={{ color: 'text.secondary', fontSize: 14 }}>
        No route data to display
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ flex: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(148,163,184,0.1)' }}>
        <MapContainer
          center={points[0] || [20, 0]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='© CARTO'
          />
          <FitBounds points={points} />

          {/* Full route (faded) */}
          {points.length > 1 && (
            <Polyline positions={points} pathOptions={{ color: '#475569', weight: 2, opacity: 0.4 }} />
          )}

          {/* Traveled route */}
          {progress > 0 && (
            <Polyline
              positions={points.slice(0, progress + 1)}
              pathOptions={{ color: '#38bdf8', weight: 3 }}
            />
          )}

          {points.length > 0 && <Marker position={points[0]} icon={startIcon} />}
          {points.length > 1 && <Marker position={points[points.length - 1]} icon={endIcon} />}
          {currentPoint && <Marker position={currentPoint} icon={vehicleIcon} />}
        </MapContainer>
      </Box>

      {/* Controls */}
      <Box sx={{ px: 1 }}>
        <Slider
          value={progress}
          min={0} max={Math.max(waypoints.length - 1, 1)}
          onChange={(_, v) => { setProgress(v as number); }}
          size="small"
          sx={{ color: 'primary.main' }}
        />
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" onClick={() => setPlaying(!playing)} sx={{ color: 'primary.main' }}>
            {playing ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton size="small" onClick={reset} sx={{ color: 'text.secondary' }}>
            <Replay />
          </IconButton>
          <Typography variant="caption" sx={{ fontFamily: 'DM Mono', color: 'text.secondary', flexGrow: 1, textAlign: 'right' }}>
            {progress + 1} / {waypoints.length} points
            {waypoints[progress] && ` · ${new Date(waypoints[progress].recordedAt).toLocaleTimeString()}`}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};
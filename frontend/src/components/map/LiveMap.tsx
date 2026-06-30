import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { LiveLocation, Geofence } from '../../types';
import { Box, Typography, Chip } from '@mui/material';

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const vehicleIcon = (status: string) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:36px; height:36px; border-radius:50%;
        background: ${status === 'ACTIVE' ? '#38bdf8' : status === 'OFFLINE' ? '#f87171' : '#94a3b8'};
        border: 3px solid ${status === 'ACTIVE' ? '#0ea5e9' : status === 'OFFLINE' ? '#dc2626' : '#64748b'};
        display:flex; align-items:center; justify-content:center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        color: white; font-size: 16px;
      ">🚗</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

interface LiveMapProps {
  locations: LiveLocation[];
  geofences?: Geofence[];
  selectedVehicleId?: number;
  onVehicleClick?: (vehicleId: number) => void;
}

const MapUpdater: React.FC<{ locations: LiveLocation[]; selected?: number }> = ({ locations, selected }) => {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      const loc = locations.find((l) => l.vehicleId === selected);
      if (loc) map.setView([loc.latitude, loc.longitude], 14, { animate: true });
    } else if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]));
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [selected, locations.length]);
  return null;
};

export const LiveMap: React.FC<LiveMapProps> = ({
  locations, geofences = [], selectedVehicleId, onVehicleClick,
}) => (
  <Box sx={{ height: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(148,163,184,0.1)' }}>
    <MapContainer
      center={locations.length > 0 ? [locations[0].latitude, locations[0].longitude] : [20, 0]}
      zoom={locations.length > 0 ? 10 : 2}
      style={{ height: '100%', width: '100%', background: '#0f172a' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='© <a href="https://carto.com/">CARTO</a>'
      />

      <MapUpdater locations={locations} selected={selectedVehicleId} />

      {/* Geofences */}
      {geofences.filter((g) => g.active).map((g) => (
        <Circle
          key={g.id}
          center={[g.centerLatitude, g.centerLongitude]}
          radius={g.radiusMeters}
          pathOptions={{
            color: '#fb923c',
            fillColor: '#fb923c',
            fillOpacity: 0.08,
            weight: 2,
            dashArray: '6 4',
          }}
        >
          <Popup>
            <Box sx={{ p: 0.5 }}>
              <Typography variant="subtitle2">{g.name}</Typography>
              <Typography variant="caption">Radius: {g.radiusMeters}m</Typography>
            </Box>
          </Popup>
        </Circle>
      ))}

      {/* Vehicle markers */}
      {locations.map((loc) => (
        <Marker
          key={loc.vehicleId}
          position={[loc.latitude, loc.longitude]}
          icon={vehicleIcon(loc.status)}
          eventHandlers={{ click: () => onVehicleClick?.(loc.vehicleId) }}
        >
          <Popup>
            <Box sx={{ minWidth: 160 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {loc.vehicleNumber}
              </Typography>
              <Typography variant="caption" display="block">
                Lat: {loc.latitude.toFixed(5)}
              </Typography>
              <Typography variant="caption" display="block">
                Lon: {loc.longitude.toFixed(5)}
              </Typography>
              {loc.speed !== undefined && (
                <Typography variant="caption" display="block">
                  Speed: {loc.speed} km/h
                </Typography>
              )}
              <Chip
                label={loc.status}
                size="small"
                color={loc.status === 'ACTIVE' ? 'success' : loc.status === 'OFFLINE' ? 'error' : 'default'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  </Box>
);
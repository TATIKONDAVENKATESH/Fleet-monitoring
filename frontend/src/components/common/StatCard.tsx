import React from 'react';
import { Card, CardContent, Box, Typography, SvgIconProps } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactElement<SvgIconProps>;
  color?: string;
  trend?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon, color = '#38bdf8', trend,
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            width: 48, height: 48, borderRadius: 2,
            background: `${color}18`,
            border: `1px solid ${color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 24 } })}
        </Box>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: trend >= 0 ? 'success.main' : 'error.main' }}>
            {trend >= 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
            <Typography variant="caption" sx={{ fontFamily: 'DM Mono' }}>
              {Math.abs(trend)}%
            </Typography>
          </Box>
        )}
      </Box>
      <Typography variant="h4" sx={{ fontFamily: 'Syne', fontWeight: 800, color, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'DM Mono' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);
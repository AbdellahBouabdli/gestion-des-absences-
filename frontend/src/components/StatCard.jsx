import { Box, Card, LinearProgress, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

const tones = {
  primary: { color: '#10263b', bg: '#edf3f8' },
  secondary: { color: '#0f9d8a', bg: '#e7f8f4' },
  error: { color: '#e76f51', bg: '#fdf0ec' },
  warning: { color: '#c98a22', bg: '#fdf5e6' },
  info: { color: '#3b82f6', bg: '#ebf2fe' },
  success: { color: '#2e9e6b', bg: '#eaf7f0' },
};

export default function StatCard({ icon, label, value, hint, tone = 'primary', progress, sx }) {
  const palette = tones[tone] || tones.primary;
  return (
    <Card sx={{ height: '100%', ...sx }}>
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: 12.5,
                display: 'block',
                mb: 1,
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Manrope Variable', sans-serif",
                fontSize: { xs: 28, sm: 32 },
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                color: 'text.primary',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box className="stat-icon" sx={{ bgcolor: palette.bg, color: palette.color }}>
            {icon}
          </Box>
        </Stack>
        {typeof progress === 'number' && (
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, progress))}
            sx={{
              mt: 2,
              bgcolor: alpha(palette.color, 0.1),
              '& .MuiLinearProgress-bar': { bgcolor: palette.color },
            }}
          />
        )}
        {hint && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.4, fontSize: 11.8 }}>
            {hint}
          </Typography>
        )}
      </Box>
    </Card>
  );
}

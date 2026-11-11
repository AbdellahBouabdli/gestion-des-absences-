import { Box, Typography } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

export default function BrandMark({ inverse = false, compact = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4, minWidth: 0 }}>
      <Box
        sx={{
          width: compact ? 38 : 44,
          height: compact ? 38 : 44,
          borderRadius: compact ? 2.2 : 2.6,
          display: 'grid',
          placeItems: 'center',
          background: inverse
            ? 'linear-gradient(145deg, #1b4364 0%, #0f2c45 100%)'
            : 'linear-gradient(145deg, #123a5a 0%, #0a2237 100%)',
          color: '#5ad1c0',
          border: inverse ? '1px solid rgba(255,255,255,.14)' : '1px solid #0d2338',
          boxShadow: inverse ? '0 8px 20px rgba(0,0,0,.2)' : '0 8px 18px rgba(16,38,59,.18)',
          flexShrink: 0,
        }}
      >
        <SchoolRoundedIcon sx={{ fontSize: compact ? 21 : 24 }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          noWrap
          sx={{
            fontFamily: "'Manrope Variable', sans-serif",
            fontWeight: 800,
            fontSize: compact ? 16 : 18,
            letterSpacing: '-0.035em',
            color: inverse ? '#fff' : 'text.primary',
            lineHeight: 1.15,
          }}
        >
          Campus <Box component="span" sx={{ color: inverse ? '#5ad1c0' : 'secondary.main' }}>Présence</Box>
        </Typography>
        {!compact && (
          <Typography
            variant="caption"
            sx={{ color: inverse ? 'rgba(255,255,255,.5)' : 'text.secondary', fontSize: 10.5, letterSpacing: '.06em' }}
          >
            GESTION DES ABSENCES
          </Typography>
        )}
      </Box>
    </Box>
  );
}

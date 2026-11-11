import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export function PageLoader({ label = 'Chargement des données…' }) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 10, color: 'text.secondary' }}>
      <CircularProgress size={28} thickness={4} />
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}

export function PageError({ message, onRetry }) {
  return (
    <Box
      sx={{
        border: '1px solid #f3d6ce',
        bgcolor: '#fdf5f2',
        borderRadius: 3,
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography sx={{ fontWeight: 700, color: '#a8452f', mb: 0.5 }}>Impossible de charger les données</Typography>
      <Typography variant="body2" sx={{ color: '#8b5a4c', mb: 2 }}>
        {message}
      </Typography>
      {onRetry && (
        <Box component="button" onClick={onRetry} sx={{ border: 0, bgcolor: 'transparent', color: '#a8452f', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
          Réessayer
        </Box>
      )}
    </Box>
  );
}

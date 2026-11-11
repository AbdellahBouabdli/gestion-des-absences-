import { Box, Button, Stack, Typography } from '@mui/material';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

export default function EmptyState({ icon, title, description, action, compact = false }) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      spacing={1.5}
      sx={{ py: compact ? 4 : 7, px: 2 }}
    >
      <Box
        sx={{
          width: 58,
          height: 58,
          borderRadius: 3.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: '#f1f5f9',
          color: '#8a9cb0',
          mb: 0.5,
        }}
      >
        {icon || <InboxRoundedIcon />}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 750 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
}

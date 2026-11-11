import { Box, Stack, Typography } from '@mui/material';

export default function PageHeader({ eyebrow, title, subtitle, actions, mb = 3 }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography
            variant="overline"
            sx={{ color: 'secondary.main', fontSize: 11, display: 'block', mb: 0.4 }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h4" sx={{ fontSize: { xs: 26, sm: 32 }, color: 'text.primary' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.7, maxWidth: 680 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

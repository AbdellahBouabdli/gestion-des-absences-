import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

export default function SectionCard({ title, subtitle, action, children, contentSx, sx }) {
  return (
    <Card sx={{ height: '100%', ...sx }}>
      {(title || action) && (
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
          sx={{ px: { xs: 2.5, sm: 3 }, pt: { xs: 2.5, sm: 3 } }}
        >
          <Box>
            {title && (
              <Typography variant="h6" sx={{ fontSize: 17 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.4 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
      )}
      <CardContent sx={{ px: { xs: 2.5, sm: 3 }, pt: 2, ...contentSx }}>{children}</CardContent>
    </Card>
  );
}

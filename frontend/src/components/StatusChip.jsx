import { Box, Chip } from '@mui/material';
import { absenceMeta, justificationMeta } from '../utils/format';

export default function StatusChip({ status, kind = 'absence', size = 'small', sx }) {
  if (!status) return null;
  const meta = kind === 'justification' ? justificationMeta[status] : absenceMeta[status];
  if (!meta) return null;
  return (
    <Chip
      size={size}
      label={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8 }}>
          <Box
            component="span"
            sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: meta.tone, display: 'inline-block' }}
          />
          {meta.label}
        </Box>
      }
      sx={{
        bgcolor: `${meta.tone}14`,
        color: meta.tone,
        border: `1px solid ${meta.tone}26`,
        fontWeight: 700,
        ...sx,
      }}
    />
  );
}

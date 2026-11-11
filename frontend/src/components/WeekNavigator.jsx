import { Box, IconButton, Stack, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import dayjs from 'dayjs';

export default function WeekNavigator({ start, onPrevious, onNext, onToday, label }) {
  const from = dayjs(start);
  const to = from.add(6, 'day');
  const sameMonth = from.month() === to.month();
  const range = sameMonth
    ? `${from.format('D')} – ${to.format('D MMMM YYYY')}`
    : `${from.format('D MMM')} – ${to.format('D MMM YYYY')}`;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        p: 1,
        pl: 1.5,
        borderRadius: 3,
        border: '1px solid #e7edf3',
        bgcolor: '#fff',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 650, display: 'block' }}>
          {label || 'Semaine'}
        </Typography>
        <Typography sx={{ fontWeight: 750, fontSize: 14 }}>{range}</Typography>
      </Box>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <IconButton size="small" onClick={onPrevious} aria-label="Semaine précédente">
          <ChevronLeftRoundedIcon />
        </IconButton>
        <Box
          component="button"
          onClick={onToday}
          sx={{
            border: 0,
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 700,
            color: 'secondary.dark',
            bgcolor: '#e9f8f5',
            borderRadius: 2,
            px: 1.5,
            py: 0.8,
            cursor: 'pointer',
          }}
        >
          Aujourd&apos;hui
        </Box>
        <IconButton size="small" onClick={onNext} aria-label="Semaine suivante">
          <ChevronRightRoundedIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}

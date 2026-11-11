import { Box, Chip, Stack, Typography } from '@mui/material';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import dayjs from 'dayjs';
import EmptyState from './EmptyState';
import { formatDate, formatTime } from '../utils/format';

const palette = ['#0f9d8a', '#3b82f6', '#e9a23b', '#8b5cf6', '#ec4899', '#e76f51', '#0891b2'];
const colorFor = (code = '') =>
  palette[[...code].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length];

export default function ScheduleView({ sessions = [], perspective = 'student', emptyAction }) {
  const grouped = sessions.reduce((acc, session) => {
    (acc[session.date] ||= []).push(session);
    return acc;
  }, {});

  if (!sessions.length) {
    return (
      <EmptyState
        icon={<EventBusyRoundedIcon />}
        title="Aucune séance cette semaine"
        description="Votre emploi du temps est libre sur cette période. Utilisez les flèches pour consulter une autre semaine."
        action={emptyAction}
      />
    );
  }

  return (
    <Stack spacing={3}>
      {Object.entries(grouped).map(([date, items]) => {
        const isToday = dayjs(date).isSame(dayjs(), 'day');
        return (
          <Box key={date}>
            <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1.4 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  textTransform: 'capitalize',
                  color: isToday ? 'secondary.dark' : 'text.primary',
                  fontWeight: 750,
                  fontSize: 14,
                }}
              >
                {formatDate(date, 'dddd D MMMM')}
              </Typography>
              {isToday && (
                <Chip
                  label="Aujourd'hui"
                  size="small"
                  sx={{ bgcolor: '#e6f8f4', color: 'secondary.dark', height: 22, fontSize: 10.5 }}
                />
              )}
              <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {items.length} séance{items.length > 1 ? 's' : ''}
              </Typography>
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.5,
                ml: { xs: 0, sm: 1.5 },
                pl: { xs: 0, sm: 2 },
                borderLeft: { xs: 0, sm: '2px solid #e9eef4' },
              }}
            >
              {items.map((session) => {
                const color = colorFor(session.courseCode);
                return (
                  <Box
                    key={session.id}
                    className="session-card"
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2,
                      bgcolor: isToday ? '#fbfefd' : '#fff',
                      border: '1px solid',
                      borderColor: isToday ? '#cdeee7' : '#e7edf3',
                      borderLeft: `4px solid ${color}`,
                      borderRadius: 2.8,
                    }}
                  >
                    <Box sx={{ width: 58, flexShrink: 0 }}>
                      <Typography sx={{ fontWeight: 750, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(session.startTime)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(session.endTime)}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 0.3 }}>
                        <Typography
                          variant="caption"
                          sx={{ color, fontWeight: 750, fontSize: 10.5, letterSpacing: '.05em' }}
                        >
                          {session.courseCode}
                        </Typography>
                      </Stack>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 14.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {session.courseName}
                      </Typography>
                      <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
                        {perspective === 'student' ? (
                          <Stack direction="row" alignItems="center" spacing={0.4}>
                            <PersonOutlineRoundedIcon sx={{ fontSize: 14, color: '#8a9cb0' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11.5 }}>
                              {session.teacherName}
                            </Typography>
                          </Stack>
                        ) : (
                          <Stack direction="row" alignItems="center" spacing={0.4}>
                            <Groups2OutlinedIcon sx={{ fontSize: 14, color: '#8a9cb0' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11.5 }}>
                              {session.groupName}
                            </Typography>
                          </Stack>
                        )}
                        <Stack direction="row" alignItems="center" spacing={0.4}>
                          <PlaceOutlinedIcon sx={{ fontSize: 14, color: '#8a9cb0' }} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11.5 }}>
                            Salle {session.room}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

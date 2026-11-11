import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import SectionCard from '../../components/SectionCard';
import StatusChip from '../../components/StatusChip';
import EmptyState from '../../components/EmptyState';
import { PageError, PageLoader } from '../../components/PageLoader';
import { studentApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTime } from '../../utils/format';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: studentApi.dashboard,
  });

  if (isLoading) return <PageLoader label="Chargement de votre situation…" />;
  if (isError) return <PageError message={getErrorMessage(error)} onRetry={refetch} />;

  const next = data.nextSessions?.[0];
  const attendance = Math.max(0, Math.round((100 - data.absenceRate) * 10) / 10);

  return (
    <>
      <PageHeader
        eyebrow="Espace étudiant"
        title={`Bonjour, ${user.firstName}`}
        subtitle={`${user.groupName ? `${user.groupName} · ` : ''}Voici un aperçu de votre assiduité et de vos prochaines séances.`}
        actions={
          <Button variant="outlined" startIcon={<CalendarMonthRoundedIcon />} onClick={() => navigate('/student/schedule')}>
            Mon emploi du temps
          </Button>
        }
      />

      {data.pendingJustifications > 0 && (
        <Chip
          icon={<TaskAltRoundedIcon sx={{ fontSize: 15 }} />}
          label={`${data.pendingJustifications} justificatif(s) en cours de vérification`}
          onClick={() => navigate('/student/justifications')}
          sx={{ mb: 2.5, bgcolor: '#fdf5e6', color: 'warning.dark', height: 34, cursor: 'pointer' }}
        />
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' },
          gap: 2,
          mb: 2.5,
        }}
      >
        <StatCard icon={<PercentRoundedIcon />} label="Taux d’absence" value={`${data.absenceRate}%`} tone="warning" progress={data.absenceRate} hint={`Assiduité : ${attendance}%`} />
        <StatCard icon={<EventBusyRoundedIcon />} label="Absences" value={data.totalAbsences} tone="error" hint={`${data.justifiedAbsences} justifiée(s)`} />
        <StatCard icon={<TaskAltRoundedIcon />} label="Justifiées" value={data.justifiedAbsences} tone="success" hint="Validées par l’enseignant" />
        <StatCard icon={<CalendarMonthRoundedIcon />} label="Séances suivies" value={data.totalSessions} tone="primary" hint="Depuis le début du semestre" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' }, gap: 2.5, mb: 2.5 }}>
        <Card
          sx={{
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            border: 0,
            background: 'linear-gradient(135deg, #13344f 0%, #0d2940 55%, #0a2034 100%)',
            minHeight: 230,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(69,199,181,.22), transparent 68%)',
              right: -100,
              bottom: -140,
            }}
          />
          <Box className="hero-grid" sx={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
          <Box sx={{ position: 'relative', p: { xs: 2.6, sm: 3.2 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontSize: 10, letterSpacing: '.14em', color: 'rgba(255,255,255,.45)', fontWeight: 700 }}>
              PROCHAINE SÉANCE
            </Typography>
            {next ? (
              <>
                <Typography sx={{ fontFamily: "'Manrope Variable'", fontSize: { xs: 25, sm: 31 }, fontWeight: 800, letterSpacing: '-0.04em', mt: 0.8, lineHeight: 1.15 }}>
                  {next.courseName}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.2, flexWrap: 'wrap', gap: 0.8 }}>
                  <Chip size="small" label={formatDate(next.date, 'dddd D MMMM')} sx={{ bgcolor: 'rgba(255,255,255,.09)', color: '#eaf5f3' }} />
                  <Chip size="small" label={`${formatTime(next.startTime)} – ${formatTime(next.endTime)}`} sx={{ bgcolor: 'rgba(69,199,181,.18)', color: '#74e0d1' }} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ mt: 'auto', pt: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={0.7}>
                    <PersonOutlineRoundedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,.5)' }} />
                    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>{next.teacherName}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.7}>
                    <PlaceOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,.5)' }} />
                    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>Salle {next.room}</Typography>
                  </Stack>
                </Stack>
              </>
            ) : (
              <EmptyState
                title="Aucune séance à venir"
                description="Votre emploi du temps sera mis à jour dès qu’une nouvelle séance sera planifiée."
              />
            )}
          </Box>
        </Card>

        <SectionCard title="Votre assiduité" subtitle="Depuis le début du semestre">
          <Stack direction="row" alignItems="center" spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
              <CircularProgress
                variant="determinate"
                value={Math.min(100, attendance)}
                size={124}
                thickness={5.5}
                sx={{ color: attendance >= 85 ? 'secondary.main' : attendance >= 70 ? 'warning.main' : 'error.main' }}
              />
              <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontFamily: "'Manrope Variable'", fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
                    {attendance}%
                  </Typography>
                  <Typography sx={{ fontSize: 9.5, color: 'text.secondary' }}>assiduité</Typography>
                </Box>
              </Box>
            </Box>
            <Stack spacing={1.4} sx={{ flex: 1 }}>
              <Box>
                <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>Absences enregistrées</Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 750 }}>{data.totalAbsences}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>Justificatifs approuvés</Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 750, color: 'success.dark' }}>{data.justifiedAbsences}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 10.5, color: 'text.secondary' }}>En attente de validation</Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 750, color: 'warning.dark' }}>{data.pendingJustifications}</Typography>
              </Box>
            </Stack>
          </Stack>
        </SectionCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.25fr 1fr' }, gap: 2.5 }}>
        <SectionCard
          title="Absences par cours"
          subtitle="Pour repérer les matières à surveiller"
          action={
            <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/student/absences')}>
              Détails
            </Button>
          }
          contentSx={{ pt: 1 }}
        >
          {data.courseStats?.length ? (
            <Stack spacing={2.2} sx={{ mt: 1 }}>
              {data.courseStats.map((course) => (
                <Box key={course.courseName}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.7 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 650 }}>{course.courseName}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {course.absences} absence(s) · {course.sessions} séance(s)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, course.rate)}
                    sx={{
                      height: 8,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: course.rate > 30 ? 'error.main' : course.rate > 15 ? 'warning.main' : 'secondary.main',
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: 10, color: 'text.secondary', mt: 0.4, textAlign: 'right' }}>
                    Taux : {course.rate}%
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <EmptyState compact title="Aucune absence" description="Vous n’avez aucune absence enregistrée pour le moment." />
          )}
        </SectionCard>

        <SectionCard
          title="Dernières absences"
          subtitle="Vos enregistrements récents"
          action={
            <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/student/absences')}>
              Tout voir
            </Button>
          }
          contentSx={{ pt: 1 }}
        >
          {data.recentAbsences?.length ? (
            <Stack spacing={1.2} sx={{ mt: 0.5 }}>
              {data.recentAbsences.map((absence) => (
                <Stack
                  key={absence.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1.5}
                  sx={{ p: 1.5, border: '1px solid #edf1f5', borderRadius: 2.4, bgcolor: '#fbfcfd' }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: 12.3, fontWeight: 650 }}>{absence.courseName}</Typography>
                    <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.3 }}>
                      <ScheduleRoundedIcon sx={{ fontSize: 12, color: '#9aabba' }} />
                      <Typography sx={{ fontSize: 10.6, color: 'text.secondary', textTransform: 'capitalize' }}>
                        {formatDate(absence.date, 'ddd D MMM')} · {formatTime(absence.startTime)}
                      </Typography>
                    </Stack>
                  </Box>
                  <StatusChip status={absence.status} />
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyState compact title="Aucune absence récente" />
          )}
        </SectionCard>
      </Box>
    </>
  );
}

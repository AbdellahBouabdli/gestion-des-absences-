import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import SectionCard from '../../components/SectionCard';
import ChartTooltip from '../../components/ChartTooltip';
import StatusChip from '../../components/StatusChip';
import UserAvatar from '../../components/UserAvatar';
import { PageError, PageLoader } from '../../components/PageLoader';
import EmptyState from '../../components/EmptyState';
import { teacherApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../api/client';
import { formatDate, formatTime } from '../../utils/format';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: teacherApi.dashboard,
  });

  if (isLoading) return <PageLoader label="Préparation de votre tableau de bord…" />;
  if (isError) return <PageError message={getErrorMessage(error)} onRetry={refetch} />;

  const chartData = data.weeklyTrend || [];
  const maxRate = Math.max(100, ...(data.groupStats || []).map((group) => group.rate));

  return (
    <>
      <PageHeader
        eyebrow="Espace enseignant"
        title={`Bonjour, ${user.firstName}`}
        subtitle="Voici l’activité de vos groupes et les actions qui attendent votre attention."
        actions={
          <>
            <Button variant="outlined" startIcon={<CalendarMonthRoundedIcon />} onClick={() => navigate('/teacher/schedule')}>
              Emploi du temps
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/teacher/absences?new=1')}>
              Nouvelle absence
            </Button>
          </>
        }
      />

      {data.pendingJustifications > 0 && (
        <Alert
          severity="warning"
          icon={<FactCheckRoundedIcon />}
          action={
            <Button color="inherit" size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/teacher/justifications')}>
              Vérifier
            </Button>
          }
          sx={{ mb: 2.5, alignItems: 'center', bgcolor: '#fdf8ed', border: '1px solid #f4e6c7' }}
        >
          <Typography sx={{ fontSize: 12.8 }}>
            <strong>{data.pendingJustifications} justificatif{data.pendingJustifications > 1 ? 's' : ''}</strong> en attente de votre validation.
          </Typography>
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
          mb: 2.5,
        }}
      >
        <StatCard icon={<GroupsRoundedIcon />} label="Groupes suivis" value={data.totalGroups} hint={`${data.totalStudents} étudiants au total`} tone="primary" />
        <StatCard icon={<PeopleAltRoundedIcon />} label="Étudiants" value={data.totalStudents} hint="Répartis sur vos groupes" tone="info" />
        <StatCard icon={<EventBusyRoundedIcon />} label="Absences ce mois" value={data.absencesThisMonth} hint={`${data.justifiedAbsences} justifiée(s)`} tone="error" />
        <StatCard icon={<PercentRoundedIcon />} label="Taux d’absence" value={`${data.absenceRate}%`} hint="Sur les séances du mois" tone="warning" progress={data.absenceRate} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.65fr 1fr' }, gap: 2.5, mb: 2.5 }}>
        <SectionCard
          title="Évolution des absences"
          subtitle="Six dernières semaines · toutes vos séances"
          action={<Chip size="small" label="6 semaines" sx={{ bgcolor: '#eef7f5', color: 'secondary.dark' }} />}
        >
          <Box sx={{ height: 260, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="teacherAbsenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f9d8a" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0f9d8a" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 5" stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={34} />
                <Tooltip content={<ChartTooltip suffix=" absence(s)" />} cursor={{ stroke: '#d7e5ef', strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="value" stroke="#0f9d8a" strokeWidth={2.6} fill="url(#teacherAbsenceGradient)" activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>

        <SectionCard
          title="Aujourd’hui"
          subtitle={`${data.todaySessions?.length || 0} séance(s) programmée(s)`}
          action={
            <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/teacher/schedule')}>
              Voir
            </Button>
          }
        >
          {data.todaySessions?.length ? (
            <Stack spacing={1.3} sx={{ mt: 1 }}>
              {data.todaySessions.map((session) => (
                <Stack
                  key={session.id}
                  direction="row"
                  spacing={1.5}
                  sx={{ p: 1.5, borderRadius: 2.4, border: '1px solid #edf1f5', bgcolor: '#fbfcfd' }}
                >
                  <Box
                    sx={{
                      width: 52,
                      flexShrink: 0,
                      borderRadius: 2,
                      bgcolor: '#eaf7f4',
                      color: 'secondary.dark',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 0.8,
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
                      {formatTime(session.startTime)}
                    </Typography>
                    <Typography sx={{ fontSize: 9, fontWeight: 600, opacity: 0.7 }}>{formatTime(session.endTime)}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 700 }}>
                      {session.courseName}
                    </Typography>
                    <Stack direction="row" spacing={1.4} sx={{ mt: 0.4 }}>
                      <Typography sx={{ fontSize: 10.8, color: 'text.secondary' }}>{session.groupName}</Typography>
                      <Stack direction="row" alignItems="center" spacing={0.3}>
                        <PlaceOutlinedIcon sx={{ fontSize: 12, color: '#9aabba' }} />
                        <Typography sx={{ fontSize: 10.8, color: 'text.secondary' }}>{session.room}</Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyState compact title="Pas de cours aujourd’hui" description="Profitez de cette journée pour traiter les justificatifs en attente." />
          )}
        </SectionCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.35fr 1fr' }, gap: 2.5 }}>
        <SectionCard
          title="Taux d’absence par groupe"
          subtitle="Depuis le début du semestre"
          action={
            <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/teacher/stats')}>
              Statistiques
            </Button>
          }
          contentSx={{ pt: 1 }}
        >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Groupe</TableCell>
                  <TableCell align="center">Étudiants</TableCell>
                  <TableCell align="center">Absences</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>Taux</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.groupStats.map((group) => (
                  <TableRow key={group.groupId} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: 12.8, fontWeight: 700 }}>{group.groupName}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: 12.5 }}>{group.students}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: 12.5 }}>{group.absences}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.2}>
                        <LinearProgress
                          variant="determinate"
                          value={(group.rate / maxRate) * 100}
                          sx={{
                            flex: 1,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: group.rate > 25 ? 'error.main' : group.rate > 15 ? 'warning.main' : 'secondary.main',
                            },
                          }}
                        />
                        <Typography sx={{ fontSize: 11.5, fontWeight: 700, width: 42, textAlign: 'right' }}>
                          {group.rate}%
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>

        <SectionCard
          title="Dernières absences"
          subtitle="Les plus récentes de vos séances"
          action={
            <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/teacher/absences')}>
              Tout voir
            </Button>
          }
          contentSx={{ pt: 1 }}
        >
          {data.recentAbsences?.length ? (
            <Stack divider={<Box sx={{ borderBottom: '1px solid #edf1f5' }} />} spacing={0}>
              {data.recentAbsences.map((absence) => (
                <Stack key={absence.id} direction="row" alignItems="center" spacing={1.3} sx={{ py: 1.2 }}>
                  <UserAvatar name={absence.studentName} size={34} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: 12.4, fontWeight: 650 }}>
                      {absence.studentName}
                    </Typography>
                    <Typography noWrap sx={{ fontSize: 10.6, color: 'text.secondary' }}>
                      {absence.courseName} · {formatDate(absence.date, 'D MMM')}
                    </Typography>
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

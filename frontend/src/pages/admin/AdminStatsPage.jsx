import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Box,
  Card,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import SectionCard from '../../components/SectionCard';
import ChartTooltip from '../../components/ChartTooltip';
import UserAvatar from '../../components/UserAvatar';
import EmptyState from '../../components/EmptyState';
import { PageError, PageLoader } from '../../components/PageLoader';
import { adminApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';

export default function AdminStatsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.dashboard,
  });

  if (isLoading) return <PageLoader label="Calcul des statistiques globales…" />;
  if (isError) return <PageError message={getErrorMessage(error)} onRetry={refetch} />;

  const maxRate = Math.max(20, ...(data.groupStats || []).map((group) => group.rate));

  return (
    <>
      <PageHeader
        eyebrow="Analyse globale"
        title="Statistiques d’absence"
        subtitle="Comparez les groupes, suivez les tendances et identifiez les situations à risque."
        actions={<Chip label={`${data.totalSessions} séances · ${data.totalGroups} groupes`} sx={{ bgcolor: '#eef7f5', color: 'secondary.dark', height: 34 }} />}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' },
          gap: 2,
          mb: 2.5,
        }}
      >
        <StatCard icon={<PeopleAltRoundedIcon />} label="Étudiants" value={data.totalStudents} tone="primary" hint={`${data.totalTeachers} enseignants`} />
        <StatCard icon={<CalendarMonthRoundedIcon />} label="Séances suivies" value={data.totalSessions} tone="info" hint="Depuis le début du semestre" />
        <StatCard icon={<EventBusyRoundedIcon />} label="Absences" value={data.totalAbsences} tone="error" hint={`${data.pendingJustifications} justificatif(s) en attente`} />
        <StatCard icon={<PercentRoundedIcon />} label="Taux global" value={`${data.absenceRate}%`} tone="warning" progress={data.absenceRate} hint="Toutes promotions confondues" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' }, gap: 2.5, mb: 2.5 }}>
        <SectionCard title="Tendance mensuelle" subtitle="Volume d’absences enregistrées sur six mois">
          <Box sx={{ height: 290, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyTrend} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 5" stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={34} />
                <Tooltip content={<ChartTooltip suffix=" absence(s)" />} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.8} dot={{ r: 4, fill: '#fff', strokeWidth: 2.4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>

        <SectionCard title="Volume par groupe" subtitle="Nombre total d’absences">
          <Box sx={{ height: 290, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.groupStats} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 5" stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="groupName" axisLine={false} tickLine={false} dy={8} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={34} />
                <Tooltip content={<ChartTooltip suffix=" absence(s)" />} cursor={{ fill: 'rgba(15,157,138,.05)' }} />
                <Bar dataKey="absences" fill="#0f9d8a" radius={[7, 7, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.35fr 1fr' }, gap: 2.5 }}>
        <SectionCard title="Détail par groupe" subtitle="Taux calculé sur les séances passées" contentSx={{ pt: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Groupe</TableCell>
                <TableCell align="center">Étudiants</TableCell>
                <TableCell align="center">Absences</TableCell>
                <TableCell align="center">Séances</TableCell>
                <TableCell sx={{ minWidth: 160 }}>Taux d’absence</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.groupStats.map((group) => (
                <TableRow key={group.groupId} hover>
                  <TableCell><Typography sx={{ fontSize: 12.6, fontWeight: 700 }}>{group.groupName}</Typography></TableCell>
                  <TableCell align="center">{group.students}</TableCell>
                  <TableCell align="center">{group.absences}</TableCell>
                  <TableCell align="center">{group.sessions}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LinearProgress
                        variant="determinate"
                        value={(group.rate / maxRate) * 100}
                        sx={{ flex: 1, '& .MuiLinearProgress-bar': { bgcolor: group.rate > 25 ? 'error.main' : group.rate > 15 ? 'warning.main' : 'secondary.main' } }}
                      />
                      <Typography sx={{ fontSize: 11.2, width: 42, textAlign: 'right', fontWeight: 700 }}>{group.rate}%</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography sx={{ fontSize: 10.6, color: 'text.secondary', mt: 2 }}>
            Taux d’absence = absences enregistrées ÷ séances passées du groupe.
          </Typography>
        </SectionCard>

        <SectionCard title="Étudiants à suivre" subtitle="Classement par nombre d’absences" contentSx={{ pt: 1 }}>
          {data.topStudents?.length ? (
            <Stack spacing={1.2}>
              {data.topStudents.map((student, index) => (
                <Stack key={student.id} direction="row" alignItems="center" spacing={1.2} sx={{ p: 1.2, borderRadius: 2.2, bgcolor: index === 0 ? '#fdf5f2' : '#fbfcfd', border: '1px solid #edf1f5' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: index === 0 ? 'error.main' : 'text.secondary', width: 18 }}>
                    {index + 1}
                  </Typography>
                  <UserAvatar name={student.fullName} size={34} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: 12.3, fontWeight: 650 }}>{student.fullName}</Typography>
                    <Typography sx={{ fontSize: 10.4, color: 'text.secondary' }}>{student.groupName} · {student.absenceRate}%</Typography>
                  </Box>
                  <Chip size="small" label={`${student.absences} abs.`} sx={{ bgcolor: '#fdf0ec', color: 'error.dark' }} />
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyState compact title="Aucune absence enregistrée" />
          )}
        </SectionCard>
      </Box>
    </>
  );
}

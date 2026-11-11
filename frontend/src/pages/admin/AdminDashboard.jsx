import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
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
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CoPresentRoundedIcon from '@mui/icons-material/CoPresentRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import EmptyState from '../../components/EmptyState';
import { PageError, PageLoader } from '../../components/PageLoader';
import { adminApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { formatDate, formatTime } from '../../utils/format';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.dashboard,
  });

  if (isLoading) return <PageLoader label="Consolidation des statistiques…" />;
  if (isError) return <PageError message={getErrorMessage(error)} onRetry={refetch} />;

  const groupData = [...(data.groupStats || [])].sort((a, b) => b.absences - a.absences).slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow="Pilotage"
        title="Vue d’ensemble"
        subtitle="Suivez l’activité de l’université et identifiez les groupes nécessitant une attention particulière."
        actions={
          <>
            {data.pendingJustifications > 0 && (
              <Chip
                icon={<FactCheckRoundedIcon sx={{ fontSize: 15 }} />}
                label={`${data.pendingJustifications} justificatif(s) en attente`}
                sx={{ bgcolor: '#fdf5e6', color: 'warning.dark', height: 34 }}
              />
            )}
            <Button variant="contained" startIcon={<PeopleAltRoundedIcon />} onClick={() => navigate('/admin/students')}>
              Gérer les étudiants
            </Button>
          </>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' },
          gap: 2,
          mb: 2.5,
        }}
      >
        <StatCard icon={<PeopleAltRoundedIcon />} label="Étudiants" value={data.totalStudents} tone="primary" hint="Comptes actifs" />
        <StatCard icon={<CoPresentRoundedIcon />} label="Enseignants" value={data.totalTeachers} tone="info" hint={`${data.totalGroups} groupes`} />
        <StatCard icon={<EventBusyRoundedIcon />} label="Absences" value={data.totalAbsences} tone="error" hint={`${data.totalSessions} séances suivies`} />
        <StatCard icon={<PercentRoundedIcon />} label="Taux global" value={`${data.absenceRate}%`} tone="warning" progress={data.absenceRate} hint="Depuis le début du semestre" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.6fr 1fr' }, gap: 2.5, mb: 2.5 }}>
        <SectionCard
          title="Évolution mensuelle"
          subtitle="Absences enregistrées sur les six derniers mois"
          action={<Chip size="small" label="6 mois" sx={{ bgcolor: '#eef7f5', color: 'secondary.dark' }} />}
        >
          <Box sx={{ height: 270, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 5" stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={34} />
                <Tooltip content={<ChartTooltip suffix=" absence(s)" />} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.6} fill="url(#adminTrend)" activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>

        <SectionCard
          title="Absences par groupe"
          subtitle="Groupes les plus concernés"
          action={
            <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/admin/stats')}>
              Détail
            </Button>
          }
        >
          <Box sx={{ height: 270, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupData} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 5" stroke="#eef2f6" horizontal={false} />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                <YAxis dataKey="groupName" type="category" axisLine={false} tickLine={false} width={64} />
                <Tooltip content={<ChartTooltip suffix=" absence(s)" />} cursor={{ fill: 'rgba(16,38,59,.04)' }} />
                <Bar dataKey="absences" fill="#0f9d8a" radius={[0, 7, 7, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.25fr 1fr' }, gap: 2.5 }}>
        <SectionCard
          title="Groupes"
          subtitle="Taux d’absence et volume d’étudiants"
          action={
            <Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/admin/groups')}>
              Gérer
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
                  <TableCell sx={{ minWidth: 150 }}>Taux</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.groupStats.map((group) => (
                  <TableRow key={group.groupId} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: 12.6, fontWeight: 700 }}>{group.groupName}</Typography>
                    </TableCell>
                    <TableCell align="center">{group.students}</TableCell>
                    <TableCell align="center">{group.absences}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, group.rate)}
                          sx={{ flex: 1, '& .MuiLinearProgress-bar': { bgcolor: group.rate > 25 ? 'error.main' : group.rate > 15 ? 'warning.main' : 'secondary.main' } }}
                        />
                        <Typography sx={{ fontSize: 11.2, width: 40, textAlign: 'right', fontWeight: 700 }}>{group.rate}%</Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>

        <SectionCard
          title="Étudiants les plus absents"
          subtitle="À surveiller en priorité"
          contentSx={{ pt: 1 }}
        >
          {data.topStudents?.length ? (
            <Stack divider={<Box sx={{ borderBottom: '1px solid #edf1f5' }} />} spacing={0}>
              {data.topStudents.map((student, index) => (
                <Stack key={student.id} direction="row" alignItems="center" spacing={1.3} sx={{ py: 1.15 }}>
                  <Typography sx={{ fontSize: 10.5, color: 'text.secondary', width: 14, fontWeight: 700 }}>{index + 1}</Typography>
                  <UserAvatar name={student.fullName} size={33} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: 12.2, fontWeight: 650 }}>{student.fullName}</Typography>
                    <Typography noWrap sx={{ fontSize: 10.4, color: 'text.secondary' }}>{student.groupName}</Typography>
                  </Box>
                  <Chip size="small" label={`${student.absences} abs.`} sx={{ bgcolor: '#fdf0ec', color: 'error.dark', fontSize: 10 }} />
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyState compact title="Aucune absence enregistrée" />
          )}
        </SectionCard>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        <SectionCard title="Dernières absences" subtitle="Les plus récentes, tous groupes confondus" contentSx={{ pt: 0.5 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Étudiant</TableCell>
                  <TableCell>Cours</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recentAbsences.map((absence) => (
                  <TableRow key={absence.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <UserAvatar name={absence.studentName} size={30} />
                        <Box>
                          <Typography sx={{ fontSize: 12.2, fontWeight: 650 }}>{absence.studentName}</Typography>
                          <Typography sx={{ fontSize: 10.3, color: 'text.secondary' }}>{absence.groupName}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{absence.courseName}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 11.5, textTransform: 'capitalize' }}>
                        {formatDate(absence.date, 'ddd D MMM YYYY')} · {formatTime(absence.startTime)}
                      </Typography>
                    </TableCell>
                    <TableCell><StatusChip status={absence.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      </Box>
    </>
  );
}

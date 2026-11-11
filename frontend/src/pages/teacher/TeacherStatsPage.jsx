import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import SectionCard from '../../components/SectionCard';
import ChartTooltip from '../../components/ChartTooltip';
import { PageError, PageLoader } from '../../components/PageLoader';
import { teacherApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';

const DONUT_COLORS = ['#0f9d8a', '#e76f51'];

export default function TeacherStatsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: teacherApi.dashboard,
  });

  if (isLoading) return <PageLoader label="Calcul des statistiques…" />;
  if (isError) return <PageError message={getErrorMessage(error)} onRetry={refetch} />;

  const groups = data.groupStats || [];
  const openAbsences = Math.max(0, data.absencesThisMonth - data.justifiedAbsences);
  const donutData = [
    { name: 'Justifiées', value: data.justifiedAbsences },
    { name: 'Non justifiées', value: openAbsences },
  ].filter((item) => item.value > 0);
  const maxRate = Math.max(20, ...groups.map((group) => group.rate));
  const chartData = groups.map((group) => ({ ...group, label: group.groupName })).reverse();

  return (
    <>
      <PageHeader
        eyebrow="Analyse"
        title="Statistiques d’absence"
        subtitle="Une lecture claire de la présence dans vos groupes, pour agir au bon moment."
        actions={<Chip label="Mois en cours" sx={{ bgcolor: '#eef7f5', color: 'secondary.dark', height: 34 }} />}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' },
          gap: 2,
          mb: 2.5,
        }}
      >
        <StatCard icon={<EventBusyRoundedIcon />} label="Absences ce mois" value={data.absencesThisMonth} tone="error" hint="Toutes séances confondues" />
        <StatCard icon={<PercentRoundedIcon />} label="Taux d’absence" value={`${data.absenceRate}%`} tone="warning" progress={data.absenceRate} hint="Sur les séances du mois" />
        <StatCard icon={<TaskAltRoundedIcon />} label="Absences justifiées" value={data.justifiedAbsences} tone="success" hint="Validées par vos soins" />
        <StatCard icon={<FactCheckRoundedIcon />} label="Justificatifs en attente" value={data.pendingJustifications} tone="info" hint="À traiter depuis vos justificatifs" />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' }, gap: 2.5, mb: 2.5 }}>
        <SectionCard title="Tendance hebdomadaire" subtitle="Nombre d’absences sur les six dernières semaines">
          <Box sx={{ height: 280, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weeklyTrend} margin={{ top: 12, right: 8, left: -20, bottom: 0 }} barCategoryGap="32%">
                <CartesianGrid strokeDasharray="3 5" stroke="#eef2f6" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} width={34} />
                <Tooltip content={<ChartTooltip suffix=" absence(s)" />} cursor={{ fill: 'rgba(15,157,138,.05)' }} />
                <Bar dataKey="value" fill="#0f9d8a" radius={[7, 7, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>

        <SectionCard title="Répartition du mois" subtitle="Absences justifiées et non justifiées">
          {donutData.length ? (
            <>
              <Box sx={{ height: 190, mt: 0.5, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" innerRadius={58} outerRadius={78} paddingAngle={4} stroke="none">
                      {donutData.map((entry, index) => (
                        <Cell key={entry.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip suffix=" absence(s)" />} />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontFamily: "'Manrope Variable'", fontSize: 27, fontWeight: 800, lineHeight: 1 }}>
                      {data.absencesThisMonth}
                    </Typography>
                    <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>absences</Typography>
                  </Box>
                </Box>
              </Box>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {donutData.map((entry, index) => (
                  <Stack key={entry.name} direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: DONUT_COLORS[index] }} />
                    <Typography sx={{ fontSize: 11.5, color: 'text.secondary', flex: 1 }}>{entry.name}</Typography>
                    <Typography sx={{ fontSize: 11.5, fontWeight: 750 }}>{entry.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          ) : (
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Aucune absence enregistrée ce mois-ci.</Typography>
          )}
        </SectionCard>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.15fr' }, gap: 2.5 }}>
        <SectionCard title="Comparaison des groupes" subtitle="Taux d’absence depuis le début du semestre">
          <Box sx={{ height: 280, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 5" stroke="#eef2f6" horizontal={false} />
                <XAxis type="number" domain={[0, maxRate]} axisLine={false} tickLine={false} unit="%" />
                <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={74} />
                <Tooltip content={<ChartTooltip suffix=" %" />} cursor={{ fill: 'rgba(16,38,59,.04)' }} />
                <Bar dataKey="rate" fill="#3b82f6" radius={[0, 7, 7, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </SectionCard>

        <SectionCard title="Détail par groupe" subtitle="Volume d’absences et taux constaté">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Groupe</TableCell>
                <TableCell align="center">Étudiants</TableCell>
                <TableCell align="center">Absences</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Taux</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.groupId} hover>
                  <TableCell>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{group.groupName}</Typography>
                  </TableCell>
                  <TableCell align="center">{group.students}</TableCell>
                  <TableCell align="center">{group.absences}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LinearProgress
                        variant="determinate"
                        value={(group.rate / maxRate) * 100}
                        sx={{ flex: 1, '& .MuiLinearProgress-bar': { bgcolor: group.rate > 25 ? 'error.main' : group.rate > 15 ? 'warning.main' : 'secondary.main' } }}
                      />
                      <Typography sx={{ fontSize: 11.2, width: 40, textAlign: 'right', fontWeight: 700 }}>{group.rate}%</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography sx={{ fontSize: 10.8, color: 'text.secondary', mt: 2 }}>
            Le taux correspond au nombre d’absences divisé par le nombre de séances passées du groupe.
          </Typography>
        </SectionCard>
      </Box>
    </>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PageHeader from '../../components/PageHeader';
import UserAvatar from '../../components/UserAvatar';
import EmptyState from '../../components/EmptyState';
import { PageError, PageLoader } from '../../components/PageLoader';
import { teacherApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';

export default function TeacherStudentsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [groupId, setGroupId] = useState('');
  const [search, setSearch] = useState('');

  const groupsQuery = useQuery({ queryKey: ['teacher-groups'], queryFn: teacherApi.groups });
  const params = { ...(groupId ? { groupId } : {}), ...(search.trim() ? { search: search.trim() } : {}) };
  const studentsQuery = useQuery({
    queryKey: ['teacher-students', params],
    queryFn: () => teacherApi.students(params),
  });

  const students = studentsQuery.data || [];
  const totalAbsences = students.reduce((sum, student) => sum + student.absences, 0);
  const averageRate = students.length
    ? Math.round((students.reduce((sum, student) => sum + student.absenceRate, 0) / students.length) * 10) / 10
    : 0;

  return (
    <>
      <PageHeader
        eyebrow="Mes groupes"
        title="Étudiants"
        subtitle="Consultez la liste de vos étudiants, leur historique et leur taux d’absence."
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/teacher/absences?new=1')}>
            Nouvelle absence
          </Button>
        }
      />

      <Card sx={{ mb: 2.5, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.8, flex: 1 }}>
            <Chip
              label="Tous les groupes"
              onClick={() => setGroupId('')}
              sx={{
                bgcolor: groupId === '' ? 'primary.main' : '#f4f7fa',
                color: groupId === '' ? '#fff' : 'text.secondary',
                fontWeight: 650,
                '&:hover': { bgcolor: groupId === '' ? 'primary.dark' : '#e9eff5' },
              }}
            />
            {(groupsQuery.data || []).map((group) => (
              <Chip
                key={group.id}
                label={`${group.name} · ${group.studentCount}`}
                onClick={() => setGroupId(group.id)}
                sx={{
                  bgcolor: String(groupId) === String(group.id) ? 'secondary.main' : '#f4f7fa',
                  color: String(groupId) === String(group.id) ? '#fff' : 'text.secondary',
                  fontWeight: 650,
                  '&:hover': { bgcolor: String(groupId) === String(group.id) ? 'secondary.dark' : '#e9eff5' },
                }}
              />
            ))}
          </Stack>
          <TextField
            size="small"
            placeholder="Rechercher un étudiant…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 260 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: '#9aabba' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </Card>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Chip label={`${students.length} étudiant(s)`} sx={{ bgcolor: '#fff', border: '1px solid #e7edf3' }} />
        <Chip label={`${totalAbsences} absence(s)`} sx={{ bgcolor: '#fdf0ec', color: 'error.dark' }} />
        <Chip label={`Taux moyen ${averageRate}%`} sx={{ bgcolor: '#fdf5e6', color: 'warning.dark' }} />
      </Stack>

      {studentsQuery.isLoading ? (
        <PageLoader />
      ) : studentsQuery.isError ? (
        <PageError message={getErrorMessage(studentsQuery.error)} onRetry={studentsQuery.refetch} />
      ) : students.length === 0 ? (
        <Card>
          <EmptyState
            icon={<PeopleAltRoundedIcon />}
            title="Aucun étudiant trouvé"
            description="Essayez un autre groupe ou modifiez votre recherche."
          />
        </Card>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {students.map((student) => (
            <Card key={student.id} sx={{ p: 2 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <UserAvatar name={student.fullName} size={40} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 750 }}>{student.fullName}</Typography>
                  <Typography noWrap sx={{ fontSize: 10.8, color: 'text.secondary' }}>{student.email}</Typography>
                </Box>
                <Chip size="small" label={student.groupName} sx={{ bgcolor: '#eef3f8' }} />
              </Stack>
              <Box sx={{ mt: 1.7 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: 10.8, color: 'text.secondary' }}>
                    {student.absences} absence(s) · {student.justifiedAbsences} justifiée(s)
                  </Typography>
                  <Typography sx={{ fontSize: 11, fontWeight: 750 }}>{student.absenceRate}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, student.absenceRate)}
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      bgcolor: student.absenceRate > 25 ? 'error.main' : student.absenceRate > 15 ? 'warning.main' : 'secondary.main',
                    },
                  }}
                />
              </Box>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                startIcon={<HistoryRoundedIcon />}
                sx={{ mt: 1.5 }}
                onClick={() => navigate(`/teacher/absences?studentId=${student.id}`)}
              >
                Historique des absences
              </Button>
            </Card>
          ))}
        </Stack>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Étudiant</TableCell>
                  <TableCell>Groupe</TableCell>
                  <TableCell align="center">Absences</TableCell>
                  <TableCell align="center">Justifiées</TableCell>
                  <TableCell sx={{ minWidth: 190 }}>Taux d’absence</TableCell>
                  <TableCell align="right">Historique</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <UserAvatar name={student.fullName} size={35} />
                        <Box>
                          <Typography sx={{ fontSize: 12.8, fontWeight: 700 }}>{student.fullName}</Typography>
                          <Typography sx={{ fontSize: 10.7, color: 'text.secondary' }}>{student.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={student.groupName} sx={{ bgcolor: '#eef3f8', color: 'text.secondary' }} />
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: 12.5, fontWeight: 650 }}>{student.absences}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontSize: 12.5, color: 'success.dark' }}>{student.justifiedAbsences}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.2}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, student.absenceRate)}
                          sx={{
                            flex: 1,
                            '& .MuiLinearProgress-bar': {
                              bgcolor:
                                student.absenceRate > 25
                                  ? 'error.main'
                                  : student.absenceRate > 15
                                    ? 'warning.main'
                                    : 'secondary.main',
                            },
                          }}
                        />
                        <Typography sx={{ fontSize: 11.8, fontWeight: 700, width: 44, textAlign: 'right' }}>
                          {student.absenceRate}%
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<HistoryRoundedIcon />}
                        onClick={() => navigate(`/teacher/absences?studentId=${student.id}`)}
                      >
                        Voir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </>
  );
}

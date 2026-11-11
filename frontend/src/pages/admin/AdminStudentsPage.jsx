import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PageHeader from '../../components/PageHeader';
import UserAvatar from '../../components/UserAvatar';
import EmptyState from '../../components/EmptyState';
import StudentFormDialog from '../../components/StudentFormDialog';
import { PageError, PageLoader } from '../../components/PageLoader';
import { adminApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';

export default function AdminStudentsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [groupId, setGroupId] = useState('');
  const [dialog, setDialog] = useState({ open: false, student: null });

  const studentsQuery = useQuery({ queryKey: ['admin-students'], queryFn: () => adminApi.students() });
  const groupsQuery = useQuery({ queryKey: ['admin-groups'], queryFn: adminApi.groups });

  const students = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (studentsQuery.data || []).filter((student) => {
      const groupOk = !groupId || String(student.groupId) === String(groupId);
      const searchOk =
        !needle ||
        student.fullName.toLowerCase().includes(needle) ||
        student.email.toLowerCase().includes(needle) ||
        (student.groupName || '').toLowerCase().includes(needle);
      return groupOk && searchOk;
    });
  }, [studentsQuery.data, search, groupId]);

  const totalAbsences = students.reduce((sum, student) => sum + student.absences, 0);

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Étudiants"
        subtitle="Gérez les comptes étudiants, leurs groupes et consultez leur taux d’absence."
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialog({ open: true, student: null })}>
            Ajouter un étudiant
          </Button>
        }
      />

      <Card sx={{ mb: 2.5, p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
          <TextField
            size="small"
            placeholder="Rechercher par nom, email ou groupe…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ flex: 1, minWidth: { xs: '100%', sm: 280 } }}
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
          <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.7 }}>
            <Chip
              label="Tous"
              onClick={() => setGroupId('')}
              sx={{ bgcolor: groupId === '' ? 'primary.main' : '#f4f7fa', color: groupId === '' ? '#fff' : 'text.secondary', fontWeight: 650 }}
            />
            {(groupsQuery.data || []).map((group) => (
              <Chip
                key={group.id}
                label={group.name}
                onClick={() => setGroupId(group.id)}
                sx={{
                  bgcolor: String(groupId) === String(group.id) ? 'secondary.main' : '#f4f7fa',
                  color: String(groupId) === String(group.id) ? '#fff' : 'text.secondary',
                  fontWeight: 650,
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Card>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Chip label={`${students.length} étudiant(s)`} sx={{ bgcolor: '#fff', border: '1px solid #e7edf3' }} />
        <Chip label={`${totalAbsences} absence(s) cumulée(s)`} sx={{ bgcolor: '#fdf0ec', color: 'error.dark' }} />
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
            description="Ajustez votre recherche ou ajoutez un nouvel étudiant à l’université."
            action={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialog({ open: true, student: null })}>Ajouter un étudiant</Button>}
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
                <Button size="small" onClick={() => setDialog({ open: true, student })} sx={{ minWidth: 0, px: 1 }}>
                  <EditOutlinedIcon fontSize="small" />
                </Button>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.6 }}>
                <Chip size="small" label={student.groupName} sx={{ bgcolor: '#eef3f8' }} />
                <Chip size="small" label={`${student.absences} absence(s)`} sx={{ bgcolor: '#f8fafc' }} />
                <Chip size="small" label={`${student.absenceRate}%`} sx={{ bgcolor: '#fdf5e6', color: 'warning.dark' }} />
              </Stack>
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
                  <TableCell sx={{ minWidth: 180 }}>Taux d’absence</TableCell>
                  <TableCell align="right">Actions</TableCell>
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
                    <TableCell><Chip size="small" label={student.groupName} sx={{ bgcolor: '#eef3f8' }} /></TableCell>
                    <TableCell align="center">{student.absences}</TableCell>
                    <TableCell align="center">{student.justifiedAbsences}</TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, student.absenceRate)}
                          sx={{ flex: 1, '& .MuiLinearProgress-bar': { bgcolor: student.absenceRate > 25 ? 'error.main' : student.absenceRate > 15 ? 'warning.main' : 'secondary.main' } }}
                        />
                        <Typography sx={{ fontSize: 11.2, width: 40, textAlign: 'right', fontWeight: 700 }}>{student.absenceRate}%</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setDialog({ open: true, student })}>
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <StudentFormDialog
        open={dialog.open}
        student={dialog.student}
        groups={groupsQuery.data || []}
        onClose={() => setDialog({ open: false, student: null })}
      />
    </>
  );
}

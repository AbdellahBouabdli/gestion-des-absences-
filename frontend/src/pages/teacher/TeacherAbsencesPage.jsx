import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import UserAvatar from '../../components/UserAvatar';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import AbsenceFormDialog from '../../components/AbsenceFormDialog';
import { PageError, PageLoader } from '../../components/PageLoader';
import { teacherApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime } from '../../utils/format';

const periodParams = (period) => {
  if (period === 'month') {
    return { from: dayjs().startOf('month').format('YYYY-MM-DD'), to: dayjs().format('YYYY-MM-DD') };
  }
  if (period === '30') {
    return { from: dayjs().subtract(30, 'day').format('YYYY-MM-DD'), to: dayjs().format('YYYY-MM-DD') };
  }
  return {};
};

export default function TeacherAbsencesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const toast = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [groupId, setGroupId] = useState('');
  const [status, setStatus] = useState('ALL');
  const [period, setPeriod] = useState('all');
  const [studentId, setStudentId] = useState(searchParams.get('studentId') || '');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [justifyTarget, setJustifyTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setFormOpen(true);
    }
    if (searchParams.get('studentId')) {
      setStudentId(searchParams.get('studentId'));
    }
  }, [searchParams]);

  const groupsQuery = useQuery({ queryKey: ['teacher-groups'], queryFn: teacherApi.groups });
  const params = useMemo(
    () => ({
      ...(groupId ? { groupId } : {}),
      ...(studentId ? { studentId } : {}),
      ...periodParams(period),
    }),
    [groupId, studentId, period],
  );
  const absencesQuery = useQuery({
    queryKey: ['teacher-absences', params],
    queryFn: () => teacherApi.absences(params),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['teacher-absences'] });
    queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
  };

  const justifyMutation = useMutation({
    mutationFn: (id) => teacherApi.justifyAbsence(id),
    onSuccess: () => {
      invalidate();
      setJustifyTarget(null);
      toast.success('L’absence a été marquée comme justifiée.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => teacherApi.deleteAbsence(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success('L’absence a été supprimée.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const closeForm = (refresh) => {
    setFormOpen(false);
    setEditing(null);
    if (searchParams.get('new')) {
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
    if (refresh) invalidate();
  };

  const clearStudentFilter = () => {
    setStudentId('');
    const next = new URLSearchParams(searchParams);
    next.delete('studentId');
    setSearchParams(next, { replace: true });
  };

  const filtered = (absencesQuery.data || []).filter((absence) => {
    const statusOk = status === 'ALL' || absence.status === status;
    const needle = search.trim().toLowerCase();
    const searchOk =
      !needle ||
      absence.studentName.toLowerCase().includes(needle) ||
      absence.courseName.toLowerCase().includes(needle) ||
      absence.groupName.toLowerCase().includes(needle);
    return statusOk && searchOk;
  });

  const counts = {
    total: absencesQuery.data?.length || 0,
    open: (absencesQuery.data || []).filter((item) => item.status === 'ABSENT').length,
    pending: (absencesQuery.data || []).filter((item) => item.justificationStatus === 'PENDING').length,
  };

  return (
    <>
      <PageHeader
        eyebrow="Suivi de présence"
        title="Gestion des absences"
        subtitle="Enregistrez, modifiez et justifiez les absences de vos groupes. L’historique est conservé automatiquement."
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setFormOpen(true)}>
            Enregistrer une absence
          </Button>
        }
      />

      <Card sx={{ mb: 2.5 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ md: 'center' }}
          sx={{ p: 2, flexWrap: 'wrap' }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'text.secondary' }}>
            <TuneRoundedIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em' }}>FILTRES</Typography>
          </Stack>
          <TextField
            select
            size="small"
            value={groupId}
            onChange={(event) => setGroupId(event.target.value)}
            sx={{ minWidth: 150 }}
            label="Groupe"
          >
            <MenuItem value="">Tous les groupes</MenuItem>
            {(groupsQuery.data || []).map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            sx={{ minWidth: 160 }}
            label="Statut"
          >
            <MenuItem value="ALL">Tous les statuts</MenuItem>
            <MenuItem value="ABSENT">Non justifiées</MenuItem>
            <MenuItem value="JUSTIFIED">Justifiées</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            sx={{ minWidth: 160 }}
            label="Période"
          >
            <MenuItem value="all">Tout l’historique</MenuItem>
            <MenuItem value="month">Ce mois-ci</MenuItem>
            <MenuItem value="30">30 derniers jours</MenuItem>
          </TextField>
          <TextField
            size="small"
            placeholder="Rechercher un étudiant ou un cours…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ flex: 1, minWidth: { xs: '100%', sm: 220 } }}
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
          {studentId && (
            <Chip
              label="Filtré sur un étudiant"
              onDelete={clearStudentFilter}
              size="small"
              sx={{ bgcolor: '#eaf7f4', color: 'secondary.dark' }}
            />
          )}
        </Stack>
      </Card>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Chip label={`${counts.total} absence(s) affichée(s)`} sx={{ bgcolor: '#fff', border: '1px solid #e7edf3' }} />
        <Chip label={`${counts.open} non justifiée(s)`} sx={{ bgcolor: '#fdf0ec', color: 'error.dark' }} />
        <Chip label={`${counts.pending} justificatif(s) en attente`} sx={{ bgcolor: '#fdf5e6', color: 'warning.dark' }} />
      </Stack>

      {absencesQuery.isLoading ? (
        <PageLoader />
      ) : absencesQuery.isError ? (
        <PageError message={getErrorMessage(absencesQuery.error)} onRetry={absencesQuery.refetch} />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<EventBusyRoundedIcon />}
            title="Aucune absence ne correspond aux filtres"
            description="Modifiez vos filtres ou enregistrez une nouvelle absence pour commencer."
            action={
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setFormOpen(true)}>
                Enregistrer une absence
              </Button>
            }
          />
        </Card>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {filtered.map((absence) => (
            <Card key={absence.id} sx={{ p: 2 }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                <Stack direction="row" spacing={1.2}>
                  <UserAvatar name={absence.studentName} size={38} />
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 750 }}>{absence.studentName}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {absence.groupName} · {absence.courseName}
                    </Typography>
                  </Box>
                </Stack>
                <StatusChip status={absence.status} />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.6 }}>
                <Chip size="small" label={formatDate(absence.date, 'ddd D MMM YYYY')} sx={{ bgcolor: '#f4f7fa' }} />
                <Chip size="small" label={`${formatTime(absence.startTime)}–${formatTime(absence.endTime)}`} sx={{ bgcolor: '#f4f7fa' }} />
                {absence.justificationStatus && <StatusChip status={absence.justificationStatus} kind="justification" />}
              </Stack>
              <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ mt: 1 }}>
                {absence.status === 'ABSENT' && (
                  <Tooltip title="Marquer comme justifiée">
                    <IconButton size="small" color="success" onClick={() => setJustifyTarget(absence)}>
                      <TaskAltRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Modifier">
                  <IconButton size="small" onClick={() => setEditing(absence)}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Supprimer">
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(absence)}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
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
                  <TableCell>Cours</TableCell>
                  <TableCell>Date & heure</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Justificatif</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((absence) => (
                  <TableRow key={absence.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <UserAvatar name={absence.studentName} size={34} />
                        <Box>
                          <Typography sx={{ fontSize: 12.8, fontWeight: 700 }}>{absence.studentName}</Typography>
                          <Typography sx={{ fontSize: 10.8, color: 'text.secondary' }}>{absence.groupName}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{absence.courseName}</Typography>
                      <Typography sx={{ fontSize: 10.6, color: 'text.secondary' }}>{absence.courseCode} · Salle {absence.room}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12.3, textTransform: 'capitalize' }}>
                        {formatDate(absence.date, 'ddd D MMM YYYY')}
                      </Typography>
                      <Typography sx={{ fontSize: 10.6, color: 'text.secondary' }}>
                        {formatTime(absence.startTime)} – {formatTime(absence.endTime)}
                      </Typography>
                    </TableCell>
                    <TableCell><StatusChip status={absence.status} /></TableCell>
                    <TableCell>
                      {absence.justificationStatus ? (
                        <StatusChip status={absence.justificationStatus} kind="justification" />
                      ) : (
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.3} justifyContent="flex-end">
                        {absence.status === 'ABSENT' && (
                          <Tooltip title="Marquer comme justifiée">
                            <IconButton size="small" color="success" onClick={() => setJustifyTarget(absence)}>
                              <TaskAltRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => setEditing(absence)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(absence)}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <AbsenceFormDialog open={formOpen || Boolean(editing)} absence={editing} onClose={closeForm} />

      <ConfirmDialog
        open={Boolean(justifyTarget)}
        title="Justifier cette absence ?"
        description={
          justifyTarget
            ? `L’absence de ${justifyTarget.studentName} en ${justifyTarget.courseName} sera marquée comme justifiée.`
            : ''
        }
        confirmLabel="Justifier"
        loading={justifyMutation.isPending}
        onConfirm={() => justifyMutation.mutate(justifyTarget.id)}
        onClose={() => setJustifyTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer cette absence ?"
        description={
          deleteTarget
            ? `L’absence de ${deleteTarget.studentName} en ${deleteTarget.courseName} et son éventuel justificatif seront définitivement supprimés.`
            : ''
        }
        confirmLabel="Supprimer"
        destructive
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}

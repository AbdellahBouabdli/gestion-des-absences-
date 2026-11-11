import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import dayjs from 'dayjs';
import { teacherApi } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { formatDate, formatTime } from '../utils/format';

export default function AbsenceFormDialog({ open, absence, onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEdit = Boolean(absence);
  const [groupId, setGroupId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('ABSENT');
  const [error, setError] = useState('');

  const groupsQuery = useQuery({
    queryKey: ['teacher-groups'],
    queryFn: teacherApi.groups,
    enabled: open && !isEdit,
  });

  const studentsQuery = useQuery({
    queryKey: ['teacher-students', groupId],
    queryFn: () => teacherApi.students({ groupId }),
    enabled: open && !isEdit && Boolean(groupId),
  });

  const scheduleQuery = useQuery({
    queryKey: ['teacher-schedule-picker', dayjs().format('YYYY-MM-DD')],
    queryFn: () =>
      teacherApi.schedule({
        from: dayjs().subtract(90, 'day').format('YYYY-MM-DD'),
        to: dayjs().format('YYYY-MM-DD'),
      }),
    enabled: open && !isEdit,
  });

  useEffect(() => {
    if (!open) return;
    setError('');
    if (isEdit) {
      setNote(absence?.note || '');
      setStatus(absence?.status || 'ABSENT');
    } else {
      setGroupId('');
      setSessionId('');
      setStudentId('');
      setNote('');
      setStatus('ABSENT');
    }
  }, [open, absence, isEdit]);

  useEffect(() => {
    if (open && !isEdit && !groupId && groupsQuery.data?.length) {
      setGroupId(groupsQuery.data[0].id);
    }
  }, [open, isEdit, groupId, groupsQuery.data]);

  useEffect(() => {
    setSessionId('');
    setStudentId('');
  }, [groupId]);

  const sessions = useMemo(() => {
    const items = (scheduleQuery.data || [])
      .filter((session) => String(session.groupId) === String(groupId))
      .filter((session) => !dayjs(session.date).isAfter(dayjs(), 'day'));
    return items.sort(
      (a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`),
    );
  }, [scheduleQuery.data, groupId]);

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? teacherApi.updateAbsence(absence.id, { note: note.trim() || null, status })
        : teacherApi.createAbsence({
            studentId: Number(studentId),
            sessionId: Number(sessionId),
            note: note.trim() || null,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-absences'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-students'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-groups'] });
      toast.success(isEdit ? 'L’absence a été mise à jour.' : 'L’absence a été enregistrée.');
      onClose(true);
    },
    onError: (requestError) => setError(getErrorMessage(requestError)),
  });

  const submit = () => {
    if (!isEdit) {
      if (!groupId) return setError('Sélectionnez un groupe.');
      if (!sessionId) return setError('Sélectionnez la séance concernée.');
      if (!studentId) return setError('Sélectionnez l’étudiant absent.');
    }
    setError('');
    mutation.mutate();
  };

  const loadingOptions = scheduleQuery.isLoading || studentsQuery.isLoading || groupsQuery.isLoading;

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ fontSize: 10, color: 'text.secondary' }}>
            {isEdit ? 'MODIFICATION' : 'NOUVELLE ABSENCE'}
          </Typography>
          <Typography sx={{ fontFamily: "'Manrope Variable'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.03em' }}>
            {isEdit ? 'Modifier l’absence' : 'Enregistrer une absence'}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.3 }}>
            {isEdit ? 'Ajustez la note ou le statut de cette absence.' : 'Sélectionnez une séance passée puis l’étudiant concerné.'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={mutation.isPending} aria-label="Fermer">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {isEdit ? (
          <Box sx={{ bgcolor: '#f8fafc', border: '1px solid #edf1f5', borderRadius: 2.5, p: 1.8, mb: 2.5 }}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#eef3f8', color: 'primary.main', display: 'grid', placeItems: 'center' }}>
                <EventBusyRoundedIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 750 }}>
                  {absence?.studentName} · {absence?.courseName}
                </Typography>
                <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                  {formatDate(absence?.date, 'dddd D MMMM YYYY')} · {formatTime(absence?.startTime)} — Salle {absence?.room}
                </Typography>
              </Box>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Groupe"
              value={groupId}
              onChange={(event) => setGroupId(event.target.value)}
              disabled={loadingOptions}
            >
              {(groupsQuery.data || []).map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name} — {group.department}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Séance"
              value={sessionId}
              onChange={(event) => setSessionId(event.target.value)}
              disabled={!groupId || scheduleQuery.isLoading}
              helperText={
                !scheduleQuery.isLoading && sessions.length === 0
                  ? 'Aucune séance passée sur les 90 derniers jours pour ce groupe.'
                  : 'Seules les séances passées peuvent être pointées.'
              }
            >
              {sessions.map((session) => (
                <MenuItem key={session.id} value={session.id}>
                  {formatDate(session.date, 'ddd D MMM')} · {formatTime(session.startTime)} — {session.courseName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Étudiant absent"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              disabled={!groupId || studentsQuery.isLoading}
            >
              {(studentsQuery.data || []).map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.fullName} — {student.email}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}

        {isEdit && (
          <TextField
            select
            fullWidth
            label="Statut"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="ABSENT">Absence non justifiée</MenuItem>
            <MenuItem value="JUSTIFIED">Absence justifiée</MenuItem>
          </TextField>
        )}

        <TextField
          fullWidth
          multiline
          minRows={2}
          label="Note (optionnelle)"
          placeholder="Ex. Absence constatée en début de séance."
          value={note}
          onChange={(event) => setNote(event.target.value)}
          inputProps={{ maxLength: 1000 }}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={mutation.isPending || (!isEdit && loadingOptions)}
          startIcon={mutation.isPending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
        >
          {mutation.isPending ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : 'Enregistrer l’absence'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { downloadJustification, teacherApi } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import StatusChip from './StatusChip';
import UserAvatar from './UserAvatar';
import { fileSize, formatDate, formatTime } from '../utils/format';

export default function ReviewJustificationDialog({ open, justification, decision, onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open) {
      setComment('');
      setError('');
    }
  }, [open, justification?.id, decision]);

  const mutation = useMutation({
    mutationFn: () =>
      teacherApi.reviewJustification(justification.id, {
        status: decision,
        comment: comment.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-justifications'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-absences'] });
      toast.success(decision === 'APPROVED' ? 'Le justificatif a été approuvé.' : 'Le justificatif a été refusé.');
      onClose(true);
    },
    onError: (requestError) => setError(getErrorMessage(requestError)),
  });

  if (!justification) return null;
  const approving = decision === 'APPROVED';

  const download = async () => {
    setDownloading(true);
    try {
      await downloadJustification(justification.id, justification.fileName || 'justificatif');
    } catch {
      toast.error('Le fichier n’a pas pu être téléchargé.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ fontSize: 10, color: approving ? 'success.main' : 'error.main' }}>
            {approving ? 'VALIDATION' : 'REFUS'}
          </Typography>
          <Typography sx={{ fontFamily: "'Manrope Variable'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.03em' }}>
            {approving ? 'Approuver le justificatif' : 'Refuser le justificatif'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={mutation.isPending} aria-label="Fermer">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Stack direction="row" spacing={1.4} alignItems="center" sx={{ mb: 2 }}>
          <UserAvatar name={justification.studentName} size={40} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 750 }}>{justification.studentName}</Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
              {justification.groupName} · {justification.courseName}
            </Typography>
          </Box>
          <StatusChip status={justification.status} kind="justification" />
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          justifyContent="space-between"
          sx={{ bgcolor: '#f8fafc', borderRadius: 2.4, p: 1.6, mb: 2 }}
        >
          <Box>
            <Typography sx={{ fontSize: 10.5, color: 'text.secondary', fontWeight: 650 }}>SÉANCE</Typography>
            <Typography sx={{ fontSize: 12.5, fontWeight: 650, textTransform: 'capitalize' }}>
              {formatDate(justification.date, 'dddd D MMMM')} · {formatTime(justification.startTime)}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 10.5, color: 'text.secondary', fontWeight: 650 }}>PIÈCE JOINTE</Typography>
            <Typography sx={{ fontSize: 12.5, fontWeight: 650 }}>
              {justification.fileName || 'Aucun fichier'} {justification.fileSize ? `· ${fileSize(justification.fileSize)}` : ''}
            </Typography>
          </Box>
        </Stack>

        <Typography sx={{ fontSize: 10.5, color: 'text.secondary', fontWeight: 700, letterSpacing: '.05em', mb: 0.6 }}>
          MOTIF INDIQUÉ
        </Typography>
        <Typography sx={{ fontSize: 13, lineHeight: 1.65, color: 'text.primary', mb: 2 }}>
          {justification.reason}
        </Typography>

        {justification.fileName && (
          <Button
            size="small"
            variant="outlined"
            startIcon={downloading ? <CircularProgress size={14} /> : <DownloadRoundedIcon />}
            onClick={download}
            disabled={downloading}
            sx={{ mb: 2 }}
          >
            Consulter la pièce jointe
          </Button>
        )}

        <Divider sx={{ my: 1.5 }} />
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, mb: 0.8 }}>
          Commentaire {approving ? '(optionnel)' : '*'}
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={2}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={approving ? 'Ex. Document conforme à la date de l’absence.' : 'Expliquez pourquoi le justificatif est refusé…'}
          inputProps={{ maxLength: 1000 }}
        />
        <Typography sx={{ fontSize: 10.8, color: 'text.secondary', mt: 1.2 }}>
          {approving
            ? 'L’absence passera automatiquement au statut « Justifiée ».'
            : 'L’étudiant pourra déposer un nouveau justificatif.'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Annuler
        </Button>
        <Button
          variant="contained"
          color={approving ? 'success' : 'error'}
          onClick={() => {
            if (!approving && !comment.trim()) {
              setError('Veuillez indiquer un motif de refus.');
              return;
            }
            mutation.mutate();
          }}
          disabled={mutation.isPending}
          startIcon={
            mutation.isPending
              ? <CircularProgress size={16} sx={{ color: '#fff' }} />
              : approving
                ? <CheckCircleRoundedIcon />
                : <CancelRoundedIcon />
          }
        >
          {mutation.isPending ? 'Traitement…' : approving ? 'Approuver' : 'Refuser'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

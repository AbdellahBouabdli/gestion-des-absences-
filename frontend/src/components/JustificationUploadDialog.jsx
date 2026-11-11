import { useEffect, useRef, useState } from 'react';
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
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { studentApi } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import { fileSize, formatDate } from '../utils/format';

const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png'];

export default function JustificationUploadDialog({ open, absence, onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const [reason, setReason] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setFile(null);
      setError('');
      setDragging(false);
    }
  }, [open, absence?.id]);

  const mutation = useMutation({
    mutationFn: ({ formData }) => studentApi.submitJustification(absence.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-absences'] });
      queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['student-justifications'] });
      toast.success('Votre justificatif a été déposé et sera vérifié par l’enseignant.');
      onClose(true);
    },
    onError: (requestError) => setError(getErrorMessage(requestError)),
  });

  const selectFile = (candidate) => {
    if (!candidate) return;
    if (!ACCEPTED.includes(candidate.type)) {
      setError('Format non autorisé. Choisissez un PDF, un JPG ou un PNG.');
      return;
    }
    if (candidate.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 5 Mo.');
      return;
    }
    setError('');
    setFile(candidate);
  };

  const submit = () => {
    if (!file) {
      setError('Veuillez joindre votre justificatif.');
      return;
    }
    if (!reason.trim()) {
      setError('Veuillez préciser le motif de l’absence.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('reason', reason.trim());
    mutation.mutate({ formData });
  };

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ fontSize: 10, color: 'text.secondary' }}>
            JUSTIFICATIF
          </Typography>
          <Typography sx={{ fontFamily: "'Manrope Variable'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.03em' }}>
            Déposer un justificatif
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.3 }}>
            {absence?.courseName} · {formatDate(absence?.date, 'dddd D MMMM YYYY')}
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
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, mb: 0.8 }}>Pièce justificative *</Typography>
        {!file ? (
          <Box
            className="drag-zone"
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              selectFile(event.dataTransfer.files?.[0]);
            }}
            sx={{
              cursor: 'pointer',
              borderColor: dragging ? '#0f9d8a' : '#cdd9e4',
              bgcolor: dragging ? '#f0fbf8' : '#f8fafc',
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                bgcolor: '#e9f8f5',
                color: 'secondary.main',
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 1,
              }}
            >
              <CloudUploadOutlinedIcon />
            </Box>
            <Typography sx={{ fontSize: 12.8, fontWeight: 650 }}>
              Glissez votre fichier ici ou <Box component="span" sx={{ color: 'secondary.dark', textDecoration: 'underline' }}>parcourez</Box>
            </Typography>
            <Typography sx={{ fontSize: 10.8, color: 'text.secondary', mt: 0.4 }}>
              PDF, JPG ou PNG · 5 Mo maximum
            </Typography>
          </Box>
        ) : (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.2}
            sx={{ border: '1px solid #cdeee7', bgcolor: '#f4fcf9', borderRadius: 2.5, p: 1.5 }}
          >
            <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: '#e2f6f0', color: 'secondary.dark', display: 'grid', placeItems: 'center' }}>
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 650 }}>
                {file.name}
              </Typography>
              <Typography sx={{ fontSize: 10.8, color: 'text.secondary' }}>{fileSize(file.size)}</Typography>
            </Box>
            <IconButton size="small" onClick={() => setFile(null)} aria-label="Retirer le fichier">
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(event) => selectFile(event.target.files?.[0])}
        />

        <Typography sx={{ fontSize: 12.5, fontWeight: 700, mt: 2.5, mb: 0.8 }}>Motif de l&apos;absence *</Typography>
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="Expliquez brièvement la raison de votre absence…"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          inputProps={{ maxLength: 1000 }}
          helperText={`${reason.length}/1000`}
          FormHelperTextProps={{ sx: { textAlign: 'right', mr: 0 } }}
        />

        <Typography sx={{ fontSize: 10.8, color: 'text.secondary', mt: 1.2, lineHeight: 1.6 }}>
          Votre enseignant sera le seul à consulter ce document. Vous serez notifié du statut de la vérification.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Annuler
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          color="secondary"
          disabled={mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
        >
          {mutation.isPending ? 'Envoi…' : 'Déposer le justificatif'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

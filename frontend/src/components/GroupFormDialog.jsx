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
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { adminApi } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

const empty = { name: '', level: '', department: '' };

export default function GroupFormDialog({ open, group, onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [values, setValues] = useState(empty);
  const [error, setError] = useState('');
  const editing = Boolean(group);

  useEffect(() => {
    if (!open) return;
    setError('');
    setValues(
      group
        ? { name: group.name, level: group.level, department: group.department }
        : empty,
    );
  }, [open, group]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: values.name.trim(),
        level: values.level.trim(),
        department: values.department.trim(),
      };
      return editing ? adminApi.updateGroup(group.id, payload) : adminApi.createGroup(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success(editing ? 'Le groupe a été mis à jour.' : 'Le groupe a été créé.');
      onClose(true);
    },
    onError: (requestError) => setError(getErrorMessage(requestError)),
  });

  const update = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  const submit = () => {
    if (!values.name.trim()) return setError('Le nom du groupe est obligatoire.');
    if (!values.level.trim()) return setError('Le niveau est obligatoire.');
    if (!values.department.trim()) return setError('Le département est obligatoire.');
    setError('');
    mutation.mutate();
  };

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ fontSize: 10, color: 'text.secondary' }}>
            {editing ? 'MODIFICATION' : 'NOUVEAU GROUPE'}
          </Typography>
          <Typography sx={{ fontFamily: "'Manrope Variable'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.03em' }}>
            {editing ? 'Modifier le groupe' : 'Créer un groupe'}
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
        <Stack spacing={2}>
          <TextField label="Nom du groupe" placeholder="Ex. GI-1A" value={values.name} onChange={update('name')} autoFocus />
          <TextField label="Niveau" placeholder="Ex. 1ère année" value={values.level} onChange={update('level')} />
          <TextField label="Département" placeholder="Ex. Génie Informatique" value={values.department} onChange={update('department')} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={mutation.isPending}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={mutation.isPending}
          startIcon={mutation.isPending ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : null}
        >
          {mutation.isPending ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer le groupe'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

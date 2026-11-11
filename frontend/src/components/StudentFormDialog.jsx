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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { adminApi } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';

const empty = { firstName: '', lastName: '', email: '', password: '', groupId: '' };

export default function StudentFormDialog({ open, student, groups = [], onClose }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [values, setValues] = useState(empty);
  const [error, setError] = useState('');
  const editing = Boolean(student);

  useEffect(() => {
    if (!open) return;
    setError('');
    if (student) {
      setValues({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        password: '',
        groupId: student.groupId ?? '',
      });
    } else {
      setValues({ ...empty, groupId: groups[0]?.id ?? '' });
    }
  }, [open, student, groups]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        groupId: Number(values.groupId),
        ...(values.password ? { password: values.password } : {}),
      };
      return editing ? adminApi.updateStudent(student.id, payload) : adminApi.createStudent(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      toast.success(editing ? 'Les informations de l’étudiant ont été mises à jour.' : 'L’étudiant a été ajouté.');
      onClose(true);
    },
    onError: (requestError) => setError(getErrorMessage(requestError)),
  });

  const update = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  const submit = () => {
    if (!values.firstName.trim() || !values.lastName.trim()) return setError('Le prénom et le nom sont obligatoires.');
    if (!values.email.trim()) return setError('L’adresse email est obligatoire.');
    if (!values.groupId) return setError('Sélectionnez un groupe.');
    if (!editing && values.password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    if (values.password && values.password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.');
    setError('');
    mutation.mutate();
  };

  return (
    <Dialog open={open} onClose={mutation.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ fontSize: 10, color: 'text.secondary' }}>
            {editing ? 'MODIFICATION' : 'INSCRIPTION'}
          </Typography>
          <Typography sx={{ fontFamily: "'Manrope Variable'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.03em' }}>
            {editing ? 'Modifier l’étudiant' : 'Ajouter un étudiant'}
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
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField label="Prénom" value={values.firstName} onChange={update('firstName')} autoFocus />
            <TextField label="Nom" value={values.lastName} onChange={update('lastName')} />
          </Box>
          <TextField label="Adresse email" type="email" value={values.email} onChange={update('email')} />
          <TextField select label="Groupe" value={values.groupId} onChange={update('groupId')}>
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name} — {group.department}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={editing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
            type="password"
            value={values.password}
            onChange={update('password')}
            helperText={editing ? 'Laisser vide pour conserver le mot de passe actuel.' : '8 caractères minimum.'}
            autoComplete="new-password"
          />
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
          {mutation.isPending ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Ajouter l’étudiant'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

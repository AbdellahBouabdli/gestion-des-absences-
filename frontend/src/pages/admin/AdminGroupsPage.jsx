import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import GroupFormDialog from '../../components/GroupFormDialog';
import { PageError, PageLoader } from '../../components/PageLoader';
import { adminApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';

export default function AdminGroupsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState({ open: false, group: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: adminApi.groups,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setDeleteTarget(null);
      toast.success('Le groupe a été supprimé.');
    },
    onError: (requestError) => {
      setDeleteTarget(null);
      toast.error(getErrorMessage(requestError));
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Organisation pédagogique"
        title="Groupes"
        subtitle="Structurez les promotions et rattachez les étudiants à leurs groupes."
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialog({ open: true, group: null })}>
            Nouveau groupe
          </Button>
        }
      />

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <PageError message={getErrorMessage(error)} onRetry={refetch} />
      ) : (data || []).length === 0 ? (
        <Card>
          <EmptyState
            icon={<GroupsRoundedIcon />}
            title="Aucun groupe"
            description="Créez votre premier groupe pour organiser les étudiants et les cours."
            action={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialog({ open: true, group: null })}>Créer un groupe</Button>}
          />
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0,1fr))', xl: 'repeat(3, minmax(0,1fr))' }, gap: 2 }}>
          {data.map((group) => (
            <Card key={group.id} sx={{ p: 2.5, position: 'relative', overflow: 'hidden' }}>
              <Box
                sx={{
                  position: 'absolute',
                  right: -24,
                  top: -24,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: '#f1f9f7',
                }}
              />
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.6,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: '#eaf7f4',
                    color: 'secondary.dark',
                  }}
                >
                  <GroupsRoundedIcon />
                </Box>
                <Stack direction="row" spacing={0.3}>
                  <Tooltip title="Modifier">
                    <IconButton size="small" onClick={() => setDialog({ open: true, group })}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" color="error" onClick={() => setDeleteTarget(group)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              <Typography sx={{ fontFamily: "'Manrope Variable'", fontSize: 21, fontWeight: 800, letterSpacing: '-0.03em', mt: 2 }}>
                {group.name}
              </Typography>
              <Typography sx={{ fontSize: 11.8, color: 'text.secondary', mt: 0.2 }}>
                {group.department}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 0.7 }}>
                <Chip size="small" icon={<ApartmentOutlinedIcon sx={{ fontSize: 14 }} />} label={group.level} sx={{ bgcolor: '#f4f7fa' }} />
                <Chip size="small" icon={<PeopleAltOutlinedIcon sx={{ fontSize: 14 }} />} label={`${group.studentCount} étudiant(s)`} sx={{ bgcolor: '#eaf7f4', color: 'secondary.dark' }} />
              </Stack>
            </Card>
          ))}
        </Box>
      )}

      <GroupFormDialog
        open={dialog.open}
        group={dialog.group}
        onClose={() => setDialog({ open: false, group: null })}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer ce groupe ?"
        description={
          deleteTarget
            ? `Le groupe ${deleteTarget.name} ne pourra être supprimé que s’il ne contient aucun étudiant ni cours.`
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

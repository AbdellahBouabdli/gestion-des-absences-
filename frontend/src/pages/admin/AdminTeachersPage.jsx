import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
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
import CoPresentRoundedIcon from '@mui/icons-material/CoPresentRounded';
import PageHeader from '../../components/PageHeader';
import UserAvatar from '../../components/UserAvatar';
import EmptyState from '../../components/EmptyState';
import TeacherFormDialog from '../../components/TeacherFormDialog';
import { PageError, PageLoader } from '../../components/PageLoader';
import { adminApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';

export default function AdminTeachersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState({ open: false, teacher: null });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-teachers'],
    queryFn: adminApi.teachers,
  });

  const teachers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (data || []).filter(
      (teacher) =>
        !needle ||
        teacher.fullName.toLowerCase().includes(needle) ||
        teacher.email.toLowerCase().includes(needle),
    );
  }, [data, search]);

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Enseignants"
        subtitle="Gérez les comptes enseignants et visualisez leurs cours et groupes rattachés."
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialog({ open: true, teacher: null })}>
            Ajouter un enseignant
          </Button>
        }
      />

      <Card sx={{ mb: 2.5, p: 2 }}>
        <TextField
          size="small"
          placeholder="Rechercher un enseignant…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ maxWidth: 380, width: '100%' }}
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
      </Card>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <PageError message={getErrorMessage(error)} onRetry={refetch} />
      ) : teachers.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CoPresentRoundedIcon />}
            title="Aucun enseignant trouvé"
            description="Ajoutez un enseignant pour lui permettre de gérer ses groupes et absences."
            action={<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialog({ open: true, teacher: null })}>Ajouter un enseignant</Button>}
          />
        </Card>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {teachers.map((teacher) => (
            <Card key={teacher.id} sx={{ p: 2 }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <UserAvatar name={teacher.fullName} size={40} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 750 }}>{teacher.fullName}</Typography>
                  <Typography noWrap sx={{ fontSize: 10.8, color: 'text.secondary' }}>{teacher.email}</Typography>
                </Box>
                <Button size="small" onClick={() => setDialog({ open: true, teacher })} sx={{ minWidth: 0, px: 1 }}>
                  <EditOutlinedIcon fontSize="small" />
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1.4 }}>
                <Chip size="small" label={`${teacher.courses} cours`} sx={{ bgcolor: '#eef3f8' }} />
                <Chip size="small" label={`${teacher.groups} groupe(s)`} sx={{ bgcolor: '#eaf7f4', color: 'secondary.dark' }} />
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
                  <TableCell>Enseignant</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Cours</TableCell>
                  <TableCell align="center">Groupes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <UserAvatar name={teacher.fullName} size={35} />
                        <Typography sx={{ fontSize: 12.8, fontWeight: 700 }}>{teacher.fullName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{teacher.email}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={teacher.courses} sx={{ bgcolor: '#eef3f8', minWidth: 36 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip size="small" label={teacher.groups} sx={{ bgcolor: '#eaf7f4', color: 'secondary.dark', minWidth: 36 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setDialog({ open: true, teacher })}>
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

      <TeacherFormDialog
        open={dialog.open}
        teacher={dialog.teacher}
        onClose={() => setDialog({ open: false, teacher: null })}
      />
    </>
  );
}

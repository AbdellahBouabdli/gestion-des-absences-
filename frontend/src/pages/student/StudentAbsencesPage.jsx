import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
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
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import EmptyState from '../../components/EmptyState';
import AbsenceDetailDialog from '../../components/AbsenceDetailDialog';
import JustificationUploadDialog from '../../components/JustificationUploadDialog';
import { PageError, PageLoader } from '../../components/PageLoader';
import { studentApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { formatDate, formatTime } from '../../utils/format';

export default function StudentAbsencesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [uploadFor, setUploadFor] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-absences'],
    queryFn: studentApi.absences,
  });

  const counts = useMemo(() => {
    const items = data || [];
    return {
      ALL: items.length,
      ABSENT: items.filter((item) => item.status === 'ABSENT').length,
      JUSTIFIED: items.filter((item) => item.status === 'JUSTIFIED').length,
    };
  }, [data]);

  const canUpload = (absence) =>
    absence.status === 'ABSENT' && (!absence.justificationStatus || absence.justificationStatus === 'REJECTED');

  const visible = (data || []).filter((absence) => {
    const tabOk = tab === 'ALL' || absence.status === tab;
    const needle = search.trim().toLowerCase();
    const searchOk =
      !needle ||
      absence.courseName.toLowerCase().includes(needle) ||
      absence.courseCode.toLowerCase().includes(needle) ||
      (absence.note || '').toLowerCase().includes(needle);
    return tabOk && searchOk;
  });

  const submitSuccess = () => {
    setUploadFor(null);
    queryClient.invalidateQueries({ queryKey: ['student-absences'] });
    queryClient.invalidateQueries({ queryKey: ['student-dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['student-justifications'] });
  };

  return (
    <>
      <PageHeader
        eyebrow="Mon dossier"
        title="Mes absences"
        subtitle="Consultez le détail de chaque absence et déposez un justificatif lorsque c’est nécessaire."
        actions={
          <Button variant="outlined" startIcon={<CalendarMonthRoundedIcon />} onClick={() => navigate('/student/schedule')}>
            Mon emploi du temps
          </Button>
        }
      />

      <Card sx={{ mb: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} spacing={1.5} sx={{ px: 1.5, py: 1 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ flex: 1, minHeight: 48 }}>
            <Tab value="ALL" label={`Toutes (${counts.ALL})`} />
            <Tab value="ABSENT" label={`Non justifiées (${counts.ABSENT})`} />
            <Tab value="JUSTIFIED" label={`Justifiées (${counts.JUSTIFIED})`} />
          </Tabs>
          <TextField
            size="small"
            placeholder="Rechercher un cours…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ minWidth: { xs: '100%', sm: 240 }, mr: { md: 1 } }}
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
        <Chip label={`${counts.ABSENT} absence(s) non justifiée(s) sur ${counts.ALL}`} sx={{ bgcolor: '#fff', border: '1px solid #e7edf3', color: 'text.secondary' }} />
      </Stack>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <PageError message={getErrorMessage(error)} onRetry={refetch} />
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<EventBusyRoundedIcon />}
            title="Aucune absence dans cette vue"
            description="Vos absences apparaîtront ici dès qu’un enseignant les aura enregistrées."
          />
        </Card>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {visible.map((absence) => (
            <Card key={absence.id} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 750 }}>{absence.courseName}</Typography>
                  <Typography sx={{ fontSize: 10.8, color: 'text.secondary' }}>
                    {absence.courseCode} · Salle {absence.room}
                  </Typography>
                </Box>
                <StatusChip status={absence.status} />
              </Stack>
              <Stack direction="row" spacing={0.8} sx={{ mt: 1.2, flexWrap: 'wrap', gap: 0.5 }}>
                <Chip size="small" label={formatDate(absence.date, 'ddd D MMM YYYY')} sx={{ bgcolor: '#f4f7fa' }} />
                <Chip size="small" label={`${formatTime(absence.startTime)}–${formatTime(absence.endTime)}`} sx={{ bgcolor: '#f4f7fa' }} />
                {absence.justificationStatus && <StatusChip status={absence.justificationStatus} kind="justification" />}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1.6 }}>
                <Button fullWidth size="small" variant="outlined" startIcon={<VisibilityOutlinedIcon />} onClick={() => setDetail(absence)}>
                  Détails
                </Button>
                {canUpload(absence) && (
                  <Button fullWidth size="small" variant="contained" color="secondary" startIcon={<UploadFileRoundedIcon />} onClick={() => setUploadFor(absence)}>
                    Justifier
                  </Button>
                )}
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
                  <TableCell>Cours</TableCell>
                  <TableCell>Date & heure</TableCell>
                  <TableCell>Salle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Justificatif</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((absence) => (
                  <TableRow key={absence.id} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: 12.8, fontWeight: 700 }}>{absence.courseName}</Typography>
                      <Typography sx={{ fontSize: 10.7, color: 'text.secondary' }}>{absence.courseCode}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12.3, textTransform: 'capitalize' }}>
                        {formatDate(absence.date, 'ddd D MMM YYYY')}
                      </Typography>
                      <Typography sx={{ fontSize: 10.7, color: 'text.secondary' }}>
                        {formatTime(absence.startTime)} – {formatTime(absence.endTime)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={absence.room} sx={{ bgcolor: '#f4f7fa' }} />
                    </TableCell>
                    <TableCell><StatusChip status={absence.status} /></TableCell>
                    <TableCell>
                      {absence.justificationStatus ? (
                        <StatusChip status={absence.justificationStatus} kind="justification" />
                      ) : (
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Non déposé</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.8} justifyContent="flex-end">
                        <Button size="small" startIcon={<VisibilityOutlinedIcon />} onClick={() => setDetail(absence)}>
                          Détails
                        </Button>
                        {canUpload(absence) && (
                          <Button size="small" variant="contained" color="secondary" onClick={() => setUploadFor(absence)}>
                            Justifier
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <AbsenceDetailDialog
        open={Boolean(detail)}
        absence={detail}
        onClose={() => setDetail(null)}
        onUpload={(absence) => {
          setDetail(null);
          setUploadFor(absence);
        }}
      />

      <JustificationUploadDialog
        open={Boolean(uploadFor)}
        absence={uploadFor}
        onClose={(refresh) => {
          if (!refresh) setUploadFor(null);
          else submitSuccess();
        }}
      />
    </>
  );
}

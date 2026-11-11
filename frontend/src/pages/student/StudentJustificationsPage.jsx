import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import EmptyState from '../../components/EmptyState';
import { PageError, PageLoader } from '../../components/PageLoader';
import { downloadJustification, studentApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { fileSize, formatDate, formatDateTime, formatTime } from '../../utils/format';

export default function StudentJustificationsPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['student-justifications'],
    queryFn: studentApi.justifications,
  });

  const visible = (data || []).filter((item) => tab === 'ALL' || item.status === tab);
  const count = (status) => (data || []).filter((item) => item.status === status).length;

  const download = async (item) => {
    setDownloadingId(item.id);
    try {
      await downloadJustification(item.id, item.fileName || 'justificatif');
    } catch {
      toast.error('Le fichier n’a pas pu être téléchargé.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Suivi des demandes"
        title="Mes justificatifs"
        subtitle="Suivez l’état de vos justificatifs et consultez les commentaires de vos enseignants."
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/student/absences')}>
            Déposer un justificatif
          </Button>
        }
      />

      <Card sx={{ mb: 2.5, px: 1.5 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab value="ALL" label={`Tous (${data?.length || 0})`} />
          <Tab value="PENDING" label={`En attente (${count('PENDING')})`} />
          <Tab value="APPROVED" label={`Approuvés (${count('APPROVED')})`} />
          <Tab value="REJECTED" label={`Refusés (${count('REJECTED')})`} />
        </Tabs>
      </Card>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <PageError message={getErrorMessage(error)} onRetry={refetch} />
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<EventAvailableRoundedIcon />}
            title="Aucun justificatif dans cette vue"
            description="Déposez un justificatif depuis l’une de vos absences non justifiées."
            action={
              <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/student/absences')}>
                Voir mes absences
              </Button>
            }
          />
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0,1fr))' }, gap: 2 }}>
          {visible.map((item) => (
            <Card key={item.id}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ p: 2.4, pb: 1.4 }}>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 750 }}>{item.courseName}</Typography>
                  <Typography sx={{ fontSize: 11.2, color: 'text.secondary', textTransform: 'capitalize' }}>
                    {formatDate(item.date, 'dddd D MMMM YYYY')} · {formatTime(item.startTime)} – {formatTime(item.endTime)}
                  </Typography>
                </Box>
                <StatusChip status={item.status} kind="justification" />
              </Stack>
              <Box sx={{ px: 2.4, pb: 2 }}>
                <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 1.4, mb: 1.5 }}>
                  <Typography sx={{ fontSize: 10.4, color: 'text.secondary', fontWeight: 700, letterSpacing: '.04em', mb: 0.4 }}>
                    MOTIF
                  </Typography>
                  <Typography sx={{ fontSize: 12.3, lineHeight: 1.55 }}>{item.reason}</Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip
                    icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 15 }} />}
                    label={item.fileName ? `${item.fileName}${item.fileSize ? ` · ${fileSize(item.fileSize)}` : ''}` : 'Sans pièce jointe'}
                    size="small"
                    sx={{ bgcolor: '#f4f7fa', maxWidth: 280 }}
                  />
                  {item.fileName && (
                    <Tooltip title="Télécharger">
                      <IconButton size="small" onClick={() => download(item)} disabled={downloadingId === item.id}>
                        <DownloadRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                {item.status === 'PENDING' && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5, bgcolor: '#fdf8ed', borderRadius: 2, p: 1.2 }}>
                    <FactCheckRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography sx={{ fontSize: 11.5, color: 'warning.dark' }}>
                      Votre justificatif est en attente de vérification.
                    </Typography>
                  </Stack>
                )}
                {item.status === 'APPROVED' && (
                  <Box sx={{ mt: 1.5, bgcolor: '#eef9f3', borderRadius: 2, p: 1.3 }}>
                    <Typography sx={{ fontSize: 11.5, color: 'success.dark', fontWeight: 650 }}>
                      Justificatif accepté par {item.reviewedByName || 'l’enseignant'}.
                    </Typography>
                    {item.reviewComment && (
                      <Typography sx={{ fontSize: 11.4, mt: 0.3, color: 'text.secondary' }}>{item.reviewComment}</Typography>
                    )}
                  </Box>
                )}
                {item.status === 'REJECTED' && (
                  <Box sx={{ mt: 1.5, bgcolor: '#fdf0ec', borderRadius: 2, p: 1.3 }}>
                    <Typography sx={{ fontSize: 11.5, color: 'error.dark', fontWeight: 650 }}>
                      Justificatif refusé. Vous pouvez en déposer un nouveau.
                    </Typography>
                    {item.reviewComment && (
                      <Typography sx={{ fontSize: 11.4, mt: 0.3, color: 'text.secondary' }}>{item.reviewComment}</Typography>
                    )}
                    <Button size="small" sx={{ mt: 0.8, px: 0 }} onClick={() => navigate('/student/absences')}>
                      Déposer un nouveau justificatif
                    </Button>
                  </Box>
                )}
                {item.reviewedAt && (
                  <Typography sx={{ fontSize: 10.4, color: 'text.secondary', mt: 1.4 }}>
                    Traité le {formatDateTime(item.reviewedAt)}
                  </Typography>
                )}
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </>
  );
}

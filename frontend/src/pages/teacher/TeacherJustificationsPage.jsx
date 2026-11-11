import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import PageHeader from '../../components/PageHeader';
import StatusChip from '../../components/StatusChip';
import UserAvatar from '../../components/UserAvatar';
import EmptyState from '../../components/EmptyState';
import ReviewJustificationDialog from '../../components/ReviewJustificationDialog';
import { PageError, PageLoader } from '../../components/PageLoader';
import { downloadJustification, teacherApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { fileSize, formatDate, formatDateTime, formatTime } from '../../utils/format';

const tabs = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvés' },
  { value: 'REJECTED', label: 'Refusés' },
  { value: 'ALL', label: 'Tous' },
];

export default function TeacherJustificationsPage() {
  const toast = useToast();
  const [tab, setTab] = useState('PENDING');
  const [review, setReview] = useState({ open: false, item: null, decision: 'APPROVED' });
  const [downloadingId, setDownloadingId] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['teacher-justifications'],
    queryFn: () => teacherApi.justifications(),
  });

  const counts = useMemo(() => {
    const items = data || [];
    return {
      PENDING: items.filter((item) => item.status === 'PENDING').length,
      APPROVED: items.filter((item) => item.status === 'APPROVED').length,
      REJECTED: items.filter((item) => item.status === 'REJECTED').length,
      ALL: items.length,
    };
  }, [data]);

  const visible = (data || []).filter((item) => tab === 'ALL' || item.status === tab);

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
        eyebrow="Vérification"
        title="Justificatifs"
        subtitle="Consultez les pièces déposées par vos étudiants et validez les absences justifiées."
        actions={
          <Chip
            icon={<FactCheckRoundedIcon sx={{ fontSize: 15 }} />}
            label={`${counts.PENDING} en attente`}
            sx={{ bgcolor: counts.PENDING ? '#fdf5e6' : '#f1f5f9', color: counts.PENDING ? 'warning.dark' : 'text.secondary', height: 34 }}
          />
        }
      />

      <Card sx={{ mb: 2.5, px: 1.5 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
          {tabs.map((item) => (
            <Tab
              key={item.value}
              value={item.value}
              label={
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <span>{item.label}</span>
                  <Box
                    sx={{
                      minWidth: 20,
                      height: 20,
                      px: 0.6,
                      borderRadius: 99,
                      bgcolor: tab === item.value ? '#e6f7f3' : '#f1f5f9',
                      color: tab === item.value ? 'secondary.dark' : 'text.secondary',
                      fontSize: 10,
                      fontWeight: 750,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {counts[item.value]}
                  </Box>
                </Stack>
              }
            />
          ))}
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
            title={tab === 'PENDING' ? 'Aucun justificatif en attente' : 'Aucun justificatif dans cette catégorie'}
            description={
              tab === 'PENDING'
                ? 'Tous les documents déposés ont été traités. Votre file de vérification est vide.'
                : 'Les justificatifs apparaîtront ici dès que vos étudiants en déposeront.'
            }
          />
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
          {visible.map((item) => (
            <Card key={item.id} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2} sx={{ p: 2.4, pb: 1.6 }}>
                <Stack direction="row" spacing={1.3}>
                  <UserAvatar name={item.studentName} size={40} />
                  <Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 750 }}>{item.studentName}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {item.groupName} · {formatDate(item.date, 'ddd D MMM YYYY')}
                    </Typography>
                  </Box>
                </Stack>
                <StatusChip status={item.status} kind="justification" />
              </Stack>

              <Box sx={{ px: 2.4, flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 650 }}>{item.courseName}</Typography>
                  <Typography sx={{ fontSize: 10.8, color: 'text.secondary' }}>
                    · {formatTime(item.startTime)}–{formatTime(item.endTime)}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    borderLeft: '3px solid #bfe9e1',
                    bgcolor: '#f8fcfb',
                    borderRadius: '0 10px 10px 0',
                    px: 1.5,
                    py: 1.1,
                    mb: 1.6,
                  }}
                >
                  <Typography sx={{ fontSize: 12.3, color: 'text.primary', lineHeight: 1.55 }}>{item.reason}</Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.6 }}>
                  <Chip
                    icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: 15 }} />}
                    label={item.fileName ? `${item.fileName}${item.fileSize ? ` · ${fileSize(item.fileSize)}` : ''}` : 'Sans pièce jointe'}
                    size="small"
                    sx={{ bgcolor: '#f4f7fa', maxWidth: 280 }}
                  />
                  {item.fileName && (
                    <Tooltip title="Télécharger la pièce jointe">
                      <IconButton size="small" onClick={() => download(item)} disabled={downloadingId === item.id}>
                        <DownloadRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                {item.status !== 'PENDING' && (
                  <Box sx={{ mt: 1.6, bgcolor: '#f8fafc', borderRadius: 2, p: 1.3 }}>
                    <Typography sx={{ fontSize: 10.8, color: 'text.secondary', fontWeight: 650 }}>
                      Traité par {item.reviewedByName || '—'} · {formatDateTime(item.reviewedAt)}
                    </Typography>
                    {item.reviewComment && (
                      <Typography sx={{ fontSize: 11.8, mt: 0.4, color: 'text.primary' }}>{item.reviewComment}</Typography>
                    )}
                  </Box>
                )}
              </Box>

              {item.status === 'PENDING' && (
                <>
                  <Divider sx={{ mt: 2 }} />
                  <Stack direction="row" spacing={1} sx={{ p: 1.6, px: 2.4 }} justifyContent="flex-end">
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<CloseRoundedIcon />}
                      onClick={() => setReview({ open: true, item, decision: 'REJECTED' })}
                    >
                      Refuser
                    </Button>
                    <Button
                      size="small"
                      color="success"
                      variant="contained"
                      startIcon={<CheckRoundedIcon />}
                      onClick={() => setReview({ open: true, item, decision: 'APPROVED' })}
                    >
                      Approuver
                    </Button>
                  </Stack>
                </>
              )}
            </Card>
          ))}
        </Box>
      )}

      <ReviewJustificationDialog
        open={review.open}
        justification={review.item}
        decision={review.decision}
        onClose={() => setReview({ open: false, item: null, decision: 'APPROVED' })}
      />
    </>
  );
}

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import dayjs from 'dayjs';
import StatusChip from './StatusChip';
import { downloadJustification } from '../api/endpoints';
import { useToast } from '../context/ToastContext';
import { formatDate, formatTime } from '../utils/format';

function Detail({ icon: Icon, label, value }) {
  return (
    <Stack direction="row" spacing={1.2} alignItems="flex-start">
      <Box sx={{ color: '#8a9cb0', mt: 0.15 }}>
        <Icon sx={{ fontSize: 17 }} />
      </Box>
      <Box>
        <Typography sx={{ fontSize: 10.5, color: 'text.secondary', fontWeight: 650, textTransform: 'uppercase', letterSpacing: '.05em' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', mt: 0.2 }}>{value}</Typography>
      </Box>
    </Stack>
  );
}

export default function AbsenceDetailDialog({ open, absence, onClose, onUpload }) {
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);
  if (!absence) return null;

  const canUpload = absence.status === 'ABSENT' && (!absence.justificationStatus || absence.justificationStatus === 'REJECTED');

  const download = async () => {
    setDownloading(true);
    try {
      await downloadJustification(absence.justificationId, `justificatif-${absence.id}.png`);
    } catch {
      toast.error('Le fichier n’a pas pu être téléchargé.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 10 }}>
            DÉTAIL DE L&apos;ABSENCE
          </Typography>
          <Typography sx={{ fontFamily: "'Manrope Variable'", fontWeight: 800, fontSize: 21, letterSpacing: '-0.03em', mt: 0.3 }}>
            {absence.courseName}
          </Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {absence.courseCode} · {absence.groupName}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Fermer">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
          <StatusChip status={absence.status} />
          {absence.justificationStatus && <StatusChip status={absence.justificationStatus} kind="justification" />}
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.2, mb: 2.5 }}>
          <Detail icon={ScheduleRoundedIcon} label="Date" value={formatDate(absence.date, 'dddd D MMMM YYYY')} />
          <Detail
            icon={ScheduleRoundedIcon}
            label="Horaire"
            value={`${formatTime(absence.startTime)} – ${formatTime(absence.endTime)}`}
          />
          <Detail icon={PlaceOutlinedIcon} label="Salle" value={absence.room} />
          <Detail icon={PersonOutlineRoundedIcon} label="Enseignant" value={absence.recordedByName || '—'} />
        </Box>

        {absence.note && (
          <Box sx={{ bgcolor: '#f8fafc', border: '1px solid #edf1f5', borderRadius: 2.4, p: 1.8, mb: 2 }}>
            <Typography sx={{ fontSize: 10.5, color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', mb: 0.5 }}>
              Note de l&apos;enseignant
            </Typography>
            <Typography sx={{ fontSize: 12.8, color: 'text.primary' }}>{absence.note}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ fontSize: 12.5, fontWeight: 750, mb: 1.2 }}>Justificatif</Typography>
        {absence.justificationId ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ border: '1px solid #e7edf3', borderRadius: 2.4, p: 1.5, gap: 1 }}
          >
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 650 }}>
                Document déposé
              </Typography>
              <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                {absence.justificationStatus === 'PENDING'
                  ? 'En cours de vérification par l’enseignant.'
                  : absence.justificationStatus === 'APPROVED'
                    ? 'Justificatif accepté.'
                    : 'Justificatif refusé. Vous pouvez en déposer un nouveau.'}
              </Typography>
            </Box>
            <Button
              size="small"
              startIcon={<DownloadRoundedIcon />}
              onClick={download}
              disabled={downloading}
              variant="outlined"
              sx={{ flexShrink: 0 }}
            >
              Ouvrir
            </Button>
          </Stack>
        ) : (
          <Alert severity={canUpload ? 'info' : 'warning'} sx={{ fontSize: 12 }}>
            {canUpload
              ? 'Aucun justificatif déposé pour cette absence. Vous pouvez en ajouter un ci-dessous.'
              : 'Aucun justificatif associé à cette absence.'}
          </Alert>
        )}

        {canUpload && (
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<UploadFileRoundedIcon />}
            sx={{ mt: 2 }}
            onClick={() => onUpload(absence)}
          >
            Déposer un justificatif
          </Button>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

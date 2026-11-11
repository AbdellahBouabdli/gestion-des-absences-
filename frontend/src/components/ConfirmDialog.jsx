import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  destructive = false,
  loading = false,
  onConfirm,
  onClose,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <WarningAmberRoundedIcon sx={{ color: destructive ? 'error.main' : 'warning.main' }} />
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose} color="inherit" disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            color={destructive ? 'error' : 'primary'}
            disabled={loading}
          >
            {loading ? 'Traitement…' : confirmLabel}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'error',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: confirmColor === 'error' ? '#fdeaea' : '#fff3dc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningAmberIcon sx={{ color: confirmColor === 'error' ? 'error.main' : 'warning.main', fontSize: 22 }} />
          </Box>
          <Box>
            <Box sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: 17 }}>{title}</Box>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: 14 }}>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined" size="small" disabled={loading}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} size="small" disabled={loading}>
          {loading ? 'Processing…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

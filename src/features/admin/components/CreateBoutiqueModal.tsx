import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Typography, CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

interface FormValues {
  name: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  address: string;
  gstin: string;
  cloudName: string;
  uploadPreset: string;
  cloudFolder: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues) => Promise<void>;
  loading?: boolean;
}

export default function CreateBoutiqueModal({ open, onClose, onSubmit, loading }: Props) {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', ownerName: '', ownerPhone: '+91', ownerEmail: '', address: '', gstin: '', cloudName: '', uploadPreset: '', cloudFolder: '' },
  });

  const handleClose = () => { reset(); onClose(); };
  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
    handleClose();
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontFamily="'Playfair Display', serif" fontWeight={700}>New Boutique</Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Controller name="name" control={control} rules={{ required: 'Boutique name is required' }}
            render={({ field }) => (
              <TextField {...field} label="Boutique Name" fullWidth required error={!!errors.name} helperText={errors.name?.message} />
            )} />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Controller name="ownerName" control={control} rules={{ required: 'Owner name required' }}
              render={({ field }) => (
                <TextField {...field} label="Owner Name" fullWidth required error={!!errors.ownerName} helperText={errors.ownerName?.message} />
              )} />
            <Controller name="ownerPhone" control={control} rules={{ required: 'Phone required' }}
              render={({ field }) => (
                <TextField {...field} label="Owner Phone" sx={{ width: 160, flexShrink: 0 }} required error={!!errors.ownerPhone} helperText={errors.ownerPhone?.message} />
              )} />
          </Box>
          <Controller name="ownerEmail" control={control}
            render={({ field }) => <TextField {...field} label="Owner Email (optional)" fullWidth type="email" />} />
          <Controller name="address" control={control}
            render={({ field }) => <TextField {...field} label="Address (optional)" fullWidth multiline rows={2} />} />
          <Controller name="gstin" control={control}
            render={({ field }) => <TextField {...field} label="GSTIN (optional)" fullWidth />} />

          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            Cloudinary Image Storage (optional)
          </Typography>
          <Controller name="cloudName" control={control}
            render={({ field }) => <TextField {...field} label="Cloud Name" fullWidth size="small" />} />
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Controller name="uploadPreset" control={control}
              render={({ field }) => <TextField {...field} label="Upload Preset" fullWidth size="small" />} />
            <Controller name="cloudFolder" control={control}
              render={({ field }) => <TextField {...field} label="Folder" fullWidth size="small" />} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" size="small" disabled={loading}>Cancel</Button>
        <Button onClick={handleFormSubmit} variant="contained" size="small" disabled={loading}>
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Create Boutique'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

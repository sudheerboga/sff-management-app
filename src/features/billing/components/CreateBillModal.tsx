import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Typography, IconButton, Divider, InputAdornment,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { BillItem } from '@/types';

interface FormValues {
  customerName: string;
  customerPhone: string;
  gstPercent: string;
  paidAmount: string;
  notes: string;
  items: { description: string; qty: string; rate: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { customerName: string; customerPhone: string; items: BillItem[]; gstPercent: number; paidAmount: number; notes: string }) => Promise<void>;
  loading?: boolean;
}

export default function CreateBillModal({ open, onClose, onSubmit, loading }: Props) {
  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: {
      customerName: '', customerPhone: '', gstPercent: '0', paidAmount: '0', notes: '',
      items: [{ description: '', qty: '1', rate: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const gstPercent = parseFloat(watch('gstPercent') || '0') || 0;
  const paidAmount = parseFloat(watch('paidAmount') || '0') || 0;
  const subtotal = items.reduce((s, i) => s + (parseInt(i.qty) || 0) * (parseFloat(i.rate) || 0), 0);
  const gstAmount = (subtotal * gstPercent) / 100;
  const total = subtotal + gstAmount;
  const balance = total - paidAmount;

  const handleClose = () => { reset(); onClose(); };

  const handleFormSubmit = handleSubmit(async (values) => {
    const billItems: BillItem[] = values.items
      .filter((i) => i.description && parseFloat(i.rate) > 0)
      .map((i) => ({
        description: i.description,
        qty: parseInt(i.qty) || 1,
        rate: parseFloat(i.rate) || 0,
        amount: (parseInt(i.qty) || 1) * (parseFloat(i.rate) || 0),
      }));
    await onSubmit({
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      items: billItems,
      gstPercent: parseFloat(values.gstPercent) || 0,
      paidAmount: parseFloat(values.paidAmount) || 0,
      notes: values.notes,
    });
    handleClose();
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={window.innerWidth < 600}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontFamily="'Playfair Display', serif" fontWeight={700}>New Bill</Typography>
        <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Controller name="customerName" control={control} rules={{ required: true }}
              render={({ field }) => <TextField {...field} label="Customer Name" fullWidth required />} />
            <Controller name="customerPhone" control={control}
              render={({ field }) => <TextField {...field} label="Phone" sx={{ width: 160, flexShrink: 0 }} />} />
          </Box>

          <Divider><Typography variant="caption" color="text.secondary">Line Items</Typography></Divider>

          {fields.map((field, idx) => (
            <Box key={field.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Controller name={`items.${idx}.description`} control={control}
                render={({ field: f }) => <TextField {...f} label="Description" size="small" sx={{ flex: 1 }} />} />
              <Controller name={`items.${idx}.qty`} control={control}
                render={({ field: f }) => <TextField {...f} label="Qty" type="number" size="small" sx={{ width: 60, flexShrink: 0 }} />} />
              <Controller name={`items.${idx}.rate`} control={control}
                render={({ field: f }) => (
                  <TextField {...f} label="Rate" type="number" size="small" sx={{ width: 100, flexShrink: 0 }}
                    InputProps={{ startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: 12 } }}>₹</InputAdornment> }} />
                )} />
              <Typography variant="body2" fontWeight={600} sx={{ mt: 1.25, minWidth: 64, textAlign: 'right', flexShrink: 0 }}>
                ₹{((parseInt(items[idx]?.qty) || 0) * (parseFloat(items[idx]?.rate) || 0)).toLocaleString()}
              </Typography>
              <IconButton size="small" onClick={() => remove(idx)} disabled={fields.length === 1} sx={{ mt: 0.5 }}>
                <DeleteOutlineIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          ))}

          <Button startIcon={<AddIcon />} size="small" variant="outlined"
            onClick={() => append({ description: '', qty: '1', rate: '' })}>
            Add item
          </Button>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Controller name="gstPercent" control={control}
              render={({ field }) => (
                <TextField {...field} label="GST %" type="number" sx={{ width: 100, flexShrink: 0 }}
                  InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
              )} />
            <Controller name="paidAmount" control={control}
              render={({ field }) => (
                <TextField {...field} label="Amount Paid" type="number" fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
              )} />
          </Box>

          <Controller name="notes" control={control}
            render={({ field }) => <TextField {...field} label="Notes" multiline rows={2} fullWidth />} />

          <Box sx={{ background: (t) => t.palette.brand.gradientSoft, borderRadius: 2, p: 2 }}>
            {[
              { label: 'Subtotal', value: subtotal },
              ...(gstPercent > 0 ? [{ label: `GST (${gstPercent}%)`, value: gstAmount }] : []),
              { label: 'Total', value: total, bold: true },
              { label: 'Paid', value: paidAmount },
              { label: 'Balance', value: balance, color: balance > 0 ? 'error.main' : 'success.main' },
            ].map(({ label, value, bold, color }) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={bold ? 700 : 400}>{label}</Typography>
                <Typography variant="body2" fontWeight={bold ? 700 : 600} color={color as string || 'text.primary'}>
                  ₹{value.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" size="small" disabled={loading}>Cancel</Button>
        <Button onClick={handleFormSubmit} variant="contained" size="small" disabled={loading}>
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Create Bill'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

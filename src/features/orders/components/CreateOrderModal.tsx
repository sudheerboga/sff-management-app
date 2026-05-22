import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Typography, IconButton, Divider, MenuItem,
  InputAdornment, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { Order, OrderItem } from '@/types';

const GARMENTS = [
  'Blouse', 'Lehenga', 'Saree', 'Churidar', 'Salwar', 'Gown', 'Frock',
  'Kurti', 'Pavadai', 'Skirt', 'Top', 'Jacket', 'Other',
];

interface FormValues {
  customerName: string;
  customerPhone: string;
  deliveryDate: string;
  paidAmount: string;
  notes: string;
  items: { garment: string; description: string; qty: string; rate: string; profit: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { customerName: string; customerPhone: string; items: OrderItem[]; paidAmount: number; deliveryDate: Date | null; notes: string }) => Promise<void>;
  loading?: boolean;
  defaultValues?: Partial<Order>;
  title?: string;
}

export default function CreateOrderModal({ open, onClose, onSubmit, loading, defaultValues, title }: Props) {
  const user = useAuthStore((s) => s.user);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      customerName: defaultValues?.customerName || '',
      customerPhone: defaultValues?.customerPhone || '',
      deliveryDate: defaultValues?.deliveryDate ? defaultValues.deliveryDate.toISOString().split('T')[0] : '',
      paidAmount: defaultValues?.paidAmount?.toString() || '0',
      notes: defaultValues?.notes || '',
      items: defaultValues?.items?.map((i) => ({
        garment: i.garment,
        description: i.description || '',
        qty: i.qty.toString(),
        rate: i.rate.toString(),
        profit: i.profit.toString(),
      })) || [{ garment: '', description: '', qty: '1', rate: '', profit: '0' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const paidAmount = parseFloat(watch('paidAmount') || '0') || 0;
  const totalAmount = items.reduce((s, i) => s + ((parseFloat(i.qty) || 0) * (parseFloat(i.rate) || 0)), 0);
  const balance = totalAmount - paidAmount;

  const handleClose = () => { reset(); onClose(); };

  const handleFormSubmit = handleSubmit(async (values) => {
    const orderItems: OrderItem[] = values.items
      .filter((i) => i.garment && parseFloat(i.rate) > 0)
      .map((i) => ({
        garment: i.garment,
        description: i.description,
        qty: parseInt(i.qty) || 1,
        rate: parseFloat(i.rate) || 0,
        amount: (parseInt(i.qty) || 1) * (parseFloat(i.rate) || 0),
        profit: parseFloat(i.profit) || 0,
      }));
    await onSubmit({
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      items: orderItems,
      paidAmount: parseFloat(values.paidAmount) || 0,
      deliveryDate: values.deliveryDate ? new Date(values.deliveryDate) : null,
      notes: values.notes,
    });
    handleClose();
  });

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={window.innerWidth < 600}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontFamily="'Playfair Display', serif" fontWeight={700}>
          {title || 'New Order'}
        </Typography>
        <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Controller name="customerName" control={control} rules={{ required: 'Name required' }}
              render={({ field }) => (
                <TextField {...field} label="Customer Name" fullWidth error={!!errors.customerName}
                  helperText={errors.customerName?.message} required />
              )} />
            <Controller name="customerPhone" control={control}
              render={({ field }) => <TextField {...field} label="Phone" sx={{ width: 160, flexShrink: 0 }} />} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Controller name="deliveryDate" control={control}
              render={({ field }) => (
                <TextField {...field} label="Delivery Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
              )} />
            <Controller name="paidAmount" control={control}
              render={({ field }) => (
                <TextField {...field} label="Advance Paid" type="number" sx={{ width: 160, flexShrink: 0 }}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
              )} />
          </Box>

          <Divider><Typography variant="caption" color="text.secondary">Items</Typography></Divider>

          {fields.map((field, idx) => (
            <Box key={field.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Controller name={`items.${idx}.garment`} control={control}
                render={({ field: f }) => (
                  <TextField {...f} label="Garment" select size="small" sx={{ width: 130, flexShrink: 0 }}>
                    {GARMENTS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                  </TextField>
                )} />
              <Controller name={`items.${idx}.description`} control={control}
                render={({ field: f }) => <TextField {...f} label="Description" size="small" sx={{ flex: 1 }} />} />
              <Controller name={`items.${idx}.qty`} control={control}
                render={({ field: f }) => <TextField {...f} label="Qty" type="number" size="small" sx={{ width: 56, flexShrink: 0 }} />} />
              <Controller name={`items.${idx}.rate`} control={control}
                render={({ field: f }) => (
                  <TextField {...f} label="Rate" type="number" size="small" sx={{ width: 90, flexShrink: 0 }}
                    InputProps={{ startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: 12 } }}>₹</InputAdornment> }} />
                )} />
              <Controller name={`items.${idx}.profit`} control={control}
                render={({ field: f }) => (
                  <TextField {...f} label="Profit" type="number" size="small" sx={{ width: 80, flexShrink: 0 }}
                    InputProps={{ startAdornment: <InputAdornment position="start" sx={{ '& p': { fontSize: 12 } }}>₹</InputAdornment> }} />
                )} />
              <IconButton size="small" onClick={() => remove(idx)} disabled={fields.length === 1} sx={{ mt: 0.5 }}>
                <DeleteOutlineIcon fontSize="small" color="error" />
              </IconButton>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            size="small"
            variant="outlined"
            onClick={() => append({ garment: '', description: '', qty: '1', rate: '', profit: '0' })}
          >
            Add item
          </Button>

          <Controller name="notes" control={control}
            render={({ field }) => <TextField {...field} label="Notes" multiline rows={2} fullWidth />} />

          <Box sx={{ background: (t) => t.palette.brand.gradientSoft, borderRadius: 2, p: 1.5, display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Total</Typography>
              <Typography variant="subtitle1" fontWeight={700}>₹{totalAmount.toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Advance</Typography>
              <Typography variant="subtitle1" fontWeight={700} color="success.main">₹{paidAmount.toLocaleString()}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Balance</Typography>
              <Typography variant="subtitle1" fontWeight={700} color={balance > 0 ? 'error.main' : 'success.main'}>₹{balance.toLocaleString()}</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" size="small" disabled={loading}>Cancel</Button>
        <Button onClick={handleFormSubmit} variant="contained" size="small" disabled={loading}>
          {loading ? <CircularProgress size={18} color="inherit" /> : (defaultValues ? 'Update Order' : 'Create Order')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

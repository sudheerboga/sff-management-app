import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Typography, IconButton, Tabs, Tab, Chip,
  CircularProgress, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useState } from 'react';
import { Measurement, CustomerMeasurements } from '@/types';

const GARMENT_TYPES = ['Blouse', 'Lehenga', 'Saree', 'Churidar', 'Frock', 'Gown', 'Pavadai', 'Kurti', 'Custom'];

const DEFAULT_FIELDS: Record<string, string[]> = {
  Blouse:   ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Sleeve Width', 'Length', 'Back Length', 'Neck Depth Front', 'Neck Depth Back'],
  Lehenga:  ['Waist', 'Hip', 'Length', 'Blouse Chest', 'Blouse Waist', 'Blouse Length'],
  Churidar: ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Churidar Length', 'Bottom'],
  Frock:    ['Chest', 'Waist', 'Hip', 'Length', 'Shoulder', 'Sleeve Length'],
  Gown:     ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Length'],
  Saree:    ['Waist', 'Hip', 'Fall Length'],
  Pavadai:  ['Waist', 'Hip', 'Length'],
  Kurti:    ['Chest', 'Waist', 'Hip', 'Length', 'Shoulder', 'Sleeve Length'],
  Custom:   [],
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { customerName: string; customerPhone: string; garments: CustomerMeasurements; notes: string }) => Promise<void>;
  loading?: boolean;
  defaultValues?: Measurement;
}

export default function MeasurementForm({ open, onClose, onSubmit, loading, defaultValues }: Props) {
  const [customerName, setCustomerName] = useState(defaultValues?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState(defaultValues?.customerPhone || '');
  const [notes, setNotes] = useState(defaultValues?.notes || '');
  const [garmentTab, setGarmentTab] = useState(0);
  const [selectedGarments, setSelectedGarments] = useState<string[]>(
    defaultValues ? Object.keys(defaultValues.garments) : ['Blouse'],
  );
  const [measurements, setMeasurements] = useState<CustomerMeasurements>(
    defaultValues?.garments || { Blouse: {} },
  );
  const [customFields, setCustomFields] = useState<Record<string, string[]>>(
    defaultValues
      ? Object.fromEntries(Object.entries(defaultValues.garments).map(([g, vals]) => [g, Object.keys(vals)]))
      : { Blouse: DEFAULT_FIELDS.Blouse },
  );

  const [newFieldName, setNewFieldName] = useState('');

  const addGarment = (garment: string) => {
    if (selectedGarments.includes(garment)) return;
    setSelectedGarments((g) => [...g, garment]);
    setMeasurements((m) => ({ ...m, [garment]: {} }));
    setCustomFields((f) => ({ ...f, [garment]: DEFAULT_FIELDS[garment] || [] }));
    setGarmentTab(selectedGarments.length);
  };

  const removeGarment = (garment: string) => {
    const idx = selectedGarments.indexOf(garment);
    setSelectedGarments((g) => g.filter((x) => x !== garment));
    setMeasurements((m) => { const c = { ...m }; delete c[garment]; return c; });
    setGarmentTab((t) => (t >= idx && t > 0 ? t - 1 : t));
  };

  const setField = (garment: string, field: string, value: string) => {
    setMeasurements((m) => ({ ...m, [garment]: { ...m[garment], [field]: value } }));
  };

  const addCustomField = (garment: string) => {
    if (!newFieldName.trim()) return;
    setCustomFields((f) => ({ ...f, [garment]: [...(f[garment] || []), newFieldName.trim()] }));
    setNewFieldName('');
  };

  const removeField = (garment: string, field: string) => {
    setCustomFields((f) => ({ ...f, [garment]: f[garment].filter((x) => x !== field) }));
    setMeasurements((m) => { const c = { ...m[garment] }; delete c[field]; return { ...m, [garment]: c }; });
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) return;
    await onSubmit({ customerName, customerPhone, garments: measurements, notes });
    onClose();
  };

  const currentGarment = selectedGarments[garmentTab];
  const fields = currentGarment ? (customFields[currentGarment] || DEFAULT_FIELDS[currentGarment] || []) : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={window.innerWidth < 600}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" fontFamily="'Playfair Display', serif" fontWeight={700}>
          {defaultValues ? 'Edit Measurements' : 'New Measurements'}
        </Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5 }}>
          <TextField label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} fullWidth required />
          <TextField label="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} sx={{ width: 160, flexShrink: 0 }} />
        </Box>

        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Garment Types</Typography>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
          {GARMENT_TYPES.map((g) => (
            <Chip
              key={g}
              label={g}
              size="small"
              clickable
              onClick={() => addGarment(g)}
              color={selectedGarments.includes(g) ? 'primary' : 'default'}
              variant={selectedGarments.includes(g) ? 'filled' : 'outlined'}
              sx={{ height: 26, fontSize: 12 }}
            />
          ))}
        </Box>

        {selectedGarments.length > 0 && (
          <>
            <Tabs
              value={garmentTab}
              onChange={(_, v) => setGarmentTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              {selectedGarments.map((g, i) => (
                <Tab
                  key={g}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {g}
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); removeGarment(g); }}
                        sx={{ width: 16, height: 16, ml: 0.25 }}>
                        <CloseIcon sx={{ fontSize: 10 }} />
                      </IconButton>
                    </Box>
                  }
                  sx={{ minHeight: 40, fontSize: 13, textTransform: 'none', fontWeight: 600 }}
                />
              ))}
            </Tabs>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
              {fields.map((field) => (
                <Box key={field} sx={{ position: 'relative' }}>
                  <TextField
                    label={field}
                    value={measurements[currentGarment]?.[field] || ''}
                    onChange={(e) => setField(currentGarment, field, e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{ endAdornment: <Typography variant="caption" sx={{ color: 'text.disabled', mr: 0.5 }}>cm</Typography> }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeField(currentGarment, field)}
                    sx={{ position: 'absolute', top: -8, right: -8, width: 18, height: 18, background: 'background.paper', border: '1px solid', borderColor: 'divider' }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 10 }} />
                  </IconButton>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                label="Add custom field"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                onKeyDown={(e) => e.key === 'Enter' && addCustomField(currentGarment)}
              />
              <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={() => addCustomField(currentGarment)}>
                Add
              </Button>
            </Box>
          </>
        )}

        <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline rows={2} fullWidth sx={{ mt: 2 }} />
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" size="small" disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" size="small" disabled={loading || !customerName.trim()}>
          {loading ? <CircularProgress size={18} color="inherit" /> : (defaultValues ? 'Update' : 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

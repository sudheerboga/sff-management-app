import { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment,
  IconButton, Grid, Chip, Skeleton, Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StraightenIcon from '@mui/icons-material/Straighten';
import { format } from 'date-fns';
import { useMeasurements } from './hooks/useMeasurements';
import MeasurementForm from './components/MeasurementForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import { Measurement } from '@/types';
import { useAuthStore } from '@/stores/authStore';

export default function MeasurementsPage() {
  const user = useAuthStore((s) => s.user);
  const { query, createMutation, updateMutation, deleteMutation } = useMeasurements();
  const measurements = query.data || [];

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Measurement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return measurements;
    const s = search.toLowerCase();
    return measurements.filter((m) => m.customerName.toLowerCase().includes(s) || m.customerPhone?.includes(s));
  }, [measurements, search]);

  const isStaff = user?.role === 'staff';

  return (
    <Box>
      <PageHeader
        title="Measurements"
        subtitle={`${measurements.length} customers`}
        actionLabel={isStaff ? undefined : 'New Measurement'}
        onAction={isStaff ? undefined : () => setFormOpen(true)}
      />

      <TextField
        size="small"
        placeholder="Search customer…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
        sx={{ mb: 2.5, maxWidth: 360, display: 'block' }}
      />

      {query.isLoading ? (
        <Grid container spacing={1.5}>
          {[1, 2, 3].map((i) => <Grid item xs={12} sm={6} md={4} key={i}><Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} /></Grid>)}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<StraightenIcon />}
          title={search ? 'No results' : 'No measurements yet'}
          description={search ? 'Try a different name or phone number' : 'Add your first customer measurement to get started'}
          actionLabel={!isStaff && !search ? 'Add Measurement' : undefined}
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <Grid container spacing={1.5}>
          {filtered.map((m) => (
            <Grid item xs={12} sm={6} md={4} key={m.id}>
              <Card sx={{ height: '100%', transition: 'box-shadow .18s', '&:hover': { boxShadow: 4 } }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: 15 }}>{m.customerName}</Typography>
                      {m.customerPhone && <Typography variant="caption" color="text.secondary">{m.customerPhone}</Typography>}
                    </Box>
                    {!isStaff && (
                      <Box sx={{ display: 'flex', gap: 0.25 }}>
                        <IconButton size="small" onClick={() => setEditItem(m)}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteId(m.id)}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                    {Object.keys(m.garments).map((g) => (
                      <Chip key={g} label={g} size="small"
                        sx={{ height: 20, fontSize: 11, borderRadius: 1.5, background: 'rgba(123,94,167,.08)', color: 'primary.main' }} />
                    ))}
                  </Box>

                  {m.notes && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}>
                      {m.notes}
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.disabled">
                    Updated {format(m.updatedAt, 'd MMM yyyy')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {!isStaff && (
        <Fab size="medium" onClick={() => setFormOpen(true)} sx={{ position: 'fixed', bottom: { xs: 84, md: 24 }, right: 24 }}>
          <AddIcon />
        </Fab>
      )}

      <MeasurementForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
        loading={createMutation.isPending}
      />

      {editItem && (
        <MeasurementForm
          open={!!editItem}
          onClose={() => setEditItem(null)}
          onSubmit={(data) => updateMutation.mutateAsync({ id: editItem.id, data })}
          loading={updateMutation.isPending}
          defaultValues={editItem}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Measurement"
        message="This customer's measurements will be moved to trash. They can be restored by the super admin."
        confirmLabel="Delete"
        onConfirm={async () => { if (deleteId) { await deleteMutation.mutateAsync(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

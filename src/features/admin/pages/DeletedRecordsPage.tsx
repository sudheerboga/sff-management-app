import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Button,
  TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestoreIcon from '@mui/icons-material/Restore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { getAllBoutiques } from '@/services/boutiques';
import { getDeletedRecords, restoreRecord, permanentlyDelete } from '@/services/softDelete';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { DeletedRecord } from '@/types';

export default function DeletedRecordsPage() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const [selectedBoutique, setSelectedBoutique] = useState('');
  const [search, setSearch] = useState('');
  const [hardDeleteRecord, setHardDeleteRecord] = useState<DeletedRecord | null>(null);

  const { data: boutiques = [] } = useQuery({ queryKey: ['admin-boutiques'], queryFn: getAllBoutiques });

  const { data: deletedRecords = [], isLoading } = useQuery({
    queryKey: ['deleted-records', selectedBoutique],
    queryFn: () => getDeletedRecords(selectedBoutique),
    enabled: !!selectedBoutique,
  });

  const restoreMutation = useMutation({
    mutationFn: (record: DeletedRecord) =>
      restoreRecord(record.boutiqueId, record.id, record.collection, record.recordId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deleted-records', selectedBoutique] });
      enqueueSnackbar('Record restored successfully', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to restore record', { variant: 'error' }),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (record: DeletedRecord) =>
      permanentlyDelete(record.boutiqueId, record.id, record.collection, record.recordId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deleted-records', selectedBoutique] });
      enqueueSnackbar('Record permanently deleted', { variant: 'info' });
      setHardDeleteRecord(null);
    },
    onError: () => enqueueSnackbar('Failed to delete record', { variant: 'error' }),
  });

  const getRecordTitle = (record: DeletedRecord) => {
    const d = record.data;
    return (d.customerName as string) || (d.name as string) || record.recordId;
  };

  const filtered = deletedRecords.filter((r) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const title = getRecordTitle(r).toLowerCase();
    return title.includes(s) || r.collection.includes(s);
  });

  const collectionColors: Record<string, { color: string; bg: string }> = {
    orders: { color: '#4A6FD4', bg: '#eef2fc' },
    measurements: { color: '#7B5EA7', bg: '#f3eff9' },
  };

  return (
    <Box>
      <PageHeader title="Trash & Recovery" subtitle="View and restore deleted records from boutiques" />

      <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
        Select a boutique to view its deleted records. You can restore records or permanently delete them.
      </Alert>

      <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Select Boutique</InputLabel>
          <Select value={selectedBoutique} label="Select Boutique" onChange={(e) => setSelectedBoutique(e.target.value)}>
            {boutiques.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
          </Select>
        </FormControl>
        {selectedBoutique && (
          <TextField
            size="small"
            placeholder="Search records…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
            sx={{ flex: 1, maxWidth: 280 }}
          />
        )}
      </Box>

      {!selectedBoutique ? (
        <EmptyState icon={<DeleteSweepIcon />} title="Select a boutique" description="Choose a boutique to view its deleted records" />
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<DeleteSweepIcon />} title="No deleted records" description="This boutique has no records in trash" />
      ) : (
        <Grid container spacing={1.5}>
          {filtered.map((record) => {
            const style = collectionColors[record.collection] || { color: '#7B5EA7', bg: '#f3eff9' };
            return (
              <Grid item xs={12} sm={6} md={4} key={record.id}>
                <Card>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>{getRecordTitle(record)}</Typography>
                      <Chip
                        label={record.collection}
                        size="small"
                        sx={{ color: style.color, background: style.bg, fontSize: 11, height: 20, textTransform: 'capitalize' }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Deleted by {record.deletedByName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                      {format(record.deletedAt, 'd MMM yyyy, h:mm a')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        startIcon={<RestoreIcon fontSize="small" />}
                        onClick={() => restoreMutation.mutate(record)}
                        disabled={restoreMutation.isPending}
                        sx={{ flex: 1, fontSize: 12 }}
                      >
                        Restore
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteForeverIcon fontSize="small" />}
                        onClick={() => setHardDeleteRecord(record)}
                        sx={{ flex: 1, fontSize: 12 }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <ConfirmDialog
        open={!!hardDeleteRecord}
        title="Permanently Delete"
        message={`This will permanently delete "${hardDeleteRecord ? getRecordTitle(hardDeleteRecord) : ''}" and cannot be undone. Are you absolutely sure?`}
        confirmLabel="Delete Forever"
        onConfirm={() => hardDeleteRecord && hardDeleteMutation.mutate(hardDeleteRecord)}
        onCancel={() => setHardDeleteRecord(null)}
        loading={hardDeleteMutation.isPending}
      />
    </Box>
  );
}

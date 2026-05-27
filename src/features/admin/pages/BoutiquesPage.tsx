import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, InputAdornment, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { getAllBoutiques, createBoutique } from '@/services/boutiques';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { BoutiqueStatusChip } from '@/components/common/StatusChip';
import CreateBoutiqueModal from '../components/CreateBoutiqueModal';

export default function BoutiquesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data: boutiques = [], isLoading } = useQuery({ queryKey: ['admin-boutiques'], queryFn: getAllBoutiques });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createBoutique>[0]) => createBoutique(data, user!.uid),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-boutiques'] }); enqueueSnackbar('Boutique created', { variant: 'success' }); },
    onError: () => enqueueSnackbar('Failed to create boutique', { variant: 'error' }),
  });

  const filtered = boutiques.filter((b) =>
    !search.trim() ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    b.ownerPhone.includes(search),
  );

  return (
    <Box>
      <PageHeader
        title="Boutiques"
        subtitle={`${boutiques.length} registered boutiques`}
        actionLabel="New Boutique"
        onAction={() => setCreateOpen(true)}
      />

      <TextField
        size="small"
        placeholder="Search boutiques…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
        sx={{ mb: 2.5, maxWidth: 360, display: 'block' }}
      />

      {isLoading || filtered.length === 0 ? (
        !isLoading && (
          <EmptyState icon={<StorefrontIcon />} title={search ? 'No boutiques found' : 'No boutiques yet'} actionLabel="Create Boutique" onAction={() => setCreateOpen(true)} />
        )
      ) : (
        <Grid container spacing={1.5}>
          {filtered.map((boutique) => (
            <Grid item xs={12} sm={6} md={4} key={boutique.id}>
              <Card
                sx={{ transition: 'box-shadow .18s', '&:hover': { boxShadow: 4 }, cursor: 'pointer' }}
                onClick={() => navigate(`/admin/boutiques/${boutique.id}`)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{boutique.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{boutique.ownerName} · {boutique.ownerPhone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BoutiqueStatusChip status={boutique.status} />
                      <ChevronRightIcon fontSize="small" color="action" sx={{ ml: 0.5 }} />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip
                      icon={<CardMembershipIcon sx={{ fontSize: '14px !important' }} />}
                      label={boutique.subscription.planName}
                      size="small"
                      color={boutique.subscription.plan !== 'free' ? 'primary' : 'default'}
                      variant={boutique.subscription.plan !== 'free' ? 'filled' : 'outlined'}
                      sx={{ height: 22, fontSize: 11 }}
                    />
                    {boutique.subscription.expiresAt && (() => {
                      const expired = boutique.subscription.expiresAt < new Date();
                      return (
                        <Chip
                          label={expired ? 'Expired' : `Exp: ${format(boutique.subscription.expiresAt, 'd MMM yyyy')}`}
                          size="small"
                          color={expired ? 'error' : 'default'}
                          variant={expired ? 'filled' : 'outlined'}
                          sx={{ height: 22, fontSize: 11 }}
                        />
                      );
                    })()}
                  </Box>

                  <Typography variant="caption" color="text.disabled">
                    Created {format(boutique.createdAt, 'd MMM yyyy')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <CreateBoutiqueModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (data) => {
          const { cloudName, uploadPreset, cloudFolder, ...rest } = data;
          await createMutation.mutateAsync({
            ...rest,
            ...(cloudName && uploadPreset ? { cloudinary: { cloudName, uploadPreset, folder: cloudFolder || '' } } : {}),
          });
          setCreateOpen(false);
        }}
        loading={createMutation.isPending}
      />
    </Box>
  );
}

import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, InputAdornment,
  IconButton, Menu, MenuItem, ListItemIcon, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { getAllBoutiques, createBoutique, updateBoutiqueStatus, updateBoutiqueSubscription } from '@/services/boutiques';
import { useAuthStore } from '@/stores/authStore';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { BoutiqueStatusChip } from '@/components/common/StatusChip';
import CreateBoutiqueModal from '../components/CreateBoutiqueModal';
import { Boutique } from '@/types';

const PLAN_OPTIONS = [
  { key: 'free', name: 'Free Plan', days: 0 },
  { key: 'basic', name: 'Basic Plan', days: 30 },
  { key: 'pro', name: 'Pro Plan', days: 30 },
  { key: 'enterprise', name: 'Enterprise Plan', days: 365 },
];

export default function BoutiquesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [menuBoutique, setMenuBoutique] = useState<Boutique | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(PLAN_OPTIONS[0]);

  const { data: boutiques = [], isLoading } = useQuery({ queryKey: ['admin-boutiques'], queryFn: getAllBoutiques });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createBoutique>[0]) =>
      createBoutique(data, user!.uid),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-boutiques'] }); enqueueSnackbar('Boutique created', { variant: 'success' }); },
    onError: () => enqueueSnackbar('Failed to create boutique', { variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Boutique['status'] }) => updateBoutiqueStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-boutiques'] }); enqueueSnackbar('Status updated', { variant: 'success' }); },
  });

  const planMutation = useMutation({
    mutationFn: async () => {
      if (!menuBoutique) return;
      const expiresAt = selectedPlan.days > 0 ? new Date(Date.now() + selectedPlan.days * 86400000) : null;
      await updateBoutiqueSubscription(menuBoutique.id, {
        plan: selectedPlan.key,
        planName: selectedPlan.name,
        expiresAt,
        features: ['orders', 'measurements', 'billing', 'reports', 'staff'],
        isActive: true,
        maxOrders: selectedPlan.key === 'enterprise' ? 99999 : selectedPlan.key === 'pro' ? 5000 : selectedPlan.key === 'basic' ? 500 : 100,
        maxStaff: selectedPlan.key === 'enterprise' ? 50 : selectedPlan.key === 'pro' ? 10 : selectedPlan.key === 'basic' ? 5 : 2,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-boutiques'] });
      enqueueSnackbar('Subscription updated', { variant: 'success' });
      setPlanDialogOpen(false);
    },
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
              <Card sx={{ transition: 'box-shadow .18s', '&:hover': { boxShadow: 4 } }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={700} noWrap>{boutique.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{boutique.ownerName} · {boutique.ownerPhone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BoutiqueStatusChip status={boutique.status} />
                      <IconButton
                        size="small"
                        onClick={(e) => { setMenuBoutique(boutique); setMenuAnchor(e.currentTarget); }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
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
                    {boutique.subscription.expiresAt && (
                      <Chip
                        label={`Exp: ${format(boutique.subscription.expiresAt, 'd MMM yyyy')}`}
                        size="small"
                        sx={{ height: 22, fontSize: 11 }}
                      />
                    )}
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

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 200 } }}
      >
        {menuBoutique?.status === 'active' ? (
          <MenuItem
            onClick={() => { statusMutation.mutate({ id: menuBoutique!.id, status: 'inactive' }); setMenuAnchor(null); }}
            dense
          >
            <ListItemIcon><BlockIcon fontSize="small" color="warning" /></ListItemIcon>
            Deactivate
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => { statusMutation.mutate({ id: menuBoutique!.id, status: 'active' }); setMenuAnchor(null); }}
            dense
          >
            <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
            Activate
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => { setMenuAnchor(null); setSelectedPlan(PLAN_OPTIONS[0]); setPlanDialogOpen(true); }}
          dense
        >
          <ListItemIcon><CardMembershipIcon fontSize="small" color="primary" /></ListItemIcon>
          Manage Subscription
        </MenuItem>
      </Menu>

      {/* Subscription dialog */}
      <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography fontFamily="'Playfair Display', serif" fontWeight={700} variant="h6">
            Assign Plan — {menuBoutique?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
            {PLAN_OPTIONS.map((plan) => (
              <Box
                key={plan.key}
                onClick={() => setSelectedPlan(plan)}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: selectedPlan.key === plan.key ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  background: selectedPlan.key === plan.key ? 'rgba(123,94,167,.06)' : 'transparent',
                  transition: 'all .15s',
                }}
              >
                <Typography fontWeight={700} sx={{ fontSize: 14 }}>{plan.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {plan.days === 0 ? 'No expiry' : `${plan.days} days validity`}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setPlanDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={() => planMutation.mutate()} variant="contained" size="small" disabled={planMutation.isPending}>
            Assign Plan
          </Button>
        </DialogActions>
      </Dialog>

      <CreateBoutiqueModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (data) => { await createMutation.mutateAsync(data); setCreateOpen(false); }}
        loading={createMutation.isPending}
      />
    </Box>
  );
}

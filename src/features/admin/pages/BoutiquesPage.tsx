import { useState, ChangeEvent } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, InputAdornment,
  IconButton, Menu, MenuItem, ListItemIcon, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import CloudIcon from '@mui/icons-material/Cloud';
import TuneIcon from '@mui/icons-material/Tune';
import BrushIcon from '@mui/icons-material/Brush';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { getAllBoutiques, createBoutique, updateBoutique, updateBoutiqueStatus, updateBoutiqueSubscription, updateBoutiqueFeatures, updateBoutiqueBranding } from '@/services/boutiques';
import { uploadToCloudinary } from '@/utils/cloudinary';
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
  const [cloudDialogOpen, setCloudDialogOpen] = useState(false);
  const [cloudName, setCloudName] = useState('');
  const [uploadPreset, setUploadPreset] = useState('');
  const [cloudFolder, setCloudFolder] = useState('');
  const [featuresDialogOpen, setFeaturesDialogOpen] = useState(false);
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [brandingDialogOpen, setBrandingDialogOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#7B5EA7');
  const [secondaryColor, setSecondaryColor] = useState('#7B5EA7');
  const [accentColor, setAccentColor] = useState('#7B5EA7');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);

  const { data: boutiques = [], isLoading } = useQuery({ queryKey: ['admin-boutiques'], queryFn: getAllBoutiques });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof createBoutique>[0]) =>
      createBoutique(data, user!.uid),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-boutiques'] }); enqueueSnackbar('Boutique created', { variant: 'success' }); },
    onError: () => enqueueSnackbar('Failed to create boutique', { variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Boutique['status'] }) => updateBoutiqueStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin-boutiques'] });
      qc.invalidateQueries({ queryKey: ['boutique', id] });
      enqueueSnackbar('Status updated', { variant: 'success' });
    },
  });

  const cloudMutation = useMutation({
    mutationFn: async () => {
      if (!menuBoutique || !cloudName || !uploadPreset) return;
      await updateBoutique(menuBoutique.id, {
        cloudinary: { cloudName, uploadPreset, folder: cloudFolder },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-boutiques'] });
      qc.invalidateQueries({ queryKey: ['boutique', menuBoutique?.id] });
      enqueueSnackbar('Cloudinary settings saved', { variant: 'success' });
      setCloudDialogOpen(false);
    },
    onError: () => enqueueSnackbar('Failed to save Cloudinary settings', { variant: 'error' }),
  });

  const planMutation = useMutation({
    mutationFn: async () => {
      if (!menuBoutique) return;
      const expiresAt = selectedPlan.days > 0 ? new Date(Date.now() + selectedPlan.days * 86400000) : null;
      await updateBoutiqueSubscription(menuBoutique.id, {
        plan: selectedPlan.key,
        planName: selectedPlan.name,
        expiresAt,
        features: ['orders', 'measurements', 'reports', 'staff'],
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

  const expirePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const yesterday = new Date(Date.now() - 86400000);
      await updateBoutiqueSubscription(id, {
        ...boutiques.find((b) => b.id === id)!.subscription,
        expiresAt: yesterday,
        isActive: false,
      });
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin-boutiques'] });
      qc.invalidateQueries({ queryKey: ['boutique', id] });
      enqueueSnackbar('Plan expired', { variant: 'warning' });
    },
    onError: () => enqueueSnackbar('Failed to expire plan', { variant: 'error' }),
  });

  const renewPlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const b = boutiques.find((bb) => bb.id === id)!;
      const days = PLAN_OPTIONS.find((p) => p.key === b.subscription.plan)?.days ?? 30;
      const expiresAt = days > 0 ? new Date(Date.now() + days * 86400000) : null;
      await updateBoutiqueSubscription(id, { ...b.subscription, expiresAt, isActive: true });
    },
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin-boutiques'] });
      qc.invalidateQueries({ queryKey: ['boutique', id] });
      enqueueSnackbar('Plan renewed', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to renew plan', { variant: 'error' }),
  });

  const featuresMutation = useMutation({
    mutationFn: async () => {
      if (!menuBoutique) return;
      await updateBoutiqueFeatures(menuBoutique.id, editFeatures);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-boutiques'] });
      qc.invalidateQueries({ queryKey: ['boutique', menuBoutique?.id] });
      enqueueSnackbar('Features updated', { variant: 'success' });
      setFeaturesDialogOpen(false);
    },
    onError: () => enqueueSnackbar('Failed to update features', { variant: 'error' }),
  });

  const brandingMutation = useMutation({
    mutationFn: () => updateBoutiqueBranding(menuBoutique!.id, { primaryColor, secondaryColor, accentColor, logoUrl: logoUrl || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-boutiques'] });
      qc.invalidateQueries({ queryKey: ['boutique', menuBoutique?.id] });
      enqueueSnackbar('Branding saved', { variant: 'success' });
      setBrandingDialogOpen(false);
    },
    onError: () => enqueueSnackbar('Failed to save branding', { variant: 'error' }),
  });

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !menuBoutique?.cloudinary) return;
    setLogoUploading(true);
    try {
      const result = await uploadToCloudinary(file, { ...menuBoutique.cloudinary, folder: `${menuBoutique.cloudinary.folder || menuBoutique.id}/branding` });
      setLogoUrl(result.url);
    } catch {
      enqueueSnackbar('Logo upload failed', { variant: 'error' });
    } finally {
      setLogoUploading(false);
    }
  };

  const ALL_FEATURES = ['orders', 'measurements', 'reports', 'staff'];

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
        {menuBoutique?.subscription.expiresAt && menuBoutique.subscription.expiresAt < new Date() ? (
          <MenuItem
            onClick={() => { renewPlanMutation.mutate(menuBoutique!.id); setMenuAnchor(null); }}
            dense
            disabled={renewPlanMutation.isPending}
          >
            <ListItemIcon><RefreshIcon fontSize="small" color="success" /></ListItemIcon>
            Renew Plan
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() => { expirePlanMutation.mutate(menuBoutique!.id); setMenuAnchor(null); }}
            dense
            disabled={expirePlanMutation.isPending || menuBoutique?.subscription.plan === 'free'}
          >
            <ListItemIcon><EventBusyIcon fontSize="small" color="warning" /></ListItemIcon>
            Expire Plan
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setCloudName(menuBoutique?.cloudinary?.cloudName || '');
            setUploadPreset(menuBoutique?.cloudinary?.uploadPreset || '');
            setCloudFolder(menuBoutique?.cloudinary?.folder || '');
            setCloudDialogOpen(true);
          }}
          dense
        >
          <ListItemIcon><CloudIcon fontSize="small" color="action" /></ListItemIcon>
          Cloudinary Settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setEditFeatures(menuBoutique?.subscription.features || []);
            setFeaturesDialogOpen(true);
          }}
          dense
        >
          <ListItemIcon><TuneIcon fontSize="small" color="action" /></ListItemIcon>
          Feature Settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setPrimaryColor(menuBoutique?.branding?.primaryColor || '#7B5EA7');
            setSecondaryColor(menuBoutique?.branding?.secondaryColor || '#7B5EA7');
            setAccentColor(menuBoutique?.branding?.accentColor || '#7B5EA7');
            setLogoUrl(menuBoutique?.branding?.logoUrl || '');
            setBrandingDialogOpen(true);
          }}
          dense
        >
          <ListItemIcon><BrushIcon fontSize="small" color="action" /></ListItemIcon>
          Branding &amp; Logo
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

      {/* Cloudinary settings dialog */}
      <Dialog open={cloudDialogOpen} onClose={() => setCloudDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography fontFamily="'Playfair Display', serif" fontWeight={700} variant="h6">
            Cloudinary Settings — {menuBoutique?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Cloud Name" value={cloudName} onChange={(e) => setCloudName(e.target.value)} fullWidth size="small" required />
            <TextField label="Upload Preset" value={uploadPreset} onChange={(e) => setUploadPreset(e.target.value)} fullWidth size="small" required />
            <TextField label="Folder (optional)" value={cloudFolder} onChange={(e) => setCloudFolder(e.target.value)} fullWidth size="small" helperText="Leave blank to auto-generate from boutique ID" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setCloudDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={() => cloudMutation.mutate()} variant="contained" size="small" disabled={cloudMutation.isPending || !cloudName || !uploadPreset}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Branding dialog */}
      <Dialog open={brandingDialogOpen} onClose={() => setBrandingDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography fontFamily="'Playfair Display', serif" fontWeight={700} variant="h6">
            Branding &amp; Logo — {menuBoutique?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {/* Gradient preview */}
            <Box sx={{
              height: 48, borderRadius: 2,
              background: `linear-gradient(135deg, ${accentColor} 0%, ${primaryColor} 40%, ${secondaryColor} 100%)`,
            }} />

            {/* Color pickers */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { label: 'Primary', value: primaryColor, onChange: setPrimaryColor },
                { label: 'Secondary', value: secondaryColor, onChange: setSecondaryColor },
                { label: 'Accent', value: accentColor, onChange: setAccentColor },
              ].map(({ label, value, onChange }) => (
                <Box key={label} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Box
                    component="label"
                    sx={{
                      width: 52, height: 52, borderRadius: 2, bgcolor: value,
                      cursor: 'pointer', border: '3px solid', borderColor: 'divider',
                      boxShadow: 2, position: 'relative', overflow: 'hidden',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <Box
                      component="input"
                      type="color"
                      value={value}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                      sx={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                    />
                  </Box>
                  <Typography sx={{ fontSize: 10, fontFamily: 'monospace', color: 'text.secondary' }}>{value}</Typography>
                </Box>
              ))}
            </Box>

            {/* Logo */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Logo</Typography>
              {logoUrl && (
                <Box sx={{ mb: 1, p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'inline-flex' }}>
                  <Box component="img" src={logoUrl} alt="logo" sx={{ height: 40, maxWidth: 160, objectFit: 'contain' }} />
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {menuBoutique?.cloudinary ? (
                  <Button component="label" variant="outlined" size="small" disabled={logoUploading}>
                    {logoUploading ? <CircularProgress size={14} sx={{ mr: 0.5 }} /> : null}
                    {logoUrl ? 'Replace Logo' : 'Upload Logo'}
                    <input type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                  </Button>
                ) : (
                  <TextField
                    label="Logo URL"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="https://..."
                    helperText="Configure Cloudinary to enable file upload"
                  />
                )}
                {logoUrl && (
                  <Button size="small" color="error" onClick={() => setLogoUrl('')}>Remove</Button>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setBrandingDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={() => brandingMutation.mutate()} variant="contained" size="small" disabled={brandingMutation.isPending}>
            Save Branding
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feature settings dialog */}
      <Dialog open={featuresDialogOpen} onClose={() => setFeaturesDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Typography fontFamily="'Playfair Display', serif" fontWeight={700} variant="h6">
            Feature Settings — {menuBoutique?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            {ALL_FEATURES.map((feature) => {
              const enabled = editFeatures.includes(feature);
              return (
                <Box
                  key={feature}
                  onClick={() =>
                    setEditFeatures((prev) =>
                      enabled ? prev.filter((f) => f !== feature) : [...prev, feature],
                    )
                  }
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 2,
                    border: '1.5px solid',
                    borderColor: enabled ? 'primary.main' : 'divider',
                    cursor: 'pointer',
                    background: enabled ? 'rgba(123,94,167,.06)' : 'transparent',
                    transition: 'all .15s',
                  }}
                >
                  <Typography sx={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>
                    {feature}
                  </Typography>
                  <Chip
                    label={enabled ? 'Enabled' : 'Disabled'}
                    size="small"
                    color={enabled ? 'success' : 'default'}
                    variant={enabled ? 'filled' : 'outlined'}
                    sx={{ height: 22, fontSize: 11, pointerEvents: 'none' }}
                  />
                </Box>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setFeaturesDialogOpen(false)} variant="outlined" size="small">Cancel</Button>
          <Button onClick={() => featuresMutation.mutate()} variant="contained" size="small" disabled={featuresMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

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

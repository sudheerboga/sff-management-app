import { useState, ChangeEvent, useEffect } from 'react';
import { Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import {
  getBoutique,
  updateBoutique,
  updateBoutiqueStatus,
  updateBoutiqueSubscription,
  updateBoutiqueFeatures,
  updateBoutiqueBranding,
} from '@/services/boutiques';
import { addSubscriptionPayment, getPaymentsForBoutique } from '@/services/subscriptionPayments';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { BoutiqueStatusChip } from '@/components/common/StatusChip';
import { useAuthStore } from '@/stores/authStore';
import { Boutique } from '@/types';

const PLAN_OPTIONS = [
  { key: 'free',       name: 'Free Plan',       days: 30,  defaultPrice: 0    },
  { key: 'basic',      name: 'Basic Plan',       days: 30,  defaultPrice: 499  },
  { key: 'enterprise', name: 'Enterprise Plan',  days: 365, defaultPrice: 5988 },
];

const DURATION_OPTIONS = [
  { label: '1 Month',  days: 30  },
  { label: '2 Months', days: 60  },
  { label: '3 Months', days: 90  },
  { label: '6 Months', days: 180 },
  { label: '1 Year',   days: 365 },
  { label: 'Custom',   days: 0   },
];

const ALL_FEATURES = ['orders', 'measurements', 'reports', 'staff'];

const BTN_PRIMARY: React.CSSProperties = {
  padding: '10px 22px', borderRadius: 8, border: 'none',
  background: 'linear-gradient(135deg, #4A6FD4, #7B5EA7)',
  color: '#fff', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'opacity .15s',
};

const SEC: React.CSSProperties = {
  background: '#fff', borderRadius: 16,
  border: '1px solid #ede9f0', padding: '20px 22px', marginBottom: 16,
};

const SEC_TITLE: React.CSSProperties = {
  fontSize: 13, fontWeight: 700,
  fontFamily: "'Playfair Display', serif",
  color: '#2d1e4a', marginBottom: 16, letterSpacing: '.01em',
};

const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#888',
  textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5, display: 'block',
};

const INPUT: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 12px', border: '1.5px solid #e0d9f0',
  borderRadius: 8, fontSize: 14, outline: 'none',
  fontFamily: 'inherit', color: '#1a1230', background: '#faf8fd',
};

export default function BoutiqueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const qc        = useQueryClient();
  const user      = useAuthStore((s) => s.user);

  const { data: boutique, isLoading } = useQuery({
    queryKey: ['boutique-admin', id],
    queryFn: () => getBoutique(id!),
    enabled: !!id,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['boutique-payments', id],
    queryFn: () => getPaymentsForBoutique(id!),
    enabled: !!id,
  });

  // Subscription form state
  const [selectedPlan,      setSelectedPlan]      = useState(PLAN_OPTIONS[1]); // default Basic
  const [selectedDuration,  setSelectedDuration]  = useState(DURATION_OPTIONS[0]); // 1 Month
  const [customDays,        setCustomDays]        = useState('');
  const [paymentAmount,     setPaymentAmount]     = useState(String(PLAN_OPTIONS[1].defaultPrice));
  const [paymentNotes,      setPaymentNotes]      = useState('');

  // Cloudinary state
  const [cloudName,    setCloudName]    = useState('');
  const [uploadPreset, setUploadPreset] = useState('');
  const [cloudFolder,  setCloudFolder]  = useState('');

  // Features state
  const [editFeatures, setEditFeatures] = useState<string[]>(ALL_FEATURES);

  // Branding state
  const [primaryColor,   setPrimaryColor]   = useState('#7B5EA7');
  const [secondaryColor, setSecondaryColor] = useState('#7B5EA7');
  const [accentColor,    setAccentColor]    = useState('#7B5EA7');
  const [logoUrl,        setLogoUrl]        = useState('');
  const [logoUploading,  setLogoUploading]  = useState(false);

  useEffect(() => {
    if (!boutique) return;
    const plan = PLAN_OPTIONS.find((p) => p.key === boutique.subscription.plan) || PLAN_OPTIONS[1];
    setSelectedPlan(plan);
    setPaymentAmount(String(plan.defaultPrice));
    const defaultDur = plan.key === 'enterprise' ? DURATION_OPTIONS[4] : DURATION_OPTIONS[0];
    setSelectedDuration(defaultDur);
    setCustomDays('');
    setCloudName(boutique.cloudinary?.cloudName || '');
    setUploadPreset(boutique.cloudinary?.uploadPreset || '');
    setCloudFolder(boutique.cloudinary?.folder || '');
    setEditFeatures(boutique.subscription.features?.length ? boutique.subscription.features : ALL_FEATURES);
    setPrimaryColor(boutique.branding?.primaryColor || '#7B5EA7');
    setSecondaryColor(boutique.branding?.secondaryColor || '#7B5EA7');
    setAccentColor(boutique.branding?.accentColor || '#7B5EA7');
    setLogoUrl(boutique.branding?.logoUrl || '');
  }, [boutique?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset price + duration defaults when plan changes
  useEffect(() => {
    setPaymentAmount(String(selectedPlan.defaultPrice));
    const defaultDur = selectedPlan.key === 'enterprise' ? DURATION_OPTIONS[4] : DURATION_OPTIONS[0];
    setSelectedDuration(defaultDur);
    setCustomDays('');
  }, [selectedPlan.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['boutique-admin', id] });
    qc.invalidateQueries({ queryKey: ['admin-boutiques'] });
    qc.invalidateQueries({ queryKey: ['boutique', id] });
    qc.invalidateQueries({ queryKey: ['boutique-payments', id] });
    qc.invalidateQueries({ queryKey: ['all-subscription-payments'] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: Boutique['status']) => updateBoutiqueStatus(id!, status),
    onSuccess: () => { invalidate(); enqueueSnackbar('Status updated', { variant: 'success' }); },
    onError: () => enqueueSnackbar('Failed to update status', { variant: 'error' }),
  });

  const planMutation = useMutation({
    mutationFn: async () => {
      if (!boutique) return;
      const durationDays = selectedDuration.days > 0
        ? selectedDuration.days
        : (parseInt(customDays) || 30);
      const validFrom  = new Date();
      const expiresAt  = new Date(Date.now() + durationDays * 86400000);
      await updateBoutiqueSubscription(id!, {
        plan: selectedPlan.key, planName: selectedPlan.name,
        expiresAt, features: ALL_FEATURES,
        isActive: true, maxOrders: 99999, maxStaff: 50,
      });
      const amount = selectedPlan.key === 'free' ? 0 : (parseFloat(paymentAmount) || 0);
      if (amount > 0) {
        await addSubscriptionPayment({
          boutiqueId:   id!,
          boutiqueName: boutique.name,
          plan:         selectedPlan.key,
          planName:     selectedPlan.name,
          amount,
          paidAt:       validFrom,
          validFrom,
          expiresAt,
          recordedBy:   user?.name || 'Admin',
          notes:        paymentNotes.trim() || undefined,
        });
      }
    },
    onSuccess: () => {
      invalidate();
      setPaymentNotes('');
      enqueueSnackbar('Plan assigned & payment recorded', { variant: 'success' });
    },
    onError: () => enqueueSnackbar('Failed to assign plan', { variant: 'error' }),
  });

  const expireMutation = useMutation({
    mutationFn: async () => {
      if (!boutique) return;
      await updateBoutiqueSubscription(id!, {
        ...boutique.subscription,
        expiresAt: new Date(Date.now() - 86400000),
        isActive: false,
      });
    },
    onSuccess: () => { invalidate(); enqueueSnackbar('Plan expired', { variant: 'warning' }); },
    onError: () => enqueueSnackbar('Failed to expire plan', { variant: 'error' }),
  });

  const renewMutation = useMutation({
    mutationFn: async () => {
      if (!boutique) return;
      const plan = PLAN_OPTIONS.find((p) => p.key === boutique.subscription.plan);
      const days = plan?.days ?? 30;
      await updateBoutiqueSubscription(id!, {
        ...boutique.subscription,
        expiresAt: new Date(Date.now() + days * 86400000),
        isActive: true,
      });
    },
    onSuccess: () => { invalidate(); enqueueSnackbar('Plan renewed', { variant: 'success' }); },
    onError: () => enqueueSnackbar('Failed to renew plan', { variant: 'error' }),
  });

  const cloudMutation = useMutation({
    mutationFn: () => updateBoutique(id!, { cloudinary: { cloudName, uploadPreset, folder: cloudFolder } }),
    onSuccess: () => { invalidate(); enqueueSnackbar('Cloudinary settings saved', { variant: 'success' }); },
    onError: () => enqueueSnackbar('Failed to save Cloudinary settings', { variant: 'error' }),
  });

  const featuresMutation = useMutation({
    mutationFn: () => updateBoutiqueFeatures(id!, editFeatures),
    onSuccess: () => { invalidate(); enqueueSnackbar('Features updated', { variant: 'success' }); },
    onError: () => enqueueSnackbar('Failed to update features', { variant: 'error' }),
  });

  const brandingMutation = useMutation({
    mutationFn: () => updateBoutiqueBranding(id!, { primaryColor, secondaryColor, accentColor, logoUrl: logoUrl || undefined }),
    onSuccess: () => { invalidate(); enqueueSnackbar('Branding saved', { variant: 'success' }); },
    onError: () => enqueueSnackbar('Failed to save branding', { variant: 'error' }),
  });

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !boutique?.cloudinary) return;
    setLogoUploading(true);
    try {
      const result = await uploadToCloudinary(file, {
        ...boutique.cloudinary,
        folder: `${boutique.cloudinary.folder || boutique.id}/branding`,
      });
      setLogoUrl(result.url);
    } catch {
      enqueueSnackbar('Logo upload failed', { variant: 'error' });
    } finally {
      setLogoUploading(false);
    }
  };

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>;
  }
  if (!boutique) {
    return (
      <Box sx={{ pt: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/boutiques')}>Boutiques</Button>
        <Typography sx={{ mt: 2 }} color="text.secondary">Boutique not found.</Typography>
      </Box>
    );
  }

  const isExpired = boutique.subscription.expiresAt ? boutique.subscription.expiresAt < new Date() : false;
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Back nav */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin/boutiques')}
        sx={{ mb: 2.5, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
      >
        All Boutiques
      </Button>

      {/* Boutique header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
          <Typography variant="h5" fontFamily="'Playfair Display', serif" fontWeight={700}>
            {boutique.name}
          </Typography>
          <BoutiqueStatusChip status={boutique.status} />
          {boutique.subscription.expiresAt && (
            <Chip
              label={isExpired ? 'Plan Expired' : `Exp: ${format(boutique.subscription.expiresAt, 'd MMM yyyy')}`}
              size="small" color={isExpired ? 'error' : 'default'}
              variant={isExpired ? 'filled' : 'outlined'} sx={{ height: 22, fontSize: 11 }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {boutique.ownerName} · {boutique.ownerPhone}
          {boutique.ownerEmail && ` · ${boutique.ownerEmail}`}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Created {format(boutique.createdAt, 'd MMM yyyy')}
        </Typography>
      </Box>

      {/* ── Account Status ── */}
      <div style={SEC}>
        <div style={SEC_TITLE}>Account Status</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {([
            { value: 'active',   label: 'Active',   color: '#2e7d32', bg: 'rgba(46,125,50,.1)',  Icon: CheckCircleIcon },
            { value: 'inactive', label: 'Inactive', color: '#e65100', bg: 'rgba(230,81,0,.1)',   Icon: BlockIcon       },
          ] as const).map(({ value, label, color, bg, Icon }) => {
            const isCurrent = boutique.status === value;
            return (
              <button key={value}
                disabled={statusMutation.isPending || isCurrent}
                onClick={() => statusMutation.mutate(value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 8,
                  border: `2px solid ${isCurrent ? color : '#e0d9f0'}`,
                  background: isCurrent ? bg : 'transparent',
                  color: isCurrent ? color : '#888',
                  fontSize: 13, fontWeight: isCurrent ? 700 : 500,
                  cursor: isCurrent ? 'default' : 'pointer',
                  fontFamily: 'inherit', transition: 'all .15s',
                  opacity: statusMutation.isPending && !isCurrent ? 0.5 : 1,
                }}>
                <Icon sx={{ fontSize: 16 }} style={{ color: isCurrent ? color : '#aaa' }} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Subscription ── */}
      <div style={SEC}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={SEC_TITLE}>Subscription</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isExpired ? (
              <button disabled={renewMutation.isPending} onClick={() => renewMutation.mutate()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #2e7d32', background: 'rgba(46,125,50,.08)', color: '#2e7d32', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                <RefreshIcon sx={{ fontSize: 14 }} />
                {renewMutation.isPending ? 'Renewing…' : 'Renew Plan'}
              </button>
            ) : (
              <button disabled={expireMutation.isPending} onClick={() => expireMutation.mutate()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e65100', background: 'rgba(230,81,0,.07)', color: '#e65100', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                <EventBusyIcon sx={{ fontSize: 14 }} />
                {expireMutation.isPending ? 'Expiring…' : 'Expire Now'}
              </button>
            )}
          </div>
        </div>

        {/* Current plan status */}
        {boutique.subscription.expiresAt && (
          <div style={{
            marginBottom: 16, padding: '10px 14px', borderRadius: 10,
            background: isExpired ? 'rgba(211,47,47,.06)' : 'rgba(46,125,50,.06)',
            border: `1.5px solid ${isExpired ? 'rgba(211,47,47,.25)' : 'rgba(46,125,50,.25)'}`,
            fontSize: 13, fontWeight: 600, color: isExpired ? '#c62828' : '#2e7d32',
          }}>
            {boutique.subscription.planName} ·{' '}
            {isExpired
              ? `Expired ${format(boutique.subscription.expiresAt, 'd MMM yyyy')}`
              : `Valid until ${format(boutique.subscription.expiresAt, 'd MMM yyyy')}`}
          </div>
        )}

        {/* Plan selector */}
        <div style={{ ...LABEL, marginBottom: 10 }}>Assign New Plan</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {PLAN_OPTIONS.map((plan) => (
            <div key={plan.key}
              onClick={() => setSelectedPlan(plan)}
              style={{
                padding: '12px 16px', borderRadius: 10,
                border: `2px solid ${selectedPlan.key === plan.key ? '#7B5EA7' : '#e0d9f0'}`,
                cursor: 'pointer',
                background: selectedPlan.key === plan.key ? 'rgba(123,94,167,.06)' : 'transparent',
                transition: 'all .15s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1230' }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>All features included</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: plan.defaultPrice === 0 ? '#2e7d32' : '#7B5EA7' }}>
                {plan.defaultPrice === 0 ? 'Free' : `₹${plan.defaultPrice.toLocaleString('en-IN')}`}
              </div>
            </div>
          ))}
        </div>

        {/* Duration selector */}
        <div style={{ marginBottom: 16 }}>
          <span style={LABEL}>Duration</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {DURATION_OPTIONS.map((d) => (
              <button key={d.label}
                onClick={() => setSelectedDuration(d)}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${selectedDuration.label === d.label ? '#7B5EA7' : '#e0d9f0'}`,
                  background: selectedDuration.label === d.label ? 'rgba(123,94,167,.08)' : 'transparent',
                  color: selectedDuration.label === d.label ? '#7B5EA7' : '#888',
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                }}>
                {d.label}
              </button>
            ))}
          </div>
          {selectedDuration.days === 0 && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number" min="1" max="3650"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="Enter number of days"
                style={{ ...INPUT, width: 220, boxSizing: 'border-box' }}
              />
              <span style={{ fontSize: 12, color: '#aaa' }}>days</span>
            </div>
          )}
        </div>

        {/* Payment — hidden for free plan */}
        {selectedPlan.key === 'free' ? (
          <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(46,125,50,.06)', border: '1.5px solid rgba(46,125,50,.2)', marginBottom: 14, fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>
            Free plan — no payment required
          </div>
        ) : (
          <div style={{ background: '#faf8fd', border: '1.5px solid #e0d9f0', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7B5EA7', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
              Payment for this assignment
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <span style={LABEL}>Amount (₹)</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e0d9f0', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
                  <span style={{ padding: '0 6px 0 12px', fontWeight: 700, color: '#aaa', fontSize: 14 }}>₹</span>
                  <input
                    type="number" min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    style={{ width: 0, flex: 1, padding: '10px 10px 10px 2px', border: 'none', outline: 'none', fontSize: 15, fontFamily: 'inherit', fontWeight: 700, color: '#1a1230', background: 'transparent' }}
                  />
                </div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>Leave 0 to skip recording a payment</div>
              </div>
              <div>
                <span style={LABEL}>Notes (optional)</span>
                <input
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Paid via UPI"
                  style={{ ...INPUT, padding: '10px 12px' }}
                />
              </div>
            </div>
          </div>
        )}

        <button
          disabled={planMutation.isPending || (selectedDuration.days === 0 && !customDays)}
          onClick={() => planMutation.mutate()}
          style={{ ...BTN_PRIMARY, opacity: (planMutation.isPending || (selectedDuration.days === 0 && !customDays)) ? 0.7 : 1, cursor: (planMutation.isPending || (selectedDuration.days === 0 && !customDays)) ? 'not-allowed' : 'pointer' }}>
          {planMutation.isPending ? 'Assigning…' : `Assign ${selectedPlan.name}`}
        </button>
      </div>

      {/* ── Payment History ── */}
      <div style={SEC}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={SEC_TITLE}>Payment History</div>
          {payments.length > 0 && (
            <div style={{ fontSize: 13, fontWeight: 700, color: '#2e7d32', background: 'rgba(46,125,50,.08)', border: '1px solid rgba(46,125,50,.2)', padding: '5px 14px', borderRadius: 20 }}>
              Total ₹{totalPaid.toLocaleString('en-IN')}
            </div>
          )}
        </div>

        {paymentsLoading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#aaa', fontSize: 13 }}>Loading…</div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#bbb', fontSize: 13, fontStyle: 'italic' }}>
            No payments recorded yet. Assign a plan above to track payments.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {payments.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Timeline dot + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7B5EA7', border: '2px solid rgba(123,94,167,.25)', flexShrink: 0 }} />
                  {i < payments.length - 1 && (
                    <div style={{ width: 2, height: 48, background: '#ede9f0', borderRadius: 1, marginTop: 3 }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, paddingBottom: i < payments.length - 1 ? 16 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#2e7d32', fontFamily: 'inherit' }}>
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(123,94,167,.1)', color: '#7B5EA7' }}>
                        {p.planName}
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{format(p.paidAt, 'd MMM yyyy')}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>
                    Valid {format(p.validFrom, 'd MMM yyyy')} → {format(p.expiresAt, 'd MMM yyyy')}
                    {p.notes && <span style={{ marginLeft: 8, color: '#888', fontStyle: 'italic' }}>· {p.notes}</span>}
                  </div>
                  <div style={{ fontSize: 10, color: '#ccc', marginTop: 2 }}>Recorded by {p.recordedBy}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Cloudinary Settings ── */}
      <div style={SEC}>
        <div style={SEC_TITLE}>Cloudinary Settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Cloud Name *',       value: cloudName,    onChange: setCloudName,    placeholder: 'your-cloud-name'  },
            { label: 'Upload Preset *',    value: uploadPreset, onChange: setUploadPreset, placeholder: 'unsigned_preset'  },
            { label: 'Folder (optional)',   value: cloudFolder,  onChange: setCloudFolder,  placeholder: 'boutique-images'  },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label}>
              <span style={LABEL}>{label}</span>
              <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={INPUT} />
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#aaa', marginTop: -8 }}>Leave folder blank to auto-generate from boutique ID</div>
        </div>
        <button
          disabled={cloudMutation.isPending || !cloudName || !uploadPreset}
          onClick={() => cloudMutation.mutate()}
          style={{ ...BTN_PRIMARY, opacity: (cloudMutation.isPending || !cloudName || !uploadPreset) ? 0.5 : 1, cursor: (cloudMutation.isPending || !cloudName || !uploadPreset) ? 'not-allowed' : 'pointer' }}>
          {cloudMutation.isPending ? 'Saving…' : 'Save Cloudinary'}
        </button>
      </div>

      {/* ── Feature Settings ── */}
      <div style={SEC}>
        <div style={SEC_TITLE}>Feature Settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {ALL_FEATURES.map((feature) => {
            const enabled = editFeatures.includes(feature);
            return (
              <div key={feature}
                onClick={() => setEditFeatures((prev) => enabled ? prev.filter((f) => f !== feature) : [...prev, feature])}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 10,
                  border: `1.5px solid ${enabled ? '#7B5EA7' : '#e0d9f0'}`,
                  cursor: 'pointer',
                  background: enabled ? 'rgba(123,94,167,.06)' : 'transparent',
                  transition: 'all .15s',
                }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1230', textTransform: 'capitalize' }}>{feature}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: enabled ? 'rgba(46,125,50,.1)' : '#f0f0f0',
                  color: enabled ? '#2e7d32' : '#888',
                  border: `1px solid ${enabled ? 'rgba(46,125,50,.25)' : '#e0e0e0'}`,
                }}>
                  {enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            );
          })}
        </div>
        <button
          disabled={featuresMutation.isPending}
          onClick={() => featuresMutation.mutate()}
          style={{ ...BTN_PRIMARY, opacity: featuresMutation.isPending ? 0.7 : 1, cursor: featuresMutation.isPending ? 'not-allowed' : 'pointer' }}>
          {featuresMutation.isPending ? 'Saving…' : 'Save Features'}
        </button>
      </div>

      {/* ── Branding & Logo ── */}
      <div style={SEC}>
        <div style={SEC_TITLE}>Branding & Logo</div>

        <div style={{ height: 48, borderRadius: 10, marginBottom: 20, background: `linear-gradient(135deg, ${accentColor} 0%, ${primaryColor} 40%, ${secondaryColor} 100%)` }} />

        <div style={{ display: 'flex', gap: 16, marginBottom: 20, justifyContent: 'center' }}>
          {([
            { label: 'Primary',   value: primaryColor,   onChange: setPrimaryColor   },
            { label: 'Secondary', value: secondaryColor, onChange: setSecondaryColor },
            { label: 'Accent',    value: accentColor,    onChange: setAccentColor    },
          ]).map(({ label, value, onChange }) => (
            <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</span>
              <label style={{ width: 52, height: 52, borderRadius: 10, background: value, cursor: 'pointer', border: '3px solid #e0d9f0', boxShadow: '0 2px 8px rgba(0,0,0,.1)', position: 'relative', overflow: 'hidden', display: 'block' }}>
                <input
                  type="color" value={value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                />
              </label>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#aaa' }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={LABEL}>Logo</span>
          {logoUrl && (
            <div style={{ marginBottom: 10, padding: 8, borderRadius: 8, border: '1px solid #e0d9f0', display: 'inline-flex' }}>
              <img src={logoUrl} alt="logo" style={{ height: 40, maxWidth: 160, objectFit: 'contain' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {boutique.cloudinary ? (
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e0d9f0', background: 'transparent', color: '#7B5EA7', fontSize: 12, fontWeight: 700, cursor: logoUploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {logoUploading && <CircularProgress size={12} sx={{ mr: 0.5 }} />}
                {logoUrl ? 'Replace Logo' : 'Upload Logo'}
                <input type="file" accept="image/*" hidden onChange={handleLogoUpload} disabled={logoUploading} />
              </label>
            ) : (
              <div style={{ flex: 1 }}>
                <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" style={INPUT} />
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>Configure Cloudinary above to enable file upload</div>
              </div>
            )}
            {logoUrl && (
              <button onClick={() => setLogoUrl('')}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid rgba(211,47,47,.4)', background: 'rgba(211,47,47,.06)', color: '#c62828', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Remove
              </button>
            )}
          </div>
        </div>

        <button
          disabled={brandingMutation.isPending}
          onClick={() => brandingMutation.mutate()}
          style={{ ...BTN_PRIMARY, opacity: brandingMutation.isPending ? 0.7 : 1, cursor: brandingMutation.isPending ? 'not-allowed' : 'pointer' }}>
          {brandingMutation.isPending ? 'Saving…' : 'Save Branding'}
        </button>
      </div>
    </Box>
  );
}

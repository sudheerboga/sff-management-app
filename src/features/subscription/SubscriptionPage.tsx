import { Box, Card, CardContent, Typography, Chip, LinearProgress, Grid, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { format, differenceInDays, isPast } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getBoutique } from '@/services/boutiques';
import PageHeader from '@/components/common/PageHeader';

export default function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);
  const boutiqueId = user?.boutiqueId || '';

  const { data: boutique, isLoading } = useQuery({
    queryKey: ['boutique', boutiqueId],
    queryFn: () => getBoutique(boutiqueId),
    enabled: !!boutiqueId,
  });

  const sub = boutique?.subscription;
  const expiresAt = sub?.expiresAt;
  const daysLeft = expiresAt ? differenceInDays(expiresAt, new Date()) : null;
  const isExpired = expiresAt ? isPast(expiresAt) : false;

  return (
    <Box>
      <PageHeader title="Subscription" subtitle="Your current plan & features" />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: (t) => t.palette.brand.gradient,
              color: '#fff',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box sx={{
              position: 'absolute', top: -40, right: -40, width: 160, height: 160,
              borderRadius: '50%', background: 'rgba(255,255,255,.08)',
            }} />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <CardMembershipIcon sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" fontFamily="'Playfair Display', serif" fontWeight={700}>
                    {isLoading ? '...' : sub?.planName || 'Free Plan'}
                  </Typography>
                  <Chip
                    label={isExpired ? 'Expired' : sub?.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      background: isExpired ? 'rgba(220,38,38,.3)' : 'rgba(255,255,255,.2)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 11,
                      height: 22,
                    }}
                  />
                </Box>
              </Box>

              {expiresAt && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      {isExpired ? 'Expired on' : 'Valid until'}
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {format(expiresAt, 'd MMM yyyy')}
                    </Typography>
                  </Box>
                  {!isExpired && daysLeft !== null && (
                    <>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, Math.max(0, (daysLeft / 30) * 100))}
                        sx={{
                          backgroundColor: 'rgba(255,255,255,.2)',
                          '& .MuiLinearProgress-bar': { background: '#fff', borderRadius: 4 },
                          borderRadius: 4,
                          height: 6,
                        }}
                      />
                      <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: 'block' }}>
                        {daysLeft} days remaining
                      </Typography>
                    </>
                  )}
                </Box>
              )}

              {!expiresAt && (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>No expiry set for this plan</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} fontFamily="'Playfair Display', serif" sx={{ mb: 2 }}>
                Included Features
              </Typography>
              {sub?.features && sub.features.length > 0 ? (
                <List dense disablePadding>
                  {sub.features.map((feature) => (
                    <ListItem key={feature} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500, textTransform: 'capitalize' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Contact your administrator for plan details.
                </Typography>
              )}

              {(sub?.maxOrders || sub?.maxStaff) && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  {sub.maxOrders && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Max Orders</Typography>
                      <Typography variant="caption" fontWeight={600}>{sub.maxOrders.toLocaleString()}</Typography>
                    </Box>
                  )}
                  {sub.maxStaff && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">Max Staff</Typography>
                      <Typography variant="caption" fontWeight={600}>{sub.maxStaff}</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ background: (t) => t.palette.brand.gradientSoft }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>Need to upgrade?</Typography>
              <Typography variant="body2" color="text.secondary">
                Contact your platform administrator to upgrade your subscription plan or renew your existing plan.
                Online subscription management will be available in a future update.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

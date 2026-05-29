import { Box, Grid, Card, CardContent, Typography, Skeleton, Chip, Button } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useQuery } from '@tanstack/react-query';
import { getAllBoutiques } from '@/services/boutiques';
import { getAllSubscriptionPayments } from '@/services/subscriptionPayments';
import PageHeader from '@/components/common/PageHeader';
import { BoutiqueStatusChip } from '@/components/common/StatusChip';
import { format, startOfMonth, isSameMonth, subMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function StatCard({
  icon, title, value, color, sub,
}: { icon: React.ReactNode; title: string; value: string | number; color: string; sub?: string }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, flexShrink: 0 }}>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">{title}</Typography>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2} fontFamily="'sans-serif">{value}</Typography>
          {sub && <Typography variant="caption" color="text.disabled">{sub}</Typography>}
        </Box>
      </CardContent>
    </Card>
  );
}

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { data: boutiques = [], isLoading } = useQuery({
    queryKey: ['admin-boutiques'],
    queryFn: getAllBoutiques,
  });
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['all-subscription-payments'],
    queryFn: getAllSubscriptionPayments,
  });

  const now = new Date();
  const active       = boutiques.filter((b) => b.status === 'active').length;
  const inactive     = boutiques.filter((b) => b.status === 'inactive').length;
  const activePlans  = boutiques.filter((b) =>
    b.subscription.plan !== 'free' &&
    b.subscription.isActive &&
    (!b.subscription.expiresAt || b.subscription.expiresAt > now),
  ).length;
  const expiredPlans = boutiques.filter((b) => b.subscription.expiresAt && b.subscription.expiresAt < now).length;

  const totalRevenue   = payments.reduce((s, p) => s + p.amount, 0);
  const thisMonthStart = startOfMonth(now);
  const thisMonthRev   = payments.filter((p) => p.paidAt >= thisMonthStart).reduce((s, p) => s + p.amount, 0);
  const lastMonthRev   = payments
    .filter((p) => isSameMonth(p.paidAt, subMonths(now, 1)))
    .reduce((s, p) => s + p.amount, 0);

  return (
    <Box>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview" />

      {/* Boutique stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<StorefrontIcon style={{display: 'flex'}}/>} title="Total Boutiques" value={boutiques.length} color="#7B5EA7" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckCircleIcon style={{display: 'flex'}} />} title="Active" value={active} color="#2E7D32" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CancelIcon style={{display: 'flex'}} />} title="Inactive" value={inactive} color="#D32F2F" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CardMembershipIcon style={{display: 'flex'}}/>} title="Active Plans" value={activePlans} color="#4A6FD4" />
        </Grid>
        {expiredPlans > 0 && (
          <Grid item xs={6} sm={3}>
            <StatCard icon={<EventBusyIcon style={{display: 'flex'}} />} title="Expired Plans" value={expiredPlans} color="#E65100" />
          </Grid>
        )}
      </Grid>

      {/* Revenue stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700} fontFamily="'Playfair Display', serif">
          Revenue Overview
        </Typography>
        <Button
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/admin/subscriptions')}
          sx={{ textTransform: 'none', fontWeight: 600, fontSize: 12 }}
        >
          Full Details
        </Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          {paymentsLoading
            ? <Skeleton variant="rounded" height={72} />
            : <StatCard icon={<CurrencyRupeeIcon style={{display: 'flex'}}/>} title="Total Revenue" value={fmt(totalRevenue)} color="#1B7A4B" sub="all time" />}
        </Grid>
        <Grid item xs={6} sm={4}>
          {paymentsLoading
            ? <Skeleton variant="rounded" height={72} />
            : <StatCard icon={<TrendingUpIcon style={{display: 'flex'}} />} title="This Month" value={fmt(thisMonthRev)} color="#7B5EA7" sub={format(now, 'MMMM yyyy')} />}
        </Grid>
        <Grid item xs={6} sm={4}>
          {paymentsLoading
            ? <Skeleton variant="rounded" height={72} />
            : <StatCard icon={<TrendingUpIcon style={{display: 'flex'}} />} title="Last Month" value={fmt(lastMonthRev)} color="#4A6FD4" sub={format(subMonths(now, 1), 'MMMM yyyy')} />}
        </Grid>
      </Grid>

      {/* Recent boutiques */}
      <Typography variant="subtitle1" fontWeight={700} fontFamily="'Playfair Display', serif" sx={{ mb: 1.5 }}>
        Recent Boutiques
      </Typography>
      <Grid container spacing={1.5}>
        {isLoading
          ? [1, 2, 3].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
              </Grid>
            ))
          : boutiques.slice(0, 6).map((boutique) => {
              const isExpired = boutique.subscription.expiresAt
                ? boutique.subscription.expiresAt < now
                : false;
              return (
                <Grid item xs={12} sm={6} md={4} key={boutique.id}>
                  <Card
                    onClick={() => navigate(`/admin/boutiques/${boutique.id}`)}
                    sx={{ cursor: 'pointer', transition: 'box-shadow .18s', '&:hover': { boxShadow: 4 } }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ flex: 1 }}>
                          {boutique.name}
                        </Typography>
                        <BoutiqueStatusChip status={boutique.status} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">{boutique.ownerName}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block">{boutique.ownerPhone}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Typography variant="caption" color="primary.main" fontWeight={600}>
                            {boutique.subscription.planName}
                          </Typography>
                          {isExpired && (
                            <Chip label="Expired" size="small" color="error" sx={{ height: 18, fontSize: 10 }} />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.disabled">
                          {format(boutique.createdAt, 'd MMM yyyy')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
      </Grid>
    </Box>
  );
}

import { Box, Grid, Card, CardContent, Typography, Skeleton } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import { useQuery } from '@tanstack/react-query';
import { getAllBoutiques } from '@/services/boutiques';
import PageHeader from '@/components/common/PageHeader';
import { BoutiqueStatusChip } from '@/components/common/StatusChip';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18` }}>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">{title}</Typography>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: boutiques = [], isLoading } = useQuery({
    queryKey: ['admin-boutiques'],
    queryFn: getAllBoutiques,
  });

  const active = boutiques.filter((b) => b.status === 'active').length;
  const inactive = boutiques.filter((b) => b.status !== 'active').length;
  const withSub = boutiques.filter((b) => b.subscription.isActive && b.subscription.plan !== 'free').length;

  return (
    <Box>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<StorefrontIcon />} title="Total Boutiques" value={boutiques.length} color="#7B5EA7" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CheckCircleIcon />} title="Active" value={active} color="#2E7D32" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CancelIcon />} title="Inactive" value={inactive} color="#D32F2F" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard icon={<CardMembershipIcon />} title="Paid Plans" value={withSub} color="#4A6FD4" />
        </Grid>
      </Grid>

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
          : boutiques.slice(0, 6).map((boutique) => (
              <Grid item xs={12} sm={6} md={4} key={boutique.id}>
                <Card
                  onClick={() => navigate('/admin/boutiques')}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" color="primary.main" fontWeight={600}>
                        {boutique.subscription.planName}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {format(boutique.createdAt, 'd MMM yyyy')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>
    </Box>
  );
}

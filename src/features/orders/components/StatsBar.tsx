import { Box, Typography, Skeleton } from '@mui/material';
import { Order } from '@/types';

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

interface StatProps {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  loading?: boolean;
}

function Stat({ label, value, sub, accent, loading }: StatProps) {
  return (
    <Box sx={{
      flex: 1, minWidth: 0,
      bgcolor: 'background.paper',
      borderRadius: 0.5,
      p: { xs: 1.5, sm: 2 },
      boxShadow: '0 2px 12px rgba(26,22,37,.07)',
      borderTop: `3px solid ${accent}`,
    }}>
      {loading ? (
        <Skeleton width="60%" height={28} />
      ) : (
        <Typography variant="h6" fontWeight={800} fontSize={{ xs: 18, sm: 22 }} sx={{ lineHeight: 1.1 }}>
          {value}
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" fontSize={11} fontWeight={600}
        sx={{ display: 'block', mt: 0.25, textTransform: 'uppercase', letterSpacing: '.05em' }}>
        {label}
      </Typography>
      {sub && !loading && (
        <Typography variant="caption" color="text.disabled" fontSize={10} sx={{ display: 'block', mt: 0.25 }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

interface Props { orders: Order[]; loading?: boolean; }

export default function StatsBar({ orders, loading }: Props) {
  const active = orders.filter((o) => ['pending', 'in-progress', 'ready'].includes(o.status)).length;
  const totalDue = orders.reduce((s, o) => s + (o.balanceAmount || 0), 0);
  const revenue = orders.reduce((s, o) => s + o.paidAmount, 0);
  const delivered = orders.filter((o) => o.status === 'delivered').length;

  return (
    <Box sx={{ display: 'flex', gap: 1.25, mb: 2.5 }}>
      <Stat label="Active" value={active} sub={`${orders.length} total`} accent="#7B5EA7" loading={loading} />
      <Stat label="Revenue" value={fmt(revenue)} sub={`${delivered} delivered`} accent="#4A6FD4" loading={loading} />
      <Stat label="Due" value={fmt(totalDue)} sub="balance pending" accent={totalDue > 0 ? '#D32F2F' : '#2E7D32'} loading={loading} />
    </Box>
  );
}

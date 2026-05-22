import { Box, Card, Typography, Skeleton } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Order } from '@/types';

const fmt = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000
    ? `₹${(n / 1000).toFixed(1)}K`
    : `₹${n}`;

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, color, bg, loading }: StatCardProps) {
  return (
    <Card sx={{ flex: 1, minWidth: 0, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 2, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, display: 'block', whiteSpace: 'nowrap' }}>{label}</Typography>
        {loading ? (
          <Skeleton width={50} height={24} />
        ) : (
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2, fontSize: { xs: 15, sm: 18 } }}>{value}</Typography>
        )}
      </Box>
    </Card>
  );
}

interface Props {
  orders: Order[];
  loading?: boolean;
}

export default function StatsBar({ orders, loading }: Props) {
  const total = orders.length;
  const pending = orders.filter((o) => ['pending', 'in-progress'].includes(o.status)).length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const revenue = orders.reduce((s, o) => s + o.paidAmount, 0);

  return (
    <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
      <StatCard label="Total Orders" value={total} icon={<AssignmentIcon fontSize="small" />} color="#4A6FD4" bg="#eef2fc" loading={loading} />
      <StatCard label="Pending" value={pending} icon={<HourglassEmptyIcon fontSize="small" />} color="#7a4f00" bg="#fff3dc" loading={loading} />
      <StatCard label="Delivered" value={delivered} icon={<CheckCircleIcon fontSize="small" />} color="#1e6b3e" bg="#e8f5ee" loading={loading} />
      <StatCard label="Revenue" value={fmt(revenue)} icon={<AccountBalanceWalletIcon fontSize="small" />} color="#7B5EA7" bg="#f3eff9" loading={loading} />
    </Box>
  );
}

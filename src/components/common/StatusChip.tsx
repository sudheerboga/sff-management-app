import { Chip } from '@mui/material';
import { OrderStatus } from '@/types';

const ORDER_STATUS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pending',     color: '#7a4f00', bg: '#fff3dc' },
  'in-progress': { label: 'In Progress', color: '#1e3a8a', bg: '#dbeafe' },
  ready:       { label: 'Ready',       color: '#1e6b3e', bg: '#e8f5ee' },
  delivered:   { label: 'Delivered',   color: '#4a1878', bg: '#f3e8ff' },
  cancelled:   { label: 'Cancelled',   color: '#8b2020', bg: '#fdeaea' },
};

export function OrderStatusChip({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS[status] || ORDER_STATUS.pending;
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{ color: s.color, backgroundColor: s.bg, fontWeight: 600, fontSize: 11, height: 22, borderRadius: 1.5 }}
    />
  );
}

export function BoutiqueStatusChip({ status }: { status: 'active' | 'inactive' | 'suspended' }) {
  const map = {
    active:    { label: 'Active',    color: '#1e6b3e', bg: '#e8f5ee' },
    inactive:  { label: 'Inactive',  color: '#7a4f00', bg: '#fff3dc' },
    suspended: { label: 'Suspended', color: '#8b2020', bg: '#fdeaea' },
  };
  const s = map[status];
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{ color: s.color, backgroundColor: s.bg, fontWeight: 600, fontSize: 11, height: 22, borderRadius: 1.5 }}
    />
  );
}

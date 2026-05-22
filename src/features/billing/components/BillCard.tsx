import { Card, CardContent, Box, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import { format } from 'date-fns';
import { Bill } from '@/types';
import { PaymentStatusChip } from '@/components/common/StatusChip';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  bill: Bill;
  onDelete: () => void;
  onPrint: () => void;
  onClick: () => void;
}

export default function BillCard({ bill, onDelete, onPrint, onClick }: Props) {
  const user = useAuthStore((s) => s.user);
  const isStaff = user?.role === 'staff';

  return (
    <Card onClick={onClick} sx={{ cursor: 'pointer', transition: 'box-shadow .18s', '&:hover': { boxShadow: 4 } }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ fontSize: 15 }}>{bill.customerName}</Typography>
            <Typography variant="caption" color="text.secondary">{bill.invoiceNumber}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
            <PaymentStatusChip status={bill.paymentStatus} />
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onPrint(); }}>
              <PrintIcon sx={{ fontSize: 16 }} />
            </IconButton>
            {!isStaff && (
              <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', fontSize: 18 }}>
              ₹{bill.totalAmount.toLocaleString()}
            </Typography>
            {bill.balanceAmount > 0 && (
              <Typography variant="caption" color="error.main">
                Balance: ₹{bill.balanceAmount.toLocaleString()}
              </Typography>
            )}
            {bill.gstPercent > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                GST {bill.gstPercent}% · ₹{bill.gstAmount.toLocaleString()}
              </Typography>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">{format(bill.createdAt, 'd MMM yyyy')}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

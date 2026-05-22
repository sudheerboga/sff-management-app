import {
  Drawer, Box, Typography, Chip, Divider, IconButton, Button,
  Table, TableBody, TableCell, TableRow, TableHead, Select,
  MenuItem, FormControl, InputLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import { Order } from '@/types';
import { OrderStatusChip } from '@/components/common/StatusChip';
import { useAuthStore } from '@/stores/authStore';

const STATUSES: Order['status'][] = ['pending', 'in-progress', 'ready', 'delivered', 'cancelled'];

interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: Order['status']) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function OrderDetailDrawer({ order, open, onClose, onStatusChange, onEdit, onDelete }: Props) {
  const user = useAuthStore((s) => s.user);
  const isStaff = user?.role === 'staff';

  if (!order) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100vw', sm: 420 }, p: 0 } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2.5,
            background: (t) => t.palette.brand.gradient,
            color: '#fff',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h6" fontFamily="'Playfair Display', serif" fontWeight={700}>{order.customerName}</Typography>
            {order.customerPhone && <Typography variant="caption" sx={{ opacity: .8 }}>{order.customerPhone}</Typography>}
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: 'rgba(255,255,255,.8)' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {/* Status section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <OrderStatusChip status={order.status} />
            {!isStaff && (
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Change status</InputLabel>
                <Select
                  value=""
                  label="Change status"
                  onChange={(e) => { if (e.target.value) onStatusChange(e.target.value as Order['status']); }}
                  displayEmpty
                >
                  {STATUSES.filter((s) => s !== order.status).map((s) => (
                    <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                      {s.replace('-', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

          {/* Dates */}
          <Box sx={{ display: 'flex', gap: 3, mb: 2, p: 2, background: (t) => t.palette.brand.gradientSoft, borderRadius: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Order Date</Typography>
              <Typography variant="body2" fontWeight={600}>{format(order.orderDate, 'd MMM yyyy')}</Typography>
            </Box>
            {order.deliveryDate && (
              <Box>
                <Typography variant="caption" color="text.secondary">Delivery Date</Typography>
                <Typography variant="body2" fontWeight={600}>{format(order.deliveryDate, 'd MMM yyyy')}</Typography>
              </Box>
            )}
          </Box>

          {/* Items table */}
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Items</Typography>
          <Table size="small" sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Item</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Qty</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Rate</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ fontSize: 13 }}>
                    {item.garment}
                    {item.description && <Typography variant="caption" display="block" color="text.secondary">{item.description}</Typography>}
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>{item.qty}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>₹{item.rate.toLocaleString()}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600 }}>₹{item.amount.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Payment summary */}
          <Box sx={{ background: (t) => t.palette.background.default, borderRadius: 2, p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="body2" color="text.secondary">Total</Typography>
              <Typography variant="body2" fontWeight={700}>₹{order.totalAmount.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="body2" color="text.secondary">Paid</Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">₹{order.paidAmount.toLocaleString()}</Typography>
            </Box>
            <Divider sx={{ my: 0.75 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" fontWeight={700}>Balance</Typography>
              <Typography variant="body2" fontWeight={700} color={order.balanceAmount > 0 ? 'error.main' : 'success.main'}>
                ₹{order.balanceAmount.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {order.notes && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Notes</Typography>
              <Typography variant="body2">{order.notes}</Typography>
            </Box>
          )}

          <Typography variant="caption" color="text.disabled">
            Created by {order.createdByName} · {format(order.createdAt, 'd MMM yyyy')}
          </Typography>
        </Box>

        {!isStaff && (
          <Box sx={{ p: 2, borderTop: (t) => `1px solid ${t.palette.divider}`, display: 'flex', gap: 1.5 }}>
            <Button variant="outlined" startIcon={<EditIcon />} size="small" fullWidth onClick={onEdit}>
              Edit
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} size="small" fullWidth onClick={onDelete}>
              Delete
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

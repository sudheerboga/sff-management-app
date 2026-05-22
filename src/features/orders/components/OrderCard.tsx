import { Card, CardContent, Box, Typography, Chip, IconButton, Menu, MenuItem, ListItemIcon } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Order } from '@/types';
import { OrderStatusChip } from '@/components/common/StatusChip';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  order: Order;
  onClick: () => void;
  onStatusChange: (status: Order['status']) => void;
  onDelete: () => void;
  onEdit: () => void;
}

export default function OrderCard({ order, onClick, onStatusChange, onDelete, onEdit }: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const user = useAuthStore((s) => s.user);
  const isStaff = user?.role === 'staff';

  const deliveryDate = order.deliveryDate;
  const isOverdue = deliveryDate && isPast(deliveryDate) && order.status !== 'delivered';
  const isDueToday = deliveryDate && isToday(deliveryDate);

  const total = order.totalAmount;
  const balance = order.balanceAmount;

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'box-shadow .18s',
        '&:hover': { boxShadow: 4 },
        border: isOverdue ? '1px solid rgba(139,32,32,.25)' : '1px solid transparent',
        background: isOverdue ? 'rgba(253,234,234,.5)' : isDueToday ? 'rgba(255,243,220,.5)' : 'background.paper',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ fontSize: 15 }}>
              {order.customerName}
            </Typography>
            {order.customerPhone && (
              <Typography variant="caption" color="text.secondary">{order.customerPhone}</Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 1 }}>
            <OrderStatusChip status={order.status} />
            {!isStaff && (
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
                sx={{ ml: 0.25 }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
          {order.items.slice(0, 3).map((item, i) => (
            <Chip key={i} label={`${item.garment}${item.qty > 1 ? ` ×${item.qty}` : ''}`} size="small"
              sx={{ height: 20, fontSize: 11, borderRadius: 1.5, background: 'rgba(123,94,167,.08)', color: 'primary.main' }} />
          ))}
          {order.items.length > 3 && (
            <Chip label={`+${order.items.length - 3} more`} size="small"
              sx={{ height: 20, fontSize: 11, borderRadius: 1.5 }} />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'primary.main' }}>
              ₹{total.toLocaleString()}
            </Typography>
            {balance > 0 && (
              <Typography variant="caption" color="error.main">
                Balance: ₹{balance.toLocaleString()}
              </Typography>
            )}
          </Box>
          {deliveryDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 12, color: isOverdue ? 'error.main' : isDueToday ? 'warning.main' : 'text.disabled' }} />
              <Typography variant="caption" sx={{ color: isOverdue ? 'error.main' : isDueToday ? 'warning.main' : 'text.secondary', fontSize: 11 }}>
                {isOverdue ? 'Overdue · ' : isDueToday ? 'Today · ' : ''}{format(deliveryDate, 'd MMM')}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={(e) => { (e as React.MouseEvent).stopPropagation?.(); setAnchorEl(null); }}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 180 } }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); onEdit(); }} dense>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>Edit order
        </MenuItem>
        {order.status !== 'delivered' && (
          <MenuItem onClick={() => { setAnchorEl(null); onStatusChange('delivered'); }} dense>
            <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>Mark delivered
          </MenuItem>
        )}
        {order.status !== 'in-progress' && order.status !== 'delivered' && (
          <MenuItem onClick={() => { setAnchorEl(null); onStatusChange('in-progress'); }} dense>
            <ListItemIcon><LocalShippingIcon fontSize="small" color="info" /></ListItemIcon>Mark in-progress
          </MenuItem>
        )}
        <MenuItem onClick={() => { setAnchorEl(null); onDelete(); }} dense sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}

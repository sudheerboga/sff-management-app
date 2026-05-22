import { useState, useMemo } from 'react';
import {
  Box, TextField, InputAdornment, Fab, ToggleButton, ToggleButtonGroup,
  MenuItem, Select, FormControl, InputLabel, Typography, Skeleton,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useOrders } from './hooks/useOrders';
import OrderCard from './components/OrderCard';
import StatsBar from './components/StatsBar';
import CreateOrderModal from './components/CreateOrderModal';
import OrderDetailDrawer from './components/OrderDetailDrawer';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/authStore';
import { Order, OrderItem, OrderStatus } from '@/types';

type Filter = 'all' | 'pending' | 'in-progress' | 'ready' | 'delivered';

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const { query, createMutation, statusMutation, deleteMutation, updateMutation } = useOrders();
  const orders = query.data || [];

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'delivery' | 'amount'>('newest');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== 'all') list = list.filter((o) => o.status === filter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((o) => o.customerName.toLowerCase().includes(s) || o.customerPhone?.includes(s));
    }
    if (sortBy === 'delivery') list = [...list].sort((a, b) => (a.deliveryDate?.getTime() || 0) - (b.deliveryDate?.getTime() || 0));
    if (sortBy === 'amount') list = [...list].sort((a, b) => b.totalAmount - a.totalAmount);
    return list;
  }, [orders, filter, search, sortBy]);

  type ModalData = { customerName: string; customerPhone: string; items: OrderItem[]; paidAmount: number; deliveryDate: Date | null; notes: string };

  const handleCreate = async (data: ModalData) => {
    await createMutation.mutateAsync({
      ...data,
      createdBy: user!.uid,
      createdByName: user!.name,
    });
  };

  const handleEdit = async (data: ModalData) => {
    if (!editOrder) return;
    await updateMutation.mutateAsync({ orderId: editOrder.id, data });
    setEditOrder(null);
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    statusMutation.mutate({ orderId, status });
    if (selectedOrder?.id === orderId) setSelectedOrder((o) => o ? { ...o, status } : o);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
    if (selectedOrder?.id === deleteId) { setDetailOpen(false); setSelectedOrder(null); }
  };

  const isStaff = user?.role === 'staff';

  return (
    <Box>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} total orders`}
        actionLabel={isStaff ? undefined : 'New Order'}
        onAction={isStaff ? undefined : () => setCreateOpen(true)}
      />

      <StatsBar orders={orders} loading={query.isLoading} />

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 180, maxWidth: 320 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Sort</InputLabel>
          <Select value={sortBy} label="Sort" onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
            <MenuItem value="newest">Newest first</MenuItem>
            <MenuItem value="delivery">By delivery date</MenuItem>
            <MenuItem value="amount">By amount</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, v) => v && setFilter(v)}
        size="small"
        sx={{ mb: 2.5, flexWrap: 'wrap', '& .MuiToggleButton-root': { borderRadius: 2, fontSize: 12, py: 0.5, px: 1.5 } }}
      >
        {(['all', 'pending', 'in-progress', 'ready', 'delivered'] as Filter[]).map((f) => (
          <ToggleButton key={f} value={f} sx={{ textTransform: 'capitalize' }}>
            {f === 'all' ? `All (${orders.length})` : `${f.replace('-', ' ')} (${orders.filter((o) => o.status === f).length})`}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {query.isLoading ? (
        <Grid container spacing={1.5}>
          {[1, 2, 3, 4].map((i) => <Grid item xs={12} sm={6} key={i}><Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} /></Grid>)}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<AssignmentIcon />}
          title={search || filter !== 'all' ? 'No orders found' : 'No orders yet'}
          description={search ? 'Try a different search term' : filter !== 'all' ? 'No orders with this status' : 'Create your first order to get started'}
          actionLabel={!isStaff && !search && filter === 'all' ? 'Create Order' : undefined}
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <Grid container spacing={1.5}>
          {filtered.map((order) => (
            <Grid item xs={12} sm={6} key={order.id}>
              <OrderCard
                order={order}
                onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}
                onStatusChange={(status) => handleStatusChange(order.id, status)}
                onDelete={() => setDeleteId(order.id)}
                onEdit={() => { setEditOrder(order); setDetailOpen(false); }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {!isStaff && (
        <Fab
          size="medium"
          onClick={() => setCreateOpen(true)}
          sx={{ position: 'fixed', bottom: { xs: 84, md: 24 }, right: 24 }}
        >
          <AddIcon />
        </Fab>
      )}

      <CreateOrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />

      {editOrder && (
        <CreateOrderModal
          open={!!editOrder}
          onClose={() => setEditOrder(null)}
          onSubmit={handleEdit}
          loading={updateMutation.isPending}
          defaultValues={editOrder}
          title="Edit Order"
        />
      )}

      <OrderDetailDrawer
        order={selectedOrder}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStatusChange={(status) => selectedOrder && handleStatusChange(selectedOrder.id, status)}
        onEdit={() => { setEditOrder(selectedOrder); setDetailOpen(false); }}
        onDelete={() => { setDeleteId(selectedOrder?.id || null); setDetailOpen(false); }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Order"
        message="This order will be moved to trash. The super admin can restore it if needed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

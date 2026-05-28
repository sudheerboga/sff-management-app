import { useState, useMemo, useEffect } from 'react';
import { Box, Fab, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useOrders } from './hooks/useOrders';
import { useOrdersPage } from './hooks/useOrdersPage';
import { getOrders, getOrder } from '@/services/orders';
import OrderCard from './components/OrderCard';
import OrderDetailDrawer from './components/OrderDetailDrawer';
import OrdersFilterSheet, { OrderFilters } from './components/OrdersFilterSheet';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { usePlanStatus } from '@/hooks/usePlanStatus';
import { Order, OrderStatus } from '@/types';

function DotsLoader() {
  return (
    <>
      <style>{`@keyframes ord-dot{0%,80%,100%{transform:scale(0);opacity:.25}40%{transform:scale(1);opacity:1}}`}</style>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '72px 0' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 11, height: 11, borderRadius: '50%',
            background: '#7B5EA7', margin: '0 5px',
            animation: `ord-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
          }} />
        ))}
      </div>
    </>
  );
}

export default function OrdersPage() {
  const { T } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const boutiqueId = user?.boutiqueId || '';
  const { statusMutation, deleteMutation } = useOrders();
  const { orders: pagedOrders, isLoading: pageLoading, isFetching, page, hasMore, totalCount, totalPages, goNext, goPrev, resetPage, queryData } = useOrdersPage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const isSearching = search.trim().length > 0;

  // Full dataset — only fetched when search is active
  const searchQuery = useQuery({
    queryKey: ['orders-all', boutiqueId],
    queryFn: () => getOrders(boutiqueId),
    enabled: isSearching && !!boutiqueId,
    staleTime: 5 * 60_000,
  });

  // Use full list when searching, paginated list otherwise
  const orders = isSearching ? (searchQuery.data ?? []) : pagedOrders;
  const isLoading = isSearching ? searchQuery.isLoading : pageLoading;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const newOrderOpen = useUiStore((s) => s.newOrderOpen);
  const setNewOrderOpen = useUiStore((s) => s.setNewOrderOpen);
  useEffect(() => {
    if (newOrderOpen) { navigate('/dashboard/new'); setNewOrderOpen(false); }
  }, [newOrderOpen, setNewOrderOpen, navigate]);

  // Auto-open drawer when navigated here with a specific order id (e.g. from Customers page).
  // Fetches the order directly so it works regardless of which page is currently loaded.
  useEffect(() => {
    const openOrderId = (location.state as { openOrderId?: string } | null)?.openOrderId;
    if (!openOrderId) return;
    navigate(location.pathname, { replace: true, state: {} });
    const inPage = queryData?.orders.find((o) => o.id === openOrderId);
    if (inPage) {
      setSelectedOrder(inPage);
      setDetailOpen(true);
    } else {
      getOrder(boutiqueId, openOrderId).then((order) => {
        if (order) { setSelectedOrder(order); setDetailOpen(true); }
      });
    }
  }, [location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep selectedOrder in sync when the page re-fetches (e.g. after payment added)
  useEffect(() => {
    if (selectedOrder && queryData) {
      const updated = queryData.orders.find((o) => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  }, [queryData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Read filters from URL params
  const datePreset    = searchParams.get('date')       || 'all';
  const dateFrom      = searchParams.get('from')       || '';
  const dateTo        = searchParams.get('to')         || '';
  const statusFilter  = (searchParams.get('status') || 'all') as OrderStatus | 'all';
  const balanceDue    = searchParams.get('balance')    === '1';
  const activeCount   = (datePreset !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (balanceDue ? 1 : 0);
  const hasFilters    = activeCount > 0;

  // Reset to page 1 whenever filters change
  useEffect(() => {
    resetPage();
  }, [datePreset, dateFrom, dateTo, statusFilter, balanceDue]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let list = orders;
    const now = new Date();
    if (datePreset === '7d')  list = list.filter((o) => o.orderDate >= startOfDay(subDays(now, 7)));
    if (datePreset === '30d') list = list.filter((o) => o.orderDate >= startOfDay(subDays(now, 30)));
    if (datePreset === 'custom' && dateFrom)
      list = list.filter((o) => o.orderDate >= new Date(dateFrom) && o.orderDate <= endOfDay(dateTo ? new Date(dateTo) : now));
    if (statusFilter !== 'all') list = list.filter((o) => o.status === statusFilter);
    if (balanceDue) list = list.filter((o) => o.balanceAmount > 0);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((o) => o.customerName.toLowerCase().includes(s) || o.memberName?.toLowerCase().includes(s) || o.customerPhone?.includes(s));
    }
    return list;
  }, [orders, datePreset, dateFrom, dateTo, statusFilter, balanceDue, search]);

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
  const { isReadOnly } = usePlanStatus();

  const handleApplyFilters = (f: OrderFilters) => {
    const p = new URLSearchParams();
    if (f.datePreset !== 'all') p.set('date', f.datePreset);
    if (f.datePreset === 'custom') {
      if (f.dateFrom) p.set('from', f.dateFrom);
      if (f.dateTo)   p.set('to',   f.dateTo);
    }
    if (f.status !== 'all') p.set('status', f.status);
    if (f.balanceDue) p.set('balance', '1');
    setSearchParams(p);
    setFilterOpen(false);
  };

  const currentFilters: OrderFilters = {
    datePreset: (datePreset as OrderFilters['datePreset']),
    dateFrom,
    dateTo,
    status: statusFilter,
    balanceDue,
  };

  const paginationVisible = !isSearching && (page > 1 || hasMore);

  const paginationBtnStyle = (disabled: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '8px 18px', borderRadius: T.r.md,
    border: `1.5px solid ${disabled ? T.border : T.violet.d}`,
    background: disabled ? 'transparent' : `${T.violet.d}12`,
    color: disabled ? T.muted : T.violet.d,
    fontSize: 13, fontWeight: 600, fontFamily: T.fontBody,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all .15s',
  });

  return (
    <Box>
      <PageHeader
        title="Orders"
        subtitle={
          isSearching
            ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} found`
            : hasFilters
              ? `${filtered.length} on this page · ${totalCount ?? '…'} total`
              : totalCount !== null
                ? `${totalCount.toLocaleString('en-IN')} orders total`
                : 'Loading…'
        }
        actionLabel={isStaff || isReadOnly ? undefined : 'New Order'}
        onAction={isStaff || isReadOnly ? undefined : () => navigate('/dashboard/new')}
      />

      {/* ── Search + Filter row ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, display: 'flex', pointerEvents: 'none' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input
            type="text"
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            style={{
              width: '100%', padding: '11px 14px 11px 38px',
              border: `1.5px solid ${T.border}`, borderRadius: T.r.md,
              background: T.inputBg, color: T.text,
              fontSize: 14, fontFamily: T.fontBody,
              outline: 'none', boxSizing: 'border-box',
              WebkitTextFillColor: T.text,
            }}
          />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '11px 16px', flexShrink: 0,
            border: `1.5px solid ${activeCount ? T.violet.d : T.border}`,
            borderRadius: T.r.md,
            background: activeCount ? `${T.violet.d}14` : T.inputBg,
            color: activeCount ? T.violet.d : T.text2,
            fontSize: 14, fontWeight: 600, fontFamily: T.fontBody,
            cursor: 'pointer', position: 'relative',
            transition: 'all .15s',
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filters
          {activeCount > 0 && (
            <span style={{
              position: 'absolute', top: -7, right: -7,
              width: 18, height: 18, borderRadius: '50%',
              background: T.violet.d, color: '#fff',
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Order list ── */}
      {isLoading ? (
        <DotsLoader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<AssignmentIcon />}
          title={search || hasFilters ? 'No orders found' : 'No orders yet'}
          description={search ? 'Try a different search term' : hasFilters ? 'No orders match this filter' : 'Create your first order to get started'}
          actionLabel={!isStaff && !isReadOnly && !search && !hasFilters ? 'Create Order' : undefined}
          onAction={() => navigate('/dashboard/new')}
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
                onEdit={() => navigate(`/dashboard/edit/${order.id}`, { state: { order } })}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ── Pagination controls ── */}
      {paginationVisible && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 28, paddingBottom: 8 }}>
          {/* Showing X–Y of N */}
          {totalCount !== null && (
            <span style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBody }}>
              {isFetching ? 'Loading…' : (() => {
                const from = (page - 1) * 25 + 1;
                const to = Math.min(page * 25, totalCount);
                return `Showing ${from.toLocaleString('en-IN')}–${to.toLocaleString('en-IN')} of ${totalCount.toLocaleString('en-IN')} orders`;
              })()}
            </span>
          )}
          {/* Prev · Page X of Y · Next */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={goPrev} disabled={page <= 1 || isFetching} style={paginationBtnStyle(page <= 1 || isFetching)}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              Prev
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text2, fontFamily: T.fontBody, minWidth: 80, textAlign: 'center' }}>
              {isFetching ? '…' : totalPages ? `Page ${page} of ${totalPages}` : `Page ${page}`}
            </span>
            <button onClick={goNext} disabled={!hasMore || isFetching} style={paginationBtnStyle(!hasMore || isFetching)}>
              Next
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      )}

      {!isStaff && !isReadOnly && (
        <Fab size="medium" onClick={() => navigate('/dashboard/new')}
          sx={{ position: 'fixed', bottom: 24, right: 24, display: { xs: 'none', md: 'flex' } }}>
          <AddIcon />
        </Fab>
      )}

      <OrderDetailDrawer
        order={selectedOrder}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onStatusChange={(status) => selectedOrder && handleStatusChange(selectedOrder.id, status)}
        onEdit={() => {
          navigate(`/dashboard/edit/${selectedOrder!.id}`, { state: { order: selectedOrder } });
          setDetailOpen(false);
        }}
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

      <OrdersFilterSheet
        open={filterOpen}
        initial={currentFilters}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilters}
      />
    </Box>
  );
}

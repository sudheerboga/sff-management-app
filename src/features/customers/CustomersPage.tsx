import { useState, useMemo } from 'react';
import { Box, Drawer, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useCustomers } from './hooks/useCustomers';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { useMeasurements } from '@/features/measurements/hooks/useMeasurements';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuthStore } from '@/stores/authStore';
import { Customer, Order, Measurement } from '@/types';

export default function CustomersPage() {
  const { T, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const { query: customersQuery } = useCustomers();
  const { query: ordersQuery } = useOrders();
  const { query: measurementsQuery } = useMeasurements();
  const navigate = useNavigate();

  const customers = customersQuery.data || [];
  const orders = ordersQuery.data || [];
  const measurements = measurementsQuery.data || [];

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const s = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.phone.includes(s) ||
        c.members.some((m) => m.name.toLowerCase().includes(s)),
    );
  }, [customers, search]);

  const isLoading = customersQuery.isLoading;

  // Per-customer order/measurement counts
  function customerOrders(c: Customer): Order[] {
    return orders.filter((o) => o.customerId === c.id);
  }
  function customerMeasurements(c: Customer): Measurement[] {
    return measurements.filter((m) => m.customerId === c.id);
  }

  const rowBg = isDark ? 'rgba(255,255,255,0.03)' : T.bg2;
  const secLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: T.muted,
    textTransform: 'uppercase', letterSpacing: '.1em',
    marginBottom: 10, display: 'block',
  };

  return (
    <Box>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customers`}
      />

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.muted, display: 'flex', pointerEvents: 'none' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or member…"
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '12px 12px 12px 40px',
            border: `1.5px solid ${T.border}`,
            borderRadius: T.r.md,
            background: T.inputBg, color: T.text,
            fontSize: 14, fontFamily: T.fontBody, outline: 'none',
          }}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={88} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
          title={search ? 'No customers found' : 'No customers yet'}
          description={search ? 'Try a different search term' : 'Customers are created automatically when you create orders or measurements'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((c) => {
            const cOrders = customerOrders(c);
            const cMeasurements = customerMeasurements(c);
            const latestOrder = cOrders[0];
            return (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                style={{
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.r.lg,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: T.grad.brand,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: '#fff', fontSize: 16, fontWeight: 700,
                  }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: T.muted, marginBottom: 8 }}>+91 {c.phone}</div>

                    {/* Members chips */}
                    {c.members.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                        {c.members.map((m) => (
                          <span
                            key={m.id}
                            style={{
                              fontSize: 11, fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: T.r.pill,
                              background: isDark ? 'rgba(123,94,167,0.15)' : T.violet.pale,
                              color: T.violet.d,
                              border: `1px solid ${T.violet.d}33`,
                            }}
                          >
                            {m.name}
                            <span style={{ opacity: .5, marginLeft: 3, textTransform: 'capitalize' }}>· {m.relation}</span>
                          </span>
                        ))}
                      </div>
                    )}

                   
                  </div>

                  <svg width="16" height="16" fill="none" stroke={T.muted} strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}><path d="M9 18l6-6-6-6"/></svg>
                </div>
                 {/* Stats row */}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        {cOrders.length} orders
                      </span>
                      <span style={{ fontSize: 11, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><line x1="5" y1="6" x2="19" y2="6"/><line x1="5" y1="18" x2="13" y2="18"/></svg>
                        {cMeasurements.length} measurements
                      </span>
                      {latestOrder && (
                        <span style={{ fontSize: 11, color: T.muted }}>
                          Last: {format(latestOrder.orderDate, 'd MMM yy')}
                        </span>
                      )}
                    </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer detail drawer */}
      {selected && (
        <CustomerDetailDrawer
          customer={selected}
          orders={customerOrders(selected)}
          measurements={customerMeasurements(selected)}
          onClose={() => setSelected(null)}
          onNewOrder={() => {
            setSelected(null);
            navigate('/dashboard/new', { state: { prefillPhone: selected.phone } });
          }}
          onNewMeasurement={() => {
            setSelected(null);
            navigate('/measurements/new', { state: { prefillPhone: selected.phone } });
          }}
        />
      )}
    </Box>
  );
}

// ─── Customer detail drawer ────────────────────────────────────────────────
interface DrawerProps {
  customer: Customer;
  orders: Order[];
  measurements: Measurement[];
  onClose: () => void;
  onNewOrder: () => void;
  onNewMeasurement: () => void;
}

function CustomerDetailDrawer({ customer, orders, measurements, onClose, onNewOrder, onNewMeasurement }: DrawerProps) {
  const { T, isDark } = useAppTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'orders' | 'measurements'>('orders');

  const rowBg = isDark ? 'rgba(255,255,255,0.03)' : T.bg2;

  const statusColor = (s: Order['status']): { text: string; bg: string } => {
    if (s === 'pending')     return { text: T.warning.text, bg: T.warning.bg };
    if (s === 'in-progress') return { text: T.blue.d,       bg: T.blue.pale  };
    if (s === 'ready')       return { text: T.violet.d,     bg: T.violet.pale};
    if (s === 'delivered')   return { text: T.success.text, bg: T.success.bg };
    if (s === 'cancelled')   return { text: T.danger.text,  bg: T.danger.bg  };
    return { text: T.muted, bg: T.bg2 };
  };

  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 400 },
          background: 'rgb(253 250 248)',
          display: 'flex', flexDirection: 'column', p: 0,
          borderLeft: `1px solid ${T.border}`,
        },
      }}
    >
      {/* Header */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 20px 16px', borderBottom: `1px solid ${T.border}`, fontFamily: T.fontBody }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.grad.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: T.fontDisplay }}>{customer.name}</div>
            <div style={{ fontSize: 13, color: T.muted }}>+91 {customer.phone}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, flexShrink: 0 }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Members */}
        {customer.members.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {customer.members.map((m) => (
              <span key={m.id} style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: T.r.pill, background: isDark ? 'rgba(123,94,167,0.15)' : T.violet.pale, color: T.violet.d, border: `1px solid ${T.violet.d}33` }}>
                {m.name} <span style={{ opacity: .5, textTransform: 'capitalize' }}>· {m.relation}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick action buttons */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 8 }}>
        <button
          onClick={onNewOrder}
          style={{ flex: 1, padding: '10px', border: 'none', borderRadius: T.r.md, background: T.grad.brand, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Order
        </button>
        <button
          onClick={onNewMeasurement}
          style={{ flex: 1, padding: '10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.md, background: 'transparent', color: T.violet.d, fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><line x1="5" y1="6" x2="19" y2="6"/><line x1="5" y1="18" x2="13" y2="18"/></svg>
          New Measurements
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
        {(['orders', 'measurements'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '12px', border: 'none', background: 'none',
              fontFamily: T.fontBody, fontSize: 13, fontWeight: tab === t ? 700 : 500,
              color: tab === t ? T.violet.d : T.muted,
              borderBottom: `2px solid ${tab === t ? T.violet.d : 'transparent'}`,
              cursor: 'pointer', textTransform: 'capitalize',
            }}
          >
            {t} {t === 'orders' ? `(${orders.length})` : `(${measurements.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', fontFamily: T.fontBody }}>
        {tab === 'orders' && (
          orders.length === 0 ? (
            <div style={{ textAlign: 'center', color: T.muted, fontSize: 13, paddingTop: 32 }}>No orders yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {orders.map((o) => {
                const sc = statusColor(o.status);
                return (
                  <div key={o.id}
                    onClick={() => { onClose(); navigate('/dashboard', { state: { openOrderId: o.id } }); }}
                    style={{ background: rowBg, borderRadius: T.r.md, border: `1px solid ${T.border}`, padding: '12px 14px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, fontFamily: 'monospace', background: T.bg, padding: '2px 6px', borderRadius: T.r.sm, border: `1px solid ${T.border}` }}>#{o.orderNumber}</span>
                        {o.memberName && o.memberName !== o.customerName && (
                          <span style={{ fontSize: 11, marginLeft: 6, color: T.violet.d, fontWeight: 600 }}>for {o.memberName}</span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: T.r.sm, ...sc }}>{o.status}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: T.muted }}>{format(o.orderDate, 'd MMM yyyy')}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>₹{o.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    {o.items.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: 12, color: T.text2 }}>
                        {o.items.map((i) => i.garment).join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === 'measurements' && (
          measurements.length === 0 ? (
            <div style={{ textAlign: 'center', color: T.muted, fontSize: 13, paddingTop: 32 }}>No measurements yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {measurements.map((m) => (
                <div key={m.id}
                  onClick={() => { onClose(); navigate(`/measurements/view/${m.id}`, { state: { measurement: m } }); }}
                  style={{ background: rowBg, borderRadius: T.r.md, border: `1px solid ${T.border}`, padding: '12px 14px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                      {m.memberName || m.customerName}
                    </span>
                    <span style={{ fontSize: 11, color: T.muted }}>{format(m.updatedAt, 'd MMM yyyy')}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {Object.keys(m.garments).map((g) => (
                      <span key={g} style={{ fontSize: 11, padding: '2px 8px', borderRadius: T.r.pill, background: isDark ? 'rgba(74,111,212,0.15)' : T.blue.pale, color: T.blue.d, border: `1px solid ${T.blue.d}33` }}>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </Drawer>
  );
}

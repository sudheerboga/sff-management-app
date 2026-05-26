import { useState } from 'react';
import { Drawer } from '@mui/material';
import { format } from 'date-fns';
import { Order } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { openWhatsAppBill } from '@/utils/whatsapp';
import { useMeasurements } from '@/features/measurements/hooks/useMeasurements';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { useNavigate } from 'react-router-dom';

const STATUSES: { v: Order['status']; label: string }[] = [
  { v: 'pending',   label: 'Pending'   },
  { v: 'delivered', label: 'Delivered' },
];

interface Props {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (status: Order['status']) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function OrderDetailDrawer({ order, open, onClose, onStatusChange, onEdit, onDelete }: Props) {
  const { T, isDark } = useAppTheme();
  const user    = useAuthStore((s) => s.user);
  const isStaff = user?.role === 'staff';
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const navigate = useNavigate();
  const { query: measurementsQuery } = useMeasurements();
  const { addPaymentMutation, updateMaterialCostMutation } = useOrders();

  const [payFormOpen,  setPayFormOpen]  = useState(false);
  const [payAmount,    setPayAmount]    = useState('');
  const [payDate,      setPayDate]      = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [payNote,      setPayNote]      = useState('');
  const [matFormOpen,  setMatFormOpen]  = useState(false);
  const [matCostValue, setMatCostValue] = useState('');

  if (!order) return null;

  // Find measurements for this specific order member
  const allMeasurements = measurementsQuery.data || [];
  const memberMeasurements = order.customerId
    ? allMeasurements.filter((m) =>
        m.customerId === order.customerId &&
        (order.memberId ? m.memberId === order.memberId : m.memberName === order.memberName),
      )
    : allMeasurements.filter((m) => m.customerPhone === order.customerPhone);

  const allImages = order.items.flatMap((item) =>
    (item.images || []).map((img) => ({ ...img, itemName: item.garment })),
  );

  const profit = order.totalAmount - (order.materialCost || 0);

  const statusColor = (s: Order['status']): { text: string; bg: string } => {
    if (s === 'pending')     return { text: T.warning.text,  bg: T.warning.bg  };
    if (s === 'in-progress') return { text: T.blue.d,        bg: T.blue.pale   };
    if (s === 'ready')       return { text: T.violet.d,      bg: T.violet.pale };
    if (s === 'delivered')   return { text: T.success.text,  bg: T.success.bg  };
    if (s === 'cancelled')   return { text: T.danger.text,   bg: T.danger.bg   };
    return { text: T.muted, bg: T.bg2 };
  };

  const rowBg   = isDark ? 'rgba(255,255,255,0.03)' : T.bg2;
  const secLabel: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10, display: 'block' };
  const divider  = <div style={{ height: 1, background: T.border, margin: '4px 0' }} />;

  function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0' }}>
        <span style={{ fontSize: 13, color: T.text2, fontFamily: T.fontBody }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: valueColor || T.text, fontFamily: T.fontBody }}>{value}</span>
      </div>
    );
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 400 },
          background:'rgb(253 250 248)',
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          borderLeft: `1px solid ${T.border}`,
        },
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 20px 16px', borderBottom: `1px solid ${T.border}`, fontFamily: T.fontBody, background: '#aea9a31f' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: T.fontDisplay, lineHeight: 1.2 }}>
              {order.customerName}
            </div>
            {order.customerPhone && (
              <div style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>{order.customerPhone}</div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, flexShrink: 0, marginLeft: 12 }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, fontFamily: 'monospace', background: rowBg, padding: '3px 8px', borderRadius: T.r.sm, border: `1px solid ${T.border}` }}>
            #{order.orderNumber}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: T.r.sm, ...statusColor(order.status) }}>
            {STATUSES.find(s => s.v === order.status)?.label || order.status}
          </span>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16, fontFamily: T.fontBody }}>

        {/* Status change */}
        {!isStaff && (
          <div>
            <span style={secLabel}>Update Status</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STATUSES.map(({ v, label }) => {
                const active = order.status === v;
                const c = statusColor(v);
                return (
                  <button
                    key={v}
                    onClick={() => onStatusChange(v)}
                    style={{
                      padding: '6px 14px', borderRadius: T.r.sm,
                      border: `1.5px solid ${active ? c.text + '66' : T.border}`,
                      background: active ? c.bg : 'none',
                      color: active ? c.text : T.text2,
                      fontSize: 12, fontWeight: active ? 700 : 500,
                      fontFamily: T.fontBody, cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dates */}
        <div style={{ background: rowBg, borderRadius: T.r.md, padding: '12px 14px', border: `1px solid ${T.border}` }}>
          <Row label="Order Date"    value={format(order.orderDate, 'd MMM yyyy')} />
          {order.deliveryDate && (
            <>
              {divider}
              <Row label="Delivery Date" value={format(order.deliveryDate, 'd MMM yyyy')} />
            </>
          )}
        </div>

        {/* Items */}
        <div>
          <span style={secLabel}>Items</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {order.items.map((item, i) => {
              const imgs = item.images || [];
              return (
                <div key={i} style={{ background: rowBg, borderRadius: T.r.sm, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 22, height: 22, borderRadius: T.r.sm, background: `${T.violet.d}18`, border: `1px solid ${T.violet.d}33`, color: T.violet.d, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{item.garment}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                  {imgs.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: '4px 14px 12px' }}>
                      {imgs.map((img) => {
                        const globalIdx = allImages.findIndex((x) => x.url === img.url && x.publicId === img.publicId);
                        return (
                          <div
                            key={img.publicId || img.url}
                            style={{ border: `1.5px solid ${T.border}`, borderRadius: T.r.md, overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() => setLightboxIdx(globalIdx)}
                          >
                            <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>
                            {img.note && (
                              <div style={{ padding: '6px 9px', fontSize: 12, color: T.text2, lineHeight: 1.5, fontFamily: T.fontBody, borderTop: `1px solid ${T.border}` }}>
                                {img.note}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div style={{ background: rowBg, borderRadius: T.r.md, padding: '12px 14px', border: `1px solid ${T.border}` }}>
            <span style={secLabel}>Notes</span>
            <p style={{ margin: 0, fontSize: 13, color: T.text2, lineHeight: 1.6, fontStyle: 'italic' }}>{order.notes}</p>
          </div>
        )}

        {/* Customer Measurements — tap to view/edit */}
        <button
          onClick={() => {
            onClose();
            if (memberMeasurements.length > 0) {
              navigate(`/measurements/view/${memberMeasurements[0].id}`, { state: { measurement: memberMeasurements[0] } });
            } else {
              navigate('/measurements/new', { state: { prefillPhone: order.customerPhone } });
            }
          }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: rowBg, border: `1px solid ${T.border}`, borderRadius: T.r.md, cursor: 'pointer', fontFamily: T.fontBody }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" fill="none" stroke={T.violet.d} strokeWidth="2" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><line x1="5" y1="6" x2="19" y2="6"/><line x1="5" y1="18" x2="13" y2="18"/></svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
              {order.memberName && order.memberName !== order.customerName
                ? `${order.memberName}'s Measurements`
                : 'Customer Measurements'}
            </span>
            {memberMeasurements.length > 0 ? (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: T.r.pill, background: isDark ? 'rgba(74,111,212,0.15)' : T.blue.pale, color: T.blue.d }}>
                {Object.keys(memberMeasurements[0].garments).length} garments · View
              </span>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 600, color: T.muted }}>Tap to add</span>
            )}
          </div>
          <svg width="14" height="14" fill="none" stroke={T.muted} strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        {/* Payment */}
        <div style={{ borderRadius: T.r.md, border: `1px solid ${T.border}`, backgroundColor: 'white' }}>

          {/* ── Top: Total Bill + Balance Due highlighted ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '14px 16px', borderRight: `1px solid ${T.border}`, borderRadius: `${T.r.md} 0 0 0` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Total Bill</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: T.fontBody, lineHeight: 1 }}>
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: order.balanceAmount > 0 ? `${T.danger.text}12` : `${T.success.text}12`, borderRadius: `0 14px 0 0` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: order.balanceAmount > 0 ? T.danger.text : T.success.text, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4}}>
                {order.balanceAmount > 0 ? 'Balance Due' : 'Fully Paid'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: order.balanceAmount > 0 ? T.danger.text : T.success.text, fontFamily: T.fontBody, lineHeight: 1 }}>
                ₹{order.balanceAmount > 0 ? order.balanceAmount.toLocaleString('en-IN') : '0'}
              </div>
            </div>
          </div>

          {/* ── Progress bar ── */}
          {order.totalAmount > 0 && (
            <div style={{ padding: '10px 16px 0', borderTop: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBody }}>Paid ₹{order.paidAmount.toLocaleString('en-IN')}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.success.text, fontFamily: T.fontBody }}>
                  {Math.round((order.paidAmount / order.totalAmount) * 100)}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: T.border, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', borderRadius: 3, background: order.balanceAmount > 0 ? T.success.text : T.success.text, width: `${Math.min(100, Math.round((order.paidAmount / order.totalAmount) * 100))}%`, transition: 'width .3s ease' }} />
              </div>
            </div>
          )}

          {/* ── Payment history + Add button ── */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: order.payments?.length ? 12 : 0 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Payment History
              </span>
              <button
                onClick={() => { setPayFormOpen((v) => !v); setPayAmount(''); setPayDate(format(new Date(), 'yyyy-MM-dd')); setPayNote(''); }}
                style={{ fontSize: 12, fontWeight: 700, color: T.violet.d, background: `${T.violet.d}14`, border: `1px solid ${T.violet.d}33`, borderRadius: T.r.sm, padding: '4px 10px', cursor: 'pointer', fontFamily: T.fontBody, display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Payment
              </button>
            </div>

            {/* Timeline */}
            {order.payments && order.payments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {order.payments.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 2 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: T.success.text, border: `2px solid ${T.success.text}33`, flexShrink: 0 }} />
                      {i < order.payments.length - 1 && (
                        <div style={{ width: 2, height: 28, background: T.border, borderRadius: 1 }} />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingBottom: i < order.payments.length - 1 ? 4 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.success.text, fontFamily: T.fontBody }}>
                          ₹{p.amount.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: 11, color: T.muted }}>{format(p.date, 'd MMM yyyy')}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        {p.note && <span style={{ fontSize: 11, color: T.text2, fontStyle: 'italic' }}>{p.note}</span>}
                        {p.note && <span style={{ color: T.border }}>·</span>}
                        <span style={{ fontSize: 10, color: T.muted }}>{p.recordedBy}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: T.r.pill, background: p.recordedByRole === 'staff' ? `${T.blue.d}18` : `${T.violet.d}14`, color: p.recordedByRole === 'staff' ? T.blue.d : T.violet.d, textTransform: 'capitalize' }}>
                          {p.recordedByRole || 'admin'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !payFormOpen && (
                <div style={{ fontSize: 12, color: T.muted, textAlign: 'center', padding: '8px 0', fontStyle: 'italic' }}>No payments recorded yet</div>
              )
            )}

            {/* Inline add-payment form */}
            {payFormOpen && (
              <div style={{ marginTop: order.payments?.length ? 12 : 0, borderTop: order.payments?.length ? `1px solid ${T.border}` : 'none', paddingTop: order.payments?.length ? 12 : 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Amount (₹)</div>
                    <input
                      type="number"
                      placeholder="0"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 14, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Date</div>
                    <input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      style={{ width: '80%', padding: '8px 10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 14, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }}
                    />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Note (optional)</div>
                  <input
                    type="text"
                    placeholder="e.g. Advance, Final payment…"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 14, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setPayFormOpen(false)}
                    style={{ flex: 1, padding: '9px 0', borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', color: T.text2, fontSize: 13, fontWeight: 600, fontFamily: T.fontBody, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={!payAmount || Number(payAmount) <= 0 || addPaymentMutation.isPending}
                    onClick={async () => {
                      const entry = {
                        id: Date.now().toString(36),
                        amount: Number(payAmount),
                        date: new Date(payDate),
                        note: payNote.trim(),
                        recordedBy: user?.name || '',
                        recordedById: user?.uid || '',
                        recordedByRole: user?.role || 'admin',
                      };
                      const updated = [...(order.payments || []), entry];
                      await addPaymentMutation.mutateAsync({ orderId: order.id, payments: updated, totalAmount: order.totalAmount });
                      setPayFormOpen(false);
                    }}
                    style={{ flex: 2, padding: '9px 0', borderRadius: T.r.sm, border: 'none', background: T.grad.brand, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', opacity: (!payAmount || Number(payAmount) <= 0) ? 0.5 : 1 }}
                  >
                    {addPaymentMutation.isPending ? 'Saving…' : 'Save Payment'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Material Cost + Profit ── */}
          <div style={{ borderTop: `1px solid ${T.border}`, borderRadius: `0 0 ${T.r.md} ${T.r.md}` }}>
            {/* Material cost row */}
            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: T.muted, fontFamily: T.fontBody }}>
                Material Cost
                {order.materialCost > 0 && (
                  <span style={{ fontWeight: 700, color: T.text2, marginLeft: 6 }}>₹{order.materialCost.toLocaleString('en-IN')}</span>
                )}
              </span>
              <button
                onClick={() => { setMatFormOpen((v) => !v); setMatCostValue(order.materialCost ? String(order.materialCost) : ''); }}
                style={{ fontSize: 11, fontWeight: 600, color: T.muted, background: 'none', border: `1px solid ${T.border}`, borderRadius: T.r.sm, padding: '3px 8px', cursor: 'pointer', fontFamily: T.fontBody, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {order.materialCost > 0 ? 'Edit' : 'Add'}
              </button>
            </div>

            {/* Inline material cost form */}
            {matFormOpen && (
              <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Amount (₹)</div>
                  <input
                    type="number"
                    placeholder="0"
                    value={matCostValue}
                    onChange={(e) => setMatCostValue(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, fontSize: 14, fontFamily: T.fontBody, outline: 'none', boxSizing: 'border-box', WebkitTextFillColor: T.text }}
                  />
                </div>
                <button
                  onClick={() => setMatFormOpen(false)}
                  style={{ padding: '8px 12px', borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: 'none', color: T.text2, fontSize: 13, fontWeight: 600, fontFamily: T.fontBody, cursor: 'pointer', flexShrink: 0 }}
                >
                  Cancel
                </button>
                <button
                  disabled={updateMaterialCostMutation.isPending}
                  onClick={async () => {
                    await updateMaterialCostMutation.mutateAsync({ orderId: order.id, materialCost: Number(matCostValue) || 0, totalAmount: order.totalAmount });
                    setMatFormOpen(false);
                  }}
                  style={{ padding: '8px 14px', borderRadius: T.r.sm, border: 'none', background: T.grad.brand, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', flexShrink: 0 }}
                >
                  {updateMaterialCostMutation.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}

            {/* Profit row */}
            <div style={{ padding: matFormOpen ? '0 16px 10px' : '0 16px 10px', borderTop: `1px dashed ${T.border}`, margin: '0 16px', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: T.muted, fontFamily: T.fontBody }}>Profit</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: profit >= 0 ? T.success.text : T.danger.text, fontFamily: T.fontBody }}>
                ₹{profit.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div style={{ textAlign: 'center', fontSize: 11, color: T.muted, paddingBottom: 4 }}>
          Created by {order.createdByName} · {format(order.createdAt, 'd MMM yyyy')}
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 8 }}>
        <button
          onClick={() => openWhatsAppBill(order, user?.boutiqueName || 'Boutique')}
          style={{ flex: 1, padding: '12px 0', border: 'none', borderRadius: T.r.md, background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 14px rgba(37,211,102,.3)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.134.558 4.136 1.535 5.875L0 24l6.306-1.504A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.814 9.814 0 01-4.964-1.346l-.356-.212-3.741.892.945-3.617-.232-.373A9.79 9.79 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818s9.818 4.397 9.818 9.818-4.397 9.818-9.818 9.818z"/></svg>
          WhatsApp Bill
        </button>
        {!isStaff && (
          <>
            <button
              onClick={onEdit}
              style={{ width: 44, height: 44, borderRadius: T.r.sm, border: `1.5px solid ${T.border}`, background: rowBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2, flexShrink: 0 }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button
              onClick={onDelete}
              style={{ width: 44, height: 44, borderRadius: T.r.sm, border: `1.5px solid ${T.danger.border}`, background: T.danger.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.danger.text, flexShrink: 0 }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </button>
          </>
        )}
      </div>
      {/* ── Lightbox ── */}
      {lightboxIdx !== null && allImages[lightboxIdx] && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1400, background: 'rgba(0,0,0,0.88)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', paddingTop: 'max(20px, calc(env(safe-area-inset-top, 0px) + 12px))', paddingBottom: 'max(20px, calc(env(safe-area-inset-bottom, 0px) + 12px))' }}
        >
          {/* Prev / Next */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + allImages.length) % allImages.length); }}
                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % allImages.length); }}
                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </>
          )}
          <img
            src={allImages[lightboxIdx].url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
          />
          {(allImages[lightboxIdx].note || allImages[lightboxIdx].itemName) && (
            <div style={{ marginTop: 14, textAlign: 'center', color: '#fff', fontSize: 13, lineHeight: 1.5 }}>
              <div style={{ opacity: 0.5, fontSize: 11, marginBottom: 4 }}>{allImages[lightboxIdx].itemName}</div>
              {allImages[lightboxIdx].note && <div>{allImages[lightboxIdx].note}</div>}
            </div>
          )}
          <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{lightboxIdx + 1} / {allImages.length}</div>
          <button
            onClick={() => setLightboxIdx(null)}
            style={{ position: 'absolute', top: 'max(16px, calc(env(safe-area-inset-top, 0px) + 8px))', right: 16, width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
    </Drawer>
  );
}

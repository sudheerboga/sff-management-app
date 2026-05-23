import { Drawer } from '@mui/material';
import { format } from 'date-fns';
import { Order } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { openWhatsAppBill } from '@/utils/whatsapp';

const STATUSES: { v: Order['status']; label: string }[] = [
  { v: 'pending',     label: 'Pending'     },
  { v: 'in-progress', label: 'In Progress' },
  { v: 'ready',       label: 'Ready'       },
  { v: 'delivered',   label: 'Delivered'   },
  { v: 'cancelled',   label: 'Cancelled'   },
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

  if (!order) return null;

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
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, fontFamily: T.fontBody }}>
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
            {order.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: rowBg, borderRadius: T.r.sm, padding: '10px 14px', border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: T.r.sm, background: `${T.violet.d}18`, border: `1px solid ${T.violet.d}33`, color: T.violet.d, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{item.garment}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>₹{item.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div style={{ background: rowBg, borderRadius: T.r.md, padding: '12px 14px', border: `1px solid ${T.border}` }}>
            <span style={secLabel}>Notes</span>
            <p style={{ margin: 0, fontSize: 13, color: T.text2, lineHeight: 1.6, fontStyle: 'italic' }}>{order.notes}</p>
          </div>
        )}

        {/* Payment */}
        <div style={{ background: rowBg, borderRadius: T.r.md, padding: '12px 14px', border: `1px solid ${T.border}` }}>
          <span style={secLabel}>Payment</span>
          <Row label="Total Amount" value={`₹${order.totalAmount.toLocaleString('en-IN')}`} />
          {divider}
          <Row label="Amount Paid"  value={`₹${order.paidAmount.toLocaleString('en-IN')}`}  valueColor={T.success.text} />
          {divider}
          <Row label="Balance Due"  value={`₹${order.balanceAmount.toLocaleString('en-IN')}`} valueColor={order.balanceAmount > 0 ? T.danger.text : T.success.text} />
          <div style={{ height: 1, background: T.border, margin: '8px 0' }} />
          {order.materialCost > 0 && (
            <>
              <Row label="Material Cost" value={`₹${order.materialCost.toLocaleString('en-IN')}`} valueColor={T.muted} />
              {divider}
            </>
          )}
          <Row label="Profit" value={`₹${profit.toLocaleString('en-IN')}`} valueColor={profit >= 0 ? T.success.text : T.danger.text} />
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
    </Drawer>
  );
}

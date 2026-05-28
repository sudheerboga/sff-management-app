import { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Order } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import WhatsAppBillModal from './WhatsAppBillModal';

interface Props {
  order: Order;
  onClick: () => void;
  onStatusChange: (status: Order['status']) => void;
  onDelete: () => void;
  onEdit: () => void;
}

const AVATAR_PALETTES: { bg: string; color: string }[] = [
  { bg: '#EDE7F6', color: '#5E35B1' },
  { bg: '#FFF3E0', color: '#E65100' },
  { bg: '#E0F2F1', color: '#00695C' },
  { bg: '#FCE4EC', color: '#C2185B' },
  { bg: '#E3F2FD', color: '#1565C0' },
  { bg: '#F1F8E9', color: '#33691E' },
  { bg: '#F3E5F5', color: '#6A1B9A' },
  { bg: '#FBE9E7', color: '#BF360C' },
  { bg: '#E0F7FA', color: '#006064' },
  { bg: '#E8EAF6', color: '#283593' },
];

function namePalette(name: string) {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
}

function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const { bg, color } = namePalette(name);
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: size * 0.34, fontWeight: 800, color }}>{initials}</span>
    </div>
  );
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'in-progress': { bg: 'rgb(255 193 88 / 15%)', color: 'rgb(173 131 54)' },
  delivered:     { bg: 'rgba(46,125,50,.12)',  color: '#2E7D32' },
};

const STATUS_LABELS: Record<string, string> = {
  'in-progress': 'In Progress', delivered: 'Delivered',
};

export default function OrderCard({ order, onClick }: Props) {
  const { T } = useAppTheme();

  const [bill,    setBill]    = useState(false);
  const [pressed, setPressed] = useState(false);

  const deliveryDate = order.deliveryDate;
  const isOverdue  = deliveryDate && isPast(deliveryDate) && order.status !== 'delivered';
  const isDueToday = deliveryDate && isToday(deliveryDate);

  const cardBg     = T.isDark ? 'rgba(26,21,48,0.8)' : T.card;
  const cardBorder = isOverdue ? 'rgba(211,47,47,.3)' : (T.isDark ? 'rgba(155,127,212,0.15)' : T.border);
  const sc         = STATUS_COLORS[order.status] || STATUS_COLORS['in-progress'];

  return (
    <>
      <div
          style={{
            background: cardBg,
            // border: `1.5px solid ${cardBorder}`,
            borderRadius: T.r.lg,
            fontFamily: T.fontBody,
            cursor: 'pointer',
            marginBottom: 10,
            boxShadow: T.isDark ? '0 4px 24px rgba(0,0,0,.35)' : T.sh.card,
            scale: pressed ? '0.982' : '1',
            transition: 'scale .15s ease',
          }}
          onClick={onClick}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
        >
          {/* ── Main body ── */}
          <div style={{ padding: '14px 16px 12px' }}>

            {/* Row 1: Avatar + Name + Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Avatar name={order.memberName || order.customerName} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.25 }}>
                  {order.memberName && order.memberName !== order.customerName ? order.memberName : order.customerName}
                </div>

                {/* Parent / account-holder name — shown when order is for a family member */}
                {order.memberName && order.memberName !== order.customerName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: T.muted, flexShrink: 0 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                    <span style={{ fontSize: 12, color: T.text2, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.customerName}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', background: T.grad.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    #{order.orderNumber}
                  </span>
                  {order.customerPhone && (
                    <>
                      <span style={{ fontSize: 10, color: T.border }}>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: T.muted, flexShrink: 0 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                        <span style={{ fontSize: 11, color: T.muted }}>{order.customerPhone}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ background: sc.bg, borderRadius: T.r.pill, padding: '4px 10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: sc.color }}>{STATUS_LABELS[order.status] || 'In Progress'}</span>
              </div>
            </div>

            {/* Row 2: Garment chips */}
            {/* {order.items.length > 0 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                {order.items.slice(0, 3).map((item, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 600, background: T.isDark ? 'rgba(155,127,212,0.1)' : T.violet.pale, color: T.violet.d, padding: '3px 9px', borderRadius: T.r.sm, border: `1px solid ${T.violet.d}22` }}>
                    {item.garment}{item.qty > 1 ? ` ×${item.qty}` : ''}
                  </span>
                ))}
                {order.items.length > 3 && (
                  <span style={{ fontSize: 11, color: T.muted, padding: '3px 6px', fontWeight: 500 }}>+{order.items.length - 3} more</span>
                )}
              </div>
            )} */}

            {/* Row 3: Amount + Balance */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '.5rem' }}>
              <span style={{ fontSize: 20, fontWeight: 800, background: T.grad.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-.01em', lineHeight: 1 }}>
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
              {order.balanceAmount > 0 ? (
                <span style={{ fontSize: 11, fontWeight: 700, color: T.danger.text, background: T.danger.bg, padding: '3px 9px', borderRadius: T.r.pill, border: `1px solid ${T.danger.border}` }}>
                  ₹{order.balanceAmount.toLocaleString('en-IN')} due
                </span>
              ) : (
                <span style={{ fontSize: 11, fontWeight: 600, color: T.success.text, background: T.success.bg, padding: '3px 9px', borderRadius: T.r.pill }}>
                  Paid ✓
                </span>
              )}
            </div>
          </div>

          {/* ── Footer bar ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderTop: `1px solid ${T.border}`, background: T.isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: '0 0 18px 18px' }}>
            {/* Delivery date */}
            <div style={{ fontSize: 11, fontWeight: 600, color: isOverdue ? T.danger.text : isDueToday ? T.warning.text : T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {deliveryDate
                ? (isOverdue ? 'Overdue · ' : isDueToday ? 'Due today · ' : '') + format(deliveryDate, 'd MMM yyyy')
                : <span style={{ color: T.muted, fontWeight: 400 }}>No delivery date</span>
              }
            </div>

            {/* WhatsApp bill button */}
            <button
              onClick={e => { e.stopPropagation(); setBill(true); }}
              style={{ background: 'linear-gradient(135deg, rgb(37, 211, 102), rgb(18, 140, 126))', border: 'none', borderRadius: T.r.sm, padding: '5px 11px', fontSize: 11, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: T.fontBody, boxShadow: 'rgba(37, 211, 102, 0.25) 0px 4px 14px' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.134.558 4.136 1.535 5.875L0 24l6.306-1.504A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.814 9.814 0 01-4.964-1.346l-.356-.212-3.741.892.945-3.617-.232-.373A9.79 9.79 0 012.182 12c0-5.421 4.397-9.818 9.818-9.818s9.818 4.397 9.818 9.818-4.397 9.818-9.818 9.818z"/></svg>
              Bill
            </button>
          </div>
        </div>

      {bill && <WhatsAppBillModal order={order} onClose={() => setBill(false)} />}
    </>
  );
}

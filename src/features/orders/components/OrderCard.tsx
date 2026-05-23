import { useState, useRef } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { Order } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import WhatsAppBillModal from './WhatsAppBillModal';

const DELETE_WIDTH   = 80;
const SNAP_THRESHOLD = DELETE_WIDTH * 0.45;

interface Props {
  order: Order;
  onClick: () => void;
  onStatusChange: (status: Order['status']) => void;
  onDelete: () => void;
  onEdit: () => void;
}

function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#4A6FD4 0%,#7B5EA7 40%,#C96B9A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: size * 0.34, fontWeight: 700, color: '#fff' }}>{initials}</span>
    </div>
  );
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:     { bg: 'rgba(230,81,0,.12)',    color: '#E65100' },
  'in-progress':{ bg: 'rgba(74,111,212,.12)', color: '#4A6FD4' },
  ready:       { bg: 'rgba(46,125,50,.12)',   color: '#2E7D32' },
  delivered:   { bg: 'rgba(46,125,50,.12)',   color: '#2E7D32' },
  cancelled:   { bg: 'rgba(0,0,0,.08)',       color: '#888' },
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', 'in-progress': 'In Progress', ready: 'Ready', delivered: 'Delivered', cancelled: 'Cancelled',
};

export default function OrderCard({ order, onClick, onDelete }: Props) {
  const { T } = useAppTheme();
  const user   = useAuthStore((s) => s.user);
  const isStaff = user?.role === 'staff';

  const [bill,    setBill]    = useState(false);
  const [pressed, setPressed] = useState(false);
  const [swipeX,  setSwipeX]  = useState(0);
  const [swiping, setSwiping] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHoriz     = useRef(false);

  const deliveryDate = order.deliveryDate;
  const isOverdue = deliveryDate && isPast(deliveryDate) && order.status !== 'delivered' && order.status !== 'cancelled';
  const isDueToday = deliveryDate && isToday(deliveryDate);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHoriz.current = false;
    setSwiping(false);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (!isHoriz.current && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
    if (!isHoriz.current) isHoriz.current = Math.abs(dx) > Math.abs(dy);
    if (!isHoriz.current) return;
    e.preventDefault();
    setSwiping(true);
    const base  = swipeX;
    let next    = base + dx;
    next = Math.min(0, Math.max(-DELETE_WIDTH, next));
    setSwipeX(next);
  }

  function onTouchEnd() {
    touchStartX.current = null;
    setSwiping(false);
    setSwipeX(swipeX < -SNAP_THRESHOLD ? -DELETE_WIDTH : 0);
  }

  function handleCardClick() {
    if (swipeX !== 0) { setSwipeX(0); return; }
    onClick();
  }

  const cardBg     = T.isDark ? 'rgba(26,21,48,0.8)' : T.card;
  const cardBorder = isOverdue ? 'rgba(211,47,47,.3)' : (T.isDark ? 'rgba(155,127,212,0.15)' : T.border);
  const isOpen     = swipeX < -SNAP_THRESHOLD * 0.5;
  const sc         = STATUS_COLORS[order.status] || STATUS_COLORS.pending;

  return (
    <>
      <div style={{ position: 'relative', marginBottom: 10, borderRadius: T.r.lg, overflow: 'hidden' }}>
        {/* Delete panel */}
        {!isStaff && (
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, background: 'linear-gradient(135deg,#ff7979,#ff4545)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3, borderRadius: T.r.lg, boxShadow: isOpen ? 'inset 2px 0 12px rgba(0,0,0,.15)' : 'none' }}>
            <button
              onClick={e => { e.stopPropagation(); onDelete(); setSwipeX(0); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 12px'}}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '.04em' }}>Delete</span>
            </button>
          </div>
        )}

        {/* Card */}
        <div
          style={{
            background: cardBg,
            border: `1px solid rgba(0, 0, 0, 0.08)`,
            borderRadius: T.r.lg,
            padding: '16px',
            fontFamily: T.fontBody,
            cursor: 'pointer',
            backdropFilter: T.isDark ? 'blur(12px)' : 'none',
            boxShadow: T.isDark ? '0 4px 24px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.05)' : T.sh.card,
            transform: `translateX(${swipeX}px)`,
            transition: swiping ? 'none' : 'transform .28s cubic-bezier(.4,0,.2,1)',
            position: 'relative',
            overflow: 'hidden',
            willChange: 'transform',
            scale: pressed && swipeX === 0 ? '0.982' : '1',
          }}
          onClick={handleCardClick}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Card subtle gradient overlay */}
          {/* <div style={{ position: 'absolute', inset: 0, background: T.grad.card, pointerEvents: 'none', borderRadius: 'inherit' }} /> */}
          {/* Left accent bar */}
          {/* <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3, borderRadius: '0 3px 3px 0', background: isOverdue ? 'linear-gradient(#c62828,#e53935)' : T.grad.brand, opacity: .8 }} /> */}

          {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, position: 'relative', paddingLeft: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
              <Avatar name={order.customerName} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.customerName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', background: T.grad.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>#{order.orderNumber}</span>
                  {order.customerPhone && <span style={{ fontSize: 11, color: T.muted }}>· {order.customerPhone}</span>}
                </div>
              </div>
            </div>
            <div style={{ background: sc.bg, borderRadius: T.r.pill, padding: '3px 9px', flexShrink: 0, display: 'flex' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: sc.color }}>{STATUS_LABELS[order.status]}</span>
            </div>
          </div>

          {/* Item chips */}
          {/* {order.items.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10, paddingLeft: 8 }}>
              {order.items.slice(0, 3).map((item, i) => (
                <span key={i} style={{ fontSize: 11, background: 'rgba(123,94,167,.08)', color: T.violet.d, padding: '2px 8px', borderRadius: T.r.sm, border: `1px solid ${T.isDark ? 'rgba(155,127,212,0.2)' : T.violet.d + '22'}` }}>{item.garment}</span>
              ))}
              {order.items.length > 3 && (
                <span style={{ fontSize: 11, color: T.muted, padding: '2px 6px' }}>+{order.items.length - 3}</span>
              )}
            </div>
          )} */}

          {/* Bottom: amount + delivery */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 8, position: 'relative' }}>
            <div>
              <span style={{ fontSize: 18, fontWeight: 800, background: T.grad.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-.01em' }}>
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
              {order.balanceAmount > 0 && (
                <span style={{ marginLeft: 7, fontSize: 10, color: T.danger.text, background: T.danger.bg, padding: '3px 8px', borderRadius: T.r.pill, fontWeight: 700, border: `1px solid ${T.danger.border}` }}>
                  ₹{order.balanceAmount.toLocaleString('en-IN')} due
                </span>
              )}
            </div>
          </div>
          {deliveryDate && (
              <div style={{ padding: '8px 8px 0 8px', opacity: 1, fontSize: 11, color: isOverdue ? 'rgba(26, 22, 37, 0.45)' : isDueToday ? T.warning.text : T.muted }}>
                🗓 {isOverdue ? 'Overdue ' : isDueToday ? 'Today ' : ''}{format(deliveryDate, 'd MMM')}
              </div>
            )}

          {/* WhatsApp Bill button — absolute bottom-right */}
          <button
            onClick={e => { e.stopPropagation(); setBill(true); }}
            style={{ background: 'linear-gradient(135deg,#25D366,#128C7E)', border: 'none', borderRadius: T.r.md, padding: '7px 13px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: T.fontBody, boxShadow: '0 4px 14px rgba(37,211,102,.25)', position: 'absolute', right: 16, bottom: 16 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.535 5.857L.057 23.428a.75.75 0 00.916.916l5.571-1.478A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.951 9.951 0 01-5.187-1.453l-.371-.22-3.307.877.877-3.307-.22-.371A9.951 9.951 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Bill
          </button>
        </div>
      </div>

      {bill && <WhatsAppBillModal order={order} onClose={() => setBill(false)} />}
    </>
  );
}

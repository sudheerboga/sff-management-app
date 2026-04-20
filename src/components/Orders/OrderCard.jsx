import React, { useState } from 'react';
import { Avatar, StatusBadge } from '../shared';
import WhatsAppBillModal from '../WhatsApp/WhatsAppBillModal';
import { useTheme } from '../../context/ThemeContext';

export default function OrderCard({ order, onClick }) {
  const { theme: T } = useTheme();
  const [bill, setBill] = useState(false);
  const [pressed, setPressed] = useState(false);
  const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  const cardBg = T.isDark ? 'rgba(26,21,48,0.8)' : T.card;
  const cardBorder = T.isDark ? 'rgba(155,127,212,0.15)' : T.border;

  return (
    <>
      <div style={{
        background: cardBg, border: `1px solid ${cardBorder}`,
        borderRadius: T.r.lg, padding: '16px 16px', marginBottom: 10,
        fontFamily: T.fontBody, cursor: 'pointer',
        backdropFilter: T.isDark ? 'blur(12px)' : 'none',
        boxShadow: T.isDark ? '0 4px 24px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.05)' : T.sh.card,
        transition: 'all .2s cubic-bezier(.4,0,.2,1)',
        transform: pressed ? 'scale(.982)' : 'scale(1)',
        position: 'relative', overflow: 'hidden',
      }}
        onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
        onTouchStart={() => setPressed(true)} onTouchEnd={() => setPressed(false)}
      >
        <div style={{ position: 'absolute', inset: 0, background: T.grad.card, pointerEvents: 'none', borderRadius: 'inherit' }} />
        <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 0, borderRadius: '0 2px 2px 0', background: T.grad.brand, opacity: .7 }} />

        {/* SFF ID badge */}
        {/* {order.sffId && (
          <div style={{ position:'absolute', top:10, right:12, fontSize:9, fontFamily:'monospace', fontWeight:700,
            color:T.muted, letterSpacing:'.04em' }}>{order.sffId}</div>
        )} */}

        {/* Top row */}
        <div onClick={() => onClick(order)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 11, position: 'relative', paddingRight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={order.name} size={38} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-.01em' }}>{order.name}</div>
              {order.sffId && (
                <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>
                  {order.sffId}
                </div>
              )}
              {/* {order.mobile && (
                <div style={{ fontSize:11, color:T.muted, marginTop:1 }}>
                  📱 +91 {order.mobile}
                </div>
              )} */}
              {/* {order.mobile && <div style={{ fontSize:10, color:T.muted }}>{order.date}</div>} */}
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Items */}
        <div onClick={() => onClick(order)} style={{
          fontSize: 13, color: T.text2, lineHeight: 1.65, marginBottom: 13, paddingLeft: 12,
          borderLeft: `1.5px solid`,
          borderImage: 'linear-gradient(178deg, rgb(201 107 154 / 37%), rgb(123 94 167 / 25%)) 1 / 1 / 0 stretch',
          borderImageSlice: 1, fontStyle: 'italic', position: 'relative'
        }}>
          {order.items}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <div onClick={() => onClick(order)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 800, background: T.grad.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-.01em' }}>
              {fmt(order.total)}
            </span>
            {order.balance > 0 && (
              <span style={{ fontSize: 10, color: T.danger.text, background: T.danger.bg, padding: '3px 8px', borderRadius: T.r.pill, fontWeight: 700, border: `1px solid ${T.danger.border}` }}>
                {fmt(order.balance)} due
              </span>
            )}
          </div>
          <button onClick={e => { e.stopPropagation(); setBill(true); }} style={{
            background: 'linear-gradient(135deg,#25D366,#128C7E)', border: 'none', borderRadius: T.r.md,
            padding: '7px 13px', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5, fontFamily: T.fontBody,
            boxShadow: '0 4px 14px rgba(37,211,102,.25)',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.535 5.857L.057 23.428a.75.75 0 00.916.916l5.571-1.478A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.951 9.951 0 01-5.187-1.453l-.371-.22-3.307.877.877-3.307-.22-.371A9.951 9.951 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Bill
          </button>
        </div>

        {order.ddate && (
          <div style={{ marginTop: 9, fontSize: 11, color: T.muted, position: 'relative' }}>
            🗓 Delivery: <span style={{ color: T.text2 }}>{order.ddate}</span>
          </div>
        )}
      </div>

      {bill && <WhatsAppBillModal order={order} onClose={() => setBill(false)} />}
    </>
  );
}

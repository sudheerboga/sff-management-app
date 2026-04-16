import React, { useState } from 'react';
import { Avatar, StatusBadge } from '../shared';
import WhatsAppBillModal from '../WhatsApp/WhatsAppBillModal';
import { T } from '../../styles/theme';

export default function OrderCard({ order, onClick }) {
  const [bill, setBill] = useState(false);
  const [pressed, setPressed] = useState(false);
  const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return (
    <>
      <div
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: T.r.lg,
          padding: '15px 16px',
          marginBottom: 10,
          fontFamily: T.fontBody,
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgb(201 107 154 / 26%), 0px 0px 8px rgb(123 94 167 / 24%)',
          transition: 'all .2s cubic-bezier(.4,0,.2,1)',
          transform: pressed ? 'scale(.985)' : 'scale(1)',
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
      >
        {/* Top row */}
        <div onClick={() => onClick(order)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={order.name} size={38} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, letterSpacing: '-.01em' }}>{order.name}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{order.date}</div>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Items */}
        <div onClick={() => onClick(order)} style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, marginBottom: 12, paddingLeft: 11, borderLeft: `2.5px solid ${T.rose.l}`, fontStyle: 'italic' }}>
          {order.items}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => onClick(order)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 800, background: T.grad.brand, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {fmt(order.total)}
            </span>
            <div style={{ display: 'flex', gap: 5 }}>
              {order.balance > 0 && (
                <span style={{ fontSize: 10, color: T.danger.text, background: T.danger.bg, padding: '3px 8px', borderRadius: T.r.pill, fontWeight: 700, border: `1px solid ${T.danger.border}` }}>
                  {fmt(order.balance)} due
                </span>
              )}
              {/* {order.profit > 0 && (
                <span style={{ fontSize:10, color:T.success.text, background:T.success.bg, padding:'3px 8px', borderRadius:T.r.pill, fontWeight:700, border:`1px solid ${T.success.border}` }}>
                  +{fmt(order.profit)}
                </span>
              )} */}
            </div>
          </div>

          {/* WhatsApp bill button */}
          <button
            onClick={e => { e.stopPropagation(); setBill(true); }}
            style={{
              background: 'linear-gradient(135deg,#25D366,#128C7E)',
              border: 'none', borderRadius: T.r.md,
              padding: '7px 13px', fontSize: 12, fontWeight: 700,
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: T.fontBody,
              boxShadow: '0 4px 12px rgba(37,211,102,.3)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.535 5.857L.057 23.428a.75.75 0 00.916.916l5.571-1.478A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.951 9.951 0 01-5.187-1.453l-.371-.22-3.307.877.877-3.307-.22-.371A9.951 9.951 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Bill

          </button>
        </div>

        {order.ddate && (
          <div style={{ marginTop: 8, fontSize: 11, color: T.muted }}>Delivery: {order.ddate}</div>
        )}
      </div>

      {bill && <WhatsAppBillModal order={order} onClose={() => setBill(false)} />}
    </>
  );
}

import React, { useState } from 'react';
import { Avatar, StatusBadge } from '../shared';
import WhatsAppBillModal from '../WhatsApp/WhatsAppBillModal';
import { T } from '../../styles/theme';

export default function OrderCard({ order, onClick }) {
  const [bill, setBill] = useState(false);
  const [pressed, setPressed] = useState(false);
  const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`;

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
          boxShadow: T.sh.card,
          transition: 'all .2s cubic-bezier(.4,0,.2,1)',
          transform: pressed ? 'scale(.985)' : 'scale(1)',
        }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
      >
        {/* Top row */}
        <div onClick={() => onClick(order)} style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Avatar name={order.name} size={38} />
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:T.text, letterSpacing:'-.01em' }}>{order.name}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:1 }}>{order.date}</div>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Items */}
        <div onClick={() => onClick(order)} style={{ fontSize:13, color:T.text2, lineHeight:1.6, marginBottom:12, paddingLeft:11, borderLeft:`2.5px solid ${T.rose.l}`, fontStyle:'italic' }}>
          {order.items}
        </div>

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div onClick={() => onClick(order)} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:17, fontWeight:800, background:T.grad.brand, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              {fmt(order.total)}
            </span>
            <div style={{ display:'flex', gap:5 }}>
              {order.balance > 0 && (
                <span style={{ fontSize:10, color:T.danger.text, background:T.danger.bg, padding:'3px 8px', borderRadius:T.r.pill, fontWeight:700, border:`1px solid ${T.danger.border}` }}>
                  {fmt(order.balance)} due
                </span>
              )}
              {order.profit > 0 && (
                <span style={{ fontSize:10, color:T.success.text, background:T.success.bg, padding:'3px 8px', borderRadius:T.r.pill, fontWeight:700, border:`1px solid ${T.success.border}` }}>
                  +{fmt(order.profit)}
                </span>
              )}
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
            💬 Bill
          </button>
        </div>

        {order.ddate && (
          <div style={{ marginTop:8, fontSize:11, color:T.muted }}>Delivery: {order.ddate}</div>
        )}
      </div>

      {bill && <WhatsAppBillModal order={order} onClose={() => setBill(false)} />}
    </>
  );
}

import React, { useState } from 'react';
import { generateBillMessage, shareOnWhatsApp } from '../../utils/whatsapp';
import { T } from '../../styles/theme';
import { PrimaryButton } from '../shared';

export default function WhatsAppBillModal({ order, onClose }) {
  const [phone,setPhone]   = useState('');
  const [copied,setCopied] = useState(false);
  const message = generateBillMessage(order);

  function handleShare() { shareOnWhatsApp(order, phone.replace(/\D/g,'')); }
  function handleCopy() { navigator.clipboard.writeText(message).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); }); }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(26,22,37,.6)', zIndex:200, display:'flex', alignItems:'flex-end' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="scale-in" style={{ background:T.bg, borderRadius:`${T.r.xxl}px ${T.r.xxl}px 0 0`, width:'100%', maxHeight:'88vh', overflowY:'auto', padding:'22px 20px 48px', fontFamily:T.fontBody }}>
        <div style={{ width:40, height:4, background:T.border, borderRadius:T.r.pill, margin:'0 auto 20px' }} />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:T.r.md, background:'linear-gradient(135deg,#25D366,#128C7E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 4px 12px rgba(37,211,102,.3)' }}>💬</div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:T.text }}>WhatsApp Bill</div>
              <div style={{ fontSize:11, color:T.muted }}>for {order.name}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:T.muted }}>×</button>
        </div>

        {/* Preview */}
        <div style={{ background:'#e8f5e2', borderRadius:T.r.lg, padding:16, marginBottom:14, fontFamily:"'Courier New',monospace", fontSize:12.5, lineHeight:1.9, color:T.text, whiteSpace:'pre-wrap', border:'1px solid #c8e6c0' }}>
          {message}
        </div>

        {/* Phone input */}
        <div style={{ background:T.card, borderRadius:T.r.lg, padding:14, marginBottom:12, border:`1px solid ${T.border}`, boxShadow:T.sh.xs }}>
          <label style={{ fontSize:11, fontWeight:700, color:T.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.07em' }}>Customer Phone (optional)</label>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:14, fontWeight:700, color:T.text2 }}>+91</span>
            <input type="tel" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="98765 43210" maxLength={10}
              style={{ flex:1, padding:'11px 14px', border:`1.5px solid ${T.border}`, borderRadius:T.r.md, fontSize:15, letterSpacing:1, fontFamily:T.fontBody, background:T.bg, color:T.text, outline:'none' }} />
          </div>
        </div>

        {/* Actions */}
        <button onClick={handleShare} style={{ width:'100%', padding:14, background:'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff', border:'none', borderRadius:T.r.md, fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:10, fontFamily:T.fontBody, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 6px 20px rgba(37,211,102,.3)' }}>
          💬 Send on WhatsApp
        </button>
        <button onClick={handleCopy} style={{ width:'100%', padding:13, background:T.card, color:copied?T.success.text:T.violet.d, border:`1.5px solid ${copied?T.success.border:T.violet.l}`, borderRadius:T.r.md, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:T.fontBody, transition:'all .2s' }}>
          {copied?'✓ Copied to clipboard!':'📋 Copy bill text'}
        </button>
      </div>
    </div>
  );
}

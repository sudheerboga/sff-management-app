import React, { useState } from 'react';
import { generateBillMessage, shareOnWhatsApp } from '../../utils/whatsapp';
import { useTheme } from '../../context/ThemeContext';

export default function WhatsAppBillModal({ order, onClose }) {
  const { theme: T } = useTheme();
  // Pre-fill with customer's saved mobile, but keep editable
  const [phone, setPhone] = useState(order.mobile||'');
  const [copied, setCopied] = useState(false);
  const message = generateBillMessage(order);

  function handleShare() { shareOnWhatsApp(order, phone.replace(/\D/g,'')); }
  function handleCopy() {
    navigator.clipboard.writeText(message).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  }

  const sheetBg   = T.isDark ? 'rgba(14,11,26,0.98)' : 'rgba(255,255,255,0.98)';
  const secBorder = T.isDark ? 'rgba(155,127,212,0.2)' : T.border;
  const sectionBg = T.isDark ? 'rgba(26,21,48,0.7)'  : T.bg;

  return (
    <div id='sff-wa-modal-overlay' style={{ position:'fixed', inset:0, background:T.isDark?'rgba(0,0,0,0.8)':'rgba(0,0,0,0.4)', zIndex:200, display:'flex', alignItems:'flex-end', backdropFilter:'blur(8px)' }}
      onClick={e=>{if(e.target===e.currentTarget) onClose();}}>
      <div className="scale-in" style={{
        background:sheetBg, backdropFilter:'blur(30px)',
        borderRadius:`${T.r.xxl}px ${T.r.xxl}px 0 0`,
        width:'100%', maxHeight:'88vh', overflowY:'auto',
        padding:'22px 20px 48px', fontFamily:T.fontBody,
        border:`1px solid ${secBorder}`, borderBottom:'none',
        boxShadow: T.isDark?'0 -20px 60px rgba(0,0,0,.8)':'0 -8px 40px rgba(26,22,37,.15)',
      }}>
        <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:1, background:T.grad.brand, opacity:.5 }} />
        <div style={{ width:36, height:4, background:T.isDark?'rgba(255,255,255,0.15)':T.border, borderRadius:T.r.pill, margin:'0 auto 20px' }} />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:T.r.md, background:'linear-gradient(135deg,#25D366,#128C7E)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 4px 14px rgba(37,211,102,.3)' }}>💬</div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:T.text }}>WhatsApp Bill</div>
              <div style={{ fontSize:11, color:T.muted }}>for {order.name}{order.sffId?` · ${order.sffId}`:''}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:T.isDark?'rgba(255,255,255,0.06)':T.bg2, border:`1px solid ${T.border}`, width:32, height:32, borderRadius:'50%', fontSize:18, cursor:'pointer', color:T.muted, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        {/* Preview */}
        <div style={{ background:T.isDark?'rgba(18,44,25,0.9)':'#e8f5e2', border:`1px solid ${T.isDark?'rgba(37,211,102,0.2)':'#c8e6c0'}`, borderRadius:T.r.lg, padding:16, marginBottom:14, fontFamily:"'Courier New',monospace", fontSize:12.5, lineHeight:1.9, color:T.isDark?'#d4f7dc':'#1a3a1a', whiteSpace:'pre-wrap' }}>
          {message}
        </div>

        {/* Phone — pre-filled from order.mobile, always editable */}
        <div style={{ background:sectionBg, borderRadius:T.r.lg, padding:14, marginBottom:14, border:`1px solid ${secBorder}` }}>
          <label style={{ fontSize:10, fontWeight:700, color:T.isDark?T.gold.d:T.violet.d, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.09em' }}>
            Customer Phone {order.mobile ? '(pre-filled — editable)' : '(optional)'}
          </label>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontSize:14, fontWeight:700, color:T.text2 }}>+91</span>
            <input type="tel" value={phone}
              onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
              placeholder="98765 43210" maxLength={10}
              style={{ flex:1, padding:'11px 14px', border:`1.5px solid ${T.border}`, borderRadius:T.r.md, fontSize:15, letterSpacing:1, fontFamily:T.fontBody, background:T.isDark?'rgba(255,255,255,0.04)':T.bg, color:T.text, outline:'none' }}
              onFocus={e=>e.target.style.borderColor=T.violet.d}
              onBlur={e=>e.target.style.borderColor=T.border}
            />
          </div>
        </div>

        <button onClick={handleShare} style={{ width:'100%', padding:14, background:'linear-gradient(135deg,#25D366,#128C7E)', color:'#fff', border:'none', borderRadius:T.r.md, fontSize:15, fontWeight:700, cursor:'pointer', marginBottom:10, fontFamily:T.fontBody, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 6px 20px rgba(37,211,102,.25)' }}>
          💬 Send on WhatsApp
        </button>
        <button onClick={handleCopy} style={{ width:'100%', padding:13, background:copied?T.success.bg:(T.isDark?'rgba(255,255,255,0.05)':T.bg2), color:copied?T.success.text:T.violet.d, border:`1.5px solid ${copied?T.success.border:T.isDark?'rgba(155,127,212,0.25)':T.violet.d+'44'}`, borderRadius:T.r.md, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:T.fontBody, transition:'all .2s' }}>
          {copied?'✓ Copied to clipboard!':'📋 Copy bill text'}
        </button>
      </div>
    </div>
  );
}

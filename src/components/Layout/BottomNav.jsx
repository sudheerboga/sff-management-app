import React from 'react';
import { T } from '../../styles/theme';

const TABS = [
  { id:'orders',  label:'Orders',  icon: (
    <svg width="28" height="28" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11V8a5 5 0 0110 0v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 11h20l-2 13H6L4 11z" />
      <path strokeLinecap="round" strokeDasharray="2 2" d="M8 17h12" />
    </svg>
  ) },
  { id:'add',     label:'New',     icon: (
    <svg width="28" height="28" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" d="M14 4v20M4 14h20" />
      <path strokeLinecap="round" d="M8.5 8.5l11 11M19.5 8.5l-11 11" opacity={0.4} />
      <circle cx="14" cy="14" r="3" />
    </svg>
  ) },
  { id:'charts',  label:'Reports', icon: (
    <svg width="28" height="28" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12l4 4v16a1 1 0 01-1 1H7a1 1 0 01-1-1V4z" />
      <path strokeLinecap="round" d="M16 4v4h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17l3-3 2.5 2.5L18 13" />
    </svg>
  ) },
  { id:'measure', label:'Sizes',   icon: (
    <svg width="28" height="28" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" d="M3 18 Q8 10 14 14 Q20 18 25 10" />
      <path strokeLinecap="round" d="M6 15.5v2.5" />
      <path strokeLinecap="round" d="M10 13v2" />
      <path strokeLinecap="round" d="M14 14v2.5" />
      <path strokeLinecap="round" d="M18 13v2" />
      <path strokeLinecap="round" d="M22 11.5v2.5" />
      <circle cx="4" cy="20" r="2.5" />
    </svg>
  ) },
];

// Dashboard Icons — Sri Fashion Fusion
// stroke="currentColor" | strokeWidth={1.5} | 28×28 viewBox

const ICONS = {

  // 🛍️ Orders — shopping bag with a stitch seam line
  orders: (
    <svg width="28" height="28" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11V8a5 5 0 0110 0v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 11h20l-2 13H6L4 11z" />
      <path strokeLinecap="round" strokeDasharray="2 2" d="M8 17h12" />
    </svg>
  ),

  // 📊 Reports — scroll/parchment with a mini graph inside
  reports: (
    <svg width="28" height="28" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12l4 4v16a1 1 0 01-1 1H7a1 1 0 01-1-1V4z" />
      <path strokeLinecap="round" d="M16 4v4h4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17l3-3 2.5 2.5L18 13" />
    </svg>
  ),

  // 📏 Sizes — tailor's tape measure curved ribbon
  sizes: (
    <svg width="28" height="28" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" d="M3 18 Q8 10 14 14 Q20 18 25 10" />
      <path strokeLinecap="round" d="M6 15.5v2.5" />
      <path strokeLinecap="round" d="M10 13v2" />
      <path strokeLinecap="round" d="M14 14v2.5" />
      <path strokeLinecap="round" d="M18 13v2" />
      <path strokeLinecap="round" d="M22 11.5v2.5" />
      <circle cx="4" cy="20" r="2.5" />
    </svg>
  ),

  // ✨ New — needle with a plus spark
  new: (
    <svg width="28" height="28" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" d="M14 4v20M4 14h20" />
      <path strokeLinecap="round" d="M8.5 8.5l11 11M19.5 8.5l-11 11" opacity={0.4} />
      <circle cx="14" cy="14" r="3" />
    </svg>
  ),

  // 🔍 Search — magnifier with a needle inside the lens
  search: (
    <svg width="28" height="28" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="7" />
      <path strokeLinecap="round" d="M17.5 17.5L24 24" />
      <path strokeLinecap="round" d="M9 12h6" />
      <ellipse cx="8.5" cy="12" rx="1" ry="0.6" />
      <path strokeLinecap="round" d="M10 12q1.5-2 3 0" opacity={0.6} />
    </svg>
  ),

};

export default function BottomNav({ active, onChange }) {
  return (
    <div style={{
      position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
      width:'100%', maxWidth:430,
      background: 'linear-gradient(230deg, rgb(74 111 212 / 50%) 0%, rgb(123 94 167 / 50%) 40%, rgb(201 107 154 / 50%) 100%)',
      backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      borderTop:`1px solid ${T.border}`,
      display:'flex', zIndex:50,
      paddingBottom:'max(10px, env(safe-area-inset-bottom, 0px))',
      borderRadius: '20px 20px 0px 0px'
    }}>
      {TABS.map(t => {
        const active_ = active === t.id;
        // const isAdd   = t.id === 'add';
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            style={{ flex:1, padding:`10px 4px 12px`, background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, fontFamily:T.fontBody, WebkitTapHighlightColor:'transparent' }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(.92)'}
            onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
            onTouchStart={e=>e.currentTarget.style.transform='scale(.92)'}
            onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}
          >
            
              <div style={{ width:34, height:34, borderRadius:T.r.md, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, background:active_?T.violet.pale:'transparent', transition:'all .2s cubic-bezier(.4,0,.2,1)' }}>{t.icon}</div>
            
            <span style={{ fontSize:9.5, fontWeight:active_?700:500, color:active_?T.violet.d:T.muted, letterSpacing:'.04em', transition:'color .2s' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

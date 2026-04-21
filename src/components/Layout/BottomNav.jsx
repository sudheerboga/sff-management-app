import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const TABS = [
  { id:'orders',  label:'Orders',  icon: <svg width="22" height="22" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M9 11V8a5 5 0 0110 0v3"/><path strokeLinecap="round" strokeLinejoin="round" d="M4 11h20l-2 13H6L4 11z"/><path strokeLinecap="round" strokeDasharray="2 2" d="M8 17h12"/></svg> },
  { id:'add',     label:'New',     icon: <svg width="22" height="22" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" d="M14 4v20M4 14h20"/><circle cx="14" cy="14" r="3"/></svg> },
  { id:'charts',  label:'Reports', icon: <svg width="22" height="22" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h12l4 4v16a1 1 0 01-1 1H7a1 1 0 01-1-1V4z"/><path strokeLinecap="round" d="M16 4v4h4"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 17l3-3 2.5 2.5L18 13"/></svg> },
  { id:'measure', label:'Sizes',   icon: <svg width="22" height="22" fill="none" viewBox="0 0 28 28" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" d="M3 18 Q8 10 14 14 Q20 18 25 10"/><path strokeLinecap="round" d="M6 15.5v2.5M10 13v2M14 14v2.5M18 13v2M22 11.5v2.5"/><circle cx="4" cy="20" r="2.5"/></svg> },
];

export default function BottomNav({ active, onChange }) {
  const { theme: T, isDark } = useTheme();
  return (
    <div id="sff-bottom-nav" style={{
      position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:430,
      background:T.navBg, backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
      borderTop:`1px solid ${T.border}`, display:'flex', zIndex:50,
      paddingBottom:'max(10px,env(safe-area-inset-bottom,0px))', borderRadius:'22px 22px 0 0',
      transition:'background .3s',
    }}>
      <div id="sff-nav-accent" style={{ position:'absolute', top:0, left:'10%', right:'10%', height:1,
        background:'linear-gradient(90deg,transparent,rgba(123,94,167,0.5),rgba(201,107,154,0.5),transparent)',
        borderRadius:1, pointerEvents:'none' }} />
      {TABS.map(t => {
        const isActive = active===t.id;
        const isAdd    = t.id==='add';
        return (
          <button
            key={t.id}
            id={`sff-nav-btn-${t.id}`}
            onClick={()=>onChange(t.id)}
            style={{ flex:1, padding:`10px 4px 12px`, background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, fontFamily:T.fontBody, WebkitTapHighlightColor:'transparent', position:'relative' }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(.90)'}
            onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
            onTouchStart={e=>e.currentTarget.style.transform='scale(.90)'}
            onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}
          >
            {isAdd ? (
              <div id="sff-nav-add-circle" style={{ width:34, height:34, borderRadius:'50%', background:isActive?T.grad.gold:T.grad.brand, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:isActive?`0 6px 20px rgba(212,175,111,.4)`:T.sh.brand, transition:'all .2s', color:'#fff' }}>{t.icon}</div>
            ) : (
              <div id={`sff-nav-icon-${t.id}`} style={{ width:40, height:34, borderRadius:T.r.md, display:'flex', alignItems:'center', justifyContent:'center', background:isActive?(isDark?'rgba(123,94,167,0.15)':'rgba(123,94,167,0.1)'):'transparent', color:isActive?T.violet.d:T.muted, transition:'all .2s', position:'relative' }}>
                {isActive && <div style={{ position:'absolute', top:2, left:'50%', transform:'translateX(-50%)', width:16, height:2, borderRadius:1, background:T.grad.brand }} />}
                {t.icon}
              </div>
            )}
            <span id={`sff-nav-label-${t.id}`} style={{ fontSize:9.5, fontWeight:isActive?700:400, color:isAdd?(isActive?T.gold.d:T.muted):(isActive?T.violet.d:T.muted), letterSpacing:'.05em', transition:'color .2s' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

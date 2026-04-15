import React from 'react';
import { T } from '../../styles/theme';

const TABS = [
  { id:'orders',  label:'Orders',  icon:'📋' },
  { id:'add',     label:'New',     icon:'+' },
  { id:'charts',  label:'Reports', icon:'📊' },
  { id:'measure', label:'Sizes',   icon:'📏' },
];

export default function BottomNav({ active, onChange }) {
  return (
    <div style={{
      position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)',
      width:'100%', maxWidth:430,
      background:'rgba(249,245,240,.94)',
      backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      borderTop:`1px solid ${T.border}`,
      display:'flex', zIndex:50,
      paddingBottom:'max(10px, env(safe-area-inset-bottom, 0px))',
    }}>
      {TABS.map(t => {
        const active_ = active === t.id;
        const isAdd   = t.id === 'add';
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            style={{ flex:1, padding:`${isAdd?4:10}px 4px ${isAdd?8:12}px`, background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, fontFamily:T.fontBody, WebkitTapHighlightColor:'transparent' }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(.92)'}
            onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
            onTouchStart={e=>e.currentTarget.style.transform='scale(.92)'}
            onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}
          >
            {isAdd ? (
              <div style={{ width:48, height:48, borderRadius:T.r.lg, background:T.grad.brand, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:300, color:'#fff', boxShadow:T.sh.brand, marginTop:-16, transition:'all .2s cubic-bezier(.4,0,.2,1)', transform:active_?'scale(1.06)':'scale(1)' }}>+</div>
            ) : (
              <div style={{ width:34, height:34, borderRadius:T.r.md, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, background:active_?T.violet.pale:'transparent', transition:'all .2s cubic-bezier(.4,0,.2,1)' }}>{t.icon}</div>
            )}
            <span style={{ fontSize:9.5, fontWeight:active_?700:500, color:active_?T.violet.d:T.muted, letterSpacing:'.04em', transition:'color .2s' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

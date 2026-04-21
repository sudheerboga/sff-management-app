import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function StatsBar({ orders }) {
  const { theme: T } = useTheme();
  const rev  = orders.reduce((s,o)=>s+(o.total||0),0);
  const prof = orders.reduce((s,o)=>s+(o.profit||0),0);
  const bal  = orders.reduce((s,o)=>s+(o.balance||0),0);
  const prog = orders.filter(o=>o.status==='In Progress').length;
  const fmt  = n => `₹${n.toLocaleString('en-IN')}`;

  const stats = [
    { label:'Revenue',     value:fmt(rev),  color:T.isDark?'#9B7FD4':T.violet.d, bg:T.isDark?'linear-gradient(135deg,rgba(155,127,212,0.14),rgba(123,94,167,0.06))':'linear-gradient(135deg,#f3eff9,#eef2fc)', border:T.isDark?'rgba(155,127,212,0.25)':T.violet.d+'33', icon:'💎' },
    { label:'Profit',      value:fmt(prof), color:T.success.text, bg:T.success.bg, border:T.success.border, icon:'✨' },
    { label:'Balance Due', value:fmt(bal),  color:T.danger.text,  bg:T.danger.bg,  border:T.danger.border,  icon:'⏳' },
    { label:'In Progress', value:prog,      color:T.warning.text, bg:T.warning.bg, border:T.warning.border, icon:'🧵' },
  ];

  return (
    <div id='sff-stats-bar' style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
      {stats.map((s,i) => (
        <div key={i} className="scale-in" style={{
          background:s.bg, border:`1px solid ${s.border}`,
          borderRadius:T.r.lg, padding:'16px 15px',
          boxShadow:`${T.sh.xs},inset 0 1px 0 rgba(255,255,255,${T.isDark?.05:.4})`,
          animationDelay:`${i*.06}s`, position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:8, right:10, fontSize:14, opacity:.4 }}>{s.icon}</div>
          <div style={{ fontSize:20, fontWeight:800, fontFamily:T.fontBody, color:s.color, lineHeight:1, letterSpacing:'-.01em' }}>{s.value}</div>
          <div style={{ fontSize:10, color:T.muted, marginTop:6, fontWeight:500, letterSpacing:'.05em', textTransform:'uppercase' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

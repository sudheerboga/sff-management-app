import React from 'react';
import { T } from '../../styles/theme';

export default function StatsBar({ orders }) {
  const rev  = orders.reduce((s,o)=>s+(o.total||0),0);
  const prof = orders.reduce((s,o)=>s+(o.profit||0),0);
  const bal  = orders.reduce((s,o)=>s+(o.balance||0),0);
  const prog = orders.filter(o=>o.status==='In Progress').length;
  const fmt  = n => `₹${n.toLocaleString('en-IN')}`;

  const stats = [
    { label:'Revenue',     value:fmt(rev),  color:T.violet.d,       gradient:`linear-gradient(135deg,${T.violet.pale},${T.rose.pale})` },
    { label:'Profit',      value:fmt(prof), color:T.success.text,   gradient:T.success.bg },
    { label:'Balance Due', value:fmt(bal),  color:T.danger.text,    gradient:T.danger.bg },
    { label:'In Progress', value:prog,      color:T.warning.text,   gradient:T.warning.bg },
  ];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
      {stats.map((s,i) => (
        <div key={i} className="scale-in" style={{ background:s.gradient, border:`1px solid ${T.border}`, borderRadius:T.r.lg, padding:'15px 14px', boxShadow:T.sh.xs, animationDelay:`${i*.06}s` }}>
          <div style={{ fontSize:20, fontWeight:800, fontFamily:T.fontBody, color:s.color, lineHeight:1 }}>{s.value}</div>
          <div style={{ fontSize:11, color:T.muted, marginTop:5, fontWeight:500, letterSpacing:'.04em' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

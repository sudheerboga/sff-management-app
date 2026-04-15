import React, { useState } from 'react';
import { T, inputBase, primaryBtnStyle } from '../../styles/theme';

// ── Logo ──────────────────────────────────────────────────────────────────────
export function Logo({ size=44, showText=false, textSize=15, light=false }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:size, height:size, borderRadius:size*.28, overflow:'hidden', flexShrink:0, boxShadow:T.sh.violet, background:T.grad.soft }}>
        {err
          ? <div style={{ width:'100%', height:'100%', background:T.grad.brand, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.5, color:'#fff', fontFamily:T.fontDisplay, fontWeight:700 }}>S</div>
          : <img src={process.env.PUBLIC_URL+'/logo.JPG'} alt="Sri Fashion" onError={()=>setErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        }
      </div>
      {showText && (
        <div>
          <div style={{ fontFamily:T.fontDisplay, fontSize:textSize, fontWeight:600, color: light ? '#fff' : T.text, lineHeight:1.15, letterSpacing:'-.02em' }}>Sri Fashion</div>
          <div style={{ fontFamily:T.fontBody, fontSize:textSize*.64, color: light ? 'rgba(255,255,255,.55)' : T.muted, letterSpacing:'.08em', textTransform:'uppercase' }}>Fusion</div>
        </div>
      )}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name='', size=40 }) {
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:T.grad.brand, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.35, fontWeight:700, color:'#fff', flexShrink:0, userSelect:'none', fontFamily:T.fontBody, boxShadow:T.sh.violet }}>
      {initials}
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
const BADGE = { 'Delivered':T.success, 'In Progress':T.warning, 'Pending':T.danger };
export function StatusBadge({ status }) {
  const s = BADGE[status]||T.danger;
  return <span style={{ fontSize:11, padding:'4px 10px', borderRadius:T.r.pill, fontWeight:700, fontFamily:T.fontBody, background:s.bg, color:s.text, border:`1px solid ${s.border}`, whiteSpace:'nowrap', letterSpacing:'.03em' }}>{status}</span>;
}

// ── Spinner ────────────────────────────────────────────────────────────────────
export function Spinner({ size=22 }) {
  return <div style={{ width:size, height:size, borderRadius:'50%', border:`2.5px solid ${T.violet.pale}`, borderTopColor:T.violet.d, animation:'spin .8s linear infinite', display:'inline-block' }} />;
}

// ── LoadingDots ───────────────────────────────────────────────────────────────
export function LoadingDots() {
  return (
    <div style={{ display:'flex', gap:6, alignItems:'center', justifyContent:'center', padding:'48px 0' }}>
      {[0,1,2].map(i=><div key={i} style={{ width:9, height:9, borderRadius:'50%', background:T.grad.brand, animation:`dotPulse 1.4s ease-in-out ${i*.16}s infinite` }} />)}
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
export function Toast({ message, visible, type='success' }) {
  if (!visible) return null;
  return (
    <div className="fade-up" style={{ position:'fixed', bottom:96, left:'50%', transform:'translateX(-50%)', background: type==='error' ? T.danger.bg : T.grad.brand, color: type==='error' ? T.danger.text : '#fff', padding:'11px 22px', borderRadius:T.r.pill, fontSize:13, fontWeight:600, fontFamily:T.fontBody, zIndex:999, whiteSpace:'nowrap', boxShadow:T.sh.brand, letterSpacing:'.02em' }}>
      {type==='success'?'✓ ':'⚠ '}{message}
    </div>
  );
}

// ── PrimaryButton ─────────────────────────────────────────────────────────────
export function PrimaryButton({ children, onClick, disabled, loading, style:s={}, small }) {
  const [pr, setPr] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled||loading}
      onMouseDown={()=>setPr(true)} onMouseUp={()=>setPr(false)}
      onTouchStart={()=>setPr(true)} onTouchEnd={()=>setPr(false)}
      style={{ ...primaryBtnStyle(disabled||loading), ...(small?{padding:'9px 18px',fontSize:13,width:'auto'}:{}), transform:pr?'scale(.97)':'scale(1)', ...s }}>
      {loading ? <Spinner size={18}/> : children}
    </button>
  );
}

// ── GhostButton ───────────────────────────────────────────────────────────────
export function GhostButton({ children, onClick, style:s={} }) {
  const [pr,setPr]=useState(false);
  return (
    <button onClick={onClick} onMouseDown={()=>setPr(true)} onMouseUp={()=>setPr(false)} onTouchStart={()=>setPr(true)} onTouchEnd={()=>setPr(false)}
      style={{ background:'none', border:`1.5px solid ${T.border}`, borderRadius:T.r.md, padding:'11px 20px', fontSize:14, fontFamily:T.fontBody, fontWeight:500, color:T.violet.d, cursor:'pointer', transition:'all .18s', transform:pr?'scale(.97)':'scale(1)', ...s }}>
      {children}
    </button>
  );
}

// ── FocusInput ─────────────────────────────────────────────────────────────────
export function FocusInput({ label, value, onChange, type='text', placeholder='', rows, required, prefix, suffix }) {
  const [f,setF] = useState(false);
  const lbl = <label style={{ fontSize:11, fontWeight:700, color:f?T.violet.d:T.muted, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.07em', fontFamily:T.fontBody, transition:'color .2s' }}>{label}{required&&<span style={{color:T.rose.d,marginLeft:2}}>*</span>}</label>;
  const inp = rows
    ? <textarea rows={rows} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{...inputBase(f),resize:'vertical',lineHeight:1.6}} />
    : (
      <div style={{position:'relative',display:'flex',alignItems:'center'}}>
        {prefix&&<span style={{position:'absolute',left:14,color:T.muted,fontSize:14,fontWeight:500,pointerEvents:'none'}}>{prefix}</span>}
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{...inputBase(f),paddingLeft:prefix?36:16,paddingRight:suffix?48:16}} />
        {suffix&&<span style={{position:'absolute',right:14,color:T.muted,fontSize:13,pointerEvents:'none'}}>{suffix}</span>}
      </div>
    );
  return <div style={{marginBottom:14}}>{lbl}{inp}</div>;
}

// ── SelectInput ───────────────────────────────────────────────────────────────
export function SelectInput({ label, value, onChange, options }) {
  const [f,setF]=useState(false);
  return (
    <div style={{marginBottom:14}}>
      <label style={{fontSize:11,fontWeight:700,color:f?T.violet.d:T.muted,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'.07em',fontFamily:T.fontBody,transition:'color .2s'}}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{...inputBase(f),appearance:'none',cursor:'pointer'}}>
        {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}

// ── SectionCard ───────────────────────────────────────────────────────────────
export function SectionCard({ title, children, style:s={} }) {
  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:T.r.lg, padding:T.sp.xl, boxShadow:T.sh.card, marginBottom:12, ...s }}>
      {title&&<div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:16,fontFamily:T.fontBody}}>{title}</div>}
      {children}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color, accent }) {
  return (
    <div className="scale-in" style={{ background: accent ? T.grad.card : T.card, border:`1px solid ${T.border}`, borderRadius:T.r.lg, padding:'15px 14px', boxShadow:T.sh.card }}>
      <div style={{fontSize:20,fontWeight:800,fontFamily:T.fontBody,color:color||T.text,lineHeight:1.1}}>{value}</div>
      <div style={{fontSize:11,color:T.muted,marginTop:5,fontWeight:500,letterSpacing:'.04em'}}>{label}</div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }) {
  return (
    <div className="fade-in" style={{textAlign:'center',padding:'52px 24px',color:T.muted}}>
      <div style={{fontSize:52,marginBottom:16,opacity:.4}}>{icon||'🪡'}</div>
      <div style={{fontSize:16,fontWeight:600,color:T.text2,marginBottom:6,fontFamily:T.fontDisplay}}>{title}</div>
      {sub&&<div style={{fontSize:13,color:T.muted,lineHeight:1.6}}>{sub}</div>}
    </div>
  );
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder='Search…' }) {
  const [f,setF]=useState(false);
  return (
    <div style={{position:'relative',marginBottom:14}}>
      <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16,opacity:.35,pointerEvents:'none'}}>🔍</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{...inputBase(f),paddingLeft:42,fontSize:14}} />
    </div>
  );
}

// ── FilterChip ────────────────────────────────────────────────────────────────
export function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:'7px 16px', borderRadius:T.r.pill, fontSize:12, fontWeight:600, border:`1.5px solid ${active?'transparent':T.border}`, background:active?T.grad.brand:T.card, color:active?'#fff':T.text2, cursor:'pointer', whiteSpace:'nowrap', fontFamily:T.fontBody, boxShadow:active?T.sh.brand:T.sh.xs, transition:'all .2s cubic-bezier(.4,0,.2,1)' }}>
      {label}
    </button>
  );
}

// ── SegmentControl ────────────────────────────────────────────────────────────
export function SegmentControl({ options, value, onChange }) {
  return (
    <div style={{display:'flex',background:T.bg2,borderRadius:T.r.lg,padding:4,gap:2}}>
      {options.map(o=>(
        <button key={o.id} onClick={()=>onChange(o.id)} style={{ flex:1, padding:'8px 4px', border:'none', cursor:'pointer', borderRadius:T.r.md, fontSize:12, fontWeight:600, fontFamily:T.fontBody, background:value===o.id?T.card:'transparent', color:value===o.id?T.violet.d:T.muted, boxShadow:value===o.id?T.sh.sm:'none', transition:'all .2s cubic-bezier(.4,0,.2,1)', letterSpacing:'.02em' }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { inputBase as inputBaseFn, primaryBtnStyle as primaryBtnStyleFn } from '../../styles/theme';

function useT() { return useTheme().theme; }

// ── Logo ──────────────────────────────────────────────────────────────────────
export function Logo({ size=44, showText=false, textSize=15 }) {
  const T = useT();
  const [err, setErr] = useState(false);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:size, height:size, borderRadius:size*.28, overflow:'hidden', flexShrink:0,
        boxShadow: T.sh.violet, background: T.isDark?'rgba(255,255,255,0.05)':T.grad.soft }}>
        {err
          ? <div style={{ width:'100%', height:'100%', background:T.grad.brand, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.5, color:'#fff', fontFamily:T.fontDisplay, fontWeight:700 }}>S</div>
          : <img src={process.env.PUBLIC_URL+'/logo.JPG'} alt="Sri Fashion" onError={()=>setErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        }
      </div>
      {showText && (
        <div>
          <div style={{ fontFamily:T.fontDisplay, fontSize:textSize, fontWeight:600, lineHeight:1.15, letterSpacing:'-.02em',
            background:T.grad.brand,
            WebkitBackgroundClip: 'text', WebkitTextFillColor:'transparent'}}>Sri Fashion</div>
          <div style={{ fontFamily:T.fontBody, fontSize:textSize*.62,
            color: T.isDark?'rgba(212,175,111,0.55)':T.muted, letterSpacing:'.1em', textTransform:'uppercase' }}>Fusion</div>
        </div>
      )}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name='', size=40 }) {
  const T = useT();
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?';
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:T.grad.brand,
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.35, fontWeight:700,
      color:'#fff', flexShrink:0, userSelect:'none', fontFamily:T.fontBody, boxShadow:T.sh.violet }}>
      {initials}
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const T = useT();
  const s = T.status?.[status] || T.danger;
  const map = { 'Delivered':T.success, 'In Progress':T.warning, 'Pending':T.danger };
  const badge = map[status] || T.danger;
  return (
    <span style={{ fontSize:11, padding:'4px 10px', borderRadius:T.r.pill, fontWeight:700, fontFamily:T.fontBody,
      background:badge.bg, color:badge.text, border:`1px solid ${badge.border}`, whiteSpace:'nowrap', letterSpacing:'.04em'}}>
      {status}
    </span>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────────
export function Spinner({ size=22 }) {
  const T = useT();
  return <div style={{ width:size, height:size, borderRadius:'50%',
    border:`2.5px solid ${T.violet.pale||T.violet.muted}`, borderTopColor:T.violet.d,
    animation:'spin .7s linear infinite', display:'inline-block' }} />;
}

// ── LoadingDots ───────────────────────────────────────────────────────────────
export function LoadingDots() {
  const T = useT();
  return (
    <div style={{ display:'flex', gap:6, alignItems:'center', justifyContent:'center', padding:'52px 0' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:9, height:9, borderRadius:'50%',
          background: i===1 ? T.gold.d : T.violet.d,
          animation:`dotPulse 1.4s ease-in-out ${i*.16}s infinite`, opacity:.7 }} />
      ))}
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────
export function Toast({ message, visible, type='error' }) {
  const T = useT();
  if (!visible) return null;
  return (
    <div className="fade-up" style={{
      position:'fixed', transform:'translateX(-50%)',
      background: type==='error' ? T.danger.bg : 'linear-gradient(135deg, rgb(74, 111, 212) 0%, rgb(123, 94, 167) 40%, rgb(201, 107, 154) 100%)',
      backdropFilter:'blur(20px)',
      color: type==='error' ? T.danger.text : 'white',
      padding:'11px 22px', borderRadius:T.r.pill, fontSize:13, fontWeight:600, fontFamily:T.fontBody,
      zIndex:999, whiteSpace:'nowrap',
      border:`1px solid ${type==='error' ? T.danger.border : T.borderAccent}`,
      boxShadow:T.sh.lg, letterSpacing:'.02em', width: '90%'
    }}>
      {type==='success'?'✦ ':'⚠ '}{message}
    </div>
  );
}

// ── PrimaryButton ─────────────────────────────────────────────────────────────
export function PrimaryButton({ children, onClick, disabled, loading, style:s={}, small }) {
  const T = useT();
  const [pr, setPr] = useState(false);
  const base = primaryBtnStyleFn(disabled||loading);
  return (
    <button onClick={onClick} disabled={disabled||loading}
      onMouseDown={()=>setPr(true)} onMouseUp={()=>setPr(false)}
      onTouchStart={()=>setPr(true)} onTouchEnd={()=>setPr(false)}
      style={{ ...base, ...(small?{padding:'9px 18px',fontSize:13,width:'auto'}:{}), transform:pr?'scale(.97)':'scale(1)', ...s }}>
      {loading ? <Spinner size={18}/> : children}
    </button>
  );
}

// ── GhostButton ───────────────────────────────────────────────────────────────
export function GhostButton({ children, onClick, style:s={} }) {
  const T = useT();
  const [pr,setPr]=useState(false);
  return (
    <button onClick={onClick} onMouseDown={()=>setPr(true)} onMouseUp={()=>setPr(false)} onTouchStart={()=>setPr(true)} onTouchEnd={()=>setPr(false)}
      style={{ background: T.isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`1.5px solid ${T.borderAccent}`, borderRadius:T.r.md, padding:'11px 20px', fontSize:14, fontFamily:T.fontBody, fontWeight:500, color:T.violet.d, cursor:'pointer', transition:'all .18s', transform:pr?'scale(.97)':'scale(1)', ...s }}>
      {children}
    </button>
  );
}

// ── FocusInput ─────────────────────────────────────────────────────────────────
export function FocusInput({ label, value, onChange, type='text', placeholder='', rows, required, prefix, suffix }) {
  const T = useT();
  const [f,setF] = useState(false);
  const lbl = (
    <label style={{ fontSize:10, fontWeight:700, color:f?T.gold.d:T.muted, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.09em', fontFamily:T.fontBody, transition:'color .2s' }}>
      {label}{required&&<span style={{color:T.rose.d,marginLeft:2}}>*</span>}
    </label>
  );
  const base = inputBaseFn(f, T);
  const inp = rows
    ? <textarea rows={rows} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{...base,resize:'vertical',lineHeight:1.6}} />
    : (
      <div style={{position:'relative',display:'flex',alignItems:'center'}}>
        {prefix&&<span style={{position:'absolute',left:14,color:T.muted,fontSize:14,fontWeight:500,pointerEvents:'none'}}>{prefix}</span>}
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          style={{...base,paddingLeft:prefix?36:16,paddingRight:suffix?48:16}} />
        {suffix&&<span style={{position:'absolute',right:14,color:T.muted,fontSize:13,pointerEvents:'none'}}>{suffix}</span>}
      </div>
    );
  return <div style={{marginBottom:14}}>{lbl}{inp}</div>;
}

// ── SelectInput ───────────────────────────────────────────────────────────────
export function SelectInput({ label, value, onChange, options }) {
  const T = useT();
  const [f,setF]=useState(false);
  return (
    <div style={{marginBottom:14}}>
      <label style={{ fontSize:10, fontWeight:700, color:f?T.gold.d:T.muted, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.09em', fontFamily:T.fontBody, transition:'color .2s' }}>{label}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{...inputBaseFn(f,T),appearance:'none',cursor:'pointer',colorScheme:T.isDark?'dark':'light'}}>
        {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
      </select>
    </div>
  );
}

// ── SectionCard ───────────────────────────────────────────────────────────────
export function SectionCard({ title, children, style:s={} }) {
  const T = useT();
  return (
    <div style={{
      background: T.isDark?'rgba(26,21,48,0.7)':T.card,
      backdropFilter: T.isDark?'blur(16px)':'none',
      border:`1px solid ${T.isDark?'rgba(155,127,212,0.15)':T.border}`,
      borderRadius:T.r.lg, padding:T.sp.xl,
      boxShadow:T.sh.card, marginBottom:12, position:'relative', overflow:'hidden', ...s,
    }}>
      <div style={{ position:'absolute', inset:0, background:T.grad.card, pointerEvents:'none', borderRadius:'inherit' }} />
      {title && (
        <div style={{ fontSize:10, fontWeight:700, color:T.isDark?T.gold.d:T.violet.d,
          textTransform:'uppercase', letterSpacing:'.12em', marginBottom:16, fontFamily:T.fontBody,
          display:'flex', alignItems:'center', gap:8, position:'relative' }}>
          <div style={{ width:16, height:1, background:T.isDark?T.grad.gold:T.grad.brand, borderRadius:1, opacity:.6 }} />
          {title}
        </div>
      )}
      <div style={{ position:'relative' }}>{children}</div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color, accent }) {
  const T = useT();
  return (
    <div className="scale-in" style={{
      background: accent ? (T.isDark?'linear-gradient(135deg,rgba(155,127,212,0.12),rgba(201,107,154,0.08))':'linear-gradient(135deg,#f3eff9,#fdf0f6)') : T.card,
      border:`1px solid ${T.border}`, borderRadius:T.r.lg, padding:'16px 15px', boxShadow:T.sh.card,
    }}>
      <div style={{fontSize:20,fontWeight:800,fontFamily:T.fontBody,color:color||T.text,lineHeight:1.1,letterSpacing:'-.01em'}}>{value}</div>
      <div style={{fontSize:10,color:T.muted,marginTop:6,fontWeight:500,letterSpacing:'.06em',textTransform:'uppercase'}}>{label}</div>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }) {
  const T = useT();
  return (
    <div className="fade-in" style={{textAlign:'center',padding:'56px 24px',color:T.muted}}>
      <div style={{fontSize:52,marginBottom:16,opacity:.35}}>{icon||'🪡'}</div>
      <div style={{fontSize:16,fontWeight:600,color:T.text2,marginBottom:6,fontFamily:T.fontDisplay}}>{title}</div>
      {sub&&<div style={{fontSize:13,color:T.muted,lineHeight:1.6}}>{sub}</div>}
    </div>
  );
}

// ── SearchBar ─────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder='Search…' }) {
  const T = useT();
  const [f,setF]=useState(false);
  return (
    <div style={{position:'relative',marginBottom:14}}>
      <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:15,opacity:.35,pointerEvents:'none'}}>🔍</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{...inputBaseFn(f,T),paddingLeft:42,fontSize:14}} />
    </div>
  );
}

// ── FilterChip ────────────────────────────────────────────────────────────────
export function FilterChip({ label, active, onClick }) {
  const T = useT();
  return (
    <button onClick={onClick} style={{
      padding:'7px 16px', borderRadius:T.r.pill, fontSize:12, fontWeight:600,
      border: active?'1.5px solid transparent':`1.5px solid ${T.border}`,
      background: active?T.grad.brand:(T.isDark?'rgba(255,255,255,0.05)':T.card),
      color: active?'#fff':T.text2, cursor:'pointer', whiteSpace:'nowrap', fontFamily:T.fontBody,
      boxShadow: active?T.sh.brand:T.sh.xs, transition:'all .2s cubic-bezier(.4,0,.2,1)',
    }}>{label}</button>
  );
}

// ── SegmentControl ────────────────────────────────────────────────────────────
export function SegmentControl({ options, value, onChange }) {
  const T = useT();
  return (
    <div style={{ display:'flex', background:T.isDark?'rgba(255,255,255,0.04)':T.bg2,
      borderRadius:T.r.lg, padding:4, gap:2, border:`1px solid ${T.border}` }}>
      {options.map(o => (
        <button key={o.id} onClick={()=>onChange(o.id)} style={{
          flex:1, padding:'8px 4px', border:'none', cursor:'pointer', borderRadius:T.r.md,
          fontSize:12, fontWeight:600, fontFamily:T.fontBody,
          background: value===o.id?(T.isDark?'rgba(155,127,212,0.2)':T.card):'transparent',
          color: value===o.id?T.violet.d:T.muted,
          boxShadow: value===o.id?T.sh.sm:'none',
          transition:'all .2s cubic-bezier(.4,0,.2,1)', letterSpacing:'.02em',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

import React, { useState } from 'react';
import MeasurementForm from './MeasurementForm';
import { Avatar, SearchBar, EmptyState } from '../shared';
import { GARMENT_FIELDS } from '../../data/garments';
import { useTheme } from '../../context/ThemeContext';

const GARMENTS = Object.keys(GARMENT_FIELDS);

export default function MeasurementsTab({ orders, measurements, onSaveMeasurement }) {
  const { theme: T, isDark } = useTheme();
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [newName, setNewName]   = useState('');
  const [addMode, setAddMode]   = useState(false);

  const allNames = [...new Set([...Object.keys(measurements)])].sort();
  const filtered = allNames.filter(n=>n.toLowerCase().includes(search.toLowerCase()));

  function handleAdd() { const t=newName.trim(); if(!t) return; setSelected(t); setNewName(''); setAddMode(false); }

  if (selected) return <MeasurementForm customerName={selected} measurements={measurements[selected]} onSave={onSaveMeasurement} onBack={()=>setSelected(null)} />;

  const cardBg     = isDark ? 'rgba(26,21,48,0.8)' : T.card;
  const cardBorder = isDark ? 'rgba(155,127,212,0.12)' : T.border;

  return (
    <div style={{ padding:`0 ${T.sp.page}px 100px`, fontFamily:T.fontBody }}>
      <div className="fade-up" style={{ marginBottom:18, paddingTop:4 }}>
        <div style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:600, color:T.text, letterSpacing:'-.01em' }}>Measurements</div>
        <div style={{ fontSize:12, color:T.muted, marginTop:3 }}>{allNames.length} customer{allNames.length!==1?'s':''} saved</div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search customer…" />

      {addMode ? (
        <div style={{ background:cardBg, border:`1px solid ${isDark?'rgba(155,127,212,0.25)':T.border}`, borderRadius:T.r.lg, padding:14, marginBottom:14, boxShadow:T.sh.xs }}>
          <div style={{ fontSize:10, color:isDark?T.gold.d:T.violet.d, fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:'.09em' }}>New customer name</div>
          <div style={{ display:'flex', gap:8 }}>
            <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()} placeholder="e.g. Meena"
              style={{ flex:1, padding:'11px 14px', border:`1.5px solid ${T.violet.d}`, borderRadius:T.r.md, fontSize:14, fontFamily:T.fontBody, background:isDark?'rgba(155,127,212,0.08)':T.bg, color:T.text, outline:'none', boxShadow:`0 0 0 3px ${isDark?'rgba(155,127,212,0.12)':'rgba(123,94,167,0.1)'}`, WebkitTextFillColor:T.text }} />
            <button onClick={handleAdd} style={{ padding:'11px 16px', background:T.grad.brand, color:'#fff', border:'none', borderRadius:T.r.md, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:T.fontBody, boxShadow:T.sh.brand }}>Go</button>
            <button onClick={()=>setAddMode(false)} style={{ padding:'11px 14px', background:isDark?'rgba(255,255,255,0.05)':T.bg2, color:T.muted, border:`1px solid ${T.border}`, borderRadius:T.r.md, fontSize:13, cursor:'pointer', fontFamily:T.fontBody }}>✕</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setAddMode(true)} style={{
          width:'100%', padding:14,
          background: isDark?'linear-gradient(135deg,rgba(155,127,212,0.08),rgba(201,107,154,0.06))':'linear-gradient(135deg,#f3eff9,#fdf0f6)',
          border:`1.5px dashed ${isDark?'rgba(155,127,212,0.3)':T.violet.d+'55'}`,
          borderRadius:T.r.lg, color:T.violet.d, fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:14, fontFamily:T.fontBody,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'border-color .2s',
        }}>
          <span style={{ fontSize:18 }}>+</span> Add New Customer
        </button>
      )}

      {filtered.length===0
        ? <EmptyState icon="📏" title="No customers found" sub="Add a customer above to save their measurements" />
        : (
          <div className="stagger">
            {filtered.map((name,i) => {
              const m = measurements[name]||{};
              const saved = GARMENTS.filter(g=>m[g]&&Object.values(m[g]).some(v=>v!==''&&v!=null));
              return (
                <div key={name} onClick={()=>setSelected(name)} className="fade-up" style={{
                  background:cardBg, border:`1px solid ${cardBorder}`,
                  backdropFilter:isDark?'blur(12px)':'none',
                  borderRadius:T.r.lg, padding:'15px 16px', marginBottom:10,
                  cursor:'pointer', display:'flex', alignItems:'center', gap:13,
                  boxShadow:T.sh.card, transition:'all .18s', animationDelay:`${i*.04}s`,
                  position:'relative', overflow:'hidden',
                }}
                  onMouseDown={e=>e.currentTarget.style.transform='scale(.985)'}
                  onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
                  onTouchStart={e=>e.currentTarget.style.transform='scale(.985)'}
                  onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}
                >
                  <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:0, borderRadius:'0 2px 2px 0', background:T.grad.rose, opacity:.6 }} />
                  <Avatar name={name} size={44} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{name}</div>
                    {saved.length>0
                      ? <div style={{ display:'flex', gap:4, marginTop:5, flexWrap:'wrap' }}>
                          {saved.map(g=>(
                            <span key={g} style={{ fontSize:10, background:isDark?'rgba(201,107,154,0.15)':'#fdf0f6', color:T.rose.d, padding:'2px 8px', borderRadius:T.r.pill, fontWeight:700, textTransform:'capitalize', border:`1px solid ${isDark?'rgba(201,107,154,0.2)':T.rose.d+'33'}` }}>{g}</span>
                          ))}
                        </div>
                      : <div style={{ fontSize:11, color:T.muted, marginTop:3 }}>No measurements yet</div>
                    }
                  </div>
                  <span style={{ fontSize:20, color:T.border }}>›</span>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

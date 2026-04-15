import React, { useState } from 'react';
import MeasurementForm from './MeasurementForm';
import { Avatar, SearchBar, EmptyState } from '../shared';
import { GARMENT_FIELDS } from '../../data/garments';
import { T } from '../../styles/theme';

const GARMENTS = Object.keys(GARMENT_FIELDS);

export default function MeasurementsTab({ orders, measurements, onSaveMeasurement }) {
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [newName,  setNewName]  = useState('');
  const [addMode,  setAddMode]  = useState(false);

  const allNames = [...new Set([...Object.keys(measurements), ...orders.map(o=>o.name)])].sort();
  const filtered = allNames.filter(n=>n.toLowerCase().includes(search.toLowerCase()));

  function handleAdd() {
    const t = newName.trim(); if(!t) return;
    setSelected(t); setNewName(''); setAddMode(false);
  }

  if (selected) {
    return (
      <MeasurementForm
        customerName={selected}
        measurements={measurements[selected]}
        onSave={onSaveMeasurement}
        onBack={()=>setSelected(null)}
      />
    );
  }

  return (
    <div style={{ padding:`0 ${T.sp.page}px 100px`, fontFamily:T.fontBody }}>
      {/* Page header */}
      <div className="fade-up" style={{ marginBottom:18 }}>
        <div style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:600, color:T.text }}>Measurements</div>
        <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>{allNames.length} customer{allNames.length!==1?'s':''} saved</div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search customer…" />

      {/* Add new customer */}
      {addMode ? (
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:T.r.lg, padding:14, marginBottom:14, boxShadow:T.sh.xs }}>
          <div style={{ fontSize:12, color:T.muted, fontWeight:600, marginBottom:8 }}>New customer name</div>
          <div style={{ display:'flex', gap:8 }}>
            <input autoFocus value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()} placeholder="e.g. Meena"
              style={{ flex:1, padding:'11px 14px', border:`1.5px solid ${T.violet.d}`, borderRadius:T.r.md, fontSize:14, fontFamily:T.fontBody, background:T.bg, color:T.text, outline:'none', boxShadow:`0 0 0 3px ${T.violet.pale}` }} />
            <button onClick={handleAdd} style={{ padding:'11px 16px', background:T.grad.brand, color:'#fff', border:'none', borderRadius:T.r.md, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:T.fontBody, boxShadow:T.sh.brand }}>Go</button>
            <button onClick={()=>setAddMode(false)} style={{ padding:'11px 14px', background:T.bg2, color:T.muted, border:`1px solid ${T.border}`, borderRadius:T.r.md, fontSize:13, cursor:'pointer', fontFamily:T.fontBody }}>✕</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setAddMode(true)} style={{ width:'100%', padding:13, background:`linear-gradient(135deg,${T.violet.pale},${T.rose.pale})`, border:`1.5px dashed ${T.violet.l}`, borderRadius:T.r.lg, color:T.violet.d, fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:14, fontFamily:T.fontBody, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <span style={{ fontSize:20 }}>+</span> Add New Customer
        </button>
      )}

      {/* Customer list */}
      {filtered.length===0
        ? <EmptyState icon="📏" title="No customers found" sub="Add a customer above to save their measurements" />
        : (
          <div className="stagger">
            {filtered.map((name,i) => {
              const m = measurements[name]||{};
              const saved = GARMENTS.filter(g=>m[g]&&Object.values(m[g]).some(v=>v!==''&&v!=null));
              return (
                <div key={name} onClick={()=>setSelected(name)} className="fade-up" style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:T.r.lg, padding:'14px 16px', marginBottom:10, cursor:'pointer', display:'flex', alignItems:'center', gap:13, boxShadow:T.sh.card, transition:'all .2s cubic-bezier(.4,0,.2,1)', animationDelay:`${i*.04}s` }}
                  onMouseDown={e=>e.currentTarget.style.transform='scale(.985)'}
                  onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
                  onTouchStart={e=>e.currentTarget.style.transform='scale(.985)'}
                  onTouchEnd={e=>e.currentTarget.style.transform='scale(1)'}
                >
                  <Avatar name={name} size={44} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{name}</div>
                    {saved.length>0
                      ? <div style={{ display:'flex', gap:4, marginTop:5, flexWrap:'wrap' }}>
                          {saved.map(g=><span key={g} style={{ fontSize:10, background:T.rose.pale, color:T.rose.dk, padding:'2px 8px', borderRadius:T.r.pill, fontWeight:700, textTransform:'capitalize' }}>{g}</span>)}
                        </div>
                      : <div style={{ fontSize:11, color:T.muted, marginTop:3 }}>No measurements yet</div>
                    }
                  </div>
                  <span style={{ fontSize:22, color:T.border }}>›</span>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

import React, { useState, useRef } from 'react';
import MeasurementForm from './MeasurementForm';
import { Avatar, SearchBar, EmptyState, ConfirmDialog } from '../shared';
import { GARMENT_FIELDS } from '../../data/garments';
import { useTheme } from '../../context/ThemeContext';

const GARMENTS = Object.keys(GARMENT_FIELDS);

// ── Swipeable customer card ───────────────────────────────────────────────────
function SwipeableCustomerCard({ name, phone, saved, onSelect, onDelete, T, isDark, cardBg, cardBorder, animDelay }) {
  const [swipeX, setSwipeX]   = useState(0);
  const [swiping, setSwiping] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isHoriz     = useRef(false);
  const DELETE_WIDTH   = 70;
  const SNAP_THRESHOLD = DELETE_WIDTH * 0.45;

  function onTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHoriz.current     = false;
    setSwiping(false);
  }

  function onTouchMove(e) {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (!isHoriz.current && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
    if (!isHoriz.current) { isHoriz.current = Math.abs(dx) > Math.abs(dy); }
    if (!isHoriz.current) return;
    e.preventDefault();
    setSwiping(true);
    let next = swipeX + dx;
    next = Math.min(0, Math.max(-DELETE_WIDTH, next));
    setSwipeX(next);
  }

  function onTouchEnd() {
    touchStartX.current = null;
    setSwiping(false);
    if (swipeX < -SNAP_THRESHOLD) setSwipeX(-DELETE_WIDTH);
    else setSwipeX(0);
  }

  function handleCardClick() {
    if (swipeX !== 0) { setSwipeX(0); return; }
    onSelect();
  }

  return (
    <div className="fade-up" style={{
      position:'relative', marginBottom:10,
      borderRadius:T.r.lg, overflow:'hidden',
      animationDelay:`${animDelay}s`,
    }}>
      {/* ── Delete panel ── */}
      <div style={{
        position:'absolute', right:0, top:0, bottom:0, 
        background:'linear-gradient(135deg, rgb(255 121 121), rgb(255 69 69))',
        display:'flex', alignItems:'center', justifyContent:'center',
        flexDirection:'column', gap:3, borderRadius:T.r.lg,
      }}>
        <button
          onClick={e=>{ e.stopPropagation(); onDelete(); setSwipeX(0); }}
          style={{ background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'8px 12px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
          <span style={{ fontSize:10, fontWeight:700, color:'#fff', letterSpacing:'.04em' }}>Delete</span>
        </button>
      </div>

      {/* ── Card ── */}
      <div
        style={{
          background:cardBg, border:`1px solid ${cardBorder}`,
          backdropFilter:isDark?'blur(12px)':'none',
          borderRadius:T.r.lg, padding:'15px 16px',
          display:'flex', alignItems:'center', gap:13,
          boxShadow:T.sh.card,
          transform:`translateX(${swipeX}px)`,
          transition: swiping ? 'none' : 'transform .28s cubic-bezier(.4,0,.2,1)',
          position:'relative', overflow:'hidden', willChange:'transform',
          cursor:'pointer',
        }}
        onClick={handleCardClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div style={{ position:'absolute', left:0, top:'20%', bottom:'20%', width:0, borderRadius:'0 2px 2px 0', background:T.grad.rose, opacity:.6 }} />

        <Avatar name={name} size={44} />
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:700, color:T.text }}>{name}</div>
          {phone && <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>📞 +91 {phone}</div>}
          {saved.length > 0
            ? <div style={{ display:'flex', gap:4, marginTop:5, flexWrap:'wrap' }}>
                {saved.map(g => (
                  <span key={g} style={{ fontSize:10, background:isDark?'rgba(201,107,154,0.15)':'#fdf0f6', color:T.rose.d, padding:'2px 8px', borderRadius:T.r.pill, fontWeight:700, textTransform:'capitalize', border:`1px solid ${isDark?'rgba(201,107,154,0.2)':T.rose.d+'33'}` }}>{g}</span>
                ))}
              </div>
            : <div style={{ fontSize:11, color:T.muted, marginTop:3 }}>No measurements yet</div>
          }
        </div>
        <span style={{ fontSize:20, color:T.border, position:'relative' }}>›</span>
      </div>
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function MeasurementsTab({ orders, measurements, onSaveMeasurement, onDeleteMeasurement }) {
  const { theme: T, isDark } = useTheme();
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [newName, setNewName]     = useState('');
  const [newPhone, setNewPhone]   = useState('');
  const [addMode, setAddMode]     = useState(false);
  const [nameError, setNameError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const allNames = [...new Set([...Object.keys(measurements)])].sort();
  const filtered = allNames.filter(n => n.toLowerCase().includes(search.toLowerCase()));

  function handleAdd() {
    const t = newName.trim();
    if (!t) return;
    if (allNames.map(n => n.toLowerCase()).includes(t.toLowerCase())) {
      setNameError(`"${t}" already exists. Please use a different name.`);
      return;
    }
    setNameError('');
    setSelected({ name: t, phone: newPhone.trim() });
    setNewName(''); setNewPhone(''); setAddMode(false);
  }

  function handleSelectExisting(name) {
    const phone = measurements[name]?.__phone || '';
    setSelected({ name, phone, isExisting: true });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    await onDeleteMeasurement(deleteTarget);
    setDeleteTarget(null);
  }

  const selectedName = selected?.name || selected;
  if (selected) return (
    <MeasurementForm
      customerName={selectedName}
      customerPhone={selected?.phone}
      measurements={measurements[selectedName]}
      onSave={onSaveMeasurement}
      onBack={() => setSelected(null)}
    />
  );

  const cardBg     = isDark ? 'rgba(26,21,48,0.8)' : T.card;
  const cardBorder = isDark ? 'rgba(155,127,212,0.12)' : T.border;

  return (
    <div id='sff-measurements-tab' style={{ padding:`0 ${T.sp.page}px 100px`, fontFamily:T.fontBody }}>
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Customer"
        message={`Delete all measurements for "${deleteTarget}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmDanger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="fade-up" style={{ marginBottom:18, paddingTop:4 }}>
        <div style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:600, color:T.text, letterSpacing:'-.01em' }}>Measurements</div>
        <div style={{ fontSize:12, color:T.muted, marginTop:3 }}>{allNames.length} customer{allNames.length!==1?'s':''} saved</div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search customer…" />

      {/* Add customer form */}
      {addMode ? (
        <div style={{ background:cardBg, border:`1px solid ${isDark?'rgba(155,127,212,0.25)':T.border}`, borderRadius:T.r.lg, padding:14, marginBottom:14, boxShadow:T.sh.xs }}>
          <div style={{ fontSize:10, color:isDark?T.gold.d:T.violet.d, fontWeight:700, marginBottom:10, textTransform:'uppercase', letterSpacing:'.09em' }}>New customer</div>
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <input
              autoFocus
              value={newName}
              onChange={e=>{ setNewName(e.target.value); setNameError(''); }}
              onKeyDown={e=>e.key==='Enter'&&handleAdd()}
              placeholder="Customer name e.g. Meena"
              style={{ flex:1, padding:'11px 14px', border:`1.5px solid ${nameError?T.danger.text:T.violet.d}`, borderRadius:T.r.md, fontSize:14, fontFamily:T.fontBody, background:isDark?'rgba(155,127,212,0.08)':T.bg, color:T.text, outline:'none', boxShadow:`0 0 0 3px ${nameError?'rgba(248,113,113,0.12)':isDark?'rgba(155,127,212,0.12)':'rgba(123,94,167,0.1)'}`, WebkitTextFillColor:T.text }}
            />
          </div>
          {nameError && (
            <div style={{ fontSize:12, color:T.danger.text, background:T.danger.bg, border:`1px solid ${T.danger.border}`, borderRadius:T.r.md, padding:'8px 12px', marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
              ⚠ {nameError}
            </div>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', flex:1, border:`1.5px solid ${T.border}`, borderRadius:T.r.md, background:isDark?'rgba(255,255,255,0.04)':T.bg, overflow:'hidden' }}>
              <span style={{ padding:'0 8px 0 12px', fontSize:13, color:T.muted, whiteSpace:'nowrap', borderRight:`1px solid ${T.border}`, marginRight:8, lineHeight:'44px' }}>🇮🇳 +91</span>
              <input
                type="tel"
                value={newPhone}
                onChange={e=>setNewPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                onKeyDown={e=>e.key==='Enter'&&handleAdd()}
                placeholder="Phone number (optional)"
                style={{ flex:1, padding:'11px 8px 11px 4px', border:'none', fontSize:14, fontFamily:T.fontBody, background:'transparent', color:T.text, outline:'none', WebkitTextFillColor:T.text, letterSpacing:1 }}
              />
            </div>
            <button onClick={handleAdd} style={{ padding:'11px 16px', background:T.grad.brand, color:'#fff', border:'none', borderRadius:T.r.md, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:T.fontBody, boxShadow:T.sh.brand }}>Go</button>
            <button onClick={()=>{setAddMode(false);setNewName('');setNewPhone('');setNameError('');}} style={{ padding:'11px 14px', background:isDark?'rgba(255,255,255,0.05)':T.bg2, color:T.muted, border:`1px solid ${T.border}`, borderRadius:T.r.md, fontSize:13, cursor:'pointer', fontFamily:T.fontBody }}>✕</button>
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

      {filtered.length === 0
        ? <EmptyState icon="📏" title="No customers found" sub="Add a customer above to save their measurements" />
        : (
          <div className="stagger">
            {filtered.map((name, i) => {
              const m     = measurements[name] || {};
              const saved = GARMENTS.filter(g => m[g] && Object.values(m[g]).some(v => v !== '' && v != null));
              const phone = m.__phone || '';
              return (
                <SwipeableCustomerCard
                  key={name}
                  name={name}
                  phone={phone}
                  saved={saved}
                  onSelect={() => handleSelectExisting(name)}
                  onDelete={() => setDeleteTarget(name)}
                  T={T}
                  isDark={isDark}
                  cardBg={cardBg}
                  cardBorder={cardBorder}
                  animDelay={i * 0.04}
                />
              );
            })}
          </div>
        )
      }
    </div>
  );
}
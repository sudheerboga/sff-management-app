import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Spinner, Toast } from '../shared';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt   = n => `₹${Math.abs(Number(n)).toLocaleString('en-IN')}`;
const today = () => new Date().toISOString().split('T')[0];
const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short'}); } catch { return d; } };

// Parse quick entry: "+1300 swathi" or "-500 mom" or "1300 swathi" (no sign → income)
function parseQuick(raw) {
  const s = raw.trim();
  if (!s) return null;
  const sign = s[0] === '-' ? 'out' : 'in';
  const stripped = (s[0] === '+' || s[0] === '-') ? s.slice(1) : s;
  const match = stripped.match(/^(\d+(?:\.\d+)?)\s*(.*)?$/);
  if (!match) return null;
  const amount = parseFloat(match[1]);
  const label  = (match[2] || '').trim() || (sign === 'in' ? 'Income' : 'Expense');
  return { amount, label, type: sign };
}

// ─── sub-components ──────────────────────────────────────────────────────────

function EntryRow({ entry, onEdit, onDelete, T }) {
  const [confirm, setConfirm] = useState(false);
  const isIn = entry.type === 'in';

  return (
    <div
      className="fade-up"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: T.card,
        borderRadius: T.r.md,
        border: `1px solid ${T.border}`,
        marginBottom: 8,
        boxShadow: T.sh.xs,
        transition: 'all .18s',
      }}
    >
      {/* Type dot */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: isIn
          ? (T.isDark ? 'rgba(74,222,128,.12)' : '#e8f5ee')
          : (T.isDark ? 'rgba(248,113,113,.12)' : '#fdeaea'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
      }}>
        {isIn ? '↑' : '↓'}
      </div>

      {/* Label + date */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, fontFamily: T.fontBody,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.label}
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 2, fontFamily: T.fontBody }}>
          {fmtDate(entry.date)}
        </div>
      </div>

      {/* Amount */}
      <div style={{
        fontSize: 15, fontWeight: 800, fontFamily: T.fontBody,
        color: isIn ? T.success.text : T.danger.text,
        letterSpacing: '-.01em',
      }}>
        {isIn ? '+' : '−'}{fmt(entry.amount)}
      </div>

      {/* Actions */}
      {!confirm ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(entry)} style={{
            background: T.isDark ? 'rgba(155,127,212,.12)' : '#f3eff9',
            border: 'none', borderRadius: T.r.sm, width: 30, height: 30,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: '#7B5EA7',
          }}>✎</button>
          <button onClick={() => setConfirm(true)} style={{
            background: T.isDark ? 'rgba(248,113,113,.12)' : '#fdeaea',
            border: 'none', borderRadius: T.r.sm, width: 30, height: 30,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: T.danger.text,
          }}>✕</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { onDelete(entry.id); setConfirm(false); }} style={{
            background: T.danger.bg, color: T.danger.text, border: `1px solid ${T.danger.border}`,
            borderRadius: T.r.sm, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: T.fontBody,
          }}>Delete</button>
          <button onClick={() => setConfirm(false)} style={{
            background: T.isDark ? 'rgba(255,255,255,.06)' : T.bg2, color: T.muted,
            border: `1px solid ${T.border}`, borderRadius: T.r.sm, padding: '4px 8px',
            cursor: 'pointer', fontSize: 12, fontFamily: T.fontBody,
          }}>No</button>
        </div>
      )}
    </div>
  );
}

function AddEntrySheet({ onAdd, onClose, editEntry, onUpdate, T }) {
  const [label,  setLabel]  = useState(editEntry?.label  || '');
  const [amount, setAmount] = useState(editEntry?.amount || '');
  const [type,   setType]   = useState(editEntry?.type   || 'out');
  const [date,   setDate]   = useState(editEntry?.date   || today());
  const [quick,  setQuick]  = useState('');
  const [saving, setSaving] = useState(false);
  const labelRef = useRef(null);

  useEffect(() => { setTimeout(() => labelRef.current?.focus(), 120); }, []);

  function applyQuick() {
    const p = parseQuick(quick);
    if (!p) return;
    setAmount(p.amount); setLabel(p.label); setType(p.type); setQuick('');
  }

  async function handleSave() {
    if (!amount || isNaN(parseFloat(amount))) return;
    setSaving(true);
    try {
      const entry = { label: label || (type==='in'?'Income':'Expense'), amount: parseFloat(amount), type, date };
      if (editEntry) await onUpdate({ ...editEntry, ...entry });
      else           await onAdd(entry);
      onClose();
    } finally { setSaving(false); }
  }

  const inputStyle = (focused=false) => ({
    width: '100%', padding: '12px 14px',
    border: `1.5px solid ${focused ? '#7B5EA7' : T.border}`,
    borderRadius: T.r.md, fontSize: 15, fontFamily: T.fontBody,
    background: T.inputBg, color: T.text, outline: 'none',
    transition: 'border-color .2s, box-shadow .2s',
    boxShadow: focused ? `0 0 0 3px ${T.violet.pale||'rgba(123,94,167,.1)'}` : 'none',
    WebkitTextFillColor: T.text,
  });

  const typeBtn = (val, label_, color) => (
    <button onClick={() => setType(val)} style={{
      flex: 1, padding: '11px 8px', border: `1.5px solid ${type===val ? color : T.border}`,
      borderRadius: T.r.md, background: type===val ? (val==='in'
        ? (T.isDark ? 'rgba(74,222,128,.12)' : '#e8f5ee')
        : (T.isDark ? 'rgba(248,113,113,.12)' : '#fdeaea'))
        : T.inputBg,
      color: type===val ? color : T.muted,
      fontWeight: type===val ? 700 : 500, cursor: 'pointer',
      fontFamily: T.fontBody, fontSize: 13, transition: 'all .15s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    }}>
      <span>{val==='in'?'↑':'↓'}</span> {label_}
    </button>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)', zIndex:200, display:'flex', alignItems:'flex-end' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="scale-in" style={{
        background: T.bg, borderRadius:`${T.r.xxl}px ${T.r.xxl}px 0 0`,
        width:'100%', maxHeight:'88vh', overflowY:'auto',
        padding:'20px 20px 48px', fontFamily: T.fontBody,
        boxShadow: '0 -4px 40px rgba(0,0,0,.3)',
      }}>
        {/* Handle */}
        <div style={{ width:40, height:4, background:T.border, borderRadius:T.r.pill, margin:'0 auto 20px' }} />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:T.fontDisplay, fontSize:19, fontWeight:600, color:T.text }}>
            {editEntry ? 'Edit Entry' : 'Add Entry'}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, color:T.muted, cursor:'pointer' }}>×</button>
        </div>

        {/* Quick parse input (only on add) */}
        {!editEntry && (
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, fontWeight:700, color:T.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.07em' }}>
              Quick Add
            </label>
            <div style={{ display:'flex', gap:8 }}>
              <input
                value={quick}
                onChange={e=>setQuick(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter') applyQuick(); }}
                placeholder="-500 material  or  +1300 Swathi"
                style={{ ...inputStyle(), flex:1, fontSize:13 }}
              />
              <button onClick={applyQuick} style={{
                padding:'12px 16px', background:T.grad.brand, color:'#fff',
                border:'none', borderRadius:T.r.md, fontSize:13, fontWeight:700,
                cursor:'pointer', fontFamily:T.fontBody, boxShadow:T.sh.brand, flexShrink:0,
              }}>Apply</button>
            </div>
            <div style={{ fontSize:11, color:T.muted, marginTop:5 }}>
              Type amount with + or − prefix, then label. Press Apply or Enter.
            </div>
            <div style={{ display:'flex', gap:8, marginTop:10, padding:'1px 0 10px', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontSize:11, color:T.muted }}>Or fill manually ↓</div>
            </div>
          </div>
        )}

        {/* Type toggle */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:T.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.07em' }}>Type</label>
          <div style={{ display:'flex', gap:10 }}>
            {typeBtn('in',  'Income (+)', T.success.text)}
            {typeBtn('out', 'Expense (−)', T.danger.text)}
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:T.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.07em' }}>Amount (₹) *</label>
          <input ref={labelRef} type="number" value={amount} onChange={e=>setAmount(e.target.value)}
            placeholder="0" style={inputStyle()} />
        </div>

        {/* Label */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:11, fontWeight:700, color:T.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.07em' }}>Label / Description</label>
          <input type="text" value={label} onChange={e=>setLabel(e.target.value)}
            placeholder={type==='in'?'e.g. Swathi, Ramya, Cash':'e.g. Material, Mom, Cooler'}
            style={inputStyle()} />
        </div>

        {/* Date */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:700, color:T.muted, display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'.07em' }}>Date</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inputStyle()} />
        </div>

        <button onClick={handleSave} disabled={saving||!amount} style={{
          width:'100%', padding:14,
          background: (!amount||saving) ? (T.isDark?'rgba(255,255,255,.06)':T.bg2) : T.grad.brand,
          color: (!amount||saving) ? T.muted : '#fff',
          border:'none', borderRadius:T.r.md, fontSize:15, fontWeight:700,
          cursor: (!amount||saving) ? 'not-allowed':'pointer',
          fontFamily:T.fontBody, boxShadow: (!amount||saving)?'none':T.sh.brand,
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
        }}>
          {saving ? <Spinner size={18}/> : editEntry ? 'Update Entry' : '+ Add Entry'}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CashBook({ entries, loading, onAdd, onUpdate, onDelete, onClose }) {
  const { theme: T } = useTheme();
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all'); // all | in | out
  const [monthFilter, setMonthFilter] = useState('all'); // all | YYYY-MM
  const [showAdd,   setShowAdd]   = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [toast,     setToast]     = useState({ visible:false, msg:'' });

  function showToast(msg) { setToast({visible:true,msg}); setTimeout(()=>setToast(t=>({...t,visible:false})),2200); }

  async function handleAdd(entry) {
    await onAdd(entry);
    showToast('Entry added!');
  }
  async function handleUpdate(entry) {
    await onUpdate(entry);
    showToast('Entry updated!');
  }
  async function handleDelete(id) {
    await onDelete(id);
    showToast('Entry deleted');
  }

  // Build month options from entries
  const monthOptions = React.useMemo(() => {
    const months = [...new Set(entries.map(e => e.date?.slice(0,7)).filter(Boolean))].sort().reverse();
    return months.map(m => {
      const [y, mo] = m.split('-');
      const label = new Date(Number(y), Number(mo)-1, 1).toLocaleDateString('en-IN',{month:'long',year:'numeric'});
      return { value: m, label };
    });
  }, [entries]);

  // Filtered entries
  const filtered = entries.filter(e => {
    const matchSearch = e.label?.toLowerCase().includes(search.toLowerCase()) ||
                        String(e.amount).includes(search);
    const matchFilter = filter==='all' || e.type===filter;
    const matchMonth  = monthFilter==='all' || e.date?.startsWith(monthFilter);
    return matchSearch && matchFilter && matchMonth;
  });

  // Totals (always from ALL entries, not filtered)
  const totalIn  = entries.filter(e=>e.type==='in' ).reduce((s,e)=>s+(e.amount||0),0);
  const totalOut = entries.filter(e=>e.type==='out').reduce((s,e)=>s+(e.amount||0),0);
  const balance  = totalIn - totalOut;
  const isPositive = balance >= 0;

  // ── layout constants ────────────────────────────────────────────
  const cardGlass = {
    background:   T.isDark ? 'rgba(26,21,48,0.8)' : T.card,
    backdropFilter: T.isDark ? 'blur(16px)' : 'none',
    border: `1px solid ${T.isDark ? 'rgba(155,127,212,0.15)' : T.border}`,
    borderRadius: T.r.lg,
    boxShadow: T.sh.card,
  };
  const isIPhone = /iPhone/i.test(navigator.userAgent);

  return (
    <div style={{ position:'fixed', inset:0, background:T.isDark?'rgba(0,0,0,.75)':'rgba(26,22,37,.55)', zIndex:100, overflowY:'auto', fontFamily:T.fontBody }}>
      <div style={{ maxWidth:430, margin:'0 auto', minHeight:'100%', background:T.bg, display:'flex', flexDirection:'column' }}>

        <Toast message={toast.msg} visible={toast.visible} />

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{
          background: T.isDark ? 'rgba(13,10,24,.95)' : 'rgba(249,245,240,.96)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${T.border}`,
          padding: '16px 20px 14px',
          paddingTop: isIPhone ? '4rem' : 16,
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontFamily:T.fontDisplay, fontSize:20, fontWeight:600, color:T.text, lineHeight:1.1 }}>
                Cash Book
              </div>
              <div style={{ fontSize:11, color:T.muted, marginTop:3, letterSpacing:'.05em' }}>
                Personal ledger
              </div>
            </div>
            <button onClick={onClose} style={{
              background: T.isDark?'rgba(255,255,255,.06)':T.bg2,
              border: `1px solid ${T.border}`, borderRadius:T.r.md,
              padding:'8px 14px', fontSize:13, fontWeight:600,
              color:T.text2, cursor:'pointer', fontFamily:T.fontBody,
            }}>
              ← Back
            </button>
          </div>
        </div>

        <div style={{ padding:'16px 20px 100px', flex:1 }}>

          {/* ── Balance card ───────────────────────────────────── */}
          <div className="fade-up" style={{
            ...cardGlass,
            padding: '22px 20px',
            marginBottom: 14,
            background: T.isDark
              ? 'linear-gradient(135deg,rgba(26,15,53,0.9) 0%,rgba(13,10,24,0.95) 100%)'
              : 'linear-gradient(135deg,rgba(243,239,249,0.9) 0%,rgba(253,240,246,0.9) 100%)',
            overflow: 'hidden', position: 'relative',
          }}>
            {/* Decorative glow */}
            <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%',
              background: isPositive
                ? (T.isDark?'rgba(74,222,128,.08)':'rgba(30,107,62,.06)')
                : (T.isDark?'rgba(248,113,113,.08)':'rgba(139,32,32,.06)'),
              pointerEvents:'none' }} />

            <div style={{ fontSize:11, color:T.muted, textTransform:'uppercase', letterSpacing:'.1em', fontWeight:700, marginBottom:10 }}>
              Total Balance
            </div>

            <div style={{
              fontFamily: T.fontDisplay, fontSize:36, fontWeight:700, lineHeight:1,
              marginBottom: 16,
              background: isPositive
                ? (T.isDark ? 'linear-gradient(135deg,#4ade80,#22c55e)' : 'linear-gradient(135deg,#1e6b3e,#2d9a55)')
                : (T.isDark ? 'linear-gradient(135deg,#f87171,#ef4444)' : 'linear-gradient(135deg,#8b2020,#b91c1c)'),
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            }}>
              {isPositive ? '+' : '−'}{fmt(balance)}
            </div>

            {/* In / Out summary */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div style={{
                background: T.isDark ? 'rgba(74,222,128,.08)' : 'rgba(30,107,62,.05)',
                border: `1px solid ${T.isDark ? 'rgba(74,222,128,.15)' : 'rgba(30,107,62,.12)'}`,
                borderRadius: T.r.md, padding:'10px 12px',
              }}>
                <div style={{ fontSize:10, color:T.isDark?'rgba(74,222,128,.7)':T.success.text, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700, marginBottom:4 }}>
                  ↑ Income
                </div>
                <div style={{ fontSize:18, fontWeight:800, color:T.isDark?'#4ade80':T.success.text }}>
                  {fmt(totalIn)}
                </div>
              </div>
              <div style={{
                background: T.isDark ? 'rgba(248,113,113,.08)' : 'rgba(139,32,32,.05)',
                border: `1px solid ${T.isDark ? 'rgba(248,113,113,.15)' : 'rgba(139,32,32,.12)'}`,
                borderRadius: T.r.md, padding:'10px 12px',
              }}>
                <div style={{ fontSize:10, color:T.isDark?'rgba(248,113,113,.7)':T.danger.text, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700, marginBottom:4 }}>
                  ↓ Expenses
                </div>
                <div style={{ fontSize:18, fontWeight:800, color:T.isDark?'#f87171':T.danger.text }}>
                  {fmt(totalOut)}
                </div>
              </div>
            </div>
          </div>

          {/* ── Add entry button ────────────────────────────────── */}
          <button onClick={() => { setEditEntry(null); setShowAdd(true); }} style={{
            width:'100%', padding:'13px',
            background: T.grad.brand,
            border:'none', borderRadius:T.r.lg,
            color:'#fff', fontSize:14, fontWeight:700,
            cursor:'pointer', fontFamily:T.fontBody,
            boxShadow:T.sh.brand,
            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            marginBottom:16,
          }}>
            <span style={{ fontSize:20, lineHeight:1, fontWeight:300 }}>+</span> Add Entry
          </button>

          {/* ── Search ─────────────────────────────────────────── */}
          <div style={{ position:'relative', marginBottom:12 }}>
            <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:15, opacity:.35, pointerEvents:'none' }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search entries…"
              style={{
                width:'100%', padding:'11px 14px 11px 38px',
                border:`1px solid ${T.border}`, borderRadius:T.r.md, fontSize:14,
                background:T.inputBg, color:T.text, outline:'none', fontFamily:T.fontBody,
                WebkitTextFillColor: T.text,
              }}
            />
          </div>

          {/* ── Filter chips + Month dropdown ───────────────────── */}
          <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
            {[['all','All'],['in','Income ↑'],['out','Expenses ↓']].map(([val,lbl])=>(
              <button key={val} onClick={()=>setFilter(val)} style={{
                padding:'6px 14px', borderRadius:T.r.pill, fontSize:12, fontWeight:600,
                border:`1.5px solid ${filter===val?'transparent':T.border}`,
                background: filter===val ? T.grad.brand : (T.isDark?'rgba(255,255,255,.04)':T.card),
                color: filter===val ? '#fff' : T.text2,
                cursor:'pointer', fontFamily:T.fontBody,
                boxShadow: filter===val ? T.sh.brand : T.sh.xs,
                transition:'all .15s',
              }}>{lbl}</button>
            ))}
          </div>
          {/* ── Month filter dropdown ───────────────────────────── */}
          {monthOptions.length > 0 && (
            <div style={{ marginBottom:14, position:'relative' }}>
              <select
                value={monthFilter}
                onChange={e=>setMonthFilter(e.target.value)}
                style={{
                  width:'100%', padding:'9px 36px 9px 12px',
                  border:`1.5px solid ${monthFilter!=='all'?T.violet.d:T.border}`,
                  borderRadius:T.r.md, fontSize:13, fontFamily:T.fontBody,
                  background:T.isDark?'rgba(155,127,212,0.08)':T.card,
                  color:T.text, outline:'none', cursor:'pointer',
                  WebkitTextFillColor:T.text,
                  appearance:'none', WebkitAppearance:'none',
                  boxShadow: monthFilter!=='all'?`0 0 0 3px ${T.isDark?'rgba(155,127,212,0.15)':'rgba(123,94,167,0.1)'}`:T.sh.xs,
                  transition:'all .2s',
                }}
              >
                <option value="all">📅 All Months</option>
                {monthOptions.map(m=>(
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:T.muted, fontSize:12 }}>▾</div>
            </div>
          )}

          {/* ── Entry count ─────────────────────────────────────── */}
          {filtered.length > 0 && (
            <div style={{ fontSize:11, color:T.muted, marginBottom:10, fontWeight:500, letterSpacing:'.04em' }}>
              {filtered.length} {filter==='all'?'entries':filter==='in'?'income entries':'expense entries'}
              {search && ` matching "${search}"`}
            </div>
          )}

          {/* ── Entries list ───────────────────────────────────── */}
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', padding:'40px 0' }}><Spinner size={28}/></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'52px 24px' }}>
              <div style={{ fontSize:48, marginBottom:14, opacity:.3 }}>💰</div>
              <div style={{ fontSize:15, fontWeight:600, color:T.text2, fontFamily:T.fontDisplay, marginBottom:6 }}>
                {entries.length === 0 ? 'No entries yet' : 'No entries match'}
              </div>
              <div style={{ fontSize:13, color:T.muted, lineHeight:1.6 }}>
                {entries.length === 0
                  ? 'Tap "+ Add Entry" to record your first income or expense'
                  : 'Try adjusting your search or filter'}
              </div>
            </div>
          ) : (
            <div className="stagger">
              {filtered.map((e, i) => (
                <EntryRow key={e.id} entry={e}
                  onEdit={entry => { setEditEntry(entry); setShowAdd(true); }}
                  onDelete={handleDelete}
                  T={T}
                />
              ))}
            </div>
          )}

          {/* ── Summary footer ─────────────────────────────────── */}
          {entries.length > 0 && (
            <div style={{
              ...cardGlass,
              padding:'16px 20px', marginTop:10,
              borderTop:`2px solid ${T.isDark?'rgba(155,127,212,.2)':'rgba(123,94,167,.15)'}`,
            }}>
              <div style={{ fontSize:11, color:T.muted, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700, marginBottom:12 }}>
                Summary
              </div>
              {[
                { label:`Income (${entries.filter(e=>e.type==='in').length} entries)`, value:totalIn,  color:T.success.text, sign:'+' },
                { label:`Expenses (${entries.filter(e=>e.type==='out').length} entries)`, value:totalOut, color:T.danger.text,  sign:'−' },
              ].map(row=>(
                <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${T.border}` }}>
                  <span style={{ fontSize:13, color:T.text2 }}>{row.label}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:row.color }}>{row.sign}{fmt(row.value)}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0 0' }}>
                <span style={{ fontSize:14, fontWeight:700, color:T.text, fontFamily:T.fontDisplay }}>Total Balance</span>
                <span style={{
                  fontSize:18, fontWeight:800, fontFamily:T.fontBody,
                  color: isPositive ? T.success.text : T.danger.text,
                }}>
                  {isPositive?'+':'−'}{fmt(balance)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit sheet ──────────────────────────────────────── */}
      {showAdd && (
        <AddEntrySheet
          T={T}
          editEntry={editEntry}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onClose={() => { setShowAdd(false); setEditEntry(null); }}
        />
      )}
    </div>
  );
}

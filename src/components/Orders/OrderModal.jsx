import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { inputBase } from '../../styles/theme';
import { FocusInput, SelectInput, PrimaryButton } from '../shared';

const BLANK = { name:'', mobile:'', date:new Date().toISOString().split('T')[0], ddate:'', items:'', total:'', material:'', given:'', status:'In Progress' };
const calcBal  = (t,g) => Math.max(0,parseFloat(t||0)-parseFloat(g||0));
const calcProf = (t,m) => Math.max(0,parseFloat(t||0)-parseFloat(m||0));

export default function OrderModal({ order, onClose, onSave }) {
  const { theme: T } = useTheme();
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(() => {
    setForm(order?.id ? {...BLANK,...order} : {...BLANK, date:new Date().toISOString().split('T')[0]});
  }, [order]);

  async function handleSave() {
    if (!form.name.trim()) return alert('Enter customer name');
    if (!form.total) return alert('Enter total amount');
    setSaving(true);
    try {
      await onSave({ ...form, total:parseFloat(form.total), material:parseFloat(form.material||0), given:parseFloat(form.given||0), balance:calcBal(form.total,form.given), profit:calcProf(form.total,form.material) });
      onClose();
    } finally { setSaving(false); }
  }

  const dateInput = (label, key) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:10, fontWeight:700, color:T.isDark?T.gold.d:T.violet.d, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.09em', fontFamily:T.fontBody }}>{label}</label>
      <input type="date" value={form[key]} onChange={e=>upd(key,e.target.value)}
        style={{ ...inputBase(false,T), width:'65%', colorScheme:T.isDark?'dark':'light' }} />
    </div>
  );

  const sheetBg   = T.isDark ? 'rgba(14,11,26,0.98)' : 'rgba(255,255,255,0.98)';
  const sectionBg = T.isDark ? 'rgba(26,21,48,0.7)'  : T.bg;
  const secBorder = T.isDark ? 'rgba(155,127,212,0.15)' : T.border;

  return (
    <div style={{ position:'fixed', inset:0, background:T.isDark?'rgba(0,0,0,0.75)':'rgba(0,0,0,0.4)', zIndex:100, display:'flex', alignItems:'flex-end', backdropFilter:'blur(8px)' }}
      onClick={e=>{if(e.target===e.currentTarget) onClose();}}>
      <div className="scale-in" style={{
        background:sheetBg, backdropFilter:'blur(30px)',
        borderRadius:`${T.r.xxl}px ${T.r.xxl}px 0 0`,
        width:'100%', maxHeight:'92vh', overflowY:'auto',
        padding:'22px 20px 52px', fontFamily:T.fontBody,
        border:`1px solid ${secBorder}`, borderBottom:'none',
        boxShadow: T.isDark?'0 -20px 60px rgba(0,0,0,.8)':'0 -8px 40px rgba(26,22,37,.15)',
      }}>
        <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:1, background:T.grad.brand, opacity:.5 }} />
        <div style={{ width:36, height:4, background:T.isDark?'rgba(255,255,255,0.15)':T.border, borderRadius:T.r.pill, margin:'0 auto 22px' }} />

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <div style={{ fontFamily:T.fontDisplay, fontSize:21, fontWeight:600, color:T.text, letterSpacing:'-.01em' }}>{order?.id?'Edit Order':'New Order'}</div>
            {order?.sffId && <div style={{ fontSize:11, color:T.muted, marginTop:2, fontFamily:'monospace' }}>{order.sffId}</div>}
          </div>
          <button onClick={onClose} style={{ background:T.isDark?'rgba(255,255,255,0.06)':T.bg2, border:`1px solid ${T.border}`, width:34, height:34, borderRadius:'50%', fontSize:18, cursor:'pointer', color:T.muted, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        {/* Customer */}
        <div style={{ background:sectionBg, borderRadius:T.r.lg, padding:16, marginBottom:10, border:`1px solid ${secBorder}`, boxShadow:T.sh.xs }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.isDark?T.gold.d:T.violet.d, textTransform:'uppercase', letterSpacing:'.12em', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:14, height:1, background:T.isDark?T.grad.gold:T.grad.brand, opacity:.6 }} />Customer Details
          </div>
          <FocusInput label="Customer Name" value={form.name} onChange={v=>upd('name',v)} placeholder="e.g. Srija" required />
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:10, fontWeight:700, color:T.muted, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.09em', fontFamily:T.fontBody }}>Mobile Number</label>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ padding:'13px 12px', borderRadius:T.r.md, fontSize:14, fontWeight:600, color:T.text2, background:T.isDark?'rgba(255,255,255,0.05)':T.bg2, border:`1.5px solid ${T.border}`, whiteSpace:'nowrap' }}>🇮🇳 +91</div>
              <input type="tel" value={form.mobile||''} onChange={e=>upd('mobile',e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="98765 43210"
                style={{ ...inputBase(false,T), flex:1, letterSpacing:1.2 }} />
            </div>
          </div>
          {dateInput('Order Date','date')}
          {dateInput('Delivery Date','ddate')}
          <FocusInput label="Stitching Items" value={form.items} onChange={v=>upd('items',v)} placeholder="2 Blouses, 1 Saree Fall Pico" rows={3} />
        </div>

        {/* Payment */}
        <div style={{ background:sectionBg, borderRadius:T.r.lg, padding:16, marginBottom:14, border:`1px solid ${secBorder}`, boxShadow:T.sh.xs }}>
          <div style={{ fontSize:10, fontWeight:700, color:T.isDark?T.gold.d:T.violet.d, textTransform:'uppercase', letterSpacing:'.12em', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:14, height:1, background:T.isDark?T.grad.gold:T.grad.brand, opacity:.6 }} />Payment Details
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <FocusInput label="Total Amount *" value={form.total} onChange={v=>upd('total',v)} type="number" prefix="₹" />
            <FocusInput label="Material Cost"  value={form.material} onChange={v=>upd('material',v)} type="number" prefix="₹" />
            <FocusInput label="Amount Given"   value={form.given} onChange={v=>upd('given',v)} type="number" prefix="₹" />
            <SelectInput label="Status" value={form.status} onChange={v=>upd('status',v)} options={['In Progress','Delivered']} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, background:T.isDark?'rgba(255,255,255,0.03)':T.bg2, borderRadius:T.r.md, padding:'14px 15px', border:`1px solid ${T.border}` }}>
            <div>
              <div style={{ fontSize:10, color:T.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'.06em' }}>Balance Due</div>
              <div style={{ fontSize:21, fontWeight:800, color:T.danger.text, letterSpacing:'-.01em' }}>₹{calcBal(form.total,form.given).toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{ fontSize:10, color:T.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'.06em' }}>Profit</div>
              <div style={{ fontSize:21, fontWeight:800, color:T.success.text, letterSpacing:'-.01em' }}>₹{calcProf(form.total,form.material).toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>
        <PrimaryButton onClick={handleSave} loading={saving}>{order?.id?'Update Order':'+ Save Order'}</PrimaryButton>
      </div>
    </div>
  );
}

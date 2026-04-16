import React, { useState, useEffect } from 'react';
import { T, inputBase, primaryBtnStyle } from '../../styles/theme';
import { FocusInput, SelectInput, PrimaryButton } from '../shared';

const BLANK = { name:'', date:new Date().toISOString().split('T')[0], ddate:'', items:'', total:'', material:'', given:'', status:'In Progress' };
const calcBal  = (t,g) => Math.max(0,parseFloat(t||0)-parseFloat(g||0));
const calcProf = (t,m) => Math.max(0,parseFloat(t||0)-parseFloat(m||0));

export default function OrderModal({ order, onClose, onSave }) {
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(() => {
    setForm(order?.id ? {...order} : {...BLANK, date:new Date().toISOString().split('T')[0]});
  }, [order]);

  async function handleSave() {
    if (!form.name.trim()) return alert('Enter customer name');
    if (!form.total) return alert('Enter total amount');
    setSaving(true);
    try {
      await onSave({
        ...form,
        total:    parseFloat(form.total),
        material: parseFloat(form.material||0),
        given:    parseFloat(form.given||0),
        balance:  calcBal(form.total,form.given),
        profit:   calcProf(form.total,form.material),
      });
      onClose();
    } finally { setSaving(false); }
  }

  const dateInput = (label, key) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11, fontWeight:700, color:T.muted, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.07em', fontFamily:T.fontBody }}>{label}</label>
      <input type="date" value={form[key]} onChange={e=>upd(key,e.target.value)} style={{ ...inputBase(), width:'100%' }} />
    </div>
  );

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(26,22,37,.55)', zIndex:100, display:'flex', alignItems:'flex-end' }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="scale-in" style={{ background:T.bg, borderRadius:`${T.r.xxl}px ${T.r.xxl}px 0 0`, width:'100%', maxHeight:'92vh', overflowY:'auto', padding:'22px 20px 52px', fontFamily:T.fontBody }}>
        {/* Handle */}
        <div style={{ width:40, height:4, background:T.border, borderRadius:T.r.pill, margin:'0 auto 22px' }} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div>
            <div style={{ fontFamily:T.fontDisplay, fontSize:21, fontWeight:600, color:T.text }}>{order?.id?'Edit Order':'New Order'}</div>
            <div style={{ fontSize:13, color:T.muted, marginTop:2 }}>{order?.id?'Update order details':'Add a new customer order'}</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:T.muted, lineHeight:1 }}>×</button>
        </div>

        {/* Customer */}
        <div style={{ background:T.card, borderRadius:T.r.lg, padding:16, marginBottom:12, border:`1px solid ${T.border}`, boxShadow:T.sh.xs }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14 }}>Customer Details</div>
          <FocusInput label="Customer Name" value={form.name} onChange={v=>upd('name',v)} placeholder="e.g. Srija" required />
          <div>
            {dateInput('Order Date','date')}
            {dateInput('Delivery Date','ddate')}
          </div>
          <FocusInput label="Stitching Items" value={form.items} onChange={v=>upd('items',v)} placeholder="2 Blouses, 1 Saree Fall Pico" rows={3} />
        </div>

        {/* Payment */}
        <div style={{ background:T.card, borderRadius:T.r.lg, padding:16, marginBottom:12, border:`1px solid ${T.border}`, boxShadow:T.sh.xs }}>
          <div style={{ fontSize:11, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14 }}>Payment</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <FocusInput label="Total Amount" value={form.total} onChange={v=>upd('total',v)} type="number" prefix="₹" />
            <FocusInput label="Material Cost" value={form.material} onChange={v=>upd('material',v)} type="number" prefix="₹" />
            <FocusInput label="Amount Given" value={form.given} onChange={v=>upd('given',v)} type="number" prefix="₹" />
            <SelectInput label="Status" value={form.status} onChange={v=>upd('status',v)} options={['In Progress','Delivered']} />
          </div>

          {/* Live calc */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, background:T.bg, borderRadius:T.r.md, padding:'13px 14px', border:`1px solid ${T.border}` }}>
            <div>
              <div style={{ fontSize:10, color:T.muted, marginBottom:3, textTransform:'uppercase', letterSpacing:'.05em' }}>Balance Due</div>
              <div style={{ fontSize:21, fontWeight:800, color:T.danger.text }}>₹{calcBal(form.total,form.given).toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{ fontSize:10, color:T.muted, marginBottom:3, textTransform:'uppercase', letterSpacing:'.05em' }}>Profit</div>
              <div style={{ fontSize:21, fontWeight:800, color:T.success.text }}>₹{calcProf(form.total,form.material).toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        <PrimaryButton onClick={handleSave} loading={saving}>{order?.id?'Update Order':'+ Save Order'}</PrimaryButton>
      </div>
    </div>
  );
}

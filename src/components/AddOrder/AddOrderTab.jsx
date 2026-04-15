import React, { useState } from 'react';
import { T, inputBase } from '../../styles/theme';
import { FocusInput, SelectInput, PrimaryButton, Toast, SectionCard } from '../shared';

const BLANK = { name:'', date:new Date().toISOString().split('T')[0], ddate:'', items:'', total:'', material:'', given:'', status:'In Progress' };
const calcBal  = (t,g) => Math.max(0,parseFloat(t||0)-parseFloat(g||0));
const calcProf = (t,m) => Math.max(0,parseFloat(t||0)-parseFloat(m||0));

export default function AddOrderTab({ onAdd }) {
  const [form, setForm]   = useState({...BLANK});
  const [saving,setSaving]= useState(false);
  const [toast, setToast] = useState({ visible:false, msg:'' });
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const showToast = (msg) => { setToast({visible:true,msg}); setTimeout(()=>setToast(t=>({...t,visible:false})),2500); };

  async function handleSubmit() {
    if (!form.name.trim()) return alert('Enter customer name');
    if (!form.total) return alert('Enter total amount');
    setSaving(true);
    try {
      await onAdd({ ...form, total:parseFloat(form.total), material:parseFloat(form.material||0), given:parseFloat(form.given||0), balance:calcBal(form.total,form.given), profit:calcProf(form.total,form.material) });
      setForm({...BLANK, date:new Date().toISOString().split('T')[0]});
      showToast('Order saved successfully!');
    } finally { setSaving(false); }
  }

  const dateInput = (label, key) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11, fontWeight:700, color:T.muted, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.07em', fontFamily:T.fontBody }}>{label}</label>
      <input type="date" value={form[key]} onChange={e=>upd(key,e.target.value)} style={{ ...inputBase(), width:'100%' }} />
    </div>
  );

  return (
    <div style={{ padding:`0 ${T.sp.page}px 100px`, fontFamily:T.fontBody }}>
      <Toast message={toast.msg} visible={toast.visible} />

      {/* Page header */}
      <div className="fade-up" style={{ marginBottom:20 }}>
        <div style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:600, color:T.text }}>New Order</div>
        <div style={{ fontSize:13, color:T.muted, marginTop:4 }}>Add a new customer stitching order</div>
      </div>

      {/* Customer */}
      <SectionCard title="Customer Details">
        <FocusInput label="Customer Name" value={form.name} onChange={v=>upd('name',v)} placeholder="e.g. Sailaja" required />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {dateInput('Order Date','date')}
          {dateInput('Delivery Date','ddate')}
        </div>
        <FocusInput label="Stitching Items" value={form.items} onChange={v=>upd('items',v)} placeholder="2 Blouses, 1 Saree Fall Pico, 1 Lehenga" rows={3} />
      </SectionCard>

      {/* Payment */}
      <SectionCard title="Payment Details">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <FocusInput label="Total Amount *" value={form.total} onChange={v=>upd('total',v)} type="number" prefix="₹" />
          <FocusInput label="Material Cost"  value={form.material} onChange={v=>upd('material',v)} type="number" prefix="₹" />
          <FocusInput label="Amount Given"   value={form.given} onChange={v=>upd('given',v)} type="number" prefix="₹" />
          <SelectInput label="Status" value={form.status} onChange={v=>upd('status',v)} options={['In Progress','Delivered']} />
        </div>

        {/* Live summary */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, background:T.bg, borderRadius:T.r.md, padding:'13px 16px', border:`1px solid ${T.border}`, marginTop:4 }}>
          <div>
            <div style={{ fontSize:10, color:T.muted, marginBottom:3, textTransform:'uppercase', letterSpacing:'.05em' }}>Balance Due</div>
            <div style={{ fontSize:22, fontWeight:800, color:T.danger.text }}>₹{calcBal(form.total,form.given).toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div style={{ fontSize:10, color:T.muted, marginBottom:3, textTransform:'uppercase', letterSpacing:'.05em' }}>Profit</div>
            <div style={{ fontSize:22, fontWeight:800, color:T.success.text }}>₹{calcProf(form.total,form.material).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </SectionCard>

      <PrimaryButton onClick={handleSubmit} loading={saving}>+ Save Order</PrimaryButton>
    </div>
  );
}

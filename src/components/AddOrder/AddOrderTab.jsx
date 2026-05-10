import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { inputBase } from '../../styles/theme';
import { FocusInput, SelectInput, PrimaryButton, Toast, SectionCard } from '../shared';

const BLANK = { name:'', mobile:'', date:new Date().toISOString().split('T')[0], ddate:'', additionalInfo:'', total:'', material:'', given:'', status:'In Progress' };
const calcBal  = (t,g) => Math.max(0,parseFloat(t||0)-parseFloat(g||0));
const calcProf = (t,m) => Math.max(0,parseFloat(t||0)-parseFloat(m||0));
const emptyLine = () => ({ id: Date.now() + Math.random(), name:'', amount:'' });

export default function AddOrderTab({ onAdd }) {
  const { theme: T, isDark } = useTheme();
  const [form, setForm]           = useState({...BLANK});
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState({ visible:false, msg:'' });
  const [itemLines, setItemLines] = useState([emptyLine()]);

  const upd = (k,v) => setForm(f=>({...f,[k]:v}));
  const showToast = msg => { setToast({visible:true,msg}); setTimeout(()=>setToast(t=>({...t,visible:false})),2500); };

  function recalcTotal(lines) {
    const sum = lines.reduce((acc,l) => acc+(parseFloat(l.amount)||0), 0);
    if (sum > 0) setForm(f=>({...f, total: String(sum)}));
  }

  function updateLine(id, field, val) {
    const updated = itemLines.map(l => l.id===id ? {...l,[field]:val} : l);
    setItemLines(updated);
    recalcTotal(updated);
  }

  function addLine() {
    setItemLines(prev => [...prev, emptyLine()]);
  }

  function removeLine(id) {
    const updated = itemLines.filter(l=>l.id!==id);
    const safe = updated.length ? updated : [emptyLine()];
    setItemLines(safe);
    recalcTotal(safe);
  }

  async function handleSubmit() {
    if (!form.name.trim()) return alert('Enter customer name');
    if (!form.total) return alert('Enter total amount');
    setSaving(true);
    try {
      const cleanLines = itemLines
        .filter(l => l.name.trim())
        .map(l => ({ name: l.name.trim(), amount: parseFloat(l.amount)||0 }));

      await onAdd({
        ...form,
        itemLines:      cleanLines,
        additionalInfo: form.additionalInfo,
        total:          parseFloat(form.total),
        material:       parseFloat(form.material||0),
        given:          parseFloat(form.given||0),
        balance:        calcBal(form.total, form.given),
        profit:         calcProf(form.total, form.material),
      });
      setForm({...BLANK, date:new Date().toISOString().split('T')[0]});
      setItemLines([emptyLine()]);
      showToast('Order saved successfully!');
    } finally { setSaving(false); }
  }

  const dateInput = (label, key) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:10, fontWeight:700, color:T.isDark?T.gold.d:T.violet.d, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.09em', fontFamily:T.fontBody }}>{label}</label>
      <input type="date" value={form[key]} onChange={e=>upd(key,e.target.value)}
        style={{ ...inputBase(false,T), width:'65%', colorScheme:T.isDark?'dark':'light' }} />
    </div>
  );

  const itemTotal  = itemLines.reduce((acc,l)=>acc+(parseFloat(l.amount)||0),0);
  const labelColor = isDark ? T.gold.d : T.violet.d;

  return (
    <div id='sff-add-order-tab' style={{ padding:`0 ${T.sp.page}px 100px`, fontFamily:T.fontBody }}>
      <Toast message={toast.msg} visible={toast.visible} />
      <div className="fade-up" style={{ marginBottom:20, paddingTop:4 }}>
        <div style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:600, color:T.text, letterSpacing:'-.01em' }}>New Order</div>
        <div style={{ fontSize:12, color:T.muted, marginTop:3 }}>Add a new customer stitching order</div>
      </div>

      <SectionCard title="Customer Details">
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
      </SectionCard>

      {/* ── Item-wise Amounts section ─────────────────────────── */}
      <SectionCard title="Item-wise Amounts">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontSize:12, color:T.muted, fontFamily:T.fontBody }}>Add each stitching item with its amount</span>
          {itemTotal > 0 && (
            <span style={{ fontSize:11, fontWeight:700, color:T.violet.d, background:isDark?'rgba(155,127,212,0.15)':'#f3eff9', padding:'3px 10px', borderRadius:T.r.pill, border:`1px solid ${isDark?'rgba(155,127,212,0.3)':T.violet.d+'33'}` }}>
              Total: ₹{itemTotal.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Item rows */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:8 }}>
          {itemLines.map((line, idx) => (
            <div key={line.id} style={{ display:'flex', gap:8, alignItems:'center' }}>
              <input
                value={line.name}
                onChange={e=>updateLine(line.id,'name',e.target.value)}
                placeholder={`Item ${idx+1} e.g. Blouse`}
                style={{ flex:2, ...inputBase(false,T), marginBottom:0, fontSize:13, padding:'10px 12px' }}
              />
              <div style={{ display:'flex', alignItems:'center', flex:1, border:`1.5px solid ${T.border}`, borderRadius:T.r.md, background:isDark?'rgba(255,255,255,0.03)':T.bg, overflow:'hidden' }}>
                <span style={{ padding:'0 6px 0 10px', fontSize:13, fontWeight:700, color:T.muted }}>₹</span>
                <input
                  type="number"
                  value={line.amount}
                  onChange={e=>updateLine(line.id,'amount',e.target.value)}
                  placeholder="0"
                  style={{ flex:1, padding:'10px 8px 10px 2px', border:'none', fontSize:14, fontFamily:T.fontBody, background:'transparent', color:T.text, outline:'none', WebkitTextFillColor:T.text, fontWeight:700 }}
                />
              </div>
              {itemLines.length > 1 && (
                <button onClick={()=>removeLine(line.id)} style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:isDark?'rgba(248,113,113,0.12)':'#fdeaea', border:'none', borderRadius:T.r.sm, cursor:'pointer', color:T.danger.text, fontSize:14, flexShrink:0 }}>✕</button>
              )}
            </div>
          ))}
        </div>

        {/* Add item button */}
        <button onClick={addLine} style={{
          width:'100%', padding:'9px 0',
          background: isDark?'linear-gradient(135deg,rgba(155,127,212,0.06),rgba(201,107,154,0.04))':'linear-gradient(135deg,#f3eff9,#fdf0f6)',
          border:`1.5px dashed ${isDark?'rgba(155,127,212,0.3)':T.violet.d+'55'}`,
          borderRadius:T.r.md, color:T.violet.d, fontSize:12, fontWeight:700,
          cursor:'pointer', fontFamily:T.fontBody, display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:14,
        }}>
          <span style={{ fontSize:16 }}>+</span> Add Item
        </button>

        {/* Additional Info textarea */}
        <label style={{ fontSize:10, fontWeight:700, color:T.muted, display:'block', marginBottom:5, textTransform:'uppercase', letterSpacing:'.09em', fontFamily:T.fontBody }}>Additional Info (optional)</label>
        <textarea
          value={form.additionalInfo}
          onChange={e=>upd('additionalInfo', e.target.value)}
          placeholder="Any extra notes, special instructions…"
          rows={3}
          style={{ ...inputBase(false,T), width:'100%', resize:'vertical', lineHeight:1.5, boxSizing:'border-box' }}
        />
      </SectionCard>

      <SectionCard title="Payment Details">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <FocusInput label="Total Amount *" value={form.total}    onChange={v=>upd('total',v)}    type="number" prefix="₹" />
          <FocusInput label="Material Cost"  value={form.material} onChange={v=>upd('material',v)} type="number" prefix="₹" />
          <FocusInput label="Amount Given"   value={form.given}    onChange={v=>upd('given',v)}    type="number" prefix="₹" />
          <SelectInput label="Status" value={form.status} onChange={v=>upd('status',v)} options={['In Progress','Delivered']} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, background:T.isDark?'rgba(255,255,255,0.03)':T.bg2, borderRadius:T.r.md, padding:'14px 15px', border:`1px solid ${T.border}`, marginTop:4 }}>
          <div>
            <div style={{ fontSize:10, color:T.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'.06em' }}>Balance Due</div>
            <div style={{ fontSize:22, fontWeight:800, color:T.danger.text }}>₹{calcBal(form.total,form.given).toLocaleString('en-IN')}</div>
          </div>
          <div>
            <div style={{ fontSize:10, color:T.muted, marginBottom:4, textTransform:'uppercase', letterSpacing:'.06em' }}>Profit</div>
            <div style={{ fontSize:22, fontWeight:800, color:T.success.text }}>₹{calcProf(form.total,form.material).toLocaleString('en-IN')}</div>
          </div>
        </div>
      </SectionCard>

      <PrimaryButton onClick={handleSubmit} loading={saving}>✦ Save Order</PrimaryButton>
    </div>
  );
}
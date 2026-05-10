import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Toast, PrimaryButton, UnsavedChangesDialog } from '../shared';
import { GARMENT_FIELDS } from '../../data/garments';
import { useTheme } from '../../context/ThemeContext';
import { inputBase } from '../../styles/theme';
import { exportMeasurementsPDF, exportMeasurementsExcel } from '../../utils/exportMeasurements';

const GARMENTS = Object.keys(GARMENT_FIELDS);

export default function MeasurementForm({ customerName, customerPhone: initialPhone, measurements, onSave, onBack }) {
  const { theme: T, isDark } = useTheme();
  const [garment, setGarment]           = useState('blouse');
  const [vals, setVals]                 = useState({});
  const [customFields, setCustomFields] = useState([]);
  const [newLabel, setNewLabel]         = useState('');
  const [addMode, setAddMode]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [exporting, setExporting]       = useState('');
  const [toast, setToast]               = useState({ visible:false, msg:'', type:'success' });

  // Phone edit state
  const [phone, setPhone]               = useState(initialPhone || '');
  const [phoneEditMode, setPhoneEditMode] = useState(false);

  // Unsaved changes tracking
  const [showUnsaved, setShowUnsaved]   = useState(false);
  const originalVals                    = useRef({});
  const isDirty                         = useRef(false);

  useEffect(() => {
    const data = measurements?.[garment]||{};
    const stdKeys = new Set(GARMENT_FIELDS[garment].map(f=>f.key));
    const customEntries = Object.entries(data).filter(([k])=>!stdKeys.has(k) && k!=='__phone');
    setVals(data);
    originalVals.current = data;
    isDirty.current = false;
    setCustomFields(customEntries.map(([k])=>({ key:k, label:k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) })));
  }, [garment, measurements]);

  // Track if phone changed
  const phoneChanged = phone !== (initialPhone || '');

  function showToast(msg,type='success') { setToast({visible:true,msg,type}); setTimeout(()=>setToast(t=>({...t,visible:false})),2500); }

  function handleValsChange(newVals) {
    setVals(newVals);
    isDirty.current = JSON.stringify(newVals) !== JSON.stringify(originalVals.current);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Save phone as __phone meta key inside measurements
      const valsToSave = phoneChanged ? { ...vals, __phone: phone } : vals;
      await onSave(customerName, garment, valsToSave);
      originalVals.current = valsToSave;
      isDirty.current = false;
      showToast(`${garment} measurements saved!`);
    } catch(e) { showToast('Save failed. Try again.','error'); }
    finally { setSaving(false); }
  }

  function handleBackClick() {
    if (isDirty.current || phoneChanged) {
      setShowUnsaved(true);
    } else {
      onBack();
    }
  }

  async function handleSaveAndBack() {
    setShowUnsaved(false);
    await handleSave();
    onBack();
  }

  function addCustomField() {
    const label=newLabel.trim(); if(!label) return;
    const key=label.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
    if(!key||customFields.find(f=>f.key===key)) return;
    setCustomFields(prev=>[...prev,{key,label}]); setNewLabel(''); setAddMode(false);
  }
  function removeCustomField(key) { setCustomFields(prev=>prev.filter(f=>f.key!==key)); handleValsChange((()=>{ const n={...vals}; delete n[key]; return n; })()); }

  async function handlePDF() { setExporting('pdf'); try{await exportMeasurementsPDF(customerName,measurements||{});showToast('PDF downloaded!');}catch{showToast('PDF failed','error');}finally{setExporting('');} }
  async function handleExcel() { setExporting('xlsx'); try{await exportMeasurementsExcel(customerName,measurements||{});showToast('Excel downloaded!');}catch{showToast('Excel failed','error');}finally{setExporting('');} }

  const fields = GARMENT_FIELDS[garment]||[];
  const filledCount = Object.entries(vals).filter(([k,v])=>k!=='__phone'&&v!==''&&v!=null).length;
  const hasData = g => { const d=measurements?.[g]||{}; return Object.entries(d).some(([k,v])=>k!=='__phone'&&v!==''&&v!=null); };

  const cardBg     = isDark?'rgba(26,21,48,0.8)':T.card;
  const cardBorder = isDark?'rgba(155,127,212,0.2)':T.border;
  const labelColor = isDark?T.gold.d:T.violet.d;

  return (
    <div id='sff-measurement-form' style={{ padding:`0 ${T.sp.page}px 100px`, fontFamily:T.fontBody }}>
      <Toast message={toast.msg} visible={toast.visible} type={toast.type} />
      <UnsavedChangesDialog
        visible={showUnsaved}
        onSave={handleSaveAndBack}
        onDiscard={()=>{ setShowUnsaved(false); onBack(); }}
        onCancel={()=>setShowUnsaved(false)}
      />

      {/* Top bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, paddingTop:4 }}>
        <button onClick={handleBackClick} style={{ background:isDark?'rgba(255,255,255,0.05)':T.bg2, border:`1px solid ${T.border}`, borderRadius:T.r.md, padding:'8px 14px', fontSize:13, fontWeight:600, color:T.violet.d, cursor:'pointer', fontFamily:T.fontBody, display:'flex', alignItems:'center', gap:6 }}>← Back</button>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={handlePDF} disabled={!!exporting} style={{ padding:'8px 13px', borderRadius:T.r.md, fontSize:12, fontWeight:700, background:T.danger.bg, color:T.danger.text, border:`1px solid ${T.danger.border}`, cursor:'pointer', fontFamily:T.fontBody }}>{exporting==='pdf'?'…':'📄 PDF'}</button>
          <button onClick={handleExcel} disabled={!!exporting} style={{ padding:'8px 13px', borderRadius:T.r.md, fontSize:12, fontWeight:700, background:T.success.bg, color:T.success.text, border:`1px solid ${T.success.border}`, cursor:'pointer', fontFamily:T.fontBody }}>{exporting==='xlsx'?'…':'📊 Excel'}</button>
        </div>
      </div>

      {/* Customer card */}
      <div className="fade-up" style={{ background:cardBg, backdropFilter:isDark?'blur(16px)':'none', border:`1px solid ${cardBorder}`, borderRadius:T.r.lg, padding:16, marginBottom:18, boxShadow:T.sh.card, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:T.grad.card, pointerEvents:'none', borderRadius:'inherit' }} />
        <div style={{ display:'flex', alignItems:'center', gap:14, position:'relative' }}>
          <Avatar name={customerName} size={52} />
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:T.fontDisplay, fontSize:19, fontWeight:600, color:T.text, letterSpacing:'-.01em' }}>{customerName}</div>

            {/* Phone — inline edit */}
            {phoneEditMode ? (
              <div style={{ display:'flex', gap:6, marginTop:6, alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', border:`1.5px solid ${T.violet.d}`, borderRadius:T.r.md, background:isDark?'rgba(155,127,212,0.08)':T.bg, overflow:'hidden', boxShadow:`0 0 0 3px ${isDark?'rgba(155,127,212,0.12)':'rgba(123,94,167,0.1)'}` }}>
                  <span style={{ padding:'0 6px 0 10px', fontSize:12, color:T.muted, whiteSpace:'nowrap' }}>🇮🇳 +91</span>
                  <input
                    autoFocus
                    type="tel"
                    value={phone}
                    onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                    onKeyDown={e=>{ if(e.key==='Enter'||e.key==='Escape') setPhoneEditMode(false); }}
                    placeholder="Phone number"
                    style={{ padding:'7px 8px 7px 4px', border:'none', fontSize:13, fontFamily:T.fontBody, background:'transparent', color:T.text, outline:'none', WebkitTextFillColor:T.text, letterSpacing:1, width:130 }}
                  />
                </div>
                <button onClick={()=>setPhoneEditMode(false)} style={{ padding:'7px 12px', background:T.grad.brand, color:'#fff', border:'none', borderRadius:T.r.md, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:T.fontBody }}>✓</button>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                <span style={{ fontSize:12, color:T.muted }}>{phone ? `📞 +91 ${phone}` : 'No phone number'}</span>
                <button onClick={()=>setPhoneEditMode(true)} style={{ fontSize:10, fontWeight:700, color:T.violet.d, background:isDark?'rgba(155,127,212,0.12)':'#f3eff9', border:`1px solid ${isDark?'rgba(155,127,212,0.25)':T.violet.d+'33'}`, borderRadius:T.r.pill, padding:'2px 8px', cursor:'pointer', fontFamily:T.fontBody }}>
                  {phone ? 'Edit' : '+ Add'}
                </button>
              </div>
            )}
          </div>
          {filledCount>0 && (
            <div style={{ textAlign:'center', background:isDark?'rgba(155,127,212,0.15)':T.violet.pale||'#f3eff9', borderRadius:T.r.md, padding:'9px 13px', border:`1px solid ${isDark?'rgba(155,127,212,0.2)':T.violet.d+'33'}`, position:'relative' }}>
              <div style={{ fontSize:20, fontWeight:800, color:T.violet.d }}>{filledCount}</div>
              <div style={{ fontSize:10, color:T.violet.d, fontWeight:600, opacity:.7 }}>fields</div>
            </div>
          )}
        </div>
      </div>

      {/* Garment tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:18, overflowX:'auto', paddingBottom:4 }}>
        {GARMENTS.map(g => (
          <button key={g} onClick={()=>setGarment(g)} style={{
            padding:'8px 18px', borderRadius:T.r.pill, fontSize:13, fontWeight:600,
            border: garment===g?'1.5px solid transparent':`1.5px solid ${T.border}`,
            background: garment===g?T.grad.brand:(isDark?'rgba(255,255,255,0.05)':T.card),
            color: garment===g?'#fff':T.text2, cursor:'pointer', whiteSpace:'nowrap', textTransform:'capitalize',
            fontFamily:T.fontBody, position:'relative', boxShadow:garment===g?T.sh.brand:T.sh.xs, transition:'all .2s',
          }}>
            {g}
            {hasData(g) && <span style={{ position:'absolute', top:-3, right:-3, width:9, height:9, borderRadius:'50%', background:T.success.text, border:`2px solid ${T.bg}`, boxShadow:isDark?'0 0 6px rgba(74,222,128,.5)':'none' }} />}
          </button>
        ))}
      </div>

      {/* Standard fields */}
      <div className="stagger" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        {fields.map(f => (
          <MeasureField key={f.key} label={f.label} value={vals[f.key]||''} onChange={v=>handleValsChange({...vals,[f.key]:v})} T={T} isDark={isDark} />
        ))}
      </div>

      {/* Custom fields */}
      {customFields.length>0 && (
        <>
          <div style={{ fontSize:10, fontWeight:700, color:labelColor, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10, marginTop:4, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:14, height:1, background:isDark?T.grad.gold:T.grad.brand, opacity:.6 }} />Custom Fields
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
            {customFields.map(cf => (
              <MeasureField key={cf.key} label={cf.label} value={vals[cf.key]||''} onChange={v=>handleValsChange({...vals,[cf.key]:v})} removable onRemove={()=>removeCustomField(cf.key)} T={T} isDark={isDark} />
            ))}
          </div>
        </>
      )}

      {addMode ? (
        <div style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:T.r.lg, padding:14, marginBottom:14 }}>
          <div style={{ fontSize:10, color:labelColor, fontWeight:700, marginBottom:8, textTransform:'uppercase', letterSpacing:'.09em' }}>New custom measurement</div>
          <div style={{ display:'flex', gap:8 }}>
            <input autoFocus value={newLabel} onChange={e=>setNewLabel(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addCustomField();if(e.key==='Escape')setAddMode(false);}} placeholder="e.g. Armhole, Hip Curve"
              style={{ flex:1, ...inputBase(true,T) }} />
            <button onClick={addCustomField} style={{ padding:'11px 16px', background:T.grad.brand, color:'#fff', border:'none', borderRadius:T.r.md, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:T.fontBody, boxShadow:T.sh.brand }}>Add</button>
            <button onClick={()=>{setAddMode(false);setNewLabel('');}} style={{ padding:'11px 14px', background:isDark?'rgba(255,255,255,0.05)':T.bg2, color:T.muted, border:`1px solid ${T.border}`, borderRadius:T.r.md, fontSize:13, cursor:'pointer', fontFamily:T.fontBody }}>✕</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setAddMode(true)} style={{ width:'100%', padding:13, background:isDark?'linear-gradient(135deg,rgba(155,127,212,0.08),rgba(201,107,154,0.06))':'linear-gradient(135deg,#f3eff9,#fdf0f6)', border:`1.5px dashed ${isDark?'rgba(155,127,212,0.3)':T.violet.d+'55'}`, borderRadius:T.r.lg, color:T.violet.d, fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:14, fontFamily:T.fontBody, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <span style={{ fontSize:18 }}>+</span> Add Custom Measurement
        </button>
      )}

      <PrimaryButton onClick={handleSave} loading={saving}>
        Save {garment.charAt(0).toUpperCase()+garment.slice(1)} Measurements
      </PrimaryButton>
    </div>
  );
}

function MeasureField({ label, value, onChange, removable, onRemove, T, isDark }) {
  const [focused, setFocused] = useState(false);
  const filled = value!==''&&value!=null;
  return (
    <div className="fade-up" style={{
      background: filled?(isDark?'rgba(155,127,212,0.1)':T.violet.pale||'#f3eff9'):(isDark?'rgba(255,255,255,0.04)':T.bg),
      border:`1.5px solid ${focused?T.violet.d:filled?(isDark?'rgba(155,127,212,0.35)':T.violet.d+'44'):(isDark?'rgba(255,255,255,0.07)':T.border)}`,
      borderRadius:T.r.lg, padding:'12px 14px', position:'relative', transition:'all .2s',
      boxShadow:focused?`0 0 0 3px ${isDark?'rgba(155,127,212,0.12)':'rgba(123,94,167,0.1)'},${T.sh.sm}`:T.sh.xs,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
        <label style={{ fontSize:10, fontWeight:700, color:focused?(isDark?T.gold.d:T.violet.d):T.muted, textTransform:'uppercase', letterSpacing:'.07em', transition:'color .2s' }}>{label}</label>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ fontSize:9, color:T.muted }}>in</span>
          {removable&&<button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:T.danger.text, fontSize:12, padding:'0 2px', lineHeight:1 }}>✕</button>}
        </div>
      </div>
      <input type="number" step="0.5" min="0" value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} placeholder="—"
        style={{ border:'none', width:'100%', fontSize:28, fontWeight:800, background:'transparent', outline:'none', padding:0, fontFamily:T.fontBody, color:filled?T.violet.d:T.muted, transition:'color .2s', WebkitTextFillColor:filled?T.violet.d:T.muted }} />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { inputBase } from '../../styles/theme';
import { FocusInput, SelectInput, PrimaryButton, Toast } from '../shared';

const BLANK = { name: '', mobile: '', date: new Date().toISOString().split('T')[0], ddate: '', additionalInfo: '', total: '', material: '', given: '', status: 'In Progress' };
const calcBal = (t, g) => Math.max(0, parseFloat(t || 0) - parseFloat(g || 0));
const calcProf = (t, m) => Math.max(0, parseFloat(t || 0) - parseFloat(m || 0));
const emptyLine = () => ({ id: Date.now() + Math.random(), name: '', amount: '' });

// Parse itemLines saved from previous edits (stored in order.itemLines array in Firestore)
function initLines(order) {
  if (order?.itemLines?.length) return order.itemLines.map((l, i) => ({ id: Date.now() + i, name: l.name || '', amount: l.amount || '' }));
  return [emptyLine()];
}

export default function OrderModal({ order, onClose, onSave }) {
  const { theme: T, isDark } = useTheme();
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: '' });
  const [itemLines, setItemLines] = useState([emptyLine()]);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showToast = msg => { setToast({ visible: true, msg }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500); };

  useEffect(() => {
    const base = order?.id
      ? { ...BLANK, ...order, additionalInfo: order.additionalInfo || '' }
      : { ...BLANK, date: new Date().toISOString().split('T')[0] };
    setForm(base);
    // Restore structured item rows from saved itemLines array — never parsed from items string
    setItemLines(initLines(order));
  }, [order]);

  // ── Item lines logic ──────────────────────────────────────────
  function recalcTotal(lines) {
    const sum = lines.reduce((acc, l) => acc + (parseFloat(l.amount) || 0), 0);
    if (sum > 0) setForm(f => ({ ...f, total: String(sum) }));
  }

  function updateLine(id, field, val) {
    const updated = itemLines.map(l => l.id === id ? { ...l, [field]: val } : l);
    setItemLines(updated);
    recalcTotal(updated);
  }

  function addLine() {
    setItemLines(prev => [...prev, emptyLine()]);
  }

  function removeLine(id) {
    const updated = itemLines.filter(l => l.id !== id);
    const safe = updated.length ? updated : [emptyLine()];
    setItemLines(safe);
    recalcTotal(safe);
  }

  async function handleSave() {
    if (!form.name.trim()) return alert('Enter customer name');
    if (!form.total) return alert('Enter total amount');
    setSaving(true);
    try {
      // Save item rows as a clean array — completely separate from items textarea
      const cleanLines = itemLines
        .filter(l => l.name.trim())
        .map(l => ({ name: l.name.trim(), amount: parseFloat(l.amount) || 0 }));

      await onSave({
        ...form,
        // itemLines = structured rows stored as array
        itemLines: cleanLines,
        // additionalInfo = notes textarea
        additionalInfo: form.additionalInfo,
        total: parseFloat(form.total),
        material: parseFloat(form.material || 0),
        given: parseFloat(form.given || 0),
        balance: calcBal(form.total, form.given),
        profit: calcProf(form.total, form.material),
      });
      showToast('Order saved successfully!');
      onClose();
    } finally { setSaving(false); }
  }

  // ── Drag-to-close ─────────────────────────────────────────────
  const sheetRef = useRef(null);
  const dragStartY = useRef(null);
  const dragCurrentY = useRef(null);
  const isDragging = useRef(false);
  const CLOSE_THRESHOLD = 120;

  function onDragStart(e) {
    const touch = e.touches?.[0] || e;
    dragStartY.current = touch.clientY;
    dragCurrentY.current = touch.clientY;
    isDragging.current = true;
  }

  function onDragMove(e) {
    if (!isDragging.current || dragStartY.current === null) return;
    const touch = e.touches?.[0] || e;
    const delta = touch.clientY - dragStartY.current;
    dragCurrentY.current = touch.clientY;
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
      sheetRef.current.style.transition = 'none';
      const opacity = Math.max(0, 1 - delta / 300);
      if (sheetRef.current.parentElement)
        sheetRef.current.parentElement.style.background =
          T.isDark ? `rgba(0,0,0,${0.75 * opacity})` : `rgba(0,0,0,${0.4 * opacity})`;
    }
  }

  function onDragEnd() {
    if (!isDragging.current) return;
    isDragging.current = false;
    const delta = (dragCurrentY.current || 0) - (dragStartY.current || 0);
    if (sheetRef.current) {
      if (delta >= CLOSE_THRESHOLD) {
        sheetRef.current.style.transition = 'transform .28s cubic-bezier(.4,0,.2,1)';
        sheetRef.current.style.transform = 'translateY(110%)';
        setTimeout(onClose, 280);
      } else {
        sheetRef.current.style.transition = 'transform .25s cubic-bezier(.34,1.56,.64,1)';
        sheetRef.current.style.transform = 'translateY(0)';
        if (sheetRef.current.parentElement)
          sheetRef.current.parentElement.style.background =
            T.isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.4)';
      }
    }
    dragStartY.current = null;
    dragCurrentY.current = null;
  }

  const dateInput = (label, key, inputId) => (
    <div id={`sff-date-wrap-${inputId}`} style={{ marginBottom: 14 }}>
      <label htmlFor={`sff-input-${inputId}`} style={{ fontSize: 10, fontWeight: 700, color: T.isDark ? T.gold.d : T.violet.d, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody }}>{label}</label>
      <input id={`sff-input-${inputId}`} type="date" value={form[key]} onChange={e => upd(key, e.target.value)}
        style={{ ...inputBase(false, T), width: '65%', colorScheme: T.isDark ? 'dark' : 'light' }} />
    </div>
  );

  const itemTotal = itemLines.reduce((acc, l) => acc + (parseFloat(l.amount) || 0), 0);
  const labelColor = isDark ? T.gold.d : T.violet.d;
  const sheetBg = T.isDark ? 'rgba(14,11,26,0.98)' : 'rgba(255,255,255,0.98)';
  const sectionBg = T.isDark ? 'rgba(26,21,48,0.7)' : T.bg;
  const secBorder = T.isDark ? 'rgba(155,127,212,0.15)' : T.border;

  return (
    <div
      id="sff-order-modal-overlay"
      style={{ position: 'fixed', inset: 0, background: T.isDark ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Toast message={toast.msg} visible={toast.visible} />

      <div
        id="sff-order-modal-sheet"
        ref={sheetRef}
        className="scale-in"
        style={{
          background: sheetBg, backdropFilter: 'blur(30px)',
          borderRadius: `${T.r.xxl}px ${T.r.xxl}px 0 0`,
          width: '100%', maxHeight: '92vh', overflowY: 'auto',
          padding: '0 20px 52px', fontFamily: T.fontBody,
          border: `1px solid ${secBorder}`, borderBottom: 'none',
          boxShadow: T.isDark ? '0 -20px 60px rgba(0,0,0,.8)' : '0 -8px 40px rgba(26,22,37,.15)',
          willChange: 'transform',
        }}
      >
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: T.grad.brand, opacity: .5 }} />

        {/* Drag handle */}
        <div
          id="sff-modal-drag-handle"
          style={{ padding: '14px 0 8px', cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
          onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
          onMouseDown={onDragStart}
          onMouseMove={e => { if (isDragging.current) onDragMove(e); }}
          onMouseUp={onDragEnd}
        >
          <div style={{ width: 36, height: 4, background: T.isDark ? 'rgba(255,255,255,0.18)' : T.border, borderRadius: T.r.pill, margin: '0 auto' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingTop: 4 }}>
          <div>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 21, fontWeight: 600, color: T.text, letterSpacing: '-.01em' }}>
              {order?.id ? 'Edit Order' : 'New Order'}
            </div>
            {order?.sffId && (
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2, fontFamily: 'monospace' }}>{order.sffId}</div>
            )}
          </div>
          <button onClick={onClose} style={{ background: T.isDark ? 'rgba(255,255,255,0.06)' : T.bg2, border: `1px solid ${T.border}`, width: 34, height: 34, borderRadius: '50%', fontSize: 18, cursor: 'pointer', color: T.muted, display: 'flex', justifyContent: 'center', padding: '2px' }}>×</button>
        </div>

        {/* ── Customer section ──────────────────────────────────── */}
        <div style={{ background: sectionBg, borderRadius: T.r.lg, padding: 16, marginBottom: 10, border: `1px solid ${secBorder}`, boxShadow: T.sh.xs }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 1, background: isDark ? T.grad.gold : T.grad.brand, opacity: .6 }} />Customer Details
          </div>
          <FocusInput label="Customer Name" value={form.name} onChange={v => upd('name', v)} placeholder="e.g. Srija" required />
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody }}>Mobile Number</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ padding: '13px 12px', borderRadius: T.r.md, fontSize: 14, fontWeight: 600, color: T.text2, background: T.isDark ? 'rgba(255,255,255,0.05)' : T.bg2, border: `1.5px solid ${T.border}`, whiteSpace: 'nowrap' }}>🇮🇳 +91</div>
              <input type="tel" value={form.mobile || ''} onChange={e => upd('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="00000 00000"
                style={{ ...inputBase(false, T), flex: 1, letterSpacing: 1.2 }} />
            </div>
          </div>
          {dateInput('Order Date', 'date', 'order-date')}
          {dateInput('Delivery Date', 'ddate', 'delivery-date')}
        </div>

        {/* ── Item-wise amounts section ─────────────────────────── */}
        <div style={{ background: sectionBg, borderRadius: T.r.lg, padding: 16, marginBottom: 10, border: `1px solid ${secBorder}`, boxShadow: T.sh.xs }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '.12em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 1, background: isDark ? T.grad.gold : T.grad.brand, opacity: .6 }} />Item-wise Amounts
            </div>
            {itemTotal > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: T.violet.d, background: isDark ? 'rgba(155,127,212,0.15)' : '#f3eff9', padding: '3px 10px', borderRadius: T.r.pill, border: `1px solid ${isDark ? 'rgba(155,127,212,0.3)' : T.violet.d + '33'}` }}>
                Total: ₹{itemTotal.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Item rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            {itemLines.map((line, idx) => (
              <div key={line.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={line.name}
                  onChange={e => updateLine(line.id, 'name', e.target.value)}
                  placeholder={`Item ${idx + 1} e.g. Blouse`}
                  style={{ flex: 2, ...inputBase(false, T), marginBottom: 0, fontSize: 13, padding: '10px 12px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, border: `1.5px solid ${T.border}`, borderRadius: T.r.md, background: isDark ? 'rgba(255,255,255,0.03)' : T.bg, overflow: 'hidden' }}>
                  <span style={{ padding: '0 6px 0 10px', fontSize: 13, fontWeight: 700, color: T.muted }}>₹</span>
                  <input
                    type="number"
                    value={line.amount}
                    onChange={e => updateLine(line.id, 'amount', e.target.value)}
                    placeholder="0"
                    style={{ flex: 1, padding: '10px 8px 10px 2px', border: 'none', fontSize: 14, fontFamily: T.fontBody, background: 'transparent', color: T.text, outline: 'none', WebkitTextFillColor: T.text, fontWeight: 700 }}
                  />
                </div>
                {itemLines.length > 1 && (
                  <button onClick={() => removeLine(line.id)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(248,113,113,0.12)' : '#fdeaea', border: 'none', borderRadius: T.r.sm, cursor: 'pointer', color: T.danger.text, fontSize: 14, flexShrink: 0 }}>✕</button>
                )}
              </div>
            ))}
          </div>

          {/* Add item button */}
          <button onClick={addLine} style={{
            width: '100%', padding: '9px 0',
            background: isDark ? 'linear-gradient(135deg,rgba(155,127,212,0.06),rgba(201,107,154,0.04))' : 'linear-gradient(135deg,#f3eff9,#fdf0f6)',
            border: `1.5px dashed ${isDark ? 'rgba(155,127,212,0.3)' : T.violet.d + '55'}`,
            borderRadius: T.r.md, color: T.violet.d, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', fontFamily: T.fontBody, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14,
          }}>
            <span style={{ fontSize: 16 }}>+</span> Add Item
          </button>

          {/* Additional Info textarea — separate new field */}
          <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody }}>Additional Info (optional)</label>
          <textarea
            value={form.additionalInfo}
            onChange={e => upd('additionalInfo', e.target.value)}
            placeholder="Note..."
            rows={3}
            style={{ ...inputBase(false, T), width: '100%', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box' }}
          />

          {/* Old Stitching Items */}
          {form.items && <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.09em', fontFamily: T.fontBody }}>Stitching Items</label>
            <textarea
              value={form.items}
              onChange={e => upd('items', e.target.value)}
              placeholder=""
              rows={3}
              style={{ ...inputBase(false, T), width: '100%', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box' }}
            /></div>}
        </div>

        {/* ── Payment section ───────────────────────────────────── */}
        <div style={{ background: sectionBg, borderRadius: T.r.lg, padding: 16, marginBottom: 14, border: `1px solid ${secBorder}`, boxShadow: T.sh.xs }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 14, height: 1, background: isDark ? T.grad.gold : T.grad.brand, opacity: .6 }} />Payment Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FocusInput label="Total Amount *" value={form.total} onChange={v => upd('total', v)} type="number" prefix="₹" />
            <FocusInput label="Material Cost" value={form.material} onChange={v => upd('material', v)} type="number" prefix="₹" />
            <FocusInput label="Amount Given" value={form.given} onChange={v => upd('given', v)} type="number" prefix="₹" />
            <SelectInput label="Status" value={form.status} onChange={v => upd('status', v)} options={['In Progress', 'Delivered']} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: T.isDark ? 'rgba(255,255,255,0.03)' : T.bg2, borderRadius: T.r.md, padding: '14px 15px', border: `1px solid ${T.border}`, marginTop: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Balance Due</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: T.danger.text, letterSpacing: '-.01em' }}>₹{calcBal(form.total, form.given).toLocaleString('en-IN')}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>Profit</div>
              <div style={{ fontSize: 21, fontWeight: 800, color: T.success.text, letterSpacing: '-.01em' }}>₹{calcProf(form.total, form.material).toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        <PrimaryButton onClick={handleSave} loading={saving}>{order?.id ? 'Update Order' : '+ Save Order'}</PrimaryButton>
      </div>
    </div>
  );
}
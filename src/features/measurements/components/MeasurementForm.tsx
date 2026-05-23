import { useState, useEffect } from 'react';
import { Drawer } from '@mui/material';
import { Measurement, CustomerMeasurements } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { inputBase } from '@/theme/appTheme';

const GARMENT_TYPES = ['Blouse', 'Lehenga', 'Saree', 'Churidar', 'Frock', 'Gown', 'Pavadai', 'Kurti', 'Custom'];

const DEFAULT_FIELDS: Record<string, string[]> = {
  Blouse:    ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Sleeve Width', 'Length', 'Back Length', 'Neck Front', 'Neck Back'],
  Lehenga:   ['Waist', 'Hip', 'Length', 'Blouse Chest', 'Blouse Waist', 'Blouse Length'],
  Churidar:  ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Churidar Length', 'Bottom'],
  Frock:     ['Chest', 'Waist', 'Hip', 'Length', 'Shoulder', 'Sleeve Length'],
  Gown:      ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Length'],
  Saree:     ['Waist', 'Hip', 'Fall Length'],
  Pavadai:   ['Waist', 'Hip', 'Length'],
  Kurti:     ['Chest', 'Waist', 'Hip', 'Length', 'Shoulder', 'Sleeve Length'],
  Custom:    [],
};

interface MeasureFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onRemove: () => void;
  removable?: boolean;
}

function MeasureField({ label, value, onChange, onRemove, removable = true }: MeasureFieldProps) {
  const { T, isDark } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const filled = value !== '' && value != null;

  return (
    <div style={{
      background: filled ? (isDark ? 'rgba(155,127,212,0.1)' : T.violet.pale) : (isDark ? 'rgba(255,255,255,0.04)' : T.bg),
      border: `1.5px solid ${focused ? T.violet.d : filled ? (isDark ? 'rgba(155,127,212,0.35)' : T.violet.d + '44') : (isDark ? 'rgba(255,255,255,0.07)' : T.border)}`,
      borderRadius: T.r.lg,
      padding: '12px 14px',
      position: 'relative',
      transition: 'all .2s',
      boxShadow: focused ? `0 0 0 3px ${isDark ? 'rgba(155,127,212,0.12)' : 'rgba(123,94,167,0.1)'},${T.sh.sm}` : T.sh.xs,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: focused ? (isDark ? T.gold.d : T.violet.d) : T.muted, textTransform: 'uppercase', letterSpacing: '.07em', transition: 'color .2s' }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 9, color: T.muted }}>in</span>
          {removable && (
            <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.danger.text, fontSize: 12, padding: '0 2px', lineHeight: 1 }}>✕</button>
          )}
        </div>
      </div>
      <input
        type="number"
        step="0.5"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="—"
        style={{ border: 'none', width: '100%', fontSize: 28, fontWeight: 800, background: 'transparent', outline: 'none', padding: 0, fontFamily: T.fontBody, color: filled ? T.violet.d : T.muted, transition: 'color .2s', WebkitTextFillColor: filled ? T.violet.d : T.muted }}
      />
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { customerName: string; customerPhone: string; garments: CustomerMeasurements; notes: string }) => Promise<void>;
  loading?: boolean;
  defaultValues?: Measurement;
}

export default function MeasurementForm({ open, onClose, onSubmit, loading, defaultValues }: Props) {
  const { T, isDark } = useAppTheme();

  const [customerName,   setCustomerName]   = useState(defaultValues?.customerName || '');
  const [customerPhone,  setCustomerPhone]  = useState(defaultValues?.customerPhone || '');
  const [notes,          setNotes]          = useState(defaultValues?.notes || '');
  const [activeGarment,  setActiveGarment]  = useState<string>(
    defaultValues ? Object.keys(defaultValues.garments)[0] || 'Blouse' : 'Blouse',
  );
  const [selectedGarments, setSelectedGarments] = useState<string[]>(
    defaultValues ? Object.keys(defaultValues.garments) : ['Blouse'],
  );
  const [measurements, setMeasurements] = useState<CustomerMeasurements>(
    defaultValues?.garments || { Blouse: {} },
  );
  const [customFields, setCustomFields] = useState<Record<string, string[]>>(
    defaultValues
      ? Object.fromEntries(Object.entries(defaultValues.garments).map(([g, vals]) => [g, Object.keys(vals)]))
      : { Blouse: [...DEFAULT_FIELDS.Blouse] },
  );
  const [newFieldName, setNewFieldName] = useState('');
  const [addingField,  setAddingField]  = useState(false);

  useEffect(() => {
    if (open) {
      setCustomerName(defaultValues?.customerName || '');
      setCustomerPhone(defaultValues?.customerPhone || '');
      setNotes(defaultValues?.notes || '');
      const garments = defaultValues ? Object.keys(defaultValues.garments) : ['Blouse'];
      setSelectedGarments(garments);
      setActiveGarment(garments[0] || 'Blouse');
      setMeasurements(defaultValues?.garments || { Blouse: {} });
      setCustomFields(defaultValues
        ? Object.fromEntries(Object.entries(defaultValues.garments).map(([g, vals]) => [g, Object.keys(vals)]))
        : { Blouse: [...DEFAULT_FIELDS.Blouse] });
    }
  }, [open]);

  function toggleGarment(garment: string) {
    if (selectedGarments.includes(garment)) {
      if (selectedGarments.length === 1) return;
      const next = selectedGarments.find(g => g !== garment) || '';
      setSelectedGarments(g => g.filter(x => x !== garment));
      setMeasurements(m => { const c = { ...m }; delete c[garment]; return c; });
      if (activeGarment === garment) setActiveGarment(next);
    } else {
      setSelectedGarments(g => [...g, garment]);
      setMeasurements(m => ({ ...m, [garment]: {} }));
      setCustomFields(f => ({ ...f, [garment]: [...(DEFAULT_FIELDS[garment] || [])] }));
      setActiveGarment(garment);
    }
  }

  function setField(field: string, value: string) {
    setMeasurements(m => ({ ...m, [activeGarment]: { ...m[activeGarment], [field]: value } }));
  }

  function removeField(field: string) {
    setCustomFields(f => ({ ...f, [activeGarment]: f[activeGarment].filter(x => x !== field) }));
    setMeasurements(m => { const c = { ...m[activeGarment] }; delete c[field]; return { ...m, [activeGarment]: c }; });
  }

  function addCustomField() {
    if (!newFieldName.trim()) return;
    setCustomFields(f => ({ ...f, [activeGarment]: [...(f[activeGarment] || []), newFieldName.trim()] }));
    setNewFieldName('');
    setAddingField(false);
  }

  async function handleSave() {
    if (!customerName.trim()) return;
    await onSubmit({ customerName, customerPhone, garments: measurements, notes });
    onClose();
  }

  const fields = customFields[activeGarment] || DEFAULT_FIELDS[activeGarment] || [];
  const filledCount = fields.filter(f => measurements[activeGarment]?.[f]).length;
  const hasData = (g: string) => {
    const d = measurements[g] || {};
    return Object.values(d).some(v => v !== '' && v != null);
  };

  const labelColor = isDark ? T.gold.d : T.violet.d;
  const cardBg     = isDark ? 'rgba(26,21,48,0.8)' : T.card;
  const cardBorder = isDark ? 'rgba(155,127,212,0.2)' : T.border;
  const sheetBg    = T.isDark ? 'rgba(14,11,26,0.98)' : 'rgba(255,255,255,0.98)';
  const secBorder  = isDark ? 'rgba(155,127,212,0.15)' : T.border;
  const sectionBg  = isDark ? 'rgba(26,21,48,0.7)' : T.bg;

  const initials = customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: sheetBg,
          backdropFilter: 'blur(30px)',
          borderRadius: `${T.r.xxl}px ${T.r.xxl}px 0 0`,
          maxHeight: '95dvh',
          overflowY: 'auto',
          fontFamily: T.fontBody,
          border: `1px solid ${secBorder}`,
          borderBottom: 'none',
          boxShadow: T.isDark ? '0 -20px 60px rgba(0,0,0,.8)' : '0 -8px 40px rgba(26,22,37,.15)',
          padding: '0 20px 80px',
          backgroundImage: 'none',
        },
      }}
    >
      {/* Top accent line */}
      <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: T.grad.brand, opacity: .5 }} />

      {/* Drag handle */}
      <div style={{ padding: '14px 0 4px' }}>
        <div style={{ width: 36, height: 4, background: isDark ? 'rgba(255,255,255,0.18)' : T.border, borderRadius: T.r.pill, margin: '0 auto' }} />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 4 }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 21, fontWeight: 600, color: T.text, letterSpacing: '-.01em' }}>
          {defaultValues ? 'Edit Measurements' : 'New Measurements'}
        </div>
        <button onClick={onClose} style={{ background: isDark ? 'rgba(255,255,255,0.06)' : T.bg2, border: `1px solid ${T.border}`, width: 34, height: 34, borderRadius: '50%', fontSize: 18, cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      </div>

      {/* Customer card */}
      <div style={{ background: cardBg, backdropFilter: isDark ? 'blur(16px)' : 'none', border: `1px solid ${cardBorder}`, borderRadius: T.r.lg, padding: 16, marginBottom: 18, boxShadow: T.sh.card, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: T.grad.card, pointerEvents: 'none', borderRadius: 'inherit' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          {/* Avatar */}
          <div style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, background: T.grad.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{initials}</span>
          </div>
          <div style={{ flex: 1 }}>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Customer Name *"
              style={{ border: 'none', outline: 'none', background: 'transparent', padding: 0, fontSize: 19, fontWeight: 600, fontFamily: T.fontDisplay, color: T.text, WebkitTextFillColor: T.text, width: '100%', letterSpacing: '-.01em' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap' }}>🇮🇳 +91</span>
              <input
                type="tel"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Phone number"
                style={{ border: 'none', outline: 'none', background: 'transparent', padding: 0, fontSize: 13, fontFamily: T.fontBody, color: T.muted, WebkitTextFillColor: T.muted, width: '100%', letterSpacing: 1 }}
              />
            </div>
          </div>
          {filledCount > 0 && (
            <div style={{ textAlign: 'center', background: isDark ? 'rgba(155,127,212,0.15)' : T.violet.pale, borderRadius: T.r.md, padding: '9px 13px', border: `1px solid ${isDark ? 'rgba(155,127,212,0.2)' : T.violet.d + '33'}` }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: T.violet.d }}>{filledCount}</div>
              <div style={{ fontSize: 10, color: T.violet.d, fontWeight: 600, opacity: .7 }}>filled</div>
            </div>
          )}
        </div>
      </div>

      {/* Garment tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto', paddingBottom: 4 }}>
        {GARMENT_TYPES.map(g => {
          const selected = selectedGarments.includes(g);
          const isActive = activeGarment === g;
          return (
            <button
              key={g}
              onClick={() => { if (selected) setActiveGarment(g); else toggleGarment(g); }}
              style={{
                padding: '8px 18px', borderRadius: T.r.pill, fontSize: 13, fontWeight: 600,
                border: selected ? '1.5px solid transparent' : `1.5px solid ${T.border}`,
                background: selected && isActive ? T.grad.brand : selected ? (isDark ? 'rgba(255,255,255,0.05)' : T.violet.pale) : (isDark ? 'rgba(255,255,255,0.03)' : T.card),
                color: selected && isActive ? '#fff' : selected ? T.violet.d : T.text2,
                cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize',
                fontFamily: T.fontBody, boxShadow: selected && isActive ? T.sh.brand : T.sh.xs,
                transition: 'all .2s', position: 'relative', flexShrink: 0,
              }}
            >
              {g}
              {hasData(g) && (
                <span style={{ position: 'absolute', top: -3, right: -3, width: 9, height: 9, borderRadius: '50%', background: selected && isActive ? 'rgba(255,255,255,.8)' : T.success.text, border: `2px solid ${T.bg}` }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Active garment section header */}
      <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 1, background: isDark ? T.grad.gold : T.grad.brand, opacity: .6 }} />
          {activeGarment} Measurements ({filledCount}/{fields.length} filled)
        </div>
        {selectedGarments.includes(activeGarment) && selectedGarments.length > 1 && (
          <button onClick={() => toggleGarment(activeGarment)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: T.danger.text, fontFamily: T.fontBody, fontWeight: 600 }}>✕ Remove</button>
        )}
      </div>

      {/* Measurement fields grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {fields.map(field => (
          <MeasureField
            key={field}
            label={field}
            value={measurements[activeGarment]?.[field] || ''}
            onChange={v => setField(field, v)}
            onRemove={() => removeField(field)}
          />
        ))}
      </div>

      {/* Add custom field */}
      {addingField ? (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: T.r.lg, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: labelColor, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.09em' }}>New custom measurement</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={newFieldName}
              onChange={e => setNewFieldName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCustomField(); if (e.key === 'Escape') setAddingField(false); }}
              placeholder="e.g. Armhole, Hip Curve"
              style={{ flex: 1, ...inputBase(true, T) }}
            />
            <button onClick={addCustomField} style={{ padding: '11px 16px', background: T.grad.brand, color: '#fff', border: 'none', borderRadius: T.r.md, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.fontBody, boxShadow: T.sh.brand }}>Add</button>
            <button onClick={() => { setAddingField(false); setNewFieldName(''); }} style={{ padding: '11px 14px', background: isDark ? 'rgba(255,255,255,0.05)' : T.bg2, color: T.muted, border: `1px solid ${T.border}`, borderRadius: T.r.md, fontSize: 13, cursor: 'pointer', fontFamily: T.fontBody }}>✕</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingField(true)}
          style={{ width: '100%', padding: 13, background: isDark ? 'linear-gradient(135deg,rgba(155,127,212,0.08),rgba(201,107,154,0.06))' : 'linear-gradient(135deg,#f3eff9,#fdf0f6)', border: `1.5px dashed ${isDark ? 'rgba(155,127,212,0.3)' : T.violet.d + '55'}`, borderRadius: T.r.lg, color: T.violet.d, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 14, fontFamily: T.fontBody, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <span style={{ fontSize: 18 }}>+</span> Add Custom Measurement
        </button>
      )}

      {/* Notes */}
      <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 14, height: 1, background: isDark ? T.grad.gold : T.grad.brand, opacity: .6 }} />Notes (optional)
      </div>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Fitting notes, special instructions…"
        rows={3}
        style={{ ...inputBase(false, T), resize: 'vertical', lineHeight: 1.5, marginBottom: 14 }}
      />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={loading || !customerName.trim()}
        style={{ width: '100%', padding: 14, background: (loading || !customerName.trim()) ? (isDark ? 'rgba(255,255,255,0.06)' : T.bg2) : T.grad.brand, color: (loading || !customerName.trim()) ? T.muted : '#fff', border: 'none', borderRadius: T.r.md, fontSize: 15, fontFamily: T.fontBody, fontWeight: 600, cursor: (loading || !customerName.trim()) ? 'not-allowed' : 'pointer', letterSpacing: '.02em', transition: 'all .2s', boxShadow: (loading || !customerName.trim()) ? 'none' : T.sh.brand, opacity: (loading || !customerName.trim()) ? .5 : 1 }}
      >
        {loading ? 'Saving…' : (defaultValues ? `Update ${activeGarment} Measurements` : `Save ${activeGarment} Measurements`)}
      </button>
    </Drawer>
  );
}

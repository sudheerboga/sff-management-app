import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation, useBlocker } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { useAppTheme } from '@/hooks/useAppTheme';
import { inputBase, AppTheme } from '@/theme/appTheme';
import { useMeasurements } from './hooks/useMeasurements';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Measurement, CustomerMeasurements } from '@/types';

const GARMENT_TYPES = ['Blouse', 'Lehenga', 'Saree', 'Churidar', 'Frock', 'Gown', 'Pavadai', 'Kurti', 'Custom'];

const DEFAULT_FIELDS: Record<string, string[]> = {
  Blouse:   ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Sleeve Width', 'Length', 'Back Length', 'Neck Front', 'Neck Back'],
  Lehenga:  ['Waist', 'Hip', 'Length', 'Blouse Chest', 'Blouse Waist', 'Blouse Length'],
  Churidar: ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Churidar Length', 'Bottom'],
  Frock:    ['Chest', 'Waist', 'Hip', 'Length', 'Shoulder', 'Sleeve Length'],
  Gown:     ['Chest', 'Waist', 'Hip', 'Shoulder', 'Sleeve Length', 'Length'],
  Saree:    ['Waist', 'Hip', 'Fall Length'],
  Pavadai:  ['Waist', 'Hip', 'Length'],
  Kurti:    ['Chest', 'Waist', 'Hip', 'Length', 'Shoulder', 'Sleeve Length'],
  Custom:   [],
};

interface CustomerInputProps {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; prefix?: string; required?: boolean; error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  T: AppTheme; isDark: boolean;
}
function CustomerInput({ label, value, onChange, placeholder, prefix, required, error, inputMode, T, isDark }: CustomerInputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: hasError ? T.danger.text : focused ? (isDark ? T.gold.d : T.violet.d) : T.muted, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, transition: 'color .2s' }}>
        {label}{required && <span style={{ color: T.danger.text, marginLeft: 2 }}>*</span>}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center',
        border: `1.5px solid ${hasError ? T.danger.border : focused ? T.violet.d : T.border}`,
        borderRadius: T.r.md, background: focused ? T.inputFocusBg : T.inputBg,
        boxShadow: hasError
          ? `0 0 0 3px ${isDark ? 'rgba(248,113,113,0.15)' : 'rgba(139,32,32,0.10)'}`
          : focused ? `0 0 0 3px ${isDark ? 'rgba(155,127,212,0.15)' : 'rgba(123,94,167,0.12)'}` : T.sh.inner,
        transition: 'all .2s', overflow: 'hidden',
      }}>
        {prefix && (
          <span style={{ padding: '0 10px 0 14px', fontSize: 13, color: T.muted, borderRight: `1px solid ${T.border}`, whiteSpace: 'nowrap', flexShrink: 0, lineHeight: '46px' }}>
            {prefix}
          </span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          inputMode={inputMode}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none',
            padding: '13px 14px',
            fontSize: 15, fontFamily: T.fontBody,
            background: 'transparent', color: T.text, WebkitTextFillColor: T.text,
          }}
        />
      </div>
      {hasError && (
        <div style={{ fontSize: 12, color: T.danger.text, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}
    </div>
  );
}

interface MeasureFieldProps {
  label: string; value: string;
  onChange: (v: string) => void; onRemove: () => void;
  removable?: boolean; T: AppTheme; isDark: boolean;
}
function MeasureField({ label, value, onChange, onRemove, removable = true, T, isDark }: MeasureFieldProps) {
  const [focused, setFocused] = useState(false);
  const filled = value !== '' && value != null;
  return (
    <div style={{
      background: filled ? (isDark ? 'rgba(155,127,212,0.1)' : T.violet.pale) : (isDark ? 'rgba(255,255,255,0.04)' : T.bg),
      border: `1.5px solid ${focused ? T.violet.d : filled ? (isDark ? 'rgba(155,127,212,0.35)' : T.violet.d + '44') : (isDark ? 'rgba(255,255,255,0.07)' : T.border)}`,
      borderRadius: T.r.lg, padding: '10px 12px', transition: 'all .2s',
      boxShadow: focused ? `0 0 0 3px ${isDark ? 'rgba(155,127,212,0.12)' : 'rgba(123,94,167,0.1)'},${T.sh.sm}` : T.sh.xs,
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: focused ? (isDark ? T.gold.d : T.violet.d) : T.muted, textTransform: 'uppercase', letterSpacing: '.06em', transition: 'color .2s', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 4 }}>
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: T.muted }}>in</span>
          {removable && (
            <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.danger.text, fontSize: 11, padding: '0 2px', lineHeight: 1 }}>✕</button>
          )}
        </div>
      </div>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="—"
        style={{
          border: 'none', width: '100%', minWidth: 0, fontSize: 24, fontWeight: 800,
          background: 'transparent', outline: 'none', padding: 0,
          fontFamily: T.fontBody, color: filled ? T.violet.d : T.muted,
          transition: 'color .2s', WebkitTextFillColor: filled ? T.violet.d : T.muted,
          display: 'block',
        }}
      />
    </div>
  );
}

export default function MeasurementFormPage() {
  const { T, isDark } = useAppTheme();
  const muiTheme    = useTheme();
  const isDesktop   = useMediaQuery(muiTheme.breakpoints.up('md'));
  const navigate    = useNavigate();
  const location    = useLocation();
  const { measurementId } = useParams<{ measurementId?: string }>();
  const isEdit = !!measurementId;
  const { query, createMutation, updateMutation } = useMeasurements();

  const defaultValues: Measurement | undefined =
    (location.state as { measurement?: Measurement })?.measurement ??
    (measurementId ? query.data?.find((m) => m.id === measurementId) : undefined);

  const [customerName,     setCustomerName]     = useState(defaultValues?.customerName  || '');
  const [customerPhone,    setCustomerPhone]    = useState(defaultValues?.customerPhone || '');
  const [notes,            setNotes]            = useState(defaultValues?.notes || '');
  const [activeGarment,    setActiveGarment]    = useState<string>(defaultValues ? Object.keys(defaultValues.garments)[0] || 'Blouse' : 'Blouse');
  const [selectedGarments, setSelectedGarments] = useState<string[]>(defaultValues ? Object.keys(defaultValues.garments) : ['Blouse']);
  const [measurements,     setMeasurements]     = useState<CustomerMeasurements>(defaultValues?.garments || { Blouse: {} });
  const [customFields,     setCustomFields]     = useState<Record<string, string[]>>(
    defaultValues
      ? Object.fromEntries(Object.entries(defaultValues.garments).map(([g, vals]) => [g, Object.keys(vals)]))
      : { Blouse: [...DEFAULT_FIELDS.Blouse] },
  );
  const [newFieldName, setNewFieldName] = useState('');
  const [addingField,  setAddingField]  = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    if (defaultValues && isEdit) {
      setCustomerName(defaultValues.customerName  || '');
      setCustomerPhone(defaultValues.customerPhone || '');
      setNotes(defaultValues.notes || '');
      const garments = Object.keys(defaultValues.garments);
      setSelectedGarments(garments);
      setActiveGarment(garments[0] || 'Blouse');
      setMeasurements(defaultValues.garments);
      setCustomFields(Object.fromEntries(Object.entries(defaultValues.garments).map(([g, vals]) => [g, Object.keys(vals)])));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.id]);

  const isDirty = useMemo(() => {
    if (isEdit) return customerName !== (defaultValues?.customerName || '') || customerPhone !== (defaultValues?.customerPhone || '');
    return customerName.trim().length > 0 || customerPhone.length > 0;
  }, [isEdit, customerName, customerPhone, defaultValues]);

  const duplicateNameError = useMemo(() => {
    const trimmed = customerName.trim().toLowerCase();
    if (!trimmed) return '';
    const exists = (query.data || []).some(
      (m) => m.customerName.trim().toLowerCase() === trimmed && m.id !== measurementId,
    );
    return exists ? `"${customerName.trim()}" already has a measurement record` : '';
  }, [customerName, query.data, measurementId]);

  const blocker = useBlocker(() => !savedRef.current && isDirty);

  function toggleGarment(garment: string) {
    if (selectedGarments.includes(garment)) {
      if (selectedGarments.length === 1) return;
      const next = selectedGarments.find((g) => g !== garment) || '';
      setSelectedGarments((g) => g.filter((x) => x !== garment));
      setMeasurements((m) => { const c = { ...m }; delete c[garment]; return c; });
      if (activeGarment === garment) setActiveGarment(next);
    } else {
      setSelectedGarments((g) => [...g, garment]);
      setMeasurements((m) => ({ ...m, [garment]: {} }));
      setCustomFields((f) => ({ ...f, [garment]: [...(DEFAULT_FIELDS[garment] || [])] }));
      setActiveGarment(garment);
    }
  }

  function setField(field: string, value: string) {
    setMeasurements((m) => ({ ...m, [activeGarment]: { ...m[activeGarment], [field]: value } }));
  }

  function removeField(field: string) {
    setCustomFields((f) => ({ ...f, [activeGarment]: f[activeGarment].filter((x) => x !== field) }));
    setMeasurements((m) => { const c = { ...m[activeGarment] }; delete c[field]; return { ...m, [activeGarment]: c }; });
  }

  function addCustomField() {
    if (!newFieldName.trim()) return;
    setCustomFields((f) => ({ ...f, [activeGarment]: [...(f[activeGarment] || []), newFieldName.trim()] }));
    setNewFieldName('');
    setAddingField(false);
  }

  const loading = createMutation.isPending || updateMutation.isPending;

  async function handleSave() {
    if (!customerName.trim()) return;
    const data = { customerName, customerPhone, garments: measurements, notes };
    if (isEdit && measurementId) {
      await updateMutation.mutateAsync({ id: measurementId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    savedRef.current = true;
    navigate(-1);
  }

  const fields      = customFields[activeGarment] || DEFAULT_FIELDS[activeGarment] || [];
  const filledCount = fields.filter((f) => measurements[activeGarment]?.[f]).length;
  const hasData     = (g: string) => Object.values(measurements[g] || {}).some((v) => v !== '' && v != null);

  const labelColor    = isDark ? T.gold.d : T.violet.d;
  const cardBg        = isDark ? 'rgba(26,21,48,0.8)' : T.card;
  const cardBorder    = isDark ? 'rgba(155,127,212,0.2)' : T.border;
  const saveBarBottom = isDesktop ? 0 : 64;
  const mf            = { T, isDark };
  // 2 cols on sm+, 1 col on phones below 400px
  const gridCols      = isDesktop ? 'repeat(3, minmax(0,1fr))' : 'repeat(2, minmax(0,1fr))';

  return (
    <div style={{ fontFamily: T.fontBody, paddingBottom: isDesktop ? 90 : 160, display: 'grid'}}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate(-1)}
          style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${T.border}`, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text2, flexShrink: 0 }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: T.fontDisplay, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isEdit ? 'Edit Measurements' : 'New Measurements'}
        </div>
      </div>

      {/* ── Customer fields ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <CustomerInput
          label="Customer Name" required
          value={customerName} onChange={setCustomerName}
          placeholder="e.g. Name"
          error={duplicateNameError}
          T={T} isDark={isDark}
        />
        <CustomerInput
          label="Phone Number"
          value={customerPhone}
          onChange={(v) => setCustomerPhone(v.replace(/\D/g, '').slice(0, 10))}
          placeholder="10-digit mobile number"
          prefix="+91" inputMode="tel"
          T={T} isDark={isDark}
        />
      </div>

      {/* ── Garment tabs — horizontally scrollable ── */}
      <div style={{ overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
          {GARMENT_TYPES.map((g) => {
            const selected = selectedGarments.includes(g);
            const isActive = activeGarment === g;
            return (
              <button key={g}
                onClick={() => { if (selected) setActiveGarment(g); else toggleGarment(g); }}
                style={{
                  padding: '7px 16px', borderRadius: T.r.pill, fontSize: 13, fontWeight: 600,
                  border: selected ? '1.5px solid transparent' : `1.5px solid ${T.border}`,
                  background: selected && isActive ? T.grad.brand : selected ? (isDark ? 'rgba(255,255,255,0.05)' : T.violet.pale) : (isDark ? 'rgba(255,255,255,0.03)' : T.card),
                  color: selected && isActive ? '#fff' : selected ? T.violet.d : T.text2,
                  cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: T.fontBody,
                  boxShadow: selected && isActive ? T.sh.brand : T.sh.xs,
                  transition: 'all .2s', position: 'relative',
                }}>
                {g}
                {hasData(g) && (
                  <span style={{ position: 'absolute', top: -3, right: -3, width: 8, height: 8, borderRadius: '50%', background: selected && isActive ? 'rgba(255,255,255,.8)' : T.success.text, border: `2px solid ${T.bg}` }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Garment label ── */}
      <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, overflow: 'hidden' }}>
          <div style={{ width: 14, height: 1, background: isDark ? T.grad.gold : T.grad.brand, opacity: .6, flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeGarment} ({filledCount}/{fields.length} filled)
          </span>
        </div>
        {/* {selectedGarments.includes(activeGarment) && selectedGarments.length > 1 && (
          <button onClick={() => toggleGarment(activeGarment)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: T.danger.text, fontFamily: T.fontBody, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>✕ Remove</button>
        )} */}
      </div>

      {/* ── Measurement fields grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 10, marginBottom: 12 }}>
        {fields.map((field) => (
          <MeasureField key={field} label={field} value={measurements[activeGarment]?.[field] || ''}
            onChange={(v) => setField(field, v)} onRemove={() => removeField(field)} {...mf} />
        ))}
      </div>

      {/* ── Add custom field ── */}
      {addingField ? (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: T.r.md, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: labelColor, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.09em' }}>New custom measurement</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input autoFocus value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addCustomField(); if (e.key === 'Escape') setAddingField(false); }}
              placeholder="e.g. Armhole, Hip Curve"
              style={{ flex: 1, minWidth: 0, ...inputBase(true, T), width: 'auto' }} />
            <button onClick={addCustomField} style={{ padding: '11px 16px', background: T.grad.brand, color: '#fff', border: 'none', borderRadius: T.r.md, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.fontBody, boxShadow: T.sh.brand, flexShrink: 0 }}>Add</button>
            <button onClick={() => { setAddingField(false); setNewFieldName(''); }} style={{ padding: '11px 14px', background: isDark ? 'rgba(255,255,255,0.05)' : T.bg2, color: T.muted, border: `1px solid ${T.border}`, borderRadius: T.r.md, fontSize: 13, cursor: 'pointer', fontFamily: T.fontBody, flexShrink: 0 }}>✕</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingField(true)}
          style={{ width: '100%', padding: 13, background: isDark ? 'linear-gradient(135deg,rgba(155,127,212,0.08),rgba(201,107,154,0.06))' : 'linear-gradient(135deg,#f3eff9,#fdf0f6)', border: `1.5px dashed ${isDark ? 'rgba(155,127,212,0.3)' : T.violet.d + '55'}`, borderRadius: T.r.lg, color: T.violet.d, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 14, fontFamily: T.fontBody, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxSizing: 'border-box' }}>
          <span style={{ fontSize: 18 }}>+</span> Add Custom Measurement
        </button>
      )}

      {/* ── Notes ── */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 1, background: isDark ? T.grad.gold : T.grad.brand, opacity: .6 }} />Notes (optional)
        </div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fitting notes, special instructions…" rows={3}
          style={{ ...inputBase(false, T), resize: 'vertical', lineHeight: 1.5 }} />
      </div>

      {/* ── Sticky save bar ── */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: saveBarBottom, padding: '12px 16px', background: isDark ? 'rgba(13,10,24,0.96)' : 'rgba(253,250,247,0.96)', backdropFilter: 'blur(16px)', borderTop: `1px solid ${T.border}`, zIndex: 50, paddingBottom: '2rem' }}>
        <button onClick={handleSave} disabled={loading || !customerName.trim() || !!duplicateNameError}
          style={{
            width: '100%', display: 'block',
            padding: '14px 0', border: 'none', borderRadius: T.r.md,
            background: (loading || !customerName.trim() || !!duplicateNameError) ? (isDark ? 'rgba(255,255,255,0.06)' : T.bg2) : T.grad.brand,
            color: (loading || !customerName.trim() || !!duplicateNameError) ? T.muted : '#fff',
            fontSize: 15, fontFamily: T.fontBody, fontWeight: 700,
            cursor: (loading || !customerName.trim() || !!duplicateNameError) ? 'not-allowed' : 'pointer',
            boxShadow: (loading || !customerName.trim() || !!duplicateNameError) ? 'none' : T.sh.brand,
            opacity: (loading || !customerName.trim() || !!duplicateNameError) ? .5 : 1,
            transition: 'all .2s',
          }}>
          {loading ? 'Saving…' : isEdit ? `Update Measurements` : `Save Measurements`}
        </button>
      </div>

      {/* ── Unsaved changes guard ── */}
      {blocker.state === 'blocked' && (
        <ConfirmDialog open title="Discard changes?" message="You have unsaved changes. Are you sure you want to leave?"
          confirmLabel="Discard" cancelLabel="Keep editing" confirmColor="error"
          onConfirm={() => blocker.proceed()} onCancel={() => blocker.reset()} />
      )}
    </div>
  );
}

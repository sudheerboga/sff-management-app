import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation, useBlocker } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import { useAppTheme } from '@/hooks/useAppTheme';
import { inputBase, AppTheme } from '@/theme/appTheme';
import { useMeasurements } from './hooks/useMeasurements';
import { useMeasurementTemplates } from './hooks/useMeasurementTemplates';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import CustomerMemberPicker from '@/components/common/CustomerMemberPicker';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { Measurement, CustomerMeasurements, CustomerPickResult, CustomerMember } from '@/types';



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
  const { query: customersQuery, createMutation: createCustomer, addMemberMutation } = useCustomers();
  const { query: templatesQuery } = useMeasurementTemplates();
  const templates = templatesQuery.data || [];
  const garmentTypes = templates.map((t) => t.name);
  const defaultFieldsMap = useMemo(
    () => Object.fromEntries(templates.map((t) => [t.name, t.fields])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [templates.map((t) => t.id + t.name).join(',')],
  );

  const defaultValues: Measurement | undefined =
    (location.state as { measurement?: Measurement })?.measurement ??
    (measurementId ? query.data?.find((m) => m.id === measurementId) : undefined);

  const prefillPhone    = (location.state as { prefillPhone?: string })?.prefillPhone || '';
  const prefillCustomer = (location.state as { prefillCustomer?: CustomerPickResult })?.prefillCustomer;

  const [customerPick, setCustomerPick] = useState<CustomerPickResult>({
    customerId:    defaultValues?.customerId    || prefillCustomer?.customerId    || '',
    customerName:  defaultValues?.customerName  || prefillCustomer?.customerName  || '',
    customerPhone: defaultValues?.customerPhone || prefillCustomer?.customerPhone || prefillPhone,
    memberName:    defaultValues?.memberName    || defaultValues?.customerName    || prefillCustomer?.memberName || '',
    memberId:      defaultValues?.memberId      || prefillCustomer?.memberId,
  });

  // Members of the selected customer who already have a measurement doc — their chips are disabled
  const measuredMemberIds = useMemo(
    () => new Set(
      (query.data || [])
        .filter((m) => m.customerId === customerPick.customerId && !m.isDeleted && m.memberId)
        .map((m) => m.memberId as string),
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query.data, customerPick.customerId],
  );
  const [pickErrors, setPickErrors] = useState<{ phone?: string; name?: string }>({});
  const [notes,            setNotes]            = useState(defaultValues?.notes || '');
  const [activeGarment,    setActiveGarment]    = useState<string>(defaultValues ? Object.keys(defaultValues.garments)[0] || 'Blouse' : 'Blouse');
  const [selectedGarments, setSelectedGarments] = useState<string[]>(defaultValues ? Object.keys(defaultValues.garments) : ['Blouse']);
  const [measurements,     setMeasurements]     = useState<CustomerMeasurements>(defaultValues?.garments || { Blouse: {} });
  const [customFields,     setCustomFields]     = useState<Record<string, string[]>>(
    defaultValues
      ? Object.fromEntries(Object.entries(defaultValues.garments).map(([g, vals]) => [g, Object.keys(vals)]))
      : {},
  );
  const [newFieldName, setNewFieldName] = useState('');
  const [addingField,  setAddingField]  = useState(false);
  const savedRef = useRef(false);


  // When templates load asynchronously, seed / refresh customFields for selected garments
  useEffect(() => {
    if (Object.keys(defaultFieldsMap).length === 0) return;
    if (isEdit && defaultValues) {
      setCustomFields(
        Object.fromEntries(
          Object.entries(defaultValues.garments).map(([g, vals]) => [
            g,
            [...new Set([...(defaultFieldsMap[g] || []), ...Object.keys(vals)])],
          ]),
        ),
      );
    } else if (!isEdit) {
      setCustomFields((prev) => {
        const next = { ...prev };
        selectedGarments.forEach((g) => {
          if (!next[g]) next[g] = [...(defaultFieldsMap[g] || [])];
        });
        return next;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFieldsMap]);

  useEffect(() => {
    if (defaultValues && isEdit) {
      setCustomerPick({
        customerId:    defaultValues.customerId   || '',
        customerName:  defaultValues.customerName || '',
        customerPhone: defaultValues.customerPhone || '',
        memberName:    defaultValues.memberName   || defaultValues.customerName || '',
        memberId:      defaultValues.memberId,
      });
      setNotes(defaultValues.notes || '');
      const garments = Object.keys(defaultValues.garments);
      setSelectedGarments(garments);
      setActiveGarment(garments[0] || '');
      setMeasurements(defaultValues.garments);
      setCustomFields(
        Object.fromEntries(
          garments.map((g) => [
            g,
            [...new Set([...(defaultFieldsMap[g] || []), ...Object.keys(defaultValues.garments[g] || {})])],
          ]),
        ),
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.id]);

  const isDirty = useMemo(() => {
    const garmentsDirty = JSON.stringify(measurements) !== JSON.stringify(defaultValues?.garments || {});
    const notesDirty    = notes !== (defaultValues?.notes || '');
    if (isEdit) {
      return (
        customerPick.customerName  !== (defaultValues?.customerName  || '') ||
        customerPick.customerPhone !== (defaultValues?.customerPhone || '') ||
        garmentsDirty || notesDirty
      );
    }
    return customerPick.customerName.trim().length > 0 || customerPick.customerPhone.length > 0 || garmentsDirty;
  }, [isEdit, customerPick, measurements, notes, defaultValues]);

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
      setCustomFields((f) => ({ ...f, [garment]: [...(defaultFieldsMap[garment] || [])] }));
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
  const submittingRef = useRef(false);

  async function handleSave() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    const errors: { phone?: string; name?: string } = {};
    if (!customerPick.customerName.trim()) errors.name = 'Customer name is required';
    setPickErrors(errors);
    if (Object.keys(errors).length) { submittingRef.current = false; return; }

    try {
      let resolvedCustomerId = customerPick.customerId;
      const pick = customerPick as CustomerPickResult & { _newMember?: CustomerMember };

      if (!resolvedCustomerId && customerPick.customerPhone) {
        resolvedCustomerId = await createCustomer.mutateAsync({
          name: customerPick.customerName,
          phone: customerPick.customerPhone,
          members: [{ id: Math.random().toString(36).slice(2), name: customerPick.customerName, relation: 'self' }],
        });
      } else if (resolvedCustomerId && pick._newMember) {
        await addMemberMutation.mutateAsync({ customerId: resolvedCustomerId, member: pick._newMember });
      }

      const data = {
        customerId:    resolvedCustomerId,
        memberName:    customerPick.memberName || customerPick.customerName,
        memberId:      customerPick.memberId,
        customerName:  customerPick.customerName,
        customerPhone: customerPick.customerPhone,
        garments:      measurements,
        notes,
      };
      if (isEdit && measurementId) {
        await updateMutation.mutateAsync({ id: measurementId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      savedRef.current = true;
      navigate(-1);
    } finally {
      submittingRef.current = false;
    }
  }

  const fields      = customFields[activeGarment] || [];
  const filledCount = fields.filter((f) => measurements[activeGarment]?.[f]).length;
  const hasData     = (g: string) => Object.values(measurements[g] || {}).some((v) => v !== '' && v != null);

  const labelColor    = isDark ? T.gold.d : T.violet.d;
  const cardBg        = isDark ? 'rgba(26,21,48,0.8)' : T.card;
  const cardBorder    = isDark ? 'rgba(155,127,212,0.2)' : T.border;
  const saveBarBottom = isDesktop ? 0 : 'calc(64px + env(safe-area-inset-bottom, 0px))';
  const mf            = { T, isDark };
  // 2 cols on sm+, 1 col on phones below 400px
  const gridCols      = isDesktop ? 'repeat(3, minmax(0,1fr))' : 'repeat(2, minmax(0,1fr))';

  return (
    <div style={{ fontFamily: T.fontBody, paddingBottom: isDesktop ? 90 : 'calc(160px + env(safe-area-inset-bottom, 0px))', display: 'grid'}}>

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
      <div style={{ marginBottom: 16 }}>
        {isEdit ? (
          /* Edit mode: show who this belongs to as read-only — no member switching */
          <div style={{
            padding: '12px 16px',
            background: isDark ? 'rgba(123,94,167,0.1)' : T.violet.pale,
            border: `1.5px solid ${T.violet.d}33`,
            borderRadius: T.r.md,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.grad.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>
                {customerPick.memberName && customerPick.memberName !== customerPick.customerName
                  ? customerPick.memberName
                  : customerPick.customerName}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                {customerPick.memberName && customerPick.memberName !== customerPick.customerName
                  ? `${customerPick.customerName} · ${customerPick.customerPhone}`
                  : customerPick.customerPhone}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.violet.d, background: isDark ? 'rgba(123,94,167,0.2)' : `${T.violet.d}18`, padding: '3px 10px', borderRadius: T.r.pill }}>
              Editing
            </span>
          </div>
        ) : (
          /* New mode: all members shown; chips with existing measurements are disabled */
          <CustomerMemberPicker
            value={customerPick}
            onChange={(v) => { setCustomerPick(v); setPickErrors({}); }}
            customers={customersQuery.data || []}
            errors={pickErrors}
            disabledMemberIds={measuredMemberIds}
            initialMemberId={prefillCustomer?.memberId}
          />
        )}
      </div>

      {/* ── Garment tabs — horizontally scrollable ── */}
      <div style={{ overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
          {garmentTypes.map((g) => {
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
          <span style={{ fontSize: 18 }}>+</span> Add More Items
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
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: saveBarBottom, padding: '12px 16px 2rem', background: isDark ? 'rgba(13,10,24,0.96)' : 'rgba(253,250,247,0.96)', backdropFilter: 'blur(16px)', borderTop: `1px solid ${T.border}`, zIndex: 50 }}>
        <button onClick={handleSave} disabled={loading || !customerPick.customerName.trim()}
          style={{
            width: '100%', display: 'block',
            padding: '14px 0', border: 'none', borderRadius: T.r.md,
            background: (loading || !customerPick.customerName.trim()) ? (isDark ? 'rgba(255,255,255,0.06)' : T.bg2) : T.grad.brand,
            color: (loading || !customerPick.customerName.trim()) ? T.muted : '#fff',
            fontSize: 15, fontFamily: T.fontBody, fontWeight: 700,
            cursor: (loading || !customerPick.customerName.trim()) ? 'not-allowed' : 'pointer',
            boxShadow: (loading || !customerPick.customerName.trim()) ? 'none' : T.sh.brand,
            opacity: (loading || !customerPick.customerName.trim()) ? .5 : 1,
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

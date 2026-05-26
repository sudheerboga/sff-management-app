import { useState, useMemo, useEffect, useRef } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';
import { inputBase } from '@/theme/appTheme';
import { Customer, CustomerPickResult, CustomerMember } from '@/types';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

interface Props {
  value: CustomerPickResult;
  onChange: (v: CustomerPickResult) => void;
  customers: Customer[];
  errors?: { phone?: string; name?: string };
  allowMemberSwitch?: boolean;
  disabledMemberIds?: Set<string>; // members with existing records — shown but non-selectable
  initialMemberId?: string;        // pre-select this member when customer auto-matches (e.g. from order nav)
}

export default function CustomerMemberPicker({ value, onChange, customers, errors, allowMemberSwitch = true, disabledMemberIds, initialMemberId }: Props) {
  const { T, isDark } = useAppTheme();

  // local phone input (raw — user types freely)
  const [phoneInput, setPhoneInput] = useState(value.customerPhone || '');
  const [nameFocused, setNameFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberNameFocused, setNewMemberNameFocused] = useState(false);
  const didAutoSelect = useRef(false);

  const cleanPhone = phoneInput.replace(/\D/g, '').slice(-10);

  const matchedCustomer = useMemo(
    () => (cleanPhone.length >= 10 ? customers.find((c) => c.phone === cleanPhone) ?? null : null),
    [cleanPhone, customers],
  );

  // When a customer is matched, auto-populate; when unmatched reset
  useEffect(() => {
    if (matchedCustomer) {
      if (!didAutoSelect.current || value.customerId !== matchedCustomer.id) {
        didAutoSelect.current = true;
        const preferred = initialMemberId
          ? matchedCustomer.members.find((m) => m.id === initialMemberId)
          : undefined;
        const self = preferred ?? matchedCustomer.members.find((m) => m.relation === 'self') ?? matchedCustomer.members[0];
        onChange({
          customerId: matchedCustomer.id,
          customerName: matchedCustomer.name,
          customerPhone: cleanPhone,
          memberName: self?.name ?? matchedCustomer.name,
          memberId: self?.id,
        });
      }
    } else {
      didAutoSelect.current = false;
      if (value.customerId) {
        // Customer deselected — reset to new customer state keeping the phone
        onChange({ customerId: '', customerName: value.customerName, customerPhone: cleanPhone, memberName: value.customerName });
      } else {
        onChange({ ...value, customerPhone: cleanPhone });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCustomer, cleanPhone]);

  function handlePhoneChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setPhoneInput(digits);
  }

  function handleNameChange(name: string) {
    onChange({ ...value, customerName: name, memberName: name });
  }

  function handleSelectMember(member: CustomerMember) {
    onChange({
      customerId: matchedCustomer!.id,
      customerName: matchedCustomer!.name,
      customerPhone: cleanPhone,
      memberName: member.name,
      memberId: member.id,
    });
    setShowAddMember(false);
  }

  const isDuplicateMember = !!matchedCustomer && matchedCustomer.members.some(
    (m) => m.name.toLowerCase() === newMemberName.trim().toLowerCase(),
  );

  function handleAddMember() {
    if (!newMemberName.trim() || !matchedCustomer || isDuplicateMember) return;
    const member: CustomerMember = {
      id: generateId(),
      name: newMemberName.trim(),
      relation: 'other',
    };
    // Optimistically update the picker value; caller should persist via addMemberMutation
    onChange({
      customerId: matchedCustomer.id,
      customerName: matchedCustomer.name,
      customerPhone: cleanPhone,
      memberName: member.name,
      memberId: member.id,
      _newMember: member,     // signal to parent to persist
    } as CustomerPickResult & { _newMember: CustomerMember });
    setShowAddMember(false);
    setNewMemberName('');
  }

  const labelStyle = (focused: boolean, hasError?: boolean): React.CSSProperties => ({
    fontSize: 10,
    fontWeight: 700,
    color: hasError ? T.danger.text : focused ? (isDark ? T.gold.d : T.violet.d) : T.muted,
    display: 'block',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '.09em',
    fontFamily: T.fontBody,
    transition: 'color .2s',
  });

  const isExisting = !!matchedCustomer;
  const accentColor = isDark ? T.gold.d : T.violet.d;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: T.fontBody }}>

      {/* Phone field */}
      <div>
        <label style={labelStyle(phoneFocused, !!errors?.phone)}>
          Phone Number <span style={{ color: T.danger.text }}>*</span>
        </label>
        <div style={{
          display: 'flex', alignItems: 'center',
          border: `1.5px solid ${errors?.phone ? T.danger.border : phoneFocused ? accentColor : T.border}`,
          borderRadius: T.r.md,
          background: phoneFocused ? T.inputFocusBg : T.inputBg,
          boxShadow: errors?.phone
            ? `0 0 0 3px ${isDark ? 'rgba(248,113,113,0.15)' : 'rgba(139,32,32,0.10)'}`
            : phoneFocused ? `0 0 0 3px ${isDark ? 'rgba(155,127,212,0.15)' : 'rgba(123,94,167,0.12)'}` : 'none',
          transition: 'all .2s', overflow: 'hidden',
        }}>
          <span style={{ padding: '0 8px 0 14px', fontSize: 14, fontWeight: 700, color: T.muted }}>+91</span>
          <input
            type="tel"
            inputMode="numeric"
            value={phoneInput}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
            placeholder="98765 43210"
            maxLength={10}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '13px 14px 13px 4px', fontSize: 15, fontFamily: T.fontBody, background: 'transparent', color: T.text, WebkitTextFillColor: T.text, fontWeight: 600, letterSpacing: 1, width: 0 }}
          />
          {isExisting && (
            <span style={{ marginRight: 12, fontSize: 11, fontWeight: 700, color: T.success.text, background: T.success.bg, padding: '3px 8px', borderRadius: T.r.sm, flexShrink: 0 }}>
              Existing
            </span>
          )}
        </div>
        {errors?.phone && (
          <span style={{ fontSize: 12, color: T.danger.text, marginTop: 4, display: 'block' }}>{errors.phone}</span>
        )}
      </div>

      {/* If phone matches an existing customer */}
      {isExisting ? (
        <div>
          {/* Account holder badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: isDark ? 'rgba(123,94,167,0.12)' : T.violet.pale,
            border: `1.5px solid ${T.violet.d}33`,
            borderRadius: T.r.md,
            marginBottom: 12,
          }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.grad.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{matchedCustomer.name}</div>
              <div style={{ fontSize: 11, color: T.muted }}>Account holder</div>
            </div>
          </div>

          {/* "Who is this for?" — existing member tabs (hidden when allowMemberSwitch is false) */}
          {allowMemberSwitch && (
            <>
              <label style={{ ...labelStyle(false), marginBottom: 8 }}>Who is this for?</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {matchedCustomer.members.map((m) => {
                  const active   = value.memberId === m.id;
                  const disabled = disabledMemberIds?.has(m.id) ?? false;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => !disabled && handleSelectMember(m)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: T.r.md,
                        border: `1.5px solid ${active ? accentColor : disabled ? T.border : T.border}`,
                        background: active
                          ? (isDark ? 'rgba(123,94,167,0.2)' : T.violet.pale)
                          : disabled
                            ? (isDark ? 'rgba(255,255,255,0.03)' : T.bg2)
                            : 'transparent',
                        color: active ? accentColor : disabled ? T.muted : T.text2,
                        fontSize: 13,
                        fontWeight: active ? 700 : 500,
                        fontFamily: T.fontBody,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.65 : 1,
                        transition: 'all .15s',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <span>{m.name}</span>
                      {disabled
                        ? <span style={{ fontSize: 10, fontWeight: 700, color: T.success.text }}>✓ Saved</span>
                        : <span style={{ fontSize: 10, opacity: .6, textTransform: 'capitalize' }}>{m.relation}</span>
                      }
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {/* Add new member button */}
            {!showAddMember && (
              <button
                type="button"
                onClick={() => setShowAddMember(true)}
                style={{
                  padding: '8px 14px',
                  borderRadius: T.r.md,
                  border: `1.5px dashed ${T.border}`,
                  background: 'transparent',
                  color: T.muted,
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: T.fontBody,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add member
              </button>
            )}
          </div>

          {/* Add member inline form */}
          {showAddMember && (
            <div style={{ marginTop: 10, padding: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : T.bg2, borderRadius: T.r.md, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>New family member</div>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddMember(); if (e.key === 'Escape') { setShowAddMember(false); setNewMemberName(''); } }}
                onFocus={() => setNewMemberNameFocused(true)}
                onBlur={() => setNewMemberNameFocused(false)}
                placeholder="Member name (Relation is optional)"
                style={{
                  ...inputBase(newMemberNameFocused, T),
                  borderColor: isDuplicateMember ? T.danger.border : newMemberNameFocused ? accentColor : T.border,
                }}
              />
              {isDuplicateMember && (
                <span style={{ fontSize: 12, color: T.danger.text, marginTop: 4, display: 'block' }}>
                  A member with this name already exists
                </span>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => { setShowAddMember(false); setNewMemberName(''); }}
                  style={{ flex: 1, padding: '9px', borderRadius: T.r.sm, border: `1px solid ${T.border}`, background: 'transparent', color: T.muted, fontSize: 13, fontWeight: 600, fontFamily: T.fontBody, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddMember}
                  disabled={!newMemberName.trim() || isDuplicateMember}
                  style={{ flex: 2, padding: '9px', borderRadius: T.r.sm, border: 'none', background: newMemberName.trim() && !isDuplicateMember ? T.grad.brand : T.bg2, color: newMemberName.trim() && !isDuplicateMember ? '#fff' : T.muted, fontSize: 13, fontWeight: 700, fontFamily: T.fontBody, cursor: newMemberName.trim() && !isDuplicateMember ? 'pointer' : 'default' }}
                >
                  Add {newMemberName.trim() || 'Member'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* New customer — show name field */
        <div>
          <label style={labelStyle(nameFocused, !!errors?.name)}>
            Customer Name <span style={{ color: T.danger.text }}>*</span>
          </label>
          <input
            type="text"
            value={value.customerName}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            placeholder="Full name"
            style={{
              ...inputBase(nameFocused, T),
              borderColor: errors?.name ? T.danger.border : nameFocused ? accentColor : T.border,
              boxShadow: errors?.name
                ? `0 0 0 3px ${isDark ? 'rgba(248,113,113,0.15)' : 'rgba(139,32,32,0.10)'}`
                : nameFocused ? `0 0 0 3px ${isDark ? 'rgba(155,127,212,0.15)' : 'rgba(123,94,167,0.12)'}` : 'none',
            }}
          />
          {errors?.name && (
            <span style={{ fontSize: 12, color: T.danger.text, marginTop: 4, display: 'block' }}>{errors.name}</span>
          )}
          {cleanPhone.length >= 10 && (
            <div style={{ marginTop: 8, fontSize: 12, color: T.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              New customer — a profile will be created automatically
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';
import { OrderStatus } from '@/types';
import DateInput from '@/components/common/DateInput';

export type DatePreset = 'all' | '7d' | '30d' | 'custom';
export interface OrderFilters {
  datePreset: DatePreset;
  dateFrom: string;
  dateTo: string;
  status: OrderStatus | 'all';
  balanceDue: boolean;
}

export const BLANK_FILTERS: OrderFilters = { datePreset: 'all', dateFrom: '', dateTo: '', status: 'all', balanceDue: false };

const DATE_OPTS: { v: DatePreset; label: string }[] = [
  { v: 'all',    label: 'All time' },
  { v: '7d',     label: 'Last 7 days' },
  { v: '30d',    label: 'Last 30 days' },
  { v: 'custom', label: 'Custom range' },
];

const STATUS_OPTS: { v: OrderStatus | 'all'; label: string }[] = [
  { v: 'all',         label: 'All' },
  { v: 'in-progress', label: 'In Progress' },
  { v: 'delivered',   label: 'Delivered' },
];

interface Props {
  open: boolean;
  initial: OrderFilters;
  onClose: () => void;
  onApply: (f: OrderFilters) => void;
}

export default function OrdersFilterSheet({ open, initial, onClose, onApply }: Props) {
  const { T } = useAppTheme();
  const [draft, setDraft] = useState<OrderFilters>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const pill = (active: boolean): React.CSSProperties => ({
    padding: '9px 16px',
    borderRadius: T.r.pill,
    border: `1.5px solid ${active ? T.violet.d : T.border}`,
    background: active ? `${T.violet.d}1a` : T.inputBg,
    color: active ? T.violet.d : T.text2,
    fontSize: 14, fontWeight: active ? 700 : 500,
    fontFamily: T.fontBody, cursor: 'pointer',
    transition: 'all .15s',
  });


  return (
    <>
      <style>{`@keyframes _sheet-up{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 1200,
          animation: 'none',
        }}
      />

      {/* Sheet panel */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          height: '82%',
          zIndex: 1201,
          background: T.card,
          borderRadius: '20px 20px 0 0',
          display: 'flex', flexDirection: 'column',
          animation: '_sheet-up .28s cubic-bezier(.4,0,.2,1)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          fontFamily: T.fontBody,
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: T.border }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px 16px', flexShrink: 0,
          borderBottom: `1px solid ${T.border}`,
        }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.text, fontFamily: T.fontDisplay }}>
            Filter Orders
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `1.5px solid ${T.border}`, background: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.text2,
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>

          {/* Date Range */}
          <section style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Date Range
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DATE_OPTS.map(({ v, label }) => (
                <button key={v} onClick={() => setDraft((d) => ({ ...d, datePreset: v }))} style={pill(draft.datePreset === v)}>
                  {label}
                </button>
              ))}
            </div>
            {draft.datePreset === 'custom' && (
              <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                <div style={{ flex: 1 }}>
                  <DateInput label="From" value={draft.dateFrom}
                    onChange={(v) => setDraft((d) => ({ ...d, dateFrom: v }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <DateInput label="To" value={draft.dateTo}
                    onChange={(v) => setDraft((d) => ({ ...d, dateTo: v }))} />
                </div>
              </div>
            )}
          </section>

          <div style={{ height: 1, background: T.border, marginBottom: 28 }} />

          {/* Status */}
          <section style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Status
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {STATUS_OPTS.map(({ v, label }) => (
                <button key={v} onClick={() => setDraft((d) => ({ ...d, status: v }))} style={pill(draft.status === v)}>
                  {label}
                </button>
              ))}
            </div>
          </section>

          <div style={{ height: 1, background: T.border, marginBottom: 28 }} />

          {/* Balance Due */}
          <section style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Payment
            </div>
            <button
              onClick={() => setDraft((d) => ({ ...d, balanceDue: !d.balanceDue }))}
              style={{
                ...pill(draft.balanceDue),
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              Balance Due
            </button>
          </section>
        </div>

        {/* Footer buttons */}
        <div style={{
          display: 'flex', gap: 12,
          padding: '16px 20px',
          borderTop: `1px solid ${T.border}`,
          flexShrink: 0,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}>
          <button
            onClick={() => setDraft(BLANK_FILTERS)}
            style={{
              flex: 1, padding: '14px 0',
              border: `1.5px solid ${T.border}`, borderRadius: T.r.md,
              background: 'none', color: T.text2,
              fontSize: 15, fontWeight: 600, fontFamily: T.fontBody, cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            onClick={() => onApply(draft)}
            style={{
              flex: 2, padding: '14px 0',
              border: 'none', borderRadius: T.r.md,
              background: T.grad.brand, color: '#fff',
              fontSize: 15, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer',
              boxShadow: T.sh.brand,
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

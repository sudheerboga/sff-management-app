import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppTheme } from '@/hooks/useAppTheme';
import { OrderStatus } from '@/types';

type DatePreset = 'all' | '7d' | '30d' | 'custom';
interface Filters { datePreset: DatePreset; dateFrom: string; dateTo: string; status: OrderStatus | 'all' }

const BLANK: Filters = { datePreset: 'all', dateFrom: '', dateTo: '', status: 'all' };

const DATE_OPTS: { v: DatePreset; label: string }[] = [
  { v: 'all',    label: 'All time' },
  { v: '7d',     label: 'Last 7 days' },
  { v: '30d',    label: 'Last 30 days' },
  { v: 'custom', label: 'Custom range' },
];

const STATUS_OPTS: { v: OrderStatus | 'all'; label: string }[] = [
  { v: 'all',         label: 'All' },
  { v: 'pending',     label: 'Pending' },
  { v: 'in-progress', label: 'In Progress' },
  { v: 'ready',       label: 'Ready' },
  { v: 'delivered',   label: 'Delivered' },
  { v: 'cancelled',   label: 'Cancelled' },
];

export default function OrdersFilterPage() {
  const { T } = useAppTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [draft, setDraft] = useState<Filters>({
    datePreset: (searchParams.get('date') || 'all') as DatePreset,
    dateFrom:   searchParams.get('from')   || '',
    dateTo:     searchParams.get('to')     || '',
    status:     (searchParams.get('status') || 'all') as OrderStatus | 'all',
  });

  const apply = () => {
    const p = new URLSearchParams();
    if (draft.datePreset !== 'all') p.set('date', draft.datePreset);
    if (draft.datePreset === 'custom') {
      if (draft.dateFrom) p.set('from', draft.dateFrom);
      if (draft.dateTo)   p.set('to',   draft.dateTo);
    }
    if (draft.status !== 'all') p.set('status', draft.status);
    const qs = p.toString();
    navigate(`/dashboard${qs ? `?${qs}` : ''}`, { replace: true });
  };

  const pill = (active: boolean): React.CSSProperties => ({
    padding: '10px 18px',
    borderRadius: T.r.pill,
    border: `1.5px solid ${active ? T.violet.d : T.border}`,
    background: active ? `${T.violet.d}1a` : T.inputBg,
    color: active ? T.violet.d : T.text2,
    fontSize: 14, fontWeight: active ? 700 : 500,
    fontFamily: T.fontBody, cursor: 'pointer',
    transition: 'all .15s',
  });

  const dateField: React.CSSProperties = {
    width: '100%', padding: '11px 12px',
    border: `1.5px solid ${T.border}`, borderRadius: T.r.md,
    background: T.inputBg, color: T.text,
    fontSize: 14, fontFamily: T.fontBody,
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ fontFamily: T.fontBody, maxWidth: 520 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            border: `1.5px solid ${T.border}`,
            background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.text2, flexShrink: 0,
          }}
          aria-label="Back"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: T.fontDisplay }}>
          Filter Orders
        </span>
      </div>

      {/* ── Date Range ── */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          Date Range
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {DATE_OPTS.map(({ v, label }) => (
            <button key={v} onClick={() => setDraft((d) => ({ ...d, datePreset: v }))} style={pill(draft.datePreset === v)}>
              {label}
            </button>
          ))}
        </div>
        {draft.datePreset === 'custom' && (
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>From</div>
              <input
                type="date"
                value={draft.dateFrom}
                onChange={(e) => setDraft((d) => ({ ...d, dateFrom: e.target.value }))}
                style={dateField}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>To</div>
              <input
                type="date"
                value={draft.dateTo}
                onChange={(e) => setDraft((d) => ({ ...d, dateTo: e.target.value }))}
                style={dateField}
              />
            </div>
          </div>
        )}
      </section>

      <div style={{ height: 1, background: T.border, marginBottom: 32 }} />

      {/* ── Status ── */}
      <section style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>
          Status
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {STATUS_OPTS.map(({ v, label }) => (
            <button key={v} onClick={() => setDraft((d) => ({ ...d, status: v }))} style={pill(draft.status === v)}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => setDraft(BLANK)}
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
          onClick={apply}
          style={{
            flex: 2, padding: '14px 0',
            border: 'none', borderRadius: T.r.md,
            background: T.grad.brand, color: '#fff',
            fontSize: 15, fontWeight: 700, fontFamily: T.fontBody, cursor: 'pointer',
            boxShadow: T.sh.brand,
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

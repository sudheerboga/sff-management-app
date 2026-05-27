import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays, isSameMonth, subMonths } from 'date-fns';
import { CircularProgress } from '@mui/material';
import { getAllBoutiques } from '@/services/boutiques';
import { getAllSubscriptionPayments } from '@/services/subscriptionPayments';
import { Boutique, SubscriptionPayment } from '@/types';

const SEC: React.CSSProperties = {
  background: '#fff', borderRadius: 16,
  border: '1px solid #ede9f0', padding: '20px 22px', marginBottom: 16,
};

const SEC_TITLE: React.CSSProperties = {
  fontSize: 13, fontWeight: 700,
  fontFamily: "'Playfair Display', serif",
  color: '#2d1e4a', marginBottom: 16, letterSpacing: '.01em',
};

function fmtMoney(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function fmtDuration(days: number): string {
  if (days < 1) return '< 1 day';
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''}`;
  const months = Math.round(days / 30);
  return `${months} month${months !== 1 ? 's' : ''}`;
}

interface BoutiqueRow {
  boutique: Boutique;
  payments: SubscriptionPayment[];
  totalPaid: number;
  freeDays: number;
  paidDays: number;
}

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: boutiques = [], isLoading: bLoading } = useQuery({
    queryKey: ['admin-boutiques'],
    queryFn: getAllBoutiques,
  });
  const { data: allPayments = [], isLoading: pLoading } = useQuery({
    queryKey: ['all-subscription-payments'],
    queryFn: getAllSubscriptionPayments,
  });

  const now = new Date();

  const rows = useMemo<BoutiqueRow[]>(() => {
    return boutiques
      .map((b) => {
        const payments = allPayments
          .filter((p) => p.boutiqueId === b.id)
          .sort((a, x) => a.paidAt.getTime() - x.paidAt.getTime());

        const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

        const firstPayment = payments[0];
        const freeDays = Math.max(0, differenceInDays(
          firstPayment ? firstPayment.validFrom : now,
          b.createdAt,
        ));

        const paidDays = payments.reduce(
          (s, p) => s + Math.max(0, differenceInDays(p.expiresAt, p.validFrom)),
          0,
        );

        return { boutique: b, payments, totalPaid, freeDays, paidDays };
      })
      .sort((a, b) => b.boutique.createdAt.getTime() - a.boutique.createdAt.getTime());
  }, [boutiques, allPayments]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = search.trim()
    ? rows.filter((r) =>
        r.boutique.name.toLowerCase().includes(search.toLowerCase()) ||
        r.boutique.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        r.boutique.ownerPhone.includes(search),
      )
    : rows;

  // Summary stats
  const totalRevenue = allPayments.reduce((s, p) => s + p.amount, 0);
  const thisMonthRev = allPayments
    .filter((p) => isSameMonth(p.paidAt, now))
    .reduce((s, p) => s + p.amount, 0);
  const onFree    = boutiques.filter((b) => b.subscription.plan === 'free' || !b.subscription.isActive).length;
  const onPaid    = boutiques.filter((b) =>
    b.subscription.plan !== 'free' &&
    b.subscription.isActive &&
    (!b.subscription.expiresAt || b.subscription.expiresAt > now),
  ).length;
  const expired   = boutiques.filter((b) => b.subscription.expiresAt && b.subscription.expiresAt < now).length;

  // Monthly revenue — last 6 months
  const monthSlots = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));
  const monthly = monthSlots.map((d) => {
    const ps = allPayments.filter((p) => isSameMonth(p.paidAt, d));
    return { label: format(d, 'MMM yy'), rev: ps.reduce((s, p) => s + p.amount, 0), count: ps.length };
  });
  const maxRev = Math.max(...monthly.map((m) => m.rev), 1);

  if (bLoading || pLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 48 }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: '#2d1e4a', marginBottom: 4 }}>
          Subscription Management
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>Boutique lifecycle, plan history & revenue overview</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Revenue', value: fmtMoney(totalRevenue), color: '#1B7A4B', sub: 'all time' },
          { label: 'This Month',    value: fmtMoney(thisMonthRev), color: '#7B5EA7', sub: format(now, 'MMMM yyyy') },
          { label: 'On Free Plan',  value: String(onFree),         color: '#888'    },
          { label: 'On Paid Plan',  value: String(onPaid),         color: '#2e7d32' },
          { label: 'Expired',       value: String(expired),        color: '#D32F2F' },
          { label: 'Total Boutiques', value: String(boutiques.length), color: '#4A6FD4' },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede9f0', padding: '14px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '.07em', marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: 10, color: '#ccc', marginTop: 3 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Monthly revenue chart */}
      <div style={SEC}>
        <div style={SEC_TITLE}>Monthly Revenue</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {monthly.map((m) => (
            <div key={m.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{m.label}</span>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#ccc' }}>{m.count} payment{m.count !== 1 ? 's' : ''}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1230', minWidth: 60, textAlign: 'right' as const }}>
                    {fmtMoney(m.rev)}
                  </span>
                </div>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: '#f0f0f0', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${(m.rev / maxRev) * 100}%`,
                  background: 'linear-gradient(90deg, #7B5EA7, #4A6FD4)',
                  transition: 'width .4s',
                  minWidth: m.rev > 0 ? 4 : 0,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search boutique name, owner or phone…"
        style={{
          width: '100%', boxSizing: 'border-box' as const,
          padding: '11px 16px', border: '1.5px solid #e0d9f0',
          borderRadius: 10, fontSize: 14, outline: 'none',
          fontFamily: 'inherit', color: '#1a1230', background: '#faf8fd',
          marginBottom: 14,
        }}
      />

      {/* Section title */}
      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: '#2d1e4a', marginBottom: 10 }}>
        Boutique Lifecycle
        {search.trim() && filtered.length !== boutiques.length && (
          <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 8 }}>
            {filtered.length} of {boutiques.length}
          </span>
        )}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb', fontSize: 14 }}>
          No boutiques found
        </div>
      )}

      {filtered.map((row) => {
        const b = row.boutique;
        const isExpired = b.subscription.expiresAt ? b.subscription.expiresAt < now : false;
        const isExpanded = expandedId === b.id;
        const planColor = b.subscription.plan === 'free'
          ? '#888'
          : isExpired ? '#e65100' : '#2e7d32';
        const statusColor = b.status === 'active' ? '#2e7d32' : '#e65100';
        const firstPayment = row.payments[0];
        const lastPayment  = row.payments[row.payments.length - 1];

        return (
          <div key={b.id}
            style={{ ...SEC, marginBottom: 10, cursor: 'pointer', transition: 'box-shadow .15s' }}
            onClick={() => setExpandedId(isExpanded ? null : b.id)}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' as const, marginBottom: 4 }}>
                  <span
                    style={{ fontSize: 15, fontWeight: 700, color: '#1a1230', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/boutiques/${b.id}`); }}>
                    {b.name}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: `${statusColor}18`, color: statusColor,
                    border: `1px solid ${statusColor}44`,
                  }}>
                    {b.status}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: `${planColor}18`, color: planColor,
                    border: `1px solid ${planColor}44`,
                  }}>
                    {b.subscription.planName || 'No Plan'}
                    {isExpired ? ' · expired' : ''}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>{b.ownerName} · {b.ownerPhone}</div>
              </div>

              <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                {row.totalPaid > 0 && (
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#2e7d32' }}>
                    {fmtMoney(row.totalPaid)}
                  </div>
                )}
                <div style={{ fontSize: 10, color: '#ccc', marginTop: 2 }}>
                  {row.payments.length} payment{row.payments.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Lifecycle summary cards */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 10 }}>
              {/* Joined */}
              <div style={{ flex: '1 1 110px', background: '#faf8fd', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: 3 }}>Joined</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1230' }}>
                  {format(b.createdAt, 'd MMM yyyy')}
                </div>
              </div>

              {/* Free period */}
              <div style={{ flex: '1 1 110px', background: '#faf8fd', borderRadius: 8, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: 3 }}>Free Period</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#888' }}>{fmtDuration(row.freeDays)}</div>
                <div style={{ fontSize: 10, color: '#ccc', marginTop: 1 }}>
                  {firstPayment
                    ? `until ${format(firstPayment.validFrom, 'd MMM yy')}`
                    : 'ongoing'}
                </div>
              </div>

              {/* Paid period */}
              {row.paidDays > 0 && (
                <div style={{ flex: '1 1 110px', background: 'rgba(46,125,50,.04)', border: '1px solid rgba(46,125,50,.15)', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: 3 }}>Paid Period</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#2e7d32' }}>{fmtDuration(row.paidDays)}</div>
                  <div style={{ fontSize: 10, color: '#ccc', marginTop: 1 }}>
                    {lastPayment && `exp ${format(lastPayment.expiresAt, 'd MMM yy')}`}
                  </div>
                </div>
              )}

              {/* Current expiry */}
              {b.subscription.expiresAt && (
                <div style={{
                  flex: '1 1 110px',
                  background: isExpired ? 'rgba(211,47,47,.04)' : 'rgba(74,111,212,.04)',
                  border: `1px solid ${isExpired ? 'rgba(211,47,47,.2)' : 'rgba(74,111,212,.2)'}`,
                  borderRadius: 8, padding: '8px 12px',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '.06em', marginBottom: 3 }}>
                    {isExpired ? 'Expired' : 'Expires'}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isExpired ? '#c62828' : '#4A6FD4' }}>
                    {format(b.subscription.expiresAt, 'd MMM yyyy')}
                  </div>
                </div>
              )}
            </div>

            {/* Expand toggle */}
            <div style={{ fontSize: 11, color: '#7B5EA7', fontWeight: 600, textAlign: 'center' as const }}>
              {isExpanded
                ? '▲ Hide history'
                : `▼ ${row.payments.length > 0 ? `${row.payments.length} payment${row.payments.length !== 1 ? 's' : ''}` : 'No payments'} · tap to expand`}
            </div>

            {/* Expanded: payment history */}
            {isExpanded && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1.5px solid #ede9f0' }}>
                {/* Free plan entry at top */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: row.payments.length > 0 ? 0 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#888', border: '2px solid #ddd' }} />
                    {row.payments.length > 0 && (
                      <div style={{ width: 2, height: 36, background: '#ede9f0', marginTop: 3 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingBottom: row.payments.length > 0 ? 12 : 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#888' }}>Free Plan</div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                      {format(b.createdAt, 'd MMM yyyy')} →{' '}
                      {firstPayment
                        ? format(firstPayment.validFrom, 'd MMM yyyy')
                        : 'ongoing'}
                      {' · '}{fmtDuration(row.freeDays)}
                    </div>
                  </div>
                </div>

                {/* Paid payment entries */}
                {row.payments.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7B5EA7' }} />
                      {i < row.payments.length - 1 && (
                        <div style={{ width: 2, height: 40, background: '#ede9f0', marginTop: 3 }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: i < row.payments.length - 1 ? 12 : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#2e7d32' }}>
                            {fmtMoney(p.amount)}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: 'rgba(123,94,167,.1)', color: '#7B5EA7' }}>
                            {p.planName}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: '#aaa' }}>{format(p.paidAt, 'd MMM yyyy')}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                        {format(p.validFrom, 'd MMM yyyy')} → {format(p.expiresAt, 'd MMM yyyy')}
                        {' · '}{fmtDuration(differenceInDays(p.expiresAt, p.validFrom))}
                        {p.notes && (
                          <span style={{ marginLeft: 8, fontStyle: 'italic' }}>· {p.notes}</span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: '#ccc', marginTop: 1 }}>by {p.recordedBy}</div>
                    </div>
                  </div>
                ))}

                {row.payments.length === 0 && (
                  <div style={{ textAlign: 'center' as const, color: '#ccc', fontSize: 13, fontStyle: 'italic', padding: '8px 0' }}>
                    No paid plans recorded
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

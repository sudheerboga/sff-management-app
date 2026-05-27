import { useMemo, useState } from 'react';
import { Box, Grid, Skeleton } from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { format, startOfMonth, subMonths, isWithinInterval, endOfMonth, isSameMonth } from 'date-fns';
import { useOrders } from '@/features/orders/hooks/useOrders';
import PageHeader from '@/components/common/PageHeader';
import { useAppTheme } from '@/hooks/useAppTheme';

const STATUS_LABELS: Record<string, string> = {
  'in-progress': 'In Progress', delivered: 'Delivered',
};

// Static light/pastel chart colors — independent of boutique theme
const BAR_GRAD   = { from: '#8878ba', to: '#8ea0e0' };           // soft violet → soft pink
const PIE_COLORS: Record<string, string> = {
  'in-progress': 'rgb(239, 207, 147)',   // soft amber
  delivered:     '#65be7e',   // soft mint
};
const LINE_COLORS = { orders: '#7DD3FC', delivered: '#C4B5FD' }; // soft sky + soft violet

export default function ReportsPage() {
  const { T, isDark } = useAppTheme();
  const { query: ordersQuery } = useOrders();
  const orders = ordersQuery.data || [];
  const loading = ordersQuery.isLoading;
  const now = new Date();
  const [tab,            setTab]            = useState<'summary' | 'revenue' | 'trends' | 'customers'>('summary');
  const [tableEndOffset, setTableEndOffset] = useState(0);
  const [chartEndOffset, setChartEndOffset] = useState(0);

  // ── Per-month rows ────────────────────────────────────────────
  const tableData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d     = subMonths(now, tableEndOffset + 5 - i);
    const start = startOfMonth(d);
    const end   = endOfMonth(d);
    const mo    = orders.filter((o) => isWithinInterval(o.orderDate, { start, end }));
    return {
      fullMonth: format(d, 'MMM yyyy'),
      isCurrent: isSameMonth(d, now),
      orders:    mo.length,
      revenue:   mo.reduce((s, o) => s + (o.totalAmount   || 0), 0),
      paid:      mo.reduce((s, o) => s + (o.paidAmount    || 0), 0),
      balance:   mo.reduce((s, o) => s + (o.balanceAmount || 0), 0),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [tableEndOffset, orders]);

  const tableTotal = useMemo(() => ({
    orders:  tableData.reduce((s, r) => s + r.orders,  0),
    revenue: tableData.reduce((s, r) => s + r.revenue, 0),
    paid:    tableData.reduce((s, r) => s + r.paid,    0),
    balance: tableData.reduce((s, r) => s + r.balance, 0),
  }), [tableData]);

  // ── Chart data ────────────────────────────────────────────────
  const chartData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d     = subMonths(now, chartEndOffset + 5 - i);
    const start = startOfMonth(d);
    const end   = endOfMonth(d);
    const mo    = orders.filter((o) => isWithinInterval(o.orderDate, { start, end }));
    return {
      month:     format(d, 'MMM yy'),
      orders:    mo.length,
      delivered: mo.filter((o) => o.status === 'delivered').length,
      revenue:   mo.reduce((s, o) => s + (o.totalAmount || 0), 0),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [chartEndOffset, orders]);

  const chartPeriodOptions = useMemo(() => Array.from({ length: 7 }, (_, offset) => {
    const endDate   = subMonths(now, offset);
    const startDate = subMonths(endDate, 5);
    return {
      value: offset,
      label: offset === 0
        ? `${format(startDate, 'MMM yy')} – ${format(endDate, 'MMM yy')} (Latest)`
        : `${format(startDate, 'MMM yy')} – ${format(endDate, 'MMM yy')}`,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  // ── Aggregate KPIs ────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount   || 0), 0);
  const totalPaid    = orders.reduce((s, o) => s + (o.paidAmount    || 0), 0);
  const totalBalance = orders.reduce((s, o) => s + (o.balanceAmount || 0), 0);
  const delivered    = orders.filter((o) => o.status === 'delivered').length;
  const deliveryRate = orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 0;

  // ── Status donut ──────────────────────────────────────────────
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { 'in-progress': 0, delivered: 0 };
    orders.forEach((o) => {
      const s = o.status === 'delivered' ? 'delivered' : 'in-progress';
      counts[s]++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: STATUS_LABELS[k], raw: k, value: v }));
  }, [orders]);

  // ── Top customers ─────────────────────────────────────────────
  const topCustomers = useMemo(() => {
    const map: Record<string, { name: string; orders: number; revenue: number; paid: number; balance: number }> = {};
    orders.forEach((o) => {
      if (!map[o.customerName]) map[o.customerName] = { name: o.customerName, orders: 0, revenue: 0, paid: 0, balance: 0 };
      map[o.customerName].orders++;
      map[o.customerName].revenue  += o.totalAmount   || 0;
      map[o.customerName].paid     += o.paidAmount    || 0;
      map[o.customerName].balance  += o.balanceAmount || 0;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  // ── Helpers ───────────────────────────────────────────────────
  const fmt  = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const fmtK = (v: number) => v >= 1000 ? `₹${(v / 1000).toFixed(1)}K` : `₹${v}`;

  const axisStyle = { fill: T.muted, fontSize: 11, fontFamily: T.fontBody };
  const tooltipStyle = {
    contentStyle: {
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: T.r.sm, fontSize: 12, fontFamily: T.fontBody,
      boxShadow: T.sh.md, color: T.text,
    },
    labelStyle: { color: T.text, fontWeight: 700 },
    itemStyle:  { color: T.text2 },
    cursor: { fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
  };


  const cardStyle: React.CSSProperties = {
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: T.r.lg, padding: '16px', boxShadow: T.sh.sm,
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, color: T.text,
    fontFamily: T.fontDisplay, marginBottom: 14,
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Reports" subtitle="Analytics & performance overview" />
        <Grid container spacing={1.5}>
          {[1,2,3,4,5,6].map((i) => (
            <Grid item xs={6} md={4} key={i}>
              <Skeleton variant="rounded" height={90} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const TABS = [
    { key: 'revenue',   label: 'Revenue'   },
    { key: 'summary',   label: 'Summary'   },
    { key: 'trends',    label: 'Trends'    },
    { key: 'customers', label: 'Customers' },
  ] as const;

  return (
    <Box style={{ fontFamily: T.fontBody }}>
      <PageHeader title="Reports" subtitle="Analytics & performance overview" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Total Billed',  value: fmt(totalRevenue), sub: `${orders.length} orders`,      color: T.violet.d,     bg: T.violet.pale },
              { label: 'Collected',     value: fmt(totalPaid),    sub: 'payments received',             color: T.success.text, bg: T.success.bg  },
              { label: 'Balance Due',   value: fmt(totalBalance), sub: 'pending collection',            color: T.danger.text,  bg: T.danger.bg   },
              { label: 'Delivery Rate', value: `${deliveryRate}%`, sub: `${delivered} of ${orders.length} delivered`,
                color: deliveryRate >= 80 ? T.success.text : T.warning.text,
                bg:    deliveryRate >= 80 ? T.success.bg   : T.warning.bg  },
            ].map((kpi) => (
              <div key={kpi.label} style={{ ...cardStyle, padding: '14px 16px', background: kpi.bg, border: `1px solid ${kpi.color}22` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: kpi.color, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color, lineHeight: 1.1, marginBottom: 3 }}>{kpi.value}</div>
                <div style={{ fontSize: 11, color: kpi.color, opacity: .65 }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: `1.5px solid ${T.border}` }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '9px 16px', border: 'none', background: 'none',
              fontFamily: T.fontBody, fontSize: 13,
              fontWeight: tab === key ? 700 : 500,
              color: tab === key ? T.violet.d : T.muted,
              borderBottom: `2px solid ${tab === key ? T.violet.d : 'transparent'}`,
              marginBottom: -1.5, cursor: 'pointer', transition: 'color .15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Summary tab ── */}
      {tab === 'summary' && (
        <>
          
          <div style={{ ...cardStyle, minHeight: 260 }}>
            <div style={sectionTitle}>Order Status</div>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="45%" innerRadius={52} outerRadius={76} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[entry.raw] || '#7C3AED'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [v, name]} {...tooltipStyle} />
                  <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, fontFamily: T.fontBody, color: T.text2, paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: T.muted, fontSize: 13 }}>No data yet</div>
            )}
          </div>
        </>
      )}

      {/* ── Revenue tab ── */}
      {tab === 'revenue' && (
        <>
          <div style={{ ...cardStyle, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
              <div style={{ ...sectionTitle, marginBottom: 0 }}>Monthly Revenue</div>
              <select
                value={chartEndOffset}
                onChange={(e) => setChartEndOffset(Number(e.target.value))}
                style={{ padding: '6px 10px', fontSize: 12, fontFamily: T.fontBody, border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, outline: 'none', cursor: 'pointer' }}
              >
                {chartPeriodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={chartData} barSize={26} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BAR_GRAD.from} />
                    <stop offset="100%" stopColor={BAR_GRAD.to} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={{ stroke: T.border }} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={fmtK} width={52} />
                <Tooltip formatter={(v: number) => [fmt(v), 'Revenue']} {...tooltipStyle} />
                <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
              <div style={{ ...sectionTitle, marginBottom: 0 }}>Monthly Breakdown</div>
              <select
                value={tableEndOffset}
                onChange={(e) => setTableEndOffset(Number(e.target.value))}
                style={{ padding: '6px 10px', fontSize: 12, fontFamily: T.fontBody, border: `1.5px solid ${T.border}`, borderRadius: T.r.sm, background: T.inputBg, color: T.text, outline: 'none', cursor: 'pointer' }}
              >
                {chartPeriodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.fontBody, fontSize: 13 }}>
                <thead>
                  <tr>
                    {['Month', 'Orders', 'Total Billed', 'Balance Due'].map((h, i) => (
                      <th key={h} style={{ padding: '8px 8px', textAlign: i === 0 ? 'left' : 'right', fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.07em', borderBottom: `1.5px solid ${T.border}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row) => (
                    <tr key={row.fullMonth} style={{ background: row.isCurrent ? (isDark ? 'rgba(123,94,167,0.10)' : T.violet.pale) : 'transparent' }}>
                      <td style={{ padding: '8px 8px', borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ fontWeight: row.isCurrent ? 700 : 500, color: row.isCurrent ? T.violet.d : T.text }}>{row.fullMonth}</span>
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', borderBottom: `1px solid ${T.border}`, color: row.orders > 0 ? T.text : T.muted, fontWeight: row.orders > 0 ? 600 : 400 }}>
                        {row.orders > 0 ? row.orders : '—'}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', borderBottom: `1px solid ${T.border}`, fontWeight: 600, color: row.revenue > 0 ? T.text : T.muted }}>
                        {row.revenue > 0 ? fmt(row.revenue) : '—'}
                      </td>
                      <td style={{ padding: '8px 8px', textAlign: 'right', borderBottom: `1px solid ${T.border}`, color: row.balance > 0 ? T.danger.text : T.muted, fontWeight: row.balance > 0 ? 600 : 400 }}>
                        {row.balance > 0 ? fmt(row.balance) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: isDark ? 'rgba(255,255,255,0.04)' : T.bg2 }}>
                    <td style={{ padding: '8px 8px', fontWeight: 700, color: T.text, fontSize: 12 }}>Total</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: T.text }}>{tableTotal.orders || '—'}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: T.violet.d }}>{tableTotal.revenue > 0 ? fmt(tableTotal.revenue) : '—'}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: tableTotal.balance > 0 ? T.danger.text : T.success.text }}>{tableTotal.balance > 0 ? fmt(tableTotal.balance) : '—'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Trends tab ── */}
      {tab === 'trends' && (
        <div style={cardStyle}>
          <div style={sectionTitle}>Orders Trend — Last 6 Months</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="month" tick={axisStyle} axisLine={{ stroke: T.border }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="orders"    stroke={LINE_COLORS.orders}    strokeWidth={2.5} dot={{ r: 4, fill: LINE_COLORS.orders,    strokeWidth: 0 }} name="Orders" />
              <Line type="monotone" dataKey="delivered" stroke={LINE_COLORS.delivered} strokeWidth={2}   strokeDasharray="5 4" dot={{ r: 3, fill: LINE_COLORS.delivered, strokeWidth: 0 }} name="Delivered" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Customers tab ── */}
      {tab === 'customers' && topCustomers.length > 0 && (
        <div style={cardStyle}>
          <div style={sectionTitle}>Top Customers by Revenue</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {topCustomers.map((c, i) => {
              const pct = totalRevenue > 0 ? Math.round((c.revenue / totalRevenue) * 100) : 0;
              const barColors = ['#8878ba', '#C96B9A', '#4A6FD4', '#D4A017', '#2E7D32'];
              return (
                <div key={c.name} style={{ padding: '10px 0', borderBottom: i < topCustomers.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${barColors[i]}22`, border: `1.5px solid ${barColors[i]}44`, color: barColors[i], fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: T.text, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: T.muted }}>{c.orders} order{c.orders !== 1 ? 's' : ''} · due {fmt(c.balance)}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontWeight: 700, color: barColors[i], fontSize: 14 }}>{fmt(c.revenue)}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{pct}% of total</div>
                    </div>
                  </div>
                  <div style={{ height: 4, background: isDark ? 'rgba(255,255,255,0.06)' : T.border, borderRadius: 99 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColors[i], borderRadius: 99, transition: 'width .4s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tab === 'customers' && topCustomers.length === 0 && (
        <div style={{ ...cardStyle, textAlign: 'center', color: T.muted, fontSize: 13, padding: '48px 16px' }}>No order data yet</div>
      )}
    </Box>
  );
}

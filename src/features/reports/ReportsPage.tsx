import { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, Skeleton } from '@mui/material';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { format, startOfMonth, subMonths, isWithinInterval, endOfMonth } from 'date-fns';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { useBilling } from '@/features/billing/hooks/useBilling';
import PageHeader from '@/components/common/PageHeader';

const COLORS = ['#4A6FD4', '#7B5EA7', '#C96B9A', '#43A047', '#E65100'];

function MetricCard({ title, value, subtitle, color }: { title: string; value: string; subtitle?: string; color?: string }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }}>{title}</Typography>
        <Typography variant="h5" fontWeight={700} sx={{ color: color || 'primary.main', my: 0.5 }}>{value}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const { query: ordersQuery } = useOrders();
  const { query: billingQuery } = useBilling();
  const orders = ordersQuery.data || [];
  const bills = billingQuery.data || [];
  const loading = ordersQuery.isLoading || billingQuery.isLoading;

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return { start: startOfMonth(d), end: endOfMonth(d), label: format(d, 'MMM yy') };
    });
    return months.map(({ start, end, label }) => {
      const monthOrders = orders.filter((o) => isWithinInterval(o.orderDate, { start, end }));
      const monthBills = bills.filter((b) => isWithinInterval(b.createdAt, { start, end }));
      return {
        month: label,
        orders: monthOrders.length,
        delivered: monthOrders.filter((o) => o.status === 'delivered').length,
        revenue: monthBills.reduce((s, b) => s + b.paidAmount, 0),
      };
    });
  }, [orders, bills]);

  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
    return Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace('-', ' '), value }));
  }, [orders]);

  const totalRevenue = bills.reduce((s, b) => s + b.paidAmount, 0);
  const totalBalance = bills.reduce((s, b) => s + b.balanceAmount, 0);
  const delivered = orders.filter((o) => o.status === 'delivered').length;
  const deliveryRate = orders.length > 0 ? Math.round((delivered / orders.length) * 100) : 0;

  const topCustomers = useMemo(() => {
    const map: Record<string, { name: string; orders: number; revenue: number }> = {};
    orders.forEach((o) => {
      if (!map[o.customerName]) map[o.customerName] = { name: o.customerName, orders: 0, revenue: 0 };
      map[o.customerName].orders++;
      map[o.customerName].revenue += o.totalAmount;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);

  return (
    <Box>
      <PageHeader title="Reports" subtitle="Analytics & performance overview" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Grid item xs={6} md={3} key={i}>
              <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
            </Grid>
          ))
        ) : (
          <>
            <Grid item xs={6} md={3}>
              <MetricCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="#7B5EA7" />
            </Grid>
            <Grid item xs={6} md={3}>
              <MetricCard title="Pending Balance" value={`₹${totalBalance.toLocaleString()}`} color="#E65100" />
            </Grid>
            <Grid item xs={6} md={3}>
              <MetricCard title="Total Orders" value={orders.length.toString()} subtitle={`${delivered} delivered`} />
            </Grid>
            <Grid item xs={6} md={3}>
              <MetricCard title="Delivery Rate" value={`${deliveryRate}%`} color={deliveryRate >= 80 ? '#2E7D32' : '#E65100'} />
            </Grid>
          </>
        )}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} fontFamily="'Playfair Display', serif" sx={{ mb: 2 }}>
                Monthly Revenue (₹)
              </Typography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="url(#gradBar)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7B5EA7" />
                      <stop offset="100%" stopColor="#C96B9A" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} fontFamily="'Playfair Display', serif" sx={{ mb: 2 }}>
                Order Status
              </Typography>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                  <Typography color="text.secondary" variant="body2">No data yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} fontFamily="'Playfair Display', serif" sx={{ mb: 2 }}>
                Orders Trend
              </Typography>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="orders" stroke="#4A6FD4" strokeWidth={2.5} dot={{ r: 4 }} name="Orders" />
                  <Line type="monotone" dataKey="delivered" stroke="#2E7D32" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Delivered" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} fontFamily="'Playfair Display', serif" sx={{ mb: 2 }}>
                Top Customers
              </Typography>
              {topCustomers.length === 0 ? (
                <Typography color="text.secondary" variant="body2">No data yet</Typography>
              ) : (
                topCustomers.map((c, i) => (
                  <Box key={c.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{i + 1}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 110 }}>{c.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.orders} orders</Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" fontWeight={700} color="primary.main">₹{c.revenue.toLocaleString()}</Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

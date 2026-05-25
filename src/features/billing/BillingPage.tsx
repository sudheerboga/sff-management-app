import { useState, useMemo } from 'react';
import {
  Box, TextField, InputAdornment, Grid, Skeleton, Fab, ToggleButton,
  ToggleButtonGroup, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Table, TableHead, TableBody, TableRow, TableCell, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns';
import { useBilling } from './hooks/useBilling';
import BillCard from './components/BillCard';
import CreateBillModal from './components/CreateBillModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import { PaymentStatusChip } from '@/components/common/StatusChip';
import { useAuthStore } from '@/stores/authStore';
import { usePlanStatus } from '@/hooks/usePlanStatus';
import { Bill, PaymentStatus } from '@/types';

export default function BillingPage() {
  const user = useAuthStore((s) => s.user);
  const { query, createMutation, deleteMutation } = useBilling();
  const bills = query.data || [];

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const isStaff = user?.role === 'staff';
  const { isReadOnly } = usePlanStatus();

  const filtered = useMemo(() => {
    let list = bills;
    if (filter !== 'all') list = list.filter((b) => b.paymentStatus === filter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((b) => b.customerName.toLowerCase().includes(s) || b.invoiceNumber.toLowerCase().includes(s));
    }
    return list;
  }, [bills, filter, search]);

  const totalRevenue = bills.reduce((s, b) => s + b.paidAmount, 0);
  const totalBalance = bills.reduce((s, b) => s + b.balanceAmount, 0);

  const handlePrint = (bill: Bill) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>${bill.invoiceNumber}</title>
      <style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:20px}
      h1{color:#7B5EA7}table{width:100%;border-collapse:collapse}th,td{padding:8px;border-bottom:1px solid #eee;text-align:left}
      .total-row{font-weight:700}
      </style></head><body>
      <h1>Invoice ${bill.invoiceNumber}</h1>
      <p><strong>Customer:</strong> ${bill.customerName}</p>
      ${bill.customerPhone ? `<p><strong>Phone:</strong> ${bill.customerPhone}</p>` : ''}
      <p><strong>Date:</strong> ${format(bill.createdAt, 'd MMMM yyyy')}</p>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>${bill.items.map((i) => `<tr><td>${i.description}</td><td>${i.qty}</td><td>₹${i.rate}</td><td>₹${i.amount}</td></tr>`).join('')}
      </tbody></table>
      <div style="margin-top:16px;text-align:right">
        <p>Subtotal: ₹${bill.subtotal}</p>
        ${bill.gstPercent > 0 ? `<p>GST (${bill.gstPercent}%): ₹${bill.gstAmount}</p>` : ''}
        <p><strong>Total: ₹${bill.totalAmount}</strong></p>
        <p>Paid: ₹${bill.paidAmount}</p>
        <p>Balance: ₹${bill.balanceAmount}</p>
      </div>
      <script>window.onload=()=>window.print()</script>
      </body></html>`);
    w.document.close();
  };

  return (
    <Box>
      <PageHeader
        title="Billing"
        subtitle={`₹${totalRevenue.toLocaleString()} collected · ₹${totalBalance.toLocaleString()} pending`}
        actionLabel={isStaff || isReadOnly ? undefined : 'New Bill'}
        onAction={isStaff || isReadOnly ? undefined : () => setCreateOpen(true)}
      />

      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search customer or invoice…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 180, maxWidth: 320 }}
        />
      </Box>

      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, v) => v && setFilter(v)}
        size="small"
        sx={{ mb: 2.5, flexWrap: 'wrap', '& .MuiToggleButton-root': { borderRadius: 2, fontSize: 12, py: 0.5, px: 1.5 } }}
      >
        {(['all', 'paid', 'partial', 'pending'] as const).map((f) => (
          <ToggleButton key={f} value={f} sx={{ textTransform: 'capitalize' }}>
            {f === 'all' ? `All (${bills.length})` : `${f} (${bills.filter((b) => b.paymentStatus === f).length})`}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {query.isLoading ? (
        <Grid container spacing={1.5}>
          {[1, 2, 3].map((i) => <Grid item xs={12} sm={6} key={i}><Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} /></Grid>)}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ReceiptIcon />}
          title={search || filter !== 'all' ? 'No bills found' : 'No bills yet'}
          description="Create a bill to get started"
          actionLabel={!isStaff && !isReadOnly && !search && filter === 'all' ? 'Create Bill' : undefined}
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <Grid container spacing={1.5}>
          {filtered.map((bill) => (
            <Grid item xs={12} sm={6} key={bill.id}>
              <BillCard
                bill={bill}
                onClick={() => setSelectedBill(bill)}
                onDelete={() => setDeleteId(bill.id)}
                onPrint={() => handlePrint(bill)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* {!isStaff && !isReadOnly && (
        <Fab size="medium" onClick={() => setCreateOpen(true)} sx={{ position: 'fixed', bottom: { xs: 84, md: 24 }, right: 24 }}>
          <AddIcon />
        </Fab>
      )} */}

      <CreateBillModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (data) => {
          await createMutation.mutateAsync({ ...data, createdBy: user!.uid, createdByName: user!.name });
          setCreateOpen(false);
        }}
        loading={createMutation.isPending}
      />

      {/* Bill detail dialog */}
      <Dialog open={!!selectedBill} onClose={() => setSelectedBill(null)} maxWidth="sm" fullWidth>
        {selectedBill && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" fontFamily="'Playfair Display', serif" fontWeight={700}>{selectedBill.invoiceNumber}</Typography>
                <Typography variant="caption" color="text.secondary">{selectedBill.customerName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentStatusChip status={selectedBill.paymentStatus} />
                <Button size="small" startIcon={<ReceiptIcon fontSize="small" />} onClick={() => handlePrint(selectedBill)} variant="outlined">
                  Print
                </Button>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Table size="small" sx={{ mb: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Item</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Rate</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedBill.items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ fontSize: 13 }}>{item.description}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 13 }}>{item.qty}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 13 }}>₹{item.rate}</TableCell>
                      <TableCell align="right" sx={{ fontSize: 13, fontWeight: 600 }}>₹{item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Divider />
              <Box sx={{ mt: 1.5 }}>
                {[
                  { l: 'Subtotal', v: selectedBill.subtotal },
                  ...(selectedBill.gstPercent > 0 ? [{ l: `GST (${selectedBill.gstPercent}%)`, v: selectedBill.gstAmount }] : []),
                  { l: 'Total', v: selectedBill.totalAmount, bold: true },
                  { l: 'Paid', v: selectedBill.paidAmount },
                  { l: 'Balance', v: selectedBill.balanceAmount, color: selectedBill.balanceAmount > 0 ? 'error.main' : 'success.main' },
                ].map(({ l, v, bold, color }) => (
                  <Box key={l} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={bold ? 700 : 400}>{l}</Typography>
                    <Typography variant="body2" fontWeight={bold ? 700 : 600} color={color as string || 'text.primary'}>
                      ₹{v.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedBill(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Bill"
        message="This bill will be moved to trash. The super admin can restore it if needed."
        confirmLabel="Delete"
        onConfirm={async () => { if (deleteId) { await deleteMutation.mutateAsync(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

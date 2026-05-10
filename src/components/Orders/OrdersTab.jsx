import React, { useState, useMemo } from 'react';
import StatsBar from './StatsBar';
import OrderCard from './OrderCard';
import OrderModal from './OrderModal';
import { SearchBar, FilterChip, EmptyState, Toast, ConfirmDialog } from '../shared';
import { useTheme } from '../../context/ThemeContext';
import { exportOrdersPDF, exportOrdersExcel } from '../../utils/exportOrders';

const STATUS_FILTERS = [['all','All'],['In Progress','In Progress'],['Delivered','Delivered'],['balance','Has Balance']];

function DateRangeBar({ from, to, onChange, T }) {
  const inp = (label, key, val) => (
    <div style={{ display:'flex', flexDirection:'column', gap:3, flex:1 }}>
      <label style={{ fontSize:9, fontWeight:700, color:T.muted, textTransform:'uppercase', letterSpacing:'.08em' }}>{label}</label>
      <input type="date" value={val}
        onChange={e=>onChange(key, e.target.value)}
        style={{
          padding:'8px 10px', borderRadius:T.r.md, fontSize:13,
          border:`1.5px solid ${T.border}`,
          background: T.isDark?'rgba(255,255,255,0.04)':T.card,
          color:T.text, outline:'none', fontFamily:T.fontBody,
          // colorScheme: T.isDark?'dark':'light',
        }}
        onFocus={e=>e.target.style.borderColor=T.violet.d}
        onBlur={e=>e.target.style.borderColor=T.border}
      />
    </div>
  );
  return (
    <div style={{ display:'flex', gap:8, marginBottom:12, flexDirection: 'column' }}>
      <div style={{ display:'flex', gap:8, }}>
      {inp('From', 'from', from)}
      <div style={{ paddingBottom:9, color:T.muted, fontSize:12, display:'flex', alignItems:'end' }}>→</div>
      {inp('To', 'to', to)}

      </div>
      {(from||to) && (
        <button onClick={()=>{ onChange('from',''); onChange('to',''); }} style={{
          padding:'8px 12px', borderRadius:T.r.md, fontSize:12, fontWeight:700, width: '100%',
          background:T.danger.bg, color:T.danger.text, border:`1px solid ${T.danger.border}`,
          cursor:'pointer', fontFamily:T.fontBody, whiteSpace:'nowrap', marginBottom:0,
        }}>✕ Clear</button>
      )}
    </div>
  );
}

export default function OrdersTab({ orders, onAdd, onUpdate, onDelete }) {
  const { theme: T } = useTheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal,  setModal]  = useState(null);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ from:'', to:'' });
  const [exporting, setExporting] = useState('');
  const [toast, setToast] = useState({ visible:false, msg:'', type:'success' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  function showToast(msg,type='success'){ setToast({visible:true,msg,type}); setTimeout(()=>setToast(t=>({...t,visible:false})),2500); }
  function setDate(key, val) { setDateRange(d=>({...d,[key]:val})); }

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = o.name?.toLowerCase().includes(search.toLowerCase()) ||
                          o.sffId?.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filter==='balance' && !(o.balance>0)) return false;
      if (filter!=='all' && filter!=='balance' && o.status!==filter) return false;
      if (dateRange.from) {
        const oDate = new Date(o.date); const from = new Date(dateRange.from);
        if (oDate < from) return false;
      }
      if (dateRange.to) {
        const oDate = new Date(o.date); const to = new Date(dateRange.to);
        to.setHours(23,59,59); if (oDate > to) return false;
      }
      return true;
    });
  }, [orders, search, filter, dateRange]);

  async function handleSave(order) {
    if (order.id) await onUpdate(order);
    else          await onAdd({...order, id:undefined});
    setModal(null);
  }

  async function handleDelete(id) {
    await onDelete(id);
    setDeleteTarget(null);
    showToast('Order deleted');
  }

  function getExportLabel() {
    const parts = [];
    if (filter !== 'all') parts.push(filter === 'balance' ? 'Has Balance' : filter);
    if (dateRange.from) parts.push(`from ${dateRange.from}`);
    if (dateRange.to)   parts.push(`to ${dateRange.to}`);
    return parts.length ? parts.join(' • ') : 'All Orders';
  }

  async function handleExportPDF() {
    if (!filtered.length) return showToast('No orders to export','error');
    setExporting('pdf');
    try { await exportOrdersPDF(filtered, getExportLabel()); showToast('PDF downloaded!'); }
    catch(e) { showToast('PDF export failed','error'); }
    finally { setExporting(''); }
  }

  async function handleExportExcel() {
    if (!filtered.length) return showToast('No orders to export','error');
    setExporting('xlsx');
    try { await exportOrdersExcel(filtered, getExportLabel()); showToast('Excel downloaded!'); }
    catch(e) { showToast('Excel export failed','error'); }
    finally { setExporting(''); }
  }

  const hasDateFilter = dateRange.from || dateRange.to;
  const cardBg = T.isDark ? 'rgba(26,21,48,0.7)' : T.card;
  const cardBorder = T.isDark ? 'rgba(155,127,212,0.15)' : T.border;

  return (
    <div id='sff-orders-tab' style={{ padding:`0 ${T.sp.page}px 100px`, fontFamily:T.fontBody }}>
      <Toast message={toast.msg} visible={toast.visible} type={toast.type} />
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Order"
        message={`Delete order for "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmDanger
        onConfirm={()=>handleDelete(deleteTarget.id)}
        onCancel={()=>setDeleteTarget(null)}
      />

      {/* Page header */}
      <div className="fade-up" style={{ marginBottom:16, paddingTop:4 }}>
        <div style={{ fontFamily:T.fontDisplay, fontSize:22, fontWeight:600, color:T.text, letterSpacing:'-.01em' }}>Orders</div>
        <div style={{ fontSize:12, color:T.muted, marginTop:3 }}>{orders.length} total · {filtered.length} shown</div>
      </div>

      <StatsBar orders={filtered} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search name or SFF ID…" />

      {/* Filter row */}
      <div style={{ display:'flex', gap:8, marginBottom:12, overflowX:'auto', paddingBottom:2 }}>
        {STATUS_FILTERS.map(([val,lbl]) => (
          <FilterChip key={val} label={lbl} active={filter===val} onClick={()=>setFilter(val)} />
        ))}
        <FilterChip
          label={`📅 Date${hasDateFilter?' ✓':''}`}
          active={hasDateFilter}
          onClick={()=>setShowDateFilter(s=>!s)}
        />
      </div>

      {/* Date range picker */}
      {showDateFilter && (
        <div className="fade-up" style={{ background:cardBg, border:`1px solid ${cardBorder}`, borderRadius:T.r.lg, padding:'14px 14px 10px', marginBottom:12, boxShadow:T.sh.xs }}>
          <DateRangeBar from={dateRange.from} to={dateRange.to} onChange={setDate} T={T} />
        </div>
      )}

      {/* Export + Add row */}
      <div style={{ display:'flex', gap:8, marginBottom:14 }}>
        <button onClick={()=>setModal({})} style={{
          flex:1, padding:13,
          background: T.isDark?'linear-gradient(135deg,rgba(155,127,212,0.08),rgba(201,107,154,0.06))':'linear-gradient(135deg,#f3eff9,#fdf0f6)',
          border:`1.5px dashed ${T.isDark?'rgba(155,127,212,0.3)':T.violet.d+'55'}`,
          borderRadius:T.r.lg, color:T.violet.d, fontSize:13, fontWeight:700, cursor:'pointer',
          fontFamily:T.fontBody, display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          transition:'all .2s',
        }}>
          <span style={{ fontSize:18 }}>+</span> Add Order
        </button>
        <button onClick={handleExportPDF} disabled={!!exporting} style={{
          padding:'13px 14px', borderRadius:T.r.lg, fontSize:12, fontWeight:700,
          background:T.danger.bg, color:T.danger.text, border:`1px solid ${T.danger.border}`,
          cursor:'pointer', fontFamily:T.fontBody, whiteSpace:'nowrap',
          opacity: exporting?0.6:1,
        }}>{exporting==='pdf'?'…':'📄 PDF'}</button>
        <button onClick={handleExportExcel} disabled={!!exporting} style={{
          padding:'13px 14px', borderRadius:T.r.lg, fontSize:12, fontWeight:700,
          background:T.success.bg, color:T.success.text, border:`1px solid ${T.success.border}`,
          cursor:'pointer', fontFamily:T.fontBody, whiteSpace:'nowrap',
          opacity: exporting?0.6:1,
        }}>{exporting==='xlsx'?'…':'📊 Excel'}</button>
      </div>

      {/* Filter summary badge */}
      {(hasDateFilter || filter!=='all') && (
        <div style={{ fontSize:11, color:T.muted, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ background:T.violet.pale||T.violet.muted, color:T.violet.d, padding:'3px 10px', borderRadius:T.r.pill, fontWeight:700, fontSize:10 }}>
            {filtered.length} result{filtered.length!==1?'s':''} · {getExportLabel()}
          </span>
        </div>
      )}

      {/* Order list */}
      {filtered.length===0
        ? <EmptyState icon="🪡" title="No orders found" sub="Try adjusting your search or filters" />
        : filtered.map(o => <OrderCard key={o.id} order={o} onClick={setModal} onDelete={o=>setDeleteTarget(o)} />)
      }

      {modal!==null && <OrderModal order={modal} onClose={()=>setModal(null)} onSave={handleSave} />}
    </div>
  );
}
import React, { useState } from 'react';
import StatsBar from './StatsBar';
import OrderCard from './OrderCard';
import OrderModal from './OrderModal';
import { SearchBar, FilterChip, EmptyState } from '../shared';
import { T } from '../../styles/theme';

const FILTERS = [['all','All'],['In Progress','In Progress'],['Delivered','Delivered'],['balance','Has Balance']];

export default function OrdersTab({ orders, onAdd, onUpdate }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal,  setModal]  = useState(null);

  const filtered = orders.filter(o => {
    const match = o.name?.toLowerCase().includes(search.toLowerCase());
    if (filter==='balance') return match && o.balance>0;
    if (filter!=='all')     return match && o.status===filter;
    return match;
  });

  async function handleSave(order) {
    if (order.id) await onUpdate(order);
    else          await onAdd({...order, id:undefined});
    setModal(null);
  }

  return (
    <div style={{ padding:`0 ${T.sp.page}px 100px`, fontFamily:T.fontBody }}>
      <StatsBar orders={orders} />
      <SearchBar value={search} onChange={setSearch} placeholder="Search customer…" />

      {/* Filter chips */}
      <div style={{ display:'flex', gap:8, marginBottom:16, overflowX:'auto', paddingBottom:4 }}>
        {FILTERS.map(([val,lbl]) => (
          <FilterChip key={val} label={lbl} active={filter===val} onClick={()=>setFilter(val)} />
        ))}
      </div>

      {/* Add CTA */}
      <button onClick={()=>setModal({})} style={{
        width:'100%', padding:13,
        background:`linear-gradient(135deg,${T.violet.pale},${T.rose.pale})`,
        border:`1.5px dashed ${T.violet.l}`, borderRadius:T.r.lg,
        color:T.violet.d, fontSize:13, fontWeight:700, cursor:'pointer',
        marginBottom:16, fontFamily:T.fontBody,
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      }}>
        <span style={{ fontSize:20, lineHeight:1 }}>+</span> Add New Order
      </button>

      {/* Order list */}
      {filtered.length===0
        ? <EmptyState icon="🪡" title="No orders found" sub="Try adjusting your search or filters" />
        : filtered.map(o => <OrderCard key={o.id} order={o} onClick={setModal} />)
      }

      {modal!==null && <OrderModal order={modal} onClose={()=>setModal(null)} onSave={handleSave} />}
    </div>
  );
}

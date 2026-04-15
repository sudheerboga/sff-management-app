import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { StatCard, EmptyState, SegmentControl } from '../shared';
import { T } from '../../styles/theme';

function monthLabel(d) { try { return new Date(d).toLocaleDateString('en-IN',{month:'short',year:'2-digit'}); } catch{ return d||'?'; } }

function buildMonthly(orders) {
  const map={};
  orders.forEach(o=>{
    const l=monthLabel(o.date);
    if(!map[l]) map[l]={month:l,revenue:0,profit:0,balance:0,orders:0,_sort:o.date||''};
    map[l].revenue+=o.total||0; map[l].profit+=o.profit||0; map[l].balance+=o.balance||0; map[l].orders+=1;
  });
  return Object.values(map).sort((a,b)=>a._sort.localeCompare(b._sort));
}

function buildTopCustomers(orders) {
  const map={};
  orders.forEach(o=>{ if(!map[o.name]) map[o.name]={name:o.name,total:0,orders:0}; map[o.name].total+=o.total||0; map[o.name].orders+=1; });
  return Object.values(map).sort((a,b)=>b.total-a.total).slice(0,5);
}

const CustomTip = ({active,payload,label}) => active&&payload?.length ? (
  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:T.r.md,padding:'10px 14px',fontSize:12,fontFamily:T.fontBody,boxShadow:T.sh.md}}>
    <div style={{fontWeight:700,marginBottom:4,color:T.text}}>{label}</div>
    {payload.map(p=><div key={p.name} style={{color:p.color}}>
      {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
    </div>)}
  </div>
) : null;

const VIEWS = [{id:'monthly',label:'Monthly'},{id:'customers',label:'Customers'},{id:'status',label:'Status'}];

export default function ChartsTab({ orders }) {
  const [view, setView] = useState('monthly');
  const monthly      = buildMonthly(orders);
  const topCustomers = buildTopCustomers(orders);
  const delivered    = orders.filter(o=>o.status==='Delivered').length;
  const inProgress   = orders.filter(o=>o.status==='In Progress').length;
  const statusData   = [{name:'Delivered',value:delivered,color:T.success.text},{name:'In Progress',value:inProgress,color:T.warning.text}];
  const fmt = n => `₹${n.toLocaleString('en-IN')}`;
  const totalRev  = orders.reduce((s,o)=>s+(o.total||0),0);
  const totalProf = orders.reduce((s,o)=>s+(o.profit||0),0);
  const totalBal  = orders.reduce((s,o)=>s+(o.balance||0),0);
  const avgOrder  = orders.length ? Math.round(totalRev/orders.length) : 0;

  if (orders.length===0) return <EmptyState icon="📊" title="No data yet" sub="Add orders to see your reports and analytics" />;

  return (
    <div style={{padding:`0 ${T.sp.page}px 100px`,fontFamily:T.fontBody}}>
      {/* Page header */}
      <div className="fade-up" style={{marginBottom:18}}>
        <div style={{fontFamily:T.fontDisplay,fontSize:22,fontWeight:600,color:T.text}}>Reports</div>
        <div style={{fontSize:13,color:T.muted,marginTop:4}}>Business analytics and insights</div>
      </div>

      {/* Summary cards */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18}}>
        <StatCard label="Total Revenue"  value={fmt(totalRev)}  color={T.violet.d} accent />
        <StatCard label="Total Profit"   value={fmt(totalProf)} color={T.success.text} />
        <StatCard label="Balance Due"    value={fmt(totalBal)}  color={T.danger.text} />
        <StatCard label="Avg Order"      value={fmt(avgOrder)}  color={T.rose.d} />
      </div>

      {/* View switcher */}
      <div style={{marginBottom:18}}>
        <SegmentControl options={VIEWS} value={view} onChange={setView} />
      </div>

      {/* Monthly charts */}
      {view==='monthly' && (
        <>
          <div style={{background:T.card,borderRadius:T.r.lg,padding:'18px 10px 14px',marginBottom:12,border:`1px solid ${T.border}`,boxShadow:T.sh.card}}>
            <div style={{paddingLeft:8,marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>Revenue vs Profit</div>
              <div style={{fontSize:11,color:T.muted}}>Monthly breakdown (₹)</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{top:4,right:8,left:-10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.bg2} vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTip/>}/>
                <Bar dataKey="revenue" name="Revenue" fill={T.violet.d}  radius={[5,5,0,0]}/>
                <Bar dataKey="profit"  name="Profit"  fill={T.rose.d}    radius={[5,5,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{background:T.card,borderRadius:T.r.lg,padding:'18px 10px 14px',marginBottom:12,border:`1px solid ${T.border}`,boxShadow:T.sh.card}}>
            <div style={{paddingLeft:8,marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>Balance Due Trend</div>
              <div style={{fontSize:11,color:T.muted}}>Pending collections (₹)</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthly} margin={{top:4,right:8,left:-10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.bg2} vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTip/>}/>
                <Line type="monotone" dataKey="balance" name="Balance Due" stroke={T.danger.text} strokeWidth={2.5} dot={{fill:T.danger.text,r:4,strokeWidth:0}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly table */}
          <div style={{background:T.card,borderRadius:T.r.lg,padding:18,border:`1px solid ${T.border}`,boxShadow:T.sh.card}}>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Monthly Summary</div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${T.bg2}`}}>
                  {['Month','Orders','Revenue','Profit'].map(h=>(
                    <th key={h} style={{textAlign:h==='Month'?'left':'right',padding:'6px 4px',color:T.muted,fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:'.05em'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthly.map(m=>(
                  <tr key={m.month} style={{borderBottom:`1px solid ${T.bg2}`}}>
                    <td style={{padding:'10px 4px',fontWeight:700,color:T.text}}>{m.month}</td>
                    <td style={{padding:'10px 4px',textAlign:'right',color:T.muted}}>{m.orders}</td>
                    <td style={{padding:'10px 4px',textAlign:'right',fontWeight:700,color:T.violet.d}}>₹{m.revenue.toLocaleString('en-IN')}</td>
                    <td style={{padding:'10px 4px',textAlign:'right',fontWeight:700,color:T.success.text}}>₹{m.profit.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Top customers */}
      {view==='customers' && (
        <div style={{background:T.card,borderRadius:T.r.lg,padding:18,border:`1px solid ${T.border}`,boxShadow:T.sh.card}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Top Customers by Revenue</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCustomers} layout="vertical" margin={{top:0,right:12,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.bg2} horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:T.muted}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:T.text2}} axisLine={false} tickLine={false} width={88}/>
              <Tooltip formatter={v=>[`₹${v.toLocaleString('en-IN')}`,'Revenue']}/>
              <Bar dataKey="total" radius={[0,5,5,0]}>
                {topCustomers.map((_,i)=><Cell key={i} fill={[T.violet.d,T.rose.d,T.blue.d,T.violet.l,T.rose.l][i]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{marginTop:16}}>
            {topCustomers.map((c,i)=>(
              <div key={c.name} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${T.bg2}`}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:[T.violet.pale,T.rose.pale,T.blue.pale,T.violet.pale,T.rose.pale][i],display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:[T.violet.d,T.rose.d,T.blue.d,T.violet.d,T.rose.d][i],flexShrink:0}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:T.text}}>{c.name}</div>
                  <div style={{fontSize:11,color:T.muted}}>{c.orders} order{c.orders>1?'s':''}</div>
                </div>
                <div style={{fontSize:15,fontWeight:800,background:T.grad.brand,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>₹{c.total.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status pie */}
      {view==='status' && (
        <>
          <div style={{background:T.card,borderRadius:T.r.lg,padding:18,marginBottom:12,border:`1px solid ${T.border}`,boxShadow:T.sh.card}}>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Order Status</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={4} dataKey="value">
                  {statusData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[v,'Orders']}/>
                <Legend iconType="circle" iconSize={10} formatter={v=><span style={{fontSize:12,color:T.text2,fontFamily:T.fontBody}}>{v}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {statusData.map(s=>(
            <div key={s.name} style={{background:T.card,borderRadius:T.r.md,padding:'13px 16px',marginBottom:8,border:`1px solid ${T.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:T.sh.xs}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:12,height:12,borderRadius:'50%',background:s.color}}/>
                <span style={{fontSize:13,fontWeight:600,color:T.text}}>{s.name}</span>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:22,fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{fontSize:10,color:T.muted}}>{orders.length?Math.round((s.value/orders.length)*100):0}% of total</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

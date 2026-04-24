import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { StatCard, EmptyState, SegmentControl } from '../shared';
import { useTheme } from '../../context/ThemeContext';

function monthLabel(d) { try { return new Date(d).toLocaleDateString('en-IN',{month:'short',year:'2-digit'}); } catch { return d||'?'; } }

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

function CustomTip({active,payload,label}) {
  const { theme: T } = useTheme();
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:T.isDark?'rgba(14,11,26,0.96)':'rgba(255,255,255,0.97)',border:`1px solid ${T.border}`,borderRadius:T.r.md,padding:'10px 14px',fontSize:12,fontFamily:T.fontBody,boxShadow:T.sh.lg}}>
      <div style={{fontWeight:700,marginBottom:4,color:T.text}}>{label}</div>
      {payload.map(p=><div key={p.name} style={{color:p.color}}>{p.name}: ₹{Number(p.value).toLocaleString('en-IN')}</div>)}
    </div>
  );
}

const VIEWS = [{id:'monthly',label:'Monthly'},{id:'customers',label:'Customers'},{id:'status',label:'Status'}];
const PALETTE = ['#7B5EA7','#C96B9A','#4A6FD4','#D4AF6F','#4ade80'];

export default function ChartsTab({ orders }) {
  const { theme: T, isDark } = useTheme();
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

  const CHART_CARD = {
    background: isDark ? 'rgba(26,21,48,0.7)' : T.card,
    backdropFilter: isDark ? 'blur(16px)' : 'none',
    border: `1px solid ${isDark?'rgba(155,127,212,0.15)':T.border}`,
    borderRadius: T.r.lg,
    boxShadow: T.sh.card,
  };

  const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const tickColor  = T.muted;
  const dividerColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  if (orders.length===0) return <EmptyState icon="📊" title="No data yet" sub="Add orders to see your reports and analytics" />;

  return (
    <div id='sff-charts-tab' style={{padding:`0 ${T.sp.page}px 100px`,fontFamily:T.fontBody}}>
      <div className="fade-up" style={{marginBottom:18,paddingTop:4}}>
        <div style={{fontFamily:T.fontDisplay,fontSize:22,fontWeight:600,color:T.text,letterSpacing:'-.01em'}}>Reports</div>
        <div style={{fontSize:12,color:T.muted,marginTop:3}}>Business analytics & insights</div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:18}}>
        <StatCard label="Total Revenue"  value={fmt(totalRev)}  color={T.violet.d} accent />
        <StatCard label="Total Profit"   value={fmt(totalProf)} color={T.success.text} />
        <StatCard label="Balance Due"    value={fmt(totalBal)}  color={T.danger.text} />
        <StatCard label="Avg Order"      value={fmt(avgOrder)}  color={T.isDark?T.gold.d:T.rose.d} />
      </div>

      <div style={{marginBottom:18}}><SegmentControl options={VIEWS} value={view} onChange={setView} /></div>

      {view==='monthly' && (
        <>
          <div style={{...CHART_CARD, padding:'18px 10px 14px', marginBottom:12}}>
            <div style={{paddingLeft:8,marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>Revenue vs Profit</div>
              <div style={{fontSize:11,color:T.muted,marginTop:2}}>Monthly breakdown (₹)</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{top:4,right:8,left:-10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:10,fill:tickColor}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:tickColor}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTip/>}/>
                <Bar dataKey="revenue" name="Revenue" fill="url(#revGrad)" radius={[5,5,0,0]}/>
                <Bar dataKey="profit"  name="Profit"  fill="url(#profGrad)" radius={[5,5,0,0]}/>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7B5EA7" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#4A6FD4" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#4ade80" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{...CHART_CARD, padding:'18px 10px 14px', marginBottom:12}}>
            <div style={{paddingLeft:8,marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>Balance Due Trend</div>
              <div style={{fontSize:11,color:T.muted,marginTop:2}}>Pending collections over time</div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthly} margin={{top:4,right:8,left:-10,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:10,fill:tickColor}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:tickColor}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTip/>}/>
                <Line type="monotone" dataKey="balance" name="Balance" stroke="#f87171" strokeWidth={2.5} dot={{fill:'#f87171',r:4,strokeWidth:0}} activeDot={{r:6}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{...CHART_CARD, padding:16}}>
            <div style={{fontSize:10,fontWeight:700,color:isDark?T.gold.d:T.violet.d,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:14,height:1,background:isDark?T.grad.gold:T.grad.brand,opacity:.6}}/>Monthly Breakdown
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,fontFamily:T.fontBody}}>
              <thead>
                <tr>{['Month','Orders','Revenue','Profit'].map(h=>(
                  <th key={h} style={{padding:'6px 4px',textAlign:h==='Month'?'left':'right',fontSize:10,color:T.muted,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',borderBottom:`1px solid ${dividerColor}`}}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>{monthly.map(m=>(
                <tr key={m.month} style={{borderBottom:`1px solid ${dividerColor}`}}>
                  <td style={{padding:'11px 4px',fontWeight:700,color:T.text}}>{m.month}</td>
                  <td style={{padding:'11px 4px',textAlign:'right',color:T.muted}}>{m.orders}</td>
                  <td style={{padding:'11px 4px',textAlign:'right',fontWeight:700,color:T.violet.d}}>₹{m.revenue.toLocaleString('en-IN')}</td>
                  <td style={{padding:'11px 4px',textAlign:'right',fontWeight:700,color:T.success.text}}>₹{m.profit.toLocaleString('en-IN')}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}

      {view==='customers' && (
        <div style={{...CHART_CARD, padding:18}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:16}}>Top Customers by Revenue</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topCustomers} layout="vertical" margin={{top:0,right:12,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false}/>
              <XAxis type="number" tick={{fontSize:10,fill:tickColor}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:T.text2}} axisLine={false} tickLine={false} width={90}/>
              <Tooltip formatter={v=>[`₹${v.toLocaleString('en-IN')}`,'Revenue']}/>
              <Bar dataKey="total" radius={[0,5,5,0]}>
                {topCustomers.map((_,i)=><Cell key={i} fill={PALETTE[i%PALETTE.length]} opacity={0.85}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{marginTop:16}}>
            {topCustomers.map((c,i)=>(
              <div key={c.name} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 0',borderBottom:`1px solid ${dividerColor}`}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:`${PALETTE[i%PALETTE.length]}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:PALETTE[i%PALETTE.length],flexShrink:0}}>{i+1}</div>
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

      {view==='status' && (
        <>
          <div style={{...CHART_CARD, padding:18, marginBottom:12}}>
            <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}}>Order Status</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={4} dataKey="value">
                  {statusData.map((e,i)=><Cell key={i} fill={e.color} opacity={0.85}/>)}
                </Pie>
                <Tooltip formatter={v=>[v,'Orders']}/>
                <Legend iconType="circle" iconSize={10} formatter={v=><span style={{fontSize:12,color:T.text2,fontFamily:T.fontBody}}>{v}</span>}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {statusData.map(s=>(
            <div key={s.name} style={{...CHART_CARD, padding:'14px 16px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:s.color,boxShadow:isDark?`0 0 8px ${s.color}55`:'none'}}/>
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

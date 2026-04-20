import React, { useState } from 'react';
import { useAuth }      from './hooks/useAuth';
import { useUserData }  from './hooks/useUserData';
import { useTheme }     from './context/ThemeContext';

import SplashScreen     from './components/Auth/SplashScreen';
import LoginScreen      from './components/Auth/LoginScreen';
import AppHeader        from './components/Layout/AppHeader';
import BottomNav        from './components/Layout/BottomNav';
import OrdersTab        from './components/Orders/OrdersTab';
import AddOrderTab      from './components/AddOrder/AddOrderTab';
import ChartsTab        from './components/Charts/ChartsTab';
import MeasurementsTab  from './components/Measurements/MeasurementsTab';
import { LoadingDots }  from './components/shared';

function MainApp({ user }) {
  const [tab, setTab] = useState('orders');
  const { orders, measurements, loading, addOrder, updateOrder, saveMeasurement } = useUserData(user.uid);
  const { theme: T } = useTheme();

  return (
    <div style={{
      width:'100%', maxWidth:430, minHeight:'100vh',
      background:T.bg, position:'relative',
      boxShadow: T.isDark ? '0 0 80px rgba(0,0,0,.8)' : '0 0 60px rgba(26,22,37,.15)',
      overflow:'hidden', transition:'background .3s',
    }}>
      {/* Ambient mesh */}
      <div style={{ position:'fixed', inset:0, maxWidth:430, pointerEvents:'none', zIndex:0, background:T.grad.mesh }} />
      {T.isDark && <>
        <div style={{ position:'fixed', top:'10%', left:'5%', width:200, height:200, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(123,94,167,0.1) 0%,transparent 70%)',
          animation:'orb1 12s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
        <div style={{ position:'fixed', bottom:'20%', right:'5%', width:160, height:160, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(201,107,154,0.08) 0%,transparent 70%)',
          animation:'orb2 15s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
      </>}

      <div style={{ position:'relative', zIndex:1 }}>
        <AppHeader user={user} />
        <div style={{ paddingTop:12, minHeight:'calc(100vh - 60px)' }}>
          {loading ? <LoadingDots /> : <>
            {tab==='orders'  && <OrdersTab orders={orders} onAdd={addOrder} onUpdate={updateOrder} />}
            {tab==='add'     && <AddOrderTab onAdd={o=>{ addOrder(o); setTab('orders'); }} />}
            {tab==='charts'  && <ChartsTab orders={orders} />}
            {tab==='measure' && <MeasurementsTab orders={orders} measurements={measurements} onSaveMeasurement={saveMeasurement} />}
          </>}
        </div>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();
  const { theme: T } = useTheme();

  const shell = { display:'flex', justifyContent:'center', minHeight:'100vh', background:T.shellBg, transition:'background .3s' };

  if (loading) return <div style={shell}><SplashScreen /></div>;
  if (!user) return <div style={shell}><div style={{ width:'100%', maxWidth:430 }}><LoginScreen /></div></div>;
  return <div style={shell}><MainApp user={user} /></div>;
}

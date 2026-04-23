import React, { useState, useRef } from 'react';
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

// Tab order — used for swipe-back navigation
const TAB_ORDER = ['orders', 'add', 'charts', 'measure'];

function MainApp({ user }) {
  const [tab, setTab] = useState('orders');
  const { orders, measurements, loading, addOrder, updateOrder, saveMeasurement } = useUserData(user.uid);
  const { theme: T } = useTheme();
  const isIPhone = /iPhone/i.test(navigator.userAgent);

  // ── Swipe gesture refs ────────────────────────────────────────
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const SWIPE_THRESHOLD = 60;   // min px horizontal to trigger
  const ANGLE_LIMIT     = 35;   // max degrees off horizontal

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const angle = Math.abs(Math.atan2(Math.abs(dy), Math.abs(dx)) * (180 / Math.PI));

    // Only trigger if mostly horizontal
    if (Math.abs(dx) >= SWIPE_THRESHOLD && angle <= ANGLE_LIMIT) {
      const idx = TAB_ORDER.indexOf(tab);
      if (dx > 0 && idx > 0) {
        // Right swipe → go to previous tab
        setTab(TAB_ORDER[idx - 1]);
      } else if (dx < 0 && idx < TAB_ORDER.length - 1) {
        // Left swipe → go to next tab
        setTab(TAB_ORDER[idx + 1]);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  }

  return (
    <div
      id="sff-app-main"
      style={{
        width:'100%', maxWidth:430, minHeight:'100vh',
        background:T.bg, position:'relative',
        boxShadow: T.isDark ? '0 0 80px rgba(0,0,0,.8)' : '0 0 60px rgba(26,22,37,.15)',
        overflow:'hidden', transition:'background .3s',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient mesh */}
      <div id="sff-bg-mesh" style={{ position:'fixed', inset:0, maxWidth:430, pointerEvents:'none', zIndex:0, background:T.grad.mesh }} />
      {T.isDark && <>
        <div id="sff-orb-1" style={{ position:'fixed', top:'10%', left:'5%', width:200, height:200, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(123,94,167,0.1) 0%,transparent 70%)',
          animation:'orb1 12s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
        <div id="sff-orb-2" style={{ position:'fixed', bottom:'20%', right:'5%', width:160, height:160, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(201,107,154,0.08) 0%,transparent 70%)',
          animation:'orb2 15s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
      </>}

      <div id="sff-content" style={{ position:'relative', zIndex:1 }}>
        <AppHeader user={user} />
        <div id="sff-tab-content" style={{ paddingTop: isIPhone ? '8rem' : '5rem', minHeight:'calc(100vh - 60px)' }}>
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

  if (loading) return <div id="sff-shell-loading" style={shell}><SplashScreen /></div>;
  if (!user)   return <div id="sff-shell-auth"    style={shell}><div style={{ width:'100%', maxWidth:430 }}><LoginScreen /></div></div>;
  return <div id="sff-shell" style={shell}><MainApp user={user} /></div>;
}

import React, { useState } from 'react';
import { useAuth }      from './hooks/useAuth';
import { useUserData }  from './hooks/useUserData';

import SplashScreen     from './components/Auth/SplashScreen';
import LoginScreen      from './components/Auth/LoginScreen';
import AppHeader        from './components/Layout/AppHeader';
import BottomNav        from './components/Layout/BottomNav';
import OrdersTab        from './components/Orders/OrdersTab';
import AddOrderTab      from './components/AddOrder/AddOrderTab';
import ChartsTab        from './components/Charts/ChartsTab';
import MeasurementsTab  from './components/Measurements/MeasurementsTab';
import { LoadingDots }  from './components/shared';
import { T }            from './styles/theme';

function MainApp({ user }) {
  const [tab, setTab] = useState('orders');
  const { orders, measurements, loading, addOrder, updateOrder, saveMeasurement } = useUserData(user.uid);

  return (
    <div style={{ width:'100%', maxWidth:430, minHeight:'100vh', background:T.bg, position:'relative', boxShadow:'0 0 60px rgba(26,22,37,.15)' }}>
      <AppHeader user={user} />

      <div style={{ paddingTop:12, minHeight:'calc(100vh - 60px)' }}>
        {loading
          ? <LoadingDots />
          : <>
              {tab==='orders'  && <OrdersTab orders={orders} onAdd={addOrder} onUpdate={updateOrder} />}
              {tab==='add'     && <AddOrderTab onAdd={o=>{ addOrder(o); setTab('orders'); }} />}
              {tab==='charts'  && <ChartsTab orders={orders} />}
              {tab==='measure' && <MeasurementsTab orders={orders} measurements={measurements} onSaveMeasurement={saveMeasurement} />}
            </>
        }
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  const shell = {
    display:'flex', justifyContent:'center',
    minHeight:'100vh', background:'#e8e3f0',
  };

  if (loading) return <div style={shell}><SplashScreen /></div>;

  if (!user) return (
    <div style={shell}>
      <div style={{ width:'100%', maxWidth:430 }}>
        <LoginScreen />
      </div>
    </div>
  );

  return (
    <div style={shell}>
      <MainApp user={user} />
    </div>
  );
}

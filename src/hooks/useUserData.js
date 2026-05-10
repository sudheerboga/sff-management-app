import { useState, useEffect, useCallback } from 'react';
import { subscribeToOrders, subscribeToMeasurements, addOrder as fbAdd, updateOrder as fbUpdate, deleteOrder as fbDelete, saveMeasurement as fbSave, deleteMeasurement as fbDeleteMeas, upsertUserProfile, getUserProfile } from '../firebase/userService';

export function useUserData(uid) {
  const [orders,setOrders]               = useState([]);
  const [measurements,setMeasurements]   = useState({});
  const [profile,setProfile]             = useState(null);
  const [loading,setLoading]             = useState(true);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    getUserProfile(uid).then(p => { if (!p) upsertUserProfile(uid,{createdAt:new Date().toISOString()}); setProfile(p||{}); });
    const u1 = subscribeToOrders(uid, data => { setOrders(data); setLoading(false); });
    const u2 = subscribeToMeasurements(uid, data => setMeasurements(data));
    return () => { u1(); u2(); };
  }, [uid]);

  const addOrder          = useCallback(async o => { const {id,...d}=o; await fbAdd(uid,d); },      [uid]);
  const updateOrder       = useCallback(async o => { await fbUpdate(uid,o); },                        [uid]);
  const deleteOrder       = useCallback(async id => { await fbDelete(uid,id); },                      [uid]);
  const saveMeasurement   = useCallback(async (c,g,v) => { await fbSave(uid,c,g,v); },               [uid]);
  const deleteMeasurement = useCallback(async c => { await fbDeleteMeas(uid,c); },                    [uid]);

  return { orders, measurements, profile, loading, addOrder, updateOrder, deleteOrder, saveMeasurement, deleteMeasurement };
}

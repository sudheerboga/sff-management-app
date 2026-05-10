import { doc, collection, getDoc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const userRef   = uid => doc(db,'users',uid);
const orderCol  = uid => collection(db,'users',uid,'orders');
const orderRef  = (uid,oid) => doc(db,'users',uid,'orders',oid);
const measRef   = uid => doc(db,'users',uid,'measurements','data');

// Generate SFF order ID: SFF-YYYYMMDD-XXXX
export function generateOrderId() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  const rand = Math.random().toString(36).substring(2,6).toUpperCase();
  return `SFF-${date}-${rand}`;
}

export async function getUserProfile(uid) { const s=await getDoc(userRef(uid)); return s.exists()?s.data():null; }
export async function upsertUserProfile(uid,data) { await setDoc(userRef(uid),{...data,updatedAt:serverTimestamp()},{merge:true}); }

export function subscribeToOrders(uid, cb) {
  const q = query(orderCol(uid), orderBy('createdAt','desc'));
  return onSnapshot(q, s => cb(s.docs.map(d=>({id:d.id,...d.data()}))));
}

export async function addOrder(uid, data) {
  const {id,...rest}=data;
  const sffId = rest.sffId || generateOrderId();
  return (await addDoc(orderCol(uid),{...rest,sffId,createdAt:serverTimestamp(),updatedAt:serverTimestamp()})).id;
}

export async function updateOrder(uid, data) {
  const {id,...rest}=data;
  await updateDoc(orderRef(uid,id),{...rest,updatedAt:serverTimestamp()});
}

export async function deleteOrder(uid,oid) { await deleteDoc(orderRef(uid,oid)); }

export function subscribeToMeasurements(uid, cb) {
  return onSnapshot(measRef(uid), s => cb(s.exists()?s.data():{}));
}

export async function saveMeasurement(uid, customer, garment, vals) {
  await setDoc(measRef(uid),{[customer]:{[garment]:vals}},{merge:true});
}

export async function deleteMeasurement(uid, customerName) {
  // Remove the customer key from the measurements document using FieldValue.delete()
  const { updateDoc, deleteField } = await import('firebase/firestore');
  await updateDoc(measRef(uid), { [customerName]: deleteField() });
}

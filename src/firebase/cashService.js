// Cash Book — Firestore service
// Path: users/{uid}/cashbook/{entryId}
// Each entry: { id, label, amount, type: 'in'|'out', date, createdAt }

import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

const cashCol = uid => collection(db, 'users', uid, 'cashbook');
const cashRef = (uid, id) => doc(db, 'users', uid, 'cashbook', id);

export function subscribeToCash(uid, cb) {
  const q = query(cashCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function addCashEntry(uid, entry) {
  const { id, ...data } = entry;
  await addDoc(cashCol(uid), { ...data, createdAt: serverTimestamp() });
}

export async function updateCashEntry(uid, entry) {
  const { id, ...data } = entry;
  await updateDoc(cashRef(uid, id), data);
}

export async function deleteCashEntry(uid, entryId) {
  await deleteDoc(cashRef(uid, entryId));
}

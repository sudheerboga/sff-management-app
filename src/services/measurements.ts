import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Measurement, CustomerMeasurements } from '@/types';
import { softDelete } from './softDelete';

function measurementsCol(boutiqueId: string) {
  return collection(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.MEASUREMENTS);
}

function fromFirestore(id: string, data: Record<string, unknown>): Measurement {
  return {
    id,
    boutiqueId: data.boutiqueId as string || '',
    customerId: data.customerId as string || '',
    memberName: data.memberName as string || (data.customerName as string) || '',
    memberId: data.memberId as string | undefined,
    customerName: data.customerName as string || '',
    customerPhone: data.customerPhone as string || '',
    garments: (data.garments as CustomerMeasurements) || {},
    notes: data.notes as string || '',
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    isDeleted: data.isDeleted as boolean || false,
  };
}

export async function getMeasurements(boutiqueId: string): Promise<Measurement[]> {
  const q = query(measurementsCol(boutiqueId), where('isDeleted', '==', false), orderBy('customerName', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
}

export async function getMeasurement(boutiqueId: string, measurementId: string): Promise<Measurement | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.MEASUREMENTS, measurementId));
  if (!snap.exists()) return null;
  return fromFirestore(snap.id, snap.data() as Record<string, unknown>);
}

export async function createMeasurement(boutiqueId: string, data: {
  customerId: string;
  memberName: string;
  memberId?: string;
  customerName: string;
  customerPhone: string;
  garments: CustomerMeasurements;
  notes: string;
}): Promise<string> {
  const ref = await addDoc(measurementsCol(boutiqueId), {
    boutiqueId,
    ...data,
    memberId: data.memberId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDeleted: false,
  });
  return ref.id;
}

export async function updateMeasurement(boutiqueId: string, measurementId: string, data: {
  customerId?: string;
  memberName?: string;
  memberId?: string;
  customerName?: string;
  customerPhone?: string;
  garments?: CustomerMeasurements;
  notes?: string;
}): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.MEASUREMENTS, measurementId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMeasurement(boutiqueId: string, measurementId: string, deletedBy: string, deletedByName: string): Promise<void> {
  const measurementDoc = doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.MEASUREMENTS, measurementId);
  const snap = await getDoc(measurementDoc);
  if (!snap.exists()) return;
  await softDelete(boutiqueId, 'measurements', measurementId, snap.data() as Record<string, unknown>, deletedBy, deletedByName);
  await updateDoc(measurementDoc, { isDeleted: true, updatedAt: serverTimestamp() });
}

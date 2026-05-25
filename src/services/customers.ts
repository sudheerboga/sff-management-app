import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Customer, CustomerMember } from '@/types';

function customersCol(boutiqueId: string) {
  return collection(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.CUSTOMERS);
}

function fromFirestore(id: string, data: Record<string, unknown>): Customer {
  return {
    id,
    boutiqueId: (data.boutiqueId as string) || '',
    name: (data.name as string) || '',
    phone: (data.phone as string) || '',
    members: (data.members as CustomerMember[]) || [],
    notes: (data.notes as string) || '',
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

export async function getCustomers(boutiqueId: string): Promise<Customer[]> {
  const q = query(customersCol(boutiqueId), orderBy('name', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
}

export interface CreateCustomerData {
  name: string;
  phone: string;
  members: CustomerMember[];
  notes?: string;
}

export async function createCustomer(boutiqueId: string, data: CreateCustomerData): Promise<string> {
  const ref = await addDoc(customersCol(boutiqueId), {
    boutiqueId,
    name: data.name,
    phone: data.phone.replace(/\D/g, '').slice(-10),
    members: data.members,
    notes: data.notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCustomer(
  boutiqueId: string,
  customerId: string,
  data: Partial<Omit<CreateCustomerData, 'phone'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.CUSTOMERS, customerId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function addMemberToCustomer(
  boutiqueId: string,
  customerId: string,
  member: CustomerMember,
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.CUSTOMERS, customerId), {
    members: arrayUnion(member),
    updatedAt: serverTimestamp(),
  });
}

export async function findCustomerByPhone(
  boutiqueId: string,
  phone: string,
): Promise<Customer | null> {
  const clean = phone.replace(/\D/g, '').slice(-10);
  const q = query(customersCol(boutiqueId), where('phone', '==', clean));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return fromFirestore(snap.docs[0].id, snap.docs[0].data() as Record<string, unknown>);
}

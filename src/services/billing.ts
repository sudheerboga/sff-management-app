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
import { Bill, BillItem, PaymentStatus } from '@/types';
import { softDelete } from './softDelete';

function billingCol(boutiqueId: string) {
  return collection(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.BILLING);
}

function fromFirestore(id: string, data: Record<string, unknown>): Bill {
  return {
    id,
    boutiqueId: data.boutiqueId as string || '',
    orderId: data.orderId as string | undefined,
    invoiceNumber: data.invoiceNumber as string || '',
    customerName: data.customerName as string || '',
    customerPhone: data.customerPhone as string || '',
    items: (data.items as BillItem[]) || [],
    subtotal: data.subtotal as number || 0,
    gstPercent: data.gstPercent as number || 0,
    gstAmount: data.gstAmount as number || 0,
    totalAmount: data.totalAmount as number || 0,
    paidAmount: data.paidAmount as number || 0,
    balanceAmount: data.balanceAmount as number || 0,
    paymentStatus: data.paymentStatus as PaymentStatus || 'pending',
    notes: data.notes as string || '',
    createdBy: data.createdBy as string || '',
    createdByName: data.createdByName as string || '',
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    isDeleted: data.isDeleted as boolean || false,
  };
}

export async function getBills(boutiqueId: string): Promise<Bill[]> {
  const q = query(billingCol(boutiqueId), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
}

export async function getBill(boutiqueId: string, billId: string): Promise<Bill | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.BILLING, billId));
  if (!snap.exists()) return null;
  return fromFirestore(snap.id, snap.data() as Record<string, unknown>);
}

export async function getNextInvoiceNumber(boutiqueId: string): Promise<string> {
  const q = query(billingCol(boutiqueId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  const count = snap.size + 1;
  return `INV-${String(count).padStart(4, '0')}`;
}

export interface CreateBillData {
  customerName: string;
  customerPhone: string;
  orderId?: string;
  items: BillItem[];
  gstPercent: number;
  paidAmount: number;
  notes: string;
  createdBy: string;
  createdByName: string;
}

export async function createBill(boutiqueId: string, data: CreateBillData): Promise<string> {
  const invoiceNumber = await getNextInvoiceNumber(boutiqueId);
  const subtotal = data.items.reduce((s, i) => s + i.amount, 0);
  const gstAmount = (subtotal * data.gstPercent) / 100;
  const totalAmount = subtotal + gstAmount;
  const balanceAmount = totalAmount - data.paidAmount;
  let paymentStatus: PaymentStatus = 'pending';
  if (data.paidAmount >= totalAmount) paymentStatus = 'paid';
  else if (data.paidAmount > 0) paymentStatus = 'partial';

  const ref = await addDoc(billingCol(boutiqueId), {
    boutiqueId,
    invoiceNumber,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    orderId: data.orderId || null,
    items: data.items,
    subtotal,
    gstPercent: data.gstPercent,
    gstAmount,
    totalAmount,
    paidAmount: data.paidAmount,
    balanceAmount,
    paymentStatus,
    notes: data.notes,
    createdBy: data.createdBy,
    createdByName: data.createdByName,
    createdAt: serverTimestamp(),
    isDeleted: false,
  });
  return ref.id;
}

export async function updateBillPayment(boutiqueId: string, billId: string, paidAmount: number, totalAmount: number): Promise<void> {
  let paymentStatus: PaymentStatus = 'pending';
  if (paidAmount >= totalAmount) paymentStatus = 'paid';
  else if (paidAmount > 0) paymentStatus = 'partial';
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.BILLING, billId), {
    paidAmount,
    balanceAmount: totalAmount - paidAmount,
    paymentStatus,
  });
}

export async function deleteBill(boutiqueId: string, billId: string, deletedBy: string, deletedByName: string): Promise<void> {
  const billDoc = doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.BILLING, billId);
  const snap = await getDoc(billDoc);
  if (!snap.exists()) return;
  await softDelete(boutiqueId, 'billing', billId, snap.data() as Record<string, unknown>, deletedBy, deletedByName);
  await updateDoc(billDoc, { isDeleted: true });
}

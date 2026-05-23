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
import { Order, OrderItem, OrderStatus } from '@/types';
import { softDelete } from './softDelete';

function ordersCol(boutiqueId: string) {
  return collection(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.ORDERS);
}

function generateOrderNumber(boutiqueName: string): string {
  const initials = boutiqueName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join('')
    .slice(0, 4);
  const prefix = initials || 'ORD';
  const suffix = Date.now().toString(36).slice(-5).toUpperCase();
  return `${prefix}-${suffix}`;
}

function fromFirestore(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    orderNumber: data.orderNumber as string || id.slice(-6).toUpperCase(),
    boutiqueId: data.boutiqueId as string || '',
    customerName: data.customerName as string || '',
    customerPhone: data.customerPhone as string || '',
    items: (data.items as OrderItem[]) || [],
    totalAmount: data.totalAmount as number || 0,
    totalProfit: data.totalProfit as number || 0,
    materialCost: data.materialCost as number || 0,
    paidAmount: data.paidAmount as number || 0,
    balanceAmount: data.balanceAmount as number || 0,
    status: data.status as OrderStatus || 'pending',
    orderDate: data.orderDate instanceof Timestamp ? data.orderDate.toDate() : new Date(),
    deliveryDate: data.deliveryDate instanceof Timestamp ? data.deliveryDate.toDate() : null,
    notes: data.notes as string || '',
    createdBy: data.createdBy as string || '',
    createdByName: data.createdByName as string || '',
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    isDeleted: data.isDeleted as boolean || false,
  };
}

export async function getOrders(boutiqueId: string): Promise<Order[]> {
  const q = query(ordersCol(boutiqueId), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
}

export async function getOrder(boutiqueId: string, orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.ORDERS, orderId));
  if (!snap.exists()) return null;
  return fromFirestore(snap.id, snap.data() as Record<string, unknown>);
}

export interface CreateOrderData {
  boutiqueName: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  paidAmount: number;
  materialCost: number;
  deliveryDate: Date | null;
  orderDate: Date;
  notes: string;
  createdBy: string;
  createdByName: string;
}

export async function createOrder(boutiqueId: string, data: CreateOrderData): Promise<string> {
  const totalAmount = data.items.reduce((s, i) => s + i.amount, 0);
  const orderNumber = generateOrderNumber(data.boutiqueName);
  const ref = await addDoc(ordersCol(boutiqueId), {
    orderNumber,
    boutiqueId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    items: data.items,
    totalAmount,
    totalProfit: totalAmount - (data.materialCost || 0),
    materialCost: data.materialCost || 0,
    paidAmount: data.paidAmount,
    balanceAmount: totalAmount - data.paidAmount,
    status: 'pending' as OrderStatus,
    orderDate: data.orderDate || serverTimestamp(),
    deliveryDate: data.deliveryDate || null,
    notes: data.notes,
    createdBy: data.createdBy,
    createdByName: data.createdByName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDeleted: false,
  });
  return ref.id;
}

export async function updateOrderStatus(boutiqueId: string, orderId: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.ORDERS, orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function updateOrderPayment(boutiqueId: string, orderId: string, paidAmount: number, totalAmount: number): Promise<void> {
  let status: OrderStatus = 'pending';
  if (paidAmount >= totalAmount) status = 'delivered';
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.ORDERS, orderId), {
    paidAmount,
    balanceAmount: totalAmount - paidAmount,
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function updateOrder(
  boutiqueId: string,
  orderId: string,
  data: Partial<Omit<CreateOrderData, 'boutiqueName'> & { status: OrderStatus }>,
): Promise<void> {
  const update: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
  if (data.items) {
    update.totalAmount = data.items.reduce((s, i) => s + i.amount, 0);
    const materialCost = (data.materialCost ?? 0);
    update.totalProfit = (update.totalAmount as number) - materialCost;
  }
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.ORDERS, orderId), update);
}

export async function deleteOrder(boutiqueId: string, orderId: string, deletedBy: string, deletedByName: string): Promise<void> {
  const orderDoc = doc(db, COLLECTIONS.BOUTIQUES, boutiqueId, COLLECTIONS.ORDERS, orderId);
  const snap = await getDoc(orderDoc);
  if (!snap.exists()) return;
  await softDelete(boutiqueId, 'orders', orderId, snap.data() as Record<string, unknown>, deletedBy, deletedByName);
  await updateDoc(orderDoc, { isDeleted: true, updatedAt: serverTimestamp() });
}

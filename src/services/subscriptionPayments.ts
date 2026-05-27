import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { SubscriptionPayment } from '@/types';

const col = collection(db, COLLECTIONS.SUBSCRIPTION_PAYMENTS);

function fromFirestore(id: string, data: Record<string, unknown>): SubscriptionPayment {
  return {
    id,
    boutiqueId:   data.boutiqueId   as string,
    boutiqueName: data.boutiqueName as string,
    plan:         data.plan         as string,
    planName:     data.planName     as string,
    amount:       data.amount       as number,
    paidAt:       (data.paidAt    instanceof Timestamp ? data.paidAt.toDate()    : new Date()),
    validFrom:    (data.validFrom  instanceof Timestamp ? data.validFrom.toDate()  : new Date()),
    expiresAt:    (data.expiresAt  instanceof Timestamp ? data.expiresAt.toDate()  : new Date()),
    recordedBy:   data.recordedBy  as string,
    notes:        data.notes       as string | undefined,
  };
}

export async function addSubscriptionPayment(
  data: Omit<SubscriptionPayment, 'id'>,
): Promise<string> {
  const ref = await addDoc(col, {
    ...data,
    paidAt:    Timestamp.fromDate(data.paidAt),
    validFrom: Timestamp.fromDate(data.validFrom),
    expiresAt: Timestamp.fromDate(data.expiresAt),
  });
  return ref.id;
}

export async function getPaymentsForBoutique(boutiqueId: string): Promise<SubscriptionPayment[]> {
  const snap = await getDocs(query(col, where('boutiqueId', '==', boutiqueId)));
  return snap.docs
    .map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>))
    .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime());
}

export async function getAllSubscriptionPayments(): Promise<SubscriptionPayment[]> {
  const snap = await getDocs(query(col, orderBy('paidAt', 'desc')));
  return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
}

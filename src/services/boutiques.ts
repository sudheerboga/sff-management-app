import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { Boutique, BoutiqueBranding, BoutiqueSubscription, CloudinaryConfig } from '@/types';

const col = collection(db, COLLECTIONS.BOUTIQUES);

function fromFirestore(id: string, data: Record<string, unknown>): Boutique {
  const sub = data.subscription as Record<string, unknown> || {};
  const expiresAt = sub.expiresAt instanceof Timestamp ? sub.expiresAt.toDate() : null;
  return {
    id,
    name: data.name as string || '',
    ownerName: data.ownerName as string || '',
    ownerPhone: data.ownerPhone as string || '',
    ownerEmail: data.ownerEmail as string | undefined,
    address: data.address as string | undefined,
    gstin: data.gstin as string | undefined,
    cloudinary: data.cloudinary as CloudinaryConfig | undefined,
    status: data.status as Boutique['status'] || 'active',
    subscription: {
      plan: sub.plan as string || 'free',
      planName: sub.planName as string || 'Free Plan',
      expiresAt,
      features: sub.features as string[] || [],
      isActive: sub.isActive as boolean ?? true,
      maxOrders: sub.maxOrders as number | undefined,
      maxStaff: sub.maxStaff as number | undefined,
    },
    branding: data.branding ? (data.branding as BoutiqueBranding) : undefined,
    createdAt: (data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date()),
    updatedAt: (data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date()),
  };
}

export async function getAllBoutiques(): Promise<Boutique[]> {
  const snap = await getDocs(query(col, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => fromFirestore(d.id, d.data() as Record<string, unknown>));
}

export async function getBoutique(boutiqueId: string): Promise<Boutique | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId));
  if (!snap.exists()) return null;
  return fromFirestore(snap.id, snap.data() as Record<string, unknown>);
}

export async function createBoutique(
  data: {
    name: string;
    ownerName: string;
    ownerPhone: string;
    ownerEmail?: string;
    address?: string;
    gstin?: string;
    cloudinary?: CloudinaryConfig;
  },
  createdByUid: string,
): Promise<string> {
  const ref = await addDoc(col, {
    ...data,
    status: 'active',
    subscription: {
      plan: 'free',
      planName: 'Free Plan',
      expiresAt: null,
      features: ['orders', 'measurements', 'billing'],
      isActive: true,
      maxOrders: 100,
      maxStaff: 2,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Auto-invite the owner as admin so they can log in with phone OTP immediately
  await setDoc(doc(db, COLLECTIONS.STAFF_INVITES, data.ownerPhone), {
    phone: data.ownerPhone,
    boutiqueId: ref.id,
    name: data.ownerName,
    role: 'admin',
    invitedBy: createdByUid,
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateBoutiqueStatus(boutiqueId: string, status: Boutique['status']): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId), { status, updatedAt: serverTimestamp() });
}

export async function updateBoutiqueSubscription(boutiqueId: string, subscription: Partial<BoutiqueSubscription>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId), {
    'subscription.plan': subscription.plan,
    'subscription.planName': subscription.planName,
    'subscription.expiresAt': subscription.expiresAt || null,
    'subscription.features': subscription.features || [],
    'subscription.isActive': subscription.isActive ?? true,
    'subscription.maxOrders': subscription.maxOrders || null,
    'subscription.maxStaff': subscription.maxStaff || null,
    updatedAt: serverTimestamp(),
  });
}

export async function updateBoutique(boutiqueId: string, data: Partial<Pick<Boutique, 'name' | 'ownerName' | 'ownerPhone' | 'ownerEmail' | 'address' | 'gstin' | 'cloudinary'>>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId), { ...data, updatedAt: serverTimestamp() });
}

export async function updateBoutiqueBranding(boutiqueId: string, branding: BoutiqueBranding): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId), {
    branding,
    updatedAt: serverTimestamp(),
  });
}

export async function updateBoutiqueFeatures(boutiqueId: string, features: string[]): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUES, boutiqueId), {
    'subscription.features': features,
    updatedAt: serverTimestamp(),
  });
}

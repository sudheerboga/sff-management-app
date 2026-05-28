import {
  collection,
  doc,
  getDocs,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { StaffMember, StaffInvite } from '@/types';
import { createPhoneUser } from '@/services/auth';

function fromFirestore(data: Record<string, unknown>): StaffMember {
  return {
    uid: data.uid as string || '',
    boutiqueId: data.boutiqueId as string || '',
    name: data.name as string || '',
    phone: data.phone as string || '',
    role: data.role as 'admin' | 'staff',
    isActive: data.isActive as boolean ?? true,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
  };
}

export async function getStaffMembers(boutiqueId: string): Promise<StaffMember[]> {
  const q = query(
    collection(db, COLLECTIONS.BOUTIQUE_USERS),
    where('boutiqueId', '==', boutiqueId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => fromFirestore(d.data() as Record<string, unknown>));
}

export async function inviteStaff(boutiqueId: string, data: {
  name: string;
  phone: string;
  role: 'admin' | 'staff';
  invitedBy: string;
}): Promise<void> {
  const uid = await createPhoneUser(data.phone);
  await setDoc(doc(db, COLLECTIONS.BOUTIQUE_USERS, uid), {
    uid,
    boutiqueId,
    name: data.name,
    phone: data.phone,
    role: data.role,
    isActive: true,
    mustResetPassword: true,
    invitedBy: data.invitedBy,
    createdAt: serverTimestamp(),
  });
}

export async function toggleStaffStatus(uid: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUE_USERS, uid), { isActive });
}

export async function removeStaff(uid: string, phone: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUE_USERS, uid), { isActive: false });
  try {
    await deleteDoc(doc(db, COLLECTIONS.STAFF_INVITES, phone));
  } catch {
    // invite may not exist
  }
}

export async function updateStaffRole(uid: string, role: 'admin' | 'staff'): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUE_USERS, uid), { role });
}

export async function getPendingInvites(boutiqueId: string): Promise<StaffInvite[]> {
  const q = query(
    collection(db, COLLECTIONS.STAFF_INVITES),
    where('boutiqueId', '==', boutiqueId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      phone: d.id,
      boutiqueId: data.boutiqueId as string,
      role: data.role as 'admin' | 'staff',
      name: data.name as string,
      invitedBy: data.invitedBy as string,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
  });
}

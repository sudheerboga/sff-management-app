import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, secondaryAuth, db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { AuthUser } from '@/types';

export function phoneToEmail(phone: string): string {
  const digits = phone.replace(/^\+91/, '').replace(/\D/g, '');
  return `${digits}@gmail.com`;
}

export async function signInWithPhone(phone: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, phoneToEmail(phone), password);
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

// Creates a Firebase Auth account for a boutique user using phone+password.
// Uses the secondary app so the super admin's session is not disturbed.
export async function createPhoneUser(phone: string): Promise<string> {
  const { user } = await createUserWithEmailAndPassword(secondaryAuth, phoneToEmail(phone), phone);
  await firebaseSignOut(secondaryAuth);
  return user.uid;
}

export async function changePassword(newPassword: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');
  await updatePassword(currentUser, newPassword);
}

export async function clearMustResetPassword(uid: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BOUTIQUE_USERS, uid), { mustResetPassword: false });
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resolveUserRole(firebaseUser: User): Promise<AuthUser | null> {
  const { uid, email } = firebaseUser;

  const superAdminSnap = await getDoc(doc(db, COLLECTIONS.SUPER_ADMINS, uid));
  if (superAdminSnap.exists()) {
    const data = superAdminSnap.data();
    return { uid, email: email ?? undefined, role: 'superAdmin', name: data.name || 'Super Admin' };
  }

  const boutiqueUserSnap = await getDoc(doc(db, COLLECTIONS.BOUTIQUE_USERS, uid));
  if (boutiqueUserSnap.exists()) {
    const data = boutiqueUserSnap.data();
    if (!data.isActive) return null;
    const boutiqueSnap = await getDoc(doc(db, COLLECTIONS.BOUTIQUES, data.boutiqueId));
    const boutiqueData = boutiqueSnap.exists() ? boutiqueSnap.data() : null;
    const boutiqueName = boutiqueData?.name || 'Boutique';
    const logoUrl = (boutiqueData?.branding as { logoUrl?: string } | undefined)?.logoUrl ?? undefined;
    return {
      uid,
      phone: data.phone as string ?? undefined,
      role: data.role as 'admin' | 'staff',
      boutiqueId: data.boutiqueId,
      boutiqueName,
      logoUrl,
      name: data.name || 'User',
      cloudinary: boutiqueData?.cloudinary ?? undefined,
      mustResetPassword: (data.mustResetPassword as boolean) ?? false,
    };
  }

  // Auto-provision: first login for a newly invited user whose Firestore doc
  // was already created by the admin via createPhoneUser + setDoc
  // (no legacy staffInvites lookup needed)

  return null;
}

export function listenAuthState(callback: (user: AuthUser | null, loading: boolean) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null, false);
      return;
    }
    callback(null, true);
    try {
      const user = await resolveUserRole(firebaseUser);
      callback(user, false);
    } catch {
      callback(null, false);
    }
  });
}


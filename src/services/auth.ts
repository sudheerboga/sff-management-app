import {
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  ConfirmationResult,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/collections';
import { AuthUser, StaffInvite } from '@/types';

let recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    try { recaptchaVerifier.clear(); } catch { /* ignore */ }
    recaptchaVerifier = null;
  }
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
  return recaptchaVerifier;
}

export async function sendPhoneOtp(phone: string, containerId: string): Promise<ConfirmationResult> {
  const verifier = setupRecaptcha(containerId);
  return signInWithPhoneNumber(auth, phone, verifier);
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resolveUserRole(firebaseUser: User): Promise<AuthUser | null> {
  const { uid, phoneNumber, email } = firebaseUser;

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
    const boutiqueName = boutiqueSnap.exists() ? boutiqueSnap.data().name : 'Boutique';
    return {
      uid,
      phone: phoneNumber ?? undefined,
      role: data.role as 'admin' | 'staff',
      boutiqueId: data.boutiqueId,
      boutiqueName,
      name: data.name || 'User',
    };
  }

  // Check staff invite by phone number
  if (phoneNumber) {
    const inviteSnap = await getDoc(doc(db, COLLECTIONS.STAFF_INVITES, phoneNumber));
    if (inviteSnap.exists()) {
      const invite = inviteSnap.data() as StaffInvite;
      await setDoc(doc(db, COLLECTIONS.BOUTIQUE_USERS, uid), {
        uid,
        boutiqueId: invite.boutiqueId,
        name: invite.name,
        phone: phoneNumber,
        role: invite.role,
        isActive: true,
        createdAt: serverTimestamp(),
      });
      const boutiqueSnap = await getDoc(doc(db, COLLECTIONS.BOUTIQUES, invite.boutiqueId));
      const boutiqueName = boutiqueSnap.exists() ? boutiqueSnap.data().name : 'Boutique';
      return {
        uid,
        phone: phoneNumber,
        role: invite.role,
        boutiqueId: invite.boutiqueId,
        boutiqueName,
        name: invite.name,
      };
    }
  }

  return null;
}

export function listenAuthState(callback: (user: AuthUser | null, loading: boolean) => void): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null, false);
      return;
    }
    callback(null, true); // signal loading while role is being resolved
    try {
      const user = await resolveUserRole(firebaseUser);
      callback(user, false);
    } catch {
      callback(null, false);
    }
  });
}

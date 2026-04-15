import { RecaptchaVerifier, signInWithPhoneNumber, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';

let recaptchaVerifier = null;

export function setupRecaptcha(elementId) {
  if (recaptchaVerifier) { try { recaptchaVerifier.clear(); } catch(_){} recaptchaVerifier = null; }
  recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
    size:'invisible', callback:()=>{}, 'expired-callback':()=>{ recaptchaVerifier=null; },
  });
  return recaptchaVerifier;
}

export async function sendOtp(phoneNumber) {
  if (!recaptchaVerifier) throw new Error('reCAPTCHA not initialized');
  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
}

export async function verifyOtp(confirmationResult, otp) {
  const result = await confirmationResult.confirm(otp);
  return result.user;
}

export async function logOut() { await signOut(auth); }

export function onAuthChange(callback) { return onAuthStateChanged(auth, callback); }

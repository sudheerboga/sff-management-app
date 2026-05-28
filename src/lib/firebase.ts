import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBPPQizMEd5sPVAONpcDVDG5gu94vM6nOw",
  authDomain: "boutiques-management.firebaseapp.com",
  projectId: "boutiques-management",
  storageBucket: "boutiques-management.firebasestorage.app",
  messagingSenderId: "253951289711",
  appId: "1:253951289711:web:e4b8e9d6dc5280a352209a",
  measurementId: "G-4DH4ZBZFEQ",
};

const app = initializeApp(firebaseConfig);

// Secondary app used only to create new user accounts without signing out the current admin
const secondaryApp = getApps().find((a) => a.name === 'secondary') ?? initializeApp(firebaseConfig, 'secondary');

export const db = getFirestore(app);
export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
export const storage = getStorage(app);
export default app;

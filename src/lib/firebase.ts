import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBpS8XATHDzas2kQdxF4zDeHSw0FKdZ7cA",
  authDomain: "boutiqo-sales.firebaseapp.com",
  projectId: "boutiqo-sales",
  storageBucket: "boutiqo-sales.firebasestorage.app",
  messagingSenderId: "13203812064",
  appId: "1:13203812064:web:2f635adb4eb3c101f26a85",
};

const app = initializeApp(firebaseConfig);

// Secondary app used only to create new user accounts without signing out the current admin
const secondaryApp = getApps().find((a) => a.name === 'secondary') ?? initializeApp(firebaseConfig, 'secondary');

export const db = getFirestore(app);
export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
export const storage = getStorage(app);
export default app;

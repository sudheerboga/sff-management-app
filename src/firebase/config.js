// PASTE YOUR FIREBASE CONFIG HERE
// Firebase Console → Project Settings → Your Apps → Web (</>)
import { initializeApp } from 'firebase/app';
import { getFirestore }  from 'firebase/firestore';
import { getAuth }       from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDwolSnQwtlQxxqTt_PuawJpDjZ-IzXUvk",
  authDomain: "sri-fashion-fusion.firebaseapp.com",
  projectId: "sri-fashion-fusion",
  storageBucket: "sri-fashion-fusion.firebasestorage.app",
  messagingSenderId: "790807561877",
  appId: "1:790807561877:web:1b6235d56da2e1c8ee7d9c",
  measurementId: "G-4DH4ZBZFEQ"
};

const app = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);

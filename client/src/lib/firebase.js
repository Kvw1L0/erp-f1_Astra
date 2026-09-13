import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'granpremiof1veltis';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyASb08jIpy0FeBDFgCDTM-snlQsJsesUnk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`,
  projectId: projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "308661074409",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:308661074409:web:f7886564bfe3df8ec27378"
};

export const isFirebaseConfigured = () => {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
};

let app = null;
let database = null;
let firestore = null;

if (typeof window !== 'undefined' && isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    try {
      database = getDatabase(app);
    } catch (e) {
      console.warn('Realtime Database init note:', e);
    }
    try {
      firestore = getFirestore(app);
    } catch (e) {
      console.warn('Firestore init note:', e);
    }
  } catch (error) {
    console.error('Error al inicializar Firebase:', error);
  }
}

export const getFirebaseDb = () => {
  if (!database && app) {
    try {
      database = getDatabase(app);
    } catch (e) {
      console.warn('Realtime Database init note:', e);
    }
  }
  return database;
};

export { app, database, firestore, firebaseConfig };

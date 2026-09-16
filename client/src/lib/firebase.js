import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, onValue, ref } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'erp-f1-astra';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBNW-MBO5FkVQv1KKlp6n9UY1XAsmDe3tc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`,
  projectId: projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "702098679679",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:702098679679:web:f74241537008eb3bc9dc4a"
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

export const getRaceAuth = () => app ? getAuth(app) : null;
let sessionPromise;
export async function ensureRaceSession() {
  const auth = getRaceAuth();
  if (!auth) throw new Error('Firebase no está disponible');
  if (!sessionPromise) sessionPromise = auth.authStateReady().then(async () => {
    if (!auth.currentUser) await signInAnonymously(auth);
    return auth.currentUser;
  }).catch(error => { sessionPromise = null; throw error; });
  await sessionPromise;
  return auth.currentUser;
}
export const isRaceAdmin = user => !!user?.emailVerified && user.email?.toLowerCase() === 'rockbemol@gmail.com';
export async function signInRaceAdmin() {
  await ensureRaceSession();
  const result = await signInWithPopup(getRaceAuth(), new GoogleAuthProvider());
  if (!isRaceAdmin(result.user)) throw new Error('Esta cuenta no tiene acceso a Dirección de Carrera.');
  return result.user;
}

let clockOffset = 0;
export const raceNow = () => Date.now() + clockOffset;
export function watchRaceConnection(callback) {
  const db = getFirebaseDb();
  const stopClock = onValue(ref(db, '.info/serverTimeOffset'), snap => { clockOffset = Number(snap.val()) || 0; });
  const stopConnection = onValue(ref(db, '.info/connected'), snap => callback(snap.val() === true));
  return () => { stopClock(); stopConnection(); };
}

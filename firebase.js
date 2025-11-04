// firebase.js
// Configuración mínima para Firebase v9 modular + helper para Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import Constants from 'expo-constants';

// REEMPLAZA con tu config real de Firebase (API keys etc.)
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

// Intentamos obtener valores inyectados por app.config.js (expo) o desde process.env
const extra = Constants.expoConfig?.extra || {};

const firebaseConfigResolved = {
  apiKey: extra.FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: extra.FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: extra.FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: extra.FIREBASE_APP_ID || firebaseConfig.appId,
  measurementId: extra.FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId,
};

const app = initializeApp(firebaseConfigResolved);
export const db = getFirestore(app);

// Helper: timestamp de servidor (útil para mensajes)
export const getServerTimestamp = () => serverTimestamp();

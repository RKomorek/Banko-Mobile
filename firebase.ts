import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC3OKJFB5NhQn40RLmNhmbA8q6bkbLaGeg",

  authDomain: "banko-9292b.firebaseapp.com",
  
  projectId: "banko-9292b",
  
  storageBucket: "banko-9292b.firebasestorage.app",
  
  messagingSenderId: "442249103199",
  
  appId: "1:442249103199:web:5e1740ceeb791a908e58ea"
};

const app = initializeApp(firebaseConfig);

// Initialize services with error handling
let _auth: ReturnType<typeof getAuth> | null = null;
try {
  _auth = getAuth(app);
} catch (e) {
  console.warn("Firebase Auth não está disponível durante a inicialização:", e);
}

let _db: ReturnType<typeof getFirestore> | null = null;
try {
  _db = getFirestore(app);
} catch (e) {
  console.warn("Firestore não está disponível durante a inicialização:", e);
}

let _storage: ReturnType<typeof getStorage> | null = null;
try {
  _storage = getStorage(app);
} catch (e) {
  console.warn("Firebase Storage não está disponível durante a inicialização:", e);
}

export const auth = _auth;
export const db = _db;
export const storage = _storage;

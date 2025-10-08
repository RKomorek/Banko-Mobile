import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC3OKJFB5NhQn40RLmNhmbA8q6bkbLaGeg",
  authDomain: "banko-9292b.firebaseapp.com",
  projectId: "banko-9292b",
  storageBucket: "banko-9292b.firebasestorage.app",
  messagingSenderId: "442249103199",
  appId: "1:442249103199:web:5e1740ceeb791a908e58ea"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyCDIqrxMzSFkuHY8kNAj6eLIN7k6KC7i10",
  authDomain: "banko-43675.firebaseapp.com",
  projectId: "banko-43675",
  storageBucket: "banko-43675.firebasestorage.app",
  messagingSenderId: "719378461127",
  appId: "1:719378461127:web:6d761f236b1b62eea969e2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, '(default)');
export const storage = getStorage(app);
export const auth = getAuth(app);

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBx6xtoi4XZqXKgByoFPRx5JfMMv0PJs9I",
  authDomain: "banko-6cd00.firebaseapp.com",
  projectId: "banko-6cd00",
  storageBucket: "banko-6cd00.firebasestorage.app",
  messagingSenderId: "1094728929995",
  appId: "1:1094728929995:web:93765c0522de8bd7af014e"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

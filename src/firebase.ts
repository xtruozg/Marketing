import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNA22-tD31hsgL6MxWZn2cOxpMEbnJHHo",
  authDomain: "viet-tien.firebaseapp.com",
  projectId: "viet-tien",
  storageBucket: "viet-tien.firebasestorage.app",
  messagingSenderId: "654721293215",
  appId: "1:654721293215:web:dd26951b1f65eb9d68fbaa",
  measurementId: "G-YN4SM3BWKG"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

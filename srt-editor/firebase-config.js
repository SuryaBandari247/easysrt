// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBR0n4dDI46p3aV-NqNh38KEEy0FVtebFk",
    authDomain: "easysrt-1eec7.firebaseapp.com",
    projectId: "easysrt-1eec7",
    storageBucket: "easysrt-1eec7.firebasestorage.app",
    messagingSenderId: "475372981810",
    appId: "1:475372981810:web:5a38850993749e75af762b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, doc, setDoc, getDoc, updateDoc };

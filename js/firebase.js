import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyB8_TFSHHIk3HHcDC4478R1jBQCS6nvsnQ",
    authDomain: "login-88aab.firebaseapp.com",
    projectId: "login-88aab",
    storageBucket: "login-88aab.firebasestorage.app",
    messagingSenderId: "460715420280",
    appId: "1:460715420280:web:54d129a73398631dbfdb8d",
    measurementId: "G-G6JL99V8C3"
  };
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAoEKRVuQKkbO5simGLszp-Y8mCTRAbFfQ",
  authDomain: "sellfix-web.firebaseapp.com",
  projectId: "sellfix-web",
  storageBucket: "sellfix-web.firebasestorage.app",
  messagingSenderId: "381995495462",
  appId: "1:381995495462:web:39c4d5cfcbdfeaa9c2b6e7"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
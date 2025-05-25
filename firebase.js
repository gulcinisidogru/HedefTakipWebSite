import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTWJdjMtqx0HDYY2xM6CzwSQKQfrVniY0",
  authDomain: "hedeftakip-26dee.firebaseapp.com",
  projectId: "hedeftakip-26dee",
  storageBucket: "hedeftakip-26dee.appspot.com",
  messagingSenderId: "569059043357",
  appId: "1:569059043357:web:242d6fd203472bf427bef4",
  measurementId: "G-S205R6J18R"
};

// Firebase başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Gerekli fonksiyonları dışa aktar
export { db, auth, onAuthStateChanged };

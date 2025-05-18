// firebase.js - Modül olmayan versiyon
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

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
//const analytics = getAnalytics(app);
const db = getFirestore(app);

// Global erişim için
//window.db = db;



export { db }; 
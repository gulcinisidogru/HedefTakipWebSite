// firebase.js

// Firebase uygulamasını başlatmak için gerekli fonksiyonları import ediyoruz.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
// Firestore veritabanı servisini almak için gerekli fonksiyonu import ediyoruz.
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
// Firebase kimlik doğrulama servisini almak için gerekli fonksiyonu import ediyoruz.
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

// Firebase projenizin yapılandırma bilgileri.
// Bu bilgiler Firebase konsolunuzdan alınmıştır ve uygulamanızın Firebase ile iletişim kurmasını sağlar.
const firebaseConfig = {
  apiKey: "AIzaSyBTWJdjMtqx0HDYY2xM6CzwSQKQfrVniY0",
  authDomain: "hedeftakip-26dee.firebaseapp.com",
  projectId: "hedeftakip-26dee",
  storageBucket: "hedeftakip-26dee.appspot.com",
  messagingSenderId: "569059043357",
  appId: "1:569059043357:web:242d6fd203472bf427bef4",
  measurementId: "G-S205R6J18R"
};

// Firebase uygulamasını başlatıyoruz.
const app = initializeApp(firebaseConfig);
// Firestore veritabanı servisini alıyoruz.
const db = getFirestore(app);
// Firebase kimlik doğrulama servisini alıyoruz.
const auth = getAuth(app);

// Başlatılan Firebase uygulamasını, veritabanı ve kimlik doğrulama nesnelerini dışa aktarıyoruz.
// Bu sayede diğer JavaScript dosyalarında bunları kolayca kullanabiliriz.
export { app, db, auth };
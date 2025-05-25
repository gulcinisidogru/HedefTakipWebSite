import { db, auth } from './firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";

// Kullanıcı durum kontrolü
let currentUser = null;

const initAuth = () => {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const currentPage = window.location.pathname.split('/').pop();

    if (!user) {
      if (currentPage !== 'login.html' && currentPage !== 'signup.html') {
        window.location.href = 'login.html';
      }
      return;
    }

    if (user && (currentPage === 'login.html' || currentPage === 'signup.html')) {
      window.location.href = 'index.html';
    } else if (currentPage === 'index.html') {
      setupUI();
    }
  });
};

const setupUI = () => {
  if (!currentUser) return;

  const addGoalBtn = document.getElementById("add-goal-btn");
  const newGoalInput = document.getElementById("new-goal");
  const goalsList = document.getElementById("goals-list");
  const menuBtn = document.querySelector(".menu-btn");
  const mainMenu = document.querySelector(".main-menu");
  const logoutBtn = document.getElementById("logout");

  // Menü Toggle
  menuBtn?.addEventListener("click", () => {
    mainMenu?.classList.toggle("show");
    menuBtn?.classList.toggle("open");
  });

  // Çıkış Yap
  logoutBtn?.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Çıkış hatası:", error);
      alert("Çıkış yapılırken hata oluştu: " + error.message);
    }
  });

  // Hedef Ekleme
  addGoalBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const goalText = newGoalInput?.value.trim();

    if (!goalText) {
      alert("Lütfen bir hedef girin!");
      return;
    }

    try {
      await addDoc(collection(db, "hedefler"), {
        baslik: goalText,
        tarih: new Date(),
        tamamlandi: false,
        sira: Date.now(),
        kullaniciId: currentUser.uid
      });
      newGoalInput.value = "";
    } catch (error) {
      console.error("Hedef ekleme hatası:", error);
      alert("Hata: " + error.message);
    }
  });

  loadGoals();
  setupRealTimeListener();
};

const loadGoals = async () => {
  if (!currentUser) return;

  const goalsList = document.getElementById("goals-list");
  if (!goalsList) return;

  try {
    const q = query(
      collection(db, "hedefler"),
      where("kullaniciId", "==", currentUser.uid),
      orderBy("sira")
    );
    const snapshot = await getDocs(q);

    goalsList.innerHTML = "";
    if (snapshot.empty) {
      goalsList.innerHTML = '<p class="no-goals">Henüz hedef eklemediniz</p>';
      return;
    }

    snapshot.forEach(docSnap => createGoalElement(docSnap));
    updateStats();
  } catch (error) {
    console.error("Yükleme hatası:", error);
    goalsList.innerHTML = `<p class="error">Hedefler yüklenemedi</p>`;
  }
};

const createGoalElement = (docSnap) => {
  const goalData = docSnap.data();
  const goalItem = document.createElement("div");
  goalItem.className = `goal-item ${goalData.tamamlandi ? 'completed' : ''}`;
  goalItem.dataset.id = docSnap.id;

  const formattedDate = goalData.tarih?.toDate()?.toLocaleDateString('tr-TR') || "";

  goalItem.innerHTML = `
    <div class="goal-content">
      <input type="checkbox" id="goal-${docSnap.id}" ${goalData.tamamlandi ? 'checked' : ''}>
      <label for="goal-${docSnap.id}">
        <span class="day-counter">Gün ${goalItem.parentElement?.children.length + 1 || 1}</span>
        <span class="goal-text">${goalData.baslik}</span>
        <span class="goal-date">${formattedDate}</span>
      </label>
    </div>
    <button class="delete-btn" data-id="${docSnap.id}">×</button>
  `;

  // Tamamlama Durumu
  goalItem.querySelector('input').addEventListener('change', async (e) => {
    try {
      await updateDoc(doc(db, "hedefler", docSnap.id), {
        tamamlandi: e.target.checked
      });
      updateStats();
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      e.target.checked = !e.target.checked;
    }
  });

  // Silme Butonu
  goalItem.querySelector('.delete-btn').addEventListener('click', async (e) => {
    if (confirm("Bu hedefi silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "hedefler", docSnap.id));
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Silme işlemi başarısız: " + error.message);
      }
    }
  });

  document.getElementById("goals-list").appendChild(goalItem);
};

const updateStats = async () => {
  if (!currentUser) return;

  try {
    const q = query(
      collection(db, "hedefler"),
      where("kullaniciId", "==", currentUser.uid)
    );
    const snapshot = await getDocs(q);

    const total = snapshot.size;
    const completed = snapshot.docs.filter(d => d.data().tamamlandi).length;
    const progressPercent = Math.min(Math.round((completed / 21) * 100), 100);

    if (document.getElementById("total-completed")) {
      document.getElementById("total-completed").textContent = `${completed} gün`;
    }
    if (document.getElementById("current-streak")) {
      document.getElementById("current-streak").textContent = `${total} hedef`;
    }
    if (document.getElementById("progress-fill")) {
      document.getElementById("progress-fill").style.width = `${progressPercent}%`;
    }
    if (document.getElementById("progress-text")) {
      document.getElementById("progress-text").textContent = `${completed}/21 gün`;
    }
  } catch (error) {
    console.error("İstatistik hatası:", error);
  }
};

const setupRealTimeListener = () => {
  if (!currentUser) return;

  const q = query(
    collection(db, "hedefler"),
    where("kullaniciId", "==", currentUser.uid),
    orderBy("sira")
  );

  return onSnapshot(q, (snapshot) => {
    loadGoals();
  });
};

// Uygulamayı başlat
document.addEventListener("DOMContentLoaded", initAuth);

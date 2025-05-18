import { db } from './firebase.js';
import { 
  collection, 
  addDoc, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// Firebase bağlantı kontrolü
console.log("Firebase modülleri yüklendi!");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM yüklendi!");
  
  // Elementler
  const addGoalBtn = document.getElementById("add-goal-btn");
  const newGoalInput = document.getElementById("new-goal");
  const goalsList = document.getElementById("goals-list");
  const totalCompletedElement = document.getElementById("total-completed");
  const currentStreakElement = document.getElementById("current-streak");
  const menuBtn = document.querySelector(".menu-btn");
  const mainMenu = document.querySelector(".main-menu");
  const progressFill = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");

  // Hamburger Menü Toggle
  menuBtn.addEventListener("click", () => {
    mainMenu.classList.toggle("show");
    menuBtn.classList.toggle("open");
  });

  // Gerçek zamanlı veri dinleyici
  function setupRealTimeListener() {
    onSnapshot(collection(db, "hedefler"), (snapshot) => {
      loadGoals();
      updateStats();
    });
  }

  // Hedef ekleme
  addGoalBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const goalText = newGoalInput.value.trim();

    if (!goalText) {
      alert("Lütfen bir hedef girin!");
      return;
    }

    try {
      await addDoc(collection(db, "hedefler"), {
        baslik: goalText,
        tarih: new Date(),
        tamamlandi: false
      });
      newGoalInput.value = "";
    } catch (error) {
      console.error("Hata:", error);
      alert("Hedef eklenirken hata oluştu: " + error.message);
    }
  });

  // Hedef listeleme
  async function loadGoals() {
    try {
      const querySnapshot = await getDocs(collection(db, "hedefler"));
      goalsList.innerHTML = "";
      
      querySnapshot.forEach((doc) => {
        const goalData = doc.data();
        const goalItem = document.createElement("div");
        goalItem.className = "goal-item";
        goalItem.dataset.id = doc.id;
        
        const formattedDate = goalData.tarih?.toDate().toLocaleDateString('tr-TR') || "Yeni";
        
        goalItem.innerHTML = `
          <div class="goal-content">
            <input type="checkbox" id="goal-${doc.id}" ${goalData.tamamlandi ? 'checked' : ''}>
            <label for="goal-${doc.id}">
              <span class="goal-text">${goalData.baslik}</span>
              <span class="goal-date">${formattedDate}</span>
            </label>
          </div>
          <button class="delete-btn" data-id="${doc.id}">×</button>
        `;
        
        // Tamamlama durumu güncelleme
        goalItem.querySelector(`input`).addEventListener('change', async (e) => {
          await updateDoc(doc(db, "hedefler", doc.id), {
            tamamlandi: e.target.checked
          });
        });
        
        // Silme butonu
        goalItem.querySelector('.delete-btn').addEventListener('click', async () => {
          if (confirm("Bu hedefi silmek istediğinize emin misiniz?")) {
            await deleteDoc(doc(db, "hedefler", doc.id));
          }
        });
        
        goalsList.appendChild(goalItem);
      });
      
    } catch (error) {
      console.error("Hata:", error);
      goalsList.innerHTML = `<div class="error">Hedefler yüklenirken hata: ${error.message}</div>`;
    }
  }

  // İstatistikleri güncelle
  async function updateStats() {
    const snapshot = await getDocs(collection(db, "hedefler"));
    const total = snapshot.size;
    const completed = snapshot.docs.filter(doc => doc.data().tamamlandi).length;
    
    totalCompletedElement.textContent = `${completed} gün`;
    currentStreakElement.textContent = `${total} gün`;
    
    // İlerleme çubuğu güncelleme
    const progressPercent = Math.min(Math.round((completed / 21) * 100), 100);
    progressFill.style.width = `${progressPercent}%`;
    progressText.textContent = `${completed}/21 gün`;
  }

  // Sayfa yüklendiğinde çalıştır
  loadGoals();
  updateStats();
  setupRealTimeListener();
});
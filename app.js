import { db } from './firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

// Firebase bağlantı kontrolü
console.log("Firebase modülleri yüklendi!");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM yüklendi!");
  
  const addGoalBtn = document.getElementById("add-goal-btn");
  const newGoalInput = document.getElementById("new-goal");
  const goalsList = document.getElementById("goals-list"); // Hedef listesi elementi

  console.log("Buton element:", addGoalBtn);

  // Hedef ekleme fonksiyonu
  addGoalBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("Butona tıklandı!");

    const goalText = newGoalInput.value.trim();
    console.log("Girilen metin:", goalText);

    if (!goalText) {
      alert("Lütfen bir hedef girin!");
      return;
    }

    try {
      console.log("Firestore'a veri ekleniyor...");
      const docRef = await addDoc(collection(db, "hedefler"), {
        baslik: goalText,
        tarih: new Date(),
        tamamlandi: false
      });
      
      console.log("Başarıyla eklendi! ID:", docRef.id);
      newGoalInput.value = "";
      
      // Yeni hedefi listeye ekle
      addGoalToList(goalText, docRef.id);
      
    } catch (error) {
      console.error("Hata:", error);
      alert("Hedef eklenirken hata oluştu: " + error.message);
    }
  });

  // Hedefi listeye ekleme fonksiyonu
  function addGoalToList(goalText, goalId) {
    const goalItem = document.createElement("div");
    goalItem.className = "goal-item";
    goalItem.innerHTML = `
      <input type="checkbox" id="goal-${goalId}">
      <label for="goal-${goalId}">${goalText}</label>
    `;
    goalsList.appendChild(goalItem);
  }

  // Sayfa yüklendiğinde mevcut hedefleri getir
  async function loadGoals() {
    try {
      // Bu kısmı daha sonra Firestore'dan veri çekmek için doldurabilirsiniz
      console.log("Mevcut hedefler yükleniyor...");
    } catch (error) {
      console.error("Hedefler yüklenirken hata:", error);
    }
  }

  // Sayfa yüklendiğinde hedefleri yükle
  loadGoals();
});
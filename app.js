import { db } from './firebase.js';
import { collection, addDoc } from 'firebase/firestore';

console.log("Firebase modülleri yüklendi!"); // Kontrol noktası 1

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM yüklendi!"); // Kontrol noktası 2
  
  const addGoalBtn = document.getElementById("add-goal-btn");
  const newGoalInput = document.getElementById("new-goal");

  console.log("Buton element:", addGoalBtn); // Kontrol noktası 3

  addGoalBtn.addEventListener("click", async (e) => {
    e.preventDefault(); // Form gönderimini engelle
    console.log("Butona tıklandı!"); // Kontrol noktası 4

    const goalText = newGoalInput.value.trim();
    console.log("Girilen metin:", goalText); // Kontrol noktası 5

    if (!goalText) {
      alert("Lütfen bir hedef girin!");
      return;
    }

    try {
      console.log("Firestore'a veri ekleniyor..."); // Kontrol noktası 6
      const docRef = await addDoc(collection(db, "hedefler"), {
        baslik: goalText,
        tarih: new Date(),
        tamamlandi: false
      });
      console.log("Başarıyla eklendi! ID:", docRef.id);
      newGoalInput.value = "";
    } catch (error) {
      console.error("Hata:", error);
      alert("Hedef eklenirken hata oluştu: " + error.message);
    }
  });
});
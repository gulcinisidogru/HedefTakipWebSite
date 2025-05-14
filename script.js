document.addEventListener('DOMContentLoaded', function() {
  // Menü Toggle
  const menuBtn = document.querySelector('.menu-btn');
  const mainMenu = document.querySelector('.main-menu');
  
  menuBtn.addEventListener('click', function() {
    mainMenu.classList.toggle('active');
    menuBtn.classList.toggle('active');
  });
  
  // Çıkış Yap
  document.getElementById('logout').addEventListener('click', function() {
    localStorage.setItem('loggedIn', 'false');
    window.location.href = 'login.html';
  });
  
  // Hedef Takip Sistemi
  class GoalTracker {
    constructor() {
      this.goals = JSON.parse(localStorage.getItem('goals')) || [];
      this.motivations = this.getMotivationalQuotes();
      this.init();
    }
    
    init() {
      this.renderGoals();
      this.updateStats();
      this.setChapterTheme();
      
      // Yeni hedef ekleme
      document.getElementById('add-goal-btn').addEventListener('click', () => this.addGoal());
      document.getElementById('new-goal').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.addGoal();
      });
    }
    
    addGoal() {
      const input = document.getElementById('new-goal');
      const title = input.value.trim();
      
      if (title && !this.goals.some(goal => goal.title === title)) {
        const newGoal = {
          id: Date.now(),
          title,
          daysCompleted: [],
          createdAt: new Date().toISOString()
        };
        
        this.goals.push(newGoal);
        this.saveGoals();
        this.renderGoal(newGoal);
        input.value = '';
        
        // Yeni hedef eklenince motivasyon mesajını güncelle
        this.showMotivation('Yeni bir hedef ekledin! İlk adımı atmayı unutma 👏');
      }
    }
    
    deleteGoal(id) {
      this.goals = this.goals.filter(goal => goal.id !== id);
      this.saveGoals();
      this.renderGoals();
      this.updateStats();
    }
    
    toggleDay(goalId, day) {
      const goal = this.goals.find(g => g.id === goalId);
      const index = goal.daysCompleted.indexOf(day);
      
      if (index === -1) {
        goal.daysCompleted.push(day);
        this.showMotivation(this.motivations[day - 1]);
      } else {
        goal.daysCompleted.splice(index, 1);
      }
      
      // Günleri sıralı tut
      goal.daysCompleted.sort((a, b) => a - b);
      
      this.saveGoals();
      this.updateStats();
      this.setChapterTheme();
    }
    
    saveGoals() {
      localStorage.setItem('goals', JSON.stringify(this.goals));
    }
    
    renderGoals() {
      const goalsList = document.getElementById('goals-list');
      goalsList.innerHTML = '';
      
      if (this.goals.length === 0) {
        goalsList.innerHTML = '<p class="no-goals">Henüz bir hedef eklemediniz. Yukarıdan yeni bir hedef ekleyerek başlayın!</p>';
        return;
      }
      
      this.goals.forEach(goal => this.renderGoal(goal));
    }
    
    renderGoal(goal) {
      const goalsList = document.getElementById('goals-list');
      const goalCard = document.createElement('div');
      goalCard.className = 'goal-card';
      goalCard.innerHTML = `
        <h3>${goal.title}</h3>
        <button class="delete-goal" data-id="${goal.id}">×</button>
        <div class="days-container"></div>
      `;
      
      const daysContainer = goalCard.querySelector('.days-container');
      
      // 21 günlük daireleri oluştur
      for (let day = 1; day <= 21; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = `day ${goal.daysCompleted.includes(day) ? 'completed' : ''}`;
        dayElement.textContent = day;
        dayElement.dataset.day = day;
        dayElement.addEventListener('click', () => this.toggleDay(goal.id, day));
        daysContainer.appendChild(dayElement);
      }
      
      // Sil butonu event listener
      goalCard.querySelector('.delete-goal').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Bu hedefi silmek istediğinize emin misiniz?')) {
          this.deleteGoal(goal.id);
        }
      });
      
      goalsList.appendChild(goalCard);
    }
    
    updateStats() {
      const totalCompleted = this.goals.reduce((sum, goal) => sum + goal.daysCompleted.length, 0);
      document.getElementById('total-completed').textContent = `${totalCompleted} gün`;
      
      // Current streak hesaplama (basit versiyon)
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let streak = 0;
      this.goals.forEach(goal => {
        if (goal.daysCompleted.includes(this.getCurrentDay())) {
          streak++;
        }
      });
      
      document.getElementById('current-streak').textContent = `${streak} hedef`;
      
      // İlerleme çubuğunu güncelle
      const totalPossible = this.goals.length * 21;
      const progressPercent = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
      document.getElementById('progress-fill').style.width = `${progressPercent}%`;
      document.getElementById('progress-text').textContent = `${totalCompleted}/${totalPossible} gün`;
    }
    
    setChapterTheme() {
      const totalCompleted = this.goals.reduce((sum, goal) => sum + goal.daysCompleted.length, 0);
      let chapter = 1;
      let chapterTitle = "Chapter 1: Başlangıç";
      
      if (totalCompleted >= 42) {
        chapter = 3;
        chapterTitle = "Chapter 3: Ustalaşma";
      } else if (totalCompleted >= 21) {
        chapter = 2;
        chapterTitle = "Chapter 2: Gelişim";
      }
      
      document.body.className = `chapter-${chapter}`;
      document.getElementById('chapter-title').textContent = chapterTitle;
    }
    
    showMotivation(message) {
      const motivationText = document.getElementById('motivation-text');
      motivationText.textContent = `"${message}"`;
      
      // Animasyon ekle
      motivationText.parentElement.style.animation = 'none';
      setTimeout(() => {
        motivationText.parentElement.style.animation = 'pulse 0.5s';
      }, 10);
    }
    
    getCurrentDay() {
      // Basitçe ayın gününü döndürüyoruz (1-31 arası)
      return new Date().getDate() % 21 || 21;
    }
    
    getMotivationalQuotes() {
      return [
        "Başlamak en zor kısmı! İlk adımı attığın için tebrikler!",
        "Bugün küçük bir adım attın, yarın bir adım daha...",
        "İstikrar, başarının anahtarıdır. Devam et!",
        "Her gün 1% daha iyi oluyorsun. Harikasın!",
        "Küçük zaferler büyük değişimler getirir.",
        "Bugünün işini yarına bırakma, devam et!",
        "Adım adım ilerliyorsun, pes etme!",
        "Disiplin, motivasyon olmadığında devreye girer. Sen yapabilirsin!",
        "Düşsen bile kalkmayı bilirsin. Hadi devam!",
        "Yarı yolda bile olsan, başlamayanlardan ileridesin.",
        "Sen düşündüğünden daha güçlüsün. İnanmaya devam et!",
        "Başarı, küçük adımların toplamıdır. Devam et!",
        "Her yeni gün yeni bir fırsat. Bugünü değerlendir!",
        "Alışkanlıkların seni inşa ediyor. İyi seçimler yap!",
        "Kendine inanmaya devam et, başaracaksın!",
        "İçindeki ateşi canlı tut. Motivasyonun kaynağı sensin!",
        "Bu süreç seni güçlendiriyor. Hadi devam!",
        "Pes etme, zafer çok yakında!",
        "Hayalini kurduğun hayat için bugün küçük bir adım daha at!",
        "İnanılmaz gidiyorsun! Son düzlüktesin!",
        "Tebrikler! 21 günü tamamladın. Chapter 1 tamamlandı!"
      ];
    }
  }
  
  // Uygulamayı başlat
  if (localStorage.getItem('loggedIn') === 'true') {
    new GoalTracker();
  } else {
    window.location.href = 'login.html';
  }
});
// app.js

// Firebase fonksiyonları importları (firebase.js'den değil, doğrudan Firebase kütüphanesinden gelmeli)
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { auth, db } from './firebase.js'; // firebase.js dosyasından başlatılmış Firebase uygulamasını import edin

class GoalTracker {
    constructor() {
        this.goals = []; // Hedefler (alışkanlıklar) Firebase'den yüklenecek
        this.motivations = this.getMotivationalQuotes(); // Motivasyon sözlerini al
        this.predefinedHabits = [ // Önceden tanımlanmış örnek alışkanlıklar
            { id: 'water', title: 'Günde 8 Bardak Su İç', description: 'Vücudunu nemli tut.', icon: '💧' },
            { id: 'read', title: 'Kitap Oku (15 dk)', description: 'Bilgini artır.', icon: '📚' },
            { id: 'exercise', title: 'Egzersiz Yap (30 dk)', description: 'Formda kal.', icon: '🏋️‍♂️' },
            { id: 'meditate', title: 'Meditasyon Yap (10 dk)', description: 'Zihnine odaklan.', icon: '🧘‍♀️' },
            { id: 'journal', title: 'Günlük Yaz', description: 'Duygularını ifade et.', icon: '✍️' },
            { id: 'stretch', title: 'Esneklik Egzersizleri', description: 'Vücudunu rahatlat.', icon: '🤸‍♀️' },
            { id: 'sleep', title: '7 Saat Uyu', description: 'Dinlen ve yenilen.', icon: '😴' },
            { id: 'learn', title: 'Yeni Bir Şey Öğren', description: 'Beynini aktif tut.', icon: '🧠' },
            { id: 'nature', title: 'Doğada Yürü', description: 'Temiz hava al.', icon: '🌳' },
            { id: 'healthyfood', title: 'Sağlıklı Yemek Ye', description: 'Vücudunu besle.', icon: '🥗' }
        ];

        this.initFirebaseListeners(); // Firebase dinleyicilerini başlat
        this.setupEventListeners(); // Tüm event listener'ları kur
        this.applySavedTheme(); // Kaydedilen temayı uygula
    }

    // --- Yardımcı Fonksiyonlar ---
    getMotivationalQuotes() {
        return [
            "Bugün yeni bir başlangıç yap!",
            "Küçük adımlar büyük başarılara yol açar.",
            "Disiplin, motivasyon bittiğinde başlar.",
            "Pes etme, zafer çok yakın!",
            "Her gün bir adım daha ileri!",
            "Unutma, sen bu yola çıktın. Devam et!",
            "Yapabileceğine inanıyorsan, yarı yoldasın.",
            "Zorluklar seni daha güçlü yapar.",
            "Alışkanlıklar kaderini belirler.",
            "Kendine yatırım yapmaya devam et.",
            "Bugünün küçük çabası, yarının büyük ödülü.",
            "Başlamak, başarmanın yarısıdır.",
            "Düşsen bile kalkmayı bilirsin. Hadi devam!",
            "Yarı yolda bile olsan, başlamayanlardan ileridesin.",
            "Sen düşündüğünden daha güçlüsün. İnanmaya devam et!",
            "Başarı, küçük adımların toplamıdır. Devam et!",
            "Her yeni gün yeni bir fırsat. Bugünü değerlendir!",
            "Alışkanlıkların seni inşa ediyor. İyi seçimler yap!",
            "Kendine inanmaya devam et, başaracaksın!",
            "İçindeki ateşi canlı tut. Motivasyonun kaynağı sensin!",
            "Bu süreç seni güçlendiriyor. Hadi devam!",
            "Sabırla çalışmak, zafere giden yoldur."
        ];
    }

    // Mesaj gösterme fonksiyonu (genel kullanım için)
    showMessage(message, type = 'success') {
        const messageElement = document.getElementById('app-message');
        if (messageElement) {
            messageElement.textContent = message;
            messageElement.classList.remove('error', 'success', 'info'); // Önceki sınıfları temizle
            messageElement.classList.add(type); // Yeni sınıfı ekle
            messageElement.classList.add('show'); // Mesaj kutusunu görünür yap

            setTimeout(() => {
                messageElement.classList.remove('show');
            }, 3000); // 3 saniye sonra gizle
        } else {
            // Eğer messageElement yoksa, sadece konsola yaz
            console.log(`Mesaj (${type}): ${message}`);
        }
    }

    applySavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'default';
        document.body.className = '';
        document.body.classList.add(savedTheme);
        const currentChapter = parseInt(localStorage.getItem('currentChapter')) || 1;
        document.body.classList.add(`chapter-${currentChapter}`);
    }

    // --- UI Güncelleme Fonksiyonları ---
    setupUI(user) {
        const authStatusElement = document.getElementById('auth-status');
        if (authStatusElement) {
            authStatusElement.textContent = user ? `Hoş geldin, ${user.email}!` : 'Giriş Yap';
            authStatusElement.href = user ? 'profile.html' : 'login.html';
        }

        const addGoalSection = document.getElementById('add-goal-section');
        const suggestedHabitsSection = document.getElementById('suggested-habits-container');
        const goalsSection = document.getElementById('goals-section');

        if (user) {
            if (addGoalSection) addGoalSection.style.display = 'block';
            if (suggestedHabitsSection) suggestedHabitsSection.style.display = 'block';
            if (goalsSection) goalsSection.style.display = 'block';
        } else {
            if (addGoalSection) addGoalSection.style.display = 'none';
            if (suggestedHabitsSection) suggestedHabitsSection.style.display = 'none';
            if (goalsSection) goalsSection.style.display = 'none';
        }
    }

    renderGoals() {
        const goalsList = document.getElementById('goals-list');
        if (!goalsList) return;

        goalsList.innerHTML = ''; // Listeyi temizle
        if (this.goals.length === 0) {
            goalsList.innerHTML = '<p class="no-goals-message">Henüz hiç alışkanlığınız yok. Yeni bir alışkanlık ekleyin veya önerilenlerden seçin!</p>';
            this.updateGlobalProgress(0); // Hedef yoksa ilerlemeyi sıfırla
            return;
        }

        let totalCompletedDays = 0;
        this.goals.forEach(goal => {
            totalCompletedDays += goal.daysCompleted || 0;

            const goalItem = document.createElement('div');
            goalItem.classList.add('goal-item');
            if (goal.daysCompleted >= 21) {
                goalItem.classList.add('completed-21-days');
            }

            goalItem.innerHTML = `
                <div class="goal-details">
                    <span class="goal-icon">${goal.icon}</span>
                    <div class="goal-text">
                        <h3>${goal.title}</h3>
                        <p>${goal.description}</p>
                    </div>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((goal.daysCompleted || 0) / 21) * 100}%"></div>
                    </div>
                    <span class="progress-text">${goal.daysCompleted || 0}/21 gün</span>
                </div>
                <div class="goal-actions">
                    <button class="complete-btn" data-id="${goal.id}" ${goal.daysCompleted >= 21 ? 'disabled' : ''}>${goal.daysCompleted >= 21 ? 'Tamamlandı!' : 'Bugünü Tamamla'}</button>
                    <button class="delete-btn" data-id="${goal.id}">Sil</button>
                </div>
            `;
            goalsList.appendChild(goalItem);
        });

        this.updateGlobalProgress(totalCompletedDays);
        this.updateChapterTitle(totalCompletedDays);
    }

    renderSuggestedHabits() {
        const suggestedHabitsList = document.getElementById('suggested-habits-list');
        if (!suggestedHabitsList) return;

        suggestedHabitsList.innerHTML = '';
        this.predefinedHabits.forEach(habit => {
            // Eğer bu alışkanlık zaten kullanıcının hedeflerinde varsa gösterme
            if (this.goals.some(goal => goal.title === habit.title)) {
                return;
            }

            const habitCard = document.createElement('div');
            habitCard.classList.add('habit-card');
            habitCard.innerHTML = `
                <div class="habit-icon">${habit.icon}</div>
                <h3>${habit.title}</h3>
                <p>${habit.description}</p>
                <button class="add-suggested-habit-btn" data-title="${habit.title}" data-description="${habit.description}" data-icon="${habit.icon}">Ekle</button>
            `;
            suggestedHabitsList.appendChild(habitCard);
        });
    }

    updateGlobalProgress(totalCompletedDays) {
        const progressText = document.getElementById('progress-text');
        const progressBarFill = document.getElementById('progress-fill');

        if (progressText && progressBarFill) {
            progressText.textContent = `${totalCompletedDays}/21 gün`;
            const progressPercentage = Math.min((totalCompletedDays / 21) * 100, 100); // %100'ü geçmesin
            progressBarFill.style.width = `${progressPercentage}%`;
        }
    }

    updateChapterTitle(totalCompletedDays) {
        const chapterTitle = document.getElementById('chapter-title');
        let chapter = 1;

        if (totalCompletedDays >= 42) {
            chapter = 3;
        } else if (totalCompletedDays >= 21) {
            chapter = 2;
        }

        if (chapterTitle) {
            chapterTitle.textContent = `Chapter ${chapter}: ${this.getChapterName(chapter)}`;
        }
        localStorage.setItem('currentChapter', chapter); // Chapter'ı localStorage'a kaydet
        document.body.className = ''; // Mevcut tema ve chapter sınıflarını temizle
        document.body.classList.add(localStorage.getItem('theme') || 'default');
        document.body.classList.add(`chapter-${chapter}`);
    }

    getChapterName(chapter) {
        switch (chapter) {
            case 1: return "Başlangıç";
            case 2: return "İlerleme";
            case 3: return "Ustalık";
            default: return "Bilinmeyen Chapter";
        }
    }

    // --- Firebase İşlemleri ---
    initFirebaseListeners() {
        // Kullanıcı oturum durumu değiştiğinde çalışır
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Kullanıcı giriş yaptı:", user.email);
                this.setupUI(user);
                this.loadGoals(user.uid); // Kullanıcının hedeflerini yükle
                this.renderSuggestedHabits(); // Önerilen alışkanlıkları render et
                // Profil sayfası yüklendiğinde istatistikleri çek
                if (window.location.pathname.endsWith('profile.html')) {
                    this.getProfileStats();
                }
            } else {
                console.log("Kullanıcı çıkış yaptı.");
                this.setupUI(null);
                // Kullanıcı çıkış yaptığında giriş sayfasına yönlendir
                if (window.location.pathname !== '/login.html' && window.location.pathname !== '/signup.html' && window.location.pathname !== '/about.html') {
                    window.location.href = 'login.html';
                }
                const goalsList = document.getElementById('goals-list');
                if (goalsList) goalsList.innerHTML = '<p class="no-goals-message">Giriş yapınız.</p>';
            }
        });
    }

    async loadGoals(uid) {
        const goalsCollectionRef = collection(db, `users/${uid}/goals`);
        const q = query(goalsCollectionRef);

        // onSnapshot kullanarak gerçek zamanlı güncellemeler al
        onSnapshot(q, (snapshot) => {
            this.goals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderGoals(); // Hedefler değiştiğinde UI'ı yeniden render et
            this.renderSuggestedHabits(); // Hedefler güncellendiğinde önerilenleri de güncelle (eklenenler gizlensin)
        }, (error) => {
            console.error("Hedefler yüklenirken hata oluştu:", error);
            this.showMessage("Hedefler yüklenirken hata oluştu.", 'error');
        });
    }

    async addGoal(title, description, icon) {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            this.showMessage("Hedef eklemek için giriş yapmalısınız.", 'error');
            return;
        }

        // Aynı başlıklı bir hedef zaten varsa eklemeyi engelle
        const existingGoal = this.goals.find(goal => goal.title === title);
        if (existingGoal) {
            this.showMessage("Bu alışkanlık zaten hedeflerinizde mevcut.", 'info');
            return;
        }

        try {
            await addDoc(collection(db, `users/${currentUser.uid}/goals`), {
                title,
                description,
                icon,
                daysCompleted: 0, // Yeni hedef 0 gün tamamlanmış olarak başlar
                createdAt: serverTimestamp()
            });
            this.showMessage("Alışkanlık başarıyla eklendi!", 'success');
        } catch (error) {
            console.error("Hedef eklenirken hata oluştu:", error);
            this.showMessage("Hedef eklenirken hata oluştu.", 'error');
        }
    }

    async toggleGoalCompletion(goalId) {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            this.showMessage("Giriş yapmalısınız.", 'error');
            return;
        }

        const goalRef = doc(db, `users/${currentUser.uid}/goals`, goalId);
        const goalToUpdate = this.goals.find(goal => goal.id === goalId);

        if (goalToUpdate && goalToUpdate.daysCompleted < 21) {
            try {
                await updateDoc(goalRef, {
                    daysCompleted: (goalToUpdate.daysCompleted || 0) + 1
                });
                this.showMessage("Alışkanlık günü güncellendi!", 'success');
            } catch (error) {
                console.error("Hedef tamamlama güncellenirken hata:", error);
                this.showMessage("Alışkanlık günü güncellenirken hata oluştu.", 'error');
            }
        } else if (goalToUpdate && goalToUpdate.daysCompleted >= 21) {
            this.showMessage("Bu alışkanlık için 21 günlük döngüyü tamamladınız!", 'info');
        }
    }

    async deleteGoal(goalId) {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            this.showMessage("Giriş yapmalısınız.", 'error');
            return;
        }

        if (confirm("Bu alışkanlığı silmek istediğinizden emin misiniz?")) {
            try {
                await deleteDoc(doc(db, `users/${currentUser.uid}/goals`, goalId));
                this.showMessage("Alışkanlık başarıyla silindi.", 'success');
            } catch (error) {
                console.error("Hedef silinirken hata:", error);
                this.showMessage("Alışkanlık silinirken hata oluştu.", 'error');
            }
        }
    }

    async getProfileStats() {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            return null;
        }

        try {
            const goalsSnapshot = await getDocs(collection(db, `users/${currentUser.uid}/goals`));
            let totalGoals = goalsSnapshot.size;
            let totalCompletedDays = 0;
            let completed21DayGoals = 0;
            let achievements = [];

            goalsSnapshot.forEach(doc => {
                const goal = doc.data();
                totalCompletedDays += goal.daysCompleted || 0;
                if (goal.daysCompleted >= 21) {
                    completed21DayGoals++;
                }
            });

            // Başarımları hesapla
            if (completed21DayGoals >= 1) achievements.push("İlk Alışkanlık Uzmanı! (1 alışkanlık 21 gün tamamlandı)");
            if (completed21DayGoals >= 3) achievements.push("Alışkanlık Ustası! (3 alışkanlık 21 gün tamamlandı)");
            if (totalCompletedDays >= 100) achievements.push("Yüz Günlük Maratoncu! (Toplam 100 gün tamamlandı)");
            if (totalCompletedDays >= 365) achievements.push("Yıl Boyunca Disiplinli! (Toplam 365 gün tamamlandı)");

            const stats = {
                totalGoals,
                totalCompletedDays,
                completed21DayGoals,
                achievements
            };

            // Profil sayfasındaki elementleri güncelle
            const userEmailElement = document.getElementById('user-email');
            const totalGoalsElement = document.getElementById('total-goals');
            const completedDaysElement = document.getElementById('completed-days');
            const currentChapterElement = document.getElementById('current-chapter');
            const achievementsContainer = document.getElementById('achievements');

            if (userEmailElement) userEmailElement.textContent = currentUser.email;
            if (totalGoalsElement) totalGoalsElement.textContent = stats.totalGoals;
            if (completedDaysElement) completedDaysElement.textContent = stats.totalCompletedDays;

            let chapter = 1;
            if (stats.totalCompletedDays >= 42) chapter = 3;
            else if (stats.totalCompletedDays >= 21) chapter = 2;
            if (currentChapterElement) currentChapterElement.textContent = chapter;

            if (achievementsContainer) {
                achievementsContainer.innerHTML = '';
                if (stats.achievements.length > 0) {
                    const ul = document.createElement('ul');
                    stats.achievements.forEach(achievement => {
                        const li = document.createElement('li');
                        li.textContent = achievement;
                        ul.appendChild(li);
                    });
                    achievementsContainer.appendChild(ul);
                } else {
                    achievementsContainer.innerHTML = '<ul><li>Henüz hiçbir başarım elde edemediniz.</li></ul>';
                }
            }

            return stats;

        } catch (error) {
            console.error("Profil istatistikleri çekilirken hata:", error);
            this.showMessage("Profil istatistikleri yüklenirken hata oluştu.", 'error');
            return null;
        }
    }

    async handleLogout() {
        try {
            await signOut(auth);
            console.log("Kullanıcı çıkış yaptı.");
            // Oturum kapatıldıktan sonra login sayfasına yönlendir
            window.location.href = 'login.html';
        } catch (error) {
            console.error("Çıkış yaparken hata:", error);
            this.showMessage("Çıkış yaparken hata oluştu.", 'error');
        }
    }

    // --- Event Listener Kurulumları ---
    setupEventListeners() {
        // Menü Toggle işlevselliği
        const menuBtn = document.querySelector('.menu-btn');
        const mainMenu = document.querySelector('.main-menu');

        if (menuBtn && mainMenu) {
            menuBtn.addEventListener('click', function() {
                mainMenu.classList.toggle('active');
                menuBtn.classList.toggle('active');
            });
        }

        // Çıkış yap butonu
        const logoutButton = document.getElementById('logout');
        if (logoutButton) {
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleLogout();
            });
        }

        // Hedef ekleme formu
        const addGoalForm = document.getElementById('add-goal-form');
        if (addGoalForm) {
            addGoalForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const goalTitle = document.getElementById('new-goal-title').value;
                const goalDescription = document.getElementById('new-goal-description').value;
                const goalIcon = document.getElementById('new-goal-icon').value;

                if (goalTitle && goalDescription && goalIcon) {
                    await this.addGoal(goalTitle, goalDescription, goalIcon);
                    addGoalForm.reset();
                } else {
                    this.showMessage('Lütfen tüm alanları doldurun.', 'error');
                }
            });
        }

        // Önerilen alışkanlıkları ekleme
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('add-suggested-habit-btn')) {
                const title = e.target.dataset.title;
                const description = e.target.dataset.description;
                const icon = e.target.dataset.icon;
                await this.addGoal(title, description, icon);
            }
        });

        // Hedef tamamlama ve silme butonları
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('complete-btn')) {
                const goalId = e.target.dataset.id;
                await this.toggleGoalCompletion(goalId);
            } else if (e.target.classList.contains('delete-btn')) {
                const goalId = e.target.dataset.id;
                await this.deleteGoal(goalId);
            }
        });

        // Motivasyon sözünü gösterme
        const motivationQuoteElement = document.getElementById('motivation-quote');
        const quoteButton = document.getElementById('show-motivation-btn');

        if (quoteButton && motivationQuoteElement) {
            quoteButton.addEventListener('click', () => {
                const randomIndex = Math.floor(Math.random() * this.motivations.length);
                motivationQuoteElement.textContent = this.motivations[randomIndex];
                motivationQuoteElement.style.opacity = 0; // Animasyon için opaklığı sıfırla
                setTimeout(() => {
                    motivationQuoteElement.style.opacity = 1; // Görünür yap
                }, 10); // Kısa bir gecikme
            });
        }

        // Chapter başlığına tıklandığında motivasyon sözünü göster (isteğe bağlı)
        const chapterTitleElement = document.getElementById('chapter-title');
        if (chapterTitleElement && motivationQuoteElement) {
            chapterTitleElement.addEventListener('click', () => {
                const randomIndex = Math.floor(Math.random() * this.motivations.length);
                motivationQuoteElement.textContent = this.motivations[randomIndex];
                motivationQuoteElement.style.opacity = 0;
                setTimeout(() => {
                    motivationQuoteElement.style.opacity = 1;
                }, 10);
            });
        }

        // Login formu
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const messageElement = document.getElementById('login-message');

                if (email && password) {
                    messageElement.textContent = 'Giriş yapılıyor...';
                    try {
                        await signInWithEmailAndPassword(auth, email, password);
                        messageElement.textContent = 'Giriş başarılı!';
                        window.location.href = 'index.html';
                    } catch (error) {
                        console.error("Giriş hatası:", error);
                        let errorMessage = "Giriş yapılamadı.";
                        switch(error.code) {
                            case "auth/invalid-login-credentials":
                                errorMessage = "Geçersiz e-posta veya şifre.";
                                break;
                            case "auth/invalid-email":
                                errorMessage = "Geçersiz e-posta formatı.";
                                break;
                            case "auth/user-disabled":
                                errorMessage = "Bu hesap devre dışı bırakılmış.";
                                break;
                            case "auth/too-many-requests":
                                errorMessage = "Çok fazla hatalı giriş denemesi. Lütfen daha sonra tekrar deneyin.";
                                break;
                            default:
                                errorMessage = error.message;
                        }
                        messageElement.textContent = errorMessage;
                    }
                } else {
                    messageElement.textContent = 'Lütfen tüm alanları doldurun.';
                }
            });
        }

        // Signup formu
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                const messageElement = document.getElementById('signup-message');

                if (!email || !password || !confirmPassword) {
                    messageElement.textContent = 'Lütfen tüm alanları doldurun.';
                    return;
                }

                if (password !== confirmPassword) {
                    messageElement.textContent = 'Şifreler eşleşmiyor.';
                    return;
                }

                messageElement.textContent = 'Kayıt olunuyor...';
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    messageElement.textContent = "Kullanıcı başarıyla kaydedildi!";
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error("Kayıt hatası:", error);
                    let errorMessage = "Kayıt olurken bir hata oluştu.";
                    switch(error.code) {
                        case "auth/email-already-in-use":
                            errorMessage = "Bu e-posta adresi zaten kullanılıyor.";
                            break;
                        case "auth/invalid-email":
                            errorMessage = "Geçersiz e-posta formatı.";
                            break;
                        case "auth/weak-password":
                            errorMessage = "Şifre çok zayıf. Daha güçlü bir şifre seçin.";
                            break;
                        default:
                            errorMessage = error.message;
                    }
                    messageElement.textContent = errorMessage;
                }
            });
        }

        // Settings sayfası event listener'ları
        if (window.location.pathname.endsWith('settings.html')) {
            const themeSelect = document.getElementById('theme-select');
            const saveButton = document.getElementById('save-settings');
            const backButton = document.getElementById('back-to-home');
            const settingsMessage = document.getElementById('settings-message');

            // Kaydedilmiş temayı yükle
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme) {
                themeSelect.value = savedTheme;
            } else {
                themeSelect.value = 'default'; // Varsayılan değer
            }

            const applyTheme = (theme) => {
                document.body.className = '';
                document.body.classList.add(theme);
                const currentChapter = parseInt(localStorage.getItem('currentChapter')) || 1;
                document.body.classList.add(`chapter-${currentChapter}`);
            };

            const showSettingsMessage = (message, type = 'success') => {
                settingsMessage.textContent = message;
                settingsMessage.classList.remove('error', 'success');
                settingsMessage.classList.add(type);
                settingsMessage.classList.add('show');
                setTimeout(() => {
                    settingsMessage.classList.remove('show');
                }, 3000);
            };

            saveButton.addEventListener('click', () => {
                const theme = themeSelect.value;
                localStorage.setItem("theme", theme);
                applyTheme(theme);
                showSettingsMessage("Ayarlar başarıyla kaydedildi!", 'success');
            });

            backButton.addEventListener('click', () => {
                window.location.href = "index.html";
            });

            themeSelect.addEventListener('change', () => {
                applyTheme(themeSelect.value);
            });
        }
    }
}

// DOM tamamen yüklendiğinde GoalTracker sınıfından bir örnek oluştur.
// Bu, uygulamanızın başlamasını sağlar.
document.addEventListener('DOMContentLoaded', () => {
    new GoalTracker();
});
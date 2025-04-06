const form = document.getElementById('goal-form');
const input = document.getElementById('goal-input');
const list = document.getElementById('goal-list');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const goalText = input.value.trim();

  if (goalText !== '') {
    const li = document.createElement('li');
    li.textContent = goalText;

    // Tamamlandı butonu
    li.addEventListener('click', () => {
      li.classList.toggle('completed');
    });

    // Sil butonu
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Sil';
    deleteBtn.addEventListener('click', () => {
      list.removeChild(li);
    });

    li.appendChild(deleteBtn);
    list.appendChild(li);

    input.value = '';
  }
});

// admin.js - handles admin login and catalog editing (popup)

const adminBtn = document.getElementById('adminBtn');
const loginModal = document.getElementById('loginModal');
const editModal = document.getElementById('editModal');
const closeLogin = document.getElementById('closeLogin');
const closeEdit = document.getElementById('closeEdit');
const loginForm = document.getElementById('loginForm');
const editContainer = document.getElementById('editContainer');
const saveBtn = document.getElementById('saveChanges');

const ADMIN_USER = 'villaab';
const ADMIN_PASS = 'villaab123';

let catalogData = [];

function openModal(modal) {
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal(modal) {
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

adminBtn.addEventListener('click', () => openModal(loginModal));
closeLogin.addEventListener('click', () => closeModal(loginModal));
closeEdit.addEventListener('click', () => closeModal(editModal));
window.addEventListener('click', (e) => {
  if (e.target === loginModal) closeModal(loginModal);
  if (e.target === editModal) closeModal(editModal);
});

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const user = e.target.username.value.trim();
  const pass = e.target.password.value.trim();
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    // Load current data from localStorage (or fallback to API)
    const stored = localStorage.getItem('villaCatalog');
    if (stored) {
      catalogData = JSON.parse(stored);
      renderEditForms();
    } else {
      // fetch from API then render
      fetch('/api/catalog')
        .then((res) => res.json())
        .then((data) => {
          catalogData = data;
          renderEditForms();
        })
        .catch((err) => console.error('Failed to load catalog:', err));
    }
    closeModal(loginModal);
    openModal(editModal);
  } else {
    alert('Username atau password salah');
  }
});

function renderEditForms() {
  editContainer.innerHTML = '';
  catalogData.forEach((item, index) => {
    const form = document.createElement('form');
    form.className = 'edit-item';
    form.dataset.index = index;
    form.innerHTML = `
      <h3>Ubah "${item.name}"</h3>
      <label>Nama Kamar:</label>
      <input type="text" name="name" value="${item.name}" required />
      <label>URL Foto:</label>
      <input type="text" name="photo" value="${item.photo}" required />
      <label>Fasilitas:</label>
      <input type="text" name="facilities" value="${item.facilities}" required />
      <label>Jam (contoh 1-6):</label>
      <input type="text" name="hours" value="${item.hours}" required />
      <label>Harga (Rp):</label>
      <input type="number" name="price" value="${item.price}" min="0" required />
      <hr/>
    `;
    editContainer.appendChild(form);
  });
}

saveBtn.addEventListener('click', () => {
  const forms = editContainer.querySelectorAll('.edit-item');
  const newData = [];
  forms.forEach((f) => {
    const idx = f.dataset.index;
    const formData = new FormData(f);
    newData.push({
      name: formData.get('name'),
      photo: formData.get('photo'),
      facilities: formData.get('facilities'),
      hours: formData.get('hours'),
      price: Number(formData.get('price')),
    });
  });
  catalogData = newData;
  // Persist to localStorage
  localStorage.setItem('villaCatalog', JSON.stringify(catalogData));
  // Optionally send to server (POST) – Vercel function will accept but not store permanently.
  fetch('/api/catalog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(catalogData),
  }).catch(() => {});

  // Refresh main page cards (if open)
  if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
    // Trigger a reload to fetch updated data from localStorage
    location.reload();
  }
  alert('Data katalog berhasil disimpan.');
  closeModal(editModal);
});

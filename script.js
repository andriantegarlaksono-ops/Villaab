// script.js - fetch catalog data and render cards

const catalogContainer = document.getElementById('catalog');
const API_URL = '/api/catalog';

/**
 * Render a single room card
 */
function createCard(item) {
  const card = document.createElement('div');
  card.className = 'card';

  const img = document.createElement('img');
  img.src = item.photo || 'assets/default.jpg';
  img.alt = item.name;
  card.appendChild(img);

  const body = document.createElement('div');
  body.className = 'card-body';

  const title = document.createElement('h3');
  title.textContent = item.name;
  body.appendChild(title);

  const desc = document.createElement('p');
  desc.textContent = item.facilities;
  body.appendChild(desc);

  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = `${item.hours} jam — harga Rp${item.price.toLocaleString()}`;
  body.appendChild(price);

  const btn = document.createElement('a');
  btn.className = 'btn';
  btn.href = `https://wa.me/6285536581733?text=${encodeURIComponent('Saya ingin memesan ' + item.name)}`;
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.textContent = 'Hubungi / Booking';
  body.appendChild(btn);

  card.appendChild(body);
  return card;
}

/**
 * Load data either from localStorage (if admin edited) or from API.
 */
function loadCatalog() {
  const stored = localStorage.getItem('villaCatalog');
  if (stored) {
    const data = JSON.parse(stored);
    renderCatalog(data);
  } else {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        renderCatalog(data);
        // seed localStorage for future admin edits
        localStorage.setItem('villaCatalog', JSON.stringify(data));
      })
      .catch((err) => console.error('Error loading catalog:', err));
  }
}

function renderCatalog(data) {
  catalogContainer.innerHTML = '';
  data.forEach((item) => {
    catalogContainer.appendChild(createCard(item));
  });
}

// Initial load
loadCatalog();

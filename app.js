import { getProducts, getCategories } from './api.js';

const $ = (id) => document.getElementById(id);
const state = { products: [], category: 'all', query: '', sort: '' };

// ---- localStorage cart ----
const loadCart = () => {
  try { return JSON.parse(localStorage.getItem('cart')) || []; }
  catch { return []; }
};
let cart = loadCart();
const saveCart = () => {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
};

// ---- UI helpers ----
function showError(msg) {
  const el = $('error');
  el.hidden = !msg;
  el.innerHTML = msg ? `${msg} <button id="retry">Retry</button>` : '';
  if (msg) $('retry').onclick = init;
}

function showSkeletons() {
  $('grid').innerHTML = '<div class="skeleton"></div>'.repeat(6);
}

function renderTabs(categories) {
  $('tabs').innerHTML = ['all', ...categories]
    .map(c => `<button data-c="${c}" class="${c === state.category ? 'active' : ''}">${c}</button>`)
    .join('');
}

function renderProducts() {
  let list = state.products.filter(p =>
    (state.category === 'all' || p.category === state.category) &&
    p.title.toLowerCase().includes(state.query.toLowerCase()));

  if (state.sort === 'asc') list.sort((a, b) => a.price - b.price);
  if (state.sort === 'desc') list.sort((a, b) => b.price - a.price);
  if (state.sort === 'name') list.sort((a, b) => a.title.localeCompare(b.title));

  $('grid').innerHTML = list.length
    ? list.map(p => `
      <div class="card">
        <img src="${p.image}" alt="${p.title}" loading="lazy">
        <h3>${p.title}</h3>
        <strong>$${p.price.toFixed(2)}</strong>
        <button data-add="${p.id}">Add to cart</button>
      </div>`).join('')
    : '<p>No products found.</p>';
}

function renderCart() {
  $('cartCount').textContent = cart.reduce((n, i) => n + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  $('cart').innerHTML = cart.length
    ? `<ul>${cart.map(i => `<li><span>${i.title.slice(0, 28)} x${i.qty}</span>
        <button data-rm="${i.id}">Remove</button></li>`).join('')}</ul>
       <strong>Total: $${total.toFixed(2)}</strong>`
    : '<p>Your cart is empty.</p>';
}

// ---- events ----
$('search').addEventListener('input', e => { state.query = e.target.value; renderProducts(); });
$('sort').addEventListener('change', e => { state.sort = e.target.value; renderProducts(); });
$('tabs').addEventListener('click', e => {
  if (!e.target.dataset.c) return;
  state.category = e.target.dataset.c;
  document.querySelectorAll('#tabs button').forEach(b =>
    b.classList.toggle('active', b.dataset.c === state.category));
  renderProducts();
});
$('grid').addEventListener('click', e => {
  const id = Number(e.target.dataset.add);
  if (!id) return;
  const item = cart.find(i => i.id === id);
  if (item) item.qty++;
  else {
    const p = state.products.find(p => p.id === id);
    cart.push({ id, title: p.title, price: p.price, qty: 1 });
  }
  saveCart();
});
$('cart').addEventListener('click', e => {
  const id = Number(e.target.dataset.rm);
  if (!id) return;
  cart = cart.filter(i => i.id !== id);
  saveCart();
});
$('cartBtn').addEventListener('click', () => { $('cart').hidden = !$('cart').hidden; });

// ---- init ----
async function init() {
  showError('');
  showSkeletons();
  try {
    const [products, categories] = await Promise.all([getProducts(), getCategories()]);
    state.products = products;
    renderTabs(categories);
    renderProducts();
  } catch (err) {
    $('grid').innerHTML = '';
    showError(`Could not load products. ${err.message}`);
  }
}

renderCart();
init();

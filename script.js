const PRODUCTS = [
  {id:'w_d1', title:'Crimson Cutout Dress', price: 32000, category:'dress', collection:'women', discount:false, img:'images/crimson1.jpg', badge:'NEW'},
  {id:'w_d2', title:'Emerald Slip Dress', price: 28000, category:'dress', collection:'women', discount:true, img:'images/emerald.jpg', badge:'SALE'},
  {id:'w_t1', title:'Neon Mesh Top', price: 14500, category:'top', collection:'women', discount:false, img:'images/neon.jpg', badge:'HOT'},
  {id:'m_t1', title:'Boxy Graphic Tee', price: 12000, category:'top', collection:'men', discount:false, img:'images/boxy.jpg'},
  {id:'m_s1', title:'Ready-Made Senators', price: 36000, category:'outfit', collection:'men', discount:false, img:'images/senator.jpg'},
  {id:'u_b1', title:'Mini Crossbody Bag', price: 19000, category:'bag', collection:'men', discount:true, img:'images/crossbody-bag.jpg', badge:'SALE'},
  {id:'m_b1', title:'Agbada(Classic)', price: 16000, category:'outfit', collection:'men', discount:false, img:'images/agbada.jpg'},
  {id:'w_s2', title:'Chunky Heel Boots', price: 42000, category:'shoe', collection:'women', discount:true, img:'https://images.unsplash.com/photo-1549570652-97324981a6fd?q=80&w=800&auto=format&fit=crop', badge:'SALE'},
  {id:'m_t2', title:'Zip Hoodie', price: 24000, category:'top', collection:'men', discount:false, img:'images/zippedhoodie.jpg'},
  {id:'w_t2', title:'Cropped Cardigan', price: 21000, category:'top', collection:'women', discount:false, img:'images/croppedc.jpg'}
];

const $  = (s, r=document)=> r.querySelector(s);
const $$ = (s, r=document)=> Array.from(r.querySelectorAll(s));
const fmt = n => new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);

let cart = JSON.parse(localStorage.getItem('fms_cart') || '{}');

const grid = $('#productGrid');
const categoryFilter = $('#categoryFilter');
const sortBy = $('#sortBy');
const searchInput = $('#searchInput');
const loadMoreBtn = $('#loadMore');
const cartBtn = $('#cartBtn');
const cartDrawer = $('#cartDrawer');
const closeCart = $('#closeCart');
const cartItems = $('#cartItems');
const cartSubtotal = $('#cartSubtotal');
const checkoutBtn = $('#checkoutBtn');
const menuToggle = $('#menuToggle');
const mobileMenu = $('#mobileMenu');
const desktopMenu = $('#desktopMenu');
const year = $('#year'); if (year) year.textContent = new Date().getFullYear();

const initialCollection = document.body.getAttribute('data-collection') || 'all';

let visible = 8;
function renderProducts(){
  if(!grid) return;
  grid.innerHTML = '';
  const term = (searchInput?.value || '').trim().toLowerCase();
  const cat = categoryFilter ? categoryFilter.value : 'all';

  let items = PRODUCTS.filter(p =>
    (initialCollection === 'all' || (initialCollection === 'sale' ? p.discount : p.collection === initialCollection)) &&
    (cat === 'all' || p.category === cat) &&
    (!term || p.title.toLowerCase().includes(term))
  );

  if (sortBy?.value === 'price-asc') items.sort((a,b)=>a.price-b.price);
  if (sortBy?.value === 'price-desc') items.sort((a,b)=>b.price-a.price);

  items.slice(0, visible).forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role','listitem');
    card.innerHTML = `
      <div class="card-media">
        <img src="${p.img}" alt="${p.title}">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-title">${p.title}</h3>
        <div class="card-meta">
          <span class="price">${fmt(p.price)}</span>
          <span class="muted">${p.category}</span>
        </div>
      </div>
      <div class="card-actions">
        <div class="qty" aria-label="Quantity selector">
          <button type="button" aria-label="Decrease quantity" data-dec>-</button>
          <button type="button" disabled>1</button>
          <button type="button" aria-label="Increase quantity" data-inc>+</button>
        </div>
        <button class="add-btn" data-add data-id="${p.id}">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
  });

  if(loadMoreBtn) loadMoreBtn.style.display = items.length > visible ? 'inline-flex' : 'none';
}

function cartCount(){ const c = Object.values(cart).reduce((a,b)=>a+b,0); cartBtn?.setAttribute('data-cart-count', c); }
function cartTotal(){ return Object.entries(cart).reduce((t,[id,qty])=>{ const p = PRODUCTS.find(x=>x.id===id); return t + (p? p.price*qty : 0); },0); }
function renderCart(){
  if (!cartItems) return;
  cartItems.innerHTML = '';
  for(const [id, qty] of Object.entries(cart)){
    const p = PRODUCTS.find(x=>x.id===id); if(!p) continue;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div>
        <div class="title">${p.title}</div>
        <div class="muted">${fmt(p.price)} • ${p.category}</div>
        <div class="qty" style="grid-template-columns:repeat(4,2rem);margin-top:.35rem">
          <button data-cart-dec="${id}">-</button>
          <button disabled>${qty}</button>
          <button data-cart-inc="${id}">+</button>
          <button title="Remove" data-cart-rem="${id}">×</button>
        </div>
      </div>
      <div class="line">${fmt(p.price*qty)}</div>
    `;
    cartItems.appendChild(el);
  }
  cartSubtotal && (cartSubtotal.textContent = fmt(cartTotal()));
  cartCount();
  localStorage.setItem('fms_cart', JSON.stringify(cart));
}

document.addEventListener('click', (e)=>{
  if (e.target.matches('[data-inc]')) {
    const display = e.target.previousElementSibling;
    display.textContent = String(parseInt(display.textContent,10)+1);
  }
  if (e.target.matches('[data-dec]')) {
    const display = e.target.nextElementSibling;
    display.textContent = String(Math.max(1, parseInt(display.textContent,10)-1));
  }
  if (e.target.matches('[data-add]')) {
    const id = e.target.getAttribute('data-id');
    const qtyBtn = e.target.previousElementSibling.querySelector('button[disabled]');
    const qty = parseInt(qtyBtn.textContent,10) || 1;
    cart[id] = (cart[id]||0) + qty;
    renderCart();
    openCart();
  }

  if (e.target.hasAttribute('data-cart-inc')){
    const id = e.target.getAttribute('data-cart-inc');
    cart[id] = (cart[id]||1)+1; renderCart();
  }
  if (e.target.hasAttribute('data-cart-dec')){
    const id = e.target.getAttribute('data-cart-dec');
    cart[id] = Math.max(1,(cart[id]||1)-1); renderCart();
  }
  if (e.target.hasAttribute('data-cart-rem')){
    const id = e.target.getAttribute('data-cart-rem');
    delete cart[id]; renderCart();
  }

  if (e.target.closest('#cartBtn')) openCart();
  if (e.target.closest('#closeCart')) closeCartDrawer();

  if (cartDrawer?.classList.contains('open') && !e.target.closest('#cartDrawer') && !e.target.closest('#cartBtn')){
    closeCartDrawer();
  }

  if (e.target.closest('#menuToggle')){
    if (mobileMenu){
      const isOpen = !mobileMenu.hasAttribute('hidden');
      if (isOpen) { mobileMenu.setAttribute('hidden',''); menuToggle?.setAttribute('aria-expanded','false'); }
      else { mobileMenu.removeAttribute('hidden'); menuToggle?.setAttribute('aria-expanded','true'); }
    }
    if (desktopMenu){
      desktopMenu.classList.toggle('show');
    }
  }

  if (!e.target.closest('.nav') && !e.target.closest('#mobileMenu') && !e.target.closest('#menuToggle')){
    if (mobileMenu && !mobileMenu.hasAttribute('hidden')){
      mobileMenu.setAttribute('hidden',''); menuToggle?.setAttribute('aria-expanded','false');
    }
    desktopMenu?.classList.remove('show');
  }
});

[searchInput, categoryFilter, sortBy].forEach(el=>{
  el && el.addEventListener('input', ()=>{ visible = 8; renderProducts(); });
  el && el.addEventListener('change', ()=>{ visible = 8; renderProducts(); });
});
loadMoreBtn && loadMoreBtn.addEventListener('click', ()=>{ visible += 8; renderProducts(); });

function openCart(){ if(!cartDrawer) return; cartDrawer.classList.add('open'); cartDrawer.setAttribute('aria-hidden','false'); setTimeout(()=>cartItems?.focus(), 120); }
function closeCartDrawer(){ if(!cartDrawer) return; cartDrawer.classList.remove('open'); cartDrawer.setAttribute('aria-hidden','true'); }

const checkoutModal = $('#checkoutModal');
const checkoutForm = $('#checkoutForm');
if (checkoutModal && checkoutForm){
  const modalBackdrop = checkoutModal.querySelector('.modal-backdrop');
  $$('[data-close]', checkoutModal).forEach(btn=>btn.addEventListener('click', ()=> toggleModal(false)));
  modalBackdrop.addEventListener('click', ()=> toggleModal(false));
  checkoutBtn && checkoutBtn.addEventListener('click', ()=>{
    if (cartTotal() === 0){ alert('Your cart is empty.'); return; }
    toggleModal(true);
  });
  checkoutForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = new FormData(checkoutForm).get('name') || 'Customer';
    alert(`Thanks, ${name}! This was a demo order. No payment captured.`);
    cart = {}; renderCart(); toggleModal(false);
  });
  function toggleModal(show){ checkoutModal.setAttribute('aria-hidden', show ? 'false' : 'true'); }
}

const tabLogin = $('#tab-login');
const tabSignup = $('#tab-signup');
if (tabLogin && tabSignup){
  const panelLogin = $('#panel-login');
  const panelSignup = $('#panel-signup');
  const activate = (which) => {
    const loginActive = which === 'login';
    tabLogin.classList.toggle('active', loginActive);
    tabSignup.classList.toggle('active', !loginActive);
    panelLogin.hidden = !loginActive;
    panelSignup.hidden = loginActive;
    tabLogin.setAttribute('aria-selected', String(loginActive));
    tabSignup.setAttribute('aria-selected', String(!loginActive));
  };
  tabLogin.addEventListener('click', ()=>activate('login'));
  tabSignup.addEventListener('click', ()=>activate('signup'));
}

renderProducts();
renderCart();

window.addEventListener('resize', ()=>{
  if (window.innerWidth > 900){
    mobileMenu?.setAttribute('hidden','');
    menuToggle?.setAttribute('aria-expanded','false');
    desktopMenu?.classList.remove('show');
  }
});

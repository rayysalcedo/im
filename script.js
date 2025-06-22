/* ===== PRICING CONFIG ===== */
const GD = "ᘜ";
const designs = [
  { id: 'galactic',  name: 'Galactic',  price: 30, img: 'assets/galactic.png' },
  { id: 'milkyway', name: 'Milky Way', price: 40, img: 'assets/milkyway.jpg' },
  { id: 'moon',     name: 'Moon',      price: 20, img: 'assets/moon.png'      },
  { id: 'nebula',   name: 'Nebula',    price: 35, img: 'assets/nebula.jpg'    },
  { id: 'meteor',   name: 'Meteor',    price: 25, img: 'assets/meteor.jpg'    }
];
const layerPrice  = {1:10,2:18,3:25};
const flavorPrice = {Strawberry:6,Matcha:7,Chocolate:6,Vanilla:5};
const toppingUnit = 3;

/* ===== DOM HELPERS ===== */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const sec = {hero:$('#hero'), step1:$('#step1'), step2:$('#step2'), step3:$('#step3')};
const show = key => {Object.values(sec).forEach(el=>el.classList.add('hidden')); sec[key].classList.remove('hidden');};

/* ===== STATE ===== */
let cart = [];
let draft = {design:null,layers:null,flavor:null,toppings:[]};

/* ===== BUILD DESIGN CARDS ===== */
const designGrid = $('#designGrid');
designs.forEach(d=>{
  const card = document.createElement('label');
  card.className = 'card radio';
  card.innerHTML = `
    <input type="radio" name="design" value="${d.id}">
    <span class="picture"><img src="${d.img}" alt=""></span>
    <span class="text">${d.name}<br><b>${GD}${d.price}</b></span>`;
  designGrid.append(card);

  card.querySelector('input').addEventListener('change', ()=> {
    draft.design = d;
  });
});

/* ===== NAVIGATION ===== */
$('#startOrder').onclick = () => show('step1');
$('#back1').onclick      = () => show('step1');
$('#newOrder').onclick   = () => location.reload();
$('#printReceipt').onclick = () => window.print();

/* ===== ADD TO CART ===== */
$('#addToCart').onclick = () => {
  // gather selections
  draft.layers   = +$('input[name="layers"]:checked')?.value || null;
  draft.flavor   = $('input[name="flavor"]:checked')?.value || null;
  draft.toppings = Array.from($$('input[type="checkbox"]:checked')).map(c=>c.value);

  if (!draft.design || !draft.layers || !draft.flavor) {
    alert('Please complete Design, Layers and Flavor.'); return;
  }
  cart.push({...draft});
  updateCartUI();
  resetForm();
};
$('#checkout').onclick = () => show('step2');

/* ===== UPDATE CART UI ===== */
function updateCartUI(){
  const ul = $('#cartList');
  ul.innerHTML = '';
  cart.forEach((c,i)=>{
    const li = document.createElement('li');
    li.textContent = `#${i+1} ${c.design.name} • ${c.layers}-layer ${c.flavor} cake`;
    ul.append(li);
  });
  $('#checkout').disabled = cart.length === 0;
}

/* ===== RESET FORM ===== */
function resetForm(){
  $('#customForm').reset();
  draft = {design:null,layers:null,flavor:null,toppings:[]};
}

/* ===== CHECKOUT ===== */
/* FINAL single handler – replaces any earlier duplicates */
$('#infoForm').onsubmit = e => {
  e.preventDefault();
  if (!cart.length) { alert('Cart is empty'); return; }

  const info = Object.fromEntries(new FormData(e.target).entries());
  info.date = 'ETA 3–5 days';
  renderReceipt(info);

  /* store in localStorage so orders.html can read them */
  const store = JSON.parse(localStorage.getItem('orders') || '[]');
  const orderId = Date.now();                         // simple unique id
  store.push({
    id: orderId,
    customer: info.customer,
    address: info.address,
    date: info.date,
    type: info.type,
    payment: info.payment,
    owner: currentUser,
    status: 'ongoing',
    summary: `${cart.length} cake(s)`,
    total: document.querySelector('#receiptBox h3 span').textContent
  });
  localStorage.setItem('orders', JSON.stringify(store));

  show('step3');
  setTimeout(()=>$('#feedbackModal').classList.remove('hidden'), 800);
};

/* ===== RENDER RECEIPT ===== */
function renderReceipt(info){
  const box = $('#receiptBox');
  let total = 0, html = `<p><strong>Order ID:</strong> CV${Date.now().toString(36).toUpperCase()}</p><hr>`;
  cart.forEach((c,i)=>{
    const price = cakePrice(c);
    total += price;
    html += `<p><u>Cake ${i+1}</u> — ${GD}${price}</p>
             <p>Design: ${c.design.name}</p>
             <p>Layers: ${c.layers}</p>
             <p>Flavor: ${c.flavor}</p>
             <p>Toppings: ${c.toppings.join(', ')||'None'}</p><br>`;
  });
  html += `<hr>
           <p><strong>Name:</strong> ${info.customer}</p>
           <p><strong>Address:</strong> ${info.address}</p>
           <p><strong>Delivery:</strong> ${info.date} (${cap(info.type)})</p>
           <p><strong>Payment:</strong> ${cap(info.payment)}</p><hr>
           <h3>Total Due: <span style="color:var(--accent)">${GD}${total}</span></h3>`;
  box.innerHTML = html;
}
const cakePrice = c =>
  c.design.price + layerPrice[c.layers] + flavorPrice[c.flavor] + c.toppings.length * toppingUnit;
const cap = s => s[0].toUpperCase() + s.slice(1);

/* ===== FEEDBACK MODAL ===== */
const starRow = $('#starRow'); let rating = 0;
for (let i=1;i<=5;i++){
  const s = document.createElement('span');
  s.textContent = '★'; s.className = 'star';
  s.onclick = () => { rating=i; updateStars(); };
  starRow.append(s);
}
const updateStars = () => $$('.star').forEach((s,i)=>s.classList.toggle('filled', i<rating));
$('#submitFeedback').onclick = () => {
  console.log('Feedback:', {rating, text: $('#feedbackText').value.trim()});
  $('#feedbackModal').classList.add('hidden');
  alert('Thanks for the stellar feedback! 🌠');
};

/* 1️⃣ ——— AUTH GUARD ——— */
if(!sessionStorage.getItem('cv_user')){
  location.replace('login.html');                // must log in first
}
const currentUser = sessionStorage.getItem('cv_user');
const currentRole = sessionStorage.getItem('cv_role'); // 'admin' or 'customer'



/* ---------- NAV DYNAMIC ITEMS ---------- */
const loginEl  = document.getElementById('loginLink');
const ordersEl = document.getElementById('ordersLink');

/* label changes for customers */
if (ordersEl && currentRole !== 'admin') {
  ordersEl.textContent = 'My Orders';
}

/* Login  →  Logout */
if (loginEl && currentUser) {
  loginEl.textContent = 'Logout';
  loginEl.href = '#';
  loginEl.onclick = () => { sessionStorage.clear(); location.href = 'login.html'; };
}

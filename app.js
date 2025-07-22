// 3D Carousel Animation with Chef in the Center
const list = document.querySelector('.list');
const items = document.querySelectorAll('.list .item');
const chef = document.querySelector('.chef-center');
const quantity = items.length;
const radius = 550; // matches translateZ in CSS
let angle = 0;

function updateCarousel() {
  for (let i = 0; i < quantity; i++) {
    const itemAngle = (360 / quantity) * i + angle;
    const rad = itemAngle * Math.PI / 180;
    const z = Math.cos(rad) * radius;
    items[i].style.transform = `rotateY(${itemAngle}deg) translateZ(${radius}px)`;
    items[i].style.zIndex = Math.round(z);
    items[i].style.opacity = z < 0 ? 0.5 : 1;
  }
  chef.style.zIndex = radius;
}
function animate() {
  angle += 0.2;
  updateCarousel();
  requestAnimationFrame(animate);
}
if(list) {
  list.style.animation = 'none';
  animate();
}

// Dish prices (load from localStorage if available)
let dishPrices = {
  'Lassi': 50,
  'Chicken Tikka Masala': 220,
  'Chole Bhature': 120,
  'Fish Fry': 180,
  'Iddli': 60,
  'Butter Chicken': 240,
  'Medu Vadas': 70,
  'Mutton Masala': 260,
  'Bread Rasmalai': 90,
  'Dosa': 80
};
const localDishPrices = JSON.parse(localStorage.getItem('dishPrices'));
if (localDishPrices) dishPrices = localDishPrices;

// Modal Order Form Logic
const orderBtn = document.getElementById('orderBtn');
const orderModal = document.getElementById('orderModal');
const closeModal = document.getElementById('closeModal');
const orderForm = document.getElementById('orderForm');
const orderSuccess = document.getElementById('orderSuccess');
const navbarOrderLink = document.getElementById('navbarOrderLink');

// Helper: Generate unique ID
function generateOrderId() {
  return 'order-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}
// Helper: Get all orders from localStorage
function getAllOrders() {
  return JSON.parse(localStorage.getItem('allOrders') || '[]');
}
// Helper: Save all orders to localStorage
function saveAllOrders(orders) {
  localStorage.setItem('allOrders', JSON.stringify(orders));
}
// Helper: Set a message for a user
function setUserMessage(orderId, message) {
  localStorage.setItem('userMessage-' + orderId, message);
}
// Helper: Get and clear a user's message
function popUserMessage(orderId) {
  const key = 'userMessage-' + orderId;
  const msg = localStorage.getItem(key);
  if (msg) localStorage.removeItem(key);
  return msg;
}

function showOrderModalWithLastOrder() {
  orderModal.style.display = 'flex';
  orderSuccess.style.display = 'none';
  orderForm.style.display = 'flex';
  orderForm.reset();
}

if(orderBtn && orderModal && closeModal && orderForm && orderSuccess) {
  orderBtn.onclick = () => {
    showOrderModalWithLastOrder();
  };
  if(navbarOrderLink) {
    navbarOrderLink.onclick = (e) => {
      e.preventDefault();
      showOrderModalWithLastOrder();
    };
  }
  closeModal.onclick = () => {
    orderModal.style.display = 'none';
  };
  window.onclick = (event) => {
    if (event.target === orderModal) {
      orderModal.style.display = 'none';
    }
  };
  orderForm.onsubmit = (e) => {
    e.preventDefault();
    // Get form values
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const dish = document.getElementById('dish').value;
    const quantity = parseInt(document.getElementById('quantity').value, 10);
    const price = dishPrices[dish] || 0;
    const amount = price * quantity;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timestamp = Date.now();
    let allOrders = getAllOrders();
    // Always create a new order
    const orderId = generateOrderId();
    const orderObj = { orderId, name, phone, dish, quantity, amount, timeString, timestamp };
    allOrders.push(orderObj);
    saveAllOrders(allOrders);
    // Show order summary
    orderSuccess.innerHTML = `
      <h3>Order Summary</h3>
      <p><strong>Dish:</strong> ${dish}</p>
      <p><strong>Quantity:</strong> ${quantity}</p>
      <p><strong>Order Time:</strong> ${timeString}</p>
      <p><strong>Amount:</strong> ₹${amount}</p>
      <p>Thank you, <strong>${name}</strong>! We will contact you soon.</p>
    `;
    orderForm.style.display = 'none';
    orderSuccess.style.display = 'block';
    setTimeout(() => {
      orderModal.style.display = 'none';
    }, 4000);
    orderForm.reset();
  };
}

// Dish price display logic
const dishSelect = document.getElementById('dish');
const dishPriceDisplay = document.getElementById('dishPriceDisplay');

function updateDishPriceDisplay() {
  const selectedDish = dishSelect.value;
  if (selectedDish && dishPrices[selectedDish]) {
    dishPriceDisplay.textContent = `Price: ₹${dishPrices[selectedDish]}`;
  } else {
    dishPriceDisplay.textContent = '';
  }
}
if (dishSelect && dishPriceDisplay) {
  dishSelect.addEventListener('change', updateDishPriceDisplay);
  // Also update on form open
  updateDishPriceDisplay();
}

// Update menu prices in the menu section
document.querySelectorAll('.menu-price').forEach(span => {
  const dish = span.getAttribute('data-dish');
  if (dish && dishPrices[dish]) {
    span.textContent = `₹${dishPrices[dish]}`;
  } else {
    span.textContent = '';
  }
});

// Set Prices Modal logic
const setPricesBtn = document.getElementById('setPricesBtn');
const setPricesModal = document.getElementById('setPricesModal');
const closeSetPricesModal = document.getElementById('closeSetPricesModal');
const setPricesForm = document.getElementById('setPricesForm');
const savePricesBtn = document.getElementById('savePricesBtn');

function renderSetPricesForm() {
  setPricesForm.innerHTML = Object.keys(dishPrices).map(dish => `
    <label>${dish}
      <input type="number" min="1" value="${dishPrices[dish]}" name="${dish}" />
    </label>
  `).join('');
}
if(setPricesBtn && setPricesModal && closeSetPricesModal && setPricesForm && savePricesBtn) {
  setPricesBtn.onclick = () => {
    renderSetPricesForm();
    setPricesModal.style.display = 'flex';
  };
  closeSetPricesModal.onclick = () => {
    setPricesModal.style.display = 'none';
  };
  savePricesBtn.onclick = (e) => {
    e.preventDefault();
    const formData = new FormData(setPricesForm);
    for (const [dish, price] of formData.entries()) {
      dishPrices[dish] = parseInt(price, 10) || 1;
    }
    localStorage.setItem('dishPrices', JSON.stringify(dishPrices));
    setPricesModal.style.display = 'none';
    // Update price display if order modal is open
    if (typeof updateDishPriceDisplay === 'function') updateDishPriceDisplay();
  };
  window.onclick = (event) => {
    if (event.target === setPricesModal) {
      setPricesModal.style.display = 'none';
    }
  };
}

// Admin view logic
const adminLink = document.getElementById('adminLink');
const adminModal = document.getElementById('adminModal');
const closeAdminModal = document.getElementById('closeAdminModal');
const allOrdersList = document.getElementById('allOrdersList');

const ADMIN_PASSWORD = 'admin123'; // Change this password as needed

if(adminLink && adminModal && closeAdminModal && allOrdersList) {
  adminLink.onclick = (e) => {
    e.preventDefault();
    const pwd = prompt('Enter admin password:');
    if (pwd !== ADMIN_PASSWORD) {
      alert('Incorrect password!');
      return;
    }
    const allOrders = getAllOrders();
    if (allOrders.length === 0) {
      allOrdersList.innerHTML = '<p>No orders yet.</p>';
    } else {
      allOrdersList.innerHTML = allOrders.map(order => `
        <div class="order-entry" data-orderid="${order.orderId}">
          <strong>${order.name}</strong> (${order.phone})<br>
          <b>Dish:</b> ${order.dish} | <b>Qty:</b> ${order.quantity} | <b>Amount:</b> ₹${order.amount}<br>
          <b>Time:</b> ${order.timeString}<br>
          <button class="send-msg-btn" data-orderid="${order.orderId}">Send Message</button>
        </div>
      `).join('');
      // Add event listeners for send message buttons
      allOrdersList.querySelectorAll('.send-msg-btn').forEach(btn => {
        btn.onclick = function() {
          const orderId = this.getAttribute('data-orderid');
          const msg = prompt('Enter message to send to this user:');
          if (msg && msg.trim()) {
            setUserMessage(orderId, msg.trim());
            // Remove order from all orders
            let orders = getAllOrders();
            orders = orders.filter(o => o.orderId !== orderId);
            saveAllOrders(orders);
            // Refresh admin view
            adminLink.click();
          }
        };
      });
    }
    adminModal.style.display = 'flex';
  };
  closeAdminModal.onclick = () => {
    adminModal.style.display = 'none';
  };
  window.onclick = (event) => {
    if (event.target === adminModal) {
      adminModal.style.display = 'none';
    }
  };
}

// Cart view logic
const cartLink = document.getElementById('cartLink');
const cartModal = document.getElementById('cartModal');
const closeCartModal = document.getElementById('closeCartModal');
const cartOrdersList = document.getElementById('cartOrdersList');

if(cartLink && cartModal && closeCartModal && cartOrdersList) {
  cartLink.onclick = (e) => {
    e.preventDefault();
    const allOrders = getAllOrders();
    if (allOrders.length === 0) {
      cartOrdersList.innerHTML = '<p>No current orders.</p>';
    } else {
      cartOrdersList.innerHTML = allOrders.map(order => `
        <div class="order-entry">
          <strong>${order.name}</strong><br>
          <b>Amount:</b> ₹${order.amount} | <b>Time:</b> ${order.timeString}
        </div>
      `).join('');
    }
    cartModal.style.display = 'flex';
  };
  closeCartModal.onclick = () => {
    cartModal.style.display = 'none';
  };
  window.onclick = (event) => {
    if (event.target === cartModal) {
      cartModal.style.display = 'none';
    }
  };
} 
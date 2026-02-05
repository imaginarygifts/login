import { db, auth } from "./firebase.js";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const listEl = document.getElementById("ordersList");

/* ================= RENDER ================= */
function renderOrders(orders) {
  listEl.innerHTML = "";

  if (!orders.length) {
    listEl.innerHTML = `<div class="empty">No orders found</div>`;
    return;
  }

  orders.forEach(o => {
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <div class="row">
        <img src="${o.productImage || 'img/no-image.png'}">
        <div>
          <div><strong>${o.productName}</strong></div>
          <div class="muted">${o.orderNumber}</div>
        </div>
      </div>

      <div class="price">₹${o.pricing?.finalAmount || 0}</div>
      <div class="status">Status: ${o.orderStatus}</div>
      <div class="muted">
        Payment: ${o.payment?.mode} (${o.payment?.status})
      </div>
    `;

    listEl.appendChild(card);
  });
}

/* ================= LOAD ORDERS ================= */
async function loadOrders(uid) {
  try {
    const q = query(
      collection(db, "orders"),
      where("customerId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    renderOrders(orders);
  } catch (err) {
    console.error("ORDER LOAD ERROR:", err);
    listEl.innerHTML = `<div class="empty">Failed to load orders</div>`;
  }
}

/* ================= AUTH SAFE ================= */
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  loadOrders(user.uid);
});
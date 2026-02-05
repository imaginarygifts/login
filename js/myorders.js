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

/* ================= UI ================= */
function renderOrders(orders) {
  listEl.innerHTML = "";

  if (!orders.length) {
    listEl.innerHTML = `<p class="muted">No orders found</p>`;
    return;
  }

  orders.forEach(o => {
    const div = document.createElement("div");
    div.className = "order-card";

    div.innerHTML = `
      <div><strong>${o.productName}</strong></div>
      <div class="muted">Order: ${o.orderNumber}</div>
      <div>Status: ${o.orderStatus}</div>
      <div>₹${o.pricing?.finalAmount || 0}</div>
    `;

    listEl.appendChild(div);
  });
}

/* ================= LOAD ================= */
async function loadOrders(uid) {
  const q = query(
    collection(db, "orders"),
    where("customerId", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderOrders(orders);
}

/* ================= AUTH ================= */
onAuthStateChanged(auth, user => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  loadOrders(user.uid);
});
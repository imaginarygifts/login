import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();
const listEl = document.getElementById("ordersList");

/* ================= RENDER ================= */
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
      <div class="order-top">
        <strong>${o.productName}</strong>
        <span class="status ${o.orderStatus}">
          ${o.orderStatus}
        </span>
      </div>

      <div class="muted">
        Order: ${o.orderNumber}
      </div>

      <div class="price">
        ₹${o.pricing?.finalAmount || 0}
      </div>
    `;

    div.onclick = () =>
      location.href = `order-view.html?id=${o.id}`;

    listEl.appendChild(div);
  });
}

/* ================= LOAD ORDERS ================= */
async function loadOrders(user) {
  const q = query(
    collection(db, "orders"),
    where("customerId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  const orders = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  renderOrders(orders);
}

/* ================= AUTH GUARD ================= */
onAuthStateChanged(auth, user => {
  if (!user) {
    // not logged in
    location.href = "login.html";
    return;
  }

  loadOrders(user);
});
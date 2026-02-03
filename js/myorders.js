import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();
const list = document.getElementById("ordersList");

/* ================= AUTH GUARD ================= */
auth.onAuthStateChanged(user => {
  if (!user) {
    localStorage.setItem("redirectAfterLogin", location.href);
    location.href = "login.html";
    return;
  }
  loadOrders(user.uid);
});

/* ================= LOAD ORDERS ================= */
async function loadOrders(uid) {
  const q = query(
    collection(db, "orders"),
    where("customerId", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    list.innerHTML = `<div class="empty">No orders yet</div>`;
    return;
  }

  snap.forEach(doc => {
    const o = doc.data();

    const div = document.createElement("div");
    div.className = "order-card";
    div.onclick = () =>
      location.href = `order-view.html?id=${doc.id}`;

    div.innerHTML = `
      <div class="order-top">
        <span>#${o.orderNumber || "—"}</span>
        <span>${formatDate(o.createdAt)}</span>
      </div>

      <div class="order-product">
        ${o.productName || "Product"}
      </div>

      <div class="order-meta">
        <span>₹${o.pricing?.finalAmount || 0}</span>
        <span class="status ${o.orderStatus}">
          ${o.orderStatus}
        </span>
      </div>
    `;

    list.appendChild(div);
  });
}

/* ================= HELPERS ================= */
function formatDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const auth = getAuth();
const ordersList = document.getElementById("ordersList");

/* ================= AUTH CHECK ================= */
onAuthStateChanged(auth, user => {
  if (!user) {
    localStorage.setItem("redirectAfterLogin", location.href);
    location.href = "login.html";
    return;
  }

  loadMyOrders(user.uid);
});

/* ================= LOAD MY ORDERS ================= */
async function loadMyOrders(uid) {
  ordersList.innerHTML = "<p>Loading orders...</p>";

  const q = query(
    collection(db, "orders"),
    where("customerId", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  ordersList.innerHTML = "";

  if (snap.empty) {
    ordersList.innerHTML =
      `<p style="opacity:.6;text-align:center">No orders found</p>`;
    return;
  }

  snap.forEach(doc => {
    const o = doc.data();

    const div = document.createElement("div");
    div.className = "order-card";

    div.onclick = () =>
      location.href = `order-view.html?id=${doc.id}`;

    div.innerHTML = `
      <div><b>${o.orderNumber}</b></div>
      <div>${o.productName}</div>
      <div>₹${o.pricing?.finalAmount || 0}</div>
      <div>Status: ${o.orderStatus}</div>
    `;

    ordersList.appendChild(div);
  });
}
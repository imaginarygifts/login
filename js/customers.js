import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const table = document.getElementById("customerTable");

/* ================= LOAD CUSTOMERS ================= */
async function loadCustomers() {
  const snap = await getDocs(collection(db, "customers"));
  table.innerHTML = "";

  for (const doc of snap.docs) {
    const c = doc.data();
    const phone = c.phone;

    const ordersCount = await getOrderCount(phone);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${phone}</td>
      <td class="muted">${formatDate(c.firstLoginAt)}</td>
      <td class="muted">${formatDate(c.lastLoginAt)}</td>
      <td>${ordersCount}</td>
      <td>
        <button class="btn" onclick="viewOrders('${phone}')">
          View Orders
        </button>
      </td>
    `;

    table.appendChild(tr);
  }
}

/* ================= COUNT ORDERS ================= */
async function getOrderCount(phone) {
  const q = query(
    collection(db, "orders"),
    where("customer.phone", "==", phone)
  );
  const snap = await getDocs(q);
  return snap.size;
}

/* ================= HELPERS ================= */
function formatDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

/* ================= NAV ================= */
window.viewOrders = function (phone) {
  location.href = `orders.html?customer=${encodeURIComponent(phone)}`;
};

/* INIT */
loadCustomers();
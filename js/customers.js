import { db } from "../js/firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const table = document.getElementById("customerTable");

async function loadCustomers() {
  const snap = await getDocs(collection(db, "orders"));
  table.innerHTML = "";

  const map = new Map();

  snap.forEach(doc => {
    const o = doc.data();

    const phone =
      o.customerPhone ||
      o.customer?.phone ||
      null;

    if (!phone) return;

    if (!map.has(phone)) {
      map.set(phone, {
        phone,
        first: o.createdAt,
        last: o.createdAt,
        count: 1
      });
    } else {
      const c = map.get(phone);
      c.count++;
      if (o.createdAt < c.first) c.first = o.createdAt;
      if (o.createdAt > c.last) c.last = o.createdAt;
    }
  });

  if (!map.size) {
    table.innerHTML = `
      <tr>
        <td colspan="5" class="muted">No customers found</td>
      </tr>
    `;
    return;
  }

  [...map.values()]
    .sort((a, b) => b.last - a.last)
    .forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.phone}</td>
        <td class="muted">${formatDate(c.first)}</td>
        <td class="muted">${formatDate(c.last)}</td>
        <td>${c.count}</td>
        <td>
          <button class="btn"
            onclick="location.href='orders.html?customer=${encodeURIComponent(c.phone)}'">
            View Orders
          </button>
        </td>
      `;
      table.appendChild(tr);
    });
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

loadCustomers();
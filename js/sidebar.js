import { db } from "./firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= DOM ================= */
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");
const sidebarUser = document.getElementById("sidebarUser");
const authBtn = document.getElementById("authBtn");
const sidebarAuthBtn = document.getElementById("sidebarAuthBtn");
const categoryList = document.getElementById("categoryList");

/* ================= TOGGLE SIDEBAR ================= */
window.toggleSidebar = () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
};

overlay?.addEventListener("click", () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
});

/* ================= AUTH UI ================= */
function syncAuthUI() {
  const uid = localStorage.getItem("customerUid");
  const phone = localStorage.getItem("customerPhone");

  if (uid) {
    sidebarUser.innerText = phone || "User";
    authBtn.innerText = "Logout";
    sidebarAuthBtn.innerText = "Logout";
  } else {
    sidebarUser.innerText = "User";
    authBtn.innerText = "Login";
    sidebarAuthBtn.innerText = "Login";
  }
}
syncAuthUI();

/* ================= AUTH HANDLER ================= */
window.handleAuth = () => {
  const uid = localStorage.getItem("customerUid");

  if (uid) {
    localStorage.removeItem("customerUid");
    localStorage.removeItem("customerPhone");
    location.reload(); // stay on same page
  } else {
    localStorage.setItem("redirectAfterLogin", location.href);
    location.href = "login.html";
  }
};

/* ================= NAVIGATION ================= */
window.goShop = () => {
  toggleSidebar();
  location.href = "index.html";
};

window.goCart = () => {
  toggleSidebar();
  location.href = "cart.html";
};

window.goWishlist = () => {
  toggleSidebar();
  location.href = "wishlist.html";
};

window.goMyOrders = () => {
  toggleSidebar();
  location.href = "my-orders.html";
};

window.goAddresses = () => {
  toggleSidebar();
  location.href = "addresses.html";
};

/* ================= BESTSELLER ================= */
window.goBestSeller = () => {
  if (typeof window.filterBestSeller === "function") {
    window.filterBestSeller();
  }
  toggleSidebar(); // ✅ CLOSE SIDEBAR
};

/* ================= CATEGORIES ================= */
async function loadCategories() {
  const snap = await getDocs(collection(db, "categories"));
  categoryList.innerHTML = "";

  snap.forEach(catDoc => {
    const li = document.createElement("li");
    li.innerText = catDoc.data().name;

    li.onclick = () => {
      // 🔒 Close sidebar first
      toggleSidebar();

      // 🔥 Try to click existing category pill from store.js
      const pill = document.querySelector(
        `.category-pill[data-id="${catDoc.id}"]`
      );

      if (pill) {
        pill.click(); // ✅ BEST CASE (uses existing logic)
      } 
      else {
        // ⚠️ Fallback: pills not rendered yet
        window.activeCategory = catDoc.id;

        if (typeof window.renderProducts === "function") {
          window.renderProducts();
        }
      }
    };

    categoryList.appendChild(li);
  });
}

/* ================= CATEGORY ACCORDION ================= */
const accordion = document.querySelector(".accordion");
if (accordion) {
  accordion.addEventListener("click", e => {
    e.stopPropagation();
    accordion.classList.toggle("open");
  });
}
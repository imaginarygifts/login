import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const sidebarUser = document.getElementById("sidebarUser");
const loginLogoutBtn = document.getElementById("loginLogoutBtn");
const catBox = document.getElementById("sidebarCategories");

/* ================= TOGGLE ================= */
window.toggleSidebar = function () {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
};

/* ================= AUTH UI ================= */
const uid = localStorage.getItem("customerUid");
const phone = localStorage.getItem("customerPhone");

if (uid) {
  sidebarUser.innerText = phone || "Customer";
  loginLogoutBtn.innerText = "Logout";
} else {
  sidebarUser.innerText = "User";
  loginLogoutBtn.innerText = "Login";
}

window.handleAuth = function () {
  if (uid) {
    localStorage.clear();
    location.reload();
  } else {
    localStorage.setItem("redirectAfterLogin", location.href);
    location.href = "login.html";
  }
};

/* ================= NAV ACTIONS ================= */
window.goShop = () => location.href = "index.html";
window.goCart = () => location.href = "cart.html";
window.goWishlist = () => location.href = "wishlist.html";
window.goMyOrders = () => location.href = "my-orders.html";
window.goAddresses = () => location.href = "addresses.html";

window.filterBestSeller = () => {
  toggleSidebar();
  document.querySelector('[data-tag="bestseller"]')?.click();
};

/* ================= LOAD CATEGORIES ================= */
async function loadSidebarCategories() {
  const snap = await getDocs(collection(db, "categories"));
  snap.forEach(doc => {
    const li = document.createElement("li");
    li.innerText = doc.data().name;
    li.onclick = () => {
      toggleSidebar();
      document.querySelector(`[data-category="${doc.id}"]`)?.click();
    };
    catBox.appendChild(li);
  });
}

loadSidebarCategories();
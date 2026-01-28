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


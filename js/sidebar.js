import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");
const sidebarUser = document.getElementById("sidebarUser");
const authBtn = document.getElementById("authBtn");
const sidebarAuthBtn = document.getElementById("sidebarAuthBtn");
const categoryList = document.getElementById("categoryList");

/* ===== TOGGLE ===== */
window.toggleSidebar = () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
};

/* ===== AUTH UI ===== */
const uid = localStorage.getItem("customerUid");
const phone = localStorage.getItem("customerPhone");

if (uid) {
  sidebarUser.innerText = phone;
  authBtn.innerText = "Logout";
  sidebarAuthBtn.innerText = "Logout";
} else {
  sidebarUser.innerText = "User";
  authBtn.innerText = "Login";
  sidebarAuthBtn.innerText = "Login";
}

window.handleAuth = () => {
  if (uid) {
    localStorage.clear();
    location.reload();
  } else {
    localStorage.setItem("redirectAfterLogin", location.href);
    location.href = "login.html";
  }
};

/* ===== NAV ===== */
window.goShop = () => location.href = "index.html";
window.goCart = () => location.href = "cart.html";
window.goWishlist = () => location.href = "wishlist.html";
window.goMyOrders = () => location.href = "my-orders.html";
window.goAddresses = () => location.href = "addresses.html";

/* ===== CATEGORIES ===== */
async function loadCategories() {
  const snap = await getDocs(collection(db, "categories"));
  snap.forEach(doc => {
    const li = document.createElement("li");
    li.innerText = doc.data().name;
    li.onclick = () => {
      toggleSidebar();
      document.querySelector(`[data-category="${doc.id}"]`)?.click();
    };
    categoryList.appendChild(li);
  });
}
loadCategories();

/* ===== CATEGORY ACCORDION ===== */
document.querySelector(".accordion").onclick = function (e) {
  e.stopPropagation();
  this.classList.toggle("open");
};
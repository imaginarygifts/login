import { db } from "./firebase.js";
import { collection, getDocs } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= DOM ================= */
const grid = document.getElementById("productGrid");
const categoryBar = document.getElementById("categoryBar");
const tagRow = document.getElementById("tagFilterRow");

/* ================= STATE ================= */
let allProducts = [];
let allCategories = [];
let allTags = [];

let activeCategory = "all";
let activeTag = "all";
let showBestSellerOnly = false;



window.goCart = function () {
  location.href = "cart.html";
};

function updateCartCount() {
  const uid = localStorage.getItem("customerUid");
  if (!uid) {
    document.getElementById("cartCount").innerText = "0";
    return;
  }

  const cart =
    JSON.parse(localStorage.getItem(`cart_${uid}`)) || { items: [] };

  const count = cart.items.reduce((sum, i) => sum + (i.qty || 1), 0);
  document.getElementById("cartCount").innerText = count;
}

/* 🔁 Auto update on page load */
updateCartCount();

/* 🔁 Listen for cart updates */
window.addEventListener("storage", updateCartCount);



window.addToCart = function () {
  const uid = localStorage.getItem("customerUid");

  if (!uid) {
    localStorage.setItem("redirectAfterLogin", location.href);
    location.href = "login.html";
    return;
  }

  const cartKey = `cart_${uid}`;
  const cart = JSON.parse(localStorage.getItem(cartKey)) || { items: [] };

  const item = {
    productId: product.id,
    name: product.name,
    image: product.images?.[0] || "",
    basePrice: product.basePrice,
    finalPrice,

    variants: {
      color: selected.color || null,
      size: selected.size || null
    },

    options: Object.keys(selected.options || {}).map(i => ({
      label: product.customOptions?.[i]?.label || "",
      value: selected.optionValues?.[i] || ""
    })),

    qty: 1
  };

  cart.items.push(item);
  localStorage.setItem(cartKey, JSON.stringify(cart));

  alert("Added to cart 🛒");
};





/* ================= BESTSELLER ================= */
window.filterBestSeller = function () {
  showBestSellerOnly = true;
  activeCategory = "all";
  activeTag = "all";
  updateTagUI();
  renderProducts();
};

/* ================= CATEGORIES ================= */
async function loadCategories() {
  const snap = await getDocs(collection(db, "categories"));
  allCategories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderCategoryBar();
}

function renderCategoryBar() {
  categoryBar.innerHTML = "";

  categoryBar.appendChild(createCategoryBtn("All", "all"));

  allCategories.forEach(cat => {
    categoryBar.appendChild(createCategoryBtn(cat.name, cat.id));
  });
}

function createCategoryBtn(label, id) {
  const div = document.createElement("div");
  div.className = "category-pill" + (activeCategory === id ? " active" : "");
  div.innerText = label;

  div.dataset.id = id; // ✅ VERY IMPORTANT

  div.onclick = () => {
    activeCategory = id;
    document
      .querySelectorAll(".category-pill")
      .forEach(p => p.classList.remove("active"));
    div.classList.add("active");
    renderProducts();
  };

  return div;
}

/* ================= TAGS ================= */
async function loadFrontendTags() {
  if (!tagRow) return;

  const snap = await getDocs(collection(db, "tags"));
  allTags = snap.docs.map(d => d.data());
  renderTags();
}

function renderTags() {
  tagRow.innerHTML = "";

  tagRow.appendChild(createTagChip("All", "all"));

  allTags.forEach(tag => {
    tagRow.appendChild(createTagChip(tag.name, tag.slug));
  });
}

function createTagChip(label, slug) {
  const chip = document.createElement("div");
  chip.className = "tag-chip" + (activeTag === slug ? " active" : "");
  chip.innerText = label;

  chip.onclick = () => {
    showBestSellerOnly = false; // ✅ FIX 3
    activeTag = activeTag === slug ? "all" : slug;
    updateTagUI();
    renderProducts();
  };

  return chip;
}

function updateTagUI() {
  document.querySelectorAll(".tag-chip").forEach(chip => {
    const tag = chip.innerText.toLowerCase();
    chip.classList.remove("active");

    if (
      (activeTag === "all" && tag === "all") ||
      tag === activeTag
    ) {
      chip.classList.add("active");
    }
  });
}

/* ================= PRODUCTS ================= */
async function loadProducts() {
  const snap = await getDocs(collection(db, "products"));
  allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderProducts();
}

function renderProducts() {
  grid.innerHTML = "";

  const filtered = allProducts.filter(p => {
    const categoryMatch =
      activeCategory === "all" || p.categoryId === activeCategory;

    const tagMatch =
      activeTag === "all" ||
      (p.tags && p.tags.includes(activeTag));

    const bestsellerMatch =
      !showBestSellerOnly ||
      (p.tags && p.tags.includes("bestseller")); // ✅ FIX 4

    return categoryMatch && tagMatch && bestsellerMatch;
  });

  if (!filtered.length) {
    grid.innerHTML = `<p class="empty">No products found</p>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    const isBestseller = p.tags && p.tags.includes("bestseller");

    card.innerHTML = `
      <div class="img-wrap">
        ${isBestseller ? `<span class="badge">🔥 Bestseller</span>` : ""}
        <img src="${p.images?.[0] || ''}">
      </div>

      <div class="info">
        <h4>${p.name}</h4>
        <p>₹${p.basePrice}</p>
      </div>
    `;

    card.onclick = () => {
      location.href = `product.html?id=${p.id}`;
    };

    grid.appendChild(card);
  });
}

/* ================= INIT ================= */
loadCategories();
loadFrontendTags();
loadProducts();
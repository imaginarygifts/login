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

/* ================= CART ================= */
window.goCart = function () {
  location.href = "cart.html";
};

function getCart() {
  const uid = localStorage.getItem("customerUid");
  if (!uid) return { items: [] };
  return JSON.parse(localStorage.getItem(`cart_${uid}`)) || { items: [] };
}

function saveCart(cart) {
  const uid = localStorage.getItem("customerUid");
  if (!uid) return;
  localStorage.setItem(`cart_${uid}`, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const uid = localStorage.getItem("customerUid");
  const el = document.getElementById("cartCount");
  if (!el) return;

  if (!uid) {
    el.innerText = "0";
    return;
  }

  const cart = getCart();
  const count = cart.items.reduce((s, i) => s + i.qty, 0);
  el.innerText = count;
}

updateCartCount();
window.addEventListener("storage", updateCartCount);

/* ================= CART ACTIONS ================= */
function addToCart(product) {
  const uid = localStorage.getItem("customerUid");

  if (!uid) {
    localStorage.setItem("redirectAfterLogin", location.href);
    location.href = "login.html";
    return;
  }

  const cart = getCart();
  let item = cart.items.find(i => i.productId === product.id);

  if (item) {
    item.qty += 1;
  } else {
    cart.items.push({
      productId: product.id,
      name: product.name,
      price: product.basePrice,
      image: product.images?.[0] || "",
      qty: 1
    });
  }

  saveCart(cart);
}

function updateQty(productId, delta) {
  const cart = getCart();
  const item = cart.items.find(i => i.productId === productId);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart.items = cart.items.filter(i => i.productId !== productId);
  }

  saveCart(cart);
}

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
  div.dataset.id = id;

  div.onclick = () => {
    showBestSellerOnly = false;
    activeCategory = id;
    document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
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
    showBestSellerOnly = false;
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

    if ((activeTag === "all" && tag === "all") || tag === activeTag) {
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
      activeTag === "all" || (p.tags && p.tags.includes(activeTag));

    const bestsellerMatch =
      !showBestSellerOnly || (p.tags && p.tags.includes("bestseller"));

    return categoryMatch && tagMatch && bestsellerMatch;
  });

  if (!filtered.length) {
    grid.innerHTML = `<p class="empty">No products found</p>`;
    return;
  }

  const cart = getCart();

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    const isBestseller = p.tags?.includes("bestseller");
    const cartItem = cart.items.find(i => i.productId === p.id);

    card.innerHTML = `
      <div class="img-wrap">
        ${isBestseller ? `<span class="badge">🔥 Bestseller</span>` : ""}
        <img src="${p.images?.[0] || ''}">
      </div>

      <div class="info">
        <h4>${p.name}</h4>

        <div class="price-row">
          <span class="price">₹${p.basePrice}</span>

          <div class="cart-controls">
            <button class="cart-btn add ${cartItem ? "hidden" : ""}">Add To Cart</button>

            <div class="qty-box ${cartItem ? "" : "hidden"}">
              <button class="qty-btn minus">−</button>
              <span class="qty">${cartItem?.qty || 1}</span>
              <button class="qty-btn plus">+</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const addBtn = card.querySelector(".add");
    const qtyBox = card.querySelector(".qty-box");
    const qtyText = card.querySelector(".qty");
    const plus = card.querySelector(".plus");
    const minus = card.querySelector(".minus");

    [addBtn, plus, minus].forEach(btn =>
      btn?.addEventListener("click", e => e.stopPropagation())
    );

    addBtn.onclick = () => {
      addToCart(p);
      addBtn.classList.add("hidden");
      qtyBox.classList.remove("hidden");
      qtyText.innerText = 1;
    };

    plus.onclick = () => {
      updateQty(p.id, 1);
      qtyText.innerText = Number(qtyText.innerText) + 1;
    };

    minus.onclick = () => {
      updateQty(p.id, -1);
      const q = Number(qtyText.innerText) - 1;

      if (q <= 0) {
        qtyBox.classList.add("hidden");
        addBtn.classList.remove("hidden");
      } else {
        qtyText.innerText = q;
      }
    };

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
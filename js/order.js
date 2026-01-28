import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ======================================================
   GLOBAL STATE
====================================================== */
let orderData = null;
let subTotal = 0;
let discount = 0;
let finalAmount = 0;
let appliedCoupon = null;
let selectedPaymentMode = "online";
let availableCoupons = [];
let orderNumber = null;
let isCartCheckout = false;

/* ======================================================
   LOAD ORDER
====================================================== */
function loadOrder() {
  const fromCart = localStorage.getItem("checkoutFromCart");

  if (fromCart) {
    isCartCheckout = true;
    loadCartOrder();
  } else {
    loadSingleOrder();
  }
}

/* ================= SINGLE PRODUCT ================= */
function loadSingleOrder() {
  const raw = localStorage.getItem("checkoutData");
  if (!raw) {
    alert("No product selected");
    location.href = "index.html";
    return;
  }

  orderData = JSON.parse(raw);
  subTotal = Number(orderData.finalPrice || 0);

  renderSingleSummary();
  setupSinglePaymentModes();
  loadCoupons();
  recalcPrice();
}

/* ================= CART ORDER ================= */
function loadCartOrder() {
  const uid = localStorage.getItem("customerUid");
  const cart = JSON.parse(localStorage.getItem(`cart_${uid}`));

  if (!cart || !cart.items || !cart.items.length) {
    alert("Cart is empty");
    location.href = "index.html";
    return;
  }

  orderData = { items: cart.items };
  subTotal = cart.items.reduce(
    (sum, i) => sum + i.finalPrice * i.qty,
    0
  );

  renderCartSummary();
  setupCartPaymentModes();
  loadCoupons();
  recalcPrice();
}

/* ======================================================
   ORDER NUMBER
====================================================== */
async function generateOrderNumber() {
  const ref = doc(db, "counters", "orders");
  const snap = await getDoc(ref);

  let next = 1001;
  if (snap.exists()) {
    next = (snap.data().current || 1000) + 1;
    await updateDoc(ref, { current: next });
  } else {
    await setDoc(ref, { current: next });
  }

  return `IG-${next}`;
}

/* ======================================================
   RENDER SUMMARY
====================================================== */
function renderSingleSummary() {
  const box = document.getElementById("orderSummary");

  let html = `
    <div><b>${orderData.product.name}</b></div>
    <div>Base Price: ₹${orderData.product.basePrice}</div>
  `;

  if (orderData.color) html += `<div>Color: ${orderData.color.name}</div>`;
  if (orderData.size) html += `<div>Size: ${orderData.size.name}</div>`;

  if (orderData.options && Object.keys(orderData.options).length) {
    html += `<div style="margin-top:6px"><b>Options:</b></div>`;
    Object.keys(orderData.options).forEach(i => {
      const label = orderData.product.customOptions[i]?.label;
      const value = orderData.optionValues?.[i] || "Selected";
      html += `<div>- ${label}: ${value}</div>`;
    });
  }

  box.innerHTML = html;
}

function renderCartSummary() {
  const box = document.getElementById("orderSummary");
  let html = `<b>Items:</b><br><br>`;

  orderData.items.forEach(i => {
    html += `
      <div style="margin-bottom:8px">
        ${i.name} × ${i.qty}<br>
        ₹${i.finalPrice * i.qty}
      </div>
    `;
  });

  box.innerHTML = html;
}

/* ======================================================
   PAYMENT MODES
====================================================== */
function setupSinglePaymentModes() {
  const ps = orderData.product.paymentSettings || {};

  ["online","cod","advance"].forEach(m => {
    const el = document.getElementById(`${m}Option`);
    if (el && !ps[m]?.enabled) el.style.display = "none";
  });

  selectedPaymentMode =
    ps.online?.enabled ? "online" :
    ps.cod?.enabled ? "cod" :
    ps.advance?.enabled ? "advance" : "online";

  document.querySelector(`input[value="${selectedPaymentMode}"]`).checked = true;

  document.querySelectorAll("input[name='paymode']").forEach(r => {
    r.addEventListener("change", () => {
      selectedPaymentMode = r.value;
      removeCoupon();
      loadCoupons();
      recalcPrice();
    });
  });
}

function setupCartPaymentModes() {
  selectedPaymentMode = "online";
  document.querySelector(`input[value="online"]`).checked = true;
}

/* ======================================================
   PRICE
====================================================== */
function recalcPrice() {
  finalAmount = Math.max(subTotal - discount, 0);
  subTotalEl.innerText = "₹" + subTotal;
  discountAmount.innerText = "-₹" + discount;
  finalAmountEl.innerText = "₹" + finalAmount;
}

/* ======================================================
   COUPONS
====================================================== */
async function loadCoupons() {
  const snap = await getDocs(collection(db, "coupons"));
  availableCoupons = [];
  const now = new Date();

  snap.forEach(d => {
    const c = d.data();
    if (!c.active) return;
    const expiry = c.expiry?.toDate?.();
    if (expiry && expiry < now) return;
    if (c.minOrder && subTotal < c.minOrder) return;
    if (c.allowedModes && !c.allowedModes.includes(selectedPaymentMode)) return;
    availableCoupons.push({ id: d.id, ...c });
  });

  renderCoupons();
}

function renderCoupons() {
  couponListUI.innerHTML = "";
  if (!availableCoupons.length) {
    couponListUI.innerHTML = `<p class="no-coupon">No coupons available</p>`;
    return;
  }

  availableCoupons.forEach(c => {
    const div = document.createElement("div");
    div.className = "coupon-card";
    if (appliedCoupon?.id === c.id) div.classList.add("applied");

    const value =
      c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} OFF`;

    div.innerHTML = `
      <div><b>${c.code}</b><small>${value}</small></div>
      <button onclick="${appliedCoupon?.id === c.id
        ? "removeCoupon()"
        : `applyCoupon('${c.id}')`}">
        ${appliedCoupon?.id === c.id ? "Remove" : "Apply"}
      </button>
    `;
    couponListUI.appendChild(div);
  });
}

window.applyCoupon = id => {
  const c = availableCoupons.find(x => x.id === id);
  if (!c) return;
  discount = c.type === "percent"
    ? Math.round(subTotal * (c.value / 100))
    : c.value;
  appliedCoupon = c;
  renderCoupons();
  recalcPrice();
};

window.removeCoupon = () => {
  appliedCoupon = null;
  discount = 0;
  renderCoupons();
  recalcPrice();
};

/* ======================================================
   SAVE ORDER
====================================================== */
async function saveOrder(paymentMode, paymentStatus, paymentId = null) {
  const order = {
    orderNumber: await generateOrderNumber(),
    items: isCartCheckout ? orderData.items : null,
    productId: !isCartCheckout ? orderData.product.id : null,
    productName: !isCartCheckout ? orderData.product.name : null,
    productImage: !isCartCheckout ? orderData.product.images?.[0] : null,
    pricing: { subTotal, discount, finalAmount },
    payment: { mode: paymentMode, status: paymentStatus, paymentId },
    orderStatus: "pending",
    source: "frontend",
    createdAt: Date.now()
  };

  await addDoc(collection(db, "orders"), order);
  return order;
}

/* ======================================================
   PLACE ORDER
====================================================== */
window.placeOrder = async function () {
  if (selectedPaymentMode === "cod") {
    const order = await saveOrder("cod", "pending");
    sendWhatsApp(order);
    cleanupCart();
    alert("Order placed");
  } else {
    startPayment();
  }
};

/* ======================================================
   WHATSAPP
====================================================== */
function sendWhatsApp(order) {
  let msg = `🛍 *New Order — Imaginary Gifts*\n\n`;
  msg += `🧾 Order No: *${order.orderNumber}*\n\n`;

  if (order.items) {
    order.items.forEach(i => {
      msg += `- ${i.name} × ${i.qty} = ₹${i.finalPrice * i.qty}\n`;
    });
  } else {
    msg += `Product: ${order.productName}\n`;
  }

  msg += `\nTotal: ₹${order.pricing.finalAmount}`;
  window.open(
    `https://wa.me/917030191819?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

/* ======================================================
   RAZORPAY
====================================================== */
function startPayment() {
  const rzp = new Razorpay({
    key: "rzp_test_8OmRCO9SiPeXWg",
    amount: finalAmount * 100,
    currency: "INR",
    name: "Imaginary Gifts",
    handler: async r => {
      const order = await saveOrder("online", "paid", r.razorpay_payment_id);
      sendWhatsApp(order);
      cleanupCart();
      alert("Payment successful");
    }
  });
  rzp.open();
}

/* ======================================================
   CLEANUP
====================================================== */
function cleanupCart() {
  localStorage.removeItem("checkoutFromCart");
  const uid = localStorage.getItem("customerUid");
  if (uid) localStorage.removeItem(`cart_${uid}`);
}

/* ======================================================
   INIT
====================================================== */
loadOrder();
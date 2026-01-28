const uid = localStorage.getItem("customerUid");
if (!uid) {
  location.href = "login.html";
}

const cartKey = `cart_${uid}`;
let cart = JSON.parse(localStorage.getItem(cartKey)) || { items: [] };

const list = document.getElementById("cartList");
const totalEl = document.getElementById("cartTotal");

function renderCart() {
  list.innerHTML = "";
  let total = 0;

  if (!cart.items.length) {
    list.innerHTML = "<p>Cart is empty</p>";
    totalEl.innerText = "0";
    return;
  }

  cart.items.forEach((item, i) => {
    total += item.finalPrice * item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.image}">
      <div>
        <b>${item.name}</b>
        <div>₹${item.finalPrice}</div>
        <button onclick="removeItem(${i})">Remove</button>
      </div>
    `;

    list.appendChild(div);
  });

  totalEl.innerText = total;
}

window.removeItem = function (i) {
  cart.items.splice(i, 1);
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCart();
};

window.goCheckout = function () {
  localStorage.setItem("checkoutFromCart", "true");
  location.href = "order.html";
};

renderCart();
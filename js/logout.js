document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("authBtn");
  if (!btn) return;

  const uid = localStorage.getItem("customerUid");

  if (uid) {
    btn.innerText = "Logout";
    btn.onclick = logoutCustomer;
  } else {
    btn.innerText = "Login";
    btn.onclick = loginCustomer;
  }
});

function loginCustomer() {
  localStorage.setItem("redirectAfterLogin", location.href);
  location.href = "login.html";
}

function logoutCustomer() {
  if (!confirm("Logout?")) return;

  localStorage.removeItem("customerUid");
  localStorage.removeItem("customerPhone");

  // stay on same page
  location.reload();
}
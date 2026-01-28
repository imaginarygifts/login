window.customerLogout = function () {
  if (!confirm("Are you sure you want to logout?")) return;

  // 🔥 Clear customer session
  localStorage.removeItem("customerUid");
  localStorage.removeItem("customerPhone");

  // Optional cleanup
  localStorage.removeItem("redirectAfterLogin");

  // Redirect to login
  location.href = "login.html";
};
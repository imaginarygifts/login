window.customerLogout = function () {
  localStorage.removeItem("customerUid");
  localStorage.removeItem("customerPhone");
  location.reload();
};
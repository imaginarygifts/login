(function () {
  const customerUid = localStorage.getItem("customerUid");

  // Pages that REQUIRE login
  const protectedPages = [
    "order.html"
  ];

  const currentPage = location.pathname.split("/").pop();

  if (protectedPages.includes(currentPage) && !customerUid) {
    localStorage.setItem("redirectAfterLogin", currentPage);
    location.href = "login.html";
  }
})();
const authBtn = document.getElementById("authBtn");
const uid = localStorage.getItem("customerUid");

if (uid) {
  // Logged in → show Logout
  authBtn.innerText = "Logout";

  authBtn.onclick = () => {
    localStorage.removeItem("customerUid");
    localStorage.removeItem("customerPhone");

    // stay on same page
    location.reload();
  };
} else {
  // Not logged in → show Login
  authBtn.innerText = "Login";

  authBtn.onclick = () => {
    // save current page
    localStorage.setItem("redirectAfterLogin", location.href);
    location.href = "login.html";
  };
}
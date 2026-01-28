import { auth } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.requireCustomerLogin = function () {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, user => {
      if (user) {
        resolve(user);
      } else {
        localStorage.setItem(
          "redirectAfterLogin",
          location.href
        );
        location.href = "login.html";
      }
    });
  });
};
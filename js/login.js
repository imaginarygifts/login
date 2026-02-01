// js/login.js
import { auth } from "./firebase.js";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ================= DOM ================= */
const phoneInput = document.getElementById("phone");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpBox = document.getElementById("otpBox");
const otpInput = document.getElementById("otp");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

let confirmationResult = null;

/* ================= RECAPTCHA ================= */
window.recaptchaVerifier = new RecaptchaVerifier(
  auth,
  "recaptcha-container",
  { size: "invisible" }
);

/* ================= SEND OTP ================= */
sendOtpBtn.onclick = async () => {
  const raw = phoneInput.value.trim();

  if (!/^\d{10}$/.test(raw)) {
    alert("Enter valid 10 digit mobile number");
    return;
  }

  const phone = "+91" + raw;

  try {
    confirmationResult =
      await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );

    otpBox.style.display = "block";
    alert("OTP sent");

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

/* ================= VERIFY OTP ================= */
verifyOtpBtn.onclick = async () => {
  const code = otpInput.value.trim();
  if (!code) return alert("Enter OTP");

  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;

    /* SAVE SESSION */
    localStorage.setItem("customerUid", user.uid);
    localStorage.setItem("customerPhone", user.phoneNumber);

    /* REDIRECT */
    const redirect =
      localStorage.getItem("redirectAfterLogin") || "index.html";
    localStorage.removeItem("redirectAfterLogin");

    location.href = redirect;

  } catch (err) {
    console.error(err);
    alert("Invalid or expired OTP");
  }
};
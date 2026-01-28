import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* 🔥 YOUR FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* ================= STATE ================= */
let confirmationResult = null;

/* ================= DOM ================= */
const phoneInput = document.getElementById("phone");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpBox = document.getElementById("otpBox");
const otpInput = document.getElementById("otp");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

/* ================= RECAPTCHA ================= */
window.recaptchaVerifier = new RecaptchaVerifier(
  auth,
  "recaptcha-container",
  {
    size: "invisible"
  }
);

/* ================= SEND OTP ================= */
sendOtpBtn.addEventListener("click", async () => {
  const phone = phoneInput.value.trim();

  if (!phone.startsWith("+")) {
    alert("Use country code. Example: +919876543210");
    return;
  }

  try {
    sendOtpBtn.disabled = true;

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      window.recaptchaVerifier
    );

    otpBox.style.display = "block";
    alert("OTP sent");

  } catch (err) {
    console.error(err);
    alert(err.message);
    sendOtpBtn.disabled = false;
  }
});

/* ================= VERIFY OTP ================= */
verifyOtpBtn.addEventListener("click", async () => {
  const otp = otpInput.value.trim();

  if (!otp) {
    alert("Enter OTP");
    return;
  }

  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    /* SAVE LOGIN */
    localStorage.setItem("customerUid", user.uid);

    alert("Login successful");

    /* REDIRECT */
    const redirect = localStorage.getItem("redirectAfterLogin") || "index.html";
    localStorage.removeItem("redirectAfterLogin");
    location.href = redirect;

  } catch (err) {
    console.error(err);
    alert("Invalid OTP");
  }
});
import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
    alert("Enter valid 10 digit number");
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

  } catch (e) {
    console.error(e);
    alert(e.message);
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

  } catch (e) {
    console.error(e);
    alert("Invalid or expired OTP");
  }
};
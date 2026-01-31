import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  console.log("LOGIN JS LOADED");

  const firebaseConfig = {
    apiKey: "AIzaSyDaeaJy8haKhn3Ve5rUdrj7XItXPI-ujDU",
    authDomain: "sellfix-designing.firebaseapp.com",
    projectId: "sellfix-designing",
    appId: "1:129826052151:web:ff6f1cb5fce219d65087b2"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  let confirmationResult = null;
  let resendTimer = null;
  let resendSeconds = 60;

  const phoneInput = document.getElementById("phone");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const otpBox = document.getElementById("otpBox");
  const otpInput = document.getElementById("otp");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const resendBtn = document.getElementById("resendOtpBtn");
  const resendText = document.getElementById("resendTimer");
  const loadingPopup = document.getElementById("loadingPopup");

  if (!phoneInput || !sendOtpBtn || !otpBox) {
    console.error("Login DOM elements missing");
    return;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    { size: "invisible" }
  );

  function normalizeIndianPhone(input) {
    let phone = input.trim().replace(/\D/g, "");
    if (!/^\d{10}$/.test(phone)) return null;
    return "+91" + phone;
  }

  async function sendOtp() {
    const phone = normalizeIndianPhone(phoneInput.value);

    if (!phone) {
      alert("Enter valid 10 digit mobile number");
      return;
    }

    try {
      sendOtpBtn.disabled = true;
      otpBox.style.display = "block"; // ✅ THIS WILL NOW WORK
      startResendTimer();

      confirmationResult = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );

      console.log("OTP SENT");

    } catch (err) {
      console.error(err);
      alert(err.message);
      sendOtpBtn.disabled = false;
      otpBox.style.display = "none";
      clearInterval(resendTimer);
    }
  }

  sendOtpBtn.addEventListener("click", sendOtp);
  resendBtn.addEventListener("click", sendOtp);

});
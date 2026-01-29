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

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDaeaJy8haKhn3Ve5rUdrj7XItXPI-ujDU",
  authDomain: "sellfix-designing.firebaseapp.com",
  projectId: "sellfix-designing",
  appId: "1:129826052151:web:ff6f1cb5fce219d65087b2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= STATE ================= */
let confirmationResult = null;
let resendTimer = null;
let resendSeconds = 60;

/* ================= DOM ================= */
const phoneInput = document.getElementById("phone");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpBox = document.getElementById("otpBox");
const otpInput = document.getElementById("otp");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const resendBtn = document.getElementById("resendOtpBtn");
const resendText = document.getElementById("resendTimer");
const loadingPopup = document.getElementById("loadingPopup");

/* ================= HELPERS ================= */
function normalizeIndianPhone(input) {
  const phone = input.replace(/\D/g, "");
  if (!/^\d{10}$/.test(phone)) return null;
  return "+91" + phone;
}

function showLoading(text) {
  if (!loadingPopup) return;
  loadingPopup.querySelector("span").innerText = text;
  loadingPopup.style.display = "flex";
}

function hideLoading() {
  if (!loadingPopup) return;
  loadingPopup.style.display = "none";
}

/* ================= RECAPTCHA ================= */
function initRecaptcha() {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }

  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    "recaptcha-container",
    {
      size: "invisible",
      callback: () => {}
    }
  );
}

/* ================= RESEND TIMER ================= */
function startResendTimer() {
  resendSeconds = 60;
  resendBtn.disabled = true;
  resendText.innerText = `Resend OTP in ${resendSeconds}s`;

  resendTimer = setInterval(() => {
    resendSeconds--;
    resendText.innerText = `Resend OTP in ${resendSeconds}s`;

    if (resendSeconds <= 0) {
      clearInterval(resendTimer);
      resendText.innerText = "";
      resendBtn.disabled = false;
    }
  }, 1000);
}

/* ================= SEND OTP ================= */
async function sendOtp() {
  const phone = normalizeIndianPhone(phoneInput.value);

  if (!phone) {
    alert("Enter valid 10 digit mobile number");
    return;
  }

  try {
    initRecaptcha();

    sendOtpBtn.disabled = true;
    otpBox.style.display = "block";
    startResendTimer();

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      window.recaptchaVerifier
    );

  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to send OTP");

    sendOtpBtn.disabled = false;
    otpBox.style.display = "none";
    clearInterval(resendTimer);
  }
}

sendOtpBtn.addEventListener("click", sendOtp);
resendBtn.addEventListener("click", sendOtp);

/* ================= VERIFY OTP ================= */
verifyOtpBtn.addEventListener("click", async () => {
  const otp = otpInput.value.trim();

  if (!otp || otp.length !== 6) {
    alert("Enter valid 6 digit OTP");
    return;
  }

  if (!confirmationResult) {
    alert("Please resend OTP");
    return;
  }

  try {
    showLoading("Verifying OTP...");
    verifyOtpBtn.disabled = true;

    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    /* SAVE CUSTOMER TO FIRESTORE */
    await setDoc(
      doc(db, "customers", user.phoneNumber),
      {
        uid: user.uid,
        phone: user.phoneNumber,
        lastLoginAt: serverTimestamp()
      },
      { merge: true }
    );

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
    alert("Invalid or expired OTP. Please resend.");
    verifyOtpBtn.disabled = false;
    hideLoading();
  }
});
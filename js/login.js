import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* 🔥 YOUR FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyDaeaJy8haKhn3Ve5rUdrj7XItXPI-ujDU",
  authDomain: "sellfix-designing.firebaseapp.com",
  projectId: "sellfix-designing",
  appId: "1:129826052151:web:ff6f1cb5fce219d65087b2"
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
  { size: "invisible" }
);

/* ================= HELPERS ================= */
function normalizeIndianPhone(input) {
  let phone = input.trim();

  // remove spaces / dashes
  phone = phone.replace(/[^0-9+]/g, "");

  // if starts with 91 but no +
  if (phone.length === 12 && phone.startsWith("91")) {
    phone = "+" + phone;
  }

  // if only 10 digits → add +91
  if (/^\d{10}$/.test(phone)) {
    phone = "+91" + phone;
  }

  return phone;
}

/* ================= SEND OTP ================= */
sendOtpBtn.addEventListener("click", async () => {
  let phone = phoneInput.value;

  phone = normalizeIndianPhone(phone);

  if (!phone.startsWith("+91") || phone.length !== 13) {
    alert("Enter valid 10 digit mobile number");
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
    localStorage.setItem("customerPhone", user.phoneNumber);

    alert("Login successful");

    /* REDIRECT */
    const redirect =
      localStorage.getItem("redirectAfterLogin") || "index.html";
    localStorage.removeItem("redirectAfterLogin");

    location.href = redirect;

  } catch (err) {
    console.error(err);
    alert("Invalid OTP");
  }
});
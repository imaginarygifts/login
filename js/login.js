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

/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDaeaJy8haKhn3Ve5rUdrj7XItXPI-ujDU",
  authDomain: "sellfix-designing.firebaseapp.com",
  projectId: "sellfix-designing",
  appId: "1:129826052151:web:ff6f1cb5fce219d65087b2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = "en";

const db = getFirestore(app);

/* ================= STATE ================= */
let confirmationResult = null;
let resendInterval = null;
let secondsLeft = 60;

/* ================= DOM ================= */
const phoneInput = document.getElementById("phone");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpBox = document.getElementById("otpBox");
const otpInput = document.getElementById("otp");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const resendBtn = document.getElementById("resendOtpBtn");
const resendText = document.getElementById("resendTimer");

/* ================= HELPERS ================= */
function normalizePhone(num) {
  const n = num.replace(/\D/g, "");
  if (n.length !== 10) return null;
  return "+91" + n;
}

/* ================= RECAPTCHA (ONLY ONCE) ================= */
window.recaptchaVerifier = new RecaptchaVerifier(
  auth,
  "recaptcha-container",
  { size: "invisible" }
);

/* ================= TIMER ================= */
function startTimer() {
  secondsLeft = 60;
  resendBtn.disabled = true;

  resendInterval = setInterval(() => {
    secondsLeft--;
    resendText.innerText = `Resend OTP in ${secondsLeft}s`;

    if (secondsLeft <= 0) {
      clearInterval(resendInterval);
      resendText.innerText = "";
      resendBtn.disabled = false;
    }
  }, 1000);
}

/* ================= SEND OTP ================= */
async function sendOtp() {
  const phone = normalizePhone(phoneInput.value);
  if (!phone) {
    alert("Enter valid 10 digit number");
    return;
  }

  try {
    sendOtpBtn.disabled = true;
    otpBox.style.display = "block";
    startTimer();

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      window.recaptchaVerifier
    );

  } catch (err) {
    console.error(err);
    alert("OTP send failed");
    sendOtpBtn.disabled = false;
    otpBox.style.display = "none";
    clearInterval(resendInterval);
  }
}

sendOtpBtn.onclick = sendOtp;
resendBtn.onclick = sendOtp;

/* ================= VERIFY OTP ================= */
verifyOtpBtn.onclick = async () => {
  const otp = otpInput.value.trim();

  if (!otp || otp.length !== 6) {
    alert("Enter 6 digit OTP");
    return;
  }

  if (!confirmationResult) {
    alert("Please resend OTP");
    return;
  }

  try {
    verifyOtpBtn.disabled = true;

    const res = await confirmationResult.confirm(otp);
    const user = res.user;

    /* SAVE CUSTOMER */
    await setDoc(
      doc(db, "customers", user.uid),
      {
        uid: user.uid,
        phone: user.phoneNumber,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      },
      { merge: true }
    );

    localStorage.setItem("customerUid", user.uid);
    localStorage.setItem("customerPhone", user.phoneNumber);

    const redirect =
      localStorage.getItem("redirectAfterLogin") || "index.html";
    localStorage.removeItem("redirectAfterLogin");

    location.href = redirect;

  } catch (err) {
    console.error(err);
    alert("Invalid OTP. Please resend.");
    verifyOtpBtn.disabled = false;
  }
};
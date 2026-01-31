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

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: AIzaSyAoEKRVuQKkbO5simGLszp-Y8mCTRAbFfQ,
authDomain: "sellfix-web.firebaseapp.com",
  projectId: "sellfix-web",
  appId: "1:381995495462:web:39c4d5cfcbdfeaa9c2b6e7"
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

/* ================= RECAPTCHA ================= */
window.recaptchaVerifier = new RecaptchaVerifier(
auth,
"recaptcha-container",
{ size: "invisible" }
);

/* ================= HELPERS ================= */
function normalizeIndianPhone(input) {
let phone = input.trim().replace(/\D/g, "");
if (!/^\d{10}$/.test(phone)) return null;
return "+91" + phone;
}

function showLoading(text) {
loadingPopup.querySelector("span").innerText = text;
loadingPopup.style.display = "flex";
}

function hideLoading() {
loadingPopup.style.display = "none";
}

function startResendTimer() {
resendSeconds = 60;
resendBtn.disabled = true;
resendText.innerText = Resend OTP in ${resendSeconds}s;

resendTimer = setInterval(() => {
resendSeconds--;
resendText.innerText = Resend OTP in ${resendSeconds}s;

if (resendSeconds <= 0) {
clearInterval(resendTimer);
resendText.innerText = "";
resendBtn.disabled = false;
}

}, 1000);
}

/* ================= SEND OTP ================= */
async function sendOtp() {
let phone = normalizeIndianPhone(phoneInput.value);

if (!phone) {
alert("Enter valid 10 digit mobile number");
return;
}

try {
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
alert(err.message);
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

if (!otp) {
alert("Enter OTP");
return;
}

try {
showLoading("Verifying OTP...");
verifyOtpBtn.disabled = true;

const result = await confirmationResult.confirm(otp);
const user = result.user;

/* ✅ SAVE CUSTOMER LOGIN TO FIRESTORE */
await setDoc(
doc(db, "customers", user.phoneNumber),
{
phone: user.phoneNumber,     // login ID
uid: user.uid,
firstLoginAt: serverTimestamp(),
lastLoginAt: serverTimestamp()
},
{ merge: true }
);

/* SAVE LOCAL SESSION */
localStorage.setItem("customerUid", user.uid);
localStorage.setItem("customerPhone", user.phoneNumber);

/* REDIRECT */
const redirect =
localStorage.getItem("redirectAfterLogin") || "index.html";
localStorage.removeItem("redirectAfterLogin");

location.href = redirect;

} catch (err) {
console.error(err);
alert("Invalid OTP");
verifyOtpBtn.disabled = false;
hideLoading();
}
});


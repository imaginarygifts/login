import { auth } from "./firebase.js";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ================= GLOBAL ================= */
window.confirmationResult = null;

/* ================= SEND OTP ================= */
window.sendOTP = async function () {
  const phone = document.getElementById("phone").value.trim();

  if (!phone || phone.length < 10) {
    alert("Enter valid mobile number");
    return;
  }

  // Save redirect page
  localStorage.setItem("redirectAfterLogin", location.href);

  try {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible"
        }
      );
    }

    window.confirmationResult = await signInWithPhoneNumber(
      auth,
      "+91" + phone,
      window.recaptchaVerifier
    );

    document.getElementById("otpBox").style.display = "block";
    alert("OTP sent");

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

/* ================= VERIFY OTP ================= */
window.verifyOTP = async function () {
  const otp = document.getElementById("otp").value.trim();

  if (!otp) {
    alert("Enter OTP");
    return;
  }

  if (!window.confirmationResult) {
    alert("Send OTP first");
    return;
  }

  try {
    const result = await window.confirmationResult.confirm(otp);

    localStorage.setItem(
      "customer",
      JSON.stringify({
        uid: result.user.uid,
        phone: result.user.phoneNumber
      })
    );

    const redirect =
      localStorage.getItem("redirectAfterLogin") || "index.html";

    localStorage.removeItem("redirectAfterLogin");
    location.href = redirect;

  } catch (err) {
    console.error(err);
    alert("Invalid OTP");
  }
};
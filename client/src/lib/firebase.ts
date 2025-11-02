// ✅ eBhangar Firebase — FORCE MOCK OTP MODE (Render-safe testing build)
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ✅ Setup invisible reCAPTCHA safely
export const setupRecaptcha = (containerId: string = "recaptcha-container") => {
  if (typeof window !== "undefined" && !window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      containerId,
      { size: "invisible" },
      auth
    );
  }
  return window.recaptchaVerifier;
};

// ✅ MOCK OTP MODE — works without Firebase SMS
export const sendOtp = async (phone: string) => {
  console.log("🧪 MOCK OTP MODE ACTIVE — Firebase OTP skipped");

  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

  // Always return mock verification object
  return {
    verificationId: "MOCK_VERIFICATION_ID",
    confirm: async (otp: string) => {
      if (otp === "123456") {
        console.log("✅ Mock OTP verified for", formattedPhone);
        return { user: { phoneNumber: formattedPhone } };
      } else {
        throw new Error("❌ Invalid mock OTP");
      }
    },
  };
};

// ✅ eBhangar Firebase — FORCE MOCK OTP MODE (for Render testing)
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

// Firebase Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ✅ Safe invisible reCAPTCHA init
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      containerId,
      { size: "invisible" },
      auth
    );
  }
  return window.recaptchaVerifier;
};

// ✅ MOCK OTP MODE — Always return fake verification object
export const sendOtp = async (phone: string) => {
  console.log("🧪 MOCK OTP MODE ACTIVE — No Firebase call made");
  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

  // return fake confirmation result
  return {
    verificationId: "MOCK_VERIFICATION_ID",
    confirm: async (otp: string) => {
      if (otp === "123456") {
        console.log("✅ Mock OTP verified successfully for:", formattedPhone);
        return { user: { phoneNumber: formattedPhone } };
      }
      throw new Error("❌ Invalid mock OTP");
    },
  };
};

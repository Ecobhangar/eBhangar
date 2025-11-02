// ✅ Firebase setup for eBhangar App (TypeScript + Vite compatible)

import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// ✅ Firebase Config (from .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ✅ Safe reCAPTCHA setup for production
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  // Clean up any previous verifier (avoid double init)
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }

  // Create new reCAPTCHA verifier
  window.recaptchaVerifier = new RecaptchaVerifier(
    containerId,
    {
      size: "invisible",
      callback: (response: any) => {
        console.log("✅ reCAPTCHA verified:", response);
      },
      "expired-callback": () => {
        console.warn("⚠️ reCAPTCHA expired, refreshing...");
      },
    },
    auth
  );

  return window.recaptchaVerifier;
};

// ✅ Send OTP to mobile
export const sendOtp = async (phone: string) => {
  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
  const appVerifier = window.recaptchaVerifier || setupRecaptcha();

  try {
    const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    console.log("✅ OTP sent:", confirmation);
    return confirmation;
  } catch (error) {
    console.error("❌ OTP Send Error:", error);
    throw error;
  }
};

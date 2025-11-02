import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

// ✅ Firebase Config (from .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ✅ Initialize Firebase App (safe initialization)
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ✅ Safe reCAPTCHA setup (Render compatible)
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (typeof window === "undefined") return null; // SSR guard

  try {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(containerId, {
        size: "invisible",
        callback: (response: any) => {
          console.log("✅ reCAPTCHA verified:", response);
        },
      }, auth);
    }
    return window.recaptchaVerifier;
  } catch (err) {
    console.warn("⚠️ reCAPTCHA setup failed, mock mode enabled:", err);
    return null;
  }
};

// ✅ Send OTP function (Render-safe)
export const sendOtp = async (phone: string) => {
  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
  const appVerifier = window.recaptchaVerifier || setupRecaptcha();

  if (!appVerifier) {
    throw new Error("Recaptcha not initialized properly.");
  }

  return await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
};

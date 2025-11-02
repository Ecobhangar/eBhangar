// ✅ Firebase setup for eBhangar App (TypeScript + Vite compatible)

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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ✅ Setup reCAPTCHA (used for OTP verification)
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      containerId,
      {
        size: "invisible",
        callback: (response: any) => {
          console.log("✅ reCAPTCHA verified:", response);
        },
      },
      auth
    );
  }
  return window.recaptchaVerifier;
};

// ✅ Send OTP function
export const sendOtp = async (phone: string) => {
  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
  const appVerifier = window.recaptchaVerifier || setupRecaptcha();

  return await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
};

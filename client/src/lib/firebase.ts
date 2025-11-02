// client/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ReCAPTCHA setup
export const setupRecaptcha = (containerId: string) => {
  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
  });
  return verifier;
};

// Send OTP
export const sendOtp = async (phone: string) => {
  const verifier = setupRecaptcha("recaptcha-container");
  return await signInWithPhoneNumber(auth, phone, verifier);
};

// ✅ Firebase setup for eBhangar App (Render + Testing Safe)
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

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

// ✅ Disable app verification for emulator/testing (safe for web)
try {
  // @ts-ignore
  auth.settings.appVerificationDisabledForTesting = true;
  console.log("⚙️ Firebase test mode enabled");
} catch (e) {
  console.warn("⚠️ Firebase test mode not supported here");
}

// ✅ Setup reCAPTCHA verifier
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      containerId,
      {
        size: "invisible",
        callback: () => console.log("✅ reCAPTCHA verified"),
      },
      auth
    );
  }
  return window.recaptchaVerifier;
};

// ✅ Send OTP
export const sendOtp = async (phone: string) => {
  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
  const appVerifier = window.recaptchaVerifier || setupRecaptcha();
  return await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
};

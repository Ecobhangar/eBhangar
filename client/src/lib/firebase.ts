// ✅ Firebase setup for eBhangar (production + test safe)
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

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ✅ Safe check for test mode (only if property exists)
try {
  if (auth && "settings" in auth) {
    // @ts-ignore
    auth.settings.appVerificationDisabledForTesting = true;
    console.log("⚙️ Firebase test mode enabled ✅");
  } else {
    console.warn("⚠️ Firebase auth.settings not available yet.");
  }
} catch (e) {
  console.warn("⚠️ Skipping appVerificationDisabledForTesting:", e);
}

// ✅ Create or reuse reCAPTCHA verifier
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

// ✅ Send OTP with error handling
export const sendOtp = async (phone: string) => {
  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
  const appVerifier = window.recaptchaVerifier || setupRecaptcha();

  try {
    const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    console.log("📩 OTP sent successfully to", formattedPhone);
    return result;
  } catch (error) {
    console.error("❌ OTP send error:", error);
    throw error;
  }
};

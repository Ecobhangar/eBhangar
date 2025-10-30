// ✅ Firebase setup for eBhangar (Render + Firebase test safe)
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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ✅ Setup reCAPTCHA safely (used for OTP)
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  try {
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
  } catch (error) {
    console.error("⚠️ reCAPTCHA init failed:", error);
    throw error;
  }
};

// ✅ Send OTP (with test number bypass)
export const sendOtp = async (phone: string) => {
  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
  const appVerifier = window.recaptchaVerifier || setupRecaptcha();

  // 🔹 For Firebase test numbers (no actual OTP send)
  const testNumbers = ["+917208360413", "+919226255355"];
  if (testNumbers.includes(formattedPhone)) {
    console.log("🧪 Firebase test number used, no OTP sent");
    return {
      verificationId: "TEST_VERIFICATION_ID",
      confirm: async (otp: string) => {
        if (otp === "123456") {
          console.log("✅ Test OTP verified successfully");
          return { user: { phoneNumber: formattedPhone } };
        } else {
          throw new Error("Invalid test OTP");
        }
      },
    };
  }

  // 🔹 Real OTP flow
  try {
    const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    console.log("📩 OTP sent successfully to", formattedPhone);
    return result;
  } catch (error) {
    console.error("❌ OTP send error:", error);
    throw error;
  }
};

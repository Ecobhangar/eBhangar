// ✅ eBhangar Firebase mock-safe setup for Render
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

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

// ✅ Always create reCAPTCHA safely
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

// ✅ Send OTP with guaranteed mock flow
export const sendOtp = async (phone: string) => {
  let formattedPhone = phone.trim();

  // ensure +91 is prefixed
  if (!formattedPhone.startsWith("+91")) {
    formattedPhone = `+91${formattedPhone}`;
  }

  const testNumbers = ["+917208360413", "+919226255355", "9226255355", "7208360413"];

  // 🔹 Always use mock OTP for test numbers
  if (testNumbers.includes(formattedPhone) || testNumbers.includes(phone)) {
    console.log("🧪 MOCK OTP mode active for:", formattedPhone);
    return {
      verificationId: "MOCK_VERIFICATION_ID",
      confirm: async (otp: string) => {
        if (otp === "123456") {
          console.log("✅ MOCK OTP verified successfully!");
          return { user: { phoneNumber: formattedPhone } };
        }
        throw new Error("Invalid test OTP");
      },
    };
  }

  // 🔹 Real Firebase OTP (for non-test numbers)
  const appVerifier = window.recaptchaVerifier || setupRecaptcha();
  try {
    const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    console.log("📲 Real OTP sent successfully to", formattedPhone);
    return confirmation;
  } catch (error) {
    console.error("❌ Firebase OTP Error:", error);
    throw error;
  }
};

// ✅ Firebase setup for eBhangar — Render-safe mock OTP
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

// ✅ Setup invisible reCAPTCHA (Render-safe)
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

// ✅ Send OTP (mock test flow + Firebase fallback)
export const sendOtp = async (phone: string) => {
  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
  const testNumbers = ["+917208360413", "+919226255355"];

  // 🔹 Mock OTP for test numbers (no Firebase call)
  if (testNumbers.includes(formattedPhone)) {
    console.log("🧪 Mock OTP mode active for", formattedPhone);
    return {
      verificationId: "MOCK_VERIFICATION_ID",
      confirm: async (otp: string) => {
        if (otp === "123456") {
          console.log("✅ Mock OTP verified successfully!");
          return { user: { phoneNumber: formattedPhone } };
        }
        throw new Error("Invalid mock OTP");
      },
    };
  }

  // 🔹 Real OTP flow (Firebase)
  const appVerifier = window.recaptchaVerifier || setupRecaptcha();
  try {
    const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    console.log("📲 OTP sent to", formattedPhone);
    return confirmation;
  } catch (error) {
    console.error("❌ Firebase OTP error:", error);
    throw error;
  }
};

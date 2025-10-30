// ✅ Firebase setup for eBhangar (Render + Firebase test mode safe)
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

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ✅ Setup invisible reCAPTCHA safely (no testing flags)
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  try {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        containerId,
        {
          size: "invisible",
          callback: () => console.log("✅ reCAPTCHA verified"),
          "expired-callback": () => console.warn("⚠️ reCAPTCHA expired, refresh required"),
        },
        auth
      );
    }
    return window.recaptchaVerifier;
  } catch (error) {
    console.error("⚠️ Failed to initialize reCAPTCHA:", error);
    throw error;
  }
};

// ✅ Send OTP (with Firebase test number fallback)
export const sendOtp = async (phone: string) => {
  const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

  // 🔹 Mock OTP behavior for test numbers (no Firebase call)
  const testNumbers = ["+917208360413", "+919226255355"];
  if (testNumbers.includes(formattedPhone)) {
    console.log("🧪 Using mock OTP for test number:", formattedPhone);
    return {
      verificationId: "TEST_VERIFICATION_ID",
      confirm: async (otp: string) => {
        if (otp === "123456") {
          console.log("✅ Mock OTP verified for", formattedPhone);
          return { user: { phoneNumber: formattedPhone } };
        }
        throw new Error("Invalid test OTP");
      },
    };
  }

  try {
    const appVerifier = window.recaptchaVerifier || setupRecaptcha();
    const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    console.log("📲 OTP sent successfully to", formattedPhone);
    return confirmation;
  } catch (error) {
    console.error("❌ Failed to send OTP:", error);
    throw error;
  }
};

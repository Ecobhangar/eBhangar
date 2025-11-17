// client/src/pages/Login.tsx
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Initialize reCAPTCHA only once – correct order for modular SDK
  useEffect(() => {
    const win = window as any;

    if (!win.recaptchaVerifier) {
      win.recaptchaVerifier = new RecaptchaVerifier(
        auth,                 // <-- auth FIRST
        "recaptcha-container", // <-- element id
        {
          size: "invisible",
        }
      );
    }
  }, []);

  const sendOtp = async () => {
    if (!phone) {
      alert("Enter mobile number");
      return;
    }

    try {
      setLoading(true);

      const win = window as any;
      const appVerifier = win.recaptchaVerifier;

      const fullPhone = phone.startsWith("+") ? phone : `+91${phone}`;

      const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);

      setConfirmationResult(result);
      setOtpSent(true);
      alert("OTP Sent ✔");
    } catch (err) {
      console.error("Error sending OTP", err);
      alert("Error sending OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      alert("Enter OTP");
      return;
    }
    if (!confirmationResult) {
      alert("OTP expired, please resend");
      return;
    }

    try {
      setLoading(true);

      await confirmationResult.confirm(otp);

      alert("Login Success ✔");

      // refresh so AuthContext etc. pick up new user
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Invalid OTP", err);
      alert("Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div>
        {!otpSent ? (
          <div className="p-6 shadow-lg bg-white rounded-lg w-80">
            <h2 className="text-xl mb-4 font-semibold text-center">Login</h2>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter Mobile"
              className="border p-2 w-full mb-4 rounded"
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="bg-green-600 text-white w-full py-2 rounded-md disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="p-6 shadow-lg bg-white rounded-lg w-80">
            <h2 className="text-xl mb-4 font-semibold text-center">Enter OTP</h2>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              className="border p-2 w-full mb-4 rounded"
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="bg-green-600 text-white w-full py-2 rounded-md disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {/* reCAPTCHA container */}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}

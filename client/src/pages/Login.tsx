// src/pages/Login.tsx

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

  // Initialize invisible reCAPTCHA
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
        },
        auth
      );
    }
  }, []);

  // Send OTP
  const sendOtp = async () => {
    if (!phone) return alert("Enter mobile number");

    try {
      setLoading(true);
      const fullPhone = phone.startsWith("+") ? phone : `+91${phone}`;

      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);

      setConfirmationResult(result);
      setOtpSent(true);
      alert("OTP Sent ✔");
    } catch (err) {
      console.error(err);
      alert("Error sending OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) return alert("Enter OTP");

    try {
      setLoading(true);

      await confirmationResult.confirm(otp);

      alert("Login Success ✔");

      window.location.href = "/dashboard"; // Redirect
    } catch (err) {
      console.error(err);
      alert("Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div>
        {!otpSent ? (
          <div className="p-6 shadow-lg bg-white rounded-xl w-80">
            <h2 className="text-xl mb-4 text-center font-semibold">Login</h2>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter Mobile"
              className="border p-2 w-full mb-3 rounded-md"
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="bg-green-600 text-white w-full py-2 rounded-md"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="p-6 shadow-lg bg-white rounded-xl w-80">
            <h2 className="text-xl mb-4 text-center font-semibold">Enter OTP</h2>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              className="border p-2 w-full mb-3 rounded-md"
            />

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="bg-green-600 text-white w-full py-2 rounded-md"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}

// client/src/pages/Login.tsx

import { useState, useEffect } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Create invisible reCAPTCHA ONCE
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

    const formattedPhone = phone.startsWith("+")
      ? phone
      : `+91${phone.trim()}`;

    setLoading(true);

    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );

      setConfirmationResult(result);
      setOtpSent(true);

      alert("OTP Sent Successfully ✅");
    } catch (error: any) {
      console.error(error);
      alert("Error sending OTP ❌");
    }

    setLoading(false);
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp) return alert("Enter OTP");

    setLoading(true);

    try {
      const credential = PhoneAuthProvider.credential(
        confirmationResult.verificationId,
        otp
      );

      await signInWithCredential(auth, credential);

      alert("Login Successful 🎉");

      // Redirect
      window.location.href = "/dashboard";
    } catch (error) {
      alert("Invalid OTP ❌");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">

      {!otpSent ? (
        // Phone screen
        <div className="bg-white p-6 shadow-lg rounded-xl w-80">
          <h2 className="text-xl mb-4 text-center">Login</h2>

          <input
            type="tel"
            placeholder="Enter Mobile Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />

          <button
            onClick={sendOtp}
            disabled={loading}
            className="bg-green-600 text-white py-2 w-full rounded"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      ) : (
        // OTP screen
        <div className="bg-white p-6 shadow-lg rounded-xl w-80">
          <h2 className="text-xl mb-4 text-center">Enter OTP</h2>

          <input
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />

          <button
            onClick={verifyOtp}
            disabled={loading}
            className="bg-green-600 text-white py-2 w-full rounded"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      {/* Required for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

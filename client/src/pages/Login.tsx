// client/src/pages/Login.tsx
import { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Init reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  }, []);

  const sendOtp = async () => {
    if (!phone) return alert("Enter phone");

    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      alert("OTP Sent ✅");
    } catch (e) {
      alert("Error sending OTP");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp) return alert("Enter OTP");
    if (!confirmationResult) return alert("OTP expired, resend");

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(
        confirmationResult.verificationId,
        otp
      );
      await signInWithCredential(auth, credential);

      alert("Login Successful ✅");

      setTimeout(() => {
        window.location.href = "/dashboard"; // refresh to sync context
      }, 400);
    } catch (e) {
      alert("Invalid OTP ❌");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      
      {!otpSent ? (
        <div className="bg-white shadow-lg p-8 rounded-xl w-80">
          <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>
          <input
            type="tel"
            placeholder="Enter Mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 rounded-md w-full mb-4"
          />
          <button onClick={sendOtp} disabled={loading}
            className="bg-green-600 text-white w-full py-2 rounded-md">
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-lg p-8 rounded-xl w-80">
          <h2 className="text-xl font-semibold mb-4 text-center">Enter OTP</h2>
          <input
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 rounded-md w-full mb-4"
          />
          <button onClick={verifyOtp} disabled={loading}
            className="bg-green-600 text-white w-full py-2 rounded-md">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
}

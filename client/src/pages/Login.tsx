import { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase"; // ✅ Correct Firebase path
import { useLocation } from "wouter"; // ✅ SPA navigation

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation(); // ✅ redirect

  // ✅ Initialize reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => console.log("✅ reCAPTCHA verified"),
          "expired-callback": () => alert("reCAPTCHA expired. Try again."),
        }
      );
    }
  }, []);

  const handleSendOtp = async () => {
    if (!phone) return alert("⚠️ Enter mobile number");

    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    setLoading(true);

    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);

      setConfirmationResult(result);
      setOtpSent(true);
      alert("✅ OTP sent successfully!");
    } catch (error) {
      console.error(error);
      alert("❌ OTP sending failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return alert("⚠️ Enter OTP");

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(
        confirmationResult.verificationId,
        otp
      );

      await signInWithCredential(auth, credential);

      alert("✅ Login Successful!");
      setLocation("/dashboard"); // ✅ Correct redirect for SPA
    } catch (error) {
      console.error(error);
      alert("❌ Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {!otpSent ? (
        <div className="bg-white p-8 rounded-2xl shadow-md w-80">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Enter Mobile Number
          </h2>
          <input
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 rounded-md w-full mb-4"
          />
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md w-full"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-md w-80">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Enter OTP
          </h2>
          <input
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 rounded-md w-full mb-4"
          />
          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md w-full"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      {/* ✅ reCAPTCHA container must exist */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

// ✅ TS global window declarations
declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

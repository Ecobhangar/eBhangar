import { useState, useEffect } from "react";
import { auth, setupRecaptcha, sendOtp } from "../lib/firebase";
import { signInWithCredential, PhoneAuthProvider } from "firebase/auth";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Initialize reCAPTCHA safely (only once)
  useEffect(() => {
    try {
      setupRecaptcha("recaptcha-container");
      console.log("✅ reCAPTCHA ready");
    } catch (err) {
      console.error("⚠️ reCAPTCHA setup failed:", err);
    }
  }, []);

  // ✅ Send OTP
  const handleSendOtp = async () => {
    if (!phone) return alert("Please enter your mobile number");

    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
    setLoading(true);

    try {
      const result = await sendOtp(formattedPhone);
      setConfirmationResult(result);
      setOtpSent(true);
      alert(`✅ OTP sent successfully to ${formattedPhone}`);
    } catch (error: any) {
      console.error("❌ OTP Send Error:", error);
      alert("Failed to send OTP: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return alert("Please enter OTP");
    if (!confirmationResult) return alert("OTP session expired. Please resend.");

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(
        confirmationResult.verificationId,
        otp
      );
      await signInWithCredential(auth, credential);

      alert("✅ Login Successful!");
      window.location.href = "/"; // redirect to homepage after login
    } catch (error: any) {
      console.error("❌ OTP Verify Error:", error);
      alert("Invalid OTP: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {/* 🔹 Mobile Input Section */}
      {!otpSent ? (
        <div className="bg-white p-8 rounded-2xl shadow-md w-80">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Enter Mobile Number
          </h2>
          <input
            type="tel"
            placeholder="+919226255355"
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
        // 🔹 OTP Verification Section
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

          {/* 🔁 Option to resend OTP */}
          <button
            onClick={() => {
              setOtpSent(false);
              setOtp("");
              setConfirmationResult(null);
            }}
            className="mt-3 text-sm text-blue-600 underline"
          >
            Resend OTP
          </button>
        </div>
      )}

      {/* 🔹 Required invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

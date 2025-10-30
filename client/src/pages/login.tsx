import { useState, useEffect } from "react";
import { auth, setupRecaptcha, sendOtp } from "../firebase";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Initialize reCAPTCHA on mount
  useEffect(() => {
    setupRecaptcha();
  }, []);

  // ✅ Handle Send OTP
  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const result = await sendOtp(phone);
      setConfirmationResult(result);
      setOtpSent(true);
      alert("OTP Sent ✅");
    } catch (error: any) {
      console.error("Send OTP Error:", error);
      alert(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Verify OTP
  const handleVerifyOtp = async () => {
    try {
      if (!confirmationResult) {
        alert("Please send OTP first!");
        return;
      }
      await confirmationResult.confirm(otp);
      alert("Login Successful 🎉");
      window.location.href = "/";
    } catch (error: any) {
      console.error("Verify OTP Error:", error);
      alert("Invalid OTP ❌");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-4">Login to eBhangar</h2>

        {!otpSent ? (
          <>
            <label className="block mb-2 font-medium text-gray-700">Mobile Number</label>
            <input
              type="tel"
              placeholder="+919226255355"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-md mb-4"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md w-full"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <label className="block mb-2 font-medium text-gray-700">Enter OTP</label>
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-md mb-4"
            />
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md w-full"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
      </div>

      {/* ✅ Must be rendered */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

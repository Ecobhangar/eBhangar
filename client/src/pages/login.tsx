import { useState, useEffect } from "react";
import { auth, setupRecaptcha, sendOtp } from "../firebase";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // ✅ Initialize reCAPTCHA only once
  useEffect(() => {
    setupRecaptcha("recaptcha-container");
  }, []);

  // ✅ Send OTP
  const handleSendOtp = async () => {
    if (!phone) return alert("Please enter phone number");

    try {
      const result = await sendOtp(phone);
      setConfirmationResult(result);
      setOtpSent(true);
      alert("OTP Sent ✅");
    } catch (error: any) {
      console.error("OTP Send Error:", error);
      alert("Error sending OTP: " + error.message);
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    if (!confirmationResult) return alert("No OTP request found");
    try {
      await confirmationResult.confirm(otp);
      alert("Login Successful ✅");
      window.location.href = "/dashboard"; // redirect after login
    } catch (error) {
      alert("Invalid OTP ❌");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {!otpSent ? (
        <div className="bg-white p-6 rounded-xl shadow-md w-80">
          <h2 className="text-lg font-bold mb-3">Enter Mobile Number</h2>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter number e.g. 9226255355"
            className="border p-2 rounded-md w-full mb-3"
          />
          <button
            onClick={handleSendOtp}
            className="bg-green-600 text-white py-2 px-4 rounded-md w-full"
          >
            Send OTP
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md w-80">
          <h2 className="text-lg font-bold mb-3">Enter OTP</h2>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="border p-2 rounded-md w-full mb-3"
          />
          <button
            onClick={handleVerifyOtp}
            className="bg-green-600 text-white py-2 px-4 rounded-md w-full"
          >
            Verify OTP
          </button>
        </div>
      )}

      {/* ✅ Required for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

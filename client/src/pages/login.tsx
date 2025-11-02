import { useState, useEffect } from "react";
import { setupRecaptcha, sendOtp } from "../lib/firebase";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [mockOtp, setMockOtp] = useState("123456"); // fixed OTP for testing

  // ✅ Initialize invisible reCAPTCHA
  useEffect(() => {
    setupRecaptcha("recaptcha-container");
  }, []);

  // ✅ Send OTP (Mock for Render testing)
  const handleSendOtp = async () => {
    if (!phone) {
      alert("Please enter your mobile number");
      return;
    }

    setLoading(true);
    try {
      // 🔹 Mock OTP sending – always success
      await sendOtp(phone);
      setOtpSent(true);
      alert(`✅ OTP sent successfully to ${phone}\n(Use: ${mockOtp})`);
    } catch (error: any) {
      console.error("❌ OTP Send Error:", error);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    setLoading(true);
    try {
      // 🔹 Mock validation
      if (otp === mockOtp) {
        alert("✅ Login Successful!");
        window.location.href = "/"; // redirect to homepage after login
      } else {
        throw new Error("Invalid OTP");
      }
    } catch (error: any) {
      console.error("❌ OTP Verify Error:", error);
      alert("❌ Invalid OTP. Please try again.");
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
        <div className="bg-white p-8 rounded-2xl shadow-md w-80">
          <h2 className="text-xl font-semibold mb-4 text-center">Enter OTP</h2>
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
          <button
            onClick={() => setOtpSent(false)}
            className="text-sm text-blue-600 mt-3"
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

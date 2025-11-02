import { useState, useEffect } from "react";
import { setupRecaptcha, sendOtp } from "../lib/firebase";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setupRecaptcha("recaptcha-container");
  }, []);

  const handleSendOtp = async () => {
    if (!phone) return alert("Please enter your mobile number");
    setLoading(true);
    try {
      const result = await sendOtp(phone);
      setConfirmationResult(result);
      setOtpSent(true);
      alert("✅ OTP sent successfully!");
    } catch (error: any) {
      console.error("Send OTP error:", error);
      alert("❌ Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return alert("Please enter OTP");
    if (!confirmationResult) return alert("No OTP session found");

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(
        confirmationResult.verificationId,
        otp
      );
      await signInWithCredential(auth, credential);
      alert("✅ Login Successful!");
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      alert("❌ Invalid OTP or verification expired.");
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
            placeholder="+919876543210"
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
        </div>
      )}
      <div id="recaptcha-container"></div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebase";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  // ✅ Initialize reCAPTCHA once
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA verified ✅");
          },
        },
        auth
      );
    }
  }, []);

  // ✅ Send OTP
  const sendOtp = async () => {
    try {
      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      alert("OTP Sent ✅");
    } catch (error) {
      console.error("OTP Send Error:", error);
      alert(error.message);
    }
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    try {
      await confirmationResult.confirm(otp);
      alert("Login Successful ✅");
    } catch (error) {
      alert("Invalid OTP ❌");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {!otpSent ? (
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Enter Mobile Number</h2>
          <input
            type="tel"
            placeholder="+919226255355"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border p-2 rounded-md w-full mb-4"
          />
          <button
            onClick={sendOtp}
            className="bg-green-600 text-white py-2 px-4 rounded-md w-full"
          >
            Send OTP
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Enter OTP</h2>
          <input
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2 rounded-md w-full mb-4"
          />
          <button
            onClick={verifyOtp}
            className="bg-green-600 text-white py-2 px-4 rounded-md w-full"
          >
            Verify OTP
          </button>
        </div>
      )}

      {/* ✅ This div is critical */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

// client/src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "@/lib/firebase";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  }, []);

  const sendOtp = async () => {
    if (!phone) return alert("Enter mobile number");

    try {
      const appVerifier = (window as any).recaptchaVerifier;
      const fullPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);

      setConfirmationResult(result);
      setOtpSent(true);
      alert("OTP Sent ✔");
    } catch (err) {
      console.error(err);
      alert("Error sending OTP ❌");
    }
  };

  const verifyOtp = async () => {
    if (!otp || !confirmationResult) return;

    try {
      await confirmationResult.confirm(otp);

      alert("Login Success ✔");
      // ⬇️ yahan sirf /dashboard pe bhejo, /index.html kabhi nahi
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      alert("Invalid OTP ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        {!otpSent ? (
          <div className="p-4 shadow-lg bg-white rounded-lg">
            <h2 className="text-xl mb-3">Login</h2>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter Mobile"
              className="border p-2 w-full mb-3"
            />
            <button
              onClick={sendOtp}
              className="bg-green-600 text-white w-full py-2 rounded-md"
            >
              Send OTP
            </button>
          </div>
        ) : (
          <div className="p-4 shadow-lg bg-white rounded-lg">
            <h2 className="text-xl mb-3">Enter OTP</h2>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit OTP"
              className="border p-2 w-full mb-3"
            />
            <button
              onClick={verifyOtp}
              className="bg-green-600 text-white w-full py-2 rounded-md"
            >
              Verify OTP
            </button>
          </div>
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}

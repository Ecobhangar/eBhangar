import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/OTPInput";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

export default function Login() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { setupRecaptcha, sendOTP, verifyOTP, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const verifier = setupRecaptcha("recaptcha-container");
    setRecaptchaVerifier(verifier);
  }, [setupRecaptcha]);

  const handleSendOTP = async () => {
    if (!phone || !recaptchaVerifier) return;

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const result = await sendOTP(formattedPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setStep("otp");

      toast({
        title: "OTP Sent ✅",
        description: "Please check your phone for the verification code."
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const code = otpCode || otp;
    if (!confirmationResult || code.length !== 6) return;

    setLoading(true);
    try {
      await verifyOTP(confirmationResult, code);

      // ✅ Get Firebase Token
      const idToken = await user?.getIdToken();

      // ✅ Fetch user details (role) from backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      const data = await res.json();

      // ✅ Save session
      localStorage.setItem("token", idToken || "");
      localStorage.setItem("role", data.role);
      localStorage.setItem("phone", data.phone);

      toast({
        title: "✅ Login Successful",
        description: "Welcome to eBhangar!",
      });

      setLocation("/dashboard");

    } catch (error: any) {
      toast({
        title: "Invalid OTP ❌",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPComplete = (value: string) => handleVerifyOTP(value);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <Logo size="large" />
          <p className="text-sm text-muted-foreground mt-2">Smart Scrap Collection</p>
        </div>

        {step === "phone" ? (
          <div className="space-y-6">
            <div>
              <Label className="text-base">Mobile Number</Label>
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleSendOTP}
              disabled={!phone || loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label className="text-base">Enter OTP</Label>
              <p className="text-sm text-muted-foreground mb-4">
                OTP sent to {phone}
              </p>

              <OTPInput 
                onChange={setOtp} 
                onComplete={handleOTPComplete}
              />
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleVerifyOTP()}
              disabled={otp.length !== 6 || loading}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </Button>

            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => { setStep("phone"); setOtp(""); }}
              disabled={loading}
            >
              Change Number
            </Button>
          </div>
        )}
      </Card>

      <div id="recaptcha-container"></div>
    </div>
  );
}

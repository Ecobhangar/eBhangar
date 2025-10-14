import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/OTPInput";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import logoImage from "@assets/Logo1_1760458264413.png";

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
    if (user) {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  useEffect(() => {
    const verifier = setupRecaptcha('recaptcha-container');
    setRecaptchaVerifier(verifier);
  }, [setupRecaptcha]);

  const handleSendOTP = async () => {
    if (!phone || !recaptchaVerifier) return;
    
    setLoading(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const result = await sendOTP(formattedPhone, recaptchaVerifier);
      setConfirmationResult(result);
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!confirmationResult || otp.length !== 6) return;
    
    setLoading(true);
    try {
      await verifyOTP(confirmationResult, otp);
      toast({
        title: "Success",
        description: "Login successful!",
      });
      setLocation('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <img src={logoImage} alt="eBhangar" className="h-12 w-auto mb-2" data-testid="img-logo" />
          <p className="text-sm text-muted-foreground">Smart Scrap Collection</p>
        </div>

        {step === "phone" ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="phone" className="text-base">Mobile Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2"
                data-testid="input-phone"
              />
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleSendOTP}
              disabled={!phone || loading}
              data-testid="button-send-otp"
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label className="text-base">Enter OTP</Label>
              <p className="text-sm text-muted-foreground mb-4">
                We sent a code to {phone}
              </p>
              <OTPInput onChange={setOtp} />
            </div>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || loading}
              data-testid="button-verify-otp"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </Button>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => {
                setStep("phone");
                setOtp("");
              }}
              disabled={loading}
              data-testid="button-change-number"
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

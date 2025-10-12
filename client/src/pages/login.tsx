import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/OTPInput";
import { Leaf } from "lucide-react";

export default function Login() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOTP = () => {
    console.log("Sending OTP to:", phone);
    setStep("otp");
  };

  const handleVerifyOTP = () => {
    console.log("Verifying OTP:", otp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold font-[Poppins]">eBhangar</h1>
          </div>
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
              disabled={!phone}
              data-testid="button-send-otp"
            >
              Send OTP
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
              disabled={otp.length !== 6}
              data-testid="button-verify-otp"
            >
              Verify & Continue
            </Button>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setStep("phone")}
              data-testid="button-change-number"
            >
              Change Number
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

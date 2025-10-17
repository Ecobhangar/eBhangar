import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface OTPInputProps {
  length?: number;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
}

export function OTPInput({ length = 6, onChange, onComplete }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Web OTP API - Auto-detect OTP from SMS (Android Chrome)
  useEffect(() => {
    if ('OTPCredential' in window) {
      const ac = new AbortController();

      navigator.credentials
        .get({
          // @ts-ignore - OTPCredential is not in TypeScript types yet
          otp: { transport: ['sms'] },
          signal: ac.signal,
        })
        .then((otp: any) => {
          if (otp && otp.code) {
            const code = otp.code;
            const newOtp = code.split('').slice(0, length);
            setOtp(newOtp);
            onChange(code);
            
            // Auto-complete callback
            if (onComplete && code.length === length) {
              onComplete(code);
            }
          }
        })
        .catch((err: any) => {
          console.log('Web OTP API error:', err);
        });

      return () => {
        ac.abort();
      };
    }
  }, [length, onChange, onComplete]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    
    const otpString = newOtp.join("");
    onChange(otpString);

    // Auto-focus next input
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-complete when all digits entered
    if (onComplete && otpString.length === length && !otpString.includes("")) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const pastedOtp = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (pastedOtp) {
      const newOtp = pastedOtp.split('');
      setOtp([...newOtp, ...new Array(length - newOtp.length).fill("")]);
      onChange(pastedOtp);

      // Focus last filled input
      const lastIndex = Math.min(newOtp.length - 1, length - 1);
      inputRefs.current[lastIndex]?.focus();

      // Auto-complete if full OTP pasted
      if (onComplete && pastedOtp.length === length) {
        onComplete(pastedOtp);
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-2xl font-mono"
          data-testid={`input-otp-${index}`}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

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
      toast({ title: "OTP Sent", descripti

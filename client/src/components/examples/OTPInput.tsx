import { OTPInput } from '../OTPInput';
import { useState } from 'react';

export default function OTPInputExample() {
  const [otp, setOtp] = useState('');
  
  return (
    <div className="p-4">
      <OTPInput onChange={(value) => setOtp(value)} />
      <p className="text-center mt-4 text-sm text-muted-foreground">OTP: {otp}</p>
    </div>
  );
}

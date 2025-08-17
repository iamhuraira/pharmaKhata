import type { Metadata } from 'next';
import React from 'react';

import OTPVerificationForm from '@/components/ui/auth/OTPVerificationForm';

export const metadata: Metadata = {
  title: 'OTP Verification',
  description: 'OTP Verification',
};

const OTPVerification = () => {
  return (
    <>
      <OTPVerificationForm />
    </>
  );
};

export default OTPVerification;

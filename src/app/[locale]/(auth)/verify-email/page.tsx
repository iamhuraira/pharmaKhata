import type { Metadata } from 'next';
import React from 'react';

import EmailVerificationFrom from '@/components/ui/auth/EmailVerificationFrom';

export const metadata: Metadata = {
  title: 'Email Verification',
  description: 'Email Verification',
};

const EmailVerification = () => {
  return (
    <>
      <EmailVerificationFrom />
    </>
  );
};

export default EmailVerification;
